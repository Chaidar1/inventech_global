from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional, List
from dependencies.auth import verify_token
from config.database import db
from utils.file_utils import save_upload_file, delete_file, generate_stok_units
from utils.validators import validate_kondisi_barang, normalize_kondisi
import logging
import os

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/barang", tags=["Barang"])

@router.get("/")
def get_all_barang():
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT i.*, c.nama as kategori, 
               COUNT(iu.id) as total_stok,
               SUM(CASE WHEN iu.status = 'Tersedia' THEN 1 ELSE 0 END) as stok_tersedia
        FROM items i 
        LEFT JOIN categories c ON i.kategori_id = c.id 
        LEFT JOIN item_units iu ON i.id = iu.barang_id 
        GROUP BY i.id
        ORDER BY i.id DESC
    """)
    items = cursor.fetchall()
    
    # Ambil unit untuk setiap barang
    for item in items:
        cursor.execute("SELECT * FROM item_units WHERE barang_id = %s", (item['id'],))
        item['stok'] = cursor.fetchall()
    
    cursor.close()
    connection.close()
    return items

@router.get("/{id}")
def get_barang(id: int):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT i.*, c.nama as kategori 
        FROM items i 
        LEFT JOIN categories c ON i.kategori_id = c.id 
        WHERE i.id = %s
    """, (id,))
    item = cursor.fetchone()
    
    if not item:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")
    
    cursor.execute("SELECT * FROM item_units WHERE barang_id = %s", (id,))
    item['stok'] = cursor.fetchall()
    
    cursor.close()
    connection.close()
    return item

@router.post("/")
async def create_barang(
    nama_barang: str = Form(...),
    kategori: str = Form(...),
    stok: int = Form(...),
    kondisi_barang: str = Form(...),
    deskripsi: str = Form(""),
    tahun_perolehan: int = Form(2025),
    foto: UploadFile = File(None),
    token: str = Depends(verify_token)
):
    if not validate_kondisi_barang(kondisi_barang):
        from models.enums import KondisiBarang
        kondisi_valid = [k.value for k in KondisiBarang]
        raise HTTPException(
            status_code=400, 
            detail=f"Kondisi barang tidak valid. Pilihan: {', '.join(kondisi_valid)}"
        )
    
    connection = db.get_connection()
    cursor = connection.cursor()
    
    try:
        # Cari atau buat kategori
        cursor.execute("SELECT id FROM categories WHERE nama = %s", (kategori,))
        kategori_result = cursor.fetchone()
        
        if kategori_result:
            kategori_id = kategori_result[0]
        else:
            cursor.execute("INSERT INTO categories (nama) VALUES (%s)", (kategori,))
            kategori_id = cursor.lastrowid
        
        # Upload foto
        foto_filename = None
        if foto:
            foto_filename = await save_upload_file(foto, "barang")
        
        # Insert barang
        cursor.execute(
            "INSERT INTO items (nama_barang, kategori_id, tahun_perolehan, deskripsi, foto) VALUES (%s, %s, %s, %s, %s)",
            (nama_barang, kategori_id, tahun_perolehan, deskripsi, foto_filename)
        )
        barang_id = cursor.lastrowid
        
        # Generate dan insert unit stok
        units = generate_stok_units(1, stok, nama_barang, kondisi_barang)
        for unit in units:
            cursor.execute(
                "INSERT INTO item_units (barang_id, kode, kondisi, status) VALUES (%s, %s, %s, %s)",
                (barang_id, unit['kode'], unit['kondisi'], unit['status'])
            )
        
        connection.commit()
        
        return {"message": "Barang berhasil ditambahkan", "barang_id": barang_id}
        
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.put("/{barang_id}")
async def update_barang(
    barang_id: int,
    nama_barang: str = Form(...),
    kategori: str = Form(...),
    deskripsi: str = Form(""),
    tahun_perolehan: int = Form(2025),
    stok_tambah: int = Form(0),
    kondisi_barang: str = Form("Baik"),
    foto: UploadFile = File(None),
    hapus_foto: bool = Form(False),
    token: str = Depends(verify_token)
):
    # Validasi kondisi barang
    kondisi_barang = normalize_kondisi(kondisi_barang)
    
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Cek barang exists
        cursor.execute("SELECT * FROM items WHERE id = %s", (barang_id,))
        barang = cursor.fetchone()
        if not barang:
            raise HTTPException(status_code=404, detail="Barang tidak ditemukan")
        
        # Cari atau buat kategori
        cursor.execute("SELECT id FROM categories WHERE nama = %s", (kategori,))
        kategori_result = cursor.fetchone()
        if kategori_result:
            kategori_id = kategori_result['id']
        else:
            cursor.execute("INSERT INTO categories (nama) VALUES (%s)", (kategori,))
            kategori_id = cursor.lastrowid
        
        # Handle foto
        foto_filename = barang['foto']
        if hapus_foto and foto_filename:
            delete_file(foto_filename)
            foto_filename = None
        
        if foto:
            # Hapus foto lama jika ada
            if foto_filename:
                delete_file(foto_filename)
            
            foto_filename = await save_upload_file(foto, "barang")
        
        # Update barang
        cursor.execute(
            "UPDATE items SET nama_barang = %s, kategori_id = %s, deskripsi = %s, tahun_perolehan = %s, foto = %s WHERE id = %s",
            (nama_barang, kategori_id, deskripsi, tahun_perolehan, foto_filename, barang_id)
        )
        
        # Tambah stok baru jika diperlukan
        if stok_tambah > 0:
            # Cari nomor terakhir
            cursor.execute("SELECT kode FROM item_units WHERE barang_id = %s ORDER BY id DESC LIMIT 1", (barang_id,))
            last_unit = cursor.fetchone()
            start_num = 1
            if last_unit:
                try:
                    start_num = int(last_unit['kode'].split('-')[-1]) + 1
                except:
                    # Jika gagal parse, hitung jumlah unit yang ada
                    cursor.execute("SELECT COUNT(*) as count FROM item_units WHERE barang_id = %s", (barang_id,))
                    start_num = cursor.fetchone()['count'] + 1
            
            units = generate_stok_units(start_num, stok_tambah, nama_barang, kondisi_barang)
            for unit in units:
                cursor.execute(
                    "INSERT INTO item_units (barang_id, kode, kondisi, status) VALUES (%s, %s, %s, %s)",
                    (barang_id, unit['kode'], unit['kondisi'], unit['status'])
                )
        
        connection.commit()
        
        # Get updated barang data
        cursor.execute("""
            SELECT i.*, c.nama as kategori 
            FROM items i 
            LEFT JOIN categories c ON i.kategori_id = c.id 
            WHERE i.id = %s
        """, (barang_id,))
        updated_barang = cursor.fetchone()
        
        cursor.execute("SELECT * FROM item_units WHERE barang_id = %s", (barang_id,))
        updated_barang['stok'] = cursor.fetchall()
        
        return {
            "message": "Barang berhasil diperbarui",
            "barang": updated_barang
        }
        
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error updating barang: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error memperbarui barang: {str(e)}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@router.get("/debug/barang/{barang_id}/form")
def debug_barang_form(barang_id: int):
    """Debug endpoint untuk melihat data barang"""
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT i.*, c.nama as kategori_nama 
        FROM items i 
        LEFT JOIN categories c ON i.kategori_id = c.id 
        WHERE i.id = %s
    """, (barang_id,))
    item = cursor.fetchone()
    
    cursor.execute("SELECT * FROM item_units WHERE barang_id = %s", (barang_id,))
    units = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    return {
        "barang": item,
        "units": units,
        "total_units": len(units),
        "available_units": len([u for u in units if u['status'] == 'Tersedia'])
    }

@router.delete("/{id}")
def delete_barang(id: int, token: str = Depends(verify_token)):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Cek apakah barang exists dan ambil info foto
        cursor.execute("SELECT foto FROM items WHERE id = %s", (id,))
        barang = cursor.fetchone()
        if not barang:
            raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

        # Hapus foto jika ada
        if barang['foto']:
            delete_file(barang['foto'])

        # Hapus data yang terkait secara manual
        cursor.execute("""
            DELETE r FROM returns r 
            JOIN borrowings b ON r.borrowing_id = b.id 
            WHERE b.barang_id = %s
        """, (id,))

        cursor.execute("""
            DELETE bsl FROM borrowing_status_log bsl 
            JOIN borrowings b ON bsl.borrowing_id = b.id 
            WHERE b.barang_id = %s
        """, (id,))

        cursor.execute("DELETE FROM borrowings WHERE barang_id = %s", (id,))
        cursor.execute("DELETE FROM item_units WHERE barang_id = %s", (id,))
        cursor.execute("DELETE FROM items WHERE id = %s", (id,))
        
        connection.commit()
        
        return {"message": "Barang berhasil dihapus"}
        
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error deleting barang: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error menghapus barang: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.post("/{id}/upload-foto")
async def upload_foto(id: int, file: UploadFile = File(...), token: str = Depends(verify_token)):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Cek apakah barang exists
        cursor.execute("SELECT * FROM items WHERE id = %s", (id,))
        barang = cursor.fetchone()
        if not barang:
            raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

        # Upload foto
        foto_filename = await save_upload_file(file, f"barang_{id}")

        # Update database
        cursor.execute("UPDATE items SET foto = %s WHERE id = %s", (foto_filename, id))
        connection.commit()

        return {"message": "Foto berhasil diupload", "filename": foto_filename}
        
    except HTTPException:
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        cursor.close()
        connection.close()
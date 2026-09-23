from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from typing import List
from dependencies.auth import verify_token, verify_user, verify_admin
from config.database import db
from models.base_models import PeminjamanResponse
from utils.file_utils import save_upload_file
import logging
from uuid import uuid4
from datetime import date, datetime
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/peminjaman", tags=["Peminjaman"])

@router.post("/pinjam", response_model=PeminjamanResponse)
async def pinjam_barang(request: Request, token: dict = Depends(verify_user)):
    # Parse request body
    ct = (request.headers.get("content-type") or "").lower()
    if "application/json" in ct:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="JSON invalid")
    else:
        form = await request.form()
        body = dict(form)

    # Normalize fields
    unit_code = body.get("unit_kode") or body.get("unit")
    barang_id_raw = body.get("barang_id") or body.get("barangId") or body.get("id")

    # Validation
    if not unit_code:
        raise HTTPException(status_code=400, detail="Field 'unit_kode' (atau 'unit') required")
    if barang_id_raw is None:
        raise HTTPException(status_code=400, detail="Field 'barang_id' required")

    try:
        barang_id = int(barang_id_raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Field 'barang_id' harus berupa angka")

    tanggal_pinjam_raw = body.get("tanggal_pinjam")
    tanggal_kembali_raw = body.get("tanggal_kembali")
    if not tanggal_pinjam_raw or not tanggal_kembali_raw:
        raise HTTPException(status_code=400, detail="Tanggal pinjam & tanggal kembali wajib diisi")

    try:
        tanggal_pinjam = date.fromisoformat(tanggal_pinjam_raw)
        tanggal_kembali = date.fromisoformat(tanggal_kembali_raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Format tanggal harus YYYY-MM-DD")

    if tanggal_kembali <= tanggal_pinjam:
        raise HTTPException(status_code=400, detail="Tanggal kembali harus setelah tanggal pinjam")

    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Dapatkan data user lengkap (nama_lengkap)
        cursor.execute("SELECT id, nama_lengkap FROM users WHERE username = %s", (token["username"],))
        user_result = cursor.fetchone()
        
        if not user_result:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        user_id = user_result['id']
        nama_lengkap = user_result['nama_lengkap']

        # Cek ketersediaan unit
        cursor.execute("""
            SELECT iu.*, i.nama_barang, c.nama as kategori 
            FROM item_units iu 
            JOIN items i ON iu.barang_id = i.id 
            JOIN categories c ON i.kategori_id = c.id 
            WHERE iu.kode = %s AND iu.barang_id = %s
        """, (unit_code, barang_id))
        
        unit = cursor.fetchone()
        if not unit:
            raise HTTPException(status_code=404, detail="Unit stok tidak ditemukan")

        if unit['status'] != 'Tersedia':
            raise HTTPException(status_code=400, detail="Unit stok tidak tersedia untuk dipinjam")

        if unit['kondisi'] == 'Rusak Berat':
            raise HTTPException(status_code=400, detail="Unit dengan kondisi 'Rusak Berat' tidak bisa dipinjam")

        # Update status unit
        cursor.execute("UPDATE item_units SET status = 'Menunggu' WHERE kode = %s", (unit_code,))

        # Buat peminjaman
        borrowing_id = str(uuid4())
        keperluan = body.get("keperluan") or ""
        
        cursor.execute("""
            INSERT INTO borrowings (id, user_id, nama_peminjam, barang_id, unit_kode, tanggal_pinjam, tanggal_kembali, keperluan, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (borrowing_id, user_id, nama_lengkap, barang_id, unit_code, tanggal_pinjam, tanggal_kembali, keperluan, "Menunggu"))

        connection.commit()

        # Prepare response
        response_data = {
            "id": borrowing_id,
            "nama": nama_lengkap,  # Gunakan nama_lengkap
            "nama_barang": unit['nama_barang'],
            "kategori_barang": unit['kategori'],
            "barang_id": barang_id,
            "tanggal_pinjam": tanggal_pinjam_raw,
            "tanggal_kembali": tanggal_kembali_raw,
            "unit": unit_code,
            "jumlah": 1,
            "keperluan": keperluan,
            "status": "Menunggu",
            "assigned_units": [unit_code],
            "tanggal_verifikasi": None
        }

        return response_data
        
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.get("/user")
async def get_peminjaman_user(token: dict = Depends(verify_user)):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT b.*, i.nama_barang, c.nama as kategori_barang 
        FROM borrowings b 
        JOIN items i ON b.barang_id = i.id 
        JOIN categories c ON i.kategori_id = c.id 
        WHERE b.nama_peminjam = %s AND b.status IN ('Disetujui', 'Dipinjam')
        ORDER BY b.created_at DESC
    """, (token.get("username"),))
    
    peminjaman = cursor.fetchall()
    
    cursor.close()
    connection.close()
    return peminjaman

@router.get("/user/aktif")
def get_user_peminjaman_aktif(token: dict = Depends(verify_user)):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT b.id, b.barang_id, b.unit_kode as unit, i.nama_barang,
                   i.foto as foto_barang,
                   b.tanggal_pinjam, b.tanggal_kembali, b.status
            FROM borrowings b 
            JOIN items i ON b.barang_id = i.id 
            WHERE b.nama_peminjam = %s AND b.status = 'Dipinjam' AND b.deleted_at IS NULL
            ORDER BY b.tanggal_pinjam DESC
        """, (token.get("username"),))
        
        user_peminjaman = cursor.fetchall()
        
        # Normalisasi path foto
        for item in user_peminjaman:
            if item['foto_barang']:
                foto_path = item['foto_barang']
                if foto_path.startswith('uploads\\') or foto_path.startswith('uploads/'):
                    item['foto_barang'] = foto_path.replace('uploads\\', '').replace('uploads/', '')
        
        return user_peminjaman
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.put("/{peminjaman_id}/kembalikan")
async def kembalikan_barang(
    peminjaman_id: str,
    tanggal_kembali: str = Form(...),
    kondisi: str = Form(...),
    catatan: str = Form(""),
    foto: UploadFile = File(None),
    token: dict = Depends(verify_user)
):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Cek peminjaman
        cursor.execute("SELECT * FROM borrowings WHERE id = %s", (peminjaman_id,))
        peminjaman = cursor.fetchone()
        
        if not peminjaman:
            raise HTTPException(status_code=404, detail="Peminjaman tidak ditemukan")

        if peminjaman['status'] not in ["Disetujui", "Dipinjam"]:
            raise HTTPException(status_code=400, detail="Hanya peminjaman yang Disetujui/Dipinjam bisa dikembalikan")

        # Simpan foto
        foto_filename = None
        if foto and foto.filename:
            foto_filename = await save_upload_file(foto, f"pengembalian_{peminjaman_id}")

        # Insert atau update data pengembalian
        cursor.execute("""
            INSERT INTO returns (borrowing_id, tanggal_pengembalian, kondisi_barang, catatan, foto)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            tanggal_pengembalian = VALUES(tanggal_pengembalian),
            kondisi_barang = VALUES(kondisi_barang),
            catatan = VALUES(catatan),
            foto = VALUES(foto)
        """, (peminjaman_id, tanggal_kembali, kondisi, catatan, foto_filename))

        # Update status peminjaman
        cursor.execute(
            "UPDATE borrowings SET status = 'Menunggu Verifikasi Pengembalian' WHERE id = %s",
            (peminjaman_id,)
        )

        connection.commit()

        # Ambil data terbaru untuk response
        cursor.execute("""
            SELECT r.*, b.nama_peminjam, i.nama_barang
            FROM returns r
            JOIN borrowings b ON r.borrowing_id = b.id
            JOIN items i ON b.barang_id = i.id
            WHERE r.borrowing_id = %s
        """, (peminjaman_id,))
        
        pengembalian_data = cursor.fetchone()

        return {
            "message": "Pengembalian berhasil dicatat, menunggu verifikasi admin",
            "pengembalian": pengembalian_data
        }
        
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error dalam pengembalian barang: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error mencatat pengembalian: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.get("/{peminjaman_id}")
async def get_peminjaman_detail(peminjaman_id: str, token: dict = Depends(verify_token)):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT b.*, i.nama_barang, c.nama as kategori_barang,
                   r.tanggal_pengembalian, r.kondisi_barang, r.catatan, r.foto
            FROM borrowings b 
            JOIN items i ON b.barang_id = i.id 
            JOIN categories c ON i.kategori_id = c.id 
            LEFT JOIN returns r ON b.id = r.borrowing_id
            WHERE b.id = %s
        """, (peminjaman_id,))
        
        peminjaman = cursor.fetchone()
        if not peminjaman:
            raise HTTPException(status_code=404, detail="Peminjaman tidak ditemukan")

        return peminjaman
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.delete("/{id}")
def delete_peminjaman(id: str, token: dict = Depends(verify_admin)):
    connection = db.get_connection()
    cursor = connection.cursor()
    
    try:
        # Cek apakah peminjaman exists
        cursor.execute("SELECT * FROM borrowings WHERE id = %s", (id,))
        peminjaman = cursor.fetchone()
        if not peminjaman:
            raise HTTPException(status_code=404, detail="Data peminjaman tidak ditemukan")

        # Soft delete - set deleted_at timestamp
        from datetime import datetime
        cursor.execute(
            "UPDATE borrowings SET deleted_at = %s WHERE id = %s",
            (datetime.now(), id)
        )
        
        connection.commit()

        return {"message": f"Data peminjaman {id} berhasil diarsipkan"}
        
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error soft deleting peminjaman: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error mengarsipkan data peminjaman: {str(e)}")
    finally:
        cursor.close()
        connection.close()
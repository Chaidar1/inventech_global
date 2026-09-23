from fastapi import APIRouter, Depends, HTTPException
from dependencies.auth import verify_user
from config.database import db
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/riwayat", tags=["Riwayat"])

@router.get("/")
def get_riwayat_user(token: dict = Depends(verify_user)):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Dapatkan user_id dari token
        user_id = token.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID tidak ditemukan")
        
        cursor.execute("""
            SELECT 
                b.*, 
                b.alasan_penolakan,  -- TAMBAH: alasan penolakan
                i.nama_barang, 
                i.foto as foto_barang,
                c.nama as kategori_barang,
                r.tanggal_pengembalian, 
                r.kondisi_barang, 
                r.catatan, 
                r.foto as foto_pengembalian,
                r.created_at as tanggal_pengembalian_dibuat,
                CASE WHEN r.id IS NOT NULL THEN TRUE ELSE FALSE END as dikembalikan
            FROM borrowings b 
            JOIN items i ON b.barang_id = i.id 
            JOIN categories c ON i.kategori_id = c.id 
            LEFT JOIN returns r ON b.id = r.borrowing_id
            WHERE b.user_id = %s AND b.deleted_at IS NULL  -- HANYA tampilkan yang belum dihapus admin
            ORDER BY b.created_at DESC
        """, (user_id,))
        
        riwayat = cursor.fetchall()
        
        # Format data seperti di endpoint verifikasi
        formatted_data = []
        for item in riwayat:
            formatted_item = dict(item)
            
            # Normalisasi path foto barang
            if item['foto_barang']:
                foto_barang_path = item['foto_barang']
                if foto_barang_path.startswith('uploads\\') or foto_barang_path.startswith('uploads/'):
                    foto_barang_path = foto_barang_path.replace('uploads\\', '').replace('uploads/', '')
                formatted_item['foto_barang'] = foto_barang_path
            
            # Jika ada data pengembalian, format menjadi objek
            if item['dikembalikan'] and item['foto_pengembalian']:
                # Normalisasi path foto pengembalian
                foto_path = item['foto_pengembalian']
                if foto_path.startswith('uploads\\') or foto_path.startswith('uploads/'):
                    foto_path = foto_path.replace('uploads\\', '').replace('uploads/', '')
                
                formatted_item['pengembalian'] = {
                    'tanggal_pengembalian': item['tanggal_pengembalian'],
                    'kondisi_barang': item['kondisi_barang'],
                    'catatan': item['catatan'],
                    'foto': foto_path,
                    'tanggal_dibuat': item['tanggal_pengembalian_dibuat']
                }
            
            # Tentukan status display untuk frontend
            status = item['status']
            if status == "Ditolak" and item['alasan_penolakan']:
                # Tambahkan flag untuk frontend bahwa ada alasan penolakan
                formatted_item['memiliki_alasan_penolakan'] = True
            else:
                formatted_item['memiliki_alasan_penolakan'] = False
            
            formatted_data.append(formatted_item)
        
        return formatted_data
        
    except Exception as e:
        logger.error(f"Error fetching riwayat data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error mengambil data riwayat: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.get("/{id}")
def get_riwayat_by_id(id: str, token: dict = Depends(verify_user)):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Dapatkan user_id dari token
        user_id = token.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID tidak ditemukan")
        
        cursor.execute("""
            SELECT 
                b.*, 
                b.alasan_penolakan,  -- TAMBAH: alasan penolakan
                i.nama_barang, 
                c.nama as kategori_barang,
                u.nama_lengkap,  -- TAMBAH: nama lengkap user
                r.tanggal_pengembalian, 
                r.kondisi_barang, 
                r.catatan, 
                r.foto as foto_pengembalian,
                r.created_at as tanggal_pengembalian_dibuat,
                CASE WHEN r.id IS NOT NULL THEN TRUE ELSE FALSE END as dikembalikan
            FROM borrowings b 
            JOIN items i ON b.barang_id = i.id 
            JOIN categories c ON i.kategori_id = c.id 
            JOIN users u ON b.user_id = u.id  -- JOIN ke tabel users
            LEFT JOIN returns r ON b.id = r.borrowing_id
            WHERE b.user_id = %s AND b.id = %s AND b.deleted_at IS NULL  -- Filter deleted_at
        """, (user_id, id))
        
        riwayat = cursor.fetchone()
        
        if not riwayat:
            raise HTTPException(status_code=404, detail="Data riwayat tidak ditemukan")
        
        # Format data seperti di endpoint verifikasi
        if riwayat['dikembalikan'] and riwayat['foto_pengembalian']:
            # Normalisasi path foto
            foto_path = riwayat['foto_pengembalian']
            if foto_path.startswith('uploads\\') or foto_path.startswith('uploads/'):
                foto_path = foto_path.replace('uploads\\', '').replace('uploads/', '')
            
            riwayat['pengembalian'] = {
                'tanggal_pengembalian': riwayat['tanggal_pengembalian'],
                'kondisi_barang': riwayat['kondisi_barang'],
                'catatan': riwayat['catatan'],
                'foto': foto_path,
                'tanggal_dibuat': riwayat['tanggal_pengembalian_dibuat']
            }
        
        # Tambahkan nama_peminjam untuk konsistensi dengan endpoint lain
        riwayat['nama_peminjam'] = riwayat.get('nama_lengkap', 'User')
        
        # Tentukan status display untuk frontend
        status = riwayat['status']
        if status == "Ditolak" and riwayat['alasan_penolakan']:
            # Tambahkan flag untuk frontend bahwa ada alasan penolakan
            riwayat['memiliki_alasan_penolakan'] = True
        else:
            riwayat['memiliki_alasan_penolakan'] = False
        
        return riwayat
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching riwayat detail: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error mengambil detail riwayat: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.get("/admin/{id}")
def get_riwayat_by_id_admin(id: str, token: dict = Depends(verify_user)):
    """
    Endpoint untuk admin melihat detail riwayat user tertentu
    """
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Cek apakah user adalah admin (opsional, tergantung kebutuhan)
        user_role = token.get("role")
        
        cursor.execute("""
            SELECT 
                b.*, 
                b.alasan_penolakan,  -- TAMBAH: alasan penolakan
                i.nama_barang, 
                c.nama as kategori_barang,
                u.nama_lengkap,
                u.username,
                u.email,
                u.foto_profil,
                r.tanggal_pengembalian, 
                r.kondisi_barang, 
                r.catatan, 
                r.foto as foto_pengembalian,
                r.created_at as tanggal_pengembalian_dibuat,
                CASE WHEN r.id IS NOT NULL THEN TRUE ELSE FALSE END as dikembalikan
            FROM borrowings b 
            JOIN items i ON b.barang_id = i.id 
            JOIN categories c ON i.kategori_id = c.id 
            JOIN users u ON b.user_id = u.id
            LEFT JOIN returns r ON b.id = r.borrowing_id
            WHERE b.id = %s AND b.deleted_at IS NULL
        """, (id,))
        
        riwayat = cursor.fetchone()
        
        if not riwayat:
            raise HTTPException(status_code=404, detail="Data riwayat tidak ditemukan")
        
        # Format data pengembalian jika ada
        if riwayat['dikembalikan'] and riwayat['foto_pengembalian']:
            foto_path = riwayat['foto_pengembalian']
            if foto_path.startswith('uploads\\') or foto_path.startswith('uploads/'):
                foto_path = foto_path.replace('uploads\\', '').replace('uploads/', '')
            
            riwayat['pengembalian'] = {
                'tanggal_pengembalian': riwayat['tanggal_pengembalian'],
                'kondisi_barang': riwayat['kondisi_barang'],
                'catatan': riwayat['catatan'],
                'foto': foto_path,
                'tanggal_dibuat': riwayat['tanggal_pengembalian_dibuat']
            }
        
        # Tambahkan nama_peminjam untuk konsistensi
        riwayat['nama_peminjam'] = riwayat.get('nama_lengkap', 'User')
        
        # Tentukan status display untuk frontend
        status = riwayat['status']
        if status == "Ditolak" and riwayat['alasan_penolakan']:
            riwayat['memiliki_alasan_penolakan'] = True
        else:
            riwayat['memiliki_alasan_penolakan'] = False
        
        return riwayat
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching riwayat detail for admin: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error mengambil detail riwayat: {str(e)}")
    finally:
        cursor.close()
        connection.close()
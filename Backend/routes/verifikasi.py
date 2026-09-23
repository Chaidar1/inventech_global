from fastapi import APIRouter, Depends, HTTPException
from dependencies.auth import verify_admin
from config.database import db
from models.base_models import VerifikasiUpdateWithAlasan
from utils.validators import validate_status_peminjaman
import logging
from datetime import date, datetime
from models.enums import StatusPeminjaman

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/verifikasi", tags=["Verifikasi"])

@router.get("/")
def get_verifikasi(token: dict = Depends(verify_admin)):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT 
                b.*, 
                i.nama_barang, 
                c.nama as kategori_barang,
                u.nama_lengkap,  
                u.username,      
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
            WHERE b.deleted_at IS NULL
            ORDER BY b.created_at DESC
        """)
        
        verifikasi_data = cursor.fetchall()
        
        # Format data dan normalisasi path foto
        formatted_data = []
        for item in verifikasi_data:
            formatted_item = dict(item)
            
            # Gunakan nama_lengkap sebagai nama_peminjam untuk display
            formatted_item['nama_peminjam'] = item['nama_lengkap']
            
            # Jika ada data pengembalian, format menjadi objek
            if item['dikembalikan'] and item['foto_pengembalian']:
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
            
            formatted_data.append(formatted_item)
        
        return formatted_data
        
    except Exception as e:
        logger.error(f"Error fetching verification data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error mengambil data verifikasi: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.put("/{id}")
def update_status_verifikasi(
    id: str, 
    update_data: VerifikasiUpdateWithAlasan,
    token: dict = Depends(verify_admin)
):
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Get current borrowing data
        cursor.execute("""
            SELECT b.*, u.nama_lengkap, u.foto_profil
            FROM borrowings b 
            JOIN users u ON b.user_id = u.id 
            WHERE b.id = %s
        """, (id,))
        borrowing = cursor.fetchone()
        
        if not borrowing:
            raise HTTPException(status_code=404, detail="Peminjaman tidak ditemukan")

        # Validasi status
        valid_statuses = [s.value for s in StatusPeminjaman]
        if update_data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Status tidak valid. Harus salah satu dari: {valid_statuses}")

        # Validasi alasan penolakan jika status Ditolak
        if update_data.status == "Ditolak" and (not update_data.alasan_penolakan or update_data.alasan_penolakan.strip() == ""):
            raise HTTPException(status_code=400, detail="Alasan penolakan wajib diisi untuk status Ditolak")
        
        # Validasi panjang alasan
        if update_data.alasan_penolakan and len(update_data.alasan_penolakan) > 500:
            raise HTTPException(status_code=400, detail="Alasan penolakan maksimal 500 karakter")

        # Update borrowing status dengan alasan penolakan
        if update_data.status == "Ditolak" and update_data.alasan_penolakan:
            cursor.execute(
                "UPDATE borrowings SET status = %s, tanggal_verifikasi = %s, alasan_penolakan = %s WHERE id = %s",
                (update_data.status, datetime.now().isoformat(), update_data.alasan_penolakan.strip(), id)
            )
        else:
            # Untuk status lain, set alasan_penolakan menjadi NULL
            cursor.execute(
                "UPDATE borrowings SET status = %s, tanggal_verifikasi = %s, alasan_penolakan = NULL WHERE id = %s",
                (update_data.status, datetime.now().isoformat(), id)
            )

        # Update unit status based on borrowing status
        unit_kode = update_data.unit_kode or borrowing['unit_kode']
        
        if update_data.status == "Disetujui":
            cursor.execute("UPDATE item_units SET status = 'Dipinjam' WHERE kode = %s", (unit_kode,))
        elif update_data.status == "Ditolak":
            cursor.execute("UPDATE item_units SET status = 'Tersedia' WHERE kode = %s", (unit_kode,))
        elif update_data.status == "Selesai":
            cursor.execute("UPDATE item_units SET status = 'Tersedia' WHERE kode = %s", (unit_kode,))

        connection.commit()

        return {
            "message": f"Status peminjaman {id} berhasil diperbarui ke {update_data.status}",
            "nama_peminjam": borrowing['nama_lengkap'],
            "foto_profil": borrowing['foto_profil'],
            "alasan_penolakan": update_data.alasan_penolakan if update_data.status == "Ditolak" else None
        }
        
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error updating verification: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.delete("/{id}")
def delete_peminjaman_admin(id: str, token: dict = Depends(verify_admin)):
    connection = db.get_connection()
    cursor = connection.cursor()
    
    try:
        cursor.execute("SELECT * FROM borrowings WHERE id = %s", (id,))
        peminjaman = cursor.fetchone()
        if not peminjaman:
            raise HTTPException(status_code=404, detail="Data peminjaman tidak ditemukan")

        cursor.execute(
            "UPDATE borrowings SET deleted_at = %s WHERE id = %s",
            (datetime.now(), id)
        )
        
        connection.commit()

        return {"message": f"Data peminjaman {id} berhasil dihapus"}
        
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error deleting peminjaman: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error menghapus data peminjaman: {str(e)}")
    finally:
        cursor.close()
        connection.close()
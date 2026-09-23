from fastapi import APIRouter, Depends, HTTPException
from dependencies.auth import verify_token, verify_admin
from config.database import db
from datetime import datetime, timedelta
import logging
from typing import List

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["Notifications"])

# Buat tabel untuk menyimpan status notifikasi yang sudah dibaca dan dihapus
@router.on_event("startup")
async def create_notifications_table():
    connection = db.get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS read_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                notification_id VARCHAR(255) NOT NULL,
                user_id INT NOT NULL,
                read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_notification_user (notification_id, user_id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS deleted_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                notification_id VARCHAR(255) NOT NULL,
                user_id INT NOT NULL,
                deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_deleted_notification (notification_id, user_id)
            )
        """)
        
        connection.commit()
        logger.info("Notifications tables created or already exists")
    except Exception as e:
        logger.error(f"Error creating notifications tables: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.get("/admin")
def get_admin_notifications(token: dict = Depends(verify_admin)):
    """Get real notifications for admin based on actual data - FIXED VERSION"""
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        user_id = token["user_id"]
        notifications = []
        
        # 1. Notifikasi: User baru terdaftar (dalam 24 jam terakhir)
        cursor.execute("""
            SELECT id, username, nama_lengkap, created_at 
            FROM users 
            WHERE role = 'user' AND created_at >= %s 
            ORDER BY created_at DESC
        """, (datetime.now() - timedelta(hours=24),))
        
        new_users = cursor.fetchall()
        for user in new_users:
            notification_id = f"user_register_{user['id']}"
            
            # Cek apakah notifikasi sudah dihapus permanen
            cursor.execute("""
                SELECT 1 FROM deleted_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_deleted = cursor.fetchone() is not None
            
            # Skip notifikasi yang sudah dihapus permanen
            if is_deleted:
                logger.info(f"Skipping deleted notification: {notification_id} for user {user_id}")
                continue
                
            # Cek apakah notifikasi sudah dibaca
            cursor.execute("""
                SELECT 1 FROM read_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_read = cursor.fetchone() is not None
            
            notifications.append({
                "id": notification_id,
                "type": "user_register",
                "title": "User Baru Terdaftar",
                "message": f"User {user['nama_lengkap']} ({user['username']}) telah berhasil mendaftar",
                "timestamp": user['created_at'].isoformat(),
                "read": is_read,
                "icon": "Bell",
                "color": "blue",
                "metadata": {
                    "user_id": user['id'],
                    "username": user['username']
                }
            })
        
        # 2. Notifikasi: Permintaan peminjaman menunggu verifikasi
        cursor.execute("""
            SELECT b.id, b.nama_peminjam, i.nama_barang, b.created_at
            FROM borrowings b
            JOIN items i ON b.barang_id = i.id
            WHERE b.status = 'Menunggu' AND b.created_at >= %s
            ORDER BY b.created_at DESC
        """, (datetime.now() - timedelta(days=7),))
        
        pending_borrowings = cursor.fetchall()
        for borrowing in pending_borrowings:
            notification_id = f"peminjaman_baru_{borrowing['id']}"
            
            # Cek apakah notifikasi sudah dihapus permanen
            cursor.execute("""
                SELECT 1 FROM deleted_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_deleted = cursor.fetchone() is not None
            
            # Skip notifikasi yang sudah dihapus permanen
            if is_deleted:
                logger.info(f"Skipping deleted notification: {notification_id} for user {user_id}")
                continue
                
            cursor.execute("""
                SELECT 1 FROM read_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_read = cursor.fetchone() is not None
            
            notifications.append({
                "id": notification_id,
                "type": "peminjaman_baru",
                "title": "Permintaan Peminjaman Baru",
                "message": f"User {borrowing['nama_peminjam']} meminjam barang {borrowing['nama_barang']}",
                "timestamp": borrowing['created_at'].isoformat(),
                "read": is_read,
                "icon": "ShoppingCart",
                "color": "orange",
                "metadata": {
                    "borrowing_id": borrowing['id'],
                    "nama_peminjam": borrowing['nama_peminjam']
                }
            })
        
        # 3. Notifikasi: Pengembalian menunggu verifikasi
        cursor.execute("""
            SELECT b.id, b.nama_peminjam, i.nama_barang, r.created_at
            FROM returns r
            JOIN borrowings b ON r.borrowing_id = b.id
            JOIN items i ON b.barang_id = i.id
            WHERE b.status = 'Menunggu Verifikasi Pengembalian'
            ORDER BY r.created_at DESC
        """)
        
        pending_returns = cursor.fetchall()
        for return_item in pending_returns:
            notification_id = f"pengembalian_{return_item['id']}"
            
            # Cek apakah notifikasi sudah dihapus permanen
            cursor.execute("""
                SELECT 1 FROM deleted_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_deleted = cursor.fetchone() is not None
            
            # Skip notifikasi yang sudah dihapus permanen
            if is_deleted:
                logger.info(f"Skipping deleted notification: {notification_id} for user {user_id}")
                continue
                
            cursor.execute("""
                SELECT 1 FROM read_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_read = cursor.fetchone() is not None
            
            notifications.append({
                "id": notification_id,
                "type": "pengembalian",
                "title": "Pengembalian Barang",
                "message": f"User {return_item['nama_peminjam']} mengembalikan barang {return_item['nama_barang']}",
                "timestamp": return_item['created_at'].isoformat(),
                "read": is_read,
                "icon": "Package",
                "color": "green",
                "metadata": {
                    "borrowing_id": return_item['id'],
                    "nama_peminjam": return_item['nama_peminjam']
                }
            })
        
        # 4. Notifikasi: Stok barang hampir habis (kurang dari 3)
        cursor.execute("""
            SELECT i.id, i.nama_barang, COUNT(iu.kode) as stok_tersedia
            FROM items i
            LEFT JOIN item_units iu ON i.id = iu.barang_id AND iu.status = 'Tersedia'
            GROUP BY i.id, i.nama_barang
            HAVING stok_tersedia > 0 AND stok_tersedia <= 3
        """)
        
        low_stock = cursor.fetchall()
        for item in low_stock:
            notification_id = f"stok_rendah_{item['id']}"
            
            # Cek apakah notifikasi sudah dihapus permanen
            cursor.execute("""
                SELECT 1 FROM deleted_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_deleted = cursor.fetchone() is not None
            
            # Skip notifikasi yang sudah dihapus permanen
            if is_deleted:
                logger.info(f"Skipping deleted notification: {notification_id} for user {user_id}")
                continue
                
            cursor.execute("""
                SELECT 1 FROM read_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_read = cursor.fetchone() is not None
            
            notifications.append({
                "id": notification_id,
                "type": "stok_rendah",
                "title": "Stok Barang Hampir Habis",
                "message": f"Barang {item['nama_barang']} hanya tersisa {item['stok_tersedia']} unit",
                "timestamp": datetime.now().isoformat(),
                "read": is_read,
                "icon": "AlertCircle",
                "color": "red",
                "metadata": {
                    "barang_id": item['id'],
                    "stok_tersedia": item['stok_tersedia']
                }
            })
        
        # Sort by timestamp (newest first)
        notifications.sort(key=lambda x: x['timestamp'], reverse=True)
        
        logger.info(f"Returning {len(notifications)} notifications for admin user {user_id}")
        return {"notifications": notifications[:50]}
        
    except Exception as e:
        logger.error(f"Error fetching admin notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error mengambil notifikasi: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.get("/user")
def get_user_notifications(token: dict = Depends(verify_token)):
    """Get real notifications for user based on actual data - FIXED VERSION"""
    connection = db.get_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        user_id = token["user_id"]
        notifications = []
        
        # 1. Notifikasi: Peminjaman berhasil diajukan (dalam 7 hari terakhir)
        cursor.execute("""
            SELECT b.id, i.nama_barang, b.created_at
            FROM borrowings b
            JOIN items i ON b.barang_id = i.id
            WHERE b.user_id = %s AND b.status = 'Menunggu' 
            AND b.created_at >= %s
            ORDER BY b.created_at DESC
        """, (user_id, datetime.now() - timedelta(days=7)))
        
        pending_borrowings = cursor.fetchall()
        for borrowing in pending_borrowings:
            notification_id = f"peminjaman_berhasil_{borrowing['id']}"
            # Cek apakah notifikasi sudah dihapus permanen
            cursor.execute("""
                SELECT 1 FROM deleted_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_deleted = cursor.fetchone() is not None
            
            # Skip notifikasi yang sudah dihapus permanen
            if is_deleted:
                logger.info(f"Skipping deleted notification: {notification_id} for user {user_id}")
                continue
                
            # Cek apakah notifikasi sudah dibaca
            cursor.execute("""
                SELECT 1 FROM read_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_read = cursor.fetchone() is not None
            
            notifications.append({
                "id": notification_id,
                "type": "peminjaman_berhasil",
                "title": "Peminjaman Berhasil",
                "message": f"Peminjaman {borrowing['nama_barang']} berhasil diajukan. Tunggu verifikasi oleh admin!",
                "timestamp": borrowing['created_at'].isoformat(),
                "read": is_read,
                "icon": "CheckCircle",
                "color": "green",
                "metadata": {
                    "borrowing_id": borrowing['id'],
                    "status": "Menunggu"
                }
            })
        
        # 2. Notifikasi: Status peminjaman
        cursor.execute("""
            SELECT b.id, b.status, i.nama_barang, b.tanggal_verifikasi, b.updated_at
            FROM borrowings b
            JOIN items i ON b.barang_id = i.id
            WHERE b.user_id = %s AND b.status IN ('Disetujui', 'Ditolak', 'Selesai')
            AND b.updated_at >= %s
            ORDER BY b.updated_at DESC
        """, (user_id, datetime.now() - timedelta(days=30)))
        
        borrowing_updates = cursor.fetchall()
        for borrowing in borrowing_updates:
            notification_id = f"peminjaman_{borrowing['status'].lower()}_{borrowing['id']}"
            
            # Cek apakah notifikasi sudah dihapus permanen
            cursor.execute("""
                SELECT 1 FROM deleted_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_deleted = cursor.fetchone() is not None
            
            # Skip notifikasi yang sudah dihapus permanen
            if is_deleted:
                logger.info(f"Skipping deleted notification: {notification_id} for user {user_id}")
                continue
                
            cursor.execute("""
                SELECT 1 FROM read_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_read = cursor.fetchone() is not None
            
            if borrowing['status'] == 'Disetujui':
                notifications.append({
                    "id": notification_id,
                    "type": "peminjaman_disetujui",
                    "title": "Peminjaman Disetujui",
                    "message": f"Peminjaman {borrowing['nama_barang']} telah disetujui",
                    "timestamp": borrowing['updated_at'].isoformat(),
                    "read": is_read,
                    "icon": "CheckCircle",
                    "color": "green",
                    "metadata": {
                        "borrowing_id": borrowing['id'],
                        "status": borrowing['status']
                    }
                })
            elif borrowing['status'] == 'Ditolak':
                notifications.append({
                    "id": notification_id,
                    "type": "peminjaman_ditolak",
                    "title": "Peminjaman Ditolak",
                    "message": f"Peminjaman {borrowing['nama_barang']} ditolak",
                    "timestamp": borrowing['updated_at'].isoformat(),
                    "read": is_read,
                    "icon": "XCircle",
                    "color": "red",
                    "metadata": {
                        "borrowing_id": borrowing['id'],
                        "status": borrowing['status']
                    }
                })
            elif borrowing['status'] == 'Selesai':
                notifications.append({
                    "id": notification_id,
                    "type": "pengembalian_verifikasi",
                    "title": "Pengembalian Diverifikasi",
                    "message": f"Pengembalian {borrowing['nama_barang']} telah diverifikasi",
                    "timestamp": borrowing['updated_at'].isoformat(),
                    "read": is_read,
                    "icon": "Package",
                    "color": "blue",
                    "metadata": {
                        "borrowing_id": borrowing['id']
                    }
                })
        
        # 3. Notifikasi: Pengembalian menunggu verifikasi
        cursor.execute("""
            SELECT b.id, i.nama_barang, b.updated_at
            FROM borrowings b
            JOIN items i ON b.barang_id = i.id
            WHERE b.user_id = %s AND b.status = 'Menunggu Verifikasi Pengembalian'
            ORDER BY b.updated_at DESC
        """, (user_id,))
        
        pending_verification = cursor.fetchall()
        for item in pending_verification:
            notification_id = f"pengembalian_menunggu_{item['id']}"
            
            # Cek apakah notifikasi sudah dihapus permanen
            cursor.execute("""
                SELECT 1 FROM deleted_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_deleted = cursor.fetchone() is not None
            
            # Skip notifikasi yang sudah dihapus permanen
            if is_deleted:
                logger.info(f"Skipping deleted notification: {notification_id} for user {user_id}")
                continue
                
            cursor.execute("""
                SELECT 1 FROM read_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_read = cursor.fetchone() is not None
            
            notifications.append({
                "id": notification_id,
                "type": "pengembalian_menunggu",
                "title": "Pengembalian Diproses",
                "message": f"Pengembalian {item['nama_barang']} sedang diverifikasi admin",
                "timestamp": item['updated_at'].isoformat(),
                "read": is_read,
                "icon": "Clock",
                "color": "orange",
                "metadata": {
                    "borrowing_id": item['id']
                }
            })
        
        # 4. Notifikasi: Barang yang pernah dipinjam sekarang tersedia - FIXED
        cursor.execute("""
            SELECT DISTINCT i.id, i.nama_barang
            FROM borrowings b
            JOIN items i ON b.barang_id = i.id
            JOIN item_units iu ON i.id = iu.barang_id
            WHERE b.user_id = %s 
            AND iu.status = 'Tersedia'
            AND i.id IN (
                SELECT barang_id FROM borrowings WHERE user_id = %s
            )
        """, (user_id, user_id))
        
        available_items = cursor.fetchall()
        for item in available_items:
            notification_id = f"stok_tersedia_{item['id']}"
            
            # CEK APAKAH NOTIFIKASI INI SUDAH DIHAPUS PERMANEN
            cursor.execute("""
                SELECT 1 FROM deleted_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_deleted = cursor.fetchone() is not None
            
            # Hanya tambahkan jika belum dihapus permanen
            if is_deleted:
                logger.info(f"Skipping deleted notification: {notification_id} for user {user_id}")
                continue
                
            cursor.execute("""
                SELECT 1 FROM read_notifications 
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, user_id))
            is_read = cursor.fetchone() is not None
            
            notifications.append({
                "id": notification_id,
                "type": "stok_update",
                "title": "Barang Tersedia Kembali",
                "message": f"Barang {item['nama_barang']} yang pernah Anda pinjam sekarang tersedia",
                "timestamp": datetime.now().isoformat(),
                "read": is_read,
                "icon": "AlertCircle",
                "color": "orange",
                "metadata": {
                    "barang_id": item['id']
                }
            })
        
        # 5. Notifikasi: Pengingat pengembalian
        cursor.execute("""
            SELECT b.id, i.nama_barang, b.tanggal_kembali
            FROM borrowings b
            JOIN items i ON b.barang_id = i.id
            WHERE b.user_id = %s 
            AND b.status IN ('Dipinjam', 'Disetujui')
            AND b.tanggal_kembali >= %s
        """, (user_id, datetime.now().date()))
        
        active_borrowings = cursor.fetchall()
        for borrowing in active_borrowings:
            return_date = borrowing['tanggal_kembali']
            days_until_return = (return_date - datetime.now().date()).days
            
            if days_until_return <= 2 and days_until_return >= 0:
                notification_id = f"pengingat_pengembalian_{borrowing['id']}"
                
                # Cek apakah notifikasi sudah dihapus permanen
                cursor.execute("""
                    SELECT 1 FROM deleted_notifications 
                    WHERE notification_id = %s AND user_id = %s
                """, (notification_id, user_id))
                is_deleted = cursor.fetchone() is not None
                
                # Skip notifikasi yang sudah dihapus permanen
                if is_deleted:
                    logger.info(f"Skipping deleted notification: {notification_id} for user {user_id}")
                    continue
                    
                cursor.execute("""
                    SELECT 1 FROM read_notifications 
                    WHERE notification_id = %s AND user_id = %s
                """, (notification_id, user_id))
                is_read = cursor.fetchone() is not None
                
                day_text = "hari" if days_until_return != 1 else "hari"
                notifications.append({
                    "id": notification_id,
                    "type": "pengingat_pengembalian",
                    "title": "Pengingat Pengembalian",
                    "message": f"Barang {borrowing['nama_barang']} harus dikembalikan dalam {days_until_return} {day_text}",
                    "timestamp": datetime.now().isoformat(),
                    "read": is_read,
                    "icon": "Clock",
                    "color": "orange",
                    "metadata": {
                        "borrowing_id": borrowing['id']
                    }
                })
        
        # Sort by timestamp (newest first)
        notifications.sort(key=lambda x: x['timestamp'], reverse=True)
        
        logger.info(f"Returning {len(notifications)} notifications for user {user_id}")
        return {"notifications": notifications[:30]}
        
    except Exception as e:
        logger.error(f"Error fetching user notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error mengambil notifikasi: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.put("/{notification_id}/read")
def mark_notification_read(notification_id: str, token: dict = Depends(verify_token)):
    """Mark notification as read - FIXED VERSION"""
    connection = db.get_connection()
    cursor = connection.cursor()
    
    try:
        user_id = token["user_id"]
        
        # Simpan status read ke database
        cursor.execute("""
            INSERT INTO read_notifications (notification_id, user_id) 
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP
        """, (notification_id, user_id))
        
        connection.commit()
        
        logger.info(f"Notification {notification_id} marked as read for user {user_id}")
        
        return {
            "message": "Notification marked as read", 
            "notification_id": notification_id,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error menandai notifikasi: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.put("/read-all")
def mark_all_notifications_read(token: dict = Depends(verify_token)):
    """Mark all notifications as read - FIXED VERSION"""
    connection = db.get_connection()
    cursor = connection.cursor()
    
    try:
        user_id = token["user_id"]
        
        # Dapatkan semua notifikasi yang mungkin ada
        cursor.execute("""
            SELECT DISTINCT notification_id FROM (
                SELECT CONCAT('user_register_', id) as notification_id FROM users 
                WHERE role = 'user' AND created_at >= %s
                UNION
                SELECT CONCAT('peminjaman_baru_', id) as notification_id FROM borrowings 
                WHERE status = 'Menunggu' AND created_at >= %s
                UNION
                SELECT CONCAT('pengembalian_', id) as notification_id FROM borrowings 
                WHERE status = 'Menunggu Verifikasi Pengembalian'
                UNION
                SELECT CONCAT('stok_rendah_', id) as notification_id FROM items 
                WHERE (SELECT COUNT(*) FROM item_units WHERE barang_id = items.id AND status = 'Tersedia') BETWEEN 1 AND 3
                UNION
                SELECT CONCAT('peminjaman_berhasil_', id) as notification_id FROM borrowings 
                WHERE user_id = %s AND status = 'Menunggu' AND created_at >= %s
                UNION
                SELECT CONCAT('peminjaman_disetujui_', id) as notification_id FROM borrowings 
                WHERE user_id = %s AND status = 'Disetujui' AND updated_at >= %s
                UNION
                SELECT CONCAT('peminjaman_ditolak_', id) as notification_id FROM borrowings 
                WHERE user_id = %s AND status = 'Ditolak' AND updated_at >= %s
                UNION
                SELECT CONCAT('pengembalian_verifikasi_', id) as notification_id FROM borrowings 
                WHERE user_id = %s AND status = 'Selesai' AND updated_at >= %s
                UNION
                SELECT CONCAT('pengembalian_menunggu_', id) as notification_id FROM borrowings 
                WHERE user_id = %s AND status = 'Menunggu Verifikasi Pengembalian'
                UNION
                SELECT CONCAT('stok_tersedia_', id) as notification_id FROM items 
                WHERE id IN (SELECT barang_id FROM borrowings WHERE user_id = %s)
                UNION
                SELECT CONCAT('pengingat_pengembalian_', id) as notification_id FROM borrowings 
                WHERE user_id = %s AND status IN ('Dipinjam', 'Disetujui')
            ) as all_notifications
        """, (
            datetime.now() - timedelta(days=1), 
            datetime.now() - timedelta(days=7),
            user_id, datetime.now() - timedelta(days=7),
            user_id, datetime.now() - timedelta(days=30),
            user_id, datetime.now() - timedelta(days=30),
            user_id, datetime.now() - timedelta(days=30),
            user_id,
            user_id,
            user_id
        ))
        
        all_notifications = cursor.fetchall()
        
        # Mark all as read
        for notif in all_notifications:
            cursor.execute("""
                INSERT INTO read_notifications (notification_id, user_id) 
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP
            """, (notif['notification_id'], user_id))
        
        connection.commit()
        
        logger.info(f"All notifications marked as read for user {user_id}")
        
        return {"message": "All notifications marked as read", "success": True}
        
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error menandai semua notifikasi: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.delete("/admin")
def clear_admin_notifications(token: dict = Depends(verify_admin)):
    """Clear admin notifications - FIXED VERSION"""
    connection = db.get_connection()
    cursor = connection.cursor()
    
    try:
        user_id = token["user_id"]
        
        # Hapus semua status read notifikasi untuk user ini
        cursor.execute("DELETE FROM read_notifications WHERE user_id = %s", (user_id,))
        
        connection.commit()
        
        logger.info(f"All notifications cleared for admin user {user_id}")
        
        return {"message": "All notifications cleared", "success": True}
        
    except Exception as e:
        logger.error(f"Error clearing notifications: {str(e)}")
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error menghapus notifikasi: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.delete("/user")
def clear_user_notifications(token: dict = Depends(verify_token)):
    """Clear user notifications - FIXED VERSION"""
    connection = db.get_connection()
    cursor = connection.cursor()
    
    try:
        user_id = token["user_id"]
        
        # Hapus semua status read notifikasi untuk user ini
        cursor.execute("DELETE FROM read_notifications WHERE user_id = %s", (user_id,))
        
        connection.commit()
        
        logger.info(f"All notifications cleared for user {user_id}")
        
        return {"message": "All notifications cleared", "success": True}
        
    except Exception as e:
        logger.error(f"Error clearing user notifications: {str(e)}")
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error menghapus notifikasi: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.delete("/{notification_id}")
def delete_single_notification(notification_id: str, token: dict = Depends(verify_token)):
    """Delete single notification - IMPROVED VERSION"""
    connection = db.get_connection()
    cursor = connection.cursor()
    
    try:
        user_id = token["user_id"]
        
        # Hapus status read untuk notifikasi tertentu
        cursor.execute("DELETE FROM read_notifications WHERE notification_id = %s AND user_id = %s", 
                      (notification_id, user_id))
        
        if cursor.rowcount == 0:
            logger.warning(f"Notification {notification_id} not found for user {user_id}")
            return {
                "message": "Notification not found or already deleted", 
                "notification_id": notification_id,
                "success": True
            }
        
        connection.commit()
        
        logger.info(f"Notification {notification_id} deleted for user {user_id}")
        
        return {
            "message": "Notification deleted successfully", 
            "notification_id": notification_id,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error deleting notification: {str(e)}")
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error menghapus notifikasi: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.delete("/{notification_id}/permanent")
def permanently_delete_notification(notification_id: str, token: dict = Depends(verify_token)):
    """Permanently delete notification so it doesn't reappear - NEW ENDPOINT"""
    connection = db.get_connection()
    cursor = connection.cursor()
    
    try:
        user_id = token["user_id"]
        
        # Hapus dari read_notifications
        cursor.execute("DELETE FROM read_notifications WHERE notification_id = %s AND user_id = %s", 
                      (notification_id, user_id))
        
        # Tandai sebagai dihapus permanen di tabel deleted_notifications
        cursor.execute("""
            INSERT INTO deleted_notifications (notification_id, user_id) 
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE deleted_at = CURRENT_TIMESTAMP
        """, (notification_id, user_id))
        
        connection.commit()
        
        logger.info(f"Notification {notification_id} permanently deleted for user {user_id}")
        
        return {
            "message": "Notification permanently deleted", 
            "notification_id": notification_id,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error permanently deleting notification: {str(e)}")
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error menghapus notifikasi permanen: {str(e)}")
    finally:
        cursor.close()
        connection.close()
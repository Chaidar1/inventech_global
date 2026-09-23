-- Buat database
CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- ========================
-- TABEL USERS
-- ========================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================
-- TABEL CATEGORIES
-- ========================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================
-- TABEL ITEMS
-- ========================
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_barang VARCHAR(255) NOT NULL,
    kategori_id INT,
    tahun_perolehan INT DEFAULT 2025,
    deskripsi TEXT,
    foto VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_nama_barang (nama_barang),
    INDEX idx_kategori (kategori_id)
);

-- ========================
-- TABEL ITEM_UNITS
-- ========================
CREATE TABLE IF NOT EXISTS item_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barang_id INT NOT NULL,
    kode VARCHAR(100) UNIQUE NOT NULL,
    kondisi ENUM('Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang', 'Perlu Perbaikan') DEFAULT 'Baik',
    status ENUM('Tersedia', 'Menunggu', 'Dipinjam', 'Rusak') DEFAULT 'Tersedia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (barang_id) REFERENCES items(id) ON DELETE CASCADE,
    INDEX idx_kode (kode),
    INDEX idx_status (status),
    INDEX idx_barang_id (barang_id)
);

-- ========================
-- TABEL BORROWINGS
-- ========================
CREATE TABLE IF NOT EXISTS borrowings (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT,
    nama_peminjam VARCHAR(255) NOT NULL,
    barang_id INT NOT NULL,
    unit_kode VARCHAR(100) NOT NULL,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE NOT NULL,
    keperluan TEXT,
    status ENUM('Menunggu', 'Disetujui', 'Ditolak', 'Dipinjam', 'Selesai', 'Menunggu Verifikasi Pengembalian') DEFAULT 'Menunggu',
    tanggal_verifikasi DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (barang_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_kode) REFERENCES item_units(kode),
    INDEX idx_status (status),
    INDEX idx_tanggal_pinjam (tanggal_pinjam),
    INDEX idx_nama_peminjam (nama_peminjam)
);

-- ========================
-- TABEL RETURNS
-- ========================
CREATE TABLE IF NOT EXISTS returns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    borrowing_id VARCHAR(36) NOT NULL,
    tanggal_pengembalian DATE NOT NULL,
    kondisi_barang ENUM('Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang', 'Perlu Perbaikan') NOT NULL,
    catatan TEXT,
    foto VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrowing_id) REFERENCES borrowings(id) ON DELETE CASCADE,
    INDEX idx_borrowing_id (borrowing_id),
    INDEX idx_tanggal_pengembalian (tanggal_pengembalian)
);

-- ========================
-- INSERT DEFAULT DATA
-- ========================
INSERT INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('user', 'user123', 'user');

-- Insert sample categories
INSERT INTO categories (nama) VALUES 
('Elektronik'),
('Furniture'),
('Kendaraan'),
('Alat Tulis'),
('Perlengkapan Kantor');

-- Insert sample items
INSERT INTO items (nama_barang, kategori_id, tahun_perolehan, deskripsi) VALUES 
('Laptop Dell XPS', 1, 2024, 'Laptop untuk kerja programming'),
('Meja Kerja', 2, 2023, 'Meja kerja standar'),
('Printer Epson', 1, 2024, 'Printer warna untuk kantor');

-- Insert sample item units
INSERT INTO item_units (barang_id, kode, kondisi, status) VALUES 
(1, 'LAPTOP-001', 'Baik', 'Tersedia'),
(1, 'LAPTOP-002', 'Baik', 'Tersedia'),
(2, 'MEJA-001', 'Baik', 'Tersedia'),
(3, 'PRINT-001', 'Baik', 'Tersedia');

-- ========================
-- CREATE VIEWS FOR REPORTING
-- ========================
CREATE VIEW view_barang_detail AS
SELECT 
    i.id,
    i.nama_barang,
    c.nama as kategori,
    i.tahun_perolehan,
    i.deskripsi,
    i.foto,
    COUNT(iu.id) as total_unit,
    SUM(CASE WHEN iu.status = 'Tersedia' THEN 1 ELSE 0 END) as unit_tersedia,
    SUM(CASE WHEN iu.status = 'Dipinjam' THEN 1 ELSE 0 END) as unit_dipinjam,
    i.created_at,
    i.updated_at
FROM items i
LEFT JOIN categories c ON i.kategori_id = c.id
LEFT JOIN item_units iu ON i.id = iu.barang_id
GROUP BY i.id;

CREATE VIEW view_peminjaman_detail AS
SELECT 
    b.id,
    b.nama_peminjam,
    b.user_id,
    i.nama_barang,
    c.nama as kategori_barang,
    b.unit_kode,
    b.tanggal_pinjam,
    b.tanggal_kembali,
    b.keperluan,
    b.status,
    b.tanggal_verifikasi,
    r.tanggal_pengembalian,
    r.kondisi_barang as kondisi_pengembalian,
    r.catatan as catatan_pengembalian,
    b.created_at,
    b.updated_at
FROM borrowings b
JOIN items i ON b.barang_id = i.id
JOIN categories c ON i.kategori_id = c.id
LEFT JOIN returns r ON b.id = r.borrowing_id;

-- ========================
-- STORED PROCEDURES
-- ========================
DELIMITER //

CREATE PROCEDURE sp_get_barang_stats()
BEGIN
    SELECT 
        COUNT(*) as total_barang,
        COUNT(DISTINCT kategori_id) as total_kategori,
        (SELECT COUNT(*) FROM item_units WHERE status = 'Tersedia') as total_unit_tersedia,
        (SELECT COUNT(*) FROM item_units WHERE status = 'Dipinjam') as total_unit_dipinjam,
        (SELECT COUNT(*) FROM borrowings WHERE status = 'Menunggu') as peminjaman_menunggu
    FROM items;
END //

CREATE PROCEDURE sp_get_peminjaman_aktif()
BEGIN
    SELECT 
        b.*,
        i.nama_barang,
        c.nama as kategori_barang
    FROM borrowings b
    JOIN items i ON b.barang_id = i.id
    JOIN categories c ON i.kategori_id = c.id
    WHERE b.status IN ('Disetujui', 'Dipinjam')
    ORDER BY b.tanggal_pinjam DESC;
END //

DELIMITER ;

-- ========================
-- CREATE TRIGGERS
-- ========================
DELIMITER //

-- Trigger untuk update timestamp pada items
CREATE TRIGGER before_items_update
    BEFORE UPDATE ON items
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

-- Trigger untuk update timestamp pada item_units
CREATE TRIGGER before_item_units_update
    BEFORE UPDATE ON item_units
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

-- Trigger untuk log perubahan status peminjaman
CREATE TRIGGER after_borrowings_update
    AFTER UPDATE ON borrowings
    FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO borrowing_status_log (borrowing_id, status_lama, status_baru, updated_by)
        VALUES (NEW.id, OLD.status, NEW.status, 'system');
    END IF;
END //

DELIMITER ;

-- ========================
-- CREATE LOGGING TABLE (Optional)
-- ========================
CREATE TABLE IF NOT EXISTS borrowing_status_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    borrowing_id VARCHAR(36) NOT NULL,
    status_lama VARCHAR(50),
    status_baru VARCHAR(50),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrowing_id) REFERENCES borrowings(id) ON DELETE CASCADE
);

-- ========================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================
CREATE INDEX idx_items_created ON items(created_at);
CREATE INDEX idx_borrowings_status_date ON borrowings(status, created_at);
CREATE INDEX idx_item_units_barang_status ON item_units(barang_id, status);
CREATE INDEX idx_returns_borrowing ON returns(borrowing_id);

-- ========================
-- GRANT PERMISSIONS (Jika menggunakan user khusus)
-- ========================
-- GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ========================
-- SHOW TABLE STRUCTURES
-- ========================
SHOW TABLES;

DESCRIBE users;
DESCRIBE categories;
DESCRIBE items;
DESCRIBE item_units;
DESCRIBE borrowings;
DESCRIBE returns;
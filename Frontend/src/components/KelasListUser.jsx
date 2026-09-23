// KelasListUser.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Clock,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  ChevronRight as ChevronRightIcon,
  X,
  Crop,
  Maximize2,
  RotateCw,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin as MapPinIcon,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAppTheme } from "../hooks/useTheme";

// ===================== FUNGSI FETCH DATA KELAS =====================
// Fungsi untuk fetch data kelas
export const fetchKelasData = async (token) => {
  try {
    const response = await fetch("http://localhost:8000/kelas", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching kelas data:", error);
    throw error;
  }
};

// Fungsi untuk mendapatkan kategori dari data kelas
export const getCategoriesFromKelas = (kelasData) => {
  const categories = ["Semua"];
  if (kelasData && Array.isArray(kelasData)) {
    kelasData.forEach(kelas => {
      if (kelas.kategori && !categories.includes(kelas.kategori)) {
        categories.push(kelas.kategori);
      }
    });
  }
  return categories;
};
// ===================== AKHIR FUNGSI FETCH DATA KELAS =====================

// Komponen Modal untuk Foto Kelas
const ImageModal = ({ 
  imageUrl, 
  altText, 
  isOpen, 
  onClose,
  isDarkMode 
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showOriginal, setShowOriginal] = useState(false);
  const modalRef = useRef(null);
  const imgRef = useRef(null);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setShowOriginal(false);
    }
  }, [isOpen]);

  // Handle klik di luar modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') onClose();
      if (e.key === '+') setZoom(prev => Math.min(prev + 0.1, 3));
      if (e.key === '-') setZoom(prev => Math.max(prev - 0.1, 0.5));
      if (e.key === 'r') setRotation(prev => (prev + 90) % 360);
      if (e.key === 'o') setShowOriginal(prev => !prev);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDarkMode, isOpen, onClose]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Handle drag untuk gambar yang di-zoom
  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return;
    const x = e.clientX - startPos.x;
    const y = e.clientY - startPos.y;
    setPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      isDarkMode ? 'bg-black/90' : 'bg-black/80'
    }`}>
      <div 
        ref={modalRef}
        className={`relative rounded-xl overflow-hidden shadow-2xl max-w-6xl w-full max-h-[90vh] ${
          isDarkMode ? 'bg-[#2A3025]' : 'bg-[#F9F9F9]'
        }`}
        style={{
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        {/* Header Modal */}
        <div className={`flex justify-between items-center p-4 border-b ${
          isDarkMode ? 'border-[#363D30] bg-[#1A1F16]' : 'border-[#ABB89D]/30 bg-[#ABB89D]/10'
        }`}>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#646B5E]'}`}>
              {altText}
            </h3>
            <span className={`text-xs px-2 py-1 rounded ${
              isDarkMode ? 'bg-[#363D30] text-[#D7FE51]' : 'bg-[#ABB89D]/20 text-[#646B5E]'
            }`}>
              {showOriginal ? 'Original' : `${Math.round(zoom * 100)}%`}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-20 transition-colors ${
              isDarkMode ? 'hover:bg-white text-white' : 'hover:bg-black text-[#646B5E]'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Konten Gambar */}
        <div 
          className="relative flex-1 overflow-hidden flex items-center justify-center p-4"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            minHeight: '400px',
            height: 'calc(90vh - 120px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {showOriginal ? (
            <img
              src={imageUrl}
              alt={altText}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
            />
          ) : (
            <div className="overflow-hidden w-full h-full flex items-center justify-center">
              <motion.img
                ref={imgRef}
                src={imageUrl}
                alt={altText}
                className="cursor-move"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transformOrigin: 'center center',
                  display: 'block',
                  margin: 'auto'
                }}
                onMouseDown={handleMouseDown}
                animate={{
                  scale: zoom
                }}
              />
            </div>
          )}
        </div>

        {/* Toolbar Kontrol */}
        <div className={`p-4 border-t ${
          isDarkMode ? 'border-[#363D30] bg-[#1A1F16]' : 'border-[#ABB89D]/30 bg-[#ABB89D]/10'
        }`}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-[#363D30] hover:bg-[#2A3025] disabled:opacity-50 text-[#D7FE51]' 
                    : 'bg-[#ABB89D]/20 hover:bg-[#ABB89D]/30 disabled:opacity-50 text-[#646B5E]'
                } transition-colors`}
                title="Zoom Out (-)"
              >
                <ZoomIn size={20} className="rotate-45" />
              </button>
              
              <div className="w-32">
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={zoom * 100}
                  onChange={(e) => setZoom(e.target.value / 100)}
                  className={`w-full ${isDarkMode ? 'accent-[#D7FE51]' : 'accent-[#646B5E]'}`}
                  title="Zoom Level"
                />
                <div className={`text-xs text-center mt-1 ${isDarkMode ? 'text-[#ABB89D]' : 'text-[#646B5E]/70'}`}>
                  {Math.round(zoom * 100)}%
                </div>
              </div>
              
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-[#363D30] hover:bg-[#2A3025] disabled:opacity-50 text-[#D7FE51]' 
                    : 'bg-[#ABB89D]/20 hover:bg-[#ABB89D]/30 disabled:opacity-50 text-[#646B5E]'
                } transition-colors`}
                title="Zoom In (+)"
              >
                <ZoomIn size={20} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRotate}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]' 
                    : 'bg-[#ABB89D]/20 hover:bg-[#ABB89D]/30 text-[#646B5E]'
                } transition-colors`}
                title="Rotate (R)"
              >
                <RotateCw size={20} />
              </button>
              
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`p-2 rounded-full ${
                  showOriginal
                    ? isDarkMode ? 'bg-[#D7FE51] text-[#1A1F16]' : 'bg-[#646B5E] text-white'
                    : isDarkMode ? 'bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]' : 'bg-[#ABB89D]/20 hover:bg-[#ABB89D]/30 text-[#646B5E]'
                } transition-colors`}
                title="Toggle Original (O)"
              >
                <Maximize2 size={20} />
              </button>
              
              <button
                onClick={handleReset}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]' 
                    : 'bg-[#ABB89D]/20 hover:bg-[#ABB89D]/30 text-[#646B5E]'
                } transition-colors`}
                title="Reset"
              >
                <Crop size={20} />
              </button>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className={`text-xs ${isDarkMode ? 'text-[#ABB89D]' : 'text-[#646B5E]/70'}`}>
              <span className="hidden md:inline">
                Shortcuts: [+] [-] [R] [O] [ESC]
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen Card untuk Kelas (versi user)
const KelasCardUser = ({ 
  kelas, 
  onDetailClick,
  onBeliClick,
  onImageClick,
  isDarkMode 
}) => {
  const [imageError, setImageError] = useState(false);
  const [tiketStatus, setTiketStatus] = useState({
    hasTiketKategori: false,
    allTiketActive: false,
    status: 'unknown'
  });

  // Fungsi untuk mendapatkan URL gambar yang aman
  const getImageUrl = () => {
    if (!kelas.foto) return "/default-image.png";
    
    if (kelas.foto.includes('?')) {
      return `http://localhost:8000/uploads/${kelas.foto}&t=${Date.now()}`;
    }
    return `http://localhost:8000/uploads/${kelas.foto}?t=${Date.now()}`;
  };

  // Format harga ke Rupiah
  const formatRupiah = (angka) => {
    if (!angka) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  // Fetch data tiket kategori untuk menentukan status
  useEffect(() => {
    const fetchTiketStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/kelas/${kelas.id}/tiket-kategori`);
        
        if (res.ok) {
          const tiketData = await res.json();
          const hasTiketKategori = tiketData && tiketData.length > 0;
          const activeTiket = tiketData.filter(tiket => 
            tiket.is_active === undefined ? true : tiket.is_active
          );
          const allTiketActive = activeTiket.length > 0;
          
          let status = 'unknown';
          if (!hasTiketKategori) {
            status = 'sold_out';
          } else if (allTiketActive) {
            status = 'available';
          } else {
            status = 'sold_out';
          }
          
          setTiketStatus({
            hasTiketKategori,
            allTiketActive,
            status
          });
        } else {
          setTiketStatus({
            hasTiketKategori: false,
            allTiketActive: false,
            status: 'unknown'
          });
        }
      } catch (error) {
        console.error("Error fetching tiket status:", error);
        setTiketStatus({
          hasTiketKategori: false,
          allTiketActive: false,
          status: 'unknown'
        });
      }
    };

    fetchTiketStatus();
  }, [kelas.id]);

  // Fungsi untuk menentukan badge status
  const getStatusBadge = () => {
    if (tiketStatus.status === 'available') {
      return {
        text: "Tersedia",
        icon: <CheckCircle size={10} />,
        color: isDarkMode ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-green-100 text-green-800 border-green-300",
        iconColor: isDarkMode ? "text-green-400" : "text-green-600"
      };
    } else if (tiketStatus.status === 'sold_out') {
      return {
        text: "Habis",
        icon: <XCircle size={10} />,
        color: isDarkMode ? "bg-red-900/30 text-red-400 border-red-700/50" : "bg-red-100 text-red-800 border-red-300",
        iconColor: isDarkMode ? "text-red-400" : "text-red-600"
      };
    } else {
      return {
        text: "Loading...",
        icon: null,
        color: isDarkMode ? "bg-[#363D30] text-[#ABB89D] border-[#363D30]" : "bg-gray-100 text-gray-800 border-gray-300",
        iconColor: ""
      };
    }
  };

  const statusBadge = getStatusBadge();

  // MODIFIKASI: Fungsi handleBeliClick dengan pengecekan link navigasi
  const handleBeliClick = (kelas) => {
    console.log("Tombol Beli diklik untuk kelas:", kelas);
    
    // Cek apakah ada link navigasi khusus yang diset admin
    if (kelas.link_navigasi && kelas.link_navigasi.trim() !== '') {
      console.log("Menggunakan link navigasi khusus:", kelas.link_navigasi);
      
      if (kelas.is_link_eksternal) {
        // Jika link eksternal, buka di tab baru
        window.open(kelas.link_navigasi, '_blank');
      } else {
        // Jika link internal, navigasi dengan React Router
        // Perlu mengimport navigate atau meneruskannya sebagai prop
        // Untuk sekarang kita akan menggunakan onBeliClick yang sudah ada
        // dan menambahkan logika di KelasListUser nanti
        onBeliClick(kelas.id, kelas.link_navigasi, false);
      }
    } else {
      // Jika tidak ada link khusus, navigasi default ke detail kelas
      console.log("Menggunakan navigasi default");
      onBeliClick(kelas.id, `/events/${kelas.id}`, true);
    }
  };

  return (
    <motion.div
      key={kelas.id}
      className={`rounded-lg shadow-md overflow-hidden flex-shrink-0 w-[calc(33.333%-0.833rem)] min-w-[320px] max-w-[400px] snap-center transition duration-300 hover:shadow-xl relative z-20 ${
        isDarkMode 
          ? "bg-[#2A3025] border border-[#363D30] hover:border-[#D7FE51]" 
          : "bg-[#F9F9F9] border border-[#ABB89D]/30 hover:border-[#646B5E]"
      }`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Badge Status di pojok kanan atas */}
      <div className="absolute top-3 left-3 z-30">
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border backdrop-blur-sm ${statusBadge.color}`}>
          {statusBadge.icon && <span className={statusBadge.iconColor}>{statusBadge.icon}</span>}
          <span>{statusBadge.text}</span>
        </div>
      </div>

      {/* Container flex untuk layout melebar */}
      <div className="flex h-[280px]">
        {/* Gambar Kelas - Lebar 40% dengan fixed height */}
        <div className="w-2/5 h-full relative overflow-hidden">
          <img
            src={getImageUrl()}
            alt={kelas.nama_kelas}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => onImageClick(getImageUrl(), kelas.nama_kelas)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-image.png";
              setImageError(true);
            }}
            style={{ 
              minHeight: '100%',
              maxHeight: '100%',
              objectFit: 'cover' 
            }}
          />
          
          {/* Zoom icon overlay */}
          <div className="absolute top-2 right-2 z-10">
            <div className={`p-1.5 rounded-full bg-black/60 text-white transition-opacity duration-300`}>
              <ZoomIn size={16} />
            </div>
          </div>
        </div>

        {/* Konten Card - Lebar 60% dengan flex-col */}
        <div className="w-3/5 p-4 flex flex-col">
          {/* Bagian atas: Informasi kelas */}
          <div className="flex-1">
            {/* Nama Kelas */}
            <h3 className={`text-base font-bold mb-4 line-clamp-2 transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-[#646B5E]"
            }`} title={kelas.nama_kelas}>
              {kelas.nama_kelas}
            </h3>

            {/* Detail Kelas Ringkas */}
            <div className="space-y-3 mb-3">
              {/* Harga Kelas */}
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? "bg-[#D7FE51]/20" : "bg-[#D7FE51]/30"
                }`}>
                  <DollarSign size={10} className={isDarkMode ? "text-[#D7FE51]" : "text-[#646B5E]"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold transition-colors duration-300 truncate ${
                    isDarkMode ? "text-[#D7FE51]" : "text-[#646B5E]"
                  }`}>
                    {formatRupiah(kelas.biaya)}
                  </p>
                  <p className={`text-[10px] transition-colors duration-300 ${
                    isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                  }`}>
                    Harga Tiket
                  </p>
                </div>
              </div>

              {/* Jadwal Kelas */}
              {kelas.jadwal && (
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isDarkMode ? "bg-[#D46B5E]/20" : "bg-[#D46B5E]/20"
                  }`}>
                    <Clock size={10} className={isDarkMode ? "text-[#D46B5E]" : "text-[#D46B5E]"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs transition-colors duration-300 line-clamp-2 ${
                      isDarkMode ? "text-[#D46B5E]" : "text-[#D46B5E]"
                    }`} title={kelas.jadwal}>
                      {kelas.jadwal}
                    </p>
                    <p className={`text-[10px] transition-colors duration-300 ${
                      isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                    }`}>
                      Waktu
                    </p>
                  </div>
                </div>
              )}

              {/* Ruangan Kelas */}
              {kelas.ruangan && (
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDarkMode ? "bg-[#ABB89D]/20" : "bg-[#ABB89D]/30"
                  }`}>
                    <MapPin size={10} className={isDarkMode ? "text-[#ABB89D]" : "text-[#ABB89D]" } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs transition-colors duration-300 truncate ${
                      isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"
                    }`} title={kelas.ruangan}>
                      {kelas.ruangan}
                    </p>
                    <p className={`text-[10px] transition-colors duration-300 ${
                      isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                    }`}>
                      Lokasi
                    </p>
                  </div>
                </div>
              )}

              {/* PERUBAHAN: TOMBOL "LIHAH SELENGKAPNYA" DIHAPUS */}
              {/* Tidak ada tombol "Lihat selengkapnya" di sini */}
            </div>

            {/* Total Peserta */}
            {kelas.total_peserta > 0 && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isDarkMode 
                  ? "bg-[#363D30] text-[#D7FE51]" 
                  : "bg-[#ABB89D]/20 text-[#646B5E]"
              }`}>
                <Users size={10} />
                <span>{kelas.total_peserta} peserta</span>
              </div>
            )}
          </div>

          {/* Bagian bawah: Tombol Aksi - DUA BUTTON (Detail dan Beli) */}
          <div className="flex gap-1.5 mt-auto pt-3 border-t border-gray-200 dark:border-[#363D30]/30">
            {/* Tombol Detail */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDetailClick(kelas.id)}
              className={`flex-1 py-1.5 text-[10px] rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-1 ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              }`}
              title="Lihat detail kelas"
            >
              <Calendar size={10} />
              <span className="truncate">Detail</span>
            </motion.button>

            {/* MODIFIKASI: Tombol Beli dengan logika link navigasi */}
            <motion.button
              whileHover={{ scale: tiketStatus.status === 'available' ? 1.05 : 1 }}
              whileTap={{ scale: tiketStatus.status === 'available' ? 0.95 : 1 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (tiketStatus.status === 'available') {
                  handleBeliClick(kelas); // Panggil fungsi yang sudah dimodifikasi
                }
              }}
              disabled={tiketStatus.status !== 'available'}
              className={`flex-1 py-1.5 text-[10px] rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-1 ${
                tiketStatus.status === 'available'
                  ? isDarkMode 
                    ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                    : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
                  : isDarkMode
                  ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={tiketStatus.status === 'available' ? "Beli kelas ini" : "Tiket tidak tersedia"}
            >
              <ShoppingCart size={10} />
              <span className="truncate">
                {tiketStatus.status === 'available' ? 'Beli' : 'Habis'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function KelasListUser({ kelasData, kategoriData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [hoveredKategori, setHoveredKategori] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalData, setImageModalData] = useState({ url: '', alt: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State untuk data footer kontak dari API
  const [footerKontakData, setFooterKontakData] = useState({
    email: "",
    phone: "",
    address: "",
    description: "",
    copyright: "",
    social_media: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: ""
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const scrollRefs = useRef({});
  const { isDarkMode } = useAppTheme();

  // === Enhanced Background Particles for Dark Mode ===
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!isDarkMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.4 + 0.3,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.05 + 0.02
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        const pulseFactor = Math.sin(p.pulse) * 0.2 + 0.8;
        p.pulse += p.pulseSpeed;
        
        ctx.save();
        ctx.globalAlpha = p.opacity * pulseFactor;
        ctx.fillStyle = "rgba(215, 254, 81, 0.5)";
        
        if (p.r > 2) {
          const gradient = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.r * 1.5
          );
          gradient.addColorStop(0, 'rgba(215, 254, 81, 0.8)');
          gradient.addColorStop(0.5, 'rgba(215, 254, 81, 0.3)');
          gradient.addColorStop(1, 'rgba(215, 254, 81, 0)');
          ctx.fillStyle = gradient;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulseFactor, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.x += p.dx;
        p.y += p.dy;
        
        if (p.x < -p.r || p.x > canvas.width + p.r) p.dx *= -1;
        if (p.y < -p.r || p.y > canvas.height + p.r) p.dy *= -1;
        
        p.x = Math.max(-p.r, Math.min(canvas.width + p.r, p.x));
        p.y = Math.max(-p.r, Math.min(canvas.height + p.r, p.y));
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDarkMode]);

  /** 🔹 Normalisasi kategori */
  const normalizeKategori = (k) => {
    if (!k && k !== "") return "";
    return typeof k === "string" ? k : k.nama || "";
  };

  /** 🔹 Ambil data kelas terbaru dari server */
  const refreshKelasData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("http://localhost:8000/kelas", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      return data;
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
      return [];
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  /** 🔹 Fetch data footer kontak dari API */
  const fetchFooterKontakData = async () => {
    try {
      const res = await fetch("http://localhost:8000/footer-kontak/public");
      
      if (res.ok) {
        const data = await res.json();
        
        if (data && Object.keys(data).length > 0) {
          setFooterKontakData({
            email: data.email || "info@gastronomirun.com",
            phone: data.phone || "(021) 1234-5678",
            address: data.address || "Jakarta Running Center, Indonesia",
            description: data.description || "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
            copyright: data.copyright || "© 2024 Gastronomi Run. All rights reserved.",
            social_media: data.social_media || {
              facebook: "https://facebook.com/gastronomirun",
              instagram: "https://instagram.com/gastronomirun",
              twitter: "https://twitter.com/gastronomirun",
              youtube: "https://youtube.com/gastronomirun"
            }
          });
        }
      } else {
        console.warn("Gagal mengambil data footer kontak, menggunakan data default");
        setFooterKontakData({
          email: "info@gastronomirun.com",
          phone: "(021) 1234-5678",
          address: "Jakarta Running Center, Indonesia",
          description: "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
          copyright: "© 2024 Gastronomi Run. All rights reserved.",
          social_media: {
            facebook: "https://facebook.com/gastronomirun",
            instagram: "https://instagram.com/gastronomirun",
            twitter: "https://twitter.com/gastronomirun",
            youtube: "https://youtube.com/gastronomirun"
          }
        });
      }
    } catch (error) {
      console.error("Error fetching footer kontak data:", error);
      setFooterKontakData({
        email: "info@gastronomirun.com",
        phone: "(021) 1234-5678",
        address: "Jakarta Running Center, Indonesia",
        description: "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
        copyright: "© 2024 Gastronomi Run. All rights reserved.",
        social_media: {
          facebook: "https://facebook.com/gastronomirun",
          instagram: "https://instagram.com/gastronomirun",
          twitter: "https://twitter.com/gastronomirun",
          youtube: "https://youtube.com/gastronomirun"
        }
      });
    }
  };

  /** 🔹 Refresh otomatis saat kembali ke halaman ini */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshKelasData();
      }
    };

    const handleFocus = () => {
      refreshKelasData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Fetch data footer saat komponen mount
    fetchFooterKontakData();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshKelasData]);

  /** 🔹 Fungsi untuk membuka modal gambar */
  const handleImageClick = (imageUrl, altText) => {
    setImageModalData({ url: imageUrl, alt: altText });
    setModalOpen(true);
  };

  /** 🔹 Fungsi untuk handle klik tombol Detail */
  const handleDetailClick = (id) => {
    // Navigasi ke DetailKelasUser.jsx
    navigate(`/events/${id}`);
  };

  /** MODIFIKASI: Fungsi untuk handle klik tombol Beli dengan dukungan link navigasi */
  const handleBeliClick = (id, customLink = null, scrollToTiket = false) => {
    console.log("Tombol Beli diklik untuk kelas ID:", id);
    
    // Cari data kelas berdasarkan ID dari kelasData prop
    const kelas = kelasData.find(k => k.id === id);
    
    if (customLink) {
      // Jika ada custom link yang dikirim dari KelasCardUser
      console.log("Menggunakan link custom:", customLink);
      
      // Periksa apakah link adalah eksternal atau internal
      // Catatan: Dalam implementasi nyata, kita perlu memeriksa properti is_link_eksternal
      // Untuk sekarang kita asumsikan semua custom link adalah internal
      
      navigate(customLink, {
        state: { 
          scrollToTiket: scrollToTiket,
          kelas: kelas
        }
      });
    } else if (kelas) {
      // Cek apakah ada link navigasi khusus yang diset admin
      if (kelas.link_navigasi && kelas.link_navigasi.trim() !== '') {
        console.log("Menggunakan link navigasi khusus dari data kelas:", kelas.link_navigasi);
        
        if (kelas.is_link_eksternal) {
          // Jika link eksternal, buka di tab baru
          window.open(kelas.link_navigasi, '_blank');
        } else {
          // Jika link internal, navigasi dengan React Router
          navigate(kelas.link_navigasi, {
            state: { 
              scrollToTiket: true,
              kelas: kelas
            }
          });
        }
      } else {
        // Jika tidak ada link khusus, navigasi default ke detail kelas
        console.log("Menggunakan navigasi default");
        navigate(`/events/${id}`, {
          state: { 
            scrollToTiket: true,
            kelas: kelas
          }
        });
      }
    } else {
      // Jika kelas tidak ditemukan, navigasi normal
      navigate(`/events/${id}`);
    }
  };

  /** 🔹 Filter kelas */
  const filteredKelasData = (kelasData || []).filter((kelas) => {
    const matchNama = kelas.nama_kelas
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchKategori = selectedKategori === "Semua" || 
      (kelas.kategori || "") === selectedKategori;

    return matchNama && matchKategori;
  });

  /** 🔹 Kelompokkan kelas */
  const grupKelas = (data) => {
    const grup = {};
    const kategoriList = (kategoriData || [])
      .map(normalizeKategori)
      .filter(Boolean);

    if (selectedKategori === "Semua") {
      kategoriList.forEach((k) => (grup[k] = []));
      data.forEach((kelas) => {
        const kb = kelas.kategori || "";
        if (kategoriList.includes(kb)) {
          grup[kb] = grup[kb] || [];
          grup[kb].push(kelas);
        }
      });
    } else {
      grup[selectedKategori] = [];
      data.forEach((kelas) => {
        if ((kelas.kategori || "") === selectedKategori) {
          grup[selectedKategori].push(kelas);
        }
      });
    }
    
    // Hapus kategori yang tidak punya kelas
    Object.keys(grup).forEach(kategori => {
      if (grup[kategori].length === 0 && kategori !== selectedKategori) {
        delete grup[kategori];
      }
    });
    
    return grup;
  };

  const kelasUntukTampil = grupKelas(filteredKelasData);

  /** 🔹 Scroll kiri/kanan */
  const scroll = (kategori, direction) => {
    const container = scrollRefs.current[kategori];
    if (container) {
      const scrollAmount = direction === "left" ? -350 : 350;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const kategoriListForSelect = (kategoriData || [])
    .map(normalizeKategori)
    .filter(Boolean);

  const totalKelas = kelasData?.length || 0;
  const totalKategori = kategoriListForSelect.length;

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${
      isDarkMode ? "bg-[#1A1F16]" : "bg-[#F9F9F9]"
    }`}>
      
      {/* Enhanced Background Particles untuk Dark Mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Modal untuk Gambar */}
      <ImageModal
        imageUrl={imageModalData.url}
        altText={imageModalData.alt}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* ================= HEADER ================= */}
      <div className={`shadow-lg transition-colors duration-300 relative z-10 ${
        isDarkMode 
          ? "bg-gradient-to-r from-[#1A1F16] via-[#2A3025] to-[#1A1F16]" 
          : "bg-gradient-to-r from-[#D46B5E] to-[#646B5E]"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-10 text-[#D7FE51]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <h1 className="text-3xl font-bold drop-shadow">
              Daftar Event
            </h1>
            {isRefreshing && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="text-sm">Memperbarui...</span>
              </div>
            )}
          </motion.div>
          <p className={`mb-6 ${
            isDarkMode ? "text-[#ABB89D]" : "text-white/90"
          }`}>
            Lihat daftar event yang tersedia. Klik gambar untuk melihat detail.
          </p>

          {/* Statistik Ringkas */}
          <div className="flex flex-wrap gap-6">
            <div className={`backdrop-blur-sm px-6 py-4 rounded-xl shadow-md ${
              isDarkMode 
                ? "bg-[#2A3025]/40 border border-[#363D30]/30" 
                : "bg-white/20 border border-white/30"
            }`}>
              <p className={`text-sm ${
                isDarkMode ? "text-[#D7FE51]" : "text-white"
              }`}>
                Total Event
              </p>
              <p className="text-2xl font-bold">{totalKelas}</p>
            </div>
            <div className={`backdrop-blur-sm px-6 py-4 rounded-xl shadow-md ${
              isDarkMode 
                ? "bg-[#363D30]/40 border border-[#2A3025]/30" 
                : "bg-white/20 border border-white/30"
            }`}>
              <p className={`text-sm ${
                isDarkMode ? "text-[#ABB89D]" : "text-white"
              }`}>
                Total Kategori
              </p>
              <p className="text-2xl font-bold">{totalKategori}</p>
            </div>
            {Object.entries(kelasUntukTampil).map(([kategori, list]) => (
              <div
                key={kategori}
                className={`backdrop-blur-sm px-6 py-4 rounded-xl shadow-md ${
                  isDarkMode 
                    ? "bg-[#1A1F16]/40 border border-[#363D30]/30" 
                    : "bg-white/20 border border-white/30"
                }`}
              >
                <p className={`text-sm capitalize ${
                  isDarkMode ? "text-[#D7FE51]" : "text-white"
                }`}>
                  {kategori}
                </p>
                <p className="text-2xl font-bold">{list.length}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className={`rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300 backdrop-blur-sm ${
          isDarkMode ? "bg-[#2A3025] border border-[#363D30]" : "bg-white border border-[#ABB89D]/30"
        }`}>
          <div className="flex gap-4 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama event..."
              className={`px-4 py-2 rounded-lg w-full md:w-80 border focus:outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-[#1A1F16] border-[#363D30] text-white placeholder-[#ABB89D] focus:ring-2 focus:ring-[#D7FE51]" 
                  : "border-[#ABB89D] text-[#646B5E] placeholder-[#646B5E]/70 focus:ring-2 focus:ring-[#D46B5E]"
              }`}
            />
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-[#1A1F16] border-[#363D30] text-white focus:ring-2 focus:ring-[#D7FE51]" 
                  : "border-[#ABB89D] text-[#646B5E] focus:ring-2 focus:ring-[#D46B5E]"
              }`}
            >
              <option value="Semua">Semua Kategori</option>
              {kategoriListForSelect.map((kat, i) => (
                <option key={i} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= LIST KELAS ================= */}
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {isRefreshing ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
                isDarkMode ? "border-[#D7FE51]" : "border-[#D46B5E]"
              }`}></div>
              <p className={`transition-colors duration-300 ${
                isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"
              }`}>
                Memperbarui data...
              </p>
            </div>
          </div>
        ) : Object.keys(kelasUntukTampil).length === 0 ? (
          <div className="text-center py-20">
            <p className={`text-lg mb-4 transition-colors duration-300 ${
              isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"
            }`}>
              {searchTerm || selectedKategori !== "Semua" 
                ? "Tidak ada event yang cocok dengan pencarian atau filter."
                : "Belum ada data event."}
            </p>
          </div>
        ) : (
          Object.entries(kelasUntukTampil).map(([kategori, kelasList]) => (
            <div
              key={kategori}
              className="mb-10 relative"
              onMouseEnter={() => setHoveredKategori(kategori)}
              onMouseLeave={() => setHoveredKategori(null)}
            >
              {/* ====== Header kategori ====== */}
              <div className="flex items-center gap-3 mb-3 relative">
                <h2 className={`text-lg font-semibold capitalize transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
                }`}>
                  {kategori}
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-[#363D30] text-[#D7FE51]" 
                    : "bg-[#ABB89D]/20 text-[#646B5E]"
                }`}>
                  {kelasList.length} event
                </span>
              </div>

              {/* ====== List kelas per kategori ====== */}
              {kelasList.length === 0 ? (
                <p className={`italic ml-8 transition-colors duration-300 ${
                  isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                }`}>
                  Event kosong
                </p>
              ) : (
                <>
                  {hoveredKategori === kategori && (
                    <button
                      onClick={() => scroll(kategori, "left")}
                      className={`absolute -left-12 top-1/2 transform -translate-y-1/2 z-30 hover:scale-110 transition-transform ${
                        isDarkMode ? "text-[#D7FE51]" : "text-[#D46B5E]"
                      }`}
                    >
                      <ChevronLeft size={40} strokeWidth={2} />
                    </button>
                  )}

                  {/* Container untuk card dengan 3 per baris */}
                  <div
                    ref={(el) => (scrollRefs.current[kategori] = el)}
                    className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth relative z-20"
                  >
                    {kelasList.map((kelas) => (
                      <KelasCardUser
                        key={kelas.id}
                        kelas={kelas}
                        onDetailClick={handleDetailClick}
                        onBeliClick={(id, customLink, scrollToTiket) => handleBeliClick(id, customLink, scrollToTiket)}
                        onImageClick={handleImageClick}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>

                  {hoveredKategori === kategori && (
                    <button
                      onClick={() => scroll(kategori, "right")}
                      className={`absolute -right-12 top-1/2 transform -translate-y-1/2 z-30 hover:scale-110 transition-transform ${
                        isDarkMode ? "text-[#D7FE51]" : "text-[#D46B5E]"
                      }`}
                    >
                      <ChevronRight size={40} strokeWidth={2} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* ================= FOOTER SECTION ================= */}
      <footer className={`pt-16 pb-8 px-6 border-t transition-colors duration-300 w-full ${
        isDarkMode ? "bg-[#0A0E0B]/90 backdrop-blur-sm border-[#1A1F16]" : "bg-white border-gray-200"
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Kontak Kami
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                  <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                    {footerKontakData.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                  <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                    {footerKontakData.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                  <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                    {footerKontakData.address}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Ikuti Kami
              </h3>
              <div className="flex gap-4">
                {Object.entries(footerKontakData.social_media || {}).map(([platform, url]) => (
                  url && (
                    <a 
                      key={platform}
                      href={url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode 
                          ? "bg-[#1A1F16] border border-[#363D30] text-[#ABB89D] hover:bg-[#D7FE51] hover:text-[#0A0E0B]" 
                          : "bg-gray-100 text-[#646B5E] hover:bg-[#D7FE51]"
                      }`}
                    >
                      {platform === 'facebook' && <Facebook size={20} />}
                      {platform === 'instagram' && <Instagram size={20} />}
                      {platform === 'twitter' && <Twitter size={20} />}
                      {platform === 'youtube' && <Youtube size={20} />}
                    </a>
                  )
                ))}
              </div>
            </div>
            
            <div>
              <h3 className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Tautan Cepat
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate("/")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Beranda
                </button>
                <button 
                  onClick={() => navigate("/tentang-kami")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Tentang Kami
                </button>
                <button 
                  onClick={() => navigate("/layanan")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Layanan
                </button>
                <button 
                  onClick={() => navigate("/partner")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Partner
                </button>
                <button 
                  onClick={() => navigate("/kontak")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Kontak
                </button>
              </div>
            </div>
          </div>
          
          <div className={`pt-8 border-t text-center ${
            isDarkMode ? "border-[#1A1F16]" : "border-gray-200"
          }`}>
            <div className="mb-4">
              <h4 className={`text-2xl font-black mb-2 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                GASTRONOMI RUN
              </h4>
              <p className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                Where Running Meets Culinary Adventure
              </p>
            </div>
            
            <p className={`text-sm mb-4 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
              {footerKontakData.description}
            </p>
            
            <div className={`flex flex-col md:flex-row justify-center items-center gap-4 mb-6 ${
              isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
            }`}>
              <span>{footerKontakData.copyright}</span>
              <span>|</span>
              <a 
                href="https://store.gastronomirun.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#D7FE51] transition-colors"
              >
                Visit our Store
              </a>
            </div>
            
            <p className={`text-xs ${isDarkMode ? "text-[#ABB89D]" : "text-gray-500"}`}>
              Diselenggarakan oleh <strong>GastronomiRun.com</strong> - Your Track, Your Victory
            </p>
          </div>
        </div>
      </footer>

      {/* ===== CSS Hide Scrollbar ===== */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .w-\[calc\(33\.333\%-0\.833rem\)\] {
          width: calc(33.333% - 1.25rem);
        }
        
        @media (min-width: 1024px) {
          .flex.gap-5.overflow-x-auto > .w-\[calc\(33\.333\%-0\.833rem\)\] {
            flex: 0 0 calc(33.333% - 1.25rem);
          }
        }
        
        @media (max-width: 1023px) and (min-width: 640px) {
          .flex.gap-5.overflow-x-auto > .w-\[calc\(33\.333\%-0\.833rem\)\] {
            flex: 0 0 calc(50% - 1.25rem);
          }
        }
        
        @media (max-width: 639px) {
          .flex.gap-5.overflow-x-auto > .w-\[calc\(33\.333\%-0\.833rem\)\] {
            flex: 0 0 100%;
            min-width: 320px;
          }
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          height: 6px;
          border-radius: 3px;
          background: ${isDarkMode ? '#363D30' : '#ABB89D/30'};
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${isDarkMode ? '#D7FE51' : '#D46B5E'};
          cursor: pointer;
          border: 2px solid ${isDarkMode ? '#1A1F16' : '#F9F9F9'};
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${isDarkMode ? '#D7FE51' : '#D46B5E'};
          cursor: pointer;
          border: 2px solid ${isDarkMode ? '#1A1F16' : '#F9F9F9'};
        }
        
        button span.truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
          max-width: 100%;
          min-width: 0;
        }
      `}</style>
    </div>
  );
}
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FolderPlus,
  MoreVertical,
  X,
  ZoomIn,
  Crop,
  Maximize2,
  RotateCw,
  Clock,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight as ChevronRightIcon,
  Edit,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppTheme } from "../hooks/useTheme";

const MySwal = withReactContent(Swal);

// Komponen Modal untuk Foto Kelas - SEDERHANAKAN tanpa framer-motion
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
  }, [isOpen, onClose]);

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
              <img
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

// Komponen Card untuk Kelas - TANPA FRAMER-MOTION
const KelasCard = ({ 
  kelas, 
  onDetailClick, 
  onEditClick, 
  onDeleteClick,
  onImageClick,
  isDarkMode 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tiketStatus, setTiketStatus] = useState({
    hasTiketKategori: false,
    allTiketActive: false,
    status: 'unknown' // 'available', 'sold_out', 'unknown'
  });

  // Fungsi untuk mendapatkan URL gambar yang aman
  const getImageUrl = () => {
    if (!kelas.foto) return "/default-image.png";
    
    // Jika sudah ada query string, tambahkan timestamp
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
          
          // Cek apakah ada tiket kategori
          const hasTiketKategori = tiketData && tiketData.length > 0;
          
          // Cek apakah semua tiket aktif
          const activeTiket = tiketData.filter(tiket => 
            tiket.is_active === undefined ? true : tiket.is_active
          );
          const allTiketActive = activeTiket.length > 0;
          
          // Tentukan status
          let status = 'unknown';
          if (!hasTiketKategori) {
            status = 'sold_out'; // Tidak ada tiket kategori sama sekali
          } else if (allTiketActive) {
            status = 'available'; // Ada tiket aktif
          } else {
            status = 'sold_out'; // Ada tiket tapi semua nonaktif
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

  return (
    <div
      key={kelas.id}
      className={`rounded-lg shadow-md overflow-hidden flex-shrink-0 w-[calc(33.333%-0.833rem)] min-w-[320px] max-w-[400px] snap-center transition-all duration-300 hover:shadow-xl relative z-20 ${
        isDarkMode 
          ? "bg-[#2A3025] border border-[#363D30] hover:border-[#D7FE51]" 
          : "bg-[#F9F9F9] border border-[#ABB89D]/30 hover:border-[#646B5E]"
      } ${isHovered ? 'transform -translate-y-1' : ''}`}
      style={{
        opacity: 0,
        transform: 'translateY(10px)',
        animation: 'fadeInUp 0.2s ease forwards'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge Status di pojok KIRI atas */}
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
            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
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

          {/* Bagian bawah: Tombol Aksi ADMIN - TIGA BUTTON (Detail, Edit, Hapus) */}
          <div className="flex gap-1.5 mt-auto pt-3 border-t border-gray-200 dark:border-[#363D30]/30">
            {/* Tombol Detail */}
            <button
              onClick={() => onDetailClick(kelas.id)}
              className={`flex-1 py-1.5 text-[10px] rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-1 hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              }`}
              title="Lihat detail kelas"
            >
              <Calendar size={10} />
              <span className="truncate">Detail</span>
            </button>
            
            {/* Tombol Edit */}
            <button
              onClick={() => onEditClick(kelas.id, kelas)}
              className={`flex-1 py-1.5 text-[10px] rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-1 hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              }`}
              title="Edit kelas"
            >
              <Edit size={10} />
              <span className="truncate">Edit</span>
            </button>
            
            {/* Tombol Hapus */}
            <button
              onClick={() => onDeleteClick(kelas.id, kelas.nama_kelas, kelas.kategori)}
              className={`flex-1 py-1.5 text-[10px] rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-1 hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              }`}
              title="Hapus kelas"
            >
              <X size={10} />
              <span className="truncate">Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function KelasList({
  kelasData,
  setKelasData,
  kategoriData,
  setKategoriData,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [hoveredKategori, setHoveredKategori] = useState(null);
  const [openMenuKategori, setOpenMenuKategori] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalData, setImageModalData] = useState({ url: '', alt: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // State untuk data footer kontak dari API - SAMA PERSIS DENGAN HOME.JSX
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
  const menuRefs = useRef({});
  const { themeClasses, isDarkMode } = useAppTheme();

  // Fetch data footer kontak dari endpoint public - SAMA PERSIS DENGAN HOME.JSX
  const fetchFooterKontakData = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/footer-kontak/public");
      
      if (res.ok) {
        const data = await res.json();
        console.log("Data footer kontak received:", data);
        
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
        // Gunakan data default
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
      // Gunakan data default jika error
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
  }, []);

  useEffect(() => {
    fetchFooterKontakData();
  }, [fetchFooterKontakData]);

  // Global error handler - DIPERBAIKI
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('Global error caught:', event.error);
      // Jangan tampilkan error dari framer-motion di UI
      if (event.error?.message?.includes('framer-motion') || 
          event.error?.message?.includes('keyframes')) {
        event.preventDefault();
        return;
      }
      
      setHasError(true);
      setErrorMessage(event.error?.message || 'Unknown error');
      event.preventDefault();
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Filter framer-motion errors
      if (event.reason?.message?.includes('framer-motion') ||
          event.reason?.message?.includes('keyframes')) {
        event.preventDefault();
        return;
      }
      
      setHasError(true);
      setErrorMessage(event.reason?.message || 'Unhandled promise rejection');
      event.preventDefault();
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

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
  const refreshKelasData = useCallback(async (force = false) => {
    if (isRefreshing && !force) return;
    
    setIsRefreshing(true);
    setHasError(false);
    
    try {
      console.log('🔄 Fetching kelas data...');
      const res = await fetch("http://localhost:8000/kelas", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log(`✅ Retrieved ${Array.isArray(data) ? data.length : 0} kelas`);
      
      if (Array.isArray(data)) {
        const dataWithTimestamp = data.map(kelas => ({
          ...kelas,
          foto: kelas.foto ? `${kelas.foto}?t=${Date.now()}` : kelas.foto
        }));
        
        if (typeof setKelasData === "function") {
          setKelasData(dataWithTimestamp);
        }
      } else {
        console.error("❌ Data kelas tidak valid:", data);
        if (typeof setKelasData === "function") {
          setKelasData([]);
        }
      }
    } catch (err) {
      console.error("❌ Gagal mengambil data kelas:", err);
      setHasError(true);
      setErrorMessage(err.message);
      
      if (typeof setKelasData === "function") {
        setKelasData([]);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [token, setKelasData, isRefreshing]);

  /** 🔹 Ambil kategori terbaru dari server */
  const refreshKategori = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/kategori", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store'
      });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof setKategoriData === "function") {
        setKategoriData(data);
      }
    } catch (err) {
      console.error("Gagal mengambil kategori:", err);
    }
  }, [token, setKategoriData]);

  /** 🔹 Fungsi refresh komplit */
  const refreshAllData = useCallback(async (force = false) => {
    console.log('🔄 Refreshing all data...');
    try {
      await Promise.allSettled([
        refreshKelasData(force),
        refreshKategori()
      ]);
      console.log('✅ All data refreshed');
    } catch (error) {
      console.error('❌ Error refreshing all data:', error);
    }
  }, [refreshKelasData, refreshKategori]);

  /** 🔹 Inisialisasi data saat komponen dimount */
  useEffect(() => {
    let mounted = true;
    
    const initData = async () => {
      if (!mounted) return;
      
      try {
        console.log('🚀 KelasList component mounted, fetching initial data');
        await refreshAllData(true);
      } catch (error) {
        console.error('❌ Initial data fetch failed:', error);
      }
    };
    
    initData();
    
    return () => {
      mounted = false;
      console.log('🧹 KelasList component cleanup');
    };
  }, []);

  /** 🔹 Refresh otomatis saat kembali ke halaman ini */
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔍 Window focused, refreshing data');
      refreshAllData();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshAllData]);

  /** 🔹 Refresh otomatis berdasarkan location state */
  useEffect(() => {
    const handleLocationState = async () => {
      const { state } = location;
      if (!state) return;

      console.log('📍 Location state changed:', state);

      // Debounce refresh
      const refreshTimeout = setTimeout(async () => {
        if (state.refreshNeeded || state.dataUpdated || state.kelasAdded || state.kelasEdited) {
          console.log('🔄 Refreshing due to location state');
          await refreshAllData(true);
          
          navigate(location.pathname, { 
            replace: true, 
            state: {} 
          });
        }

        if (state.updatedKelas) {
          console.log('📝 Updating individual kelas:', state.updatedKelas.id);
          setKelasData(prev => {
            if (!prev) return prev;
            
            return prev.map(k => 
              k.id === state.updatedKelas.id 
                ? { 
                    ...state.updatedKelas, 
                    foto: state.updatedKelas.foto 
                      ? `${state.updatedKelas.foto}?t=${Date.now()}` 
                      : null 
                  }
                : k
            );
          });
          
          navigate(location.pathname, { 
            replace: true, 
            state: {} 
          });
        }
      }, 300);

      return () => clearTimeout(refreshTimeout);
    };

    handleLocationState();
  }, [location.state, setKelasData, navigate, refreshAllData]);

  /** 🔹 Tutup menu kategori jika klik di luar */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        openMenuKategori &&
        menuRefs.current[openMenuKategori] &&
        !menuRefs.current[openMenuKategori].contains(e.target)
      ) {
        setOpenMenuKategori(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuKategori]);

  /** 🔹 Hapus kelas dengan refresh otomatis */
  const handleDeleteClick = (id, namaKelas, kategoriKelas) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: `Apakah Anda yakin ingin menghapus kelas "${namaKelas}"? Data yang dihapus tidak dapat dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: isDarkMode ? "#D7FE51" : "#D46B5E",
      cancelButtonColor: "#6c757d",
      background: isDarkMode ? '#1A1F16' : '#F9F9F9',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await fetch(`http://localhost:8000/kelas/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal menghapus kelas");

        await refreshAllData(true);

        MySwal.fire({
          title: "Berhasil!",
          text: `Kelas "${namaKelas}" berhasil dihapus.`,
          icon: "success",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      } catch (err) {
        MySwal.fire({
          title: "Gagal!",
          text: err.message || "Terjadi kesalahan.",
          icon: "error",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      }
    });
  };

  /** 🔹 Hapus kategori dengan refresh otomatis */
  const handleDeleteKategori = (namaKategori) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: `Apakah Anda yakin ingin menghapus kategori "${namaKategori}"? Data yang dihapus tidak dapat dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: isDarkMode ? "#D7FE51" : "#D46B5E",
      cancelButtonColor: "#6c757d",
      background: isDarkMode ? '#1A1F16' : '#F9F9F9',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await fetch(
          `http://localhost:8000/kategori/${encodeURIComponent(namaKategori)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Gagal menghapus kategori");

        await refreshAllData(true);
        
        if (selectedKategori === namaKategori) setSelectedKategori("Semua");

        MySwal.fire({
          title: "Berhasil!",
          text: `Kategori "${namaKategori}" berhasil dihapus.`,
          icon: "success",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      } catch (err) {
        MySwal.fire({
          title: "Gagal!",
          text: err.message || "Terjadi kesalahan.",
          icon: "error",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      }
    });
  };

  /** 🔹 Fungsi untuk membuka modal gambar */
  const handleImageClick = (imageUrl, altText) => {
    setImageModalData({ url: imageUrl, alt: altText });
    setModalOpen(true);
  };

  /** 🔹 Navigasi ke halaman edit */
  const handleEditClick = (id, kelasData) => {
    // Simpan state sebelum navigasi
    sessionStorage.setItem('kelasListState', JSON.stringify({
      searchTerm,
      selectedKategori,
      timestamp: Date.now()
    }));
    
    navigate(`/admin/edit-events/${id}`, { 
      state: { 
        kelas: kelasData,
        fromList: true
      } 
    });
  };

  /** 🔹 Detail click */
  const handleDetailClick = (id) => {
    navigate(`/admin/events/${id}`);
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

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setHasError(false);
                refreshAllData(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div
            className="flex items-center gap-3 mb-6"
            style={{
              opacity: 0,
              transform: 'translateY(-20px)',
              animation: 'fadeInDown 0.6s ease forwards'
            }}
          >
            
            <h1 className="text-3xl font-bold drop-shadow">
              Daftar Event (Admin)
            </h1>
            {isRefreshing && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="text-sm">Memperbarui...</span>
              </div>
            )}
          </div>
          <p className={`mb-6 ${
            isDarkMode ? "text-[#ABB89D]" : "text-white/90"
          }`}>
            Kelola event dan kategori dengan mudah. Klik gambar untuk melihat detail.
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

      {/* ================= SEARCH & ACTION ================= */}
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
          <div className="flex gap-3">
  
            {/* Tombol Tambah Event */}
            <button
              onClick={() => navigate("/admin/tambah-events", { state: { fromList: true } })}
              className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 font-medium hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? "bg-gradient-to-r from-[#D46B5E]/90 to-[#D46B5E]/70 hover:from-[#D46B5E]/80 hover:to-[#D46B5E]/60 border border-[#D46B5E]/40" 
                  : "bg-[#D46B5E] hover:bg-[#D46B5E]/90"
              }`}
            >
              <Plus size={20} /> Tambah Event
            </button>
            
            {/* Tombol Tambah Kategori */}
            <button
              onClick={() => navigate("/admin/kategori/tambah", { state: { fromList: true } })}
              className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 font-medium hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? "bg-gradient-to-r from-[#646B5E]/90 to-[#ABB89D]/70 hover:from-[#646B5E]/80 hover:to-[#ABB89D]/60 border border-[#646B5E]/40" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D]"
              }`}
            >
              <FolderPlus size={20} /> Tambah Kategori
            </button>
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
                : "Belum ada data event. Tambahkan event pertama Anda!"}
            </p>
            {!searchTerm && selectedKategori === "Semua" && (
              <button
                onClick={() => navigate("/admin/tambah-events", { state: { fromList: true } })}
                className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 font-medium mx-auto hover:scale-105 active:scale-95 ${
                  isDarkMode 
                    ? "bg-gradient-to-r from-[#D46B5E]/90 to-[#D46B5E]/70 hover:from-[#D46B5E]/80 hover:to-[#D46B5E]/60 border border-[#D46B5E]/40" 
                    : "bg-[#D46B5E] hover:bg-[#D46B5E]/90"
                }`}
              >
                <Plus size={20} /> Tambah Event Pertama
              </button>
            )}
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
              <div
                className="flex items-center gap-3 mb-3 relative"
                ref={(el) => (menuRefs.current[kategori] = el)}
              >
                <button
                  onClick={() =>
                    setOpenMenuKategori(
                      openMenuKategori === kategori ? null : kategori
                    )
                  }
                  className={`p-1 rounded transition-colors duration-300 ${
                    isDarkMode ? "hover:bg-[#363D30] text-[#ABB89D]" : "hover:bg-[#ABB89D]/20"
                  }`}
                >
                  <MoreVertical size={18} />
                </button>
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

                {openMenuKategori === kategori && (
                  <div className={`absolute top-6 left-0 rounded-md shadow-lg w-40 z-50 transition-colors duration-300 ${
                    isDarkMode 
                      ? "bg-[#2A3025] text-white border border-[#363D30]" 
                      : "bg-white text-[#646B5E] border border-[#ABB89D]/30"
                  }`}>
                    <button
                      onClick={() => {
                        setOpenMenuKategori(null);
                        handleDeleteKategori(kategori);
                      }}
                      className={`block w-full text-left px-4 py-2 transition-colors duration-300 ${
                        isDarkMode 
                          ? "hover:bg-[#363D30] text-[#D7FE51]" 
                          : "hover:bg-[#ABB89D]/20 text-[#646B5E]"
                      }`}
                    >
                      Hapus Kategori
                    </button>
                  </div>
                )}
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

                  <div
                    ref={(el) => (scrollRefs.current[kategori] = el)}
                    className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth relative z-20"
                  >
                    {kelasList.map((kelas) => (
                      <KelasCard
                        key={kelas.id}
                        kelas={kelas}
                        onDetailClick={handleDetailClick}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
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

      {/* Footer Section - DIMODIFIKASI untuk memanggil data dari API - SAMA PERSIS DENGAN HOME.JSX */}
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
                  onClick={() => navigate("/admin/dashboard")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Beranda
                </button>
                <button 
                  onClick={() => navigate("/admin/tentang-kami")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Tentang Kami
                </button>
                <button 
                  onClick={() => navigate("/admin/layanan")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Layanan
                </button>
                <button 
                  onClick={() => navigate("/admin/partner")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Partner
                </button>
                <button 
                  onClick={() => navigate("/admin/kontak")}
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

      {/* ===== CSS Animations ===== */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppTheme } from "../hooks/useTheme";

const MySwal = withReactContent(Swal);

// Komponen Modal untuk Foto Barang
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
      isDarkMode ? 'bg-black/80' : 'bg-black/70'
    }`}>
      <div 
        ref={modalRef}
        className={`relative rounded-xl overflow-hidden shadow-2xl max-w-6xl max-h-[90vh] w-full ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        {/* Header Modal */}
        <div className={`flex justify-between items-center p-4 border-b ${
          isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {altText}
            </h3>
            <span className={`text-xs px-2 py-1 rounded ${
              isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'
            }`}>
              {showOriginal ? 'Original' : `${Math.round(zoom * 100)}%`}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-20 transition-colors ${
              isDarkMode ? 'hover:bg-white text-white' : 'hover:bg-black text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Konten Gambar */}
        <div 
          className="relative flex-1 overflow-hidden flex items-center justify-center p-4 min-h-[400px]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {showOriginal ? (
            <img
              src={imageUrl}
              alt={altText}
              className="max-w-full max-h-[60vh] object-contain"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
            />
          ) : (
            <div className="overflow-hidden w-full h-full">
              <motion.img
                ref={imgRef}
                src={imageUrl}
                alt={altText}
                className="cursor-move"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  transformOrigin: 'center center'
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
          isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 disabled:opacity-50' 
                    : 'bg-gray-200 hover:bg-gray-300 disabled:opacity-50'
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
                  className="w-full"
                  title="Zoom Level"
                />
                <div className={`text-xs text-center mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {Math.round(zoom * 100)}%
                </div>
              </div>
              
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 disabled:opacity-50' 
                    : 'bg-gray-200 hover:bg-gray-300 disabled:opacity-50'
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
                    ? 'bg-slate-700 hover:bg-slate-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
                title="Rotate (R)"
              >
                <RotateCw size={20} />
              </button>
              
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`p-2 rounded-full ${
                  showOriginal
                    ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500 text-white'
                    : isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
                title="Toggle Original (O)"
              >
                <Maximize2 size={20} />
              </button>
              
              <button
                onClick={handleReset}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
                title="Reset"
              >
                <Crop size={20} />
              </button>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
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

// Komponen Card untuk Barang dengan Template Gambar Konsisten
const BarangCard = ({ 
  barang, 
  onDetailClick, 
  onEditClick, 
  onDeleteClick,
  onImageClick,
  isDarkMode 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fungsi untuk mendapatkan URL gambar yang aman
  const getImageUrl = () => {
    if (!barang.foto) return "/default-image.png";
    
    // Jika sudah ada query string, tambahkan timestamp
    if (barang.foto.includes('?')) {
      return `http://localhost:8000/uploads/${barang.foto}&t=${Date.now()}`;
    }
    return `http://localhost:8000/uploads/${barang.foto}?t=${Date.now()}`;
  };

  // Hitung stok tersedia
  const stokTersedia = barang.stok?.filter(unit => unit.status === 'Tersedia').length || 0;
  const totalStok = barang.stok?.length || 0;

  return (
    <motion.div
      className={`rounded-xl shadow-md overflow-hidden flex-shrink-0 w-48 snap-center transition-all duration-300 hover:scale-105 hover:shadow-xl backdrop-blur-sm group ${
        isDarkMode ? "bg-slate-800/80 border border-slate-700" : "bg-white"
      }`}
      whileHover={{ scale: 1.05 }}
    >
      {/* Container Gambar dengan Aspect Ratio 1:1 */}
      <div 
        className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-slate-700 cursor-pointer"
        onClick={() => onImageClick(getImageUrl(), barang.nama_barang)}
      >
        {/* Overlay hover effect */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-10" />
        
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-400 h-10 w-10"></div>
            </div>
          </div>
        )}
        
        {/* Gambar utama */}
        {!imageError ? (
          <img
            src={getImageUrl()}
            alt={barang.nama_barang}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            loading="lazy"
            style={{
              objectPosition: 'center center'
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className={`text-4xl mb-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              📷
            </div>
            <p className={`text-xs text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Gambar tidak tersedia
            </p>
          </div>
        )}
        
        {/* Zoom icon overlay */}
        <div className="absolute top-2 right-2 z-20">
          <div className={`p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
            <ZoomIn size={16} />
          </div>
        </div>
      </div>
      
      {/* Informasi Barang */}
      <div className="px-3 py-2 text-center">
        <p className={`text-lg font-semibold truncate transition-colors duration-300 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}>
          {barang.nama_barang}
        </p>
        
        {/* Badges Status */}
        <div className="flex justify-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
            totalStok === 0
              ? isDarkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
              : isDarkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
          }`}>
            Stok: {totalStok}
          </span>
          
          {stokTersedia > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
            }`}>
              Tersedia: {stokTersedia}
            </span>
          )}
        </div>
        
        {/* Kategori (jika ada) */}
        {barang.kategori && (
          <p className={`text-xs mt-1 truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            {barang.kategori}
          </p>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between px-2 pb-3">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDetailClick(barang.id)}
          className={`text-xs px-2 py-1 rounded-md transition-all duration-200 ${
            isDarkMode 
              ? "bg-blue-700 hover:bg-blue-600 text-blue-50 shadow-md" 
              : "bg-green-600 hover:bg-green-700 text-white shadow"
          }`}
        >
          Detail
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEditClick(barang.id, barang)}
          className={`text-xs px-2 py-1 rounded-md transition-all duration-200 ${
            isDarkMode 
              ? "bg-slate-600 hover:bg-slate-500 text-slate-100 shadow-md" 
              : "bg-yellow-500 hover:bg-yellow-600 text-white shadow"
          }`}
        >
          Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDeleteClick(barang.id, barang.nama_barang, barang.kategori)}
          className={`text-xs px-2 py-1 rounded-md transition-all duration-200 ${
            isDarkMode 
              ? "bg-red-700 hover:bg-red-600 text-red-100 shadow-md" 
              : "bg-red-500 hover:bg-red-600 text-white shadow"
          }`}
        >
          Hapus
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function InventarisList({
  barangData,
  setBarangData,
  kategoriData,
  setKategoriData,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [hoveredKategori, setHoveredKategori] = useState(null);
  const [openMenuKategori, setOpenMenuKategori] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalData, setImageModalData] = useState({ url: '', alt: '' });

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const scrollRefs = useRef({});
  const menuRefs = useRef({});
  const { themeClasses, isDarkMode } = useAppTheme();

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

    // Create more particles with varied properties for better visual effect
    for (let i = 0; i < 120; i++) { // Increased from 60 to 120 particles
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1, // Increased size range
        dx: (Math.random() - 0.5) * 0.5, // Increased speed
        dy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.4 + 0.3, // Varied opacity for depth
        pulse: Math.random() * Math.PI * 2, // For pulsing effect
        pulseSpeed: Math.random() * 0.05 + 0.02
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        // Pulsing effect for particles
        const pulseFactor = Math.sin(p.pulse) * 0.2 + 0.8;
        p.pulse += p.pulseSpeed;
        
        ctx.save();
        ctx.globalAlpha = p.opacity * pulseFactor;
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        
        // Create glow effect for larger particles
        if (p.r > 2) {
          const gradient = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.r * 1.5
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulseFactor, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Movement with boundary checking
        p.x += p.dx;
        p.y += p.dy;
        
        if (p.x < -p.r || p.x > canvas.width + p.r) p.dx *= -1;
        if (p.y < -p.r || p.y > canvas.height + p.r) p.dy *= -1;
        
        // Keep particles within bounds
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

  /** 🔹 Ambil kategori terbaru dari server */
  const refreshKategori = async () => {
    try {
      const res = await fetch("http://localhost:8000/kategori", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof setKategoriData === "function") {
        setKategoriData(data);
      } else {
        window.dispatchEvent(new Event("refreshKategori"));
      }
    } catch (err) {
      console.error("Gagal mengambil kategori:", err);
    }
  };

  useEffect(() => {
    if (typeof setKategoriData === "function") {
      refreshKategori();
    }
  }, []);

  /** 🔹 Update barang setelah edit */
  useEffect(() => {
    if (location.state?.updatedBarang) {
      setBarangData((prev) =>
        prev.map((b) =>
          b.id === location.state.updatedBarang.id
            ? {
                ...location.state.updatedBarang,
                foto: `${location.state.updatedBarang.foto}?t=${Date.now()}`,
              }
            : b
        )
      );
    }
  }, [location.state, setBarangData]);

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

  /** 🔹 Hapus barang */
  const handleDeleteClick = (id, namaBarang, kategoriBarang) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: `Apakah Anda yakin ingin menghapus barang "${namaBarang}"? Data yang dihapus tidak dapat dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      background: isDarkMode ? '#0f172a' : '#ffffff',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await fetch(`http://localhost:8000/barang/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal menghapus barang");

        setBarangData((prev) => {
          const newArr = prev.filter((item) => item.id !== id);
          const masihAda = newArr.some((b) => b.kategori === kategoriBarang);
          if (!masihAda) {
            refreshKategori();
          }
          return newArr;
        });

        MySwal.fire({
          title: "Berhasil!",
          text: `Barang "${namaBarang}" berhasil dihapus.`,
          icon: "success",
          background: isDarkMode ? '#0f172a' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      } catch (err) {
        MySwal.fire({
          title: "Gagal!",
          text: err.message || "Terjadi kesalahan.",
          icon: "error",
          background: isDarkMode ? '#0f172a' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      }
    });
  };

  /** 🔹 Hapus kategori */
  const handleDeleteKategori = (namaKategori) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: `Apakah Anda yakin ingin menghapus kategori "${namaKategori}"? Data yang dihapus tidak dapat dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      background: isDarkMode ? '#0f172a' : '#ffffff',
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

        await refreshKategori();
        if (selectedKategori === namaKategori) setSelectedKategori("Semua");

        MySwal.fire({
          title: "Berhasil!",
          text: `Kategori "${namaKategori}" berhasil dihapus.`,
          icon: "success",
          background: isDarkMode ? '#0f172a' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      } catch (err) {
        MySwal.fire({
          title: "Gagal!",
          text: err.message || "Terjadi kesalahan.",
          icon: "error",
          background: isDarkMode ? '#0f172a' : '#ffffff',
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

  /** 🔹 Filter barang */
  const filteredBarangData = (barangData || []).filter((barang) => {
    const matchNama = barang.nama_barang
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchKondisi =
      barang.stok &&
      barang.stok.some((unit) =>
        unit.kondisi.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchNama || matchKondisi;
  });

  /** 🔹 Kelompokkan barang */
  const grupBarang = (data) => {
    const grup = {};
    const kategoriList = (kategoriData || [])
      .map(normalizeKategori)
      .filter(Boolean);

    if (selectedKategori === "Semua") {
      kategoriList.forEach((k) => (grup[k] = []));
      data.forEach((barang) => {
        const kb = barang.kategori || "";
        grup[kb] = grup[kb] || [];
        grup[kb].push(barang);
      });
    } else {
      grup[selectedKategori] = [];
      data.forEach((barang) => {
        if ((barang.kategori || "") === selectedKategori) {
          grup[selectedKategori].push(barang);
        }
      });
    }
    return grup;
  };

  const barangUntukTampil = grupBarang(filteredBarangData);

  /** 🔹 Scroll kiri/kanan */
  const scroll = (kategori, direction) => {
    const container = scrollRefs.current[kategori];
    if (container) {
      const scrollAmount = direction === "left" ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const kategoriListForSelect = (kategoriData || [])
    .map(normalizeKategori)
    .filter(Boolean);

  const totalBarang = barangData?.length || 0;
  const totalKategori = kategoriListForSelect.length;

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${
      isDarkMode ? "bg-slate-900" : "bg-gray-100"
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
          ? "bg-gradient-to-r from-slate-900/90 via-blue-900/90 to-indigo-900/90" 
          : "bg-gradient-to-r from-orange-500 to-orange-400"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <img
              src="/Logo PT.png"
              alt="Logo"
              className="w-12 h-12 object-contain rounded-full shadow-md bg-white p-1"
            />
            <h1 className="text-3xl font-bold drop-shadow">
              Inventaris Barang
            </h1>
          </motion.div>
          <p className={`mb-6 ${
            isDarkMode ? "text-blue-100" : "text-orange-100"
          }`}>
            Kelola data barang dan kategori inventaris dengan mudah. Klik gambar untuk melihat detail.
          </p>

          {/* Statistik Ringkas */}
          <div className="flex flex-wrap gap-6">
            <div className={`backdrop-blur-sm px-6 py-4 rounded-xl shadow-md ${
              isDarkMode 
                ? "bg-blue-800/40 border border-blue-700/30" 
                : "bg-white bg-opacity-20"
            }`}>
              <p className={`text-sm ${
                isDarkMode ? "text-blue-200" : "text-orange-100"
              }`}>
                Total Barang
              </p>
              <p className="text-2xl font-bold">{totalBarang}</p>
            </div>
            <div className={`backdrop-blur-sm px-6 py-4 rounded-xl shadow-md ${
              isDarkMode 
                ? "bg-indigo-800/40 border border-indigo-700/30" 
                : "bg-white bg-opacity-20"
            }`}>
              <p className={`text-sm ${
                isDarkMode ? "text-indigo-200" : "text-orange-100"
              }`}>
                Total Kategori
              </p>
              <p className="text-2xl font-bold">{totalKategori}</p>
            </div>
            {Object.entries(barangUntukTampil).map(([kategori, list]) => (
              <div
                key={kategori}
                className={`backdrop-blur-sm px-6 py-4 rounded-xl shadow-md ${
                  isDarkMode 
                    ? "bg-slate-800/40 border border-slate-700/30" 
                    : "bg-white bg-opacity-20"
                }`}
              >
                <p className={`text-sm capitalize ${
                  isDarkMode ? "text-slate-200" : "text-orange-100"
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
          isDarkMode ? "bg-slate-800/80 border border-slate-700" : "bg-white"
        }`}>
          <div className="flex gap-4 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau kondisi barang..."
              className={`px-4 py-2 rounded-lg w-full md:w-80 border focus:outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500" 
                  : "border-gray-300 focus:ring-2 focus:ring-orange-400"
              }`}
            />
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500" 
                  : "border-gray-300 focus:ring-2 focus:ring-orange-400"
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
            {/* MODIFIKASI: Button Tambah Barang - Dark Mode */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/tambah")}
              className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 font-medium ${
                isDarkMode 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/30" 
                  : "bg-[#FF9913] hover:bg-[#e68a12]"
              }`}
            >
              <Plus size={20} /> Tambah Barang
            </motion.button>
            
            {/* MODIFIKASI: Button Tambah Kategori - Dark Mode */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/kategori/tambah")}
              className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 font-medium ${
                isDarkMode 
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 border border-violet-500/30" 
                  : "bg-[#0d6efd] hover:bg-[#0b5ed7]"
              }`}
            >
              <FolderPlus size={20} /> Tambah Kategori
            </motion.button>
          </div>
        </div>
      </div>

      {/* ================= LIST BARANG ================= */}
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {Object.keys(barangUntukTampil).length === 0 ? (
          <p className={`text-center transition-colors duration-300 ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}>
            Tidak ada barang yang cocok dengan pencarian atau filter.
          </p>
        ) : (
          Object.entries(barangUntukTampil).map(([kategori, barangList]) => (
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
                    isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-200"
                  }`}
                >
                  <MoreVertical size={18} />
                </button>
                <h2 className={`text-lg font-semibold capitalize transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  {kategori}
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-blue-900 text-blue-200" 
                    : "bg-orange-100 text-orange-800"
                }`}>
                  {barangList.length} barang
                </span>

                {openMenuKategori === kategori && (
                  <div className={`absolute top-6 left-0 rounded-md shadow-lg w-40 z-50 transition-colors duration-300 ${
                    isDarkMode 
                      ? "bg-slate-700 text-white border border-slate-600" 
                      : "bg-white text-black"
                  }`}>
                    <button
                      onClick={() => {
                        setOpenMenuKategori(null);
                        handleDeleteKategori(kategori);
                      }}
                      className={`block w-full text-left px-4 py-2 transition-colors duration-300 ${
                        isDarkMode 
                          ? "hover:bg-red-900 text-red-400" 
                          : "hover:bg-red-100 text-red-600"
                      }`}
                    >
                      Hapus Kategori
                    </button>
                  </div>
                )}
              </div>

              {/* ====== List barang per kategori ====== */}
              {barangList.length === 0 ? (
                <p className={`italic ml-8 transition-colors duration-300 ${
                  isDarkMode ? "text-slate-500" : "text-gray-400"
                }`}>
                  Barang kosong
                </p>
              ) : (
                <>
                  {hoveredKategori === kategori && (
                    <button
                      onClick={() => scroll(kategori, "left")}
                      className={`absolute -left-14 top-1/2 transform -translate-y-1/2 z-30 hover:scale-110 transition-transform ${
                        isDarkMode ? "text-blue-400" : "text-[#FF9913]"
                      }`}
                    >
                      <ChevronLeft size={60} strokeWidth={3} />
                    </button>
                  )}

                  <div
                    ref={(el) => (scrollRefs.current[kategori] = el)}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory scroll-smooth relative z-10"
                  >
                    {barangList.map((barang) => (
                      <BarangCard
                        key={barang.id}
                        barang={barang}
                        onDetailClick={(id) => navigate(`/barang/${id}`)}
                        onEditClick={(id, barangData) => navigate(`/edit/${id}`, { state: { barang: barangData } })}
                        onDeleteClick={handleDeleteClick}
                        onImageClick={handleImageClick}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>

                  {hoveredKategori === kategori && (
                    <button
                      onClick={() => scroll(kategori, "right")}
                      className={`absolute -right-14 top-1/2 transform -translate-y-1/2 z-30 hover:scale-110 transition-transform ${
                        isDarkMode ? "text-blue-400" : "text-[#FF9913]"
                      }`}
                    >
                      <ChevronRight size={60} strokeWidth={3} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* ===== CSS Hide Scrollbar ===== */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Custom scrollbar untuk input range */
        input[type="range"] {
          -webkit-appearance: none;
          height: 6px;
          border-radius: 3px;
          background: ${isDarkMode ? '#4b5563' : '#d1d5db'};
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${isDarkMode ? '#3b82f6' : '#FF9913'};
          cursor: pointer;
          border: 2px solid ${isDarkMode ? '#1e293b' : '#ffffff'};
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${isDarkMode ? '#3b82f6' : '#FF9913'};
          cursor: pointer;
          border: 2px solid ${isDarkMode ? '#1e293b' : '#ffffff'};
        }
      `}</style>
    </div>
  );
}
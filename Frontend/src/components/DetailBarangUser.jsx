import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import socketService from "../services/socket";
import { useAppTheme } from "../hooks/useTheme";

// Import Lucide React icons
import { 
  ArrowLeft, 
  Package, 
  Tag, 
  Calendar, 
  Hash, 
  FileText,
  Eye,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  X
} from "lucide-react";

export default function DetailBarangUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useAppTheme();

  const [barang, setBarang] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // === Enhanced Background Particles for Dark Mode ===
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Fungsi untuk inisialisasi particles
  const initParticles = () => {
    if (!isDarkMode || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Clear existing animation
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles - SAMA DENGAN LOGIN.JSX
    const particles = [];
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
    
    particlesRef.current = particles;

    const animate = () => {
      if (!canvasRef.current || !particlesRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((p) => {
        const pulseFactor = Math.sin(p.pulse) * 0.2 + 0.8;
        p.pulse += p.pulseSpeed;
        
        ctx.save();
        ctx.globalAlpha = p.opacity * pulseFactor;
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        
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
        
        p.x = Math.max(-p.r, Math.min(canvas.width + p.r, p.x));
        p.y = Math.max(-p.r, Math.min(canvas.height + p.r, p.y));
      });
      
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  };

  // Effect untuk particles - dijalankan setiap kali isDarkMode berubah atau komponen mount
  useEffect(() => {
    let cleanupResize;
    
    if (isDarkMode) {
      // Delay sedikit untuk memastikan canvas sudah ter-render
      const timer = setTimeout(() => {
        cleanupResize = initParticles();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        if (cleanupResize) cleanupResize();
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
      };
    } else {
      // Cleanup ketika light mode
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [isDarkMode]);

  // Effect tambahan untuk handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isDarkMode) {
        // Restart particles ketika tab menjadi visible lagi
        setTimeout(() => {
          initParticles();
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDarkMode]);

  // Setup Socket Connection
  useEffect(() => {
    socketService.connect();
    setSocketConnected(socketService.isConnected);

    socketService.on("unitStatusUpdated", handleUnitStatusUpdate);
    socketService.on("connect", () => setSocketConnected(true));
    socketService.on("disconnect", () => setSocketConnected(false));

    return () => {
      socketService.off("unitStatusUpdated", handleUnitStatusUpdate);
      socketService.off("connect");
      socketService.off("disconnect");
    };
  }, []);

  // Real-time update handler
  const handleUnitStatusUpdate = (data) => {
    if (data.itemId === parseInt(id) || data.barangId === parseInt(id)) {
      setBarang((prevBarang) => {
        if (!prevBarang || !prevBarang.stok) return prevBarang;

        const updatedStok = prevBarang.stok.map((unit) => {
          if (unit.kode === data.unitCode || unit.id === data.unitId) {
            return { ...unit, status: data.newStatus };
          }
          return unit;
        });

        return { ...prevBarang, stok: updatedStok };
      });

      if (data.newStatus === "Dipinjam" || data.newStatus === "Tersedia") {
        Swal.fire({
          title: "Status Diperbarui",
          text: `Unit ${data.unitCode} sekarang ${data.newStatus}`,
          icon: "info",
          timer: 3000,
          showConfirmButton: false,
          background: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      }
    }
  };

  // Fetch detail barang
  const fetchBarang = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8000/barang/${id}`, {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) throw new Error("Barang tidak ditemukan");

      const data = await res.json();
      setBarang(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, [id]);

  useEffect(() => {
    if (location.state?.updatedBarang) {
      setBarang(location.state.updatedBarang);
    }
  }, [location.state]);

  // Helper function untuk mendapatkan icon berdasarkan kondisi
  const getConditionIcon = (kondisi) => {
    switch (kondisi?.toLowerCase()) {
      case "baik":
        return <CheckCircle size={16} className="text-green-500" />;
      case "rusak ringan":
        return <AlertCircle size={16} className="text-yellow-500" />;
      case "rusak berat":
        return <XCircle size={16} className="text-red-500" />;
      case "perlu perbaikan":
        return <AlertCircle size={16} className="text-orange-500" />;
      case "hilang":
        return <XCircle size={16} className="text-purple-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  // Helper function untuk mendapatkan icon berdasarkan status
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "tersedia":
        return <CheckCircle size={16} className="text-green-500" />;
      case "dipinjam":
        return <Clock size={16} className="text-blue-500" />;
      case "menunggu":
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  // Function untuk membuka modal gambar
  const openImageModal = () => {
    setShowImageModal(true);
  };

  // Function untuk menutup modal gambar
  const closeImageModal = () => {
    setShowImageModal(false);
  };

  // Fungsi untuk mengecek apakah unit bisa dipinjam
  const canBorrowUnit = (unit) => {
    const allowedConditions = ["Baik", "Rusak Ringan"];
    const isConditionAllowed = allowedConditions.includes(unit.kondisi);
    const isStatusAvailable = unit.status === "Tersedia";
    
    return isConditionAllowed && isStatusAvailable;
  };

  // Pinjam unit → navigasi ke halaman pinjam
  const handlePinjamUnit = async (unit) => {
    if (!canBorrowUnit(unit)) {
      let errorMessage = "";
      
      if (!["Baik", "Rusak Ringan"].includes(unit.kondisi)) {
        errorMessage = `Unit ${unit.kode} dalam kondisi "${unit.kondisi}" dan tidak bisa dipinjam. Hanya unit dengan kondisi "Baik" atau "Rusak Ringan" yang dapat dipinjam.`;
      } else if (unit.status !== "Tersedia") {
        errorMessage = `Unit ${unit.kode} sedang ${unit.status.toLowerCase()}, pilih unit lain.`;
      }

      Swal.fire({
        title: "Tidak Bisa Dipinjam",
        text: errorMessage,
        icon: "warning",
        confirmButtonColor: "#f0ad4e",
        confirmButtonText: "OK",
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
      return;
    }

    const result = await Swal.fire({
      title: `<h2 class="text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}">Konfirmasi Peminjaman</h2>`,
      html: `<p class="mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Apakah Anda ingin meminjam <b>Unit ${unit.kode}</b>?</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Ya, lanjut",
      cancelButtonText: "Batal",
      background: isDarkMode ? '#1e293b' : '#ffffff',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
      customClass: {
        popup: `rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`,
      }
    });

    if (!result.isConfirmed) return;

    navigate(`/pinjam/${barang.id}`, {
      state: { unitKode: unit.kode },
    });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 relative ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}>
        {/* Canvas untuk particles di dark mode */}
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? 'border-blue-500' : 'border-blue-600'
          }`}></div>
          <p className={`text-lg ${
            isDarkMode ? "text-slate-300" : "text-gray-600"
          }`}>
            Memuat data barang...
          </p>
        </div>
      </div>
    );
  }

  if (error || !barang) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 relative ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}>
        {/* Canvas untuk particles di dark mode */}
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        <div className="text-center p-8 rounded-xl max-w-md relative z-10">
          <div className={`p-4 rounded-full mx-auto mb-4 ${
            isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
          }`}>
            <Package size={48} className={`mx-auto ${
              isDarkMode ? 'text-red-400' : 'text-red-500'
            }`} />
          </div>
          <p className={`text-lg font-medium mb-4 ${
            isDarkMode ? "text-red-400" : "text-red-600"
          }`}>
            {error || "Barang tidak ditemukan"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/barang")}
            className={`flex items-center gap-2 text-white px-6 py-3 rounded-lg ${
              isDarkMode 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <ArrowLeft size={20} />
            Kembali ke Daftar Barang
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-slate-900" : "bg-gray-50"} p-4 relative`}>
      {/* Canvas untuk particles di dark mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header - Diposisikan di tengah */}
        <div className="flex items-center justify-center mb-8 relative">
          {/* Tombol Kembali di kiri */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/barang")}
            className={`absolute left-0 flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDarkMode 
                ? "bg-slate-700 hover:bg-slate-600 text-white" 
                : "bg-white hover:bg-gray-100 text-gray-700 border"
            }`}
          >
            <ArrowLeft size={18} />
            Kembali
          </motion.button>

          {/* Judul di tengah */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Package size={24} className={
                isDarkMode ? "text-blue-400" : "text-blue-600"
              } />
            </div>
            <h1 className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              Detail Barang
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Image and Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Image */}
            <div className={`rounded-xl p-6 ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            } shadow-sm`}>
              {barang.foto ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer relative group"
                  onClick={openImageModal}
                >
                  <img
                    src={`http://localhost:8000/uploads/${barang.foto}`}
                    alt={barang.nama_barang}
                    className="w-full h-64 object-cover rounded-lg transition-all duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-image.png";
                    }}
                  />
                  {/* Overlay dengan icon Eye */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all duration-300">
                    <Eye 
                      size={32} 
                      className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" 
                    />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Klik untuk melihat foto
                  </div>
                </motion.div>
              ) : (
                <div className={`text-center p-8 rounded-lg border-2 border-dashed ${
                  isDarkMode ? 'border-slate-600 text-slate-400' : 'border-gray-300 text-gray-500'
                }`}>
                  <Package size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="italic">Tidak ada foto</p>
                </div>
              )}
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={`text-center p-3 rounded-lg ${
                  isDarkMode ? "bg-slate-700" : "bg-gray-100"
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}>Total Unit</p>
                  <p className={`text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>{barang.stok?.length || 0}</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  isDarkMode ? "bg-slate-700" : "bg-gray-100"
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}>Tersedia</p>
                  <p className={`text-xl font-bold ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}>
                    {barang.stok?.filter(unit => unit.status === "Tersedia").length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Details Card */}
            <div className={`rounded-xl p-6 ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            } shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}>
                <Info size={20} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />
                Informasi Barang
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}>Nama Barang</label>
                  <p className={`font-semibold mt-1 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>{barang.nama_barang || "-"}</p>
                </div>

                <div>
                  <label className={`text-sm font-medium ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}>Kategori</label>
                  <p className={`font-semibold mt-1 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>{barang.kategori || "-"}</p>
                </div>

                <div>
                  <label className={`text-sm font-medium ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}>Tahun Perolehan</label>
                  <p className={`font-semibold mt-1 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>{barang.tahun_perolehan || "-"}</p>
                </div>

                <div>
                  <label className={`text-sm font-medium ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}>Deskripsi</label>
                  <p className={`mt-1 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}>{barang.deskripsi || "Tidak ada deskripsi"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Unit List */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl p-6 ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            } shadow-sm`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  Daftar Unit Barang
                </h3>
                <div className={`px-4 py-2 rounded-lg text-sm ${
                  isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-600"
                }`}>
                  {barang.stok?.filter(unit => canBorrowUnit(unit)).length || 0} Unit Tersedia untuk Dipinjam
                </div>
              </div>

              {barang.stok && barang.stok.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${
                        isDarkMode ? "border-slate-700" : "border-gray-200"
                      }`}>
                        <th className={`px-4 py-3 text-left text-sm font-medium ${
                          isDarkMode ? "text-slate-400" : "text-gray-600"
                        }`}>Kode Unit</th>
                        <th className={`px-4 py-3 text-left text-sm font-medium ${
                          isDarkMode ? "text-slate-400" : "text-gray-600"
                        }`}>Kondisi</th>
                        <th className={`px-4 py-3 text-left text-sm font-medium ${
                          isDarkMode ? "text-slate-400" : "text-gray-600"
                        }`}>Status</th>
                        <th className={`px-4 py-3 text-right text-sm font-medium ${
                          isDarkMode ? "text-slate-400" : "text-gray-600"
                        }`}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barang.stok.map((unit, index) => {
                        const canBorrow = canBorrowUnit(unit);
                        
                        return (
                          <tr 
                            key={unit.kode || index} 
                            className={`border-b ${
                              isDarkMode 
                                ? "border-slate-700 hover:bg-slate-750" 
                                : "border-gray-200 hover:bg-gray-50"
                            } transition-colors`}
                          >
                            <td className={`px-4 py-3 font-medium ${
                              isDarkMode ? "text-white" : "text-gray-800"
                            }`}>
                              {unit.kode || `Unit #${index + 1}`}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getConditionIcon(unit.kondisi)}
                                <span className={`text-sm ${
                                  isDarkMode ? "text-slate-300" : "text-gray-700"
                                }`}>
                                  {unit.kondisi || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(unit.status)}
                                <span className={`text-sm ${
                                  isDarkMode ? "text-slate-300" : "text-gray-700"
                                }`}>
                                  {unit.status || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <motion.button
                                whileHover={{ scale: canBorrow ? 1.05 : 1 }}
                                whileTap={{ scale: canBorrow ? 0.95 : 1 }}
                                disabled={!canBorrow}
                                onClick={() => handlePinjamUnit(unit)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                  canBorrow
                                    ? isDarkMode 
                                      ? "bg-blue-600 hover:bg-blue-500 text-white" 
                                      : "bg-blue-600 hover:bg-blue-700 text-white"
                                    : isDarkMode
                                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                                title={
                                  canBorrow
                                    ? "Klik untuk meminjam unit ini"
                                    : !["Baik", "Rusak Ringan"].includes(unit.kondisi)
                                    ? `Kondisi "${unit.kondisi}" tidak bisa dipinjam`
                                    : unit.status !== "Tersedia"
                                    ? `Unit sedang ${unit.status.toLowerCase()}`
                                    : "Tidak bisa dipinjam"
                                }
                              >
                                {canBorrow ? "Pinjam" : "Tidak Tersedia"}
                              </motion.button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`text-center py-12 ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}>
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Belum ada unit barang terdaftar</p>
                </div>
              )}

              {/* Informasi tambahan tentang kondisi yang bisa dipinjam */}
              <div className={`mt-6 p-4 rounded-lg ${
                isDarkMode ? "bg-slate-700/50 border border-slate-600" : "bg-blue-50 border border-blue-200"
              }`}>
                <p className={`text-sm ${
                  isDarkMode ? "text-slate-300" : "text-blue-700"
                }`}>
                  💡 <strong>Informasi:</strong> Hanya unit dengan kondisi <strong>"Baik"</strong> atau <strong>"Rusak Ringan"</strong> yang dapat dipinjam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal untuk menampilkan gambar secara full */}
      <AnimatePresence>
        {showImageModal && barang.foto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tombol close */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeImageModal}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X size={24} />
              </motion.button>
              
              {/* Gambar */}
              <img
                src={`http://localhost:8000/uploads/${barang.foto}`}
                alt={barang.nama_barang}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-image.png";
                }}
              />
              
              {/* Caption */}
              <div className="text-center mt-4">
                <p className="text-white text-lg font-medium">{barang.nama_barang}</p>
                <p className="text-gray-400 text-sm">Klik di luar gambar untuk menutup</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
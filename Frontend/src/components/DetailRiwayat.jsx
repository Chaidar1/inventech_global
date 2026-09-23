import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Package,
  User,
  Calendar,
  FileText,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppTheme } from "../hooks/useTheme";
import axios from "axios";

export default function DetailRiwayat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isExiting, setIsExiting] = useState(false);
  const [data, setData] = useState(location.state?.data || null);
  const [pengembalian, setPengembalian] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(!location.state?.data);
  const { isDarkMode } = useAppTheme();

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

    // Initialize particles
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

  // Effect untuk particles
  useEffect(() => {
    let cleanupResize;
    
    if (isDarkMode) {
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
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [isDarkMode]);

  // Effect tambahan untuk handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isDarkMode) {
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

  useEffect(() => {
    // Jika data tidak ada di state, fetch dari API
    if (!data && id) {
      fetchData();
    } else if (data?.pengembalian) {
      setPengembalian(data.pengembalian);
    }
  }, [data, id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:8000/riwayat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      if (res.data.pengembalian) {
        setPengembalian(res.data.pengembalian);
      }
    } catch (err) {
      console.error("Gagal mengambil data detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/riwayat");
    }, 400);
  };

  // Fungsi normalisasi status
  const normalizeStatus = (status) => {
    if (!status) return "Unknown";
    const lowerStatus = status.toLowerCase();

    if (lowerStatus.includes("menunggu")) {
      if (lowerStatus.includes("pengembalian") || lowerStatus.includes("verifikasi")) {
        return "Menunggu Verifikasi Pengembalian";
      }
      return "Menunggu";
    }
    if (lowerStatus.includes("disetujui")) return "Disetujui";
    if (lowerStatus.includes("ditolak")) return "Ditolak";
    if (lowerStatus.includes("selesai")) return "Selesai";
    return status;
  };

  // Ambil URL gambar
  const getImageUrl = (fotoPath) => {
    if (!fotoPath) return null;
    let cleanPath = fotoPath.startsWith("uploads")
      ? fotoPath.replace(/^uploads[\\/]/, "")
      : fotoPath;
    cleanPath = cleanPath.replace(/\\/g, "/");
    return `http://localhost:8000/uploads/${encodeURIComponent(cleanPath)}`;
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = "none";
  };

  if (loading) {
    return (
      <motion.div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 relative ${
          isDarkMode ? "bg-slate-900" : "bg-gray-100"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Canvas untuk particles di dark mode */}
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="fixed inset-0 z-10 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        <p className={`text-lg font-medium relative z-20 ${
          isDarkMode ? "text-slate-400" : "text-gray-500"
        }`}>
          Memuat data...
        </p>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <motion.div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 relative ${
          isDarkMode ? "bg-slate-900" : "bg-gray-100"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Canvas untuk particles di dark mode */}
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="fixed inset-0 z-10 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        <p className={`text-lg font-medium relative z-20 ${
          isDarkMode ? "text-slate-400" : "text-gray-500"
        }`}>
          Data tidak ditemukan.
        </p>
      </motion.div>
    );
  }

  const normalizedStatus = normalizeStatus(data.status);
  const isReturned = data.dikembalikan;

  const statusConfig = {
    Menunggu: {
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-300",
    },
    Disetujui: {
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
    },
    Ditolak: {
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-300",
    },
    Selesai: {
      icon: CheckCircle,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
    },
    "Menunggu Verifikasi Pengembalian": {
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-300",
    },
  };

  const StatusIcon = statusConfig[normalizedStatus]?.icon || Clock;

  const peminjamanRows = [
    { 
      label: "User", 
      value: data.nama_peminjam || data.nama || "User",
      icon: User
    },
    { 
      label: "Kode Unit", 
      value: data.unit_kode || data.unit || "-",
      icon: Package
    },
    { 
      label: "Tanggal Pengajuan", 
      value: data.tanggal_pinjam || "-",
      icon: Calendar
    },
    { 
      label: "Tanggal Kembali", 
      value: data.tanggal_kembali || "-",
      icon: Calendar
    },
    { 
      label: "Nama Barang", 
      value: data.nama_barang || "-",
      icon: Package
    },
    { 
      label: "Kategori Barang", 
      value: data.kategori_barang || "-",
      icon: FileText
    },
    { 
      label: "Jumlah", 
      value: data.jumlah || "1",
      icon: FileText
    },
  ];

  const pengembalianRows = pengembalian
    ? [
        {
          label: "Tanggal Pengembalian",
          value: pengembalian.tanggal_pengembalian || "-",
          icon: Calendar
        },
        { 
          label: "Kondisi Barang", 
          value: pengembalian.kondisi_barang || "-",
          icon: Package
        },
        { 
          label: "Catatan", 
          value: pengembalian.catatan || "Tidak ada catatan",
          icon: FileText
        },
      ]
    : [];

  return (
    <motion.div
      className={`min-h-screen transition-colors duration-300 relative ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
      initial={{ opacity: 0, x: 50 }}
      animate={isExiting ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Enhanced Background Particles untuk Dark Mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-10 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Header */}
      <header
        className={`shadow-md relative z-20 ${
          isDarkMode
            ? "bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900"
            : "bg-gradient-to-r from-orange-500 to-orange-400"
        }`}
      >
        {/* Reduced overlay opacity untuk memperlihatkan particles */}
        {isDarkMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800/70 via-blue-900/60 to-indigo-900/70 z-0"></div>
        )}
        
        <div className="max-w-6xl mx-auto px-6 py-8 text-white flex items-center gap-4 relative z-20">
          <button
            onClick={handleExit}
            className={`p-2 rounded-full transition relative z-20 ${
              isDarkMode
                ? "bg-blue-800/40 hover:bg-blue-700/60"
                : "bg-white/30 hover:bg-white/40"
            }`}
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <ShieldCheck size={28} className="text-blue-300" />
              <div>
                <h1 className="text-2xl font-bold drop-shadow">Detail Riwayat</h1>
                <p className="opacity-80 text-sm">
                  Informasi lengkap pengajuan peminjaman
                </p>
              </div>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full relative z-20 ${
              statusConfig[normalizedStatus]?.bg
            }`}
          >
            <StatusIcon
              size={20}
              className={statusConfig[normalizedStatus]?.color}
            />
            <span
              className={`text-sm font-semibold ${
                statusConfig[normalizedStatus]?.text
              }`}
            >
              {normalizedStatus}
            </span>
          </div>
        </div>
      </header>

      {/* Konten */}
      <main className="max-w-6xl mx-auto px-6 -mt-6 relative z-20 space-y-8 pb-16">
        {/* Card Peminjaman */}
        <section
          className={`rounded-2xl shadow-lg border overflow-hidden relative z-20 ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-orange-200"
          }`}
        >
          <div
            className={`p-6 border-b ${
              isDarkMode ? "border-slate-700" : "border-orange-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold flex items-center gap-2 ${
                isDarkMode ? "text-blue-400" : "text-orange-600"
              }`}
            >
              <FileText size={20} />
              📋 Data Peminjaman
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {peminjamanRows.map((row, i) => (
                <div key={i}>
                  <p
                    className={`text-sm font-semibold flex items-center gap-2 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    <row.icon size={16} />
                    {row.label}
                  </p>
                  <div
                    className={`p-3 rounded-lg border mt-1 ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-slate-200"
                        : "bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                  >
                    {row.value}
                  </div>
                </div>
              ))}
              
              {/* Keperluan - Full Width */}
              <div className="md:col-span-2">
                <p
                  className={`text-sm font-semibold flex items-center gap-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  <FileText size={16} />
                  Keperluan
                </p>
                <div
                  className={`p-3 rounded-lg border mt-1 ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-200"
                      : "bg-gray-50 border-gray-200 text-gray-800"
                  }`}
                >
                  {data.keperluan || "-"}
                </div>
              </div>

              {/* Alasan Penolakan jika status Ditolak */}
              {normalizedStatus === "Ditolak" && data.alasan_penolakan && (
                <div className="md:col-span-2 mt-4">
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? "border-red-800 bg-red-900/20" 
                      : "border-red-200 bg-red-50"
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`mt-0.5 flex-shrink-0 ${
                        isDarkMode ? "text-red-400" : "text-red-500"
                      }`} size={20} />
                      <div>
                        <p className={`font-semibold mb-1 ${
                          isDarkMode ? "text-red-300" : "text-red-700"
                        }`}>
                          Alasan Penolakan
                        </p>
                        <p className={`text-sm ${
                          isDarkMode ? "text-red-400" : "text-red-600"
                        }`}>
                          {data.alasan_penolakan}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Card Pengembalian */}
        {pengembalian && (
          <section
            className={`rounded-2xl shadow-lg border overflow-hidden relative z-20 ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-orange-200"
            }`}
          >
            <div
              className={`p-6 border-b ${
                isDarkMode ? "border-slate-700" : "border-orange-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold flex items-center gap-2 ${
                  isDarkMode ? "text-blue-400" : "text-orange-600"
                }`}
              >
                <Package size={20} />
                📦 Data Pengembalian
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {pengembalianRows.map((row, i) => (
                  <div key={i}>
                    <p
                      className={`text-sm font-semibold flex items-center gap-2 ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}
                    >
                      <row.icon size={16} />
                      {row.label}
                    </p>
                    <div
                      className={`p-3 rounded-lg border mt-1 ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-slate-200"
                          : "bg-gray-50 border-gray-200 text-gray-800"
                      }`}
                    >
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Foto Bukti */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p
                    className={`text-lg font-semibold flex items-center gap-2 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    <Download size={20} />
                    🖼️ Foto Bukti Pengembalian
                  </p>
                  {pengembalian.foto && (
                    <a
                      href={getImageUrl(pengembalian.foto)}
                      download
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow transition relative z-20"
                    >
                      <Download size={16} /> Download
                    </a>
                  )}
                </div>

                {pengembalian.foto ? (
                  <div className="flex justify-center">
                    <div
                      className={`p-4 rounded-xl border max-w-2xl w-full relative z-20 ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {!imageError ? (
                        <img
                          src={getImageUrl(pengembalian.foto)}
                          alt="Bukti Pengembalian"
                          onError={handleImageError}
                          loading="lazy"
                          className="rounded-lg shadow-md max-h-96 w-full object-contain transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div
                          className={`text-center py-12 ${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          <div className="text-4xl mb-2">📷</div>
                          <p>Gambar tidak dapat dimuat</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-center py-12 ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    <div className="text-4xl mb-2">📸</div>
                    <p>Tidak ada foto bukti pengembalian</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Info jika status menunggu verifikasi tapi belum ada data pengembalian */}
        {normalizedStatus === "Menunggu Verifikasi Pengembalian" && !pengembalian && (
          <section
            className={`rounded-2xl shadow-lg border overflow-hidden relative z-20 ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-orange-200"
            }`}
          >
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? "text-slate-300" : "text-gray-700"
              }`}>
                Menunggu Verifikasi Pengembalian
              </h3>
              <p className={`${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>
                Barang sudah dikembalikan dan sedang menunggu verifikasi dari admin.
              </p>
            </div>
          </section>
        )}
      </main>
    </motion.div>
  );
}
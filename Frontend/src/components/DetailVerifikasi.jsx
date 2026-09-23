import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  User,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppTheme } from "../hooks/useTheme";

export default function DetailVerifikasi() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useAppTheme();
  const [isExiting, setIsExiting] = useState(false);
  const [pengembalian, setPengembalian] = useState(null);
  const [imageError, setImageError] = useState(false);

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

  const data = location.state?.data;

  useEffect(() => {
    if (data?.pengembalian) {
      setPengembalian(data.pengembalian);
      setImageError(false);
    }
  }, [data]);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => navigate("/verifikasi"), 400);
  };

  const handleTandaiSelesai = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/verifikasi/${data.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "Selesai",
            barang_id: data.barang_id,
            unit_kode: data.unit || data.unit_kode || data.assigned_units?.[0],
          }),
        }
      );

      if (!response.ok) throw new Error("Gagal update status");

      alert("Peminjaman berhasil ditandai selesai.");
      handleExit();
    } catch (err) {
      console.error(err);
      alert("Gagal menandai selesai.");
    }
  };

  const getImageUrl = (fotoPath) => {
    if (!fotoPath) return null;
    let cleanPath = fotoPath.startsWith("uploads")
      ? fotoPath.replace(/^uploads[\\/]/, "")
      : fotoPath;
    cleanPath = cleanPath.replace(/\\/g, "/");
    return `http://localhost:8000/uploads/${encodeURIComponent(cleanPath)}`;
  };

  // Fungsi untuk mendapatkan URL foto profil
  const getProfilePictureUrl = (filename) => {
    if (!filename) return null;
    return `http://localhost:8000/uploads/profile_pictures/${filename}`;
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = "none";
  };

  const getDisplayName = (item) => {
    const name = item.nama_lengkap || item.nama_peminjam;
    if (!name || name.trim() === "") return <em>Tidak diketahui</em>;
    return name;
  };

  if (!data) {
    return (
      <motion.div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900 text-slate-400" : "bg-gray-50 text-gray-500"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Data tidak ditemukan.
      </motion.div>
    );
  }

  // Konfigurasi warna dan ikon status
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
      color: "text-blue-600",
      bg: "bg-blue-200 dark:bg-blue-900/40",
      text: "text-blue-800 dark:text-blue-200",
    },
    "Menunggu Verifikasi Pengembalian": {
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-300",
    },
  };

  const StatusIcon = statusConfig[data.status]?.icon || Clock;

  // Komponen untuk menampilkan foto profil user
  const UserProfileSection = ({ userData }) => {
    const displayName = getDisplayName(userData);
    
    return (
      <div className={`p-4 rounded-xl border ${
        isDarkMode 
          ? "bg-slate-700 border-slate-600" 
          : "bg-gray-50 border-gray-200"
      }`}>
        <div className="flex items-center gap-4">
          {/* Foto Profil */}
          <div className="flex-shrink-0">
            {userData.foto_profil ? (
              <img
                src={getProfilePictureUrl(userData.foto_profil)}
                alt={`Foto ${displayName}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow-md"
                onError={(e) => {
                  console.error("Error loading profile image:", userData.foto_profil);
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                isDarkMode ? "border-slate-600 bg-slate-800" : "border-gray-300 bg-gray-100"
              }`}>
                <User size={24} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
              </div>
            )}
          </div>
          
          {/* Informasi User */}
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${
              isDarkMode ? "text-slate-200" : "text-gray-800"
            }`}>
              {displayName}
            </h3>
            {userData.username && (
              <p className={`text-sm ${
                isDarkMode ? "text-slate-400" : "text-gray-600"
              }`}>
                @{userData.username}
              </p>
            )}
            {userData.email && (
              <p className={`text-sm ${
                isDarkMode ? "text-slate-400" : "text-gray-600"
              }`}>
                📧 {userData.email}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Data peminjaman rows - TAMBAH ALASAN PENOLAKAN
  const peminjamanRows = [
    { label: "ID Peminjaman", value: data.id },
    { label: "User", value: getDisplayName(data) },
    { label: "Tanggal Pengajuan", value: data.tanggal_pinjam },
    { label: "Tanggal Kembali", value: data.tanggal_kembali },
    { label: "Nama Barang", value: data.nama_barang },
    { label: "Kategori Barang", value: data.kategori_barang },
    {
      label: "Kode Unit",
      value: data.unit || data.unit_kode || data.assigned_units?.[0] || "-",
    },
    { label: "Keperluan", value: data.keperluan || "-" },
    {
      label: "Status",
      value: (
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
          statusConfig[data.status]?.bg
        }`}>
          <StatusIcon
            size={18}
            className={statusConfig[data.status]?.color}
          />
          <span
            className={`text-sm font-semibold ${
              statusConfig[data.status]?.text
            }`}
          >
            {data.status}
          </span>
        </div>
      ),
    },
  ];

  const pengembalianRows = pengembalian
    ? [
        {
          label: "Tanggal Pengembalian",
          value: pengembalian.tanggal_pengembalian,
        },
        { label: "Kondisi Barang", value: pengembalian.kondisi_barang },
        { label: "Catatan", value: pengembalian.catatan || "Tidak ada catatan" },
      ]
    : [];

  return (
    <motion.div
      className={`min-h-screen relative ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      } transition-colors`}
      initial={{ opacity: 0, x: 50 }}
      animate={isExiting ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Canvas untuk particles di dark mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Header */}
      <header
        className={`shadow-md relative z-10 ${
          isDarkMode
            ? "bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900"
            : "bg-gradient-to-r from-orange-500 to-orange-400"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 text-white flex items-center gap-4">
          <button
            onClick={handleExit}
            className={`p-2 rounded-full ${
              isDarkMode
                ? "bg-blue-800/40 hover:bg-blue-700/60"
                : "bg-white/30 hover:bg-white/40"
            } transition`}
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold drop-shadow">Detail Verifikasi</h1>
            <p className="opacity-80 text-sm">
              Informasi lengkap pengajuan peminjaman
            </p>
          </div>
        </div>
      </header>

      {/* Konten */}
      <main className="max-w-6xl mx-auto px-6 -mt-6 relative z-10 space-y-8 pb-16">
        {/* Card Informasi User dengan Foto Profil */}
        <section
          className={`rounded-2xl shadow-lg border overflow-hidden backdrop-blur-sm ${
            isDarkMode
              ? "bg-slate-800/80 border-slate-700"
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
              <User className="text-blue-500" size={24} />
              Informasi User
            </h2>
            <p className={`text-sm mt-1 ${
              isDarkMode ? "text-slate-400" : "text-gray-600"
            }`}>
              Data lengkap pengguna yang melakukan peminjaman
            </p>
          </div>

          <div className="p-6">
            <UserProfileSection userData={data} />
          </div>
        </section>

        {/* Card Peminjaman */}
        <section
          className={`rounded-2xl shadow-lg border overflow-hidden backdrop-blur-sm ${
            isDarkMode
              ? "bg-slate-800/80 border-slate-700"
              : "bg-white border-orange-200"
          }`}
        >
          <div
            className={`p-6 border-b ${
              isDarkMode ? "border-slate-700" : "border-orange-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? "text-blue-400" : "text-orange-600"
              }`}
            >
              📋 Data Peminjaman
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {peminjamanRows.map((row, i) => (
                <div key={i}>
                  <p
                    className={`text-sm font-semibold ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
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

            {/* Tampilkan Alasan Penolakan jika status Ditolak */}
            {data.status === "Ditolak" && data.alasan_penolakan && (
              <div className="mt-6 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-300 mb-1">
                      Alasan Penolakan
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {data.alasan_penolakan}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.status === "Menunggu Verifikasi Pengembalian" && (
              <div className="mt-8">
                <button
                  onClick={handleTandaiSelesai}
                  className="flex items-center gap-2 px-6 py-3 text-white rounded-lg bg-green-600 hover:bg-green-700 shadow-md transition"
                >
                  <CheckCircle size={20} />
                  Verifikasi & Tandai Selesai
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Card Pengembalian */}
        {pengembalian && (
          <section
            className={`rounded-2xl shadow-lg border overflow-hidden backdrop-blur-sm ${
              isDarkMode
                ? "bg-slate-800/80 border-slate-700"
                : "bg-white border-orange-200"
            }`}
          >
            <div
              className={`p-6 border-b ${
                isDarkMode ? "border-slate-700" : "border-orange-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-blue-400" : "text-orange-600"
                }`}
              >
                📦 Data Pengembalian
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {pengembalianRows.map((row, i) => (
                  <div key={i}>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}
                    >
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
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    🖼️ Foto Bukti Pengembalian
                  </p>
                  {pengembalian.foto && (
                    <a
                      href={getImageUrl(pengembalian.foto)}
                      download
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow transition"
                    >
                      <Download size={16} /> Download
                    </a>
                  )}
                </div>

                {pengembalian.foto ? (
                  <div className="flex justify-center">
                    <div
                      className={`p-4 rounded-xl border max-w-2xl w-full ${
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
      </main>
    </motion.div>
  );
}
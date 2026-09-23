import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  Check,
  X,
  Clock,
  RotateCcw,
  ShieldCheck,
  Package,
  Send,
  Truck,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";

export default function Riwayat() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/riwayat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);

      const approved = res.data.filter((item) => item.status === "Disetujui");
      localStorage.setItem("approvedItems", JSON.stringify(approved));
    } catch (err) {
      console.error("Gagal ambil data riwayat:", err);
    }
  };

  // Fungsi normalisasi status untuk konsistensi
  const normalizeStatus = (status) => {
    if (!status) return "Unknown";
    const lowerStatus = status.toLowerCase();

    if (
      lowerStatus.includes("menunggu") ||
      lowerStatus.includes("memunggu") ||
      lowerStatus.includes("memanggu")
    ) {
      if (
        lowerStatus.includes("pengembalian") ||
        lowerStatus.includes("verifikasi")
      ) {
        return "Menunggu Verifikasi Pengembalian";
      }
      return "Menunggu";
    }

    if (lowerStatus.includes("disetujui") || lowerStatus.includes("disetujul")) {
      return "Disetujui";
    }

    if (lowerStatus.includes("ditolak")) {
      return "Ditolak";
    }

    if (lowerStatus.includes("selesai")) {
      return "Selesai";
    }

    return status;
  };

  const filteredData = data.filter((item) => {
    const normalizedStatus = normalizeStatus(item.status);
    const matchSearch =
      (item.unit_kode?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.keperluan?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.nama_barang?.toLowerCase() || "").includes(search.toLowerCase());

    const matchStatus = filterStatus ? normalizedStatus === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const normalizedStatus = normalizeStatus(status);
    
    switch (normalizedStatus) {
      case "Menunggu":
        return {
          bg: isDarkMode
            ? "bg-yellow-900/50 border border-yellow-700"
            : "bg-yellow-100 border border-yellow-200",
          text: isDarkMode ? "text-yellow-300" : "text-yellow-700",
          icon: Clock,
        };
      case "Disetujui":
        return {
          bg: isDarkMode
            ? "bg-green-900/50 border border-green-700"
            : "bg-green-100 border border-green-200",
          text: isDarkMode ? "text-green-300" : "text-green-700",
          icon: Check,
        };
      case "Ditolak":
        return {
          bg: isDarkMode
            ? "bg-red-900/50 border border-red-700"
            : "bg-red-100 border border-red-200",
          text: isDarkMode ? "text-red-300" : "text-red-700",
          icon: X,
        };
      case "Selesai":
        return {
          bg: isDarkMode
            ? "bg-blue-900/50 border border-blue-700"
            : "bg-blue-100 border border-blue-200",
          text: isDarkMode ? "text-blue-300" : "text-blue-700",
          icon: CheckCircle,
        };
      case "Menunggu Verifikasi Pengembalian":
        return {
          bg: isDarkMode
            ? "bg-purple-900/50 border border-purple-700"
            : "bg-purple-100 border border-purple-200",
          text: isDarkMode ? "text-purple-300" : "text-purple-700",
          icon: Truck,
        };
      default:
        return {
          bg: isDarkMode
            ? "bg-gray-900/50 border border-gray-700"
            : "bg-gray-100 border border-gray-200",
          text: isDarkMode ? "text-gray-300" : "text-gray-700",
          icon: Clock,
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDisplayBarang = (item) => item.unit_kode || item.nama_barang || "Barang";

  // Fungsi untuk mendapatkan status display yang user-friendly
  const getStatusDisplay = (item) => {
    const normalizedStatus = normalizeStatus(item.status);
    const isReturned = item.dikembalikan;
    
    if (normalizedStatus === "Disetujui" && isReturned) {
      return "Menunggu Verifikasi Pengembalian";
    }
    
    return normalizedStatus;
  };

  return (
    <div
      className={`p-6 min-h-screen transition-colors duration-300 relative ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Canvas untuk particles di dark mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 relative z-10"
      >
        <div className="flex justify-between items-center">
          <h1
            className={`flex items-center gap-2 text-3xl font-extrabold ${
              isDarkMode
                ? "text-white"
                : "bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
            }`}
          >
            <ShieldCheck
              className={isDarkMode ? "text-blue-400" : "text-orange-500"}
              size={36}
            />
            Riwayat Peminjaman 
          </h1>

          <button
            onClick={() => navigate("/kembalikan")}
            className={`flex items-center gap-2 text-white font-medium px-5 py-2.5 rounded-lg shadow-md transition relative z-10 min-h-[44px] ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <RotateCcw size={18} />
            Kembalikan 
            <Send size={16} />
          </button>
        </div>
        <div
          className={`mt-1 w-28 h-1 rounded ${
            isDarkMode ? "bg-blue-500" : "bg-orange-500"
          }`}
        />
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`shadow-md rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center transition-colors duration-300 relative z-10 ${
          isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
        }`}
      >
        <div className="relative w-full md:w-1/2">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? "text-slate-400" : "text-gray-400"
            }`}
            size={18}
          />
          <input
            type="text"
            placeholder="Cari kode unit, barang, keperluan, atau status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`border rounded-lg pl-10 pr-3 py-2.5 w-full focus:outline-none transition-colors duration-300 min-h-[44px] ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                : "border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            }`}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`border rounded-lg px-3 py-2.5 w-full md:w-1/4 focus:outline-none transition-colors duration-300 min-h-[44px] ${
            isDarkMode
              ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              : "border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          }`}
        >
          <option value="">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Ditolak">Ditolak</option>
          <option value="Selesai">Selesai</option>
          <option value="Menunggu Verifikasi Pengembalian">
            Menunggu Verifikasi Pengembalian
          </option>
        </select>
      </motion.div>

      {/* Table with fade animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className={`shadow-md rounded-lg overflow-hidden transition-colors duration-300 relative z-10 ${
          isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
        }`}
      >
        <table className="w-full text-sm text-left">
          <thead
            className={`text-white text-center ${
              isDarkMode
                ? "bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900"
                : "bg-orange-500"
            }`}
          >
            <tr>
              <th className="px-4 py-3">Kode Unit</th>
              <th className="px-4 py-3">Nama Barang</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Tanggal Pinjam</th>
              <th className="px-4 py-3">Tanggal Kembali</th>
              <th className="px-4 py-3">Keperluan</th>
              <th className="px-4 py-3">Tanggal Verifikasi</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="wait">
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => {
                  const displayStatus = getStatusDisplay(item);
                  const statusClass = getStatusBadge(displayStatus);
                  const StatusBadge = statusClass.icon;

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      className={`text-center transition-colors duration-200 ${
                        isDarkMode
                          ? idx % 2 === 0
                            ? "bg-slate-800"
                            : "bg-slate-700/50"
                          : idx % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white"
                      } ${
                        isDarkMode ? "hover:bg-slate-700" : "hover:bg-blue-50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Package
                            size={16}
                            className={
                              isDarkMode ? "text-blue-400" : "text-orange-500"
                            }
                          />
                          <span
                            className={`font-mono font-bold ${
                              isDarkMode
                                ? "text-blue-400"
                                : "text-orange-500"
                            }`}
                          >
                            {getDisplayBarang(item)}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-4 py-3 font-medium ${
                          isDarkMode ? "text-slate-200" : "text-gray-700"
                        }`}
                      >
                        {item.nama_barang}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          isDarkMode ? "text-slate-300" : "text-gray-600"
                        }`}
                      >
                        {item.kategori_barang || "Kategori"}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          isDarkMode ? "text-slate-200" : "text-gray-800"
                        }`}
                      >
                        {formatDate(item.tanggal_pinjam)}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          isDarkMode ? "text-slate-200" : "text-gray-800"
                        }`}
                      >
                        {formatDate(item.tanggal_kembali)}
                      </td>
                      <td
                        className={`px-4 py-3 max-w-xs truncate ${
                          isDarkMode ? "text-slate-200" : "text-gray-800"
                        }`}
                        title={item.keperluan}
                      >
                        {item.keperluan}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          isDarkMode ? "text-slate-200" : "text-gray-800"
                        }`}
                      >
                        {item.tanggal_verifikasi
                          ? formatDate(item.tanggal_verifikasi)
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center gap-1 ${statusClass.bg} ${statusClass.text} px-3 py-1.5 rounded-full text-sm font-medium min-h-[32px] border box-border whitespace-nowrap`}
                        >
                          <StatusBadge size={14} className="flex-shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {displayStatus}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center w-full h-full">
                          <button
                            onClick={() => {
                              // Pastikan data yang dikirim lengkap termasuk pengembalian
                              const itemWithPengembalian = {
                                ...item,
                                pengembalian: item.pengembalian || null,
                                // Pastikan field-field penting ada
                                nama: item.nama_peminjam || "User",
                                jumlah: item.jumlah || 1,
                                kategori_barang: item.kategori_barang || "Kategori",
                                unit: item.unit_kode || item.unit || "-"
                              };
                              navigate(`/detail-peminjaman/${item.id}`, {
                                state: { data: itemWithPengembalian },
                              });
                            }}
                            className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
                              isDarkMode
                                ? "text-blue-400 hover:text-blue-300 hover:bg-slate-600"
                                : "text-blue-500 hover:text-blue-600 hover:bg-blue-100"
                            }`}
                            title="Lihat Detail"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <motion.tr
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <td
                    colSpan="9"
                    className={`p-8 text-center italic ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Eye
                        size={48}
                        className={
                          isDarkMode ? "text-slate-600" : "text-gray-300"
                        }
                      />
                      <p>Belum ada riwayat peminjaman</p>
                      <p className="text-sm">
                        Ajukan peminjaman barang terlebih dahulu
                      </p>
                    </div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
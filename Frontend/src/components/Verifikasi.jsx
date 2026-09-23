import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Trash2,
  Eye,
  Check,
  X,
  ShieldCheck,
  RotateCcw,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppTheme } from "../hooks/useTheme";

const MySwal = withReactContent(Swal);

// Fungsi normalisasi status
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

export default function Verifikasi() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/verifikasi", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Gagal ambil data verifikasi:", err);
      MySwal.fire({
        icon: "error",
        title: "Gagal memuat data",
        text: "Silakan refresh halaman",
        confirmButtonColor: "#f97316",
        background: isDarkMode ? "#0f172a" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan URL foto profil
  const getProfilePictureUrl = (filename) => {
    if (!filename) return null;
    return `http://localhost:8000/uploads/profile_pictures/${filename}`;
  };

  // Fungsi untuk tolak dengan alasan
  const tolakDenganAlasan = async (id, barang_id, unit_kode) => {
    const { value: alasan } = await Swal.fire({
      title: 'Alasan Penolakan',
      input: 'textarea',
      inputLabel: 'Masukkan alasan penolakan',
      inputPlaceholder: 'Contoh: Barang tidak tersedia, jadwal bentrok, dll...',
      inputAttributes: {
        'aria-label': 'Masukkan alasan penolakan'
      },
      showCancelButton: true,
      confirmButtonText: 'Tolak',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      inputValidator: (value) => {
        if (!value || value.trim().length < 5) {
          return 'Alasan penolakan harus diisi (minimal 5 karakter)';
        }
        if (value.length > 500) {
          return 'Alasan terlalu panjang (maksimal 500 karakter)';
        }
      },
      background: isDarkMode ? "#0f172a" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#1f2937",
      customClass: {
        input: isDarkMode ? 'bg-slate-700 text-white' : ''
      }
    });

    if (alasan) {
      await updateStatus(id, "Ditolak", barang_id, unit_kode, alasan);
    }
  };

  const updateStatus = async (id, status, barang_id, unit_kode, alasan_penolakan = null) => {
    try {
      const payload = { status, barang_id, unit_kode };
      if (status === "Ditolak" && alasan_penolakan) {
        payload.alasan_penolakan = alasan_penolakan;
      }

      await axios.put(
        `http://localhost:8000/verifikasi/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchData();
      
      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title:
          status === "Disetujui"
            ? "Peminjaman disetujui!"
            : status === "Ditolak"
            ? "Peminjaman ditolak!"
            : "Status peminjaman ditandai selesai!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: isDarkMode ? "#1e293b" : "#ffffff",
      });
    } catch (err) {
      console.error("Gagal update status:", err);
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Terjadi kesalahan saat update status!",
        confirmButtonColor: "#f97316",
        background: isDarkMode ? "#0f172a" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    }
  };

  const deleteData = async (id) => {
    const result = await MySwal.fire({
      title: "Yakin hapus data ini?",
      text: "Data yang sudah dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      background: isDarkMode ? "#0f172a" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#1f2937",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8000/verifikasi/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Data berhasil dihapus!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: isDarkMode ? "#1e293b" : "#ffffff",
      });
    } catch (err) {
      console.error("Gagal hapus data:", err);
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal menghapus data!",
        confirmButtonColor: "#f97316",
        background: isDarkMode ? "#0f172a" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    }
  };

  const filteredData = data.filter((item) => {
    const normalizedStatus = normalizeStatus(item.status);
    const matchSearch =
      (item.nama_peminjam?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.nama_lengkap?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.nama_barang?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.keperluan?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.alasan_penolakan?.toLowerCase() || "").includes(search.toLowerCase());

    const matchStatus = filterStatus ? normalizedStatus === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const truncateKeperluan = (text, maxWords = 10) => {
    if (!text) return "-";
    const words = text.split(" ");
    return words.length <= maxWords ? text : words.slice(0, maxWords).join(" ") + "...";
  };

  const getDisplayName = (item) => {
    return item.nama_lengkap || item.nama_peminjam || "User";
  };

  // Komponen untuk menampilkan foto profil user
  const UserProfileWithPhoto = ({ item }) => {
    const displayName = getDisplayName(item);
    
    return (
      <div className="flex items-center gap-3">
        {/* Foto Profil */}
        <div className="flex-shrink-0">
          {item.foto_profil ? (
            <img
              src={getProfilePictureUrl(item.foto_profil)}
              alt={`Foto ${displayName}`}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              isDarkMode ? "border-slate-600 bg-slate-700" : "border-gray-300 bg-gray-100"
            }`}>
              <User size={20} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
            </div>
          )}
        </div>
        
        {/* Nama User */}
        <div className="text-left">
          <div className={`font-medium ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
            {displayName}
          </div>
          {item.username && (
            <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              @{item.username}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStatus = (item) => {
    const normalizedStatus = normalizeStatus(item.status);
    const isReturned = item.dikembalikan || item.dikembailikan;

    return (
      <td className="px-4 py-2">
        {normalizedStatus === "Menunggu" && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => tolakDenganAlasan(item.id, item.barang_id, item.unit_kode || item.unit)}
              className={`flex items-center gap-1 text-white px-3 py-1 rounded-lg text-sm transition duration-200 ${
                isDarkMode ? "bg-red-700 hover:bg-red-600" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              <X size={16} /> Tolak
            </button>
            <button
              onClick={() =>
                updateStatus(item.id, "Disetujui", item.barang_id, item.unit_kode || item.unit)
              }
              className={`flex items-center gap-1 text-white px-3 py-1 rounded-lg text-sm transition duration-200 ${
                isDarkMode ? "bg-green-700 hover:bg-green-600" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              <Check size={16} /> Setuju
            </button>
          </div>
        )}

        {normalizedStatus === "Disetujui" && !isReturned && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDarkMode
                ? "bg-green-900/50 text-green-300 border border-green-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            Disetujui
          </span>
        )}

        {normalizedStatus === "Disetujui" && isReturned && (
          <div className="flex flex-col gap-2 items-center">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isDarkMode
                  ? "bg-green-900/50 text-green-300 border border-green-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Disetujui - Dikembalikan
            </span>
            <button
              onClick={() =>
                updateStatus(item.id, "Selesai", item.barang_id, item.unit_kode || item.unit)
              }
              className={`flex items-center gap-1 text-white px-3 py-1 rounded-lg text-sm transition duration-200 ${
                isDarkMode ? "bg-blue-700 hover:bg-blue-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <RotateCcw size={16} /> Tandai Selesai
            </button>
          </div>
        )}

        {normalizedStatus === "Menunggu Verifikasi Pengembalian" && (
          <div className="flex flex-col gap-2 items-center">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isDarkMode
                  ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              Menunggu Verifikasi
            </span>
            <button
              onClick={() =>
                updateStatus(item.id, "Selesai", item.barang_id, item.unit_kode || item.unit)
              }
              className={`flex items-center gap-1 text-white px-3 py-1 rounded-lg text-sm transition duration-200 ${
                isDarkMode ? "bg-blue-700 hover:bg-blue-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <RotateCcw size={16} /> Verifikasi
            </button>
          </div>
        )}

        {normalizedStatus === "Ditolak" && (
          <div className="flex flex-col items-center">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                isDarkMode
                  ? "bg-red-900/50 text-red-300 border border-red-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              Ditolak
            </span>
            {item.alasan_penolakan && (
              <div className="text-xs text-center max-w-xs">
                <span className={`font-semibold ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                  Alasan: 
                </span>
                <span className={`ml-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  {item.alasan_penolakan.length > 50 
                    ? `${item.alasan_penolakan.substring(0, 50)}...` 
                    : item.alasan_penolakan}
                </span>
              </div>
            )}
          </div>
        )}

        {normalizedStatus === "Selesai" && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDarkMode
                ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            Selesai
          </span>
        )}
      </td>
    );
  };

  return (
    <div
      className={`p-6 min-h-screen transition-colors duration-300 relative ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Enhanced Background Particles untuk Dark Mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
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
              Verifikasi Peminjaman
            </h1>
          </div>
          <div
            className={`mt-1 w-28 h-1 rounded ${
              isDarkMode ? "bg-blue-500" : "bg-orange-500"
            }`}
          />
        </motion.div>

        {/* Search & Filter */}
        <div
          className={`shadow-md rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center transition-colors duration-300 backdrop-blur-sm ${
            isDarkMode ? "bg-slate-800/80 border border-slate-700" : "bg-white"
          }`}
        >
          <div className="relative w-full md:w-1/2">
            <Search
              className={`absolute left-3 top-3 ${
                isDarkMode ? "text-slate-400" : "text-gray-400"
              }`}
              size={18}
            />
            <input
              type="text"
              placeholder="Cari user, barang, keperluan, atau alasan penolakan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`border rounded-lg pl-10 pr-3 py-2 w-full focus:outline-none transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                  : "border-gray-300 focus:ring-2 focus:ring-orange-400"
              }`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`border rounded-lg px-3 py-2 w-full md:w-1/4 focus:outline-none transition-colors duration-300 ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
                : "border-gray-300 focus:ring-2 focus:ring-orange-400"
            }`}
          >
            <option value="">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
            <option value="Selesai">Selesai</option>
            <option value="Menunggu Verifikasi Pengembalian">
              Menunggu Verifikasi
            </option>
          </select>
        </div>

        {/* Table */}
        <div
          className={`shadow-md rounded-lg overflow-hidden transition-colors duration-300 backdrop-blur-sm ${
            isDarkMode ? "bg-slate-800/80 border border-slate-700" : "bg-white"
          }`}
        >
          <table className="w-full text-sm text-left">
            <thead
              className={`text-white text-center ${
                isDarkMode
                  ? "bg-gradient-to-r from-slate-800/90 via-blue-900/90 to-indigo-900/90"
                  : "bg-orange-500"
              }`}
            >
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Pengajuan</th>
                <th className="px-4 py-3">Dikembalikan</th>
                <th className="px-4 py-3">Nama Barang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Keperluan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Detail</th>
                <th className="px-4 py-3">Hapus</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`text-center transition-colors duration-200 ${
                    isDarkMode
                      ? idx % 2 === 0
                        ? "bg-slate-800/60"
                        : "bg-slate-700/40"
                      : idx % 2 === 0
                      ? "bg-gray-50"
                      : "bg-white"
                  } ${
                    isDarkMode ? "hover:bg-slate-700/60" : "hover:bg-orange-50"
                  }`}
                >
                  {/* Kolom User dengan Foto Profil */}
                  <td className="px-4 py-3">
                    <UserProfileWithPhoto item={item} />
                  </td>
                  
                  <td className={`px-4 py-2 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                    {item.tanggal_pinjam || "-"}
                  </td>
                  <td className={`px-4 py-2 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                    {item.tanggal_kembali || "-"}
                  </td>
                  <td className={`px-4 py-2 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                    {item.nama_barang || "-"}
                  </td>

                  {/* Kolom Kategori */}
                  <td
                    className={`px-4 py-2 font-medium ${
                      isDarkMode ? "text-slate-200" : "text-gray-800"
                    }`}
                  >
                    {item.kategori_barang || item.unit_kode || "Tidak Diketahui"}
                  </td>

                  <td className={`px-4 py-2 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                    {truncateKeperluan(item.keperluan, 10)}
                  </td>

                  {renderStatus(item)}

                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        navigate(`/detail-verifikasi/${item.id}`, {
                          state: { data: item },
                        })
                      }
                      className={`transition duration-200 ${
                        isDarkMode
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-orange-500 hover:text-orange-600"
                      }`}
                    >
                      <Eye size={20} />
                    </button>
                  </td>

                  <td className="px-4 py-2">
                    <button
                      onClick={() => deleteData(item.id)}
                      disabled={
                        !["Selesai", "Ditolak"].includes(
                          normalizeStatus(item.status)
                        )
                      }
                      title={
                        ["Selesai", "Ditolak"].includes(
                          normalizeStatus(item.status)
                        )
                          ? "Hapus data"
                          : "Hanya bisa dihapus jika status Selesai atau Ditolak"
                      }
                      className={`transition duration-200 ${
                        ["Selesai", "Ditolak"].includes(
                          normalizeStatus(item.status)
                        )
                          ? isDarkMode
                            ? "text-red-400 hover:text-red-300"
                            : "text-red-500 hover:text-red-600"
                          : isDarkMode
                          ? "text-slate-600 cursor-not-allowed"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className={`p-6 text-center italic ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {loading ? "Memuat data..." : "Tidak ada data peminjaman"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
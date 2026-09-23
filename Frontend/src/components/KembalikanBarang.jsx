import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Calendar,
  FileText,
  ClipboardCheck,
  Image as ImageIcon,
  Package,
  X,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";

export default function KembalikanBarang() {
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

  const [peminjamanList, setPeminjamanList] = useState([]);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState("");
  const [tanggalKembali, setTanggalKembali] = useState("");
  const [kondisi, setKondisi] = useState("Baik");
  const [catatan, setCatatan] = useState("");
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTanggal = (tgl) => {
    if (!tgl) return "";
    const d = new Date(tgl);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const approved = JSON.parse(localStorage.getItem("approvedItems")) || [];
    setPeminjamanList(approved);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPeminjaman) {
      Swal.fire({
        icon: "warning",
        title: "Belum Memilih",
        text: "Silakan pilih barang yang akan dikembalikan.",
        background: isDarkMode ? "#1e293b" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("tanggal_kembali", tanggalKembali);
      formData.append("kondisi", kondisi);
      formData.append("catatan", catatan);
      formData.append("status", "Menunggu Verifikasi");
      if (foto) formData.append("foto", foto);

      const response = await axios.put(
        `http://localhost:8000/peminjaman/${selectedPeminjaman}/kembalikan`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Tampilkan efek success bounce
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1200);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: response.data.message || "Pengembalian berhasil dicatat.",
        confirmButtonColor: "#16a34a",
        background: isDarkMode ? "#1e293b" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      }).then(() => navigate("/riwayat"));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error.response?.data?.detail ||
          "Terjadi kesalahan saat mencatat pengembalian.",
        confirmButtonColor: "#dc2626",
        background: isDarkMode ? "#1e293b" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`flex justify-center items-center p-6 min-h-screen transition-colors duration-500 relative ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
          : "bg-gradient-to-br from-green-50 via-white to-green-100"
      }`}
    >
      {/* Enhanced Background Particles untuk Dark Mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-10 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl p-8 backdrop-blur-xl transition-all duration-500 z-20 ${
          isDarkMode
            ? "bg-slate-800/70 border border-slate-700"
            : "bg-white/70 border border-green-200"
        }`}
      >
        {/* Tombol Close */}
        <button
          onClick={() => navigate("/riwayat")}
          className={`absolute top-4 right-4 text-white w-9 h-9 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 z-30 ${
            isDarkMode
              ? "bg-red-700 hover:bg-red-600"
              : "bg-red-500 hover:bg-red-600"
          } hover:scale-105`}
          title="Kembali ke Riwayat"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div
          className={`flex items-center space-x-3 mb-6 border-b pb-3 transition-colors duration-300 ${
            isDarkMode ? "border-slate-600" : "border-green-300"
          }`}
        >
          <ClipboardCheck
            className={isDarkMode ? "text-blue-400" : "text-green-600"}
            size={32}
          />
          <h2
            className={`text-3xl font-extrabold tracking-tight ${
              isDarkMode
                ? "text-white"
                : "bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent"
            }`}
          >
            Pengembalian Barang
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilih Barang */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <label
              className={`block font-semibold mb-1 ${
                isDarkMode ? "text-slate-200" : "text-gray-700"
              }`}
            >
              Pilih Barang
            </label>
            <div className="relative">
              <select
                value={selectedPeminjaman}
                onChange={(e) => setSelectedPeminjaman(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 pr-10 focus:outline-none transition-all duration-300 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
                    : "bg-white border-gray-300 focus:ring-2 focus:ring-green-500"
                }`}
                required
              >
                <option value="">
                  {peminjamanList.length === 0
                    ? "Tidak ada barang disetujui"
                    : "-- Pilih Barang --"}
                </option>
                {peminjamanList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_peminjam} - {p.nama_barang} ({p.unit}) |{" "}
                    {formatTanggal(p.tanggal_pinjam)}
                  </option>
                ))}
              </select>
              <Package
                className={`absolute right-3 top-2.5 ${
                  isDarkMode ? "text-slate-400" : "text-gray-400"
                }`}
                size={20}
              />
            </div>
          </motion.div>

          {/* Tanggal Kembali */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <label
              className={`block font-semibold mb-1 ${
                isDarkMode ? "text-slate-200" : "text-gray-700"
              }`}
            >
              Tanggal Kembali
            </label>
            <div className="relative">
              <input
                type="date"
                id="tanggalKembali"
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
                required
                className={`w-full border rounded-xl px-3 py-2 pr-10 focus:outline-none transition-all duration-300 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
                    : "bg-white border-gray-300 focus:ring-2 focus:ring-green-500"
                }`}
              />
              <Calendar
                className={`absolute right-3 top-2.5 ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
                size={20}
              />
            </div>
          </motion.div>

          {/* Kondisi */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <label
              className={`block font-semibold mb-1 ${
                isDarkMode ? "text-slate-200" : "text-gray-700"
              }`}
            >
              Kondisi Barang
            </label>
            <select
              value={kondisi}
              onChange={(e) => setKondisi(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 focus:outline-none transition-all duration-300 ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
                  : "bg-white border-gray-300 focus:ring-2 focus:ring-green-500"
              }`}
            >
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
              <option value="Hilang">Hilang</option>
            </select>
          </motion.div>

          {/* Catatan */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <label
              className={`block font-semibold mb-1 ${
                isDarkMode ? "text-slate-200" : "text-gray-700"
              }`}
            >
              Catatan
            </label>
            <div className="relative">
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows="3"
                className={`w-full border rounded-xl px-3 py-2 pr-10 focus:outline-none transition-all duration-300 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                    : "bg-white border-gray-300 focus:ring-2 focus:ring-green-500"
                }`}
                placeholder="Tambahkan catatan jika diperlukan..."
              ></textarea>
              <FileText
                className={`absolute right-3 top-3 ${
                  isDarkMode ? "text-slate-400" : "text-gray-400"
                }`}
                size={20}
              />
            </div>
          </motion.div>

          {/* Upload Foto */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <label
              className={`block font-semibold mb-1 ${
                isDarkMode ? "text-slate-200" : "text-gray-700"
              }`}
            >
              Foto Bukti Pengembalian
            </label>
            <div className="flex items-center space-x-4">
              <label
                className={`flex items-center cursor-pointer px-4 py-2 rounded-lg shadow transition-all duration-300 ${
                  isDarkMode
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-green-50 hover:bg-green-100"
                }`}
              >
                <ImageIcon
                  className={`mr-2 ${
                    isDarkMode ? "text-blue-400" : "text-green-600"
                  }`}
                  size={20}
                />
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-blue-300" : "text-green-700"
                  }`}
                >
                  Pilih Foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {preview && (
                <motion.img
                  src={preview}
                  alt="Preview"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="h-20 w-20 rounded-xl border-2 shadow-md object-cover hover:border-green-400"
                />
              )}
            </div>
          </motion.div>

          {/* Tombol Submit dengan efek success bounce */}
          <div className="relative flex justify-center">
            <motion.button
              whileHover={{
                scale: peminjamanList.length === 0 ? 1 : 1.02,
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={peminjamanList.length === 0 || isSubmitting}
              className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                peminjamanList.length === 0
                  ? isDarkMode
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "bg-gray-400 text-white cursor-not-allowed"
                  : isDarkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/30"
                  : "bg-green-600 text-white hover:bg-green-700 hover:shadow-green-400/40"
              }`}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Pengembalian"}
            </motion.button>

            {/* Efek success bounce */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1.3, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-10 flex items-center justify-center z-30"
                >
                  <CheckCircle
                    size={42}
                    className="text-green-500 drop-shadow-lg"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
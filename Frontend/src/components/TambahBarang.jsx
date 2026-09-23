import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Image,
  Package,
  FileText,
  Layers3,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Upload,
} from "lucide-react";
import { useAppTheme } from "../hooks/useTheme";

export default function TambahBarang() {
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

  const [form, setForm] = useState({
    nama_barang: "",
    kategori: "",
    tahun_perolehan: "2025",
    stok: "",
    deskripsi: "",
    kondisi_barang: "",
  });

  const [foto, setFoto] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchKategori = async () => {
    try {
      const res = await axios.get("http://localhost:8000/kategori", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKategoriList(res.data);
    } catch {
      console.error("Gagal mengambil kategori");
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFoto(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { nama_barang, kategori, tahun_perolehan, stok, deskripsi, kondisi_barang } = form;

    const missing = [];
    if (!nama_barang) missing.push("Nama Barang");
    if (!kategori) missing.push("Kategori");
    if (!tahun_perolehan) missing.push("Tahun Perolehan");
    if (!stok) missing.push("Stok");
    if (!deskripsi) missing.push("Deskripsi");
    if (!kondisi_barang) missing.push("Kondisi Barang");

    if (missing.length > 0) {
      setErrorMsg(`⚠️ Harap lengkapi kolom: ${missing.join(", ")}.`);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (foto) formData.append("foto", foto);

      await axios.post("http://localhost:8000/barang", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setTimeout(() => navigate("/barang"), 1200);
    } catch {
      setErrorMsg("🚫 Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 md:p-6 relative transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
          : "bg-gradient-to-br from-orange-50 via-white to-amber-50"
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

      {/* Toast validasi */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`fixed top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg z-50 text-sm font-medium backdrop-blur-sm ${
              isDarkMode
                ? "bg-red-900/90 text-red-200 border border-red-700"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            <AlertTriangle size={22} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animasi success bounce */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-center z-50"
          >
            <CheckCircle2
              size={80}
              className={isDarkMode ? "text-green-400" : "text-green-500"}
            />
            <p
              className={`text-lg font-semibold mt-2 backdrop-blur-sm px-4 py-2 rounded-lg ${
                isDarkMode ? "text-white bg-black/30" : "text-green-700 bg-white/80"
              }`}
            >
              Data berhasil disimpan!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 backdrop-blur-sm ${
          isDarkMode
            ? "bg-slate-800/60 border border-slate-700/50"
            : "bg-white/95 border border-orange-100"
        }`}
      >
        {/* Header dengan gradien - DISESUAIKAN DENGAN NAVBAR */}
        <div
          className={`relative px-8 py-6 border-b transition-colors duration-300 overflow-hidden ${
            isDarkMode
              ? "border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80"
              : "border-orange-100 bg-gradient-to-r from-[#FF9913]/20 to-[#e08a10]/20"
          }`}
        >
          {/* Efek gradien di belakang - DISESUAIKAN DENGAN NAVBAR */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF9913]/10 via-[#FF8A00]/10 to-[#e08a10]/10"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${
                isDarkMode 
                  ? "bg-blue-500/20 border border-blue-500/30" 
                  : "bg-orange-100 border border-orange-200"
              }`}>
                <ClipboardCheck
                  className={isDarkMode ? "text-blue-400" : "text-orange-600"}
                  size={28}
                />
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold tracking-tight ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  Tambah Barang Baru
                </h2>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Lengkapi form di bawah untuk menambahkan barang baru
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/barang")}
              className={`relative flex items-center justify-center rounded-full p-2 transition duration-300 group ${
                isDarkMode
                  ? "bg-slate-700/50 hover:bg-slate-600/50"
                  : "bg-orange-100 hover:bg-orange-200"
              }`}
              title="Kembali ke daftar barang"
            >
              <X size={20} className={isDarkMode ? "text-slate-300" : "text-orange-700"} />
              <span className={`absolute top-full mt-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                isDarkMode 
                  ? "bg-slate-700 text-slate-200" 
                  : "bg-orange-600 text-white"
              }`}>
                Tutup
              </span>
            </motion.button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Grid untuk input utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Nama Barang"
                name="nama_barang"
                icon={<Package size={18} />}
                value={form.nama_barang}
                onChange={handleChange}
                isDarkMode={isDarkMode}
                placeholder="Contoh: Laptop ASUS ROG"
                required
              />

              <InputField
                label="Stok"
                type="number"
                name="stok"
                icon={<Layers3 size={18} />}
                value={form.stok}
                onChange={handleChange}
                isDarkMode={isDarkMode}
                placeholder="Masukkan jumlah stok"
                min="0"
                required
              />

              <SelectField
                label="Kategori"
                name="kategori"
                value={form.kategori}
                onChange={handleChange}
                options={kategoriList.map((k) =>
                  typeof k === "string" ? k : k.nama || k.nama_kategori
                )}
                icon={<Layers3 size={18} />}
                isDarkMode={isDarkMode}
                required
              />

              <SelectField
                label="Kondisi Barang"
                name="kondisi_barang"
                value={form.kondisi_barang}
                onChange={handleChange}
                options={["Baik", "Rusak Ringan", "Rusak Berat"]}
                icon={<FileText size={18} />}
                isDarkMode={isDarkMode}
                required
              />

              <InputField
                label="Tahun Perolehan"
                type="number"
                name="tahun_perolehan"
                icon={<Calendar size={18} />}
                value={form.tahun_perolehan}
                onChange={handleChange}
                isDarkMode={isDarkMode}
                placeholder="Tahun"
                min="2000"
                max="2025"
                required
              />
            </div>

            {/* Upload Foto dengan Drag & Drop */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Image size={18} /> Foto Barang
                </span>
                <span className={`text-xs font-normal mt-1 block ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Unggah foto barang (format: JPG, PNG, maks 5MB)
                </span>
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? isDarkMode
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-orange-500 bg-orange-50"
                    : isDarkMode
                    ? "border-slate-600 hover:border-slate-500 bg-slate-800/30"
                    : "border-slate-300 hover:border-slate-400 bg-white"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center">
                  <div className={`p-4 rounded-full mb-4 ${
                    isDarkMode 
                      ? "bg-blue-500/20" 
                      : "bg-orange-100"
                  }`}>
                    <Upload className={isDarkMode ? "text-blue-400" : "text-orange-500"} size={32} />
                  </div>
                  <p className={`font-medium mb-2 ${
                    isDarkMode ? "text-slate-200" : "text-slate-700"
                  }`}>
                    {foto ? foto.name : "Klik atau drag & drop untuk upload foto"}
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    {foto ? "Klik untuk mengganti foto" : "PNG, JPG (Maks. 5MB)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Foto */}
            {foto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <h3 className={`text-sm font-semibold ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Preview Foto
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(foto)}
                      alt="Preview"
                      className="w-48 h-48 object-cover rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-700"
                    />
                    <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                      isDarkMode 
                        ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}>
                      Preview
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm mb-2 ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}>
                      <span className="font-semibold">Nama file:</span> {foto.name}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}>
                      <span className="font-semibold">Ukuran:</span> {(foto.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Deskripsi */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <FileText size={18} /> Deskripsi Barang
                </span>
                <span className={`text-xs font-normal mt-1 block ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Jelaskan detail dan spesifikasi barang
                </span>
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows={5}
                placeholder="Masukkan deskripsi lengkap barang, termasuk spesifikasi, kondisi, dan informasi tambahan..."
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-all duration-300 resize-none ${
                  isDarkMode
                    ? "bg-slate-800/50 border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    : "border-slate-300 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                }`}
              />
              <div className={`text-xs flex justify-between ${
                isDarkMode ? "text-slate-500" : "text-slate-500"
              }`}>
                <span>Jelaskan dengan detail untuk informasi yang lebih baik</span>
                <span>{form.deskripsi.length}/500 karakter</span>
              </div>
            </div>

            {/* Tombol Aksi - DISESUAIKAN DENGAN NAVBAR */}
            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-700/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate("/barang")}
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  isDarkMode
                    ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600"
                    : "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                }`}
              >
                Batal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={success}
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                  success
                    ? isDarkMode
                      ? "bg-green-600 text-white"
                      : "bg-green-500 text-white"
                    : isDarkMode
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                    : "bg-gradient-to-r from-[#FF9913] to-[#e08a10] hover:from-[#FF8A00] hover:to-[#d67c0e] text-white shadow-lg hover:shadow-orange-300/50"
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {success ? (
                    <>
                      <CheckCircle2 size={20} />
                      Tersimpan
                    </>
                  ) : (
                    <>
                      <ClipboardCheck size={20} />
                      Simpan Barang
                    </>
                  )}
                </span>
                {!success && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ------------------- Komponen InputField -------------------
function InputField({ label, name, type = "text", icon, value, onChange, placeholder, isDarkMode, required, min, max }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">
        <span className="flex items-center gap-2">
          {icon} {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          className={`w-full border rounded-xl px-4 pl-10 py-3.5 focus:outline-none transition-all duration-300 ${
            isDarkMode
              ? "bg-slate-800/50 border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              : "border-slate-300 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          }`}
        />
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, icon, isDarkMode, required }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">
        <span className="flex items-center gap-2">
          {icon} {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full border rounded-xl px-4 pl-10 py-3.5 focus:outline-none transition-all duration-300 appearance-none cursor-pointer ${
            isDarkMode
              ? "bg-slate-800/50 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              : "border-slate-300 text-slate-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          }`}
        >
          <option value="" className={isDarkMode ? "bg-slate-800" : ""}>
            -- Pilih {label} --
          </option>
          {options.map((opt, i) => (
            <option 
              key={i} 
              value={opt}
              className={isDarkMode ? "bg-slate-800" : ""}
            >
              {opt}
            </option>
          ))}
        </select>
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}>
          {icon}
        </div>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`} size={20} />
      </div>
    </div>
  );
}
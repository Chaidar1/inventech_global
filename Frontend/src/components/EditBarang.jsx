import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Package,
  Calendar,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";

export default function EditBarang() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  // State form
  const [form, setForm] = useState({
    nama_barang: "",
    kategori: "",
    tahun_perolehan: "2025",
    deskripsi: "",
    stok_tambah: 0,
    kondisi_barang: "Baik",
  });

  // State foto & barang
  const [hapusFoto, setHapusFoto] = useState(false);
  const [fotoBaru, setFotoBaru] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [barang, setBarang] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exit animation state
  const [isExiting, setIsExiting] = useState(false);

  // Ambil data barang dan kategori
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Ambil list kategori
        const kategoriRes = await axios.get('http://localhost:8000/kategori');
        setKategoriList(kategoriRes.data);

        // Ambil data barang
        let barangData;
        if (location.state?.barang) {
          barangData = location.state.barang;
        } else {
          const barangRes = await axios.get(`http://localhost:8000/barang/${id}`);
          barangData = barangRes.data;
        }

        setBarang(barangData);
        setForm({
          nama_barang: barangData.nama_barang || "",
          kategori: barangData.kategori || "",
          tahun_perolehan: barangData.tahun_perolehan?.toString() || "2025",
          deskripsi: barangData.deskripsi || "",
          stok_tambah: 0,
          kondisi_barang: "Baik",
        });
        
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Tidak dapat mengambil data barang.",
          background: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.state, isDarkMode]);

  // Handle input
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'number' ? parseInt(value) || 0 : value 
    }));
  };

  // Navigasi dengan animasi keluar
  const navigateWithExit = (path, state = {}) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path, { state });
    }, 500);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nama_barang, kategori, tahun_perolehan, deskripsi, stok_tambah, kondisi_barang } = form;

    if (!nama_barang.trim() || !kategori.trim() || !tahun_perolehan || !deskripsi.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Nama, kategori, tahun perolehan, dan deskripsi wajib diisi!",
        confirmButtonColor: "#FF9913",
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
      return;
    }

    // Konfirmasi sebelum simpan
    const result = await Swal.fire({
      title: "Konfirmasi Perubahan",
      text: "Apakah Anda yakin ingin menyimpan perubahan pada data barang ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#dc2626",
      background: isDarkMode ? '#1e293b' : '#ffffff',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
    });

    if (!result.isConfirmed) return;

    const formData = new FormData();
    formData.append("nama_barang", nama_barang.trim());
    formData.append("kategori", kategori.trim());
    formData.append("tahun_perolehan", parseInt(tahun_perolehan));
    formData.append("deskripsi", deskripsi.trim());
    formData.append("stok_tambah", stok_tambah);
    formData.append("kondisi_barang", kondisi_barang);
    formData.append("hapus_foto", hapusFoto.toString());
    
    if (fotoBaru) {
      formData.append("foto", fotoBaru);
    }

    const token = localStorage.getItem("token");

    try {
      const res = await axios.put(
        `http://localhost:8000/barang/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Barang berhasil diperbarui.",
        confirmButtonColor: "#FF9913",
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      }).then(() => {
        navigateWithExit("/barang", { updatedBarang: res.data.barang });
      });
    } catch (err) {
      console.error('Error updating barang:', err);
      const errorMessage = err.response?.data?.detail || "Terjadi kesalahan saat memperbarui barang.";
      
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: errorMessage,
        confirmButtonColor: "#FF9913",
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-white"
      }`}>
        <p className={`text-lg ${
          isDarkMode ? "text-slate-300" : "text-gray-600"
        }`}>
          Memuat data...
        </p>
      </div>
    );
  }

  if (!barang) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-white"
      }`}>
        <p className={`text-lg ${
          isDarkMode ? "text-slate-300" : "text-gray-600"
        }`}>
          Barang tidak ditemukan
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-cover bg-center flex items-center justify-center relative p-6 transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : ""
      }`}
      style={{ backgroundImage: isDarkMode ? "none" : "url('/edit.jpeg')" }}
    >
      {/* Canvas untuk particles di dark mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}

      {!isDarkMode && <div className="absolute inset-0 bg-black bg-opacity-60"></div>}

      <AnimatePresence>
        {!isExiting && (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`relative z-10 p-8 rounded-2xl shadow-2xl w-full max-w-2xl transition-colors duration-300 ${
              isDarkMode 
                ? "bg-slate-800 border border-slate-700" 
                : "bg-white bg-opacity-95"
            }`}
          >
            {/* Tombol Close */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateWithExit("/barang")}
              className={`absolute top-4 right-4 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition ${
                isDarkMode 
                  ? "bg-red-700 hover:bg-red-600" 
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title="Kembali ke daftar barang"
            >
              <X size={22} />
            </motion.button>

            {/* Judul */}
            <motion.h2
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-3xl font-bold mb-6 text-center ${
                isDarkMode ? "text-blue-400" : "text-[#FF9913]"
              }`}
            >
              Edit Barang
            </motion.h2>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Nama Barang */}
              <div className="col-span-2">
                <label className={`block mb-1 font-semibold ${
                  isDarkMode ? "text-slate-200" : "text-gray-800"
                }`}>
                  Nama Barang *
                </label>
                <div className="relative">
                  <input
                    name="nama_barang"
                    value={form.nama_barang}
                    onChange={handleChange}
                    required
                    className={`w-full border rounded-xl px-4 py-2 pr-10 focus:outline-none transition duration-300 ${
                      isDarkMode 
                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500" 
                        : "border-gray-300 focus:ring-2 focus:ring-[#FF9913]"
                    }`}
                    placeholder="Masukkan nama barang"
                  />
                  <Package size={18} className={`absolute right-3 top-3 ${
                    isDarkMode ? "text-slate-400" : "text-gray-400"
                  }`} />
                </div>
              </div>

              {/* Kategori */}
              <div className="col-span-2">
                <label className={`block mb-1 font-semibold ${
                  isDarkMode ? "text-slate-200" : "text-gray-800"
                }`}>
                  Kategori *
                </label>
                <div className="relative">
                  <input
                    name="kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    list="kategori-options"
                    required
                    className={`w-full border rounded-xl px-4 py-2 pr-10 focus:outline-none transition duration-300 ${
                      isDarkMode 
                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500" 
                        : "border-gray-300 focus:ring-2 focus:ring-[#FF9913]"
                    }`}
                    placeholder="Masukkan atau pilih kategori"
                  />
                  <datalist id="kategori-options">
                    {kategoriList.map((kat, index) => (
                      <option key={index} value={kat} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Tahun Perolehan */}
              <div>
                <label className={`block mb-1 font-semibold ${
                  isDarkMode ? "text-slate-200" : "text-gray-800"
                }`}>
                  Tahun Perolehan *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="tahun_perolehan"
                    value={form.tahun_perolehan}
                    onChange={handleChange}
                    required
                    min="1900"
                    max="2100"
                    className={`w-full border rounded-xl px-4 py-2 pr-10 focus:outline-none transition duration-300 ${
                      isDarkMode 
                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500" 
                        : "border-gray-300 focus:ring-2 focus:ring-[#FF9913]"
                    }`}
                  />
                  <Calendar size={18} className={`absolute right-3 top-3 ${
                    isDarkMode ? "text-slate-400" : "text-gray-400"
                  }`} />
                </div>
              </div>

              {/* Tambah Stok */}
              <div>
                <label className={`block mb-1 font-semibold ${
                  isDarkMode ? "text-slate-200" : "text-gray-800"
                }`}>
                  Tambah Stok
                </label>
                <input
                  type="number"
                  name="stok_tambah"
                  value={form.stok_tambah}
                  onChange={handleChange}
                  min="0"
                  className={`w-full border rounded-xl px-4 py-2 focus:outline-none transition duration-300 ${
                    isDarkMode 
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500" 
                      : "border-gray-300 focus:ring-2 focus:ring-[#FF9913]"
                  }`}
                  placeholder="0"
                />
              </div>

              {/* Kondisi Barang untuk Stok Baru */}
              <div>
                <label className={`block mb-1 font-semibold ${
                  isDarkMode ? "text-slate-200" : "text-gray-800"
                }`}>
                  Kondisi Stok Baru
                </label>
                <select
                  name="kondisi_barang"
                  value={form.kondisi_barang}
                  onChange={handleChange}
                  className={`w-full border rounded-xl px-4 py-2 focus:outline-none transition duration-300 ${
                    isDarkMode 
                      ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500" 
                      : "border-gray-300 focus:ring-2 focus:ring-[#FF9913]"
                  }`}
                >
                  <option value="Baik">Baik</option>
                  <option value="Kurang Baik">Kurang Baik</option>
                  <option value="Rusak">Rusak</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>

              {/* Deskripsi */}
              <div className="col-span-2">
                <label className={`block mb-1 font-semibold ${
                  isDarkMode ? "text-slate-200" : "text-gray-800"
                }`}>
                  Deskripsi *
                </label>
                <div className="relative">
                  <textarea
                    name="deskripsi"
                    value={form.deskripsi}
                    onChange={handleChange}
                    required
                    rows={3}
                    className={`w-full border rounded-xl px-4 py-2 pr-10 focus:outline-none transition duration-300 ${
                      isDarkMode 
                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500" 
                        : "border-gray-300 focus:ring-2 focus:ring-[#FF9913]"
                    }`}
                    placeholder="Masukkan deskripsi barang"
                  />
                  <FileText size={18} className={`absolute right-3 top-3 ${
                    isDarkMode ? "text-slate-400" : "text-gray-400"
                  }`} />
                </div>
              </div>

              {/* Foto Lama */}
              {barang.foto && (
                <div className="col-span-2">
                  <label className={`block mb-2 font-semibold ${
                    isDarkMode ? "text-slate-200" : "text-gray-800"
                  }`}>
                    Foto Saat Ini
                  </label>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-4"
                  >
                    <img
                      src={`http://localhost:8000/uploads/${barang.foto}`}
                      alt="Foto Lama"
                      className="w-32 h-32 object-cover rounded-xl shadow border border-gray-300"
                    />
                    <div className="flex-1">
                      <p className={`text-sm mb-2 ${
                        isDarkMode ? "text-slate-300" : "text-gray-600"
                      }`}>
                        {barang.foto}
                      </p>
                      <label className={`flex items-center gap-2 text-sm ${
                        isDarkMode ? "text-slate-300" : "text-gray-600"
                      }`}>
                        <input
                          type="checkbox"
                          checked={hapusFoto}
                          onChange={(e) => setHapusFoto(e.target.checked)}
                          className={isDarkMode ? "accent-red-500" : "accent-red-600"}
                        />
                        Hapus foto ini
                      </label>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Upload Foto Baru */}
              <div className="col-span-2">
                <label className={`block mb-2 font-semibold ${
                  isDarkMode ? "text-slate-200" : "text-gray-800"
                }`}>
                  {barang.foto ? "Ganti Foto" : "Upload Foto"}
                </label>
                <label className={`flex items-center cursor-pointer px-4 py-3 rounded-xl shadow hover:shadow-md transition w-full ${
                  isDarkMode 
                    ? "bg-slate-700 hover:bg-slate-600 border border-slate-600" 
                    : "bg-orange-50 hover:bg-orange-100 border border-orange-200"
                }`}>
                  <ImageIcon className={`mr-3 ${
                    isDarkMode ? "text-blue-400" : "text-[#FF9913]"
                  }`} size={20} />
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-[#FF9913]"
                    }`}>
                      {fotoBaru ? fotoBaru.name : "Pilih Foto Baru"}
                    </span>
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}>
                      Klik untuk memilih foto dari komputer
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setFotoBaru(file);
                      setPreviewFoto(file ? URL.createObjectURL(file) : null);
                      // Otomatis uncheck hapus foto jika upload foto baru
                      if (file) setHapusFoto(false);
                    }}
                    className="hidden"
                  />
                </label>
                
                {previewFoto && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-4 border rounded-xl bg-slate-50 dark:bg-slate-700"
                  >
                    <p className={`text-sm font-medium mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}>
                      Preview Foto Baru:
                    </p>
                    <img
                      src={previewFoto}
                      alt="Preview Foto Baru"
                      className="w-32 h-32 object-cover rounded-lg shadow mx-auto border border-gray-300"
                    />
                  </motion.div>
                )}
              </div>

              {/* Tombol Submit */}
              <div className="col-span-2 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full text-white font-semibold py-3 rounded-xl transition duration-300 shadow-lg ${
                    isDarkMode 
                      ? "bg-blue-600 hover:bg-blue-500" 
                      : "bg-[#FF9913] hover:bg-[#e68a12]"
                  }`}
                >
                  Simpan Perubahan
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
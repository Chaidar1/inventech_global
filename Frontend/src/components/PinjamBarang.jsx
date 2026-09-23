import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Calendar,
  ClipboardList,
  User,
  ChevronDown,
  Check,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";

// Decode token sederhana
function decodeToken(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split("|");
    if (parts.length < 3) return null;
    return { role: parts[1] };
  } catch {
    return null;
  }
}

export default function PinjamBarang() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
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

  const barangFromState = location.state?.barang;
  const preselectedUnit = location.state?.unitKode || "";

  const [barang, setBarang] = useState(barangFromState || null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!barangFromState);
  const [userProfile, setUserProfile] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    tanggal_pinjam: "",
    tanggal_kembali: "",
    unit_kode: preselectedUnit,
    keperluan: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [jarakHari, setJarakHari] = useState(null);

  // Ambil data profile user
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get("http://localhost:8000/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserProfile(response.data);
          // Auto isi nama dengan nama_lengkap dari profile
          setFormData((prev) => ({ 
            ...prev, 
            nama: response.data.nama_lengkap || response.data.username 
          }));
        }
      } catch (error) {
        console.error("Gagal mengambil data profile:", error);
        // Fallback ke username jika gagal
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = decodeToken(token);
          if (decoded) {
            const userName = localStorage.getItem("loginUsername") || "User";
            setFormData((prev) => ({ ...prev, nama: userName }));
          }
        }
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch barang detail
  useEffect(() => {
    if (!barang && id) {
      setPageLoading(true);
      axios
        .get(`http://localhost:8000/barang/${id}`)
        .then((res) => setBarang(res.data))
        .catch(() => {
          toast.error("❌ Barang tidak ditemukan.");
          navigate("/barang");
        })
        .finally(() => setPageLoading(false));
    }
  }, [id, barang, navigate]);

  // Fetch stok units
  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:8000/barang/${id}/stok`)
        .then((res) => setUnits(res.data.units || []))
        .catch(() => toast.error("❌ Gagal mengambil unit stok."));
    }
  }, [id]);

  // Update unit jika state berubah
  useEffect(() => {
    if (location.state?.unitKode) {
      setFormData((prev) => ({ ...prev, unit_kode: location.state.unitKode }));
    }
  }, [location.state]);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const kondisiBadge = (status) => {
    switch (status) {
      case "Baik":
        return "bg-green-500 text-white";
      case "Rusak Ringan":
        return "bg-yellow-500 text-white";
      case "Rusak Berat":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const handleSelectUnit = (u) => {
    if (u.kondisi === "Rusak Berat") {
      toast.error("❌ Unit dengan kondisi 'Rusak Berat' tidak bisa dipinjam.");
      return;
    }
    setFormData((prev) => ({ ...prev, unit_kode: u.kode }));
    setDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Jangan izinkan perubahan field nama
    if (name === "nama") return;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "tanggal_pinjam" || name === "tanggal_kembali") {
        const start = new Date(updated.tanggal_pinjam);
        const end = new Date(updated.tanggal_kembali);
        if (updated.tanggal_pinjam && updated.tanggal_kembali) {
          const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          setJarakHari(diff > 0 ? diff : null);
        } else {
          setJarakHari(null);
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.unit_kode) {
      toast.error("❌ Harap pilih unit stok terlebih dahulu.");
      setLoading(false);
      return;
    }
    if (!formData.tanggal_pinjam || !formData.tanggal_kembali) {
      toast.error("❌ Harap isi tanggal pinjam & tanggal kembali.");
      setLoading(false);
      return;
    }

    const start = new Date(formData.tanggal_pinjam);
    const end = new Date(formData.tanggal_kembali);
    if (end <= start) {
      toast.error("❌ Tanggal kembali harus setelah tanggal pinjam.");
      setLoading(false);
      return;
    }

    const selectedUnit = units.find((u) => u.kode === formData.unit_kode);
    if (!selectedUnit) {
      toast.error("❌ Unit yang dipilih tidak valid.");
      setLoading(false);
      return;
    }
    if (selectedUnit.kondisi === "Rusak Berat") {
      toast.error("❌ Unit dengan kondisi 'Rusak Berat' tidak bisa dipinjam.");
      setLoading(false);
      return;
    }

    try {
      const pinjamData = {
        barang_id: parseInt(id),
        // Nama akan diisi otomatis oleh backend dari data user
        unit_kode: formData.unit_kode,
        tanggal_pinjam: formData.tanggal_pinjam,
        tanggal_kembali: formData.tanggal_kembali,
        keperluan: formData.keperluan,
      };

      const token = localStorage.getItem("token");
      
      await axios.post("http://localhost:8000/peminjaman/pinjam", pinjamData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Peminjaman berhasil diajukan! Menunggu verifikasi admin.");
      navigate("/riwayat");
    } catch (error) {
      toast.error(
        `❌ ${error.response?.data?.detail || "Terjadi kesalahan saat meminjam."}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Skeleton saat loading barang
  if (pageLoading) {
    return (
      <div className={`flex justify-center items-center min-h-screen relative ${isDarkMode ? "bg-slate-900" : "bg-gray-100"}`}>
        {/* Canvas untuk particles di dark mode */}
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="fixed inset-0 z-10 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        <div className={`animate-pulse relative z-20 ${isDarkMode ? "text-slate-300" : "text-gray-500"}`}>
          ⏳ Memuat data barang...
        </div>
      </div>
    );
  }

  if (!barang) {
    return (
      <div className={`flex justify-center items-center min-h-screen relative ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
        {/* Canvas untuk particles di dark mode */}
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="fixed inset-0 z-10 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        <p className={`relative z-20 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
          Barang tidak ditemukan.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-cover bg-center flex items-center justify-center relative p-6 transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : ""
      }`}
      style={{ backgroundImage: isDarkMode ? "none" : "url('/perpus.jpeg')" }}
    >
      {/* Enhanced Background Particles untuk Dark Mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-10 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Overlay gelap hanya untuk light mode */}
      {!isDarkMode && <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-20 p-8 rounded-2xl shadow-2xl w-full max-w-4xl transition-colors duration-300 ${
          isDarkMode 
            ? "bg-slate-800 border border-slate-700" 
            : "bg-white"
        }`}
      >
        {/* Header */}
        <h2 className={`text-3xl font-bold text-center mb-6 bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text ${isDarkMode ? "!text-white" : ""}`}>
          Form Peminjaman Barang
        </h2>

        {/* Info Barang */}
        <div className={`mb-6 p-4 bg-gray-50 rounded-xl shadow-sm flex gap-4 items-center ${isDarkMode ? "!bg-slate-700/50 !border !border-slate-600" : ""}`}>
          <img
            src={`http://localhost:8000/uploads/${barang.foto}`}
            alt={barang.nama_barang}
            className="w-16 h-16 object-cover rounded-lg shadow"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-image.png";
            }}
          />
          <div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? "!text-white" : ""}`}>
              {barang.nama_barang}
            </h3>
            <p className={`${isDarkMode ? "!text-slate-300" : "text-gray-600"}`}>
              Kategori: {barang.kategori}
            </p>
          </div>
        </div>

        {/* FORM DIMULAI DI SINI */}
        <form onSubmit={handleSubmit}>
          {/* Nama - DISABLED */}
          <div className="mb-4">
            <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
              Nama Peminjam *
            </label>
            <div className={`flex items-center border rounded-lg px-3 py-2 ${isDarkMode ? "!bg-slate-700 !border-slate-600" : "bg-gray-100 border-gray-300"}`}>
              <User className={`w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`} />
              <input
                type="text"
                name="nama"
                value={formData.nama}
                readOnly
                disabled
                className={`flex-1 outline-none ml-2 bg-transparent ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                placeholder="Memuat data user..."
              />
              <Lock className={`w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`} />
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              Nama diambil dari profil Anda dan tidak dapat diubah
            </p>
          </div>

          {/* Unit */}
          <div className="mb-4 relative" ref={dropdownRef}>
            <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
              Unit yang Dipinjam *
            </label>
            <div
              className={`border rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer focus-within:ring-2 ring-orange-400 ${isDarkMode ? "!bg-slate-700 !border-slate-600 !focus-within:ring-blue-500 hover:!border-blue-500" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {formData.unit_kode ? (
                <span className={isDarkMode ? "!text-white" : ""}>
                  {formData.unit_kode} -{" "}
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${kondisiBadge(
                      units.find((u) => u.kode === formData.unit_kode)?.kondisi
                    )}`}
                  >
                    {units.find((u) => u.kode === formData.unit_kode)?.kondisi}
                  </span>
                </span>
              ) : (
                <span className={isDarkMode ? "!text-slate-400" : "text-gray-400"}>
                  Pilih Unit
                </span>
              )}
              <ChevronDown className={`w-5 h-5 text-gray-500 ${isDarkMode ? "!text-slate-400" : ""} ${dropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {dropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute z-30 bg-white border rounded-lg shadow-md mt-1 w-full max-h-48 overflow-y-auto ${isDarkMode ? "!bg-slate-800 !border-slate-600" : ""}`}
              >
                {units.map((unit) => (
                  <li
                    key={unit.kode}
                    className={`flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer ${isDarkMode ? "!text-slate-200 !hover:bg-slate-700" : ""}`}
                    onClick={() => handleSelectUnit(unit)}
                  >
                    <span>
                      {unit.kode} -{" "}
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${kondisiBadge(
                          unit.kondisi
                        )}`}
                      >
                        {unit.kondisi}
                      </span>
                    </span>
                    {formData.unit_kode === unit.kode && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>

          {/* Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
                Tanggal Pinjam *
              </label>
              <div className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 ring-orange-400 ${isDarkMode ? "!bg-slate-700 !border-slate-600 !focus-within:ring-blue-500" : ""}`}>
                <Calendar className={`w-5 h-5 text-gray-400 ${isDarkMode ? "!text-slate-400" : ""}`} />
                <input
                  type="date"
                  name="tanggal_pinjam"
                  value={formData.tanggal_pinjam}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`flex-1 outline-none ml-2 ${isDarkMode ? "!bg-transparent !text-white" : ""}`}
                  required
                />
              </div>
            </div>
            <div>
              <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
                Tanggal Kembali *
              </label>
              <div className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 ring-orange-400 ${isDarkMode ? "!bg-slate-700 !border-slate-600 !focus-within:ring-blue-500" : ""}`}>
                <Calendar className={`w-5 h-5 text-gray-400 ${isDarkMode ? "!text-slate-400" : ""}`} />
                <input
                  type="date"
                  name="tanggal_kembali"
                  value={formData.tanggal_kembali}
                  onChange={handleChange}
                  min={formData.tanggal_pinjam || new Date().toISOString().split("T")[0]}
                  disabled={!formData.tanggal_pinjam}
                  className={`flex-1 outline-none ml-2 disabled:bg-gray-100 ${isDarkMode ? "!bg-transparent !text-white disabled:!bg-slate-600 disabled:!text-slate-400" : ""}`}
                  required
                />
              </div>
              {jarakHari !== null && (
                <p className={`text-sm text-gray-600 mt-1 ${isDarkMode ? "!text-slate-300" : ""}`}>
                  Durasi:{" "}
                  <span className={`font-semibold ${isDarkMode ? "!text-blue-400" : "text-orange-600"}`}>
                    {jarakHari} hari
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Keperluan */}
          <div className="mb-4">
            <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
              Keperluan
            </label>
            <div className={`flex items-start border rounded-lg px-3 py-2 focus-within:ring-2 ring-orange-400 ${isDarkMode ? "!bg-slate-700 !border-slate-600 !focus-within:ring-blue-500" : ""}`}>
              <ClipboardList className={`w-5 h-5 text-gray-400 mt-1 ${isDarkMode ? "!text-slate-400" : ""}`} />
              <textarea
                name="keperluan"
                placeholder="Masukkan keperluan peminjaman"
                value={formData.keperluan}
                onChange={handleChange}
                className={`flex-1 outline-none ml-2 ${isDarkMode ? "!bg-transparent !text-white placeholder-slate-400" : ""}`}
                rows="3"
              />
            </div>
          </div>

          {/* Tombol */}
          <div className="flex justify-between mt-6 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-5 py-3 rounded-lg hover:opacity-90 transition-all shadow-md font-semibold disabled:opacity-50"
            >
              {loading ? "Mengajukan..." : "Ajukan Peminjaman"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate(-1)}
              className={`flex-1 bg-gray-400 text-white px-5 py-3 rounded-lg hover:bg-gray-500 transition-all shadow-md font-semibold ${isDarkMode ? "!bg-slate-600 !hover:bg-slate-500" : ""}`}
            >
              Batalkan
            </motion.button>
          </div>
        </form>
        {/* FORM BERAKHIR DI SINI */}
      </motion.div>
    </div>
  );
}
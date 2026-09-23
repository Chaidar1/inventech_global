import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Camera,
  Lock,
  ChevronDown,
  Check,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Eye,
  X,
  Ticket,
  Tag,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function BeliTiket() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useAppTheme();

  // State untuk modal QR code
  const [showQRModal, setShowQRModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageAlt, setModalImageAlt] = useState("");

  const kelasFromState = location.state?.kelas;
  const selectedTiketFromState = location.state?.selectedTiket;
  const tiketKategoriFromState = location.state?.tiketKategori || [];

  const [kelas, setKelas] = useState(kelasFromState || null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!kelasFromState);
  const [userProfile, setUserProfile] = useState(null);
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState(null);
  const [tiketKategori, setTiketKategori] = useState(tiketKategoriFromState);
  const [loadingTiket, setLoadingTiket] = useState(!tiketKategoriFromState.length);

  // Opsi identitas
  const identitasOptions = ["KTP", "SIM", "Kartu Pelajar", "Lainnya"];

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    identitas: "KTP",
    metode_pembayaran: "",
    tiket_kategori_id: selectedTiketFromState?.id || "", // Tambahkan field tiket kategori
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tiketDropdownOpen, setTiketDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const tiketDropdownRef = useRef(null);

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

  // Effect tambahan untuk handle visibility change (tab switching)
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
            nama: response.data.nama_lengkap || response.data.username,
            email: response.data.email || ""
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

  // Fetch kelas detail dan tiket kategori
  useEffect(() => {
    if (!kelas && id) {
      setPageLoading(true);
      Promise.all([
        axios.get(`http://localhost:8000/kelas/${id}`),
        axios.get(`http://localhost:8000/kelas/${id}/tiket-kategori`)
      ])
        .then(([kelasRes, tiketRes]) => {
          const kelasData = kelasRes.data;
          // Tambahkan URL foto dan QR code
          if (kelasData.foto) {
            kelasData.foto_url = `http://localhost:8000/uploads/${kelasData.foto}?t=${Date.now()}`;
          }
          if (kelasData.metode_pembayaran) {
            kelasData.qr_code_url = `http://localhost:8000/uploads/${kelasData.metode_pembayaran}?t=${Date.now()}`;
          }
          setKelas(kelasData);
          setTiketKategori(tiketRes.data);
          
          // Set default tiket kategori jika belum ada yang dipilih
          if (!selectedTiketFromState && tiketRes.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              tiket_kategori_id: tiketRes.data[0].id.toString()
            }));
          }
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          toast.error("❌ Gagal memuat data kelas.");
          navigate("/kelas");
        })
        .finally(() => {
          setPageLoading(false);
          setLoadingTiket(false);
        });
    }
  }, [id, kelas, navigate, selectedTiketFromState]);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (tiketDropdownRef.current && !tiketDropdownRef.current.contains(e.target)) {
        setTiketDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Format harga ke Rupiah
  const formatRupiah = (angka) => {
    if (!angka) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  // Function untuk membuka modal QR code
  const openQRModal = (qrUrl, altText) => {
    setModalImageUrl(qrUrl);
    setModalImageAlt(altText);
    setShowQRModal(true);
  };

  // Function untuk menutup modal
  const closeImageModal = () => {
    setShowQRModal(false);
  };

  const handleSelectIdentitas = (identitas) => {
    setFormData((prev) => ({ ...prev, identitas }));
    setDropdownOpen(false);
  };

  const handleSelectTiketKategori = (tiket) => {
    setFormData((prev) => ({ 
      ...prev, 
      tiket_kategori_id: tiket.id.toString() 
    }));
    setTiketDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Jangan izinkan perubahan field nama jika sudah ada dari profile
    if (name === "nama" && userProfile?.nama_lengkap) return;
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Get selected tiket info
  const getSelectedTiket = () => {
    if (!formData.tiket_kategori_id) return null;
    return tiketKategori.find(t => t.id == formData.tiket_kategori_id);
  };

  // Calculate total harga
  const calculateTotal = () => {
    const selectedTiket = getSelectedTiket();
    if (selectedTiket) {
      return selectedTiket.harga;
    }
    return kelas?.biaya || 0;
  };

  // Handle file upload untuk bukti pembayaran
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("❌ Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }

      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("❌ Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.");
        return;
      }

      setBuktiFile(file);
      
      // Buat preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi form
    if (!formData.nama || !formData.email || !formData.telepon || !formData.identitas || !formData.metode_pembayaran) {
      toast.error("❌ Harap lengkapi semua kolom yang wajib diisi.");
      setLoading(false);
      return;
    }

    if (!formData.tiket_kategori_id && tiketKategori.length > 0) {
      toast.error("❌ Harap pilih kategori tiket.");
      setLoading(false);
      return;
    }

    if (!buktiFile) {
      toast.error("❌ Harap upload bukti pembayaran.");
      setLoading(false);
      return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("❌ Format email tidak valid.");
      setLoading(false);
      return;
    }

    // Validasi nomor telepon
    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(formData.telepon.replace(/[^0-9]/g, ''))) {
      toast.error("❌ Nomor telepon harus 10-13 digit angka.");
      setLoading(false);
      return;
    }

    try {
      // Membuat FormData untuk mengirim file
      const formDataToSend = new FormData();
      formDataToSend.append('kelas_id', id);
      formDataToSend.append('nama', formData.nama);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telepon', formData.telepon);
      formDataToSend.append('identitas', formData.identitas);
      formDataToSend.append('metode_pembayaran', formData.metode_pembayaran);
      formDataToSend.append('bukti_pembayaran', buktiFile);
      
      // Tambahkan tiket kategori jika dipilih
      if (formData.tiket_kategori_id) {
        formDataToSend.append('tiket_kategori_id', formData.tiket_kategori_id);
        const selectedTiket = getSelectedTiket();
        formDataToSend.append('biaya', selectedTiket?.harga || kelas?.biaya || 0);
      } else {
        formDataToSend.append('biaya', kelas?.biaya || 0);
      }

      const token = localStorage.getItem("token");
      
      await axios.post("http://localhost:8000/pembelian/tiket", formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      toast.success("✅ Pembelian tiket berhasil! Tiket Anda sedang diproses.");
      navigate("/riwayat-pembelian");
    } catch (error) {
      console.error("Error pembelian:", error);
      toast.error(
        `❌ ${error.response?.data?.detail || "Terjadi kesalahan saat membeli tiket."}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Skeleton saat loading kelas
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
          ⏳ Memuat data kelas...
        </div>
      </div>
    );
  }

  if (!kelas) {
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
          Kelas tidak ditemukan.
        </p>
      </div>
    );
  }

  const selectedTiket = getSelectedTiket();
  const totalHarga = calculateTotal();

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
        className={`relative z-20 p-8 rounded-2xl shadow-2xl w-full max-w-5xl transition-colors duration-300 ${
          isDarkMode 
            ? "bg-slate-800 border border-slate-700" 
            : "bg-white"
        }`}
      >
        {/* Header */}
        <h2 className={`text-3xl font-bold text-center mb-6 bg-gradient-to-r from-emerald-500 to-teal-400 text-transparent bg-clip-text ${isDarkMode ? "!text-white" : ""}`}>
          Form Pembelian Tiket Kelas
        </h2>

        {/* Grid layout untuk informasi kelas dan form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kolom Kiri: Informasi Kelas */}
          <div className={`rounded-xl p-6 ${isDarkMode ? "bg-slate-700/50" : "bg-gray-50"}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Informasi Kelas
            </h3>
            
            {/* Gambar Kelas */}
            {kelas.foto_url && (
              <div className="mb-4">
                <img
                  src={kelas.foto_url}
                  alt={kelas.nama_kelas}
                  className="w-full h-48 object-cover rounded-lg shadow"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-image.png";
                  }}
                />
              </div>
            )}

            {/* Detail Kelas */}
            <div className="space-y-3">
              <div>
                <h4 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  {kelas.nama_kelas}
                </h4>
                <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                  {kelas.kategori}
                </p>
              </div>

              {/* Informasi detail */}
              <div className="space-y-2">
                {/* Biaya Dasar */}
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? "bg-emerald-900/30" : "bg-emerald-100"}`}>
                    <DollarSign size={16} className={isDarkMode ? "text-emerald-300" : "text-emerald-600"} />
                  </div>
                  <div>
                    <p className={`font-semibold ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                      {formatRupiah(kelas.biaya)}
                    </p>
                    <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                      Biaya Dasar
                    </p>
                  </div>
                </div>

                {/* Jadwal */}
                {kelas.jadwal && (
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? "bg-orange-900/30" : "bg-orange-100"}`}>
                      <Calendar size={16} className={isDarkMode ? "text-orange-300" : "text-orange-600"} />
                    </div>
                    <div>
                      <p className={`font-semibold ${isDarkMode ? "text-orange-300" : "text-orange-700"}`}>
                        {kelas.jadwal}
                      </p>
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                        Jadwal
                      </p>
                    </div>
                  </div>
                )}

                {/* Ruangan */}
                {kelas.ruangan && (
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? "bg-purple-900/30" : "bg-purple-100"}`}>
                      <MapPin size={16} className={isDarkMode ? "text-purple-300" : "text-purple-600"} />
                    </div>
                    <div>
                      <p className={`font-semibold ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}>
                        {kelas.ruangan}
                      </p>
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                        Ruangan
                      </p>
                    </div>
                  </div>
                )}

                {/* Total Peserta */}
                {kelas.total_peserta !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                      <Users size={16} className={isDarkMode ? "text-blue-300" : "text-blue-600"} />
                    </div>
                    <div>
                      <p className={`font-semibold ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                        {kelas.total_peserta || 0} peserta
                      </p>
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                        Total Peserta
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Pembayaran */}
              {kelas.qr_code_url && (
                <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? "bg-slate-600/30" : "bg-gray-100"}`}>
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>
                    QR Code Pembayaran
                  </p>
                  <div 
                    className="flex justify-center cursor-pointer"
                    onClick={() => openQRModal(kelas.qr_code_url, `QR Code ${kelas.nama_kelas}`)}
                  >
                    <div className="relative group">
                      <img
                        src={kelas.qr_code_url}
                        alt={`QR Code ${kelas.nama_kelas}`}
                        className="w-32 h-32 object-contain rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-all duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-qr.png";
                        }}
                      />
                      
                      {/* Overlay effect */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all duration-300">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                          <Eye size={24} className="text-white" />
                        </div>
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        Klik untuk memperbesar
                      </div>
                    </div>
                  </div>
                  <p className={`text-xs text-center mt-2 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                    Klik QR code untuk memperbesar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Form Pembelian */}
          <div>
            <form onSubmit={handleSubmit}>
              {/* Nama - DISABLED jika dari profile */}
              <div className="mb-4">
                <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
                  Nama Lengkap *
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2 ${isDarkMode ? "!bg-slate-700 !border-slate-600" : "bg-gray-100 border-gray-300"}`}>
                  <User className={`w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`} />
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    readOnly={!!userProfile?.nama_lengkap}
                    disabled={!!userProfile?.nama_lengkap}
                    className={`flex-1 outline-none ml-2 bg-transparent ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                  {userProfile?.nama_lengkap && (
                    <Lock className={`w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`} />
                  )}
                </div>
                <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  {userProfile?.nama_lengkap ? "Nama diambil dari profil Anda" : "Wajib diisi"}
                </p>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
                  Email *
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 ring-emerald-400 ${isDarkMode ? "!bg-slate-700 !border-slate-600 !focus-within:ring-blue-500" : ""}`}>
                  <Mail className={`w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`flex-1 outline-none ml-2 ${isDarkMode ? "!bg-transparent !text-white" : ""}`}
                    placeholder="contoh@email.com"
                    required
                  />
                </div>
              </div>

              {/* Telepon */}
              <div className="mb-4">
                <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
                  Nomor Telepon *
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 ring-emerald-400 ${isDarkMode ? "!bg-slate-700 !border-slate-600 !focus-within:ring-blue-500" : ""}`}>
                  <Phone className={`w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`} />
                  <input
                    type="tel"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                    className={`flex-1 outline-none ml-2 ${isDarkMode ? "!bg-transparent !text-white" : ""}`}
                    placeholder="081234567890"
                    required
                  />
                </div>
              </div>

              {/* Tiket Kategori - DROPDOWN */}
              <div className="mb-4 relative" ref={tiketDropdownRef}>
                <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
                  Pilih Tiket Kategori *
                </label>
                <div
                  className={`border rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer focus-within:ring-2 ring-emerald-400 ${isDarkMode ? "!bg-slate-700 !border-slate-600 !focus-within:ring-blue-500 hover:!border-blue-500" : ""}`}
                  onClick={() => setTiketDropdownOpen(!tiketDropdownOpen)}
                >
                  <div className="flex items-center gap-2">
                    <Ticket className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-500"}`} />
                    <span className={isDarkMode ? "!text-white" : ""}>
                      {selectedTiket ? selectedTiket.nama_kategori : "Pilih kategori tiket"}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 ${isDarkMode ? "!text-slate-400" : ""} ${tiketDropdownOpen ? "rotate-180" : ""}`} />
                </div>

                {tiketDropdownOpen && tiketKategori.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute z-40 bg-white border rounded-lg shadow-md mt-1 w-full max-h-48 overflow-y-auto ${isDarkMode ? "!bg-slate-800 !border-slate-600" : ""}`}
                  >
                    {tiketKategori.map((tiket) => (
                      <li
                        key={tiket.id}
                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${isDarkMode ? "!text-slate-200 !hover:bg-slate-700" : ""}`}
                        onClick={() => handleSelectTiketKategori(tiket)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{tiket.nama_kategori}</div>
                            <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                              {tiket.deskripsi}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isDarkMode ? "text-emerald-300" : "text-emerald-600"}`}>
                              {formatRupiah(tiket.harga)}
                            </span>
                            {formData.tiket_kategori_id == tiket.id && (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </motion.ul>
                )}

                {selectedTiket && (
                  <div className={`mt-2 p-3 rounded-lg ${isDarkMode ? "bg-slate-700/30" : "bg-gray-100"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                          {selectedTiket.nama_kategori}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                          {selectedTiket.deskripsi}
                        </p>
                      </div>
                      <span className={`text-lg font-bold ${isDarkMode ? "text-emerald-300" : "text-emerald-600"}`}>
                        {formatRupiah(selectedTiket.harga)}
                      </span>
                    </div>
                    
                    {/* Benefits dari tiket kategori */}
                    {selectedTiket.manfaat && (
                      <div className="mt-2">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                          Benefit yang didapat:
                        </p>
                        <div className="space-y-1">
                          {selectedTiket.manfaat.split(',').map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className={`mt-0.5 flex-shrink-0 ${isDarkMode ? "text-green-400" : "text-green-500"}`} />
                              <span className={`text-xs ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                                {benefit.trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Identitas - DROPDOWN */}
              <div className="mb-4 relative" ref={dropdownRef}>
                <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
                  Identitas *
                </label>
                <div
                  className={`border rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer focus-within:ring-2 ring-emerald-400 ${isDarkMode ? "!bg-slate-700 !border-slate-600 !focus-within:ring-blue-500 hover:!border-blue-500" : ""}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className={isDarkMode ? "!text-white" : ""}>
                    {formData.identitas}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 ${isDarkMode ? "!text-slate-400" : ""} ${dropdownOpen ? "rotate-180" : ""}`} />
                </div>

                {dropdownOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute z-30 bg-white border rounded-lg shadow-md mt-1 w-full max-h-48 overflow-y-auto ${isDarkMode ? "!bg-slate-800 !border-slate-600" : ""}`}
                  >
                    {identitasOptions.map((option) => (
                      <li
                        key={option}
                        className={`flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer ${isDarkMode ? "!text-slate-200 !hover:bg-slate-700" : ""}`}
                        onClick={() => handleSelectIdentitas(option)}
                      >
                        <span>{option}</span>
                        {formData.identitas === option && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>

              {/* Metode Pembayaran - INPUT TEXT */}
              <div className="mb-4">
                <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
                  Metode Pembayaran *
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 ring-emerald-400 ${isDarkMode ? "!bg-slate-700 !border-slate-600 !focus-within:ring-blue-500" : ""}`}>
                  <CreditCard className={`w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`} />
                  <input
                    type="text"
                    name="metode_pembayaran"
                    value={formData.metode_pembayaran}
                    onChange={handleChange}
                    className={`flex-1 outline-none ml-2 ${isDarkMode ? "!bg-transparent !text-white" : ""}`}
                    placeholder="Contoh: Bank Transfer, E-Wallet, dll"
                    required
                  />
                </div>
                <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Tuliskan metode pembayaran yang digunakan
                </p>
              </div>

              {/* Bukti Pembayaran - FILE UPLOAD */}
              <div className="mb-6">
                <label className={`block text-gray-700 mb-1 ${isDarkMode ? "!text-slate-200" : ""}`}>
                  Bukti Pembayaran *
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${isDarkMode ? "!border-slate-600 hover:!border-blue-500" : "border-gray-300 hover:border-emerald-400"} transition-colors`}>
                  <input
                    type="file"
                    id="bukti-pembayaran"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    required
                  />
                  
                  {buktiPreview ? (
                    <div className="mb-2">
                      <img
                        src={buktiPreview}
                        alt="Preview bukti pembayaran"
                        className="mx-auto max-h-32 object-contain rounded"
                      />
                      <p className={`text-sm mt-2 ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                        {buktiFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Camera className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? "text-slate-400" : "text-gray-400"}`} />
                      <p className={`mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                        Klik untuk upload bukti pembayaran
                      </p>
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                        Format: JPG, PNG, GIF, WebP (max 5MB)
                      </p>
                    </div>
                  )}
                  
                  <label
                    htmlFor="bukti-pembayaran"
                    className={`inline-block mt-2 px-4 py-2 rounded-lg cursor-pointer ${isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
                  >
                    {buktiFile ? "Ganti File" : "Pilih File"}
                  </label>
                </div>
              </div>

              {/* Ringkasan Pembayaran */}
              <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? "bg-slate-700/50" : "bg-gray-100"}`}>
                <h4 className={`font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Ringkasan Pembayaran
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? "text-slate-300" : "text-gray-600"}>
                      {selectedTiket ? selectedTiket.nama_kategori : "Biaya Dasar"}
                    </span>
                    <span className={isDarkMode ? "text-slate-300" : "text-gray-600"}>
                      {formatRupiah(totalHarga)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                        Total Pembayaran
                      </span>
                      <span className={`text-xl font-bold ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                        {formatRupiah(totalHarga)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol */}
              <div className="flex justify-between mt-6 gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-5 py-3 rounded-lg hover:opacity-90 transition-all shadow-md font-semibold disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "Beli Tiket"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => navigate(`/detail-kelas-user/${id}`)}
                  className={`flex-1 bg-gray-400 text-white px-5 py-3 rounded-lg hover:bg-gray-500 transition-all shadow-md font-semibold ${isDarkMode ? "!bg-slate-600 !hover:bg-slate-500" : ""}`}
                >
                  Batalkan
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Modal untuk QR Code */}
      <AnimatePresence>
        {showQRModal && modalImageUrl && (
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
              
              {/* Container QR Code */}
              <div className={`p-6 rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
                {/* Judul */}
                <h3 className={`text-xl font-bold mb-4 text-center ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  QR Code Pembayaran
                </h3>
                
                {/* QR Code */}
                <div className="flex justify-center p-6 bg-white rounded-lg">
                  <img
                    src={modalImageUrl}
                    alt={modalImageAlt}
                    className="max-w-full max-h-[60vh] object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-qr.png";
                    }}
                  />
                </div>
                
                {/* Caption dan Informasi */}
                <div className="text-center mt-4 space-y-2">
                  <p className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    {modalImageAlt}
                  </p>
                  <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                    Scan QR code untuk melakukan pembayaran
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                    Gunakan aplikasi pembayaran digital untuk scan QR code ini
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"} mt-4`}>
                    Klik di luar gambar untuk menutup
                  </p>
                </div>
                
                {/* Tombol untuk copy atau download */}
                <div className="flex justify-center gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = modalImageUrl;
                      link.download = `qr-code-${kelas.nama_kelas.replace(/\s+/g, '-').toLowerCase()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success("✅ QR code berhasil diunduh");
                    }}
                    className={`px-4 py-2 rounded-lg ${isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                  >
                    Download QR Code
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeImageModal}
                    className={`px-4 py-2 rounded-lg ${isDarkMode ? "bg-slate-600 hover:bg-slate-500 text-white" : "bg-gray-300 hover:bg-gray-400 text-gray-700"}`}
                  >
                    Tutup
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
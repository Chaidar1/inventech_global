import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Camera,
  Trash2,
  AlertCircle,
  Info,
  Eye,
  EyeOff // Import EyeOff
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function KelolaProfile() {
  const { isDarkMode } = useAppTheme();
  const location = useLocation();
  const navigate = useNavigate();

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

  const [profile, setProfile] = useState({
    username: "",
    nama_lengkap: "",
    email: "",
    no_telepon: "",
    alamat: "",
    role: "",
    created_at: "",
    foto_profil: "",
  });

  const [passwordData, setPasswordData] = useState({
    password_lama: "",
    password_baru: "",
    konfirmasi_password: "",
  });

  // State untuk toggle show/hide password
  const [showPasswords, setShowPasswords] = useState({
    password_lama: false,
    password_baru: false,
    konfirmasi_password: false
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [photoFeatureAvailable, setPhotoFeatureAvailable] = useState(true);
  
  // State untuk modal konfirmasi hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const getToken = () => localStorage.getItem("token");

  // Fungsi untuk mendapatkan URL foto profil
  const getProfilePictureUrl = (filename) => {
    if (!filename) return null;
    return `http://localhost:8000/uploads/profile_pictures/${filename}`;
  };

  // Fungsi untuk navigasi ke halaman ViewProfilePhoto
  const handleViewProfilePhoto = () => {
    if (profile.foto_profil) {
      navigate("/view-profile-photo");
    } else {
      toast.info("Tidak ada foto profil untuk dilihat");
    }
  };

  const formatTanggalBergabung = (createdAt) => {
    if (!createdAt) return "-";
    
    try {
      let dateObj;
      
      if (typeof createdAt === 'string') {
        if (createdAt.includes(' ')) {
          dateObj = new Date(createdAt.replace(' ', 'T'));
        } else if (createdAt.includes('T')) {
          dateObj = new Date(createdAt);
        } else {
          dateObj = new Date(createdAt);
        }
      } else {
        dateObj = new Date(createdAt);
      }
      
      if (isNaN(dateObj.getTime())) {
        console.warn("Format tanggal tidak valid:", createdAt);
        return "-";
      }
      
      return dateObj.toLocaleDateString("id-ID", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch("http://localhost:8000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data profil");
      
      const data = await res.json();
      
      console.log("Profile data from API:", data);
      
      setProfile(data);
      localStorage.setItem("profile", JSON.stringify(data));

      // Cek apakah foto_profil ada di response (indikator fitur tersedia)
      if (data.foto_profil !== undefined) {
        setPhotoFeatureAvailable(true);
      }
      
    } catch (err) {
      setErrorMsg(err.message);
      toast.error("Gagal mengambil data profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("profile");
    if (cached) {
      const cachedProfile = JSON.parse(cached);
      setProfile(cachedProfile);
      console.log("Cached profile:", cachedProfile);
    }
    fetchProfile();
  }, [location.pathname]);

  // Upload foto profil dengan error handling yang lebih baik
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validasi file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau GIF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    try {
      setUploading(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/profile/upload-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Jika error karena kolom tidak ada atau masalah database
        if (data.detail && (
          data.detail.includes("database") || 
          data.detail.includes("foto_profil") ||
          data.detail.includes("kolom") ||
          data.detail.includes("column")
        )) {
          setPhotoFeatureAvailable(false);
          toast.error("Fitur foto profil sedang dalam perbaikan. Silakan coba lagi nanti.");
          return;
        }
        throw new Error(data.detail || "Gagal mengupload foto");
      }

      toast.success("Foto profil berhasil diupload!");
      setPhotoFeatureAvailable(true);
      
      // Update profile dengan foto baru
      await fetchProfile();
      
      // Update navbar dengan memicu event storage
      window.dispatchEvent(new Event('storage'));
      
    } catch (err) {
      console.error("Upload error:", err);
      
      // Deteksi error database dari message
      if (err.message.includes("database") || err.message.includes("foto_profil")) {
        setPhotoFeatureAvailable(false);
        toast.error("Fitur foto profil sedang dalam perbaikan.");
      } else {
        toast.error(err.message);
      }
    } finally {
      setUploading(false);
      event.target.value = ""; // Reset input file
    }
  };

  // Modal konfirmasi hapus foto
  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeleteConfirmText("");
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText("");
    setIsDeleting(false);
  };

  // Hapus foto profil dengan konfirmasi yang lebih baik
  const handleDeletePhoto = async () => {
    if (deleteConfirmText.toLowerCase() !== "hapus") {
      toast.error("Silakan ketik 'hapus' untuk mengonfirmasi");
      return;
    }

    try {
      setIsDeleting(true);
      const token = getToken();

      const res = await fetch("http://localhost:8000/profile/photo", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (data.detail && (
          data.detail.includes("database") || 
          data.detail.includes("foto_profil") ||
          data.detail.includes("kolom") ||
          data.detail.includes("column")
        )) {
          setPhotoFeatureAvailable(false);
          toast.error("Fitur foto profil sedang dalam perbaikan.");
          return;
        }
        throw new Error(data.detail || "Gagal menghapus foto");
      }

      toast.success("Foto profil berhasil dihapus!");
      setPhotoFeatureAvailable(true);
      
      // Update profile tanpa foto
      await fetchProfile();
      
      // Update navbar
      window.dispatchEvent(new Event('storage'));
      
      // Tutup modal
      closeDeleteModal();
      
    } catch (err) {
      console.error("Delete error:", err);
      
      if (err.message.includes("database") || err.message.includes("foto_profil")) {
        setPhotoFeatureAvailable(false);
        toast.error("Fitur foto profil sedang dalam perbaikan.");
      } else {
        toast.error(err.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profile.nama_lengkap || !profile.email)
      return toast.warn("Nama lengkap dan email harus diisi.");

    try {
      setUpdating(true);
      const token = getToken();
      const res = await fetch("http://localhost:8000/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_lengkap: profile.nama_lengkap,
          email: profile.email,
          no_telepon: profile.no_telepon,
          alamat: profile.alamat,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal memperbarui profil");

      toast.success("Profil berhasil diperbarui!");
      localStorage.removeItem("profile");
      
      if (data.profile) {
        setProfile(data.profile);
        localStorage.setItem("profile", JSON.stringify(data.profile));
      }

      await fetchProfile();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { password_lama, password_baru, konfirmasi_password } = passwordData;
    if (!password_lama || !password_baru)
      return toast.warn("Password lama dan baru wajib diisi.");
    if (password_baru.length < 6)
      return toast.warn("Password baru minimal 6 karakter.");
    if (password_baru !== konfirmasi_password)
      return toast.warn("Konfirmasi password tidak sesuai.");

    try {
      setUpdating(true);
      const token = getToken();
      const res = await fetch("http://localhost:8000/profile/password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password_lama, password_baru }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal mengubah password");
      toast.success("Password berhasil diubah!");
      setPasswordData({
        password_lama: "",
        password_baru: "",
        konfirmasi_password: "",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePasswordChangeInput = (e) =>
    setPasswordData((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Fungsi untuk toggle show/hide password
  const toggleShowPassword = (fieldName) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-500 relative ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white"
          : "bg-gradient-to-br from-orange-50 via-white to-yellow-50 text-gray-900"
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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme={isDarkMode ? "dark" : "light"}
      />

      {/* Modal Konfirmasi Hapus Foto */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-2xl p-6 w-full max-w-md relative z-50 ${
                isDarkMode 
                  ? "bg-slate-800 border border-slate-700" 
                  : "bg-white border border-orange-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${
                  isDarkMode ? "bg-red-900/50" : "bg-red-100"
                }`}>
                  <AlertCircle 
                    size={24} 
                    className={isDarkMode ? "text-red-400" : "text-red-600"} 
                  />
                </div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  Hapus Foto Profil
                </h3>
              </div>

              <div className="space-y-4">
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? "bg-slate-700/50" : "bg-orange-50"
                }`}>
                  <div className="flex items-start gap-2">
                    <Info size={16} className={`mt-0.5 ${
                      isDarkMode ? "text-blue-400" : "text-orange-500"
                    }`} />
                    <p className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Tindakan ini akan menghapus foto profil Anda secara permanen. 
                      Anda tidak dapat mengembalikan foto ini setelah dihapus.
                    </p>
                  </div>
                </div>

                <div>
                  <p className={`text-sm mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Ketik <span className="font-bold text-red-500">hapus</span> untuk mengonfirmasi:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="hapus"
                    className={`w-full border rounded-lg px-3 py-2 text-sm transition-all duration-300 ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500"
                        : "border-gray-300 focus:ring-2 focus:ring-red-500"
                    }`}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                      isDarkMode
                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeletePhoto}
                    disabled={isDeleting || deleteConfirmText.toLowerCase() !== "hapus"}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                      isDarkMode
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    } ${
                      (isDeleting || deleteConfirmText.toLowerCase() !== "hapus") 
                        ? "opacity-50 cursor-not-allowed" 
                        : ""
                    }`}
                  >
                    {isDeleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
                          isDarkMode ? "border-white" : "border-white"
                        }`}></div>
                        Menghapus...
                      </span>
                    ) : (
                      "Hapus Foto"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <h1
          className={`text-3xl font-bold mb-4 ${
            isDarkMode ? "text-blue-400" : "text-orange-600"
          }`}
        >
          Kelola Profil
        </h1>

        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium w-fit mx-auto ${
                isDarkMode
                  ? "bg-red-900/70 text-red-200 border border-red-700"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              <AlertTriangle size={22} />
              {errorMsg}
              <button
                onClick={() => setErrorMsg("")}
                className="ml-2 hover:opacity-70"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center"
            >
              <CheckCircle2
                size={70}
                className={isDarkMode ? "text-blue-400" : "text-green-500"}
              />
              <p className="mt-2 font-semibold">
                {success && "Perubahan berhasil disimpan!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
              isDarkMode ? "border-blue-400" : "border-orange-500"
            }`}></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Foto Profil Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`rounded-3xl p-8 shadow-xl backdrop-blur-sm ${
                isDarkMode
                  ? "bg-slate-800/70 border border-slate-700"
                  : "bg-white border border-orange-100"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <Camera
                  size={28}
                  className={isDarkMode ? "text-blue-400" : "text-orange-500"}
                />
                <h2 className="text-xl font-bold">Foto Profil</h2>
                
                {/* Status Fitur */}
                {!photoFeatureAvailable && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode 
                      ? "bg-yellow-800 text-yellow-200" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    Fitur Sementara Tidak Tersedia
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center space-y-4">
                {/* Foto Profil - Bisa Diklik */}
                <div className="relative">
                  {profile.foto_profil ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer relative group"
                      onClick={handleViewProfilePhoto}
                    >
                      <img
                        src={getProfilePictureUrl(profile.foto_profil)}
                        alt="Foto Profil"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-lg"
                        onError={(e) => {
                          // Fallback jika gambar tidak bisa dimuat
                          e.target.style.display = 'none';
                        }}
                      />
                      {/* Overlay dengan icon Eye */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300">
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
                    <div 
                      className={`w-32 h-32 rounded-full flex items-center justify-center border-4 cursor-pointer transition-all duration-300 hover:border-blue-400 hover:shadow-lg ${
                        isDarkMode ? "border-slate-600 bg-slate-700" : "border-gray-300 bg-gray-100"
                      }`}
                      onClick={handleViewProfilePhoto}
                    >
                      <User size={48} className="text-gray-400" />
                    </div>
                  )}
                  
                  {/* Loading Overlay */}
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                        isDarkMode ? "border-blue-400" : "border-white"
                      }`}></div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <label
                    className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-300 ${
                      isDarkMode
                        ? "bg-blue-600 hover:bg-blue-500"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    } ${uploading || !photoFeatureAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading || !photoFeatureAvailable}
                      className="hidden"
                    />
                    {uploading ? "Uploading..." : "Ubah Foto"}
                  </label>

                  {profile.foto_profil && photoFeatureAvailable && (
                    <button
                      onClick={openDeleteModal}
                      disabled={uploading || !photoFeatureAvailable}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        isDarkMode
                          ? "bg-red-600 hover:bg-red-500"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Trash2 size={18} className="inline mr-2" />
                      Hapus
                    </button>
                  )}
                </div>

                <p className={`text-sm text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {photoFeatureAvailable ? (
                    "Format: JPG, PNG, GIF (Maks. 5MB)"
                  ) : (
                    <span className={isDarkMode ? "text-yellow-400" : "text-yellow-600"}>
                      ⚠️ Fitur foto profil sedang dalam perbaikan
                    </span>
                  )}
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Informasi Profil */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`rounded-3xl p-8 shadow-xl backdrop-blur-sm ${
                  isDarkMode
                    ? "bg-slate-800/70 border border-slate-700"
                    : "bg-white border border-orange-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <User
                    size={28}
                    className={isDarkMode ? "text-blue-400" : "text-orange-500"}
                  />
                  <h2 className="text-xl font-bold">Informasi Profil</h2>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <InputField
                    label="Username"
                    name="username"
                    value={profile.username}
                    disabled
                    icon={<User />}
                    isDarkMode={isDarkMode}
                  />
                  <InputField
                    label="Nama Lengkap"
                    name="nama_lengkap"
                    value={profile.nama_lengkap}
                    onChange={handleInputChange}
                    isDarkMode={isDarkMode}
                    required
                  />
                  <InputField
                    label="Email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    isDarkMode={isDarkMode}
                    icon={<Mail />}
                  />
                  <InputField
                    label="Nomor Telepon"
                    name="no_telepon"
                    value={profile.no_telepon}
                    onChange={handleInputChange}
                    isDarkMode={isDarkMode}
                    icon={<Phone />}
                  />
                  <InputField
                    label="Alamat"
                    name="alamat"
                    value={profile.alamat}
                    onChange={handleInputChange}
                    isDarkMode={isDarkMode}
                    multiline
                  />
                  <InputField
                    label="Role"
                    value={profile.role}
                    disabled
                    isDarkMode={isDarkMode}
                    icon={<Shield />}
                  />

                  <button
                    type="submit"
                    disabled={updating}
                    className={`w-full font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 ${
                      isDarkMode
                        ? "bg-blue-600 hover:bg-blue-500"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {updating ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </form>
              </motion.div>

              {/* Ubah Password */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`rounded-3xl p-8 shadow-xl backdrop-blur-sm ${
                  isDarkMode
                    ? "bg-slate-800/70 border border-slate-700"
                    : "bg-white border border-orange-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Lock
                    size={28}
                    className={isDarkMode ? "text-blue-400" : "text-orange-500"}
                  />
                  <h2 className="text-xl font-bold">Ubah Password</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <PasswordField
                    label="Password Lama"
                    name="password_lama"
                    value={passwordData.password_lama}
                    onChange={handlePasswordChangeInput}
                    showPassword={showPasswords.password_lama}
                    onToggleShowPassword={() => toggleShowPassword('password_lama')}
                    isDarkMode={isDarkMode}
                    required
                  />
                  <PasswordField
                    label="Password Baru"
                    name="password_baru"
                    value={passwordData.password_baru}
                    onChange={handlePasswordChangeInput}
                    showPassword={showPasswords.password_baru}
                    onToggleShowPassword={() => toggleShowPassword('password_baru')}
                    isDarkMode={isDarkMode}
                    required
                  />
                  <PasswordField
                    label="Konfirmasi Password"
                    name="konfirmasi_password"
                    value={passwordData.konfirmasi_password}
                    onChange={handlePasswordChangeInput}
                    showPassword={showPasswords.konfirmasi_password}
                    onToggleShowPassword={() => toggleShowPassword('konfirmasi_password')}
                    isDarkMode={isDarkMode}
                    required
                  />

                  <button
                    type="submit"
                    disabled={updating}
                    className={`w-full font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 ${
                      isDarkMode
                        ? "bg-blue-600 hover:bg-blue-500"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {updating ? "Memproses..." : "Ubah Password"}
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Info Akun */}
            <div
              className={`mt-8 rounded-3xl p-6 border shadow-lg backdrop-blur-sm ${
                isDarkMode
                  ? "bg-slate-800/70 border-slate-700"
                  : "bg-white border-orange-100"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Calendar
                  size={26}
                  className={isDarkMode ? "text-blue-400" : "text-orange-500"}
                />
                <h3 className="text-lg font-semibold">Informasi Akun</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p>
                  <span className="font-semibold">Tanggal Bergabung:</span>{" "}
                  {formatTanggalBergabung(profile.created_at)}
                </p>
                <p>
                  <span className="font-semibold">Role Akun:</span>{" "}
                  {profile.role || "-"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// InputField Component
function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  icon,
  disabled,
  isDarkMode,
  multiline,
}) {
  const commonClass = `w-full border rounded-xl px-4 py-3 mt-1 transition-all duration-300 ${
    isDarkMode
      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
      : "border-gray-300 focus:ring-2 focus:ring-orange-500"
  }`;
  return (
    <div>
      <label className="font-semibold flex items-center gap-2 mb-1">
        {icon} {label}
      </label>
      {multiline ? (
        <textarea
          rows={3}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={commonClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={commonClass}
        />
      )}
    </div>
  );
}

// PasswordField Component dengan toggle show/hide
function PasswordField({
  label,
  name,
  value,
  onChange,
  showPassword,
  onToggleShowPassword,
  isDarkMode,
  required,
}) {
  const commonClass = `w-full border rounded-xl px-4 py-3 mt-1 transition-all duration-300 ${
    isDarkMode
      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
      : "border-gray-300 focus:ring-2 focus:ring-orange-500"
  }`;

  return (
    <div>
      <label className="font-semibold flex items-center gap-2 mb-1">
        <Lock size={16} /> {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`${commonClass} pr-10`}
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
            isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
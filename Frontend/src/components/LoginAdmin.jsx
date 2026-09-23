import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, User, Lock, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginAdmin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Fungsi untuk menangani logout yang lengkap
  const handleCompleteLogout = async (token = null) => {
    try {
      // Panggil endpoint logout di backend jika ada token
      if (token) {
        await axios.post("http://localhost:8000/logout", {}, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear semua data admin dari localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("loginUsername");
      localStorage.removeItem("nama_lengkap");
      localStorage.removeItem("profile");
      localStorage.removeItem("lastActiveTime");
      localStorage.removeItem("wasAdmin");
      
      // Trigger update untuk navbar
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.warning("⚠️ Username dan Password wajib diisi!");
      return;
    }

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // Cek apakah user adalah admin
      if (res.data.role !== "admin") {
        toast.error("❌ Hanya admin yang bisa login di sini!");
        setLoading(false);
        return;
      }

      // Simpan data ke localStorage
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("loginUsername", username);
      localStorage.setItem("nama_lengkap", res.data.nama_lengkap || "");

      // Simpan profile data
      const profileData = {
        username: res.data.username,
        nama_lengkap: res.data.nama_lengkap || "",
        email: res.data.email || "",
        foto_profil: res.data.foto_profil || null,
        role: res.data.role
      };
      localStorage.setItem("profile", JSON.stringify(profileData));

      // Set last active time untuk inactivity detection
      localStorage.setItem("lastActiveTime", Date.now().toString());

      // Trigger update untuk navbar (jika ada)
      window.dispatchEvent(new Event('storage'));

      toast.success("✅ Login admin berhasil!");

      // Redirect ke dashboard admin
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 600);
      
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        toast.error("❌ Username atau password salah!");
      } else {
        toast.error("❌ Terjadi kesalahan. Coba lagi!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect untuk auto logout dan session management
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    // Redirect jika sudah login sebagai admin
    if (token && role === "admin") {
      navigate("/admin/dashboard");
      return; // Jangan jalankan auto logout logic jika sudah redirect
    }
    
    // ==================== AUTO LOGOUT LOGIC ====================
    // Fungsi untuk reset inactivity timer
    const resetInactiveTimer = () => {
      localStorage.setItem("lastActiveTime", Date.now().toString());
    };

    // Fungsi untuk cek validitas token
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");
      if (!token) return false;
      
      try {
        await axios.get("http://localhost:8000/auth/check", {
          headers: { Authorization: `Bearer ${token}` }
        });
        return true;
      } catch (error) {
        return false;
      }
    };

    // Event listener untuk detect tab/window close atau refresh
    const handleBeforeUnload = (e) => {
      // Hanya logout admin jika ada token dan role admin
      if (localStorage.getItem("role") === "admin") {
        const token = localStorage.getItem("token");
        // Clear data admin dari localStorage
        handleCompleteLogout(token);
      }
    };

    // Event listener untuk visibility change (tab switch)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        // User berpindah tab/minimize
        const lastActive = Date.now();
        localStorage.setItem("lastActiveTime", lastActive.toString());
      } else if (document.visibilityState === 'visible') {
        // User kembali ke tab - cek apakah masih admin
        const role = localStorage.getItem("role");
        if (role === "admin") {
          const lastActive = localStorage.getItem("lastActiveTime");
          const currentTime = Date.now();
          const inactiveDuration = currentTime - (parseInt(lastActive) || 0);
          
          // Jika inactive lebih dari 30 menit (1.8e6 ms), logout
          const MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 menit
          
          if (lastActive && inactiveDuration > MAX_INACTIVE_TIME) {
            const token = localStorage.getItem("token");
            toast.info("⏰ Sesi telah berakhir karena tidak aktif");
            handleCompleteLogout(token);
            navigate("/admin/login");
          } else {
            // Cek token masih valid
            const isValid = await checkTokenValidity();
            if (!isValid) {
              const token = localStorage.getItem("token");
              toast.info("🔒 Sesi tidak valid. Silakan login kembali");
              handleCompleteLogout(token);
              navigate("/admin/login");
            }
          }
        }
      }
    };

    // Event listener untuk pagehide (mobile safari)
    const handlePageHide = () => {
      if (localStorage.getItem("role") === "admin") {
        localStorage.setItem("wasAdmin", "true");
      }
    };

    // Event listener untuk pageshow (ketika kembali)
    const handlePageShow = (e) => {
      if (e.persisted) {
        // Page di-load dari cache
        if (localStorage.getItem("wasAdmin") === "true") {
          localStorage.removeItem("wasAdmin");
          // Cek token masih valid
          checkTokenValidity().then(isValid => {
            if (!isValid && localStorage.getItem("role") === "admin") {
              const token = localStorage.getItem("token");
              handleCompleteLogout(token);
              navigate("/admin/login");
            }
          });
        }
      }
    };

    // Cek interval untuk auto logout setelah waktu tertentu
    const inactivityCheckInterval = setInterval(async () => {
      const role = localStorage.getItem("role");
      if (role === "admin") {
        const lastActive = localStorage.getItem("lastActiveTime");
        const currentTime = Date.now();
        const inactiveDuration = currentTime - (parseInt(lastActive) || currentTime);
        const MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 menit
        
        if (inactiveDuration > MAX_INACTIVE_TIME) {
          const token = localStorage.getItem("token");
          toast.info("⏰ Sesi telah berakhir karena tidak aktif");
          handleCompleteLogout(token);
          navigate("/admin/login");
          clearInterval(inactivityCheckInterval);
        } else if (inactiveDuration > 25 * 60 * 1000) {
          // Warning 5 menit sebelum logout
          toast.warning("⚠️ Sesi akan berakhir dalam 5 menit");
        }
      }
    }, 60000); // Cek setiap 1 menit

    // Tambahkan event listeners untuk reset timer
    const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetInactiveTimer);
    });

    // Tambahkan event listeners untuk session management
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      
      events.forEach(event => {
        window.removeEventListener(event, resetInactiveTimer);
      });
      
      clearInterval(inactivityCheckInterval);
    };
  }, [navigate]);

  // Enhanced Background Particles for Dark Mode
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  const initParticles = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener("resize", resize);

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

  useEffect(() => {
    let cleanupResize;
    
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
  }, []);

  // Effect untuk handle visibility change untuk particles
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          initParticles();
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]">
      
      {/* Enhanced Background Particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Background Pattern yang lebih subtle */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden w-full max-w-4xl relative z-10 bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50"
      >
        
        {/* Header dengan Logo */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 z-20">
          <div className="p-2 bg-[#D7FE51] rounded-lg">
            <Shield className="w-6 h-6 text-[#1A1F16]" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm md:text-base font-bold text-white">
              Admin Panel
            </span>
            <span className="text-[10px] md:text-xs text-[#ABB89D]">
              Restricted Access
            </span>
          </div>
        </div>

        {/* Bagian Kiri - Form Login */}
        <div className="md:w-[50%] w-full p-6 md:p-10 flex flex-col justify-center relative z-10 pt-20 md:pt-16">
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D7FE51]/20 mb-4">
              <Shield className="w-6 h-6 text-[#D7FE51]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Admin Login
            </h1>
            <p className="text-[#ABB89D] text-sm md:text-base mb-6">
              Area terbatas untuk administrator website
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#ABB89D]">
                Username 
              </label>
              <div className="flex items-center border-2 rounded-xl px-3 py-3 transition-all duration-300 bg-[#2A3025] border-[#363D30] focus-within:border-[#D7FE51]">
                <User className="w-5 h-5 text-[#ABB89D]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  className="flex-1 ml-3 outline-none bg-transparent text-sm md:text-base text-white placeholder-[#ABB89D]/60"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#ABB89D]">
                Password
              </label>
              <div className="flex items-center border-2 rounded-xl px-3 py-3 transition-all duration-300 bg-[#2A3025] border-[#363D30] focus-within:border-[#D7FE51]">
                <Lock className="w-5 h-5 text-[#ABB89D]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="flex-1 ml-3 outline-none bg-transparent text-sm md:text-base text-white placeholder-[#ABB89D]/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-[#ABB89D] hover:text-white transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              className="w-full py-3 mt-6 rounded-xl font-bold text-[#1A1F16] text-sm md:text-base shadow-md transition-all duration-300 bg-gradient-to-r from-[#D7FE51] to-[#C4E840] hover:from-[#C4E840] hover:to-[#B1D82F] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[#1A1F16] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Memverifikasi...
                </span>
              ) : (
                "MASUK SEBAGAI ADMIN →"
              )}
            </button>

            {/* Pesan Peringatan */}
            <div className="mt-4 p-3 bg-[#363D30]/30 border border-[#363D30]/50 rounded-lg">
              <p className="text-xs text-[#ABB89D]">
                ⚠️ <strong>Perhatian:</strong> Halaman ini hanya untuk administrator website yang sah. 
                Setiap aktivitas login akan dicatat.
              </p>
            </div>

            {/* Link ke Login User Biasa */}
            <div className="text-center mt-4 text-sm md:text-base text-[#ABB89D]">
              Bukan admin?{" "}
              <Link 
                to="/" 
                className="font-semibold text-[#D7FE51] hover:text-[#C4E840] transition-colors duration-300"
              >
                Kembali ke halaman utama
              </Link>
            </div>
          </form>
        </div>

        {/* Bagian Kanan - Informasi Admin */}
        <div className="md:w-[50%] w-full flex flex-col items-center justify-center p-8 md:p-12 relative bg-gradient-to-br from-[#1A1F16]/80 to-[#0A0E0B]/80 border-l border-[#363D30]/50">
          <div className="max-w-sm">
            <div className="mb-8">
              <h2 className="text-white font-bold text-xl md:text-2xl text-center mb-3">
                Administrator Access
              </h2>
              <p className="text-[#ABB89D] text-center text-sm md:text-base">
                Akses terbatas untuk mengelola konten, event, dan data website
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#363D30] rounded-lg mt-1">
                  <Shield className="w-4 h-4 text-[#D7FE51]" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Kelola Event</h4>
                  <p className="text-[#ABB89D] text-xs">Tambah, edit, hapus event</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#363D30] rounded-lg mt-1">
                  <Shield className="w-4 h-4 text-[#ABB89D]" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Lihat Peserta</h4>
                  <p className="text-[#ABB89D] text-xs">Kelola data pendaftar event</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#363D30] rounded-lg mt-1">
                  <Shield className="w-4 h-4 text-[#D7FE51]" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Edit Konten</h4>
                  <p className="text-[#ABB89D] text-xs">Update halaman website</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
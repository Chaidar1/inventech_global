import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  Sun,
  Moon,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";

export default function RegisterUser() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nama_lengkap: "",
    email: "",
    no_telepon: "",
    alamat: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useAppTheme();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.username ||
      !formData.password ||
      !formData.nama_lengkap ||
      !formData.email
    ) {
      toast.warning("⚠️ Semua field wajib diisi!");
      return;
    }
    if (formData.username.length < 3) {
      toast.warning("⚠️ Username minimal 3 karakter!");
      return;
    }
    if (formData.password.length < 6) {
      toast.warning("⚠️ Password minimal 6 karakter!");
      return;
    }
    // const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    // if (!emailRegex.test(formData.email)) {
    //   toast.warning("⚠️ Format email tidak valid!");
    //   return;
    // }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/register", formData, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("✅ Registrasi berhasil! Silakan login.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.detail || "❌ Terjadi kesalahan saat registrasi!");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-500 relative overflow-hidden ${
        isDarkMode
          ? "bg-slate-900"
          : "bg-gradient-to-br from-orange-100 via-white to-orange-50"
      }`}
    >
      {/* Canvas untuk particles di dark mode - SAMA DENGAN LOGIN.JSX */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden w-full max-w-4xl relative z-10 ${
          isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
        }`}
      >
        {/* Logo Header */}
        <div
          className={`absolute top-3 left-3 md:top-5 md:left-5 flex items-center gap-2 z-20
          px-3 py-2 rounded-xl backdrop-blur-lg shadow-md border transition-all duration-300
          ${isDarkMode
            ? "bg-slate-900/90 border-slate-700"
            : "bg-white/90 border-gray-200"
          }`}
        >
          <img
            src="/Logo PT.png"
            alt="Logo"
            className={`h-6 w-6 md:h-7 md:w-7 object-contain transition-transform duration-300 ${
              isDarkMode ? "" : "brightness-110 contrast-125"
            }`}
          />
          <div className="flex flex-col leading-tight">
            <span
              className={`text-sm md:text-base font-bold tracking-tight ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Inventech
            </span>
            <span
              className={`text-[10px] md:text-xs ${
                isDarkMode ? "text-slate-400" : "text-gray-600"
              }`}
            >
              PT Inventech Global
            </span>
          </div>
        </div>

        {/* Tombol navigasi kanan */}
        <div className="absolute top-3 right-3 md:top-5 md:right-5 flex items-center gap-2 z-20">
          <Link
            to="/login"
            className={`p-3 rounded-xl transition-all duration-300 ${
              isDarkMode
                ? "bg-slate-700 hover:bg-slate-600 shadow-lg"
                : "bg-gray-200 hover:bg-gray-300 shadow-md"
            }`}
            title="Kembali ke Login"
          >
            <ArrowLeft
              className={`w-5 h-5 ${
                isDarkMode ? "text-white" : "text-gray-700"
              }`}
            />
          </Link>
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all duration-300 ${
              isDarkMode
                ? "bg-indigo-600 hover:bg-indigo-500 shadow-lg"
                : "bg-orange-500 hover:bg-orange-600 shadow-md"
            }`}
            title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* === Bagian Form (lebih kecil) === */}
        <div className="md:w-[45%] w-full p-6 md:p-10 flex flex-col justify-center relative z-10 pt-24 md:pt-20">
          <h1
            className={`text-2xl md:text-3xl font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Register
          </h1>
          <p
            className={`mb-6 text-sm md:text-base ${
              isDarkMode ? "text-slate-300" : "text-gray-600"
            }`}
          >
            Hallo! Selamat Datang
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: "nama_lengkap", icon: User, placeholder: "Nama Lengkap" },
              { name: "username", icon: User, placeholder: "Username" },
              { name: "email", icon: Mail, placeholder: "Email/No Telepon" },
              { name: "password", icon: Lock, placeholder: "Password" },
              { name: "alamat", icon: MapPin, placeholder: "Alamat" },
            ].map(({ name, icon: Icon, placeholder }) => (
              <div
                key={name}
                className={`flex items-center border-2 rounded-xl px-3 py-2 transition-all duration-300 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 focus-within:border-blue-500"
                    : "bg-white border-gray-300 focus-within:border-orange-500"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-slate-400" : "text-gray-500"
                  }`}
                />
                <input
                  type={
                    name === "password"
                      ? showPassword
                        ? "text"
                        : "password"
                      : "text"
                  }
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={`flex-1 ml-3 bg-transparent outline-none text-sm md:text-base ${
                    isDarkMode
                      ? "text-white placeholder-slate-400"
                      : "text-gray-800 placeholder-gray-500"
                  }`}
                  required
                />
                {name === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`ml-2 ${
                      isDarkMode
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>
            ))}

            <button
              type="submit"
              className={`w-full py-3 mt-4 rounded-xl font-bold text-white text-sm md:text-base shadow-md transition-all duration-300 ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
              disabled={loading}
            >
              {loading ? "Memproses..." : "REGISTER →"}
            </button>
          </form>
        </div>

        {/* === Bagian Ilustrasi === */}
        <div
          className={`md:w-[55%] w-full flex flex-col items-center justify-center p-8 md:p-12 relative ${
            isDarkMode
              ? "bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900"
              : "bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500"
          }`}
        >
          <img
            src="/Logo PT.png"
            alt="Ilustrasi"
            className="h-28 md:h-36 object-contain mb-6"
          />
          <h2 className="text-white font-bold text-xl md:text-2xl text-center">
            PT INVENTECH GLOBAL
          </h2>
          <p className="text-white/90 text-center text-sm md:text-base mt-3 max-w-sm">
            Bergabung dengan sistem inventaris kami untuk kemudahan manajemen dan peminjaman barang.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
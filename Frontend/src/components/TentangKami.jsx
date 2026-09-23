import { motion } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";
import { useState, useEffect, useRef } from "react";
import {
  Users,
  Target,
  Award,
  MapPin,
  Calendar,
  Heart,
  Globe,
  Shield,
  Clock,
  Star,
  Trophy,
  Flag,
  Zap,
  Activity,
  Coffee,
  Utensils,
  ChefHat,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  ArrowRight,
  Award as AwardIcon,
  Users as UsersIcon,
  Target as TargetIcon,
  X,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Briefcase,
  List,
  User
} from "lucide-react";

// Import GroupsIcon dari Material-UI
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from "react-router-dom";

export default function TentangKami() {
  const { themeClasses, isDarkMode } = useAppTheme();
  const navigate = useNavigate();

  // State untuk data Tentang Kami
  const [tentangKamiData, setTentangKamiData] = useState({
    hero_title: "Tentang Kami",
    hero_subtitle: "Mengenal Lebih Dekat",
    hero_description: "Kami adalah platform yang berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat.",
    statistik: [
      { number: "500+", label: "Proyek Selesai", icon: "Calendar" },
      { number: "50+", label: "Klien Puas", icon: "Users" },
      { number: "25+", label: "Kota Terjangkau", icon: "MapPin" },
      { number: "98%", label: "Kepuasan Klien", icon: "Star" }
    ],
    kontak_info: {
      email: "info@perusahaan.com",
      phone: "+62 812 3456 7890",
      address: "Jl. Contoh No. 123, Jakarta Pusat",
      social_media: {
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        twitter: "https://twitter.com",
        youtube: "https://youtube.com"
      }
    }
  });

  // State untuk data footer kontak dari admin
  const [footerKontakData, setFooterKontakData] = useState({
    email: "",
    phone: "",
    address: "",
    description: "",
    copyright: "",
    social_media: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: ""
    }
  });

  // State untuk data tim dari database
  const [timData, setTimData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTim, setLoadingTim] = useState(true);
  const [loadingFooter, setLoadingFooter] = useState(true);

  // State untuk modal foto tim
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // === Enhanced Background Particles for Dark Mode ===
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Fungsi untuk inisialisasi particles
  const initParticles = () => {
    if (!isDarkMode || !canvasRef.current) return;

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
    for (let i = 0; i < 80; i++) { // Reduced for mobile performance
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1, // Smaller particles
        dx: (Math.random() - 0.5) * 0.3, // Slower movement
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.2, // Lower opacity
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.01
      });
    }

    particlesRef.current = particles;

    const animate = () => {
      if (!canvasRef.current || !particlesRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        const pulseFactor = Math.sin(p.pulse) * 0.1 + 0.9; // Reduced pulse
        p.pulse += p.pulseSpeed;

        ctx.save();
        ctx.globalAlpha = p.opacity * pulseFactor;
        ctx.fillStyle = "rgba(255, 255, 255, 1)";

        if (p.r > 1.5) {
          const gradient = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.r * 1.2
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
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

  // Effect untuk handle visibility change
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

  // Fetch data Tentang Kami dari API public
  useEffect(() => {
    fetchTentangKamiData();
    fetchTimData();
    fetchFooterKontakData();
  }, []);

  const fetchTentangKamiData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/tentang-kami/public");

      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setTentangKamiData({
            hero_title: data.hero_title || "",
            hero_subtitle: data.hero_subtitle || "",
            hero_description: data.hero_description || "",
            statistik: data.statistik || [],
            kontak_info: data.kontak_info || {}
          });
        }
      } else {
        console.warn("Gagal mengambil data Tentang Kami, menggunakan data default");
      }
    } catch (error) {
      console.error("Error fetching Tentang Kami data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data tim dari endpoint public
  const fetchTimData = async () => {
    try {
      setLoadingTim(true);
      const res = await fetch("http://localhost:8000/tim/public");

      if (res.ok) {
        const data = await res.json();
        setTimData(data || []);
      } else {
        console.warn("Gagal mengambil data tim, menggunakan data default");
        // Data default jika API gagal
        setTimData([
          {
            id: 1,
            nama: "John Doe",
            jabatan: "CEO & Founder",
            deskripsi: "Memiliki pengalaman lebih dari 10 tahun di bidang teknologi.",
            keahlian: ["Leadership", "Strategy", "Technology"],
            foto_url: null,
            urutan: 1,
            is_active: true
          },
          {
            id: 2,
            nama: "Jane Smith",
            jabatan: "CTO",
            deskripsi: "Ahli dalam pengembangan perangkat lunak dan arsitektur sistem.",
            keahlian: ["Software Development", "System Architecture", "AI"],
            foto_url: null,
            urutan: 2,
            is_active: true
          },
          {
            id: 3,
            nama: "Robert Johnson",
            jabatan: "Head of Marketing",
            deskripsi: "Spesialis dalam strategi pemasaran digital dan brand development.",
            keahlian: ["Digital Marketing", "Brand Strategy", "Social Media"],
            foto_url: null,
            urutan: 3,
            is_active: true
          },
          {
            id: 4,
            nama: "Sarah Williams",
            jabatan: "Lead Designer",
            deskripsi: "Menciptakan pengalaman pengguna yang menarik dan fungsional.",
            keahlian: ["UI/UX Design", "Product Design", "User Research"],
            foto_url: null,
            urutan: 4,
            is_active: true
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching tim data:", error);
    } finally {
      setLoadingTim(false);
    }
  };

  // Fetch data footer kontak dari endpoint public
  const fetchFooterKontakData = async () => {
    try {
      setLoadingFooter(true);
      const res = await fetch("http://localhost:8000/footer-kontak/public");

      if (res.ok) {
        const data = await res.json();
        console.log("Data footer kontak received:", data);

        if (data && Object.keys(data).length > 0) {
          setFooterKontakData({
            email: data.email || "info@gastronomirun.com",
            phone: data.phone || "(021) 1234-5678",
            address: data.address || "Jakarta Running Center, Indonesia",
            description: data.description || "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
            copyright: data.copyright || "© 2024 Gastronomi Run. All rights reserved.",
            social_media: data.social_media || {
              facebook: "https://facebook.com/gastronomirun",
              instagram: "https://instagram.com/gastronomirun",
              twitter: "https://twitter.com/gastronomirun",
              youtube: "https://youtube.com/gastronomirun"
            }
          });
        }
      } else {
        console.warn("Gagal mengambil data footer kontak, menggunakan data default");
        // Gunakan data default dari tentangKamiData
        setFooterKontakData({
          email: tentangKamiData.kontak_info.email,
          phone: tentangKamiData.kontak_info.phone,
          address: tentangKamiData.kontak_info.address,
          description: "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
          copyright: "© 2024 Gastronomi Run. All rights reserved.",
          social_media: tentangKamiData.kontak_info.social_media
        });
      }
    } catch (error) {
      console.error("Error fetching footer kontak data:", error);
      // Gunakan data default dari tentangKamiData jika error
      setFooterKontakData({
        email: tentangKamiData.kontak_info.email,
        phone: tentangKamiData.kontak_info.phone,
        address: tentangKamiData.kontak_info.address,
        description: "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
        copyright: "© 2024 Gastronomi Run. All rights reserved.",
        social_media: tentangKamiData.kontak_info.social_media
      });
    } finally {
      setLoadingFooter(false);
    }
  };

  // Render icon berdasarkan nama
  const renderIcon = (iconName, size = 32) => {
    const iconProps = { size };
    switch (iconName) {
      case 'Activity': return <Activity {...iconProps} />;
      case 'Utensils': return <Utensils {...iconProps} />;
      case 'Trophy': return <Trophy {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'Shield': return <Shield {...iconProps} />;
      case 'Globe': return <Globe {...iconProps} />;
      case 'Award': return <Award {...iconProps} />;
      case 'Calendar': return <Calendar {...iconProps} />;
      case 'MapPin': return <MapPin {...iconProps} />;
      case 'Star': return <Star {...iconProps} />;
      default: return <Activity {...iconProps} />;
    }
  };

  // Fungsi untuk membuka modal detail anggota tim
  const openMemberModal = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
    // Mencegah scroll pada body saat modal terbuka
    document.body.style.overflow = 'hidden';
  };

  // Fungsi untuk menutup modal
  const closeMemberModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
    // Mengembalikan scroll pada body
    document.body.style.overflow = 'auto';
  };

  // Effect untuk menutup modal dengan Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        closeMemberModal();
      }
    };

    if (showMemberModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showMemberModal]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? "border-[#D7FE51]" : "border-[#646B5E]"
            } mx-auto mb-4`}></div>
          <p className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}>
            Memuat data Tentang Kami...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${isDarkMode ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" : "bg-white"
      }`}>
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
        {/* Semua section content utama */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
          {/* Hero Section - RESPONSIVE */}
          <section className="mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 break-words ${isDarkMode ? "text-white" : "text-[#646B5E]"
                  }`}>
                  {tentangKamiData.hero_title}
                </h1>
                <p className={`text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                  {tentangKamiData.hero_subtitle}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Statistik Section - RESPONSIVE */}
          <section className="mb-8 sm:mb-12 md:mb-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {tentangKamiData.statistik.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center ${isDarkMode
                    ? "bg-[#1A1F16]/50 backdrop-blur-sm border border-[#363D30]/50"
                    : "bg-gray-50 border border-gray-200"
                    }`}
                >
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 mb-2">
                    <div className="text-[#D7FE51]">
                      {renderIcon(stat.icon, 18)}
                    </div>
                    <div className={`text-xl sm:text-2xl font-bold ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
                      {stat.number}
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Deskripsi di bawah statistik */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center max-w-3xl mx-auto"
            >
              <p className={`text-base sm:text-lg md:text-xl leading-relaxed ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                }`}>
                {tentangKamiData.hero_description}
              </p>
            </motion.div>
          </section>

          

            
        </div>

        {/* FOOTER SECTION - DIMODIFIKASI seperti HomeUser.jsx */}
        <footer className={`pt-16 pb-8 px-6 border-t transition-colors duration-300 w-full ${isDarkMode ? "bg-[#0A0E0B]/90 backdrop-blur-sm border-[#1A1F16]" : "bg-white border-gray-200"
          }`}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Kolom 1: Kontak Kami */}
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-[#646B5E]"
                  }`}>
                  Kontak Kami
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                    <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                      {footerKontakData.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                    <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                      {footerKontakData.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                    <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                      {footerKontakData.address}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Kolom 2: Ikuti Kami */}
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-[#646B5E]"
                  }`}>
                  Ikuti Kami
                </h3>
                <div className="flex gap-4">
                  {Object.entries(footerKontakData.social_media || {}).map(([platform, url]) => (
                    url && (
                      <a 
                        key={platform}
                        href={url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`p-2 rounded-full transition-colors ${
                          isDarkMode 
                            ? "bg-[#1A1F16] border border-[#363D30] text-[#ABB89D] hover:bg-[#D7FE51] hover:text-[#0A0E0B]" 
                            : "bg-gray-100 text-[#646B5E] hover:bg-[#D7FE51]"
                        }`}
                      >
                        {platform === 'facebook' && <Facebook size={20} />}
                        {platform === 'instagram' && <Instagram size={20} />}
                        {platform === 'twitter' && <Twitter size={20} />}
                        {platform === 'youtube' && <Youtube size={20} />}
                      </a>
                    )
                  ))}
                </div>
              </div>
              
              {/* Kolom 3: Tautan Cepat */}
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-[#646B5E]"
                  }`}>
                  Tautan Cepat
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate("/")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Beranda
                  </button>
                  <button 
                    onClick={() => navigate("/events")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Lihat Event
                  </button>
                  <button 
                    onClick={() => navigate("/layanan")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Layanan
                  </button>
                  <button 
                    onClick={() => navigate("/partner")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Partner
                  </button>
                  <button 
                    onClick={() => navigate("/kontak")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Kontak
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bagian Bawah Footer */}
            <div className={`pt-8 border-t text-center ${
              isDarkMode ? "border-[#1A1F16]" : "border-gray-200"
            }`}>
              <div className="mb-4">
                <h4 className={`text-2xl font-black mb-2 ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
                }`}>
                  GASTRONOMI RUN
                </h4>
                <p className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                  Where Running Meets Culinary Adventure
                </p>
              </div>
              
              <p className={`text-sm mb-4 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                {footerKontakData.description}
              </p>
              
              <div className={`flex flex-col md:flex-row justify-center items-center gap-4 mb-6 ${
                isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
              }`}>
                <span>{footerKontakData.copyright}</span>
                <span className="hidden md:inline">|</span>
                <a 
                  href="https://store.gastronomirun.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#D7FE51] transition-colors"
                >
                  Visit our Store
                </a>
              </div>
              
              <p className={`text-xs ${isDarkMode ? "text-[#ABB89D]/70" : "text-gray-500"}`}>
                Diselenggarakan oleh <strong>GastronomiRun.com</strong> - Your Track, Your Victory
              </p>
            </div>
          </div>
        </footer>

        {/* Modal Detail Anggota Tim - RESPONSIVE */}
        {showMemberModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className={`relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 ${isDarkMode
              ? "bg-gradient-to-br from-[#1A1F16] to-[#0A0E0B] border border-[#363D30]"
              : "bg-white border border-gray-200"
              }`}>
              <button
                onClick={closeMemberModal}
                className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full ${isDarkMode
                  ? "bg-[#363D30] text-[#ABB89D] hover:bg-[#D7FE51] hover:text-[#0A0E0B]"
                  : "bg-gray-100 text-gray-700 hover:bg-[#646B5E] hover:text-white"
                  }`}
              >
                <X size={18} />
              </button>

              <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full mx-auto overflow-hidden border-2 sm:border-4 border-white/20">
                    {selectedMember.foto_url ? (
                      <img
                        src={selectedMember.foto_url}
                        alt={selectedMember.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-[#363D30]" : "bg-gray-200"
                        }`}>
                        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center ${isDarkMode ? "bg-[#D7FE51]/20 text-[#D7FE51]" : "bg-[#D7FE51]/20 text-[#646B5E]"
                          }`}>
                          <User size={48} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className={`text-xl sm:text-2xl md:text-2xl font-bold mb-1 sm:mb-2 break-words ${isDarkMode ? "text-white" : "text-[#646B5E]"
                    }`}>
                    {selectedMember.nama}
                  </h3>
                  <p className={`text-base sm:text-lg md:text-lg font-medium mb-3 sm:mb-4 text-[#D7FE51] flex items-center gap-1 sm:gap-2`}>
                    <Briefcase size={14} />
                    {selectedMember.jabatan}
                  </p>

                  <p className={`mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}>
                    {selectedMember.deskripsi}
                  </p>

                  {selectedMember.keahlian && selectedMember.keahlian.length > 0 && (
                    <div>
                      <h4 className={`font-bold mb-2 sm:mb-3 text-sm sm:text-base ${isDarkMode ? "text-white" : "text-[#646B5E]"
                        }`}>
                        Keahlian
                      </h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedMember.keahlian.map((skill, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm rounded-full ${isDarkMode
                              ? "bg-[#363D30] text-[#ABB89D]"
                              : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
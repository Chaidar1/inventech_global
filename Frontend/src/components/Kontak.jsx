import { motion } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Clock,
  MapPin as MapPinIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as AddressIcon
} from "lucide-react";

export default function Kontak() {
  const { themeClasses, isDarkMode } = useAppTheme();
  const navigate = useNavigate();

  // State untuk data kontak dari API
  const [kontakData, setKontakData] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_description: "",
    contact_items: []
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

  const [loading, setLoading] = useState(true);
  const [loadingFooter, setLoadingFooter] = useState(true);
  const [error, setError] = useState(null);

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
    for (let i = 0; i < 80; i++) { // Reduced particles for better mobile performance
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1, // Smaller particles for mobile
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

  // Fetch data kontak dari API public
  useEffect(() => {
    fetchKontakData();
    fetchFooterKontakData();
  }, []);

  const fetchKontakData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("http://localhost:8000/kontak/public");
      
      if (res.ok) {
        const data = await res.json();
        
        setKontakData({
          hero_title: data.hero_title || "Hubungi Kami",
          hero_subtitle: data.hero_subtitle || "Kami Siap Membantu Anda",
          hero_description: data.hero_description || "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda.",
          contact_items: data.contact_items || []
        });
      } else {
        setError("Gagal memuat data kontak");
        setKontakData({
          hero_title: "Hubungi Kami",
          hero_subtitle: "Kami Siap Membantu Anda",
          hero_description: "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda.",
          contact_items: [
            {
              id: 1,
              icon: "Mail",
              title: "Email",
              details: ["info@gastronomirun.com", "support@gastronomirun.com"],
              action_url: "mailto:info@gastronomirun.com",
              order_position: 1,
              is_active: true
            },
            {
              id: 2,
              icon: "Phone",
              title: "Telepon",
              details: ["(021) 1234-5678", "0812-3456-7890"],
              action_url: "tel:+622112345678",
              order_position: 2,
              is_active: true
            },
            {
              id: 3,
              icon: "MapPin",
              title: "Alamat",
              details: ["Jakarta Running Center", "Jl. Sudirman No. 123", "Jakarta Selatan, 12190"],
              action_url: "https://maps.google.com",
              order_position: 3,
              is_active: true
            },
            {
              id: 4,
              icon: "Clock",
              title: "Jam Operasional",
              details: ["Senin - Jumat: 08:00 - 17:00", "Sabtu: 08:00 - 12:00", "Minggu: Tutup"],
              action_url: null,
              order_position: 4,
              is_active: true
            }
          ]
        });
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengambil data kontak");
      setKontakData({
        hero_title: "Hubungi Kami",
        hero_subtitle: "Kami Siap Membantu Anda",
        hero_description: "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda.",
        contact_items: [
          {
            id: 1,
            icon: "Mail",
            title: "Email",
            details: ["info@gastronomirun.com", "support@gastronomirun.com"],
            action_url: "mailto:info@gastronomirun.com",
            order_position: 1,
            is_active: true
          },
          {
            id: 2,
            icon: "Phone",
            title: "Telepon",
            details: ["(021) 1234-5678", "0812-3456-7890"],
            action_url: "tel:+622112345678",
            order_position: 2,
            is_active: true
          },
          {
            id: 3,
            icon: "MapPin",
            title: "Alamat",
            details: ["Jakarta Running Center", "Jl. Sudirman No. 123", "Jakarta Selatan, 12190"],
            action_url: "https://maps.google.com",
            order_position: 3,
            is_active: true
          },
          {
            id: 4,
            icon: "Clock",
            title: "Jam Operasional",
            details: ["Senin - Jumat: 08:00 - 17:00", "Sabtu: 08:00 - 12:00", "Minggu: Tutup"],
            action_url: null,
            order_position: 4,
            is_active: true
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data footer kontak dari endpoint public
  const fetchFooterKontakData = async () => {
    try {
      setLoadingFooter(true);
      const res = await fetch("http://localhost:8000/footer-kontak/public");
      
      if (res.ok) {
        const data = await res.json();
        
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
        setFooterKontakData({
          email: "info@gastronomirun.com",
          phone: "(021) 1234-5678",
          address: "Jakarta Running Center, Indonesia",
          description: "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
          copyright: "© 2024 Gastronomi Run. All rights reserved.",
          social_media: {
            facebook: "https://facebook.com/gastronomirun",
            instagram: "https://instagram.com/gastronomirun",
            twitter: "https://twitter.com/gastronomirun",
            youtube: "https://youtube.com/gastronomirun"
          }
        });
      }
    } catch (error) {
      setFooterKontakData({
        email: "info@gastronomirun.com",
        phone: "(021) 1234-5678",
        address: "Jakarta Running Center, Indonesia",
        description: "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
        copyright: "© 2024 Gastronomi Run. All rights reserved.",
        social_media: {
          facebook: "https://facebook.com/gastronomirun",
          instagram: "https://instagram.com/gastronomirun",
          twitter: "https://twitter.com/gastronomirun",
          youtube: "https://youtube.com/gastronomirun"
        }
      });
    } finally {
      setLoadingFooter(false);
    }
  };

  // Render icon berdasarkan nama
  const renderIcon = (iconName, size = 24) => {
    switch(iconName) {
      case 'Mail': return <Mail size={size} />;
      case 'Phone': return <Phone size={size} />;
      case 'MapPin': return <MapPin size={size} />;
      case 'Clock': return <Clock size={size} />;
      case 'Instagram': return <Instagram size={size} />;
      case 'Facebook': return <Facebook size={size} />;
      case 'Twitter': return <Twitter size={size} />;
      case 'Youtube': return <Youtube size={size} />;
      default: return <Mail size={size} />;
    }
  };

  // Filter contact items yang aktif dan sort berdasarkan order_position
  const activeContactItems = kontakData.contact_items
    .filter(item => item.is_active !== false)
    .sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-[#D7FE51]" : "border-[#646B5E]"
          } mx-auto mb-4`}></div>
          <p className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}>
            Memuat data Kontak...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${
      isDarkMode ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" : "bg-white"
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
        {/* Hero Section - RESPONSIVE */}
        <section 
          className={`relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 transition-colors duration-300 overflow-hidden ${
            isDarkMode 
              ? "bg-gradient-to-br from-[#1A1F16] via-[#2A3025] to-[#1A1F16]" 
              : "bg-gradient-to-br from-[#646B5E] via-[#ABB89D] to-[#646B5E]"
          }`}
        >
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6 sm:mb-8"
            >
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-white leading-tight break-words"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="block mb-2">{kontakData.hero_title}</span>
                <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal opacity-90">
                  {kontakData.hero_subtitle}
                </span>
              </motion.h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "120px" }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-1 mx-auto mb-6 sm:mb-8 rounded-full bg-[#D7FE51]`}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-base sm:text-lg text-white/80 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-2 sm:px-0"
            >
              {kontakData.hero_description}
            </motion.p>
          </div>
        </section>

        {/* Informasi Kontak - RESPONSIVE */}
        <section className={`py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 transition-colors duration-300 ${
          isDarkMode ? "bg-transparent" : "bg-white"
        }`}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-10 sm:mb-12 md:mb-16"
            >
              <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 break-words ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Informasi Kontak
              </h2>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100px" }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`h-1 mx-auto mb-4 sm:mb-6 rounded-full bg-[#D7FE51]`}
              />
              <p className={`text-lg sm:text-xl max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-0 ${
                isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"
              }`}>
                Hubungi kami melalui berbagai channel yang tersedia
              </p>
            </motion.div>

            {error && (
              <div className={`mb-6 sm:mb-8 p-4 rounded-lg text-center ${
                isDarkMode ? "bg-red-900/20 text-red-300" : "bg-red-100 text-red-700"
              }`}>
                {error}
              </div>
            )}

            {activeContactItems.length === 0 ? (
              <div className={`text-center py-10 sm:py-12 rounded-2xl ${
                isDarkMode ? "bg-[#1A1F16] text-[#ABB89D]" : "bg-gray-100 text-gray-600"
              }`}>
                <p className="text-base sm:text-lg">Belum ada informasi kontak yang tersedia.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {activeContactItems.map((info, index) => (
                  <motion.div
                    key={info.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className={`group p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl text-center transition-all duration-300 ${
                      isDarkMode 
                        ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50 hover:border-[#D7FE51] hover:shadow-[0_0_20px_rgba(215,254,81,0.1)] sm:hover:shadow-[0_0_30px_rgba(215,254,81,0.2)]" 
                        : "bg-white border border-gray-200 hover:border-[#D7FE51] hover:shadow-lg sm:hover:shadow-xl shadow-md"
                    }`}
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mb-4 sm:mb-6 mx-auto ${
                      isDarkMode ? "bg-[#D7FE51]/20 text-[#D7FE51]" : "bg-[#D7FE51]/20 text-[#646B5E]"
                    } group-hover:bg-[#D7FE51] group-hover:text-[#1A1F16] transition-colors duration-300`}>
                      {renderIcon(info.icon, 20)}
                    </div>
                    <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 break-words ${
                      isDarkMode ? "text-white" : "text-[#646B5E]"
                    }`}>
                      {info.title}
                    </h3>
                    <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                      {info.details && info.details.map((detail, idx) => (
                        detail && (
                          <p key={idx} className={`${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"} break-words`}>
                            {detail}
                          </p>
                        )
                      ))}
                    </div>
                    {info.action_url && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={info.action_url}
                        target={info.action_url.startsWith('http') ? '_blank' : '_self'}
                        rel={info.action_url.startsWith('http') ? 'noopener noreferrer' : ''}
                        className={`inline-block mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-300 ${
                          isDarkMode 
                            ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                            : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
                        }`}
                      >
                        {info.action_url.startsWith('mailto:') ? 'Kirim Email' : 
                         info.action_url.startsWith('tel:') ? 'Telepon' : 
                         info.action_url.startsWith('http') ? 'Kunjungi' : 'Hubungi'}
                      </motion.a>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer Section - DIMODIFIKASI seperti HomeUser.jsx */}
        <footer className={`pt-16 pb-8 px-6 border-t transition-colors duration-300 w-full ${
          isDarkMode ? "bg-[#0A0E0B]/90 backdrop-blur-sm border-[#1A1F16]" : "bg-white border-gray-200"
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Kolom 1: Kontak Kami */}
              <div>
                <h3 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
                }`}>
                  Kontak Kami
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MailIcon size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                    <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                      {footerKontakData.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneIcon size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                    <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                      {footerKontakData.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AddressIcon size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                    <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                      {footerKontakData.address}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Kolom 2: Ikuti Kami */}
              <div>
                <h3 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
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
                        aria-label={`Follow us on ${platform}`}
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
                <h3 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
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
                    onClick={() => navigate("/tentang-kami")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Tentang Kami
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
      </div>
    </div>
  );
}
import { motion } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity,
  Utensils,
  Trophy,
  Users,
  Heart,
  Shield,
  Globe,
  Award,
  Star,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Briefcase,
  List,
  XCircle,
  Target,
  Flag,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  User,
  ArrowRight
} from "lucide-react";

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Import komponen shared
import FooterKontakEditor from "../components/FooterKontakEditor";

const MySwal = withReactContent(Swal);

export default function LayananKamiAdmin() {
  const { themeClasses, isDarkMode } = useAppTheme();
  const navigate = useNavigate();

  // State untuk data Layanan
  const [layananData, setLayananData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State untuk data footer kontak (untuk preview) - SAMA DENGAN TENTANGKAMIADMIN.JSX
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
  
  // State untuk form editing
  const [editingSection, setEditingSection] = useState(null);
  const [editForm, setEditForm] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_description: "",
    services: [],
    target_audience: [],
    kontak_info: {
      email: "",
      phone: "",
      address: "",
      social_media: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: ""
      }
    }
  });

  // Enhanced Background Particles for Dark Mode
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

  // Fetch data Layanan dari API
  useEffect(() => {
    fetchLayananData();
    fetchFooterKontakData(); // Tambahkan fetch data footer
  }, []);

  const fetchLayananData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/admin/layanan", {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setLayananData(data);
        
        if (data && Object.keys(data).length > 0) {
          setEditForm({
            hero_title: data.hero_title || "LAYANAN KAMI",
            hero_subtitle: data.hero_subtitle || "Solusi Lengkap untuk Pengalaman Lari Terbaik",
            hero_description: data.hero_description || "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan.",
            services: data.services || [],
            target_audience: data.target_audience || [],
            kontak_info: data.kontak_info || {
              email: "",
              phone: "",
              address: "",
              social_media: {
                facebook: "",
                instagram: "",
                twitter: "",
                youtube: ""
              }
            }
          });
        } else {
          // Default data jika kosong
          setEditForm({
            hero_title: "LAYANAN KAMI",
            hero_subtitle: "Solusi Lengkap untuk Pengalaman Lari Terbaik",
            hero_description: "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan.",
            services: [
              {
                icon: "Activity",
                title: "Event Organization",
                description: "Menyelenggarakan berbagai jenis event lari dengan rute yang menarik melalui kota-kota besar Indonesia.",
                features: ["Rute terukur & aman", "Pendaftaran online", "Tim medis standby"]
              },
              {
                icon: "Utensils",
                title: "Culinary Experience",
                description: "Mengintegrasikan pengalaman kuliner lokal dalam setiap event untuk memperkaya petualangan peserta.",
                features: ["Food tasting", "Local cuisine", "Nutrition guidance"]
              },
              {
                icon: "Trophy",
                title: "Race Package",
                description: "Paket lengkap termasuk jersey, medali finisher, timing chip, dan souvenir eksklusif.",
                features: ["Quality merchandise", "Finisher medal", "Digital certificate"]
              },
              {
                icon: "Users",
                title: "Community Building",
                description: "Membangun komunitas pelari yang solid dengan regular training sessions dan gathering.",
                features: ["Weekly runs", "Training programs", "Social events"]
              }
            ],
            target_audience: [
              {
                title: "Untuk Pelari",
                icon: "Users",
                description: "Kami menyediakan event lari berkualitas dengan rute yang menarik, sistem pendaftaran yang mudah, dan pengalaman yang memuaskan. Setiap event dirancang untuk memberikan pengalaman terbaik bagi pelari dari berbagai level.",
                features: ["Event berkualitas", "Rute menarik", "Pendaftaran mudah", "Pengalaman memuaskan"]
              },
              {
                title: "Untuk Event Organizer & Brand",
                icon: "Award",
                description: "Kami adalah partner terpercaya untuk menyelenggarakan event lari yang tepat sasaran dengan desain yang kreatif dan profesional. Kami membantu brand dan event organizer meningkatkan reach mereka melalui platform dan jaringan yang luas.",
                features: ["Partner terpercaya", "Desain kreatif", "Platform luas", "Jaringan kuat"]
              }
            ],
            kontak_info: {
              email: "info@gastronomirun.com",
              phone: "(021) 1234-5678",
              address: "Jakarta Running Center, Indonesia",
              social_media: {
                facebook: "https://facebook.com/gastronomirun",
                instagram: "https://instagram.com/gastronomirun",
                twitter: "https://twitter.com/gastronomirun",
                youtube: "https://youtube.com/gastronomirun"
              }
            }
          });
        }
      } else {
        console.error("Gagal mengambil data Layanan");
      }
    } catch (error) {
      console.error("Error fetching Layanan data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data footer kontak dari API - SAMA DENGAN TENTANGKAMIADMIN.JSX
  const fetchFooterKontakData = async () => {
    try {
      const res = await fetch("http://localhost:8000/footer-kontak/public");
      
      if (res.ok) {
        const data = await res.json();
        
        if (data && Object.keys(data).length > 0) {
          setFooterKontakData({
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            description: data.description || "",
            copyright: data.copyright || "",
            social_media: data.social_media || {
              facebook: "",
              instagram: "",
              twitter: "",
              youtube: ""
            }
          });
        }
      } else {
        console.warn("Gagal mengambil data footer kontak");
        // Gunakan data default
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
      console.error("Error fetching footer kontak data:", error);
      // Gunakan data default jika error
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
  };

  // Fungsi untuk menyimpan perubahan konten Layanan
  const handleSave = async (section) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      const dataToSend = {
        section: section,
        data: editForm
      };

      const res = await fetch("http://localhost:8000/admin/layanan", {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        setEditingSection(null);
        await fetchLayananData();
        
        MySwal.fire({
          title: "Berhasil!",
          text: "Data berhasil disimpan",
          icon: "success",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      } else {
        throw new Error("Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      MySwal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menyimpan data",
        icon: "error",
        background: isDarkMode ? '#1A1F16' : '#F9F9F9',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
    } finally {
      setSaving(false);
    }
  };

  // Fungsi untuk reset data Layanan
  const handleResetData = () => {
    MySwal.fire({
      title: "Reset Data?",
      text: "Semua data akan direset ke default. Tindakan ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Reset",
      cancelButtonText: "Batal",
      confirmButtonColor: isDarkMode ? "#D7FE51" : "#D46B5E",
      cancelButtonColor: "#6c757d",
      background: isDarkMode ? '#1A1F16' : '#F9F9F9',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("http://localhost:8000/admin/layanan/reset", {
            method: "DELETE",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (res.ok) {
            await fetchLayananData();
            MySwal.fire({
              title: "Berhasil!",
              text: "Data berhasil direset",
              icon: "success",
              background: isDarkMode ? '#1A1F16' : '#F9F9F9',
              color: isDarkMode ? '#f8fafc' : '#1f2937',
            });
          } else {
            throw new Error("Gagal mereset data");
          }
        } catch (error) {
          console.error("Error resetting data:", error);
          MySwal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat mereset data",
            icon: "error",
            background: isDarkMode ? '#1A1F16' : '#F9F9F9',
            color: isDarkMode ? '#f8fafc' : '#1f2937',
          });
        }
      }
    });
  };

  // Fungsi untuk edit item dalam array
  const handleEditArrayItem = (section, index, field, value) => {
    const updatedSection = [...editForm[section]];
    updatedSection[index] = {
      ...updatedSection[index],
      [field]: value
    };
    setEditForm({
      ...editForm,
      [section]: updatedSection
    });
  };

  // Fungsi untuk tambah item baru
  const handleAddArrayItem = (section, template) => {
    const updatedSection = [...editForm[section], template];
    setEditForm({
      ...editForm,
      [section]: updatedSection
    });
  };

  // Fungsi untuk hapus item
  const handleRemoveArrayItem = (section, index) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: "Item ini akan dihapus",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: isDarkMode ? "#D7FE51" : "#D46B5E",
      cancelButtonColor: "#6c757d",
      background: isDarkMode ? '#1A1F16' : '#F9F9F9',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedSection = [...editForm[section]];
        updatedSection.splice(index, 1);
        setEditForm({
          ...editForm,
          [section]: updatedSection
        });
      }
    });
  };

  // Render icon berdasarkan nama
  const renderIcon = (iconName, size = 32) => {
    const iconProps = { size };
    switch(iconName) {
      case 'Activity': return <Activity {...iconProps} />;
      case 'Utensils': return <Utensils {...iconProps} />;
      case 'Trophy': return <Trophy {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'Shield': return <Shield {...iconProps} />;
      case 'Globe': return <Globe {...iconProps} />;
      case 'Award': return <Award {...iconProps} />;
      case 'Star': return <Star {...iconProps} />;
      default: return <Activity {...iconProps} />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-[#D7FE51]" : "border-[#646B5E]"
          } mx-auto mb-4`}></div>
          <p className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}>
            Memuat data Layanan...
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
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Hero Section Editor - RESPONSIVE */}
        <div className={`rounded-xl sm:rounded-2xl overflow-hidden ${
          isDarkMode 
            ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50" 
            : "bg-white border border-gray-200"
        }`}>
          <div className={`p-4 sm:p-6 border-b ${
            isDarkMode ? "border-[#363D30]" : "border-gray-200"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
                Hero Section
              </h2>
              {editingSection === 'hero' ? (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleSave('hero')}
                    disabled={saving}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#D7FE51] text-[#1A1F16] hover:bg-[#C4E840]" 
                        : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Save size={14} />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium border flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "border-[#363D30] text-[#ABB89D] hover:bg-[#363D30]" 
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <X size={14} />
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingSection('hero')}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto ${
                    isDarkMode 
                      ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                      : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                  }`}
                >
                  <Edit size={14} />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {editingSection === 'hero' ? (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                    Judul Utama
                  </label>
                  <input
                    type="text"
                    value={editForm.hero_title}
                    onChange={(e) => setEditForm({...editForm, hero_title: e.target.value})}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#2A3025] border-[#363D30] text-white" 
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                    Subjudul
                  </label>
                  <input
                    type="text"
                    value={editForm.hero_subtitle}
                    onChange={(e) => setEditForm({...editForm, hero_subtitle: e.target.value})}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#2A3025] border-[#363D30] text-white" 
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                    Deskripsi
                  </label>
                  <textarea
                    value={editForm.hero_description}
                    onChange={(e) => setEditForm({...editForm, hero_description: e.target.value})}
                    rows={3}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#2A3025] border-[#363D30] text-white" 
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
                  {editForm.hero_title}
                </h3>
                <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                  {editForm.hero_subtitle}
                </p>
                <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                  {editForm.hero_description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Layanan Services Editor - RESPONSIVE */}
        <div className={`rounded-xl sm:rounded-2xl overflow-hidden ${
          isDarkMode 
            ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50" 
            : "bg-white border border-gray-200"
        }`}>
          <div className={`p-4 sm:p-6 border-b ${
            isDarkMode ? "border-[#363D30]" : "border-gray-200"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
                Layanan Kami
              </h2>
              {editingSection === 'services' ? (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleSave('services')}
                    disabled={saving}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#D7FE51] text-[#1A1F16] hover:bg-[#C4E840]" 
                        : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Save size={14} />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium border flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "border-[#363D30] text-[#ABB89D] hover:bg-[#363D30]" 
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <X size={14} />
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setEditingSection('services')}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                        : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                    }`}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleAddArrayItem('services', {
                      icon: "Activity",
                      title: "Layanan Baru",
                      description: "Deskripsi layanan baru",
                      features: ["Fitur 1", "Fitur 2", "Fitur 3"]
                    })}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                        : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                    }`}
                  >
                    <Plus size={14} />
                    Tambah Layanan
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {editingSection === 'services' ? (
              <div className="space-y-6 sm:space-y-8">
                {editForm.services.map((service, index) => (
                  <div key={index} className={`p-4 sm:p-6 rounded-lg sm:rounded-xl ${
                    isDarkMode ? "bg-[#2A3025]" : "bg-gray-50"
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                      <h4 className={`font-bold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                        Layanan #{index + 1}
                      </h4>
                      <button
                        onClick={() => handleRemoveArrayItem('services', index)}
                        className={`p-1.5 sm:p-2 rounded-full self-end sm:self-auto ${
                          isDarkMode ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                            Icon
                          </label>
                          <select
                            value={service.icon}
                            onChange={(e) => handleEditArrayItem('services', index, 'icon', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              isDarkMode 
                                ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                : "bg-white border-gray-300 text-gray-700"
                            }`}
                          >
                            <option value="Activity">Activity</option>
                            <option value="Utensils">Utensils</option>
                            <option value="Trophy">Trophy</option>
                            <option value="Users">Users</option>
                            <option value="Heart">Heart</option>
                            <option value="Shield">Shield</option>
                            <option value="Globe">Globe</option>
                            <option value="Award">Award</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                            Judul
                          </label>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) => handleEditArrayItem('services', index, 'title', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              isDarkMode 
                                ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                : "bg-white border-gray-300 text-gray-700"
                            }`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                          Deskripsi
                        </label>
                        <textarea
                          value={service.description}
                          onChange={(e) => handleEditArrayItem('services', index, 'description', e.target.value)}
                          rows={2}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDarkMode 
                              ? "bg-[#1A1F16] border-[#363D30] text-white" 
                              : "bg-white border-gray-300 text-gray-700"
                          }`}
                        />
                      </div>
                      
                      <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1">
                          <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                            Fitur
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedServices = [...editForm.services];
                              updatedServices[index].features.push(`Fitur baru`);
                              setEditForm({...editForm, services: updatedServices});
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              isDarkMode 
                                ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            + Tambah Fitur
                          </button>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          {service.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                  const updatedServices = [...editForm.services];
                                  updatedServices[index].features[featureIndex] = e.target.value;
                                  setEditForm({...editForm, services: updatedServices});
                                }}
                                className={`flex-1 px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                                  isDarkMode 
                                    ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                    : "bg-white border-gray-300 text-gray-700"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedServices = [...editForm.services];
                                  updatedServices[index].features.splice(featureIndex, 1);
                                  setEditForm({...editForm, services: updatedServices});
                                }}
                                className={`p-1.5 rounded-full ${
                                  isDarkMode ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-100"
                                }`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {editForm.services.map((service, index) => (
                  <div key={index} className={`group p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl ${
                    isDarkMode 
                      ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50" 
                      : "bg-white border border-gray-200"
                  }`}>
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mb-4 sm:mb-6 ${
                      isDarkMode ? "bg-[#D7FE51]/20 text-[#D7FE51]" : "bg-[#D7FE51]/20 text-[#646B5E]"
                    }`}>
                      {renderIcon(service.icon, 24)}
                    </div>
                    <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 break-words ${
                      isDarkMode ? "text-white" : "text-[#646B5E]"
                    }`}>
                      {service.title}
                    </h3>
                    <p className={`mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm md:text-base ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}>
                      {service.description}
                    </p>
                    <div className="space-y-1 sm:space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isDarkMode ? "bg-[#D7FE51]" : "bg-[#646B5E]"}`}></div>
                          <span className={`text-xs sm:text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Target Audience Section Editor - RESPONSIVE */}
        <div className={`rounded-xl sm:rounded-2xl overflow-hidden ${
          isDarkMode 
            ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50" 
            : "bg-white border border-gray-200"
        }`}>
          <div className={`p-4 sm:p-6 border-b ${
            isDarkMode ? "border-[#363D30]" : "border-gray-200"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
                Target Audience 
              </h2>
              {editingSection === 'target_audience' ? (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleSave('target_audience')}
                    disabled={saving}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#D7FE51] text-[#1A1F16] hover:bg-[#C4E840]" 
                        : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Save size={14} />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium border flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "border-[#363D30] text-[#ABB89D] hover:bg-[#363D30]" 
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <X size={14} />
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setEditingSection('target_audience')}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                        : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                    }`}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleAddArrayItem('target_audience', {
                      title: "Target Audience Baru",
                      icon: "Users",
                      description: "Deskripsi target audience baru",
                      features: ["Fitur 1", "Fitur 2", "Fitur 3"]
                    })}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                        : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                    }`}
                  >
                    <Plus size={14} />
                    Tambah Target
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {editingSection === 'target_audience' ? (
              <div className="space-y-6 sm:space-y-8">
                {editForm.target_audience.map((audience, index) => (
                  <div key={index} className={`p-4 sm:p-6 rounded-lg sm:rounded-xl ${
                    isDarkMode ? "bg-[#2A3025]" : "bg-gray-50"
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                      <h4 className={`font-bold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                        Target #{index + 1}
                      </h4>
                      <button
                        onClick={() => handleRemoveArrayItem('target_audience', index)}
                        className={`p-1.5 sm:p-2 rounded-full self-end sm:self-auto ${
                          isDarkMode ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                            Icon
                          </label>
                          <select
                            value={audience.icon}
                            onChange={(e) => handleEditArrayItem('target_audience', index, 'icon', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              isDarkMode 
                                ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                : "bg-white border-gray-300 text-gray-700"
                            }`}
                          >
                            <option value="Users">Users</option>
                            <option value="Award">Award</option>
                            <option value="Trophy">Trophy</option>
                            <option value="Star">Star</option>
                            <option value="Heart">Heart</option>
                            <option value="Shield">Shield</option>
                            <option value="Globe">Globe</option>
                            <option value="Activity">Activity</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                            Judul
                          </label>
                          <input
                            type="text"
                            value={audience.title}
                            onChange={(e) => handleEditArrayItem('target_audience', index, 'title', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              isDarkMode 
                                ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                : "bg-white border-gray-300 text-gray-700"
                            }`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                          Deskripsi
                        </label>
                        <textarea
                          value={audience.description}
                          onChange={(e) => handleEditArrayItem('target_audience', index, 'description', e.target.value)}
                          rows={2}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDarkMode 
                              ? "bg-[#1A1F16] border-[#363D30] text-white" 
                              : "bg-white border-gray-300 text-gray-700"
                          }`}
                        />
                      </div>
                      
                      <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1">
                          <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                            Fitur/Kelebihan
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedAudience = [...editForm.target_audience];
                              updatedAudience[index].features.push(`Fitur baru`);
                              setEditForm({...editForm, target_audience: updatedAudience});
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              isDarkMode 
                                ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            + Tambah Fitur
                          </button>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          {audience.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                  const updatedAudience = [...editForm.target_audience];
                                  updatedAudience[index].features[featureIndex] = e.target.value;
                                  setEditForm({...editForm, target_audience: updatedAudience});
                                }}
                                className={`flex-1 px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                                  isDarkMode 
                                    ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                    : "bg-white border-gray-300 text-gray-700"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedAudience = [...editForm.target_audience];
                                  updatedAudience[index].features.splice(featureIndex, 1);
                                  setEditForm({...editForm, target_audience: updatedAudience});
                                }}
                                className={`p-1.5 rounded-full ${
                                  isDarkMode ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-100"
                                }`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {editForm.target_audience.map((audience, index) => (
                  <div key={index} className={`relative p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl ${
                    isDarkMode 
                      ? index === 0 
                        ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border-2 border-[#D7FE51]/30"
                        : "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border-2 border-[#ABB89D]/30"
                      : index === 0 
                        ? "bg-gradient-to-br from-white to-gray-50 border-2 border-[#D7FE51]/30"
                        : "bg-gradient-to-br from-white to-gray-50 border-2 border-[#ABB89D]/30"
                  }`}>
                    <div className={`absolute -top-4 -left-4 sm:-top-5 sm:-left-5 md:-top-6 md:-left-6 w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center ${
                      index === 0 ? "bg-[#D7FE51]" : "bg-[#ABB89D]"
                    } shadow-lg`}>
                      {renderIcon(audience.icon, 20)}
                    </div>
                    
                    <div className="pt-6 sm:pt-8 md:pt-10">
                      <h3 className={`text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 break-words ${
                        index === 0 ? "text-[#D7FE51]" : "text-[#ABB89D]"
                      }`}>
                        {audience.title}
                      </h3>
                      <p className={`leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base md:text-lg ${
                        isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"
                      }`}>
                        {audience.description}
                      </p>
                      
                      <div className="space-y-1 sm:space-y-2">
                        {audience.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                              index === 0 ? "bg-[#D7FE51]" : "bg-[#ABB89D]"
                            }`}></div>
                            <span className={`text-xs sm:text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}`}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========== FOOTER KONTAK EDITOR - DIPERBAIKI UNTUK MOBILE ========== */}
        <div className={`rounded-xl sm:rounded-2xl overflow-hidden ${
          isDarkMode 
            ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50" 
            : "bg-white border border-gray-200"
        }`}>
          <div className={`p-4 sm:p-6 border-b ${
            isDarkMode ? "border-[#363D30]" : "border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
                Footer Kontak Editor
              </h2>
            </div>
          </div>

          <div className="p-2 sm:p-4 md:p-6">
            {/* PERBAIKAN UTAMA: Footer Kontak Editor Component dengan layout responsif */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="overflow-x-auto md:overflow-x-visible"> {/* Scroll horizontal hanya di mobile */}
                <div className="min-w-[320px]"> {/* Lebar minimum untuk mobile */}
                  <FooterKontakEditor 
                    isDarkMode={isDarkMode} 
                    sectionName="footer_kontak" 
                    onSave={fetchFooterKontakData}
                  />
                </div>
              </div>
            </div>
            
            {/* FOOTER SECTION - DIMODIFIKASI seperti HomeUser.jsx */}
            <div>
              <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
                Preview Footer
              </h3>
              <footer className={`pt-16 pb-8 px-6 border-t transition-colors duration-300 w-full ${
                isDarkMode ? "bg-[#0A0E0B]/90 backdrop-blur-sm border-[#1A1F16]" : "bg-white border-gray-200"
              }`}>
                <div className="max-w-6xl mx-auto">
                  <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode ? "text-white" : "text-[#646B5E]"
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
                          onClick={() => navigate("/admin/tentang-kami")}
                          className={`block text-left hover:text-[#D7FE51] transition-colors ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                          }`}
                        >
                          Tentang Kami
                        </button>
                        <button 
                          onClick={() => navigate("/admin/partner")}
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
        </div>
      </div>
    </div>
  );
}
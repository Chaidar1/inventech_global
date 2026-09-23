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
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Camera,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import FooterKontakEditor from "../components/FooterKontakEditor";

const MySwal = withReactContent(Swal);

export default function KontakAdmin() {
  const { themeClasses, isDarkMode } = useAppTheme();
  const navigate = useNavigate();

  // State untuk data kontak dari admin
  const [kontakData, setKontakData] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_description: "",
    contact_items: [] // Ubah dari contact_info ke contact_items
  });

  // State untuk data footer kontak (untuk preview)
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
    contact_items: [] // Ubah dari contact_info ke contact_items
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Fetch data kontak dari API
  useEffect(() => {
    fetchKontakData();
    fetchFooterKontakData();
  }, []);

  const fetchKontakData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/admin/kontak", {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Data kontak dari API:", data); // Debug log
        setKontakData(data);
        
        if (data && Object.keys(data).length > 0) {
          setEditForm({
            hero_title: data.hero_title || "",
            hero_subtitle: data.hero_subtitle || "",
            hero_description: data.hero_description || "",
            contact_items: data.contact_items || [] // Ubah ke contact_items
          });
        } else {
          // Set default data jika API mengembalikan data kosong
          setEditForm({
            hero_title: "Hubungi Kami",
            hero_subtitle: "Kami Siap Membantu Anda",
            hero_description: "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda.",
            contact_items: [
              {
                icon: "Mail",
                title: "Email",
                details: ["info@gastronomirun.com", "support@gastronomirun.com"],
                action_url: "mailto:info@gastronomirun.com", // Ubah dari action ke action_url
                order_position: 1,
                is_active: true
              },
              {
                icon: "Phone",
                title: "Telepon",
                details: ["(021) 1234-5678", "0812-3456-7890"],
                action_url: "tel:+622112345678", // Ubah dari action ke action_url
                order_position: 2,
                is_active: true
              },
              {
                icon: "MapPin",
                title: "Alamat",
                details: ["Jakarta Running Center", "Jl. Sudirman No. 123", "Jakarta Selatan, 12190"],
                action_url: "https://maps.google.com", // Ubah dari action ke action_url
                order_position: 3,
                is_active: true
              },
              {
                icon: "Clock",
                title: "Jam Operasional",
                details: ["Senin - Jumat: 08:00 - 17:00", "Sabtu: 08:00 - 12:00", "Minggu: Tutup"],
                action_url: null, // Ubah dari action ke action_url
                order_position: 4,
                is_active: true
              }
            ]
          });
        }
      } else {
        console.error("Gagal mengambil data Kontak");
      }
    } catch (error) {
      console.error("Error fetching Kontak data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data footer kontak dari API
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

  // Fungsi untuk menyimpan perubahan hero section
  const handleSaveHero = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      const dataToSend = {
        hero_title: editForm.hero_title,
        hero_subtitle: editForm.hero_subtitle,
        hero_description: editForm.hero_description
      };

      console.log("Mengirim data hero:", dataToSend); // Debug log
      
      const res = await fetch("http://localhost:8000/admin/kontak/hero", {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        const result = await res.json();
        console.log("Response hero:", result); // Debug log
        setEditingSection(null);
        await fetchKontakData();
        
        MySwal.fire({
          title: "Berhasil!",
          text: "Hero section berhasil disimpan",
          icon: "success",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      } else {
        const error = await res.text();
        console.error("Error response hero:", error);
        throw new Error("Gagal menyimpan hero section");
      }
    } catch (error) {
      console.error("Error saving hero data:", error);
      MySwal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menyimpan hero section",
        icon: "error",
        background: isDarkMode ? '#1A1F16' : '#F9F9F9',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
    } finally {
      setSaving(false);
    }
  };

  // Fungsi untuk menyimpan contact item baru
  const handleSaveContactItem = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      // Kirim semua contact items yang ada
      const promises = editForm.contact_items.map(async (item, index) => {
        const formData = new FormData();
        formData.append('icon', item.icon);
        formData.append('title', item.title);
        formData.append('details', JSON.stringify(item.details || []));
        formData.append('action_url', item.action_url || '');
        formData.append('order_position', index + 1);
        formData.append('is_active', item.is_active !== false); // Default true
        
        // Jika item sudah ada ID, gunakan PUT untuk update
        if (item.id) {
          const res = await fetch(`http://localhost:8000/admin/kontak/contact-items/${item.id}`, {
            method: "PUT",
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          return res;
        } else {
          // Jika tidak ada ID, gunakan POST untuk create
          const res = await fetch("http://localhost:8000/admin/kontak/contact-items", {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          return res;
        }
      });
      
      const results = await Promise.all(promises);
      const allOk = results.every(res => res.ok);
      
      if (allOk) {
        setEditingSection(null);
        await fetchKontakData();
        
        MySwal.fire({
          title: "Berhasil!",
          text: "Contact items berhasil disimpan",
          icon: "success",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      } else {
        throw new Error("Gagal menyimpan beberapa contact items");
      }
    } catch (error) {
      console.error("Error saving contact items:", error);
      MySwal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menyimpan contact items",
        icon: "error",
        background: isDarkMode ? '#1A1F16' : '#F9F9F9',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
    } finally {
      setSaving(false);
    }
  };

  // Fungsi untuk reset data Kontak
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
          const res = await fetch("http://localhost:8000/admin/kontak/reset", {
            method: "DELETE",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (res.ok) {
            await fetchKontakData();
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

  // Fungsi untuk edit item contact_items
  const handleEditContactItem = (index, field, value) => {
    const updatedContactItems = [...editForm.contact_items];
    updatedContactItems[index] = {
      ...updatedContactItems[index],
      [field]: value
    };
    setEditForm({
      ...editForm,
      contact_items: updatedContactItems
    });
  };

  // Fungsi untuk tambah contact item baru
  const handleAddContactItem = () => {
    const newContact = {
      icon: "Mail",
      title: "Kontak Baru",
      details: [""],
      action_url: "", // Ubah dari action ke action_url
      order_position: editForm.contact_items.length + 1,
      is_active: true
    };
    const updatedContactItems = [...editForm.contact_items, newContact];
    setEditForm({
      ...editForm,
      contact_items: updatedContactItems
    });
  };

  // Fungsi untuk hapus contact item
  const handleRemoveContactItem = async (index, itemId) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: "Kontak ini akan dihapus",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: isDarkMode ? "#D7FE51" : "#D46B5E",
      cancelButtonColor: "#6c757d",
      background: isDarkMode ? '#1A1F16' : '#F9F9F9',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Jika item sudah ada di database (punya ID), hapus melalui API
          if (itemId) {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8000/admin/kontak/contact-items/${itemId}`, {
              method: "DELETE",
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!res.ok) {
              throw new Error("Gagal menghapus dari database");
            }
          }
          
          // Hapus dari state lokal
          const updatedContactItems = [...editForm.contact_items];
          updatedContactItems.splice(index, 1);
          setEditForm({
            ...editForm,
            contact_items: updatedContactItems
          });
          
          MySwal.fire({
            title: "Berhasil!",
            text: "Kontak berhasil dihapus",
            icon: "success",
            background: isDarkMode ? '#1A1F16' : '#F9F9F9',
            color: isDarkMode ? '#f8fafc' : '#1f2937',
          });
          
        } catch (error) {
          console.error("Error deleting contact item:", error);
          MySwal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat menghapus kontak",
            icon: "error",
            background: isDarkMode ? '#1A1F16' : '#F9F9F9',
            color: isDarkMode ? '#f8fafc' : '#1f2937',
          });
        }
      }
    });
  };

  // Fungsi untuk tambah detail pada contact item
  const handleAddDetail = (contactIndex) => {
    const updatedContactItems = [...editForm.contact_items];
    if (!updatedContactItems[contactIndex].details) {
      updatedContactItems[contactIndex].details = [];
    }
    updatedContactItems[contactIndex].details.push("");
    setEditForm({
      ...editForm,
      contact_items: updatedContactItems
    });
  };

  // Fungsi untuk hapus detail pada contact item
  const handleRemoveDetail = (contactIndex, detailIndex) => {
    const updatedContactItems = [...editForm.contact_items];
    updatedContactItems[contactIndex].details.splice(detailIndex, 1);
    setEditForm({
      ...editForm,
      contact_items: updatedContactItems
    });
  };

  // Fungsi untuk edit detail pada contact item
  const handleEditDetail = (contactIndex, detailIndex, value) => {
    const updatedContactItems = [...editForm.contact_items];
    updatedContactItems[contactIndex].details[detailIndex] = value;
    setEditForm({
      ...editForm,
      contact_items: updatedContactItems
    });
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
                    onClick={handleSaveHero}
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
                    placeholder="Contoh: Hubungi Kami"
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
                    placeholder="Contoh: Kami Siap Membantu Anda"
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
                    placeholder="Deskripsi hero section"
                  />
                </div>
              </div>
            ) : (
              <div className={`relative py-6 sm:py-8 px-4 sm:px-6 rounded-lg sm:rounded-xl ${
                isDarkMode 
                  ? "bg-gradient-to-br from-[#1A1F16] via-[#2A3025] to-[#1A1F16]" 
                  : "bg-gradient-to-br from-[#646B5E] via-[#ABB89D] to-[#646B5E]"
              }`}>
                <div className="text-center relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-3 sm:mb-4"
                  >
                    <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-white leading-tight`}>
                      {editForm.hero_title || "Hubungi Kami"}
                      <span className="block text-lg sm:text-xl md:text-2xl font-normal mt-1 sm:mt-2">
                        {editForm.hero_subtitle || "Kami Siap Membantu Anda"}
                      </span>
                    </h1>
                    
                    <div className={`h-1 w-20 sm:w-32 mx-auto mb-4 sm:mb-6 rounded-full bg-[#D7FE51]`} />
                  </motion.div>

                  <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
                    {editForm.hero_description || "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informasi Kontak Editor - RESPONSIVE */}
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
                Informasi Kontak
              </h2>
              {editingSection === 'contact_items' ? (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSaveContactItem}
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
                    onClick={() => setEditingSection('contact_items')}
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
                    onClick={handleAddContactItem}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                        : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                    }`}
                  >
                    <Plus size={14} />
                    Tambah Kontak
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {editingSection === 'contact_items' ? (
              <div className="space-y-6 sm:space-y-8">
                {editForm.contact_items.map((contact, index) => (
                  <div key={index} className={`p-4 sm:p-6 rounded-lg sm:rounded-xl ${
                    isDarkMode ? "bg-[#2A3025]" : "bg-gray-50"
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                      <h4 className={`font-bold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                        Kontak #{index + 1}: {contact.title}
                        {contact.id && (
                          <span className="text-xs font-normal text-gray-500 ml-2">
                            (ID: {contact.id})
                          </span>
                        )}
                      </h4>
                      <button
                        onClick={() => handleRemoveContactItem(index, contact.id)}
                        className={`p-1.5 sm:p-2 rounded-full self-end sm:self-auto ${
                          isDarkMode ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                            Icon
                          </label>
                          <select
                            value={contact.icon}
                            onChange={(e) => handleEditContactItem(index, 'icon', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              isDarkMode 
                                ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                : "bg-white border-gray-300 text-gray-700"
                            }`}
                          >
                            <option value="Mail">Email</option>
                            <option value="Phone">Telepon</option>
                            <option value="MapPin">Alamat</option>
                            <option value="Clock">Jam Operasional</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Youtube">YouTube</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                            Judul
                          </label>
                          <input
                            type="text"
                            value={contact.title}
                            onChange={(e) => handleEditContactItem(index, 'title', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              isDarkMode 
                                ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                : "bg-white border-gray-300 text-gray-700"
                            }`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                          Order Position
                        </label>
                        <input
                          type="number"
                          value={contact.order_position || index + 1}
                          onChange={(e) => handleEditContactItem(index, 'order_position', parseInt(e.target.value))}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDarkMode 
                              ? "bg-[#1A1F16] border-[#363D30] text-white" 
                              : "bg-white border-gray-300 text-gray-700"
                          }`}
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                          URL Aksi
                        </label>
                        <input
                          type="text"
                          value={contact.action_url || ""}
                          onChange={(e) => handleEditContactItem(index, 'action_url', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDarkMode 
                              ? "bg-[#1A1F16] border-[#363D30] text-white" 
                              : "bg-white border-gray-300 text-gray-700"
                          }`}
                          placeholder="Contoh: mailto:info@example.com atau https://..."
                        />
                      </div>
                      
                      <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                          <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                            Detail Informasi
                          </label>
                          <button
                            onClick={() => handleAddDetail(index)}
                            className={`px-2 py-1 text-xs sm:text-sm rounded-lg font-medium ${
                              isDarkMode 
                                ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            <Plus size={12} className="inline mr-1" />
                            Tambah Detail
                          </button>
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          {contact.details && contact.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-center gap-2 sm:gap-3">
                              <input
                                type="text"
                                value={detail}
                                onChange={(e) => handleEditDetail(index, detailIndex, e.target.value)}
                                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                                  isDarkMode 
                                    ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                    : "bg-white border-gray-300 text-gray-700"
                                }`}
                                placeholder={`Detail ${detailIndex + 1}`}
                              />
                              <button
                                onClick={() => handleRemoveDetail(index, detailIndex)}
                                className={`p-1.5 sm:p-2 rounded-full ${
                                  isDarkMode ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-100"
                                }`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          {(!contact.details || contact.details.length === 0) && (
                            <p className={`text-xs sm:text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-500"}`}>
                              Tidak ada detail. Klik "Tambah Detail" untuk menambahkan.
                            </p>
                          )}
                        </div>
                        <p className={`text-xs mt-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-500"}`}>
                          Detail akan disimpan sebagai array JSON. Contoh: ["detail1", "detail2"]
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`active-${index}`}
                            checked={contact.is_active !== false}
                            onChange={(e) => handleEditContactItem(index, 'is_active', e.target.checked)}
                            className={`mr-2 rounded ${
                              isDarkMode 
                                ? "bg-[#1A1F16] border-[#363D30] text-[#D7FE51]" 
                                : "bg-white border-gray-300 text-[#646B5E]"
                            }`}
                          />
                          <label 
                            htmlFor={`active-${index}`}
                            className={`text-xs sm:text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}
                          >
                            Aktif
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {editForm.contact_items.length === 0 && (
                  <div className={`text-center py-6 sm:py-8 rounded-lg sm:rounded-xl ${isDarkMode ? "bg-[#2A3025]" : "bg-gray-50"}`}>
                    <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-500"}`}>
                      Belum ada kontak. Klik "Tambah Kontak" untuk menambahkan.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {editForm.contact_items
                  .filter(item => item.is_active !== false)
                  .sort((a, b) => (a.order_position || 0) - (b.order_position || 0))
                  .map((info, index) => (
                  <div key={index} className={`group p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl text-center transition-all duration-300 ${
                    isDarkMode 
                      ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50 hover:border-[#D7FE51] hover:shadow-[0_0_20px_rgba(215,254,81,0.1)] sm:hover:shadow-[0_0_30px_rgba(215,254,81,0.2)]" 
                      : "bg-white border border-gray-200 hover:border-[#D7FE51] hover:shadow-lg sm:hover:shadow-xl"
                  }`}>
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mb-4 sm:mb-6 mx-auto ${
                      isDarkMode ? "bg-[#D7FE51]/20 text-[#D7FE51]" : "bg-[#D7FE51]/20 text-[#646B5E]"
                    } group-hover:bg-[#D7FE51] group-hover:text-[#1A1F16] transition-colors duration-300`}>
                      {renderIcon(info.icon, 20)}
                    </div>
                    <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 ${
                      isDarkMode ? "text-white" : "text-[#646B5E]"
                    }`}>
                      {info.title}
                    </h3>
                    <div className="space-y-1 sm:space-y-2">
                      {info.details && info.details.map((detail, idx) => (
                        <p key={idx} className={`text-xs sm:text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                          {detail}
                        </p>
                      ))}
                    </div>
                    {info.action_url && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={info.action_url}
                        className={`inline-block mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-300 ${
                          isDarkMode 
                            ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                            : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
                        }`}
                      >
                        Hubungi
                      </motion.a>
                    )}
                    {info.order_position && (
                      <div className="mt-3 sm:mt-4 text-xs opacity-50">
                        Order: {info.order_position}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========== FOOTER KONTAK EDITOR - RESPONSIVE ========== */}
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
                Footer Kontak Editor
              </h2>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Footer Kontak Editor Component - RESPONSIVE */}
            <div className="mb-6 sm:mb-8">
              <div className="overflow-x-auto">
                <div className="min-w-[320px]">
                  <FooterKontakEditor 
                    isDarkMode={isDarkMode} 
                    sectionName="footer_kontak" 
                    onSave={fetchFooterKontakData}
                  />
                </div>
              </div>
            </div>
            
            {/* Footer Section - RESPONSIVE */}
            <div>
              <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-6 ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
                Preview Footer (Tampilan User)
              </h3>
              <footer className={`pt-8 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 border-t transition-colors duration-300 w-full ${
                isDarkMode ? "bg-[#0A0E0B]/90 backdrop-blur-sm border-[#1A1F16]" : "bg-white border-gray-200"
              }`}>
                <div className="max-w-6xl mx-auto">
                  <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
                    <div>
                      <h3 className={`text-base sm:text-xl font-bold mb-3 sm:mb-4 ${
                        isDarkMode ? "text-white" : "text-[#646B5E]"
                      }`}>
                        Kontak Kami
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail size={16} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                          <span className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                            {footerKontakData.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone size={16} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                          <span className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                            {footerKontakData.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPinIcon size={16} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                          <span className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                            {footerKontakData.address}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`text-base sm:text-xl font-bold mb-3 sm:mb-4 ${
                        isDarkMode ? "text-white" : "text-[#646B5E]"
                      }`}>
                        Ikuti Kami
                      </h3>
                      <div className="flex gap-2 sm:gap-4">
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
                              {platform === 'facebook' && <Facebook size={16} />}
                              {platform === 'instagram' && <Instagram size={16} />}
                              {platform === 'twitter' && <Twitter size={16} />}
                              {platform === 'youtube' && <Youtube size={16} />}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`text-base sm:text-xl font-bold mb-3 sm:mb-4 ${
                        isDarkMode ? "text-white" : "text-[#646B5E]"
                      }`}>
                        Tautan Cepat
                      </h3>
                      <div className="space-y-2">
                        <button 
                          onClick={() => navigate("/admin/dashboard")}
                          className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                          }`}
                        >
                          Beranda
                        </button>
                        <button 
                          onClick={() => navigate("/admin/events")}
                          className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                          }`}
                        >
                          Lihat Event
                        </button>
                        <button 
                          onClick={() => navigate("/admin/tentang-kami")}
                          className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                          }`}
                        >
                          Tentang Kami
                        </button>
                        <button 
                          onClick={() => navigate("/admin/layanan")}
                          className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                          }`}
                        >
                          Layanan
                        </button>
                        <button 
                          onClick={() => navigate("/admin/partner")}
                          className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                          }`}
                        >
                          Partner
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`pt-6 sm:pt-8 border-t text-center ${
                    isDarkMode ? "border-[#1A1F16]" : "border-gray-200"
                  }`}>
                    <div className="mb-3 sm:mb-4">
                      <h4 className={`text-xl sm:text-2xl font-black mb-2 ${
                        isDarkMode ? "text-white" : "text-[#646B5E]"
                      }`}>
                        GASTRONOMI RUN
                      </h4>
                      <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                        Where Running Meets Culinary Adventure
                      </p>
                    </div>
                    
                    <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                      {footerKontakData.description}
                    </p>
                    
                    <div className={`flex flex-col md:flex-row justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6 ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}>
                      <span className="text-xs sm:text-sm">{footerKontakData.copyright}</span>
                      <span className="hidden md:inline">|</span>
                      <a 
                        href="https://store.gastronomirun.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-[#D7FE51] transition-colors text-xs sm:text-sm"
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
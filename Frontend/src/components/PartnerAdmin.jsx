import { useAppTheme } from "../hooks/useTheme";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Camera,
  Handshake,
  Building,
  Globe,
  Users,
  Award,
  Star,
  ExternalLink,
  Check,
  XCircle,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Bug,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import FooterKontakEditor from "../components/FooterKontakEditor";

const MySwal = withReactContent(Swal);

export default function PartnerAdmin() {
  const { themeClasses, isDarkMode } = useAppTheme();
  const navigate = useNavigate();

  // State untuk data Partner
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State untuk form editing
  const [editingSection, setEditingSection] = useState(null);
  const [editForm, setEditForm] = useState({
    hero_title: "Partner & Sponsorship",
    hero_subtitle: "Berkolaborasi untuk Kesuksesan Bersama",
    partners: []
  });

  // State untuk footer kontak
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

  // State untuk image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // ✅ Tambahkan state untuk debug
  const [debugInfo, setDebugInfo] = useState(null);

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

  // Fetch data Partner dari API
  useEffect(() => {
    fetchPartnerData();
    fetchFooterKontakData();
  }, []);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/admin/partner", {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("✅ Partner data fetched:", data);
        
        // ✅ PERBAIKAN: Normalize logo URLs
        const normalizedData = {
          ...data,
          partners: data.partners?.map(partner => ({
            ...partner,
            logo: normalizeImageUrl(partner.logo)
          })) || []
        };
        
        setPartnerData(normalizedData);
        
        if (data && Object.keys(data).length > 0) {
          setEditForm({
            hero_title: data.hero_title || "Partner & Sponsorship",
            hero_subtitle: data.hero_subtitle || "Berkolaborasi untuk Kesuksesan Bersama",
            partners: normalizedData.partners || []
          });
        } else {
          // Jika data kosong, set form default
          setEditForm({
            hero_title: "Partner & Sponsorship",
            hero_subtitle: "Berkolaborasi untuk Kesuksesan Bersama",
            partners: []
          });
        }
      } else {
        console.error("Gagal mengambil data Partner");
      }
    } catch (error) {
      console.error("Error fetching Partner data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data footer kontak
  const fetchFooterKontakData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/admin/footer-kontak", {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
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
      }
    } catch (error) {
      console.error("Error fetching footer kontak data:", error);
    }
  };

  // ✅ FUNGSI: Normalize image URL
  const normalizeImageUrl = (url) => {
    if (!url) return "";
    
    // Jika URL sudah lengkap, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Jika URL dimulai dengan /static, tambahkan base URL
    if (url.startsWith('/static/')) {
      return `http://localhost:8000${url}`;
    }
    
    // Jika hanya nama file, buat URL lengkap
    if (url && !url.includes('://') && !url.startsWith('/')) {
      return `http://localhost:8000/static/uploads/partner/${url}`;
    }
    
    // Jika dimulai dengan static (tanpa slash), tambahkan slash dan base URL
    if (url.startsWith('static/')) {
      return `http://localhost:8000/${url}`;
    }
    
    return url;
  };

  // ✅ FUNGSI: Debug upload folder
  const debugUploadFolder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/admin/partner/debug-upload", {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("🔍 Debug upload folder:", data);
        setDebugInfo(data);
        
        // Tampilkan dalam alert
        MySwal.fire({
          title: "Debug Info",
          html: `
            <div style="text-align: left; max-height: 400px; overflow-y: auto;">
              <p><strong>Directory:</strong> ${data.directory}</p>
              <p><strong>Exists:</strong> ${data.exists ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Writable:</strong> ${data.writable ? '✅ Yes' : '❌ No'}</p>
              <p><strong>File Count:</strong> ${data.file_count}</p>
              <hr>
              <h4>Files:</h4>
              <ul>
                ${data.files?.map(file => `
                  <li>
                    <strong>${file.filename}</strong><br>
                    Size: ${Math.round(file.size / 1024)}KB<br>
                    URL: <a href="${file.url}" target="_blank">${file.url}</a><br>
                    Exists: ${file.exists ? '✅' : '❌'}
                  </li>
                `).join('') || '<li>No files</li>'}
              </ul>
            </div>
          `,
          icon: "info",
          width: 600,
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      }
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  // ✅ FUNGSI: Test image URL
  const testImageUrl = (url) => {
    if (!url) return;
    
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Image loaded: ${url}`);
      MySwal.fire({
        title: "Image Test",
        text: `Image loaded successfully!`,
        icon: "success",
        background: isDarkMode ? '#1A1F16' : '#F9F9F9',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
    };
    img.onerror = () => {
      console.log(`❌ Image failed to load: ${url}`);
      MySwal.fire({
        title: "Image Test Failed",
        text: `Cannot load image from: ${url}`,
        icon: "error",
        background: isDarkMode ? '#1A1F16' : '#F9F9F9',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
    };
    img.src = url;
  };

  // Fungsi untuk upload image
  const handleImageUpload = async (file, partnerIndex = null) => {
    try {
      setUploadingImage(true);
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append('image', file);
      
      if (partnerIndex !== null) {
        formData.append('partner_index', partnerIndex.toString());
      }

      console.log("📤 Uploading image:", file.name, file.type, file.size);
      
      const res = await fetch("http://localhost:8000/admin/partner/upload-image", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
          // Jangan set Content-Type untuk FormData, browser akan set otomatis
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Upload response:", data);
        
        // ✅ PERBAIKAN: Normalize URL sebelum disimpan
        const normalizedUrl = normalizeImageUrl(data.image_url);
        
        if (partnerIndex !== null) {
          // Update partner image dengan URL yang sudah dinormalisasi
          const updatedPartners = [...editForm.partners];
          updatedPartners[partnerIndex] = {
            ...updatedPartners[partnerIndex],
            logo: normalizedUrl
          };
          setEditForm({
            ...editForm,
            partners: updatedPartners
          });
          
          // Test image URL
          setTimeout(() => testImageUrl(normalizedUrl), 500);
        }
        
        return normalizedUrl;
      } else {
        const errorText = await res.text();
        console.error("❌ Upload failed:", res.status, errorText);
        throw new Error(`Gagal upload gambar: ${res.status} ${errorText}`);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      MySwal.fire({
        title: "Gagal!",
        text: `Terjadi kesalahan saat upload gambar: ${error.message}`,
        icon: "error",
        background: isDarkMode ? '#1A1F16' : '#F9F9F9',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Fungsi untuk menyimpan perubahan
  const handleSave = async (section) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      // ✅ PERBAIKAN: Simpan hanya path relatif ke database
      const dataToSave = {
        ...editForm,
        partners: editForm.partners.map(partner => ({
          ...partner,
          // Hapus base URL, simpan hanya path
          logo: partner.logo?.replace('http://localhost:8000', '') || ''
        }))
      };
      
      const dataToSend = {
        section: section,
        data: dataToSave
      };

      console.log("💾 Saving data:", dataToSend);
      
      const res = await fetch("http://localhost:8000/admin/partner", {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        setEditingSection(null);
        await fetchPartnerData();
        
        MySwal.fire({
          title: "Berhasil!",
          text: "Data berhasil disimpan",
          icon: "success",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      } else {
        const errorText = await res.text();
        console.error("❌ Save failed:", res.status, errorText);
        throw new Error(`Gagal menyimpan data: ${res.status} ${errorText}`);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      MySwal.fire({
        title: "Gagal!",
        text: `Terjadi kesalahan saat menyimpan data: ${error.message}`,
        icon: "error",
        background: isDarkMode ? '#1A1F16' : '#F9F9F9',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
    } finally {
      setSaving(false);
    }
  };

  // Fungsi untuk reset data
  const handleResetData = () => {
    MySwal.fire({
      title: "Reset Data?",
      text: "Semua data partner akan direset ke default. Tindakan ini tidak dapat dibatalkan!",
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
          const res = await fetch("http://localhost:8000/admin/partner/reset", {
            method: "DELETE",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (res.ok) {
            await fetchPartnerData();
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

  // Fungsi untuk edit item partner
  const handleEditPartner = (index, field, value) => {
    const updatedPartners = [...editForm.partners];
    updatedPartners[index] = {
      ...updatedPartners[index],
      [field]: value
    };
    setEditForm({
      ...editForm,
      partners: updatedPartners
    });
  };

  // Fungsi untuk tambah partner baru
  const handleAddPartner = () => {
    const newPartner = {
      name: "Partner Baru",
      description: "Deskripsi partner",
      category: "sponsor",
      logo: "",
      website: "",
      order: editForm.partners.length + 1
    };
    
    setEditForm({
      ...editForm,
      partners: [...editForm.partners, newPartner]
    });
  };

  // Fungsi untuk hapus partner
  const handleRemovePartner = (index) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: "Partner ini akan dihapus",
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
        const updatedPartners = [...editForm.partners];
        updatedPartners.splice(index, 1);
        setEditForm({
          ...editForm,
          partners: updatedPartners
        });
      }
    });
  };

  // Fungsi untuk reorder partner (naik)
  const handleMoveUp = (index) => {
    if (index === 0) return;
    
    const updatedPartners = [...editForm.partners];
    const temp = updatedPartners[index];
    updatedPartners[index] = updatedPartners[index - 1];
    updatedPartners[index - 1] = temp;
    
    // Update order
    updatedPartners.forEach((partner, idx) => {
      partner.order = idx + 1;
    });
    
    setEditForm({
      ...editForm,
      partners: updatedPartners
    });
  };

  // Fungsi untuk reorder partner (turun)
  const handleMoveDown = (index) => {
    if (index === editForm.partners.length - 1) return;
    
    const updatedPartners = [...editForm.partners];
    const temp = updatedPartners[index];
    updatedPartners[index] = updatedPartners[index + 1];
    updatedPartners[index + 1] = temp;
    
    // Update order
    updatedPartners.forEach((partner, idx) => {
      partner.order = idx + 1;
    });
    
    setEditForm({
      ...editForm,
      partners: updatedPartners
    });
  };

  // ✅ FUNGSI: Log image info untuk debugging
  const logImageInfo = (partner, index) => {
    console.log(`🖼️ Partner ${index} (${partner.name}):`, {
      logo: partner.logo,
      normalized: normalizeImageUrl(partner.logo),
      testUrl: `http://localhost:8000${partner.logo}`,
      exists: partner.logo ? 'Checking...' : 'No logo'
    });
    
    if (partner.logo) {
      testImageUrl(normalizeImageUrl(partner.logo));
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
            Memuat data Partner...
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
              Partner Admin
            </h1>
            <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
              Kelola halaman partner dan sponsorship
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
          </div>
        </div>

        {/* Hero Section Editor */}
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
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
                  {editForm.hero_title}
                </h3>
                <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                  {editForm.hero_subtitle}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Partners Editor */}
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
                Partners & Sponsorship ({editForm.partners.length})
              </h2>
              {editingSection === 'partners' ? (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleSave('partners')}
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
                    onClick={() => setEditingSection('partners')}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                        : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                    }`}
                  >
                    <Edit size={14} />
                    Edit Partners
                  </button>
                  <button
                    onClick={handleAddPartner}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                      isDarkMode 
                        ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                        : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                    }`}
                  >
                    <Plus size={14} />
                    Tambah Partner
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {editingSection === 'partners' ? (
              <div className="space-y-4 sm:space-y-6">
                {editForm.partners.length === 0 ? (
                  <div className={`text-center py-8 rounded-lg ${
                    isDarkMode ? "bg-[#2A3025]" : "bg-gray-50"
                  }`}>
                    <Handshake size={48} className={`mx-auto mb-4 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-400"}`} />
                    <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                      Belum ada partner. Klik "Tambah Partner" untuk menambahkan.
                    </p>
                  </div>
                ) : (
                  editForm.partners.map((partner, index) => (
                    <div key={index} className={`p-4 sm:p-6 rounded-lg ${
                      isDarkMode ? "bg-[#2A3025]" : "bg-gray-50"
                    }`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            partner.category === 'sponsor' 
                              ? isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800"
                              : partner.category === 'media' 
                              ? isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-800"
                              : isDarkMode ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-800"
                          }`}>
                            {partner.category === 'sponsor' ? 'Sponsor' : 
                             partner.category === 'media' ? 'Media Partner' : 'Community Partner'}
                          </div>
                          <h4 className={`font-medium text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                            {partner.name || `Partner #${index + 1}`}
                          </h4>
                          <button
                            onClick={() => logImageInfo(partner, index)}
                            className={`p-1 rounded ${
                              isDarkMode 
                                ? "text-yellow-400 hover:bg-yellow-900/20" 
                                : "text-yellow-600 hover:bg-yellow-100"
                            }`}
                            title="Debug image URL"
                          >
                            <Bug size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className={`p-1.5 rounded ${
                                index === 0
                                  ? isDarkMode ? "text-[#363D30]" : "text-gray-300"
                                  : isDarkMode ? "text-[#ABB89D] hover:bg-[#363D30]" : "text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === editForm.partners.length - 1}
                              className={`p-1.5 rounded ${
                                index === editForm.partners.length - 1
                                  ? isDarkMode ? "text-[#363D30]" : "text-gray-300"
                                  : isDarkMode ? "text-[#ABB89D] hover:bg-[#363D30]" : "text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemovePartner(index)}
                            className={`p-1.5 sm:p-2 rounded-full ${
                              isDarkMode ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-100"
                            }`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Logo Section */}
                        <div className="lg:col-span-1">
                          <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                            Logo Partner
                          </label>
                          <div className={`rounded-lg border-2 border-dashed p-4 text-center ${
                            isDarkMode 
                              ? "border-[#363D30] bg-[#1A1F16]" 
                              : "border-gray-300 bg-white"
                          }`}>
                            {partner.logo ? (
                              <div className="space-y-3">
                                <img 
                                  src={normalizeImageUrl(partner.logo)} 
                                  alt={partner.name}
                                  className="h-32 w-32 object-contain mx-auto rounded-lg"
                                  onError={(e) => {
                                    console.error(`❌ Image failed to load: ${partner.logo}`);
                                    e.target.onerror = null;
                                    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dominant-baseline='middle'>Image Error</text></svg>";
                                  }}
                                  onLoad={() => console.log(`✅ Image loaded: ${partner.logo}`)}
                                />
                                <div className="text-xs text-gray-500 mb-2">
                                  URL: {partner.logo}
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  <button
                                    onClick={async () => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.onchange = async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          const imageUrl = await handleImageUpload(file, index);
                                          if (imageUrl) {
                                            handleEditPartner(index, 'logo', imageUrl);
                                          }
                                        }
                                      };
                                      input.click();
                                    }}
                                    disabled={uploadingImage}
                                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 text-xs ${
                                      isDarkMode 
                                        ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    } ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    <Upload size={12} />
                                    Ganti Logo
                                  </button>
                                  <button
                                    onClick={() => handleEditPartner(index, 'logo', '')}
                                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 text-xs ${
                                      isDarkMode 
                                        ? "bg-[#363D30] text-red-400 hover:bg-red-900/20" 
                                        : "bg-gray-200 text-red-600 hover:bg-red-100"
                                    }`}
                                  >
                                    <Trash2 size={12} />
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className={`w-32 h-32 mx-auto rounded-lg flex items-center justify-center ${
                                  isDarkMode ? "bg-[#2A3025]" : "bg-gray-100"
                                }`}>
                                  <ImageIcon size={32} className={isDarkMode ? "text-[#ABB89D]" : "text-gray-400"} />
                                </div>
                                <button
                                  onClick={async () => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = async (e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const imageUrl = await handleImageUpload(file, index);
                                        if (imageUrl) {
                                          handleEditPartner(index, 'logo', imageUrl);
                                        }
                                      }
                                    };
                                    input.click();
                                  }}
                                  disabled={uploadingImage}
                                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 text-xs ${
                                    isDarkMode 
                                      ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  } ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <Upload size={12} />
                                  Upload Logo
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Info Section */}
                        <div className="lg:col-span-2 space-y-4">
                          <div>
                            <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                              Nama Partner
                            </label>
                            <input
                              type="text"
                              value={partner.name}
                              onChange={(e) => handleEditPartner(index, 'name', e.target.value)}
                              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                isDarkMode 
                                  ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                  : "bg-white border-gray-300 text-gray-700"
                              }`}
                              placeholder="Nama perusahaan/organisasi"
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                              Deskripsi
                            </label>
                            <textarea
                              value={partner.description}
                              onChange={(e) => handleEditPartner(index, 'description', e.target.value)}
                              rows={3}
                              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                isDarkMode 
                                  ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                  : "bg-white border-gray-300 text-gray-700"
                              }`}
                              placeholder="Deskripsi singkat tentang partner"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                                Kategori
                              </label>
                              <select
                                value={partner.category}
                                onChange={(e) => handleEditPartner(index, 'category', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                  isDarkMode 
                                    ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                    : "bg-white border-gray-300 text-gray-700"
                                }`}
                              >
                                <option value="sponsor">Sponsor</option>
                                <option value="media">Media Partner</option>
                                <option value="community">Community Partner</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"}`}>
                                Website
                              </label>
                              <input
                                type="url"
                                value={partner.website}
                                onChange={(e) => handleEditPartner(index, 'website', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                  isDarkMode 
                                    ? "bg-[#1A1F16] border-[#363D30] text-white" 
                                    : "bg-white border-gray-300 text-gray-700"
                                }`}
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {editForm.partners.length === 0 ? (
                  <div className={`text-center py-8 rounded-lg ${
                    isDarkMode ? "bg-[#2A3025]" : "bg-gray-50"
                  }`}>
                    <Handshake size={48} className={`mx-auto mb-4 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-400"}`} />
                    <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                      Belum ada partner yang ditambahkan.
                    </p>
                    <button
                      onClick={() => setEditingSection('partners')}
                      className={`mt-4 px-4 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto ${
                        isDarkMode 
                          ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                          : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                      }`}
                    >
                      <Plus size={14} />
                      Tambah Partner Pertama
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {editForm.partners.map((partner, index) => (
                      <div key={index} className={`p-4 sm:p-6 rounded-lg sm:rounded-xl text-center ${
                        isDarkMode 
                          ? "bg-[#1A1F16]/50 backdrop-blur-sm border border-[#363D30]/50 hover:border-[#D7FE51]/20" 
                          : "bg-gray-50 border border-gray-200 hover:border-[#646B5E]"
                      } transition-colors duration-300`}>
                        {/* Logo */}
                        <div className="mb-4">
                          <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden bg-white p-2">
                            {partner.logo ? (
                              <img 
                                src={normalizeImageUrl(partner.logo)} 
                                alt={partner.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  console.error(`❌ Preview image failed: ${partner.logo}`);
                                  e.target.onerror = null;
                                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dominant-baseline='middle'>No Logo</text></svg>";
                                }}
                                onLoad={() => console.log(`✅ Preview loaded: ${partner.logo}`)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                                <Building size={32} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Info */}
                        <div className="mb-3">
                          <h4 className={`font-bold text-base sm:text-lg mb-1 ${isDarkMode ? "text-white" : "text-[#646B5E]"}`}>
                            {partner.name}
                          </h4>
                          <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                            partner.category === 'sponsor' 
                              ? isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800"
                              : partner.category === 'media' 
                              ? isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-800"
                              : isDarkMode ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-800"
                          }`}>
                            {partner.category === 'sponsor' ? 'Sponsor' : 
                             partner.category === 'media' ? 'Media Partner' : 'Community Partner'}
                          </div>
                          <p className={`text-xs sm:text-sm mb-3 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                            {partner.description}
                          </p>
                        </div>
                        
                        {/* Order Indicator */}
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                          isDarkMode ? "bg-[#363D30] text-[#ABB89D]" : "bg-gray-200 text-gray-600"
                        }`}>
                          Urutan: {partner.order}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                          onClick={() => navigate("/admin/layanan")}
                          className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                          }`}
                        >
                          Layanan
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
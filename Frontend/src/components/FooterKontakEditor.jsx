// components/FooterKontakEditor.jsx
import { useState, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  MapPin as MapPinIcon, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Edit,
  Save,
  X,
  Globe,
  Link,
  Info,
  AlertCircle,
  ExternalLink,
  Layout,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function FooterKontakEditor({ 
  isDarkMode,
  sectionName = "footer_kontak",
  onSave
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(null);
  
  const [footerData, setFooterData] = useState({
    email: "",
    phone: "",
    address: "",
    copyright: "",
    social_media: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: ""
    },
    description: "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang."
  });

  const [editForm, setEditForm] = useState({ ...footerData });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch data footer kontak
  const fetchFooterData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Coba ambil dari API admin terlebih dahulu
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("http://localhost:8000/admin/footer-kontak", {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (res.ok) {
            const data = await res.json();
            const formattedData = {
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
              copyright: data.copyright || "© 2024 Gastronomi Run. All rights reserved.",
              description: data.description || "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
              social_media: data.social_media || {
                facebook: "",
                instagram: "",
                twitter: "",
                youtube: ""
              }
            };
            
            setFooterData(formattedData);
            setEditForm(formattedData);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn("Gagal mengambil data dari admin endpoint:", error);
        }
      }
      
      // Jika gagal dari admin, coba dari public endpoint
      const publicRes = await fetch("http://localhost:8000/footer-kontak/public");
      if (publicRes.ok) {
        const data = await publicRes.json();
        const formattedData = {
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          copyright: data.copyright || "© 2024 Gastronomi Run. All rights reserved.",
          description: data.description || "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
          social_media: data.social_media || {
            facebook: "",
            instagram: "",
            twitter: "",
            youtube: ""
          }
        };
        
        setFooterData(formattedData);
        setEditForm(formattedData);
      } else {
        // Set default data
        const defaultData = {
          email: "info@gastronomirun.com",
          phone: "(021) 1234-5678",
          address: "Jakarta Running Center, Indonesia",
          copyright: "© 2024 Gastronomi Run. All rights reserved.",
          description: "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
          social_media: {
            facebook: "https://facebook.com/gastronomirun",
            instagram: "https://instagram.com/gastronomirun",
            twitter: "https://twitter.com/gastronomirun",
            youtube: "https://youtube.com/gastronomirun"
          }
        };
        setFooterData(defaultData);
        setEditForm(defaultData);
      }
    } catch (error) {
      console.error("Error fetching footer data:", error);
      setError("Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterData();
  }, []);

  // Fungsi untuk menyimpan perubahan
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      // Validasi data sebelum dikirim
      const dataToSend = {
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        copyright: editForm.copyright.trim(),
        description: editForm.description.trim(),
        social_media: {
          facebook: editForm.social_media?.facebook?.trim() || "",
          instagram: editForm.social_media?.instagram?.trim() || "",
          twitter: editForm.social_media?.twitter?.trim() || "",
          youtube: editForm.social_media?.youtube?.trim() || ""
        }
      };

      const res = await fetch("http://localhost:8000/admin/footer-kontak", {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const responseText = await res.text();

      if (res.ok) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { message: "Data berhasil disimpan" };
        }
        
        // Update state dengan data yang dikembalikan dari server
        if (responseData.data) {
          setFooterData(responseData.data);
        } else {
          setFooterData(dataToSend);
        }
        
        setIsEditModalOpen(false);
        
        // Panggil callback onSave jika ada
        if (onSave) {
          onSave();
        }
        
        MySwal.fire({
          title: "Berhasil!",
          text: responseData.message || "Data footer kontak berhasil disimpan",
          icon: "success",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
          confirmButtonColor: isDarkMode ? '#D7FE51' : '#646B5E',
        });
      } else {
        let errorMessage = "Gagal menyimpan data footer kontak";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error saving footer contact data:", error);
      setError(error.message);
      
      MySwal.fire({
        title: "Gagal!",
        text: error.message || "Terjadi kesalahan saat menyimpan data footer kontak",
        icon: "error",
        background: isDarkMode ? '#1A1F16' : '#F9F9F9',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
        confirmButtonColor: isDarkMode ? '#D7FE51' : '#646B5E',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle perubahan form
  const handleChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setEditForm(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
  };

  // Handle reset form ke data awal
  const handleCancel = () => {
    setIsEditModalOpen(false);
    setEditForm(footerData);
    setError(null);
  };

  // Handle open edit modal
  const handleOpenEditModal = () => {
    setEditForm(footerData);
    setError(null);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${
        isDarkMode ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" : "bg-white"
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-[#D7FE51]" : "border-[#646B5E]"
          } mx-auto mb-4`}></div>
          <p className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}>
            Memuat data footer kontak...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-colors duration-300 ${
      isDarkMode ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" : "bg-white"
    }`}>
      {/* Container untuk Footer Kontak Editor */}
      <div className="relative">
        {/* Header */}
        <div className={`p-4 border-b ${
          isDarkMode ? "border-[#363D30] bg-[#1A1F16]" : "border-gray-200 bg-gray-50"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                <Settings size={18} />
                Pengaturan Footer Kontak
              </h3>
              <p className={`text-sm mt-1 ${
                isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
              }`}>
                Kelola informasi kontak yang muncul di footer semua halaman
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 text-sm ${
                  isDarkMode 
                    ? "bg-[#363D30] text-[#ABB89D] hover:bg-[#2A3025]" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPreview ? 'Sembunyikan Preview' : 'Lihat Preview'}
              </button>
              
              <button
                onClick={handleOpenEditModal}
                className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 text-sm ${
                  isDarkMode 
                    ? "bg-[#D7FE51] text-[#1A1F16] hover:bg-[#C4E840]" 
                    : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                }`}
              >
                <Edit size={14} />
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className={`p-4 border-b ${
                isDarkMode ? "border-[#363D30] bg-[#0A0E0B]/50" : "border-gray-200 bg-gray-50"
              }`}>
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
                }`}>
                  <Eye size={14} />
                  Preview Footer Kontak
                </h4>
                
                <div className={`rounded-lg p-4 ${
                  isDarkMode 
                    ? "bg-[#1A1F16] border border-[#363D30]" 
                    : "bg-white border border-gray-200"
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs font-medium mb-1 ${
                        isDarkMode ? "text-[#ABB89D]" : "text-gray-500"
                      }`}>
                        Email
                      </p>
                      <p className={isDarkMode ? "text-white text-sm" : "text-gray-800 text-sm"}>
                        {footerData.email || "Belum diatur"}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${
                        isDarkMode ? "text-[#ABB89D]" : "text-gray-500"
                      }`}>
                        Telepon
                      </p>
                      <p className={isDarkMode ? "text-white text-sm" : "text-gray-800 text-sm"}>
                        {footerData.phone || "Belum diatur"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className={`text-xs font-medium mb-1 ${
                        isDarkMode ? "text-[#ABB89D]" : "text-gray-500"
                      }`}>
                        Alamat
                      </p>
                      <p className={isDarkMode ? "text-white text-sm" : "text-gray-800 text-sm"}>
                        {footerData.address || "Belum diatur"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Display */}
        <div className="p-4">
          <div className={`rounded-lg overflow-hidden ${
            isDarkMode 
              ? "bg-[#1A1F16]/30 border border-[#363D30]" 
              : "bg-gray-50 border border-gray-200"
          }`}>
            <div className="p-4 border-b border-gray-200 dark:border-[#363D30]">
              <h4 className={`text-sm font-semibold flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                <Info size={14} />
                Data Footer Kontak Saat Ini
              </h4>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                    Email
                  </label>
                  <div className={`p-2 rounded border ${
                    isDarkMode 
                      ? "bg-[#2A3025] border-[#363D30] text-white" 
                      : "bg-white border-gray-300 text-gray-700"
                  }`}>
                    {footerData.email || <span className="text-gray-500 dark:text-[#ABB89D]/50">Belum diatur</span>}
                  </div>
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                    Telepon
                  </label>
                  <div className={`p-2 rounded border ${
                    isDarkMode 
                      ? "bg-[#2A3025] border-[#363D30] text-white" 
                      : "bg-white border-gray-300 text-gray-700"
                  }`}>
                    {footerData.phone || <span className="text-gray-500 dark:text-[#ABB89D]/50">Belum diatur</span>}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                    Alamat
                  </label>
                  <div className={`p-2 rounded border ${
                    isDarkMode 
                      ? "bg-[#2A3025] border-[#363D30] text-white" 
                      : "bg-white border-gray-300 text-gray-700"
                  }`}>
                    {footerData.address || <span className="text-gray-500 dark:text-[#ABB89D]/50">Belum diatur</span>}
                  </div>
                </div>
              </div>
              
              <div>
                <label className={`block text-xs font-medium mb-1 ${
                  isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                }`}>
                  Media Sosial
                </label>
                <div className="flex flex-wrap gap-2 p-2 rounded border border-gray-300 dark:border-[#363D30]">
                  {footerData.social_media && Object.entries(footerData.social_media).map(([platform, url]) => (
                    <div key={platform} className="flex items-center gap-1">
                      <div className={`p-1.5 rounded ${
                        url ? (
                          isDarkMode 
                            ? "bg-[#363D30] text-[#ABB89D]" 
                            : "bg-gray-200 text-gray-700"
                        ) : (
                          isDarkMode 
                            ? "bg-[#2A3025] text-[#ABB89D]/50" 
                            : "bg-gray-100 text-gray-400"
                        )
                      }`}>
                        {platform === 'facebook' && <Facebook size={14} />}
                        {platform === 'instagram' && <Instagram size={14} />}
                        {platform === 'twitter' && <Twitter size={14} />}
                        {platform === 'youtube' && <Youtube size={14} />}
                      </div>
                      <span className={`text-xs ${
                        isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                      }`}>
                        {url ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Tidak diatur'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-[#ABB89D]/70">
                <p>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit - Responsif dan Tidak Terpotong */}
      <AnimatePresence>
        {isEditModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleCancel}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div 
                className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-[#1A1F16] to-[#0A0E0B] border border-[#363D30]" 
                    : "bg-white border border-gray-200 shadow-xl"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className={`p-4 sm:p-6 border-b flex-shrink-0 ${
                  isDarkMode ? "border-[#363D30] bg-[#1A1F16]" : "border-gray-200 bg-gray-50"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${
                        isDarkMode ? "text-white" : "text-[#646B5E]"
                      }`}>
                        <Edit size={18} />
                        Edit Footer Kontak
                      </h3>
                      <p className={`text-sm mt-1 ${
                        isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                      }`}>
                        Ubah informasi footer yang akan ditampilkan di semua halaman
                      </p>
                    </div>
                    <button
                      onClick={handleCancel}
                      className={`p-2 rounded-lg ${
                        isDarkMode 
                          ? "hover:bg-[#363D30] text-[#ABB89D]" 
                          : "hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="space-y-6">
                    {error && (
                      <div className={`p-4 rounded-lg ${
                        isDarkMode 
                          ? "bg-red-900/20 border border-red-800/50" 
                          : "bg-red-50 border border-red-200"
                      }`}>
                        <div className="flex items-start gap-3">
                          <AlertCircle size={18} className={isDarkMode ? "text-red-400 mt-0.5" : "text-red-600 mt-0.5"} />
                          <p className={`text-sm ${isDarkMode ? "text-red-300" : "text-red-600"}`}>
                            {error}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Kontak Dasar */}
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                        isDarkMode ? "text-white" : "text-[#646B5E]"
                      }`}>
                        <Mail size={16} />
                        Informasi Kontak Dasar
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                          }`}>
                            Email Kontak *
                          </label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
                              isDarkMode 
                                ? "bg-[#2A3025] border-[#363D30] text-white focus:border-[#D7FE51] focus:ring-1 focus:ring-[#D7FE51]" 
                                : "bg-white border-gray-300 text-gray-700 focus:border-[#646B5E] focus:ring-1 focus:ring-[#646B5E]"
                            } focus:outline-none`}
                            placeholder="info@gastronomirun.com"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                          }`}>
                            Nomor Telepon *
                          </label>
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
                              isDarkMode 
                                ? "bg-[#2A3025] border-[#363D30] text-white focus:border-[#D7FE51] focus:ring-1 focus:ring-[#D7FE51]" 
                                : "bg-white border-gray-300 text-gray-700 focus:border-[#646B5E] focus:ring-1 focus:ring-[#646B5E]"
                            } focus:outline-none`}
                            placeholder="(021) 1234-5678"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className={`block text-xs font-medium mb-1.5 ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                          }`}>
                            Alamat Lengkap *
                          </label>
                          <textarea
                            value={editForm.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            rows={2}
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
                              isDarkMode 
                                ? "bg-[#2A3025] border-[#363D30] text-white focus:border-[#D7FE51] focus:ring-1 focus:ring-[#D7FE51]" 
                                : "bg-white border-gray-300 text-gray-700 focus:border-[#646B5E] focus:ring-1 focus:ring-[#646B5E]"
                            } focus:outline-none`}
                            placeholder="Jakarta Running Center, Indonesia"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deskripsi & Copyright */}
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                        isDarkMode ? "text-white" : "text-[#646B5E]"
                      }`}>
                        <Layout size={16} />
                        Konten Footer
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                          }`}>
                            Deskripsi Footer *
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={4}
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
                              isDarkMode 
                                ? "bg-[#2A3025] border-[#363D30] text-white focus:border-[#D7FE51] focus:ring-1 focus:ring-[#D7FE51]" 
                                : "bg-white border-gray-300 text-gray-700 focus:border-[#646B5E] focus:ring-1 focus:ring-[#646B5E]"
                            } focus:outline-none`}
                            placeholder="Deskripsi tentang Gastronomi Run..."
                            required
                          />
                          <p className={`text-xs mt-1.5 ${
                            isDarkMode ? "text-[#ABB89D]/70" : "text-gray-500"
                          }`}>
                            Maksimal 500 karakter. Saat ini: {editForm.description.length} karakter
                          </p>
                        </div>
                        
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                          }`}>
                            Teks Copyright *
                          </label>
                          <input
                            type="text"
                            value={editForm.copyright}
                            onChange={(e) => handleChange('copyright', e.target.value)}
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
                              isDarkMode 
                                ? "bg-[#2A3025] border-[#363D30] text-white focus:border-[#D7FE51] focus:ring-1 focus:ring-[#D7FE51]" 
                                : "bg-white border-gray-300 text-gray-700 focus:border-[#646B5E] focus:ring-1 focus:ring-[#646B5E]"
                            } focus:outline-none`}
                            placeholder="© 2024 Gastronomi Run. All rights reserved."
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Media Sosial */}
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                        isDarkMode ? "text-white" : "text-[#646B5E]"
                      }`}>
                        <Globe size={16} />
                        Media Sosial
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { key: 'facebook', label: 'Facebook', icon: Facebook },
                          { key: 'instagram', label: 'Instagram', icon: Instagram },
                          { key: 'twitter', label: 'Twitter', icon: Twitter },
                          { key: 'youtube', label: 'YouTube', icon: Youtube }
                        ].map((platform) => (
                          <div key={platform.key}>
                            <label className={`block text-xs font-medium mb-1.5 ${
                              isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                            }`}>
                              {platform.label}
                            </label>
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded ${
                                isDarkMode ? "bg-[#363D30]" : "bg-gray-100"
                              }`}>
                                <platform.icon size={16} className={
                                  editForm.social_media[platform.key] 
                                    ? (isDarkMode ? "text-[#D7FE51]" : "text-[#646B5E]") 
                                    : (isDarkMode ? "text-[#ABB89D]/50" : "text-gray-400")
                                } />
                              </div>
                              <input
                                type="url"
                                value={editForm.social_media[platform.key] || ""}
                                onChange={(e) => handleSocialMediaChange(platform.key, e.target.value)}
                                className={`flex-1 px-3 py-2.5 text-sm rounded-lg border ${
                                  isDarkMode 
                                    ? "bg-[#2A3025] border-[#363D30] text-white focus:border-[#D7FE51] focus:ring-1 focus:ring-[#D7FE51]" 
                                    : "bg-white border-gray-300 text-gray-700 focus:border-[#646B5E] focus:ring-1 focus:ring-[#646B5E]"
                                } focus:outline-none`}
                                placeholder={`https://${platform.key}.com/gastronomirun`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className={`text-xs mt-3 ${
                        isDarkMode ? "text-[#ABB89D]/70" : "text-gray-500"
                      }`}>
                        Kosongkan jika tidak ingin menampilkan media sosial tertentu
                      </p>
                    </div>

                    {/* Info Box */}
                    <div className={`p-4 rounded-lg ${
                      isDarkMode 
                        ? "bg-[#1A1F16]/50 border border-[#D7FE51]/20" 
                        : "bg-[#D7FE51]/10 border border-[#D7FE51]/30"
                    }`}>
                      <div className="flex items-start gap-3">
                        <Info size={18} className={
                          isDarkMode ? "text-[#D7FE51] mt-0.5" : "text-[#646B5E] mt-0.5"
                        } />
                        <div>
                          <h5 className={`text-sm font-semibold mb-1 ${
                            isDarkMode ? "text-white" : "text-[#646B5E]"
                          }`}>
                            Perubahan akan diterapkan di semua halaman
                          </h5>
                          <p className={`text-xs ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                          }`}>
                            Data footer kontak akan ditampilkan secara konsisten di footer semua halaman website.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className={`p-4 sm:p-6 border-t flex-shrink-0 ${
                  isDarkMode ? "border-[#363D30] bg-[#1A1F16]" : "border-gray-200 bg-gray-50"
                }`}>
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={handleCancel}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm border ${
                        isDarkMode 
                          ? "border-[#363D30] text-[#ABB89D] hover:bg-[#363D30]" 
                          : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${
                        isDarkMode 
                          ? "bg-[#D7FE51] text-[#1A1F16] hover:bg-[#C4E840]" 
                          : "bg-[#646B5E] text-white hover:bg-[#ABB89D]"
                      } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Save size={16} />
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
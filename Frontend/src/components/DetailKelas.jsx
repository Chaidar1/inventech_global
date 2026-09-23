// DetailKelas.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useAppTheme } from "../hooks/useTheme";

// Import Lucide React icons
import { 
  ArrowLeft, 
  Users,
  Tag, 
  DollarSign, 
  Clock,
  MapPin,
  FileText,
  Trash2,
  Edit3,
  Eye,
  Info,
  CheckCircle,
  AlertCircle,
  X,
  Images,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Ticket,
  Plus,
  Star,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Calendar,
  RefreshCw,
  Power,
  PowerOff
} from "lucide-react";

// =========== KOMPONEN INPUT FIELD YANG TERPISAH ===========
const InputField = React.memo(({ 
  label, 
  name, 
  type = "text", 
  icon, 
  value, 
  onChange, 
  placeholder, 
  required, 
  min, 
  max,
  step,
  rows,
  isDarkMode
}) => {
  const handleChange = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(e);
  }, [onChange]);

  const handleBlur = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(e);
  }, [onChange]);

  if (type === "textarea") {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold">
          <span className="flex items-center gap-2">
            {icon} {label}
            {required && <span className="text-red-500">*</span>}
          </span>
        </label>
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows || 4}
          className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none transition-all duration-300 resize-none ${
            isDarkMode
              ? "bg-[#1A1F16] border-[#363D30] text-white placeholder-[#ABB89D] focus:ring-2 focus:ring-[#D7FE51] focus:border-transparent"
              : "border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          }`}
          required={required}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">
        <span className="flex items-center gap-2">
          {icon} {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full border rounded-xl px-4 pl-10 py-3.5 focus:outline-none transition-all duration-300 ${
            isDarkMode
              ? "bg-[#1A1F16] border-[#363D30] text-white placeholder-[#ABB89D] focus:ring-2 focus:ring-[#D7FE51] focus:border-transparent"
              : "border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          }`}
          required={required}
        />
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? "text-[#ABB89D]" : "text-gray-500"
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
});

// =========== KOMPONEN CHECKBOX FIELD ===========
const CheckboxField = React.memo(({ 
  label, 
  name, 
  checked, 
  onChange, 
  isDarkMode,
  icon
}) => {
  const handleChange = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(e);
  }, [onChange]);

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={handleChange}
        className={`h-4 w-4 rounded ${
          isDarkMode 
            ? "bg-[#1A1F16] border-[#363D30] text-[#D7FE51]" 
            : "border-gray-300 text-purple-600"
        }`}
      />
      <label
        htmlFor={name}
        className={`ml-2 flex items-center gap-2 ${
          isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
        }`}
      >
        {icon && icon}
        {label}
      </label>
    </div>
  );
});

// =========== KOMPONEN TIKET KATEGORI FORM ===========
const TiketKategoriForm = React.memo(({ 
  editingTiket, 
  isDarkMode, 
  form,
  errorMsg, 
  isSubmitting,
  onClose,
  onSubmit,
  onChange
}) => {
  const [benefits, setBenefits] = useState([]);

  // Initialize benefits from form data
  useEffect(() => {
    if (form.manfaat) {
      let benefitArray = [];
      
      if (typeof form.manfaat === 'string' && form.manfaat.trim() !== '') {
        // Split by comma if it's a string
        benefitArray = form.manfaat.split(',').map(b => b.trim()).filter(b => b);
      } else if (Array.isArray(form.manfaat) && form.manfaat.length > 0) {
        benefitArray = [...form.manfaat];
      }
      
      // Jika array kosong, tambahkan satu benefit default (hanya untuk form baru)
      if (benefitArray.length === 0 && !editingTiket) {
        benefitArray = ["Benefit 1"];
      }
      
      setBenefits(benefitArray);
    } else if (!editingTiket) {
      // Untuk form baru, inisialisasi dengan satu benefit
        setBenefits(["Benefit 1"]);
    }
  }, [form.manfaat, editingTiket]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validasi field required
    const missing = [];
    if (!form.nama_kategori?.trim()) missing.push("Nama Kategori");
    if (!form.deskripsi?.trim()) missing.push("Deskripsi");
    if (!form.harga || isNaN(form.harga)) missing.push("Harga");
    
    // Validasi benefit
    const validBenefits = benefits.filter(b => b.trim() !== "");
    if (validBenefits.length === 0) {
      missing.push("Manfaat/Benefit");
    }
    
    if (missing.length > 0) {
      // Set error ke parent component
      onSubmit({ 
        error: `Harap lengkapi: ${missing.join(", ")}`,
        event: e 
      });
      return;
    }

    if (parseFloat(form.harga) < 0) {
      onSubmit({ 
        error: "Harga harus berupa angka positif",
        event: e 
      });
      return;
    }

    // Convert benefits array to string for submission
    const formDataToSubmit = {
      ...form,
      manfaat: validBenefits.join(', ')
    };
    
    // Kirim data ke parent
    onSubmit({ 
      data: formDataToSubmit,
      event: e 
    });
  }, [onSubmit, form, benefits]);

  const handleClose = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onChange]);

  // Fungsi untuk menambah benefit baru
  const handleAddBenefit = useCallback(() => {
    setBenefits(prev => [...prev, `Benefit ${prev.length + 1}`]);
  }, []);

  // Fungsi untuk mengedit benefit
  const handleEditBenefit = useCallback((index, value) => {
    setBenefits(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  // Fungsi untuk menghapus benefit
  const handleRemoveBenefit = useCallback((index) => {
    Swal.fire({
      title: "Hapus Benefit?",
      text: "Apakah Anda yakin ingin menghapus benefit ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: isDarkMode ? '#1A1F16' : '#ffffff',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
      confirmButtonColor: isDarkMode ? "#D7FE51" : "#D46B5E",
    }).then((result) => {
      if (result.isConfirmed) {
        setBenefits(prev => {
          const updated = [...prev];
          updated.splice(index, 1);
          // Jika tidak ada benefit lagi, tambahkan satu default
          if (updated.length === 0) {
            updated.push("Benefit 1");
          }
          return updated;
        });
      }
    });
  }, [isDarkMode]);

  // Update form data parent ketika benefits berubah
  useEffect(() => {
    if (benefits.length > 0) {
      const timeoutId = setTimeout(() => {
        const benefitsString = benefits.join(', ');
        if (benefitsString !== form.manfaat) {
          onChange({
            target: {
              name: "manfaat",
              value: benefitsString
            }
          });
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [benefits, form.manfaat, onChange]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={`rounded-2xl p-6 shadow-lg overflow-hidden backdrop-blur-sm ${
        isDarkMode 
          ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50" 
          : "bg-white/95 border border-purple-100"
      }`}
    >
      {/* Header Form */}
      <div className={`relative mb-6 pb-4 border-b ${
        isDarkMode ? "border-[#363D30]" : "border-purple-100"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isDarkMode 
                ? "bg-[#D7FE51]/20 border border-[#D7FE51]/30" 
                : "bg-purple-100 border border-purple-200"
            }`}>
              <Tag className={isDarkMode ? "text-[#D7FE51]" : "text-purple-600"} size={24} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}>
                {editingTiket ? "Edit Kategori Tiket" : "Tambah Kategori Tiket"}
              </h3>
              <p className={`text-sm mt-1 ${
                isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
              }`}>
                Lengkapi form di bawah untuk {editingTiket ? "mengedit" : "menambahkan"} kategori tiket
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-[#1A1F16] hover:bg-[#363D30]"
                : "bg-purple-50 hover:bg-purple-100"
            }`}
            title="Tutup form"
          >
            <X size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-purple-700"} />
          </motion.button>
        </div>
      </div>

      {/* Toast validasi */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-6 text-sm font-medium ${
              isDarkMode
                ? "bg-red-900/80 text-red-200 border border-red-700"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grid untuk input utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Nama Kategori"
            name="nama_kategori"
            icon={<Tag size={18} />}
            value={form.nama_kategori}
            onChange={onChange}
            isDarkMode={isDarkMode}
            placeholder="Contoh: Reguler, VIP, Early Bird"
            required
          />

          <InputField
            label="Harga (Rp)"
            type="number"
            name="harga"
            icon={<DollarSign size={18} />}
            value={form.harga}
            onChange={onChange}
            isDarkMode={isDarkMode}
            placeholder="Contoh: 225000"
            min="0"
            step="1000"
            required
          />
        </div>

        <InputField
          label="Deskripsi Singkat"
          name="deskripsi"
          icon={<FileText size={18} />}
          value={form.deskripsi}
          onChange={onChange}
          isDarkMode={isDarkMode}
          placeholder="Contoh: Akses ke semua sesi kelas, materi lengkap, dan sertifikat"
          required
        />

        {/* Benefit Input Section - SAMA SEPERTI DI LAYANANKAMIADMIN.JSX */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-semibold flex items-center gap-2 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              <CheckCircle2 size={18} />
              Benefit yang Didapatkan
              <span className="text-red-500">*</span>
            </label>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleAddBenefit}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                isDarkMode 
                  ? "bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Plus size={14} className="inline mr-1" />
              Tambah Benefit
            </motion.button>
          </div>
          
          {benefits.length === 0 ? (
            <div className={`text-center py-4 rounded-lg ${
              isDarkMode ? "bg-[#1A1F16] border border-[#363D30]" : "bg-gray-50 border border-gray-200"
            }`}>
              <p className={`${isDarkMode ? "text-[#ABB89D]" : "text-gray-500"}`}>
                Belum ada benefit. Klik "Tambah Benefit" untuk menambahkan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className={`flex-1 px-4 py-3 rounded-lg border ${
                    isDarkMode 
                      ? "bg-[#1A1F16] border-[#363D30] text-white" 
                      : "bg-white border-gray-300 text-gray-700"
                  }`}>
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleEditBenefit(index, e.target.value)}
                      placeholder={`Benefit ${index + 1}`}
                      className={`w-full bg-transparent outline-none ${
                        isDarkMode ? "text-white" : "text-gray-700"
                      }`}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => handleRemoveBenefit(index)}
                    className={`p-2.5 rounded-lg ${
                      isDarkMode 
                        ? "bg-red-900/30 text-red-400 hover:bg-red-900/50" 
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                    title="Hapus benefit"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
          
          <p className={`text-xs ${
            isDarkMode ? "text-[#ABB89D]" : "text-gray-500"
          }`}>
            Benefit akan ditampilkan sebagai list bullet di halaman user
          </p>
        </div>

        <div className="space-y-4">
          <CheckboxField
            label="Tandai sebagai paket populer"
            name="is_populer"
            checked={form.is_populer}
            onChange={onChange}
            isDarkMode={isDarkMode}
            icon={<Star size={16} className="text-yellow-500" />}
          />
          <p className={`text-xs ${
            isDarkMode ? "text-[#ABB89D]" : "text-gray-500"
          }`}>
            Paket populer akan ditampilkan dengan badge khusus dan ditekankan kepada pengguna
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-[#363D30]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleClose}
            className={`flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 ${
              isDarkMode
                ? "bg-[#1A1F16] hover:bg-[#363D30] text-[#ABB89D] border border-[#363D30]"
                : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
            }`}
          >
            Batal
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
              isSubmitting
                ? isDarkMode
                  ? "bg-[#D7FE51]/80 text-[#1A1F16]"
                  : "bg-purple-600 text-white"
                : isDarkMode
                ? "bg-gradient-to-r from-[#D7FE51] to-[#9ECB45] hover:from-[#C4E840] hover:to-[#8AB83D] text-[#1A1F16]"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className={`w-5 h-5 border-2 rounded-full ${
                      isDarkMode ? "border-[#1A1F16] border-t-transparent" : "border-white border-t-transparent"
                    }`}
                  />
                  Menyimpan...
                </>
              ) : (
                <>
                  {editingTiket ? (
                    <>
                      <CheckCircle size={20} />
                      Update Kategori
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Tambah Kategori
                    </>
                  )}
                </>
              )}
            </span>
            {!isSubmitting && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
});

// =========== KOMPONEN UTAMA DETAIL KELAS ===========
export default function DetailKelas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useAppTheme();

  const [kelas, setKelas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showGambaranModal, setShowGambaranModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageAlt, setModalImageAlt] = useState("");

  // State untuk tiket kategori
  const [tiketKategori, setTiketKategori] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTiket, setEditingTiket] = useState(null);
  const [formData, setFormData] = useState({
    nama_kategori: "",
    deskripsi: "",
    harga: "",
    manfaat: "",
    is_populer: false,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          gradient.addColorStop(0, 'rgba(215, 254, 81, 0.8)'); // #D7FE51
          gradient.addColorStop(0.5, 'rgba(215, 254, 81, 0.3)');
          gradient.addColorStop(1, 'rgba(215, 254, 81, 0)');
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

  // Fetch detail kelas dan tiket kategori
  const fetchKelas = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8000/kelas/${id}`, {
        headers: { 
          "Cache-Control": "no-cache",
          "Accept": "application/json"
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Kelas tidak ditemukan");
      }

      const data = await res.json();
      
      // Tambahkan URL foto
      if (data.foto) {
        data.foto_url = `http://localhost:8000/uploads/${data.foto}?t=${Date.now()}`;
      }
      
      // Tambahkan URL untuk gambaran event
      if (data.gambaran_event_urls && Array.isArray(data.gambaran_event_urls)) {
        data.gambaran_event_urls = data.gambaran_event_urls.map(url => 
          `${url}?t=${Date.now()}`
        );
      } else if (data.gambaran_event) {
        try {
          const gambaranEvent = JSON.parse(data.gambaran_event);
          if (Array.isArray(gambaranEvent)) {
            data.gambaran_event_urls = gambaranEvent.map(filename => 
              `http://localhost:8000/uploads/${filename}?t=${Date.now()}`
            );
          }
        } catch (error) {
          data.gambaran_event_urls = [];
        }
      } else {
        data.gambaran_event_urls = [];
      }
      
      // Pastikan tiket_kategori ada dan format konsisten
      if (!data.tiket_kategori || !Array.isArray(data.tiket_kategori)) {
        data.tiket_kategori = [];
      }
      
      // Konversi data tiket kategori
      const formattedTiketKategori = data.tiket_kategori.map(tiket => ({
        ...tiket,
        harga: typeof tiket.harga === 'number' ? tiket.harga : parseFloat(tiket.harga || 0),
        is_populer: Boolean(tiket.is_populer),
        is_active: tiket.is_active === undefined ? true : Boolean(tiket.is_active)
      }));
      
      setKelas(data);
      setTiketKategori(formattedTiketKategori);
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching kelas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tiket kategori terpisah
  const fetchTiketKategori = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8000/kelas/${id}/tiket-kategori`, {
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Format data tiket kategori
        const formattedData = data.map(tiket => ({
          ...tiket,
          harga: typeof tiket.harga === 'number' ? tiket.harga : parseFloat(tiket.harga || 0),
          is_populer: Boolean(tiket.is_populer),
          is_active: tiket.is_active === undefined ? true : Boolean(tiket.is_active)
        }));
        setTiketKategori(formattedData);
      }
    } catch (error) {
      console.error("Error fetching tiket kategori:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchKelas();
  }, [id]);

  // Delete kelas
  const handleDeleteKelas = async () => {
    const result = await Swal.fire({
      title: "Hapus Kelas",
      text: `Apakah Anda yakin ingin menghapus kelas "${kelas.nama_kelas}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: isDarkMode ? '#1A1F16' : '#ffffff',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/kelas/${kelas.id}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Accept": "application/json"
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Gagal menghapus kelas");
      }

      Swal.fire({
        title: "Berhasil!",
        text: "Kelas berhasil dihapus.",
        icon: "success",
        background: isDarkMode ? '#1A1F16' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      }).then(() => {
        navigate("/admin/events", { state: { refresh: true } });
      });
    } catch (err) {
      Swal.fire({
        title: "Gagal!",
        text: err.message,
        icon: "error",
        background: isDarkMode ? '#1A1F16' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
    }
  };

  // =========== FUNGSI UNTUK TIKET KATEGORI ===========
  const handleChangeForm = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errorMsg) {
      setErrorMsg("");
    }
  }, [errorMsg]);

  const handleSubmitTiket = useCallback(async (submitData) => {
    let event;
    let formDataToSubmit;
    
    if (submitData.error) {
      setErrorMsg(submitData.error);
      return;
    }
    
    if (submitData.data) {
      formDataToSubmit = submitData.data;
      event = submitData.event;
    } else {
      event = submitData;
      event.preventDefault();
      event.stopPropagation();
      formDataToSubmit = { ...formData };
    }
    
    setErrorMsg("");
    setIsSubmitting(true);
    
    // Validasi
    const missing = [];
    if (!formDataToSubmit.nama_kategori?.trim()) missing.push("Nama Kategori");
    if (!formDataToSubmit.deskripsi?.trim()) missing.push("Deskripsi");
    if (!formDataToSubmit.harga || isNaN(formDataToSubmit.harga)) missing.push("Harga");
    if (!formDataToSubmit.manfaat?.trim()) missing.push("Manfaat");
    
    if (missing.length > 0) {
      setErrorMsg(`Harap lengkapi: ${missing.join(", ")}`);
      setIsSubmitting(false);
      return;
    }

    if (parseFloat(formDataToSubmit.harga) < 0) {
      setErrorMsg("Harga harus berupa angka positif");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      const data = new URLSearchParams();
      data.append('nama_kategori', formDataToSubmit.nama_kategori);
      data.append('deskripsi', formDataToSubmit.deskripsi);
      data.append('harga', parseFloat(formDataToSubmit.harga));
      data.append('manfaat', formDataToSubmit.manfaat);
      data.append('is_populer', formDataToSubmit.is_populer);

      let url, method;
      
      if (editingTiket) {
        url = `http://localhost:8000/kelas/tiket-kategori/${editingTiket.id}`;
        method = "PUT";
      } else {
        url = `http://localhost:8000/kelas/${id}/tiket-kategori`;
        method = "POST";
        data.append('kelas_id', id);
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          "Accept": "application/json"
        },
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Gagal menyimpan data");
      }

      const responseData = await res.json();
      
      Swal.fire({
        title: "Berhasil!",
        text: editingTiket 
          ? "Kategori tiket berhasil diperbarui" 
          : "Kategori tiket berhasil ditambahkan",
        icon: "success",
        background: isDarkMode ? "#1A1F16" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });

      resetForm();
      await fetchTiketKategori();
      
    } catch (error) {
      console.error("Error saving tiket:", error);
      setErrorMsg(error.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  }, [id, editingTiket, isDarkMode, fetchTiketKategori, formData]);

  // FUNGSI BARU: Toggle Active/Nonaktif Status
  const handleToggleActiveTiket = useCallback(async (tiketId) => {
    const tiket = tiketKategori.find(t => t.id === tiketId);
    if (!tiket) return;

    const currentStatus = tiket.is_active;
    const actionText = currentStatus ? "nonaktifkan" : "aktifkan";
    
    const result = await Swal.fire({
      title: `${currentStatus ? "Nonaktifkan" : "Aktifkan"} Kategori Tiket`,
      text: `Apakah Anda yakin ingin ${actionText} kategori tiket "${tiket.nama_kategori}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Ya, ${actionText}`,
      cancelButtonText: "Batal",
      background: isDarkMode ? "#1A1F16" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#1f2937",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/kelas/tiket-kategori/${tiketId}/toggle-active`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Accept": "application/json"
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Gagal mengubah status tiket");
      }

      const responseData = await res.json();
      
      Swal.fire({
        title: "Berhasil!",
        text: responseData.message,
        icon: "success",
        background: isDarkMode ? "#1A1F16" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });

      // Update tiket dalam state
      setTiketKategori(prev => 
        prev.map(t => 
          t.id === tiketId 
            ? { ...t, is_active: !currentStatus }
            : t
        )
      );
      
    } catch (error) {
      console.error("Error toggling tiket active status:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Gagal mengubah status tiket",
        icon: "error",
        background: isDarkMode ? "#1A1F16" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    }
  }, [tiketKategori, isDarkMode]);

  const handleEditTiket = useCallback((tiket) => {
    setEditingTiket(tiket);
    setFormData({
      nama_kategori: tiket.nama_kategori || "",
      deskripsi: tiket.deskripsi || "",
      harga: tiket.harga || "",
      manfaat: tiket.manfaat || "",
      is_populer: tiket.is_populer === true || tiket.is_populer === 1 || tiket.is_populer === 'true',
    });
    setShowForm(true);
    setErrorMsg("");
  }, []);

  const handleDeleteTiket = useCallback(async (tiketId) => {
    const result = await Swal.fire({
      title: "Hapus Kategori Tiket",
      text: "Apakah Anda yakin ingin menghapus kategori tiket ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: isDarkMode ? "#1A1F16" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#1f2937",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/kelas/tiket-kategori/${tiketId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Accept": "application/json"
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Gagal menghapus tiket kategori");
      }

      Swal.fire({
        title: "Berhasil!",
        text: "Kategori tiket berhasil dihapus",
        icon: "success",
        background: isDarkMode ? "#1A1F16" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });

      setTiketKategori(prev => prev.filter(tiket => tiket.id !== tiketId));
      
    } catch (error) {
      console.error("Error deleting tiket:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Gagal menghapus kategori tiket",
        icon: "error",
        background: isDarkMode ? "#1A1F16" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    }
  }, [isDarkMode]);

  const resetForm = useCallback(() => {
    setFormData({
      nama_kategori: "",
      deskripsi: "",
      harga: "",
      manfaat: "",
      is_populer: false,
    });
    setEditingTiket(null);
    setShowForm(false);
    setErrorMsg("");
  }, []);

  // Format harga ke Rupiah dengan penanganan error
  const formatRupiah = useCallback((angka) => {
    if (angka === undefined || angka === null || isNaN(angka) || angka === "") {
      return "Rp 0";
    }
    const num = typeof angka === 'string' ? parseFloat(angka) : angka;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }, []);

  // Function untuk membuka modal gambar utama
  const openImageModal = useCallback((imageUrl, altText) => {
    setModalImageUrl(imageUrl);
    setModalImageAlt(altText);
    setShowImageModal(true);
  }, []);

  // Function untuk membuka modal gambaran event
  const openGambaranModal = useCallback((index) => {
    if (kelas.gambaran_event_urls && kelas.gambaran_event_urls.length > 0) {
      setSelectedImageIndex(index);
      setShowGambaranModal(true);
    }
  }, [kelas]);

  // Function untuk menutup modal gambar
  const closeImageModal = useCallback(() => {
    setShowImageModal(false);
    setShowGambaranModal(false);
  }, []);

  // Function untuk navigasi gambar di modal
  const nextImage = useCallback(() => {
    if (kelas.gambaran_event_urls && kelas.gambaran_event_urls.length > 0) {
      setSelectedImageIndex(prev => 
        (prev + 1) % kelas.gambaran_event_urls.length
      );
    }
  }, [kelas]);

  const prevImage = useCallback(() => {
    if (kelas.gambaran_event_urls && kelas.gambaran_event_urls.length > 0) {
      setSelectedImageIndex(prev => 
        prev === 0 ? kelas.gambaran_event_urls.length - 1 : prev - 1
      );
    }
  }, [kelas]);

  // =========== KOMPONEN TIKET KATEGORI CARD DENGAN TOMBOL NONAKTIFKAN ===========
  const TiketKategoriCard = useCallback(({ tiket, index }) => (
    <motion.div
      key={tiket.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-2xl p-6 transition-all duration-300 border-2 h-full ${
        !tiket.is_active
          ? isDarkMode
            ? "border-red-700/50 bg-gradient-to-br from-red-900/20 to-[#1A1F16]/30 opacity-70"
            : "border-red-300 bg-gradient-to-br from-red-50/50 to-white/50 opacity-70"
          : tiket.is_populer
          ? isDarkMode
            ? "border-[#D7FE51] bg-gradient-to-br from-[#D7FE51]/10 to-[#1A1F16]/50"
            : "border-purple-400 bg-gradient-to-br from-purple-50 to-white"
          : isDarkMode
          ? "border-[#363D30] bg-[#1A1F16]/30"
          : "border-gray-200 bg-white"
      } hover:shadow-lg hover:scale-[1.02] flex flex-col`}
    >
      {/* Badge Status */}
      {!tiket.is_active && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full shadow-lg ${
            isDarkMode
              ? "bg-red-700 text-red-100"
              : "bg-red-600 text-white"
          }`}>
            <PowerOff size={12} />
            <span className="text-xs font-bold">NONAKTIF</span>
          </div>
        </div>
      )}
      
      {/* Badge Populer */}
      {tiket.is_populer && tiket.is_active && (
        <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 ${
          !tiket.is_active ? "opacity-50" : ""
        }`}>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full shadow-lg ${
            isDarkMode
              ? "bg-gradient-to-r from-[#D7FE51] to-[#9ECB45] text-[#1A1F16]"
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          }`}>
            <Star size={12} />
            <span className="text-xs font-bold">POPULER</span>
          </div>
        </div>
      )}
      
      {/* Header dengan nama kategori */}
      <div className="mb-4 flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <Tag size={18} className={
            isDarkMode ? "text-[#D7FE51]" : "text-purple-600"
          } />
          <h4 className={`text-lg font-bold ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}>
            {tiket.nama_kategori}
          </h4>
        </div>
        
        {/* Deskripsi singkat */}
        <div className={`text-sm mb-3 ${
          isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
        }`}>
          {tiket.deskripsi}
        </div>
        
        {/* Garis pemisah */}
        <div className={`h-px mb-4 ${
          isDarkMode ? "bg-[#363D30]" : "bg-gray-200"
        }`} />
      </div>
      
      {/* Harga */}
      <div className="mb-6">
        <div className={`text-2xl font-bold mb-2 ${
          !tiket.is_active 
            ? isDarkMode ? "text-red-400" : "text-red-500"
            : isDarkMode ? "text-[#D7FE51]" : "text-emerald-600"
        }`}>
          {formatRupiah(tiket.harga)}
        </div>
      </div>
      
      {/* Benefits */}
      <div className="flex-grow">
        <h5 className={`text-sm font-semibold mb-3 ${
          isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
        }`}>
          Benefit yang didapatkan:
        </h5>
        <ul className="space-y-2">
          {tiket.manfaat && typeof tiket.manfaat === 'string' && tiket.manfaat.trim() !== '' ? (
            tiket.manfaat.split(',').map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={16} className={`mt-0.5 flex-shrink-0 ${
                  !tiket.is_active 
                    ? isDarkMode ? "text-red-400" : "text-red-400"
                    : isDarkMode ? "text-[#D7FE51]" : "text-green-500"
                }`} />
                <span className={`text-sm ${
                  isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                }`}>
                  {benefit.trim()}
                </span>
              </li>
            ))
          ) : (
            <li className="text-[#ABB89D] text-sm italic">Tidak ada benefit yang ditentukan</li>
          )}
        </ul>
      </div>
      
      {/* Tombol Aksi untuk Admin - DITAMBAHKAN TOMBOL NONAKTIFKAN/AKTIFKAN */}
      <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-700/20 dark:border-[#363D30]">
        {/* Tombol Edit & Delete */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleEditTiket(tiket)}
            disabled={!tiket.is_active}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              !tiket.is_active
                ? isDarkMode
                  ? "bg-[#1A1F16] text-[#363D30] cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "bg-[#1A1F16] hover:bg-[#363D30] text-[#D7FE51]"
                : "bg-gray-100 hover:bg-gray-200 text-blue-600"
            }`}
            title={!tiket.is_active ? "Tidak dapat edit tiket nonaktif" : "Edit tiket"}
          >
            <Edit3 size={14} className="inline mr-1" />
            Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDeleteTiket(tiket.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              isDarkMode
                ? "bg-[#1A1F16] hover:bg-[#363D30] text-red-400"
                : "bg-gray-100 hover:bg-gray-200 text-red-600"
            }`}
          >
            <Trash2 size={14} className="inline mr-1" />
            Hapus
          </motion.button>
        </div>
        
        {/* Tombol Nonaktifkan/Aktifkan - DIBAWAH TOMBOL POPULER */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleToggleActiveTiket(tiket.id)}
          className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
            tiket.is_active
              ? isDarkMode
                ? "bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700/50"
                : "bg-red-100 hover:bg-red-200 text-red-600 border border-red-300"
              : isDarkMode
              ? "bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-700/50"
              : "bg-green-100 hover:bg-green-200 text-green-600 border border-green-300"
          }`}
        >
          {tiket.is_active ? (
            <>
              <PowerOff size={14} />
              Nonaktifkan
            </>
          ) : (
            <>
              <Power size={14} />
              Aktifkan
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  ), [isDarkMode, handleEditTiket, handleDeleteTiket, handleToggleActiveTiket, formatRupiah]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 relative ${
        isDarkMode ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" : "bg-gray-50"
      }`}>
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? 'border-[#D7FE51]' : 'border-blue-600'
          }`}></div>
          <p className={`text-lg ${
            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
          }`}>
            Memuat data kelas...
          </p>
        </div>
      </div>
    );
  }

  if (error || !kelas) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 relative p-4 ${
        isDarkMode ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" : "bg-gray-50"
      }`}>
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        <div className="text-center p-4 sm:p-8 rounded-xl max-w-md relative z-10">
          <div className={`p-4 rounded-full mx-auto mb-4 ${
            isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
          }`}>
            <Users size={48} className={`mx-auto ${
              isDarkMode ? 'text-red-400' : 'text-red-500'
            }`} />
          </div>
          <p className={`text-lg font-medium mb-4 ${
            isDarkMode ? "text-red-400" : "text-red-600"
          }`}>
            {error || "Kelas tidak ditemukan"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin/events")}
            className={`flex items-center justify-center gap-2 text-white px-4 sm:px-6 py-3 rounded-lg ${
              isDarkMode 
                ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Daftar Kelas</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" 
        : "bg-gray-50"
    } p-4 sm:p-6 relative`}>
      {/* Canvas untuk particles di dark mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header - Diposisikan di tengah */}
        <div className="flex items-center justify-center mb-8 relative px-4 sm:px-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin/events")}
            className={`absolute left-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg ${
              isDarkMode 
                ? "bg-[#1A1F16] hover:bg-[#363D30] text-white border border-[#363D30]" 
                : "bg-white hover:bg-gray-100 text-gray-700 border"
            }`}
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Kembali</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-blue-100'
            }`}>
              <Users size={24} className={
                isDarkMode ? "text-[#D7FE51]" : "text-blue-600"
              } />
            </div>
            <h1 className={`text-xl sm:text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              Detail Events
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
          {/* SECTION 1: INFORMASI KELAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Product Image and Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Kelas Image */}
              <div className={`rounded-xl p-4 sm:p-6 ${
                isDarkMode 
                  ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50" 
                  : "bg-white shadow-sm"
              }`}>
                {kelas.foto_url ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer relative group"
                    onClick={() => openImageModal(kelas.foto_url, kelas.nama_kelas)}
                  >
                    <img
                      src={kelas.foto_url}
                      alt={kelas.nama_kelas}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg transition-all duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-image.png";
                        e.target.classList.add("bg-gray-200", "dark:bg-gray-800");
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all duration-300">
                      <Eye 
                        size={24} sm:size={32}
                        className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" 
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      Klik untuk melihat foto
                    </div>
                  </motion.div>
                ) : (
                  <div className={`text-center p-6 sm:p-8 rounded-lg border-2 border-dashed ${
                    isDarkMode ? 'border-[#363D30] text-[#ABB89D]' : 'border-gray-300 text-gray-500'
                  }`}>
                    <Users size={40} sm:size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="italic">Tidak ada foto</p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/admin/edit-events/${kelas.id}`, { state: { kelas } })}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                      isDarkMode 
                        ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                        : "bg-yellow-500 hover:bg-yellow-600 text-white"
                    }`}
                  >
                    <Edit3 size={18} />
                    <span className="text-sm sm:text-base">Edit Kelas</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteKelas}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                      isDarkMode 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    <Trash2 size={18} />
                    <span className="text-sm sm:text-base">Hapus</span>
                  </motion.button>
                </div>
              </div>

              {/* Kelas Details Card */}
              <div className={`rounded-xl p-4 sm:p-6 ${
                isDarkMode 
                  ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50" 
                  : "bg-white shadow-sm"
              }`}>
                <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  <Info size={20} className={isDarkMode ? "text-[#D7FE51]" : "text-blue-600"} />
                  <span className="text-sm sm:text-base">Informasi Event</span>
                </h3>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className={`text-sm font-medium mb-2 block ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}>Nama Event</label>
                    <p className={`font-semibold text-base sm:text-lg ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}>{kelas.nama_kelas || "-"}</p>
                  </div>

                  <div>
                    <label className={`text-sm font-medium mb-2 block ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}>Kategori</label>
                    <p className={`font-semibold text-sm sm:text-base ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}>{kelas.kategori || "-"}</p>
                  </div>

                  <div>
                    <label className={`text-sm font-medium mb-2 block ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}>Harga Tiket</label>
                    <p className={`font-semibold text-base sm:text-lg ${
                      isDarkMode ? "text-[#D7FE51]" : "text-emerald-600"
                    }`}>{formatRupiah(kelas.biaya)}</p>
                  </div>

                  {/* ===== TAMBAHKAN TOTAL PESERTA DI SINI ===== */}
                  <div>
                    <label className={`text-sm font-medium mb-2 block ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}>Total Peserta</label>
                    <div className="flex items-center gap-2">
                      <Users size={18} className={
                        isDarkMode ? "text-[#D7FE51]" : "text-blue-600"
                      } />
                      <p className={`font-semibold text-sm sm:text-base ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}>
                        {kelas.total_peserta !== undefined && kelas.total_peserta !== null 
                          ? kelas.total_peserta 
                          : "0"} orang
                      </p>
                    </div>
                  </div>
                  {/* ===== END TAMBAHKAN TOTAL PESERTA ===== */}
                </div>
              </div>
            </div>

            {/* Right Column - Detail Lengkap dengan Layout yang Diperbaiki */}
            <div className="lg:col-span-2">
              <div className={`rounded-xl p-4 sm:p-6 ${
                isDarkMode 
                  ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50" 
                  : "bg-white shadow-sm"
              } h-full`}>
                <h3 className={`text-lg font-semibold mb-6 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  Informasi Events
                </h3>

                <div className="space-y-6 sm:space-y-8">
                  {/* Bagian Atas: Jadwal dan Ruangan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Jadwal Kelas */}
                    {kelas.jadwal && (
                      <div className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-orange-100'
                          }`}>
                            <Clock size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-orange-600"} />
                          </div>
                          <div>
                            <label className={`text-sm font-medium ${
                              isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                            }`}>Waktu</label>
                            <p className={`font-medium mt-1 ${
                              isDarkMode ? "text-[#D7FE51]" : "text-orange-800"
                            }`}>{kelas.jadwal}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ruangan Kelas */}
                    {kelas.ruangan && (
                      <div className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-purple-100'
                          }`}>
                            <MapPin size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-purple-600"} />
                          </div>
                          <div>
                            <label className={`text-sm font-medium ${
                              isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                            }`}>Lokasi</label>
                            <p className={`font-medium mt-1 ${
                              isDarkMode ? "text-[#D7FE51]" : "text-purple-800"
                            }`}>{kelas.ruangan}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bagian Tengah: Deskripsi */}
                  {kelas.deskripsi && (
                    <div className={`p-4 sm:p-5 rounded-lg ${
                      isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border'
                    }`}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${
                          isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-blue-100'
                        }`}>
                          <FileText size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-blue-600"} />
                        </div>
                        <div className="flex-1">
                          <label className={`text-sm font-medium block mb-3 ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                          }`}>Deskripsi</label>
                          <div className={`mt-3 p-4 rounded-lg ${
                            isDarkMode ? 'bg-[#0A0E0B] border border-[#363D30]' : 'bg-white border'
                          }`}>
                            <p className={`leading-relaxed ${
                              isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                            }`}>{kelas.deskripsi}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BAGIAN TENGAH: GAMBARAN EVENT - MENGANTI QR CODE */}
                  {kelas.gambaran_event_urls && kelas.gambaran_event_urls.length > 0 && (
                    <div className={`p-4 sm:p-5 rounded-lg ${
                      isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border'
                    }`}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${
                          isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-purple-100'
                        }`}>
                          <Images size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-purple-600"} />
                        </div>
                        <div className="flex-1">
                          <label className={`text-sm font-medium block mb-3 ${
                            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                          }`}>
                            Gambaran Event
                          </label>
                          
                          <div className="mb-4">
                            <p className={`text-sm ${
                              isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                            }`}>
                              Lihat foto-foto seputar gambaran event <strong>{kelas.nama_kelas}</strong>.
                            </p>
                            <p className={`text-xs mt-2 ${
                              isDarkMode ? "text-[#646B5E]" : "text-gray-500"
                            }`}>
                              Klik foto untuk melihat foto
                            </p>
                          </div>
                          
                          {/* Container untuk foto-foto gambaran event - Horizontal Scroll */}
                          <div className="relative">
                            <div className="flex space-x-2 sm:space-x-4 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#363D30] scrollbar-track-transparent">
                              {kelas.gambaran_event_urls.map((url, index) => (
                                <motion.div
                                  key={index}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex-shrink-0 cursor-pointer group relative"
                                  onClick={() => openGambaranModal(index)}
                                >
                                  <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-[#363D30]">
                                    <img
                                      src={url}
                                      alt={`Gambaran event ${index + 1}`}
                                      className="w-32 h-32 sm:w-48 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/default-image.png";
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Eye size={20} sm:size={24} className="text-white" />
                                  </div>
                                  <div className="mt-2 text-center">
                                    <p className={`text-xs font-medium ${
                                      isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                                    }`}>
                                      Foto {index + 1}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                          
                          <div className={`mt-4 pt-4 border-t ${
                            isDarkMode ? 'border-[#363D30]' : 'border-gray-200'
                          }`}>
                            <p className={`text-xs ${
                              isDarkMode ? 'text-[#ABB89D]' : 'text-gray-500'
                            }`}>
                              Total {kelas.gambaran_event_urls.length} foto • Geser untuk melihat lebih banyak
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bagian Bawah: Informasi Tanggal */}
                  <div className={`p-4 sm:p-5 rounded-lg ${
                    isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-[#0A0E0B] border border-[#363D30]' : 'bg-white border'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-blue-100'
                          }`}>
                            <Calendar size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-blue-600"} />
                          </div>
                          <div className="flex-1">
                            <label className={`text-sm font-medium ${
                              isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                            }`}>Tanggal Dibuat</label>
                            <p className={`font-medium mt-1 ${
                              isDarkMode ? "text-white" : "text-gray-800"
                            }`}>
                              {kelas.created_at ? new Date(kelas.created_at).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-[#0A0E0B] border border-[#363D30]' : 'bg-white border'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-green-100'
                          }`}>
                            <RefreshCw size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-green-600"} />
                          </div>
                          <div className="flex-1">
                            <label className={`text-sm font-medium ${
                              isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                            }`}>Terakhir Diupdate</label>
                            <p className={`font-medium mt-1 ${
                              isDarkMode ? "text-white" : "text-gray-800"
                            }`}>
                              {kelas.updated_at ? new Date(kelas.updated_at).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`mt-4 pt-4 border-t ${
                      isDarkMode ? 'border-[#363D30]' : 'border-gray-200'
                    }`}>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-[#ABB89D]' : 'text-gray-500'
                      }`}>
                        Data ini menunjukkan riwayat event sejak dibuat dan terakhir diperbarui.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: KATEGORI TIKET - FULL WIDTH */}
          <div className={`rounded-xl p-4 sm:p-6 md:p-8 ${
            isDarkMode 
              ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50" 
              : "bg-white shadow-sm"
          }`}>
            <div className="space-y-6 sm:space-y-8">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? "bg-[#D7FE51]/20" : "bg-purple-100"
                  }`}>
                    <Ticket size={28} className={
                      isDarkMode ? "text-[#D7FE51]" : "text-purple-600"
                    } />
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                    KATEGORI TIKET
                  </h2>
                </div>
                <p className={`text-base sm:text-lg ${
                  isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                }`}>
                  Kelola Kategori Tiket yang Tersedia
                </p>
              </div>
              
              {/* Statistik Tiket */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                    Total: <span className="font-bold">{tiketKategori.length}</span> kategori
                  </div>
                  <div className={`text-sm ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                    Aktif: <span className="font-bold">{tiketKategori.filter(t => t.is_active).length}</span>
                  </div>
                  <div className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                    Nonaktif: <span className="font-bold">{tiketKategori.filter(t => !t.is_active).length}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    resetForm();
                    setShowForm(!showForm);
                  }}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${
                    isDarkMode
                      ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                  }`}
                >
                  <Plus size={18} />
                  <span>{showForm ? "Tutup Form" : "Tambah Kategori"}</span>
                </motion.button>
              </div>

              {/* Form Tambah/Edit Tiket Kategori */}
              <AnimatePresence>
                {showForm && (
                  <TiketKategoriForm
                    editingTiket={editingTiket}
                    isDarkMode={isDarkMode}
                    form={formData}
                    errorMsg={errorMsg}
                    isSubmitting={isSubmitting}
                    onClose={resetForm}
                    onSubmit={handleSubmitTiket}
                    onChange={handleChangeForm}
                  />
                )}
              </AnimatePresence>

              {/* List Tiket Kategori */}
              {tiketKategori.length === 0 ? (
                <div className={`text-center py-12 sm:py-16 rounded-xl ${
                  isDarkMode ? "bg-[#1A1F16]/50" : "bg-gray-50"
                }`}>
                  <Ticket size={64} className={`mx-auto mb-6 ${
                    isDarkMode ? "text-[#363D30]" : "text-gray-400"
                  }`} />
                  <h4 className={`text-xl font-semibold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                    Belum Ada Kategori Tiket
                  </h4>
                  <p className={`mb-6 max-w-md mx-auto ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                    Tambahkan kategori tiket untuk memberikan pilihan kepada peserta yang ingin mendaftar kelas ini.
                  </p>
                  {!showForm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowForm(true)}
                      className={`px-6 sm:px-8 py-3 rounded-xl font-semibold ${
                        isDarkMode
                          ? "bg-gradient-to-r from-[#D7FE51] to-[#9ECB45] hover:from-[#C4E840] hover:to-[#8AB83D] text-[#1A1F16]"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      }`}
                    >
                      <Plus size={20} className="inline mr-2" />
                      Tambah Kategori Tiket Pertama
                    </motion.button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {tiketKategori.map((tiket, index) => (
                    <TiketKategoriCard key={tiket.id} tiket={tiket} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal untuk menampilkan foto utama secara full */}
      <AnimatePresence>
        {showImageModal && modalImageUrl && (
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
              
              {/* Gambar */}
              <img
                src={modalImageUrl}
                alt={modalImageAlt}
                className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-image.png";
                }}
              />
              
              {/* Caption */}
              <div className="text-center mt-3 sm:mt-4">
                <p className="text-white text-lg font-medium">{modalImageAlt}</p>
                <p className="text-gray-400 text-sm">
                  Foto Event • Klik di luar gambar untuk menutup
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal untuk menampilkan gambaran event secara full */}
      <AnimatePresence>
        {showGambaranModal && kelas.gambaran_event_urls && kelas.gambaran_event_urls.length > 0 && (
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
              className="relative max-w-6xl max-h-full"
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
              
              {/* Tombol navigasi */}
              {kelas.gambaran_event_urls.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full"
                  >
                    <ChevronLeft size={20} sm:size={28} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full"
                  >
                    <ChevronRight size={20} sm:size={28} />
                  </motion.button>
                </>
              )}
              
              {/* Gambar */}
              <img
                src={kelas.gambaran_event_urls[selectedImageIndex]}
                alt={`Gambaran event ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-image.png";
                }}
              />
              
              {/* Caption dan navigasi dots */}
              <div className="text-center mt-4 sm:mt-6">
                <p className="text-white text-sm sm:text-lg font-medium">
                  Gambaran Event {selectedImageIndex + 1} dari {kelas.gambaran_event_urls.length}
                </p>
                
                {/* Dots untuk navigasi */}
                {kelas.gambaran_event_urls.length > 1 && (
                  <div className="flex justify-center gap-2 mt-2 sm:mt-4">
                    {kelas.gambaran_event_urls.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === selectedImageIndex
                            ? 'bg-white w-4 sm:w-6'
                            : 'bg-gray-500 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                <p className="text-gray-400 text-xs sm:text-sm mt-3 sm:mt-4">
                  Klik di luar gambar untuk menutup • Gunakan tombol panah untuk navigasi
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
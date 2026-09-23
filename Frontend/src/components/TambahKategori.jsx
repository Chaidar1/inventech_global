import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus, Image, FileText, Clock, MapPin, DollarSign, Users, ChevronDown, Upload, CheckCircle2, AlertTriangle, Plus, Images, Trash2 } from "lucide-react";
import { useAppTheme } from "../hooks/useTheme";

export default function TambahKategori() {
  const navigate = useNavigate();
  const { isDarkMode } = useAppTheme();

  const [form, setForm] = useState({
    nama_kategori: "",
    nama_kelas: "",
    deskripsi: "",
    jadwal: "",
    ruangan: "",
    biaya: "",
  });

  const [foto, setFoto] = useState(null);
  const [gambaranEvent, setGambaranEvent] = useState([]); // Mengganti fotoQr dengan gambaranEvent
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDraggingFoto, setIsDraggingFoto] = useState(false);
  const [isDraggingGambaran, setIsDraggingGambaran] = useState(false); // Mengganti isDraggingQr
  const [isCreatingTiket, setIsCreatingTiket] = useState(false);
  const [createdKelasId, setCreatedKelasId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  const fileInputRef = useRef(null);
  const gambaranInputRef = useRef(null); // Mengganti qrInputRef

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setForm((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Hapus error saat user mulai mengetik
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (errorMsg) setErrorMsg("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Ukuran file terlalu besar! Maksimal 5MB");
        return;
      }
      setFoto(file);
      setErrorMsg("");
    }
  };

  // Mengganti handleQrChange dengan handleGambaranChange
  const handleGambaranChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024);
    
    const newFiles = validFiles.slice(0, 5 - gambaranEvent.length);
    
    if (newFiles.length > 0) {
      setGambaranEvent(prev => [...prev, ...newFiles]);
      setErrorMsg("");
    }
    
    if (files.length > validFiles.length) {
      setErrorMsg("Beberapa file terlalu besar atau bukan gambar. Maksimal 5MB per file");
    }
    
    e.target.value = null;
  };

  // Fungsi untuk menghapus gambar dari gambaranEvent
  const handleRemoveGambaran = (index) => {
    setGambaranEvent(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    if (type === 'foto') setIsDraggingFoto(true);
    if (type === 'gambaran') setIsDraggingGambaran(true); // Mengganti 'qr' dengan 'gambaran'
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    if (type === 'foto') setIsDraggingFoto(false);
    if (type === 'gambaran') setIsDraggingGambaran(false); // Mengganti 'qr' dengan 'gambaran'
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024);
    
    if (imageFiles.length > 0) {
      if (type === 'foto') {
        setIsDraggingFoto(false);
        setFoto(imageFiles[0]);
        setErrorMsg("");
      }
      if (type === 'gambaran') { // Mengganti 'qr' dengan 'gambaran'
        setIsDraggingGambaran(false);
        const newFiles = imageFiles.slice(0, 5 - gambaranEvent.length);
        if (newFiles.length > 0) {
          setGambaranEvent(prev => [...prev, ...newFiles]);
          setErrorMsg("");
        }
      }
    }
    
    if (files.length > imageFiles.length) {
      setErrorMsg("Beberapa file terlalu besar atau bukan gambar. Maksimal 5MB per file");
    }
  };

  const createTiketKategori = async (kelasId, tiketData) => {
    try {
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      Object.entries(tiketData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await axios.post(
        `http://localhost:8000/kelas/${kelasId}/tiket-kategori`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log(`Tiket kategori "${tiketData.nama_kategori}" berhasil dibuat`);
      return response.data;
      
    } catch (error) {
      console.error(`Error creating tiket kategori "${tiketData.nama_kategori}":`, error);
      throw error;
    }
  };

  const createAllTiketKategori = async (kelasId) => {
    try {
      setIsCreatingTiket(true);
      
      const tiketList = [
        {
          nama_kategori: "Reguler",
          deskripsi: "Paket standar untuk peserta",
          harga: parseFloat(form.biaya),
          manfaat: "Akses kelas lengkap, Materi pembelajaran, Sertifikat elektronik, Akses grup WhatsApp",
          is_populer: true
        },
        {
          nama_kategori: "Premium",
          deskripsi: "Paket lengkap dengan benefit eksklusif",
          harga: parseFloat(form.biaya) * 1.5,
          manfaat: "Akses kelas lengkap, Materi pembelajaran premium, Sertifikat fisik, Konsultasi private, Akses grup eksklusif, Merchandise eksklusif",
          is_populer: false
        },
        {
          nama_kategori: "Early Bird",
          deskripsi: "Paket spesial untuk pendaftar awal",
          harga: parseFloat(form.biaya) * 0.8,
          manfaat: "Akses kelas lengkap, Materi pembelajaran, Sertifikat elektronik, Bonus e-book materi",
          is_populer: false
        }
      ];

      const results = [];
      for (const tiket of tiketList) {
        try {
          const result = await createTiketKategori(kelasId, tiket);
          results.push(result);
          console.log(`Success: ${tiket.nama_kategori}`);
        } catch (error) {
          console.warn(`Warning: Gagal membuat tiket ${tiket.nama_kategori}`, error);
        }
      }

      return results;
      
    } catch (error) {
      console.error("Error creating all tiket kategori:", error);
      throw error;
    } finally {
      setIsCreatingTiket(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { nama_kategori, nama_kelas, deskripsi, jadwal, ruangan, biaya } = form;

    const missing = [];
    if (!nama_kategori) missing.push("Nama Kategori");
    if (!nama_kelas) missing.push("Nama Kelas");
    if (!deskripsi) missing.push("Deskripsi");
    if (!jadwal) missing.push("Jadwal");
    if (!ruangan) missing.push("Ruangan");
    if (!biaya) missing.push("Biaya");

    if (missing.length > 0) {
      setErrorMsg(`⚠️ Harap lengkapi kolom: ${missing.join(", ")}.`);
      setLoading(false);
      return;
    }

    // Menghapus validasi foto_qr wajib
    if (isNaN(biaya) || parseFloat(biaya) < 0) {
      setErrorMsg("⚠️ Biaya harus berupa angka positif.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    Object.entries(form).forEach(([key, val]) => {
      formData.append(key, val);
    });
    
    if (form.biaya) {
      formData.append("biaya", parseFloat(form.biaya));
    }
    
    // Mengganti foto_qr dengan gambaran_event
    gambaranEvent.forEach((file, index) => {
      formData.append("gambaran_event", file);
    });
    
    if (foto) formData.append("foto", foto);

    try {
      const response = await axios.post("http://localhost:8000/kategori", formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.kelas_id) {
        const kelasId = response.data.kelas_id;
        setCreatedKelasId(kelasId);
        setSuccess(true);
        
        setTimeout(async () => {
          try {
            await createAllTiketKategori(kelasId);
            
            Swal.fire({
              title: "Sukses!",
              text: "Kategori dan kategori tiket berhasil dibuat",
              icon: "success",
              background: isDarkMode ? "#0A0E0B" : "#ffffff",
              color: isDarkMode ? "#ABB89D" : "#1f2937",
              confirmButtonText: "Lihat Detail Event",
              showCancelButton: true,
              cancelButtonText: "Lihat Daftar Event",
              confirmButtonColor: isDarkMode ? "#D7FE51" : "#FF9913",
              cancelButtonColor: isDarkMode ? "#2A3025" : "#e5e7eb",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate(`/admin/events/${kelasId}`);
              } else {
                navigate("/admin/events");
              }
            });
            
          } catch (error) {
            console.error("Error dalam pembuatan tiket kategori:", error);
            
            Swal.fire({
              title: "Kategori Berhasil Dibuat!",
              text: "Kategori berhasil dibuat. Beberapa kategori tiket mungkin gagal dibuat.",
              icon: "info",
              background: isDarkMode ? "#0A0E0B" : "#ffffff",
              color: isDarkMode ? "#ABB89D" : "#1f2937",
              confirmButtonText: "Lanjutkan",
              confirmButtonColor: isDarkMode ? "#D7FE51" : "#FF9913",
            }).then(() => {
              navigate(`/admin/events/${kelasId}`);
            });
          }
        }, 1000);
        
      } else {
        setSuccess(true);
        
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Kategori dan kelas pertama berhasil ditambahkan.",
          confirmButtonColor: isDarkMode ? "#D7FE51" : "#FF9913",
          background: isDarkMode ? "#1A1F16" : "#ffffff",
          color: isDarkMode ? "#f8fafc" : "#1f2937",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/admin/events", { state: { refresh: true } });
        });
      }
      
    } catch (err) {
      console.error("Error:", err);
      let errorMessage = "Terjadi kesalahan pada server.";
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrorMsg(`🚫 ${errorMessage}`);
      
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan!",
        text: errorMessage,
        confirmButtonColor: isDarkMode ? "#D7FE51" : "#FF9913",
        background: isDarkMode ? "#1A1F16" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-start justify-center p-4 md:p-6 lg:p-8 transition-colors duration-500 ${
      isDarkMode
        ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]"
        : "bg-gradient-to-br from-orange-50 via-white to-amber-50"
    }`}>
      
      {/* Toast validasi */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`fixed top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl shadow-lg z-50 text-sm font-medium backdrop-blur-sm max-w-[90vw] ${
              isDarkMode
                ? "bg-[#2A3025]/90 text-red-300 border border-red-700/50"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            <AlertTriangle size={20} />
            <span className="truncate">{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animasi sukses */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-center z-50 px-4"
          >
            <div className="relative">
              <CheckCircle2
                size={60}
                className={isDarkMode ? "text-[#D7FE51]" : "text-green-500"}
              />
              {isCreatingTiket && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4"
                >
                  <Plus size={24} className={isDarkMode ? "text-[#D7FE51]" : "text-purple-500"} />
                </motion.div>
              )}
            </div>
            <p
              className={`text-base font-semibold mt-2 backdrop-blur-sm px-4 py-2 rounded-lg ${
                isDarkMode ? "text-[#D7FE51] bg-[#1A1F16]/80" : "text-green-700 bg-white/80"
              }`}
            >
              {isCreatingTiket ? "Membuat kategori tiket..." : "Kategori berhasil dibuat!"}
            </p>
            {!isCreatingTiket && createdKelasId && (
              <p className={`text-xs mt-1 ${
                isDarkMode ? "text-[#ABB89D] bg-[#0A0E0B]/50 px-3 py-1 rounded" : "text-slate-600 bg-white/50 px-3 py-1 rounded"
              }`}>
                Mengarahkan ke halaman detail...
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 w-full max-w-4xl lg:max-w-5xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 backdrop-blur-sm mt-8 md:mt-0 ${
          isDarkMode
            ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 border border-[#363D30]/50"
            : "bg-white/95 border border-orange-100"
        }`}
      >
        {/* Header */}
        <div
          className={`relative px-4 sm:px-6 md:px-8 py-6 border-b transition-colors duration-300 overflow-hidden ${
            isDarkMode
              ? "border-[#363D30] bg-gradient-to-r from-[#1A1F16]/80 to-[#0A0E0B]/80"
              : "border-orange-100 bg-gradient-to-r from-[#FF9913]/20 to-[#e08a10]/20"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF9913]/10 via-[#FF8A00]/10 to-[#e08a10]/10"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className={`p-2 sm:p-3 rounded-xl ${
                isDarkMode 
                  ? "bg-[#D7FE51]/20 border border-[#D7FE51]/30" 
                  : "bg-orange-100 border border-orange-200"
              }`}>
                <FolderPlus
                  className={isDarkMode ? "text-[#D7FE51]" : "text-orange-600"}
                  size={24}
                />
              </div>
              <div>
                <h2
                  className={`text-xl sm:text-2xl font-bold tracking-tight ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  Tambah Kategori & Event Pertama
                </h2>
                <p className={`text-xs sm:text-sm mt-1 ${
                  isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                }`}>
                  Buat kategori baru beserta event pertamanya
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/admin/events")}
              className={`self-end sm:self-auto relative flex items-center justify-center rounded-full p-2 transition duration-300 group ${
                isDarkMode
                  ? "bg-[#2A3025] hover:bg-[#363D30]"
                  : "bg-orange-100 hover:bg-orange-200"
              }`}
              title="Kembali ke daftar event"
            >
              <X size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-orange-700"} />
              <span className={`absolute top-full mt-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                isDarkMode 
                  ? "bg-[#2A3025] text-[#ABB89D]" 
                  : "bg-orange-600 text-white"
              }`}>
                Tutup
              </span>
            </motion.button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Grid untuk input utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Bagian Kategori */}
              <div className="sm:col-span-2">
                <h3 className={`text-lg font-semibold mb-6 pb-3 border-b ${
                  isDarkMode 
                    ? "text-[#D7FE51] border-[#363D30]" 
                    : "text-orange-600 border-orange-200"
                }`}>
                  <span className="flex items-center gap-2">
                    <FolderPlus size={20} /> Informasi Kategori
                  </span>
                </h3>
              </div>

              <InputField
                label="Nama Kategori"
                name="nama_kategori"
                icon={<FolderPlus size={18} />}
                value={form.nama_kategori}
                onChange={handleChange}
                error={errors.nama_kategori}
                isDarkMode={isDarkMode}
                placeholder="Contoh: Olahraga, Seni, Teknologi"
                required
              />

              <div className="sm:col-span-2">
                <p className={`text-sm ${
                  isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                }`}>
                  Kategori akan digunakan untuk mengelompokkan event-event yang serupa.
                </p>
              </div>

              {/* Separator */}
              <div className="sm:col-span-2 my-6">
                <div className={`h-px ${
                  isDarkMode ? "bg-[#363D30]" : "bg-slate-300"
                }`}></div>
              </div>

              {/* Bagian Kelas Pertama */}
              <div className="sm:col-span-2">
                <h3 className={`text-lg font-semibold mb-6 pb-3 border-b ${
                  isDarkMode 
                    ? "text-[#D7FE51] border-[#363D30]" 
                    : "text-green-600 border-green-200"
                }`}>
                  <span className="flex items-center gap-2">
                    <Users size={20} /> Informasi Event Pertama
                  </span>
                </h3>
                <p className={`text-sm mb-6 ${
                  isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                }`}>
                  Isi detail untuk event pertama dalam kategori ini
                </p>
              </div>

              <InputField
                label="Nama Event"
                name="nama_kelas"
                icon={<FileText size={18} />}
                value={form.nama_kelas}
                onChange={handleChange}
                error={errors.nama_kelas}
                isDarkMode={isDarkMode}
                placeholder="Contoh: Sepak Bola Dasar, Melukis Pemula"
                required
              />

              <InputField
                label="Waktu"
                name="jadwal"
                icon={<Clock size={18} />}
                value={form.jadwal}
                onChange={handleChange}
                error={errors.jadwal}
                isDarkMode={isDarkMode}
                placeholder="Contoh: Senin & Kamis, 15:00-17:00"
                required
              />

              <InputField
                label="Lokasi"
                name="ruangan"
                icon={<MapPin size={18} />}
                value={form.ruangan}
                onChange={handleChange}
                error={errors.ruangan}
                isDarkMode={isDarkMode}
                placeholder="Contoh: Ruang 101, Lapangan Utama"
                required
              />

              <InputField
                label="Harga Tiket"
                name="biaya"
                type="number"
                icon={<DollarSign size={18} />}
                value={form.biaya}
                onChange={handleChange}
                error={errors.biaya}
                isDarkMode={isDarkMode}
                placeholder="Contoh: 500000"
                min="0"
                step="1000"
                required
              />
            </div>

            {/* Upload Gambaran Event (Mengganti QR Code) */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Images size={18} /> Gambaran Event <span className="text-red-500">*</span>
                </span>
                <span className={`text-xs font-normal mt-1 block ${
                  isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                }`}>
                  Unggah foto-foto untuk gambaran event (maksimal 5 foto, format: JPG, PNG, maks 5MB per foto)
                </span>
              </label>
              
              <div
                onDragOver={(e) => handleDragOver(e, 'gambaran')}
                onDragLeave={(e) => handleDragLeave(e, 'gambaran')}
                onDrop={(e) => handleDrop(e, 'gambaran')}
                onClick={() => gambaranInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDraggingGambaran
                    ? isDarkMode
                      ? "border-[#D7FE51] bg-[#D7FE51]/10"
                      : "border-blue-500 bg-blue-50"
                    : isDarkMode
                    ? "border-[#363D30] hover:border-[#ABB89D] bg-[#1A1F16]/50"
                    : "border-slate-300 hover:border-slate-400 bg-white"
                }`}
              >
                <input
                  ref={gambaranInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGambaranChange}
                  multiple
                  className="hidden"
                />
                
                <div className="flex flex-col items-center">
                  <div className={`p-3 sm:p-4 rounded-full mb-3 sm:mb-4 ${
                    isDarkMode 
                      ? "bg-[#D7FE51]/20" 
                      : "bg-blue-100"
                  }`}>
                    <Images className={isDarkMode ? "text-[#D7FE51]" : "text-blue-500"} size={28} />
                  </div>
                  <p className={`font-medium mb-2 text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                  }`}>
                    Klik atau drag & drop untuk upload gambar event
                  </p>
                  <p className={`text-xs sm:text-sm ${
                    isDarkMode ? "text-[#ABB89D]" : "text-slate-500"
                  }`}>
                    Maksimal 5 foto (PNG, JPG - Maks. 5MB per foto)
                  </p>
                  <p className={`text-xs mt-2 ${
                    isDarkMode ? "text-[#D7FE51]" : "text-blue-600"
                  }`}>
                    {gambaranEvent.length}/5 foto terpilih
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Gambaran Event */}
            {gambaranEvent.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <h3 className={`text-sm font-semibold ${
                  isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                }`}>
                  Preview Gambaran Event ({gambaranEvent.length}/5)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                  {gambaranEvent.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="relative overflow-hidden rounded-lg border-2 border-slate-200 dark:border-[#363D30]">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Gambaran event ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
                      </div>
                      <div className="absolute top-1.5 right-1.5">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => handleRemoveGambaran(index)}
                          className={`p-1 sm:p-1.5 rounded-full shadow-lg ${
                            isDarkMode 
                              ? "bg-red-700 text-white" 
                              : "bg-red-500 text-white"
                          }`}
                          title="Hapus foto"
                        >
                          <Trash2 size={12} />
                        </motion.button>
                      </div>
                      <p className={`text-xs mt-1 truncate ${
                        isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                      }`}>
                        {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Deskripsi */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <FileText size={18} /> Deskripsi Event <span className="text-red-500">*</span>
                </span>
                <span className={`text-xs font-normal mt-1 block ${
                  isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                }`}>
                  Jelaskan tentang kelas ini, materi yang diajarkan, target peserta, dll.
                </span>
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows={5}
                placeholder="Masukkan deskripsi lengkap kelas, termasuk materi yang akan diajarkan, target peserta, durasi, dan informasi tambahan..."
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-all duration-300 resize-none text-sm sm:text-base ${
                  isDarkMode
                    ? "bg-[#1A1F16]/50 border-[#363D30] text-[#ABB89D] placeholder-[#646B5E] focus:ring-2 focus:ring-[#D7FE51] focus:border-transparent"
                    : "border-slate-300 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                }`}
              />
              {errors.deskripsi && (
                <p className="text-red-500 text-sm mt-1">{errors.deskripsi}</p>
              )}
              <div className={`text-xs flex justify-between ${
                isDarkMode ? "text-[#646B5E]" : "text-slate-500"
              }`}>
                <span>Jelaskan dengan detail untuk informasi yang lebih baik</span>
                <span>{form.deskripsi.length}/1000 karakter</span>
              </div>
            </div>

            {/* Upload Foto Kelas */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Image size={18} /> Foto Event
                </span>
                <span className={`text-xs font-normal mt-1 block ${
                  isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                }`}>
                  Unggah foto event/poster (format: JPG, PNG, maks 5MB)
                </span>
              </label>
              
              <div
                onDragOver={(e) => handleDragOver(e, 'foto')}
                onDragLeave={(e) => handleDragLeave(e, 'foto')}
                onDrop={(e) => handleDrop(e, 'foto')}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDraggingFoto
                    ? isDarkMode
                      ? "border-[#D7FE51] bg-[#D7FE51]/10"
                      : "border-orange-500 bg-orange-50"
                    : isDarkMode
                    ? "border-[#363D30] hover:border-[#ABB89D] bg-[#1A1F16]/50"
                    : "border-slate-300 hover:border-slate-400 bg-white"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center">
                  <div className={`p-3 sm:p-4 rounded-full mb-3 sm:mb-4 ${
                    isDarkMode 
                      ? "bg-[#D7FE51]/20" 
                      : "bg-orange-100"
                  }`}>
                    <Upload className={isDarkMode ? "text-[#D7FE51]" : "text-orange-500"} size={28} />
                  </div>
                  <p className={`font-medium mb-2 text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                  }`}>
                    {foto ? foto.name : "Klik atau drag & drop untuk upload foto kelas"}
                  </p>
                  <p className={`text-xs sm:text-sm ${
                    isDarkMode ? "text-[#ABB89D]" : "text-slate-500"
                  }`}>
                    {foto ? "Klik untuk mengganti foto" : "PNG, JPG (Maks. 5MB)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Foto Kelas */}
            {foto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <h3 className={`text-sm font-semibold ${
                  isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                }`}>
                  Preview Foto Kelas
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(foto)}
                      alt="Preview Kelas"
                      className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-xl shadow-lg border-2 border-slate-200 dark:border-[#363D30]"
                    />
                    <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                      isDarkMode 
                        ? "bg-[#D7FE51]/20 text-[#D7FE51] border border-[#D7FE51]/30" 
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}>
                      Foto Event
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm mb-2 break-words ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                    }`}>
                      <span className="font-semibold">Nama file:</span> {foto.name}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                    }`}>
                      <span className="font-semibold">Ukuran:</span> {(foto.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info Tiket Kategori Otomatis */}
            <div className={`p-4 rounded-xl border ${
              isDarkMode 
                ? "bg-[#1A1F16] border-[#363D30]" 
                : "bg-purple-50 border-purple-200"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  isDarkMode ? "bg-[#D7FE51]/20" : "bg-purple-100"
                }`}>
                  <Plus size={20} className={
                    isDarkMode ? "text-[#D7FE51]" : "text-purple-600"
                  } />
                </div>
                <div className="min-w-0">
                  <h4 className={`font-semibold mb-1 text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-800"
                  }`}>
                    Tiket Kategori Akan Dibuat Otomatis
                  </h4>
                  <p className={`text-xs sm:text-sm ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                    Setelah kategori berhasil dibuat, sistem akan secara otomatis membuat 3 kategori tiket untuk event pertama:
                  </p>
                  <ul className={`text-xs sm:text-sm mt-2 space-y-1 ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isDarkMode ? "bg-[#D7FE51]" : "bg-green-400"
                      }`}></div>
                      <span className="truncate"><strong>Reguler</strong> - Paket standar Rp {parseFloat(form.biaya || 0).toLocaleString('id-ID')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isDarkMode ? "bg-[#D7FE51]" : "bg-purple-400"
                      }`}></div>
                      <span className="truncate"><strong>Premium</strong> - Paket lengkap Rp {(parseFloat(form.biaya || 0) * 1.5).toLocaleString('id-ID')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isDarkMode ? "bg-[#D7FE51]" : "bg-blue-400"
                      }`}></div>
                      <span className="truncate"><strong>Early Bird</strong> - Paket diskon Rp {(parseFloat(form.biaya || 0) * 0.8).toLocaleString('id-ID')}</span>
                    </li>
                  </ul>
                  <p className={`text-xs mt-2 ${
                    isDarkMode ? "text-[#646B5E]" : "text-gray-500"
                  }`}>
                    Anda dapat menambah, mengedit, atau menghapus kategori tiket di halaman detail event
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-slate-200 dark:border-[#363D30]">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate("/admin/events")}
                disabled={loading}
                className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                  isDarkMode
                    ? "bg-[#2A3025] hover:bg-[#363D30] text-[#ABB89D] border border-[#363D30]"
                    : "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Batal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={success || isCreatingTiket || loading}
                className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group text-sm sm:text-base ${
                  success || isCreatingTiket || loading
                    ? isDarkMode
                      ? "bg-[#D7FE51] text-[#0A0E0B]"
                      : "bg-green-500 text-white"
                    : isDarkMode
                    ? "bg-[#D7FE51] hover:bg-[#c5e847] text-[#0A0E0B]"
                    : "bg-gradient-to-r from-[#FF9913] to-[#e08a10] hover:from-[#FF8A00] hover:to-[#d67c0e] text-white shadow-lg hover:shadow-orange-300/50"
                } ${success || isCreatingTiket || loading ? "cursor-not-allowed" : ""}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {success || isCreatingTiket || loading ? (
                    <>
                      {isCreatingTiket ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          >
                            <Plus size={18} />
                          </motion.div>
                          Membuat Tiket...
                        </>
                      ) : loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                          />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          Membuat Kategori...
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <FolderPlus size={18} />
                      Simpan Kategori & Event
                    </>
                  )}
                </span>
                {!(success || isCreatingTiket || loading) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

/* --------- Komponen Reusable ---------- */
function InputField({ label, name, type = "text", icon, value, onChange, placeholder, isDarkMode, error, required = false, ...props }) {
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
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full border rounded-xl px-4 pl-10 py-3 focus:outline-none transition-all duration-300 text-sm sm:text-base ${
            isDarkMode
              ? "bg-[#1A1F16]/50 border-[#363D30] text-[#ABB89D] placeholder-[#646B5E] focus:ring-2 focus:ring-[#D7FE51] focus:border-transparent"
              : "border-slate-300 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          }`}
          required={required}
          {...props}
        />
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? "text-[#646B5E]" : "text-slate-500"
        }`}>
          {icon}
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Image as ImageIcon,
  BookOpen,
  MapPin,
  DollarSign,
  FileText,
  Layers3,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Upload,
  Clock,
  Images,
  Users,
  Plus,
  Trash2,
  Link,
  Globe
} from "lucide-react";
import { useAppTheme } from "../hooks/useTheme";

const MySwal = withReactContent(Swal);

export default function EditKelas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { isDarkMode } = useAppTheme();

  // State form
  const [form, setForm] = useState({
    nama_kelas: "",
    kategori: "",
    deskripsi: "",
    jadwal: "",
    ruangan: "",
    biaya: "",
    total_peserta: "",
    link_navigasi: "", // TAMBAHKAN: Field untuk link navigasi
    is_link_eksternal: false, // TAMBAHKAN: Field untuk menandai link eksternal
  });

  const [foto, setFoto] = useState(null);
  const [gambaranEvent, setGambaranEvent] = useState([]); // File baru yang diupload
  const [existingGambaranEvent, setExistingGambaranEvent] = useState([]); // URL existing
  const [hapusFoto, setHapusFoto] = useState(false);
  const [hapusGambaranEvent, setHapusGambaranEvent] = useState(false);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [kelas, setKelas] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDraggingFoto, setIsDraggingFoto] = useState(false);
  const [isDraggingGambaran, setIsDraggingGambaran] = useState(false);
  const fotoInputRef = useRef(null);
  const gambaranInputRef = useRef(null);
  
  // Exit animation state
  const [isExiting, setIsExiting] = useState(false);

  // Ambil data kelas dan kategori
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Ambil list kategori
        const kategoriRes = await axios.get('http://localhost:8000/kategori');
        setKategoriList(kategoriRes.data);

        // Ambil data kelas
        let kelasData;
        if (location.state?.kelas) {
          kelasData = location.state.kelas;
          console.log("Menggunakan data dari state navigasi:", kelasData);
        } else {
          console.log("Fetching data dari API untuk ID:", id);
          const kelasRes = await axios.get(`http://localhost:8000/kelas/${id}`);
          kelasData = kelasRes.data;
        }

        setKelas(kelasData);
        setForm({
          nama_kelas: kelasData.nama_kelas || "",
          kategori: kelasData.kategori || "",
          deskripsi: kelasData.deskripsi || "",
          jadwal: kelasData.jadwal || "",
          ruangan: kelasData.ruangan || "",
          biaya: kelasData.biaya || "",
          total_peserta: kelasData.total_peserta || "",
          link_navigasi: kelasData.link_navigasi || "", // TAMBAHKAN: Set link navigasi
          is_link_eksternal: kelasData.is_link_eksternal || false, // TAMBAHKAN: Set is_link_eksternal
        });
        
        // Set preview untuk foto yang sudah ada
        if (kelasData.foto) {
          setPreviewFoto(`http://localhost:8000/uploads/${kelasData.foto}?t=${Date.now()}`);
        }
        
        // Set existing gambaran event
        if (kelasData.gambaran_event_urls && Array.isArray(kelasData.gambaran_event_urls)) {
          setExistingGambaranEvent(kelasData.gambaran_event_urls);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        showError("Gagal mengambil data kelas.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.state]);

  // Format Rupiah untuk tampilan
  const formatRupiah = (angka) => {
    if (!angka) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Handle input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Handle file upload untuk foto kelas
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
      if (file) setHapusFoto(false);
    }
  };

  // Handle file upload untuk gambaran event (multiple files)
  const handleGambaranChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Batasi maksimal 5 file
    const newFiles = validFiles.slice(0, 5 - (existingGambaranEvent.length + gambaranEvent.length));
    
    if (newFiles.length > 0) {
      setGambaranEvent(prev => [...prev, ...newFiles]);
    }
    
    // Reset input value
    e.target.value = null;
  };

  // Fungsi untuk menghapus file dari gambaran event baru
  const handleRemoveGambaran = (index) => {
    setGambaranEvent(prev => prev.filter((_, i) => i !== index));
  };

  // Fungsi untuk menghapus existing gambaran event
  const handleRemoveExistingGambaran = (index) => {
    setExistingGambaranEvent(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers untuk foto kelas
  const handleDragOverFoto = (e) => {
    e.preventDefault();
    setIsDraggingFoto(true);
  };

  const handleDragLeaveFoto = (e) => {
    e.preventDefault();
    setIsDraggingFoto(false);
  };

  const handleDropFoto = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setIsDraggingFoto(false);
      setFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
      setHapusFoto(false);
    }
  };

  // Drag and drop handlers untuk gambaran event
  const handleDragOverGambaran = (e) => {
    e.preventDefault();
    setIsDraggingGambaran(true);
  };

  const handleDragLeaveGambaran = (e) => {
    e.preventDefault();
    setIsDraggingGambaran(false);
  };

  const handleDropGambaran = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setIsDraggingGambaran(false);
      // Tambahkan file ke gambaran event (maksimal 5)
      const newFiles = imageFiles.slice(0, 5 - (existingGambaranEvent.length + gambaranEvent.length));
      if (newFiles.length > 0) {
        setGambaranEvent(prev => [...prev, ...newFiles]);
      }
    }
  };

  // Navigasi dengan animasi keluar
  const navigateWithExit = (path, state = {}) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path, { state });
    }, 500);
  };

  // Tampilkan error message
  const showError = (message) => {
    setErrorMsg(message);
    setTimeout(() => setErrorMsg(""), 5000);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { nama_kelas, kategori, deskripsi, jadwal, ruangan, biaya, total_peserta, link_navigasi, is_link_eksternal } = form;

    // Validasi input wajib
    const missing = [];
    if (!nama_kelas.trim()) missing.push("Nama Kelas");
    if (!kategori.trim()) missing.push("Kategori");
    if (!deskripsi.trim()) missing.push("Deskripsi");
    if (!jadwal.trim()) missing.push("Jadwal");
    if (!ruangan.trim()) missing.push("Ruangan");
    if (!biaya) missing.push("Biaya");

    if (missing.length > 0) {
      showError(`⚠️ Harap lengkapi kolom: ${missing.join(", ")}.`);
      return;
    }

    if (isNaN(biaya) || parseFloat(biaya) < 0) {
      showError("⚠️ Biaya harus berupa angka positif.");
      return;
    }

    // Validasi total peserta jika diisi
    if (total_peserta && (isNaN(total_peserta) || parseInt(total_peserta) < 0)) {
      showError("⚠️ Total peserta harus berupa angka positif.");
      return;
    }

    // Validasi link navigasi jika diisi
    if (link_navigasi) {
      try {
        // Validasi URL jika link eksternal
        if (is_link_eksternal) {
          new URL(link_navigasi); // Akan throw error jika bukan URL valid
        } else if (!link_navigasi.startsWith('/')) {
          // Jika internal link, harus dimulai dengan slash
          showError("⚠️ Link internal harus dimulai dengan '/' (contoh: /events/1/tiket)");
          return;
        }
      } catch (error) {
        showError("⚠️ Format link navigasi tidak valid. Harap masukkan URL yang benar.");
        return;
      }
    }

    // Konfirmasi sebelum simpan
    const result = await Swal.fire({
      title: "Konfirmasi Perubahan",
      text: "Apakah Anda yakin ingin menyimpan perubahan pada data kelas ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#dc2626",
      background: isDarkMode ? '#1A1F16' : '#ffffff',
      color: isDarkMode ? '#ABB89D' : '#1f2937',
    });

    if (!result.isConfirmed) return;

    const formData = new FormData();
    formData.append("nama_kelas", nama_kelas.trim());
    formData.append("kategori", kategori.trim());
    formData.append("deskripsi", deskripsi.trim());
    formData.append("jadwal", jadwal.trim());
    formData.append("ruangan", ruangan.trim());
    formData.append("biaya", parseFloat(biaya));
    
    // TAMBAHKAN FIELD LINK NAVIGASI
    if (link_navigasi) {
      formData.append("link_navigasi", link_navigasi);
    } else {
      formData.append("link_navigasi", "");
    }
    
    formData.append("is_link_eksternal", is_link_eksternal.toString());
    
    // Set total peserta
    if (total_peserta) {
      formData.append("total_peserta", parseInt(total_peserta));
    } else {
      formData.append("total_peserta", 0);
    }
    
    formData.append("hapus_foto", hapusFoto.toString());
    formData.append("hapus_gambaran_event", hapusGambaranEvent.toString());
    
    if (foto) {
      formData.append("foto", foto);
    }
    
    // Tambahkan file gambaran event baru
    gambaranEvent.forEach((file, index) => {
      formData.append("gambaran_event", file);
    });

    try {
      const res = await axios.put(
        `http://localhost:8000/kelas/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        navigateWithExit("/admin/events", { 
          kelasEdited: true,
          updatedKelas: res.data.kelas,
          dataUpdated: true 
        });
      }, 1200);

    } catch (err) {
      console.error('Error updating kelas:', err);
      const errorMessage = err.response?.data?.detail || "Terjadi kesalahan saat memperbarui kelas.";
      showError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
        isDarkMode ? "bg-[#0A0E0B]" : "bg-white"
      }`}>
        <div className="w-16 h-16 border-4 border-t-orange-500 border-gray-300 rounded-full animate-spin mb-4"></div>
        <p className={`text-lg ${
          isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
        }`}>
          Memuat data kelas...
        </p>
      </div>
    );
  }

  if (!kelas) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? "bg-[#0A0E0B]" : "bg-white"
      }`}>
        <p className={`text-lg ${
          isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
        }`}>
          Kelas tidak ditemukan
        </p>
      </div>
    );
  }

  const totalGambaranEvent = existingGambaranEvent.length + gambaranEvent.length;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 md:p-6 relative transition-colors duration-500 ${
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
            className={`fixed top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg z-50 text-sm font-medium backdrop-blur-sm ${
              isDarkMode
                ? "bg-[#2A3025]/90 text-red-300 border border-red-700/50"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            <AlertTriangle size={22} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animasi success */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-center z-50"
          >
            <CheckCircle2
              size={80}
              className={isDarkMode ? "text-[#D7FE51]" : "text-green-500"}
            />
            <p
              className={`text-lg font-semibold mt-2 backdrop-blur-sm px-4 py-2 rounded-lg ${
                isDarkMode ? "text-[#D7FE51] bg-[#1A1F16]/80" : "text-green-700 bg-white/80"
              }`}
            >
              Event berhasil diperbarui!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Form */}
      <AnimatePresence>
        {!isExiting && (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`relative z-10 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 backdrop-blur-sm ${
              isDarkMode
                ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 border border-[#363D30]/50"
                : "bg-white/95 border border-orange-100"
            }`}
          >
            {/* Header */}
            <div
              className={`relative px-8 py-6 border-b transition-colors duration-300 overflow-hidden ${
                isDarkMode
                  ? "border-[#363D30] bg-gradient-to-r from-[#1A1F16]/80 to-[#0A0E0B]/80"
                  : "border-orange-100 bg-gradient-to-r from-[#FF9913]/20 to-[#e08a10]/20"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF9913]/10 via-[#FF8A00]/10 to-[#e08a10]/10"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    isDarkMode 
                      ? "bg-[#D7FE51]/20 border border-[#D7FE51]/30" 
                      : "bg-orange-100 border border-orange-200"
                  }`}>
                    <BookOpen
                      className={isDarkMode ? "text-[#D7FE51]" : "text-orange-600"}
                      size={28}
                    />
                  </div>
                  <div>
                    <h2
                      className={`text-2xl font-bold tracking-tight ${
                        isDarkMode ? "text-white" : "text-slate-800"
                      }`}
                    >
                      Edit Event
                    </h2>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                    }`}>
                      Perbarui data event yang sudah ada
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => navigateWithExit("/admin/events")}
                  className={`relative flex items-center justify-center rounded-full p-2 transition duration-300 group ${
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
            <div className="p-6 md:p-8">
              {/* Informasi Kelas */}
              {kelas.peserta && kelas.peserta.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`mb-8 p-4 rounded-xl ${
                    isDarkMode 
                      ? "bg-[#2A3025] border border-[#363D30]" 
                      : "bg-blue-50 border border-blue-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users size={24} className={isDarkMode ? "text-[#D7FE51]" : "text-blue-600"} />
                    <div>
                      <p className={`font-semibold ${isDarkMode ? "text-[#ABB89D]" : "text-blue-800"}`}>
                        Total Peserta Terdaftar: {kelas.peserta.length}
                      </p>
                      <p className={`text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-blue-600"}`}>
                        Total kuota peserta: {kelas.total_peserta || 0} orang
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Grid untuk input utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Nama Event"
                    name="nama_kelas"
                    icon={<BookOpen size={18} />}
                    value={form.nama_kelas}
                    onChange={handleChange}
                    isDarkMode={isDarkMode}
                    placeholder="Contoh: Gastronomi Run 2024"
                    required
                  />

                  <SelectField
                    label="Kategori"
                    name="kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    options={kategoriList.map((k) =>
                      typeof k === "string" ? k : k.nama || k.nama_kategori
                    )}
                    icon={<Layers3 size={18} />}
                    isDarkMode={isDarkMode}
                    required
                  />

                  <InputField
                    label="Waktu"
                    name="jadwal"
                    icon={<Clock size={18} />}
                    value={form.jadwal}
                    onChange={handleChange}
                    isDarkMode={isDarkMode}
                    placeholder="Contoh: 15 Desember 2024, 08:00-17:00"
                    required
                  />

                  <InputField
                    label="Lokasi"
                    name="ruangan"
                    icon={<MapPin size={18} />}
                    value={form.ruangan}
                    onChange={handleChange}
                    isDarkMode={isDarkMode}
                    placeholder="Contoh: Lapangan Merdeka, Jakarta"
                    required
                  />

                  <InputField
                    label="Harga Tiket"
                    type="number"
                    name="biaya"
                    icon={<DollarSign size={18} />}
                    value={form.biaya}
                    onChange={handleChange}
                    isDarkMode={isDarkMode}
                    placeholder="Contoh: 350000"
                    min="0"
                    required
                  />
                  
                  <InputField
                    label="Total Peserta"
                    type="number"
                    name="total_peserta"
                    icon={<Users size={18} />}
                    value={form.total_peserta}
                    onChange={handleChange}
                    isDarkMode={isDarkMode}
                    placeholder="Contoh: 100"
                    min="0"
                  />
                </div>

                {/* Link Navigasi Beli Tiket */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold">
                    <span className="flex items-center gap-2">
                      <Link size={18} /> Link Navigasi Beli Tiket (Opsional)
                    </span>
                    <span className={`text-xs font-normal mt-1 block ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                    }`}>
                      Atur link khusus untuk tombol "Beli" di halaman user. Kosongkan untuk menggunakan default.
                    </span>
                  </label>
                  
                  <div className="space-y-3">
                    <InputField
                      label="Link URL"
                      name="link_navigasi"
                      icon={<Link size={18} />}
                      value={form.link_navigasi}
                      onChange={handleChange}
                      isDarkMode={isDarkMode}
                      placeholder="Contoh: /events/1/tiket atau https://wa.me/6281234567890"
                    />
                    
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                        isDarkMode 
                          ? "bg-[#1A1F16]/50 border-[#363D30]" 
                          : "bg-slate-50 border-slate-200"
                      }`}>
                        <input
                          type="checkbox"
                          id="is_link_eksternal"
                          name="is_link_eksternal"
                          checked={form.is_link_eksternal}
                          onChange={handleChange}
                          className={`w-4 h-4 rounded ${
                            isDarkMode ? "accent-[#D7FE51]" : "accent-[#FF9913]"
                          }`}
                        />
                        <label 
                          htmlFor="is_link_eksternal"
                          className={`text-sm flex items-center gap-2 cursor-pointer ${
                            isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                          }`}
                        >
                          <Globe size={14} />
                          Link Eksternal (website lain/WhatsApp)
                        </label>
                      </div>
                      
                      <div className={`text-xs px-3 py-1 rounded ${
                        isDarkMode 
                          ? "bg-[#363D30] text-[#ABB89D]" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {form.is_link_eksternal ? "Eksternal" : "Internal"}
                      </div>
                    </div>
                    
                    <div className={`text-xs ${
                      isDarkMode ? "text-[#646B5E]" : "text-slate-500"
                    }`}>
                      <p className="mb-1">
                        <span className="font-semibold">Contoh link internal:</span> /events/1/tiket
                      </p>
                      <p>
                        <span className="font-semibold">Contoh link eksternal:</span> https://wa.me/6281234567890
                      </p>
                      <p className="mt-1">
                        <span className="text-yellow-600">Note:</span> Jika kosong, tombol "Beli" akan navigasi ke halaman detail event
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gambaran Event Saat Ini */}
                {existingGambaranEvent.length > 0 && (
                  <div className="space-y-4">
                    <label className={`block text-sm font-semibold ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                    }`}>
                      <span className="flex items-center gap-2">
                        <Images size={18} /> Gambaran Event Saat Ini
                      </span>
                      <span className={`text-xs font-normal mt-1 block ${
                        isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                      }`}>
                        Foto-foto untuk gambaran event yang sudah ada
                      </span>
                    </label>
                    <div className={`p-4 rounded-xl border ${
                      isDarkMode ? "border-[#363D30]" : "border-slate-200"
                    }`}>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {existingGambaranEvent.map((url, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group"
                          >
                            <div className="relative overflow-hidden rounded-lg border-2 border-slate-200 dark:border-[#363D30]">
                              <img
                                src={url}
                                alt={`Gambaran event ${index + 1}`}
                                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
                            </div>
                            <div className="absolute top-2 right-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => handleRemoveExistingGambaran(index)}
                                className={`p-1.5 rounded-full shadow-lg ${
                                  isDarkMode 
                                    ? "bg-red-700 text-white" 
                                    : "bg-red-500 text-white"
                                }`}
                                title="Hapus foto"
                              >
                                <Trash2 size={14} />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <label className={`flex items-center gap-2 text-sm ${
                          isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                        }`}>
                          <input
                            type="checkbox"
                            checked={hapusGambaranEvent}
                            onChange={(e) => setHapusGambaranEvent(e.target.checked)}
                            className={isDarkMode ? "accent-red-500" : "accent-red-600"}
                          />
                          Hapus semua gambaran event saat ini
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Gambaran Event Baru */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold">
                    <span className="flex items-center gap-2">
                      <Images size={18} /> {existingGambaranEvent.length > 0 ? "Tambah Gambaran Event Baru" : "Upload Gambaran Event"} <span className="text-red-500">*</span>
                    </span>
                    <span className={`text-xs font-normal mt-1 block ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                    }`}>
                      Unggah foto-foto tambahan untuk gambaran event (maksimal {5 - existingGambaranEvent.length} foto lagi, format: JPG, PNG, maks 5MB per foto)
                    </span>
                  </label>
                  
                  <div
                    onDragOver={handleDragOverGambaran}
                    onDragLeave={handleDragLeaveGambaran}
                    onDrop={handleDropGambaran}
                    onClick={() => gambaranInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
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
                      <div className={`p-4 rounded-full mb-4 ${
                        isDarkMode 
                          ? "bg-[#D7FE51]/20" 
                          : "bg-blue-100"
                      }`}>
                        <Images className={isDarkMode ? "text-[#D7FE51]" : "text-blue-500"} size={32} />
                      </div>
                      <p className={`font-medium mb-2 ${
                        isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                      }`}>
                        Klik atau drag & drop untuk upload gambar event
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? "text-[#ABB89D]" : "text-slate-500"
                      }`}>
                        Maksimal {5 - existingGambaranEvent.length} foto lagi (PNG, JPG - Maks. 5MB per foto)
                      </p>
                      <p className={`text-xs mt-2 ${
                        isDarkMode ? "text-[#D7FE51]" : "text-blue-600"
                      }`}>
                        {totalGambaranEvent}/5 foto terpilih
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview Gambaran Event Baru */}
                {gambaranEvent.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <h3 className={`text-sm font-semibold ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                    }`}>
                      Preview Gambaran Event Baru ({gambaranEvent.length} foto baru)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                              alt={`Gambaran event baru ${index + 1}`}
                              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
                          </div>
                          <div className="absolute top-2 right-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => handleRemoveGambaran(index)}
                              className={`p-1.5 rounded-full shadow-lg ${
                                isDarkMode 
                                  ? "bg-red-700 text-white" 
                                  : "bg-red-500 text-white"
                              }`}
                              title="Hapus foto"
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          </div>
                          <p className={`text-xs mt-1 truncate ${
                            isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                          }`}>
                            {file.name}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Foto Event Utama Saat Ini */}
                {kelas.foto && (
                  <div className="space-y-4">
                    <label className={`block text-sm font-semibold ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                    }`}>
                      <span className="flex items-center gap-2">
                        <ImageIcon size={18} /> Foto Event Utama Saat Ini
                      </span>
                      <span className={`text-xs font-normal mt-1 block ${
                        isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                      }`}>
                        Foto untuk tampilan thumbnail event
                      </span>
                    </label>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl border ${
                        isDarkMode ? "border-[#363D30]" : "border-slate-200"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={`http://localhost:8000/uploads/${kelas.foto}?t=${Date.now()}`}
                          alt="Foto Event Saat Ini"
                          className="w-48 h-48 object-cover rounded-xl shadow-lg border-2 border-slate-200 dark:border-[#363D30]"
                        />
                        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                          isDarkMode 
                            ? "bg-[#D7FE51]/20 text-[#D7FE51] border border-[#D7FE51]/30" 
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}>
                          Foto Event Utama
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm mb-4 ${
                          isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                        }`}>
                          <span className="font-semibold">Nama file:</span> {kelas.foto}
                        </p>
                        <label className={`flex items-center gap-2 text-sm ${
                          isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                        }`}>
                          <input
                            type="checkbox"
                            checked={hapusFoto}
                            onChange={(e) => setHapusFoto(e.target.checked)}
                            className={isDarkMode ? "accent-red-500" : "accent-red-600"}
                          />
                          Hapus foto ini
                        </label>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Upload Foto Event Utama Baru */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold">
                    <span className="flex items-center gap-2">
                      <ImageIcon size={18} /> {kelas.foto ? "Ganti Foto Event Utama" : "Upload Foto Event Utama"} (Opsional)
                    </span>
                    <span className={`text-xs font-normal mt-1 block ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                    }`}>
                      Unggah foto utama untuk tampilan thumbnail event (format: JPG, PNG, maks 5MB)
                    </span>
                  </label>
                  
                  <div
                    onDragOver={handleDragOverFoto}
                    onDragLeave={handleDragLeaveFoto}
                    onDrop={handleDropFoto}
                    onClick={() => fotoInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
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
                      ref={fotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <div className="flex flex-col items-center">
                      <div className={`p-4 rounded-full mb-4 ${
                        isDarkMode 
                          ? "bg-[#D7FE51]/20" 
                          : "bg-orange-100"
                      }`}>
                        <Upload className={isDarkMode ? "text-[#D7FE51]" : "text-orange-500"} size={32} />
                      </div>
                      <p className={`font-medium mb-2 ${
                        isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                      }`}>
                        {foto ? foto.name : "Klik atau drag & drop untuk upload foto event utama"}
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? "text-[#ABB89D]" : "text-slate-500"
                      }`}>
                        {foto ? "Klik untuk mengganti foto" : "PNG, JPG (Maks. 5MB)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview Foto Event Utama Baru */}
                {foto && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <h3 className={`text-sm font-semibold ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-700"
                    }`}>
                      Preview Foto Event Utama Baru
                    </h3>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative">
                        <img
                          src={previewFoto}
                          alt="Preview Event Baru"
                          className="w-48 h-48 object-cover rounded-xl shadow-lg border-2 border-slate-200 dark:border-[#363D30]"
                        />
                        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                          isDarkMode 
                            ? "bg-[#D7FE51]/20 text-[#D7FE51] border border-[#D7FE51]/30" 
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}>
                          Foto Baru
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm mb-2 ${
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

                {/* Deskripsi */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold">
                    <span className="flex items-center gap-2">
                      <FileText size={18} /> Deskripsi Event
                    </span>
                    <span className={`text-xs font-normal mt-1 block ${
                      isDarkMode ? "text-[#ABB89D]" : "text-slate-600"
                    }`}>
                      Jelaskan detail event, rangkaian acara, dan informasi penting
                    </span>
                  </label>
                  <textarea
                    name="deskripsi"
                    value={form.deskripsi}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Masukkan deskripsi lengkap event, termasuk rangkaian acara, aktivitas yang akan dilakukan, fasilitas, dan informasi tambahan..."
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-all duration-300 resize-none ${
                      isDarkMode
                        ? "bg-[#1A1F16]/50 border-[#363D30] text-[#ABB89D] placeholder-[#646B5E] focus:ring-2 focus:ring-[#D7FE51] focus:border-transparent"
                        : "border-slate-300 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    }`}
                  />
                  <div className={`text-xs flex justify-between ${
                    isDarkMode ? "text-[#646B5E]" : "text-slate-500"
                  }`}>
                    <span>Jelaskan dengan detail untuk informasi yang lebih baik</span>
                    <span>{form.deskripsi.length}/1000 karakter</span>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-[#363D30]">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => navigateWithExit("/admin/events")}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      isDarkMode
                        ? "bg-[#2A3025] hover:bg-[#363D30] text-[#ABB89D] border border-[#363D30]"
                        : "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                    }`}
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={success}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                      success
                        ? isDarkMode
                          ? "bg-[#D7FE51] text-[#0A0E0B]"
                          : "bg-green-500 text-white"
                        : isDarkMode
                        ? "bg-[#D7FE51] hover:bg-[#c5e847] text-[#0A0E0B]"
                        : "bg-gradient-to-r from-[#FF9913] to-[#e08a10] hover:from-[#FF8A00] hover:to-[#d67c0e] text-white shadow-lg hover:shadow-orange-300/50"
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {success ? (
                        <>
                          <CheckCircle2 size={20} />
                          Berhasil Diperbarui
                        </>
                      ) : (
                        <>
                          <BookOpen size={20} />
                          Simpan Perubahan
                        </>
                      )}
                    </span>
                    {!success && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Komponen InputField
function InputField({ label, name, type = "text", icon, value, onChange, placeholder, isDarkMode, required, min, max }) {
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
          min={min}
          max={max}
          className={`w-full border rounded-xl px-4 pl-10 py-3.5 focus:outline-none transition-all duration-300 ${
            isDarkMode
              ? "bg-[#1A1F16]/50 border-[#363D30] text-[#ABB89D] placeholder-[#646B5E] focus:ring-2 focus:ring-[#D7FE51] focus:border-transparent"
              : "border-slate-300 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          }`}
        />
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? "text-[#646B5E]" : "text-slate-500"
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Komponen SelectField
function SelectField({ label, name, value, onChange, options, icon, isDarkMode, required }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">
        <span className="flex items-center gap-2">
          {icon} {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full border rounded-xl px-4 pl-10 py-3.5 focus:outline-none transition-all duration-300 appearance-none cursor-pointer ${
            isDarkMode
              ? "bg-[#1A1F16]/50 border-[#363D30] text-[#ABB89D] focus:ring-2 focus:ring-[#D7FE51] focus:border-transparent"
              : "border-slate-300 text-slate-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          }`}
        >
          <option value="" className={isDarkMode ? "bg-[#1A1F16]" : ""}>
            -- Pilih {label} --
          </option>
          {options.map((opt, i) => (
            <option 
              key={i} 
              value={opt}
              className={isDarkMode ? "bg-[#1A1F16]" : ""}
            >
              {opt}
            </option>
          ))}
        </select>
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? "text-[#646B5E]" : "text-slate-500"
        }`}>
          {icon}
        </div>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
          isDarkMode ? "text-[#646B5E]" : "text-slate-500"
        }`} size={20} />
      </div>
    </div>
  );
}
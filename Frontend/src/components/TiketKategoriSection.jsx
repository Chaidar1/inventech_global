import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  DollarSign,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  Star,
  Ticket,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export default function TiketKategoriSection({ kelasId, isAdmin = false, isDarkMode }) {
  const [tiketKategori, setTiketKategori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTiket, setEditingTiket] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Untuk force refresh
  
  // Form state
  const [form, setForm] = useState({
    nama_kategori: "",
    deskripsi: "",
    harga: "",
    manfaat: "",
    is_populer: false,
  });

  // Fungsi untuk fetch tiket kategori
  const fetchTiketKategori = async () => {
    if (!kelasId) return;
    
    try {
      setLoading(true);
      console.log(`Fetching tiket kategori untuk kelas ID: ${kelasId}`);
      
      const res = await axios.get(`http://localhost:8000/kelas/${kelasId}/tiket-kategori`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log("Data tiket kategori diterima:", res.data);
      setTiketKategori(res.data);
      
    } catch (error) {
      console.error("Error fetching tiket kategori:", error);
      
      // Fallback: coba ambil dari endpoint kelas
      try {
        const kelasRes = await axios.get(`http://localhost:8000/kelas/${kelasId}`);
        if (kelasRes.data && kelasRes.data.tiket_kategori) {
          console.log("Menggunakan tiket kategori dari data kelas:", kelasRes.data.tiket_kategori);
          setTiketKategori(kelasRes.data.tiket_kategori);
        } else {
          setTiketKategori([]);
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        setTiketKategori([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect untuk fetch data
  useEffect(() => {
    if (kelasId) {
      fetchTiketKategori();
    }
  }, [kelasId, refreshKey]);

  // Fungsi untuk refresh data
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const missing = [];
    if (!form.nama_kategori) missing.push("Nama Kategori");
    if (!form.deskripsi) missing.push("Deskripsi");
    if (!form.harga) missing.push("Harga");
    if (!form.manfaat) missing.push("Manfaat");
    
    if (missing.length > 0) {
      Swal.fire({
        title: "Perhatian",
        text: `Harap lengkapi: ${missing.join(", ")}`,
        icon: "warning",
        background: isDarkMode ? "#1e293b" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      Object.entries(form).forEach(([key, value]) => {
        if (key === "harga") {
          formData.append(key, parseFloat(value));
        } else {
          formData.append(key, value);
        }
      });

      if (editingTiket) {
        await axios.put(
          `http://localhost:8000/kelas/tiket-kategori/${editingTiket.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        Swal.fire({
          title: "Berhasil!",
          text: "Kategori tiket berhasil diperbarui",
          icon: "success",
          background: isDarkMode ? "#1e293b" : "#ffffff",
          color: isDarkMode ? "#f8fafc" : "#1f2937",
        });
      } else {
        await axios.post(
          `http://localhost:8000/kelas/${kelasId}/tiket-kategori`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        Swal.fire({
          title: "Berhasil!",
          text: "Kategori tiket berhasil ditambahkan",
          icon: "success",
          background: isDarkMode ? "#1e293b" : "#ffffff",
          color: isDarkMode ? "#f8fafc" : "#1f2937",
        });
      }

      // Reset form
      setForm({
        nama_kategori: "",
        deskripsi: "",
        harga: "",
        manfaat: "",
        is_populer: false,
      });
      setEditingTiket(null);
      setShowForm(false);
      
      // Refresh data setelah operasi berhasil
      refreshData();
      
    } catch (error) {
      console.error("Error saving tiket kategori:", error);
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan saat menyimpan data",
        icon: "error",
        background: isDarkMode ? "#1e293b" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    }
  };

  const handleEdit = (tiket) => {
    setEditingTiket(tiket);
    setForm({
      nama_kategori: tiket.nama_kategori,
      deskripsi: tiket.deskripsi,
      harga: tiket.harga,
      manfaat: tiket.manfaat,
      is_populer: tiket.is_populer ? true : false,
    });
    setShowForm(true);
  };

  const handleDelete = async (tiketId) => {
    const result = await Swal.fire({
      title: "Hapus Kategori Tiket",
      text: "Apakah Anda yakin ingin menghapus kategori tiket ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: isDarkMode ? "#1e293b" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#1f2937",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/kelas/tiket-kategori/${tiketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        title: "Berhasil!",
        text: "Kategori tiket berhasil dihapus",
        icon: "success",
        background: isDarkMode ? "#1e293b" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });

      // Refresh data setelah delete
      refreshData();
      
    } catch (error) {
      console.error("Error deleting tiket kategori:", error);
      Swal.fire({
        title: "Error",
        text: "Gagal menghapus kategori tiket",
        icon: "error",
        background: isDarkMode ? "#1e293b" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    }
  };

  const formatRupiah = (angka) => {
    if (!angka && angka !== 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
          }`}>
            <Ticket size={24} className={
              isDarkMode ? "text-purple-400" : "text-purple-600"
            } />
          </div>
          <h3 className={`text-xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}>
            Kategori Tiket
            <span className="text-sm font-normal ml-2 text-gray-500 dark:text-gray-400">
              ({tiketKategori.length} kategori)
            </span>
          </h3>
        </div>
        
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingTiket(null);
              setShowForm(!showForm);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDarkMode
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-purple-500 hover:bg-purple-600 text-white"
            }`}
          >
            <Plus size={18} />
            {showForm ? "Tutup Form" : "Tambah Kategori"}
          </motion.button>
        )}
      </div>

      {/* Form Tambah/Edit Tiket Kategori (Hanya untuk Admin) */}
      <AnimatePresence>
        {showForm && isAdmin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-xl p-6 mb-6 ${
              isDarkMode ? "bg-slate-800/50" : "bg-white"
            } border ${
              isDarkMode ? "border-purple-500/30" : "border-purple-200"
            }`}
          >
            <h4 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              {editingTiket ? "Edit Kategori Tiket" : "Tambah Kategori Tiket Baru"}
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}>
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    name="nama_kategori"
                    value={form.nama_kategori}
                    onChange={handleChange}
                    placeholder="Contoh: Reguler, VIP, Early Bird"
                    className={`w-full border rounded-lg px-4 py-2.5 ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}>
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    name="harga"
                    value={form.harga}
                    onChange={handleChange}
                    placeholder="Contoh: 225000"
                    min="0"
                    className={`w-full border rounded-lg px-4 py-2.5 ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}>
                  Deskripsi Singkat *
                </label>
                <input
                  type="text"
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleChange}
                  placeholder="Contoh: Akses ke semua sesi kelas"
                  className={`w-full border rounded-lg px-4 py-2.5 ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-gray-300 text-gray-700"
                    }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}>
                  Manfaat & Benefit (pisahkan dengan koma) *
                </label>
                <textarea
                  name="manfaat"
                  value={form.manfaat}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Contoh: Jersey Exclusive, Medali Finisher, Refreshment, Goodie Bag, Doorprize"
                  className={`w-full border rounded-lg px-4 py-2.5 ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                />
                <p className={`text-xs mt-1 ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}>
                  Pisahkan setiap benefit dengan koma
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_populer"
                  name="is_populer"
                  checked={form.is_populer}
                  onChange={handleChange}
                  className="h-4 w-4 rounded"
                />
                <label
                  htmlFor="is_populer"
                  className={`ml-2 flex items-center gap-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  <Star size={16} className="text-yellow-500" />
                  Tandai sebagai paket populer
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTiket(null);
                    setForm({
                      nama_kategori: "",
                      deskripsi: "",
                      harga: "",
                      manfaat: "",
                      is_populer: false,
                    });
                  }}
                  className={`px-6 py-2.5 rounded-lg ${
                    isDarkMode
                      ? "bg-slate-700 hover:bg-slate-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg"
                >
                  {editingTiket ? "Update" : "Simpan"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Tiket Kategori */}
      {tiketKategori.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${
          isDarkMode ? "bg-slate-800/50" : "bg-gray-50"
        }`}>
          <Ticket size={48} className={`mx-auto mb-4 ${
            isDarkMode ? "text-slate-600" : "text-gray-400"
          }`} />
          <p className={`mb-4 ${
            isDarkMode ? "text-slate-400" : "text-gray-600"
          }`}>
            {isAdmin 
              ? "Belum ada kategori tiket. Tambahkan kategori untuk menampilkannya di halaman ini."
              : "Tiket untuk kelas ini belum tersedia."
            }
          </p>
          {isAdmin && !showForm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
            >
              <Plus size={18} className="inline mr-2" />
              Tambah Kategori Tiket Pertama
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiketKategori.map((tiket, index) => (
            <motion.div
              key={tiket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-xl p-6 transition-all duration-300 ${
                tiket.is_populer
                  ? isDarkMode
                    ? "bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50"
                    : "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300"
                  : isDarkMode
                  ? "bg-slate-800/50 border border-slate-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              {/* Badge Populer */}
              {tiket.is_populer && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    isDarkMode
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  }`}>
                    <Star size={12} />
                    <span className="text-xs font-bold">POPULER</span>
                  </div>
                </div>
              )}
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag size={18} className={
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    } />
                    <h4 className={`text-lg font-bold ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}>
                      {tiket.nama_kategori}
                    </h4>
                  </div>
                  <p className={`mt-1 ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}>
                    {tiket.deskripsi}
                  </p>
                </div>
                
                {isAdmin && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(tiket)}
                      className={`p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-slate-700 hover:bg-slate-600"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <Edit3 size={16} className={
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      } />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(tiket.id)}
                      className={`p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-slate-700 hover:bg-slate-600"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <Trash2 size={16} className={
                        isDarkMode ? "text-red-400" : "text-red-600"
                      } />
                    </motion.button>
                  </div>
                )}
              </div>
              
              {/* Harga */}
              <div className="mb-6">
                <div className={`text-2xl font-bold ${
                  isDarkMode ? "text-emerald-400" : "text-emerald-600"
                }`}>
                  {formatRupiah(tiket.harga)}
                </div>
                {!isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full mt-4 py-3 rounded-lg font-semibold ${
                      isDarkMode
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    } text-white`}
                  >
                    Daftar Sekarang
                  </motion.button>
                )}
              </div>
              
              {/* Benefits */}
              <div>
                <h5 className={`text-sm font-semibold mb-3 ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}>
                  Benefit yang didapatkan:
                </h5>
                <ul className="space-y-2">
                  {tiket.manfaat && tiket.manfaat.split(',').map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className={`mt-0.5 flex-shrink-0 ${
                        isDarkMode ? "text-green-400" : "text-green-500"
                      }`} />
                      <span className={`text-sm ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}>
                        {benefit.trim()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
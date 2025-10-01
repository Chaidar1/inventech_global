// HomeUser.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Clock, FileText } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function HomeUser() {
  const navigate = useNavigate();

  // Dummy Ringkasan
  const ringkasan = [
    { title: "Barang Dipinjam", value: 2, icon: <Package size={24} />, color: "bg-orange-100 text-orange-600" },
    { title: "Menunggu Verifikasi", value: 1, icon: <Clock size={24} />, color: "bg-yellow-100 text-yellow-600" },
    { title: "Total Peminjaman", value: 10, icon: <FileText size={24} />, color: "bg-orange-100 text-orange-600" },
  ];

  // Dummy Barang Sering Dipinjam
  const barangSering = [
    { nama: "Laptop", kategori: "Elektronik", stok: "Tersedia", status: "green" },
    { nama: "Gitar", kategori: "Alat Musik", stok: "Tersedia", status: "green" },
    { nama: "Kalkulator", kategori: "ATK", stok: "Kosong", status: "red" },
    { nama: "Vas Bunga", kategori: "Aksesoris", stok: "Tersedia", status: "green" },
    { nama: "Gendang", kategori: "Alat Musik", stok: "Kosong", status: "red" },
  ];

  // Dummy Riwayat
  const riwayat = [
    { nama: "Proyektor", tanggal: "07/08/2025 - 15/08/2025", status: "Menunggu" },
    { nama: "Laptop", tanggal: "01/08/2025 - 14/08/2025", status: "Disetujui" },
    { nama: "Kalkulator", tanggal: "03/07/2025 - 09/08/2025", status: "Selesai" },
    { nama: "Vas Bunga", tanggal: "20/07/2025 - 06/08/2025", status: "Selesai" },
    { nama: "Gendang", tanggal: "25/07/2025 - 29/07/2025", status: "Selesai" },
  ];

  // Dummy Pie Data
  const pieData = [
    { name: "Elektronik", value: 321.46, color: "#2196F3" },
    { name: "Alat Musik", value: 386.84, color: "#FF9913" },
    { name: "Aksesoris", value: 350.78, color: "#9C27B0" },
    { name: "ATK", value: 332.07, color: "#4CAF50" },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        className="min-h-screen flex items-center justify-center px-6"
        style={{
          background:
            "linear-gradient(to bottom, #fff 0%, #fff 60%, #FFF1E0 100%)",
        }}
      >
        <motion.div
          className="text-center max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Logo */}
          <motion.img
            src="/Logo PT.png"
            alt="Logo Inventaris"
            className="mx-auto mb-6 w-24 h-24 object-contain"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          />

          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-800 mb-6 leading-tight">
            Sistem <span className="text-[#FF9913]">Inventaris Barang</span>
          </h1>

          <p className="text-gray-600 text-lg sm:text-xl mb-10 leading-relaxed">
            Aplikasi modern untuk mengelola inventaris sekolah secara efisien.
            Kelola{" "}
            <span className="font-semibold text-gray-800">alat olahraga</span>,{" "}
            <span className="font-semibold text-gray-800">peralatan seni</span>,
            hingga{" "}
            <span className="font-semibold text-gray-800">
              fasilitas akademik
            </span>{" "}
            dalam satu sistem terintegrasi.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/barang")}
            className="bg-[#FF9913] hover:bg-[#e68a12] text-white font-semibold px-8 py-3 rounded-full shadow-lg transition duration-300"
          >
            📦 Mulai Pinjam Barang
          </motion.button>
        </motion.div>
      </section>

      {/* Fitur Utama */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">✨ Fitur Utama</h2>
          <p className="text-gray-600 mt-3">
            Fitur khusus untuk memudahkan pengguna dalam peminjaman barang.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-[#FF9913] mb-2">📂 Pinjam Barang</h3>
            <p className="text-sm text-gray-600">
              Ajukan peminjaman barang sesuai kebutuhan dengan mudah.
            </p>
          </div>
          <div className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-[#FF9913] mb-2">🔎 Cek Status</h3>
            <p className="text-sm text-gray-600">
              Pantau status peminjamanmu: menunggu, disetujui, atau selesai.
            </p>
          </div>
          <div className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-[#FF9913] mb-2">📊 Riwayat</h3>
            <p className="text-sm text-gray-600">
              Lihat riwayat semua peminjaman barang yang pernah kamu lakukan.
            </p>
          </div>
        </div>
      </section>

      {/* Ringkasan Aktivitas */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            📌 Ringkasan Aktivitasmu
          </h2>

          {/* Ringkasan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {ringkasan.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition"
              >
                <div className={`p-3 rounded-full mb-3 ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-700">{item.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Barang Sering Dipinjam */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Barang yang Sering Kamu Pinjam
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {barangSering.map((b, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mb-2" />
                  <h3 className="font-semibold text-gray-700">{b.nama}</h3>
                  <p className="text-sm text-gray-500">{b.kategori}</p>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      b.status === "green" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {b.status === "green" ? "✔ Stok Tersedia" : "✘ Stok Kosong"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Riwayat + Pie Chart */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Riwayat */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Riwayat Peminjaman Terbaru
              </h2>
              <ul className="bg-white shadow-md rounded-xl divide-y">
                {riwayat.map((r, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-700">{r.nama}</p>
                      <p className="text-sm text-gray-500">{r.tanggal}</p>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        r.status === "Menunggu"
                          ? "text-blue-500"
                          : r.status === "Disetujui"
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    >
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pie Chart */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Peminjaman Berdasarkan Kategori
              </h2>
              <div className="bg-white shadow-md rounded-xl p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

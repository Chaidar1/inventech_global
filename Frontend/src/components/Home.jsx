import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Home() {
  const navigate = useNavigate();

  // Dummy Data Line Chart
  const lineData = [
    { bulan: "Jan", Olahraga: 30, Akademik: 20, Kesenian: 10 },
    { bulan: "Feb", Olahraga: 45, Akademik: 25, Kesenian: 15 },
    { bulan: "Mar", Olahraga: 20, Akademik: 40, Kesenian: 30 },
    { bulan: "Apr", Olahraga: 50, Akademik: 35, Kesenian: 25 },
    { bulan: "Mei", Olahraga: 60, Akademik: 50, Kesenian: 20 },
  ];

  // Dummy Data Pie Chart
  const pieData = [
    { name: "Olahraga", value: 120 },
    { name: "Akademik", value: 80 },
    { name: "Kesenian", value: 50 },
  ];

  const COLORS = ["#FF9913", "#4CAF50", "#2196F3"];

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
          {/* Logo di Hero Section */}
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
            📦 Lihat Daftar Inventaris
          </motion.button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">✨ Fitur Utama</h2>
          <p className="text-gray-600 mt-3">
            Semua yang Anda butuhkan untuk manajemen inventaris yang efisien.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-[#FF9913] mb-2">
              📂 Manajemen Data
            </h3>
            <p className="text-sm text-gray-600">
              Data barang tersimpan rapi, mudah dicari, dan dikelompokkan
              berdasarkan kategori.
            </p>
          </div>

          <div className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-[#FF9913] mb-2">
              🔎 Pencarian Cepat
            </h3>
            <p className="text-sm text-gray-600">
              Temukan barang dengan cepat menggunakan fitur filter dan pencarian
              real-time.
            </p>
          </div>

          <div className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-[#FF9913] mb-2">📊 Laporan</h3>
            <p className="text-sm text-gray-600">
              Mendukung pelaporan stok dan riwayat pemakaian barang secara
              transparan.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Section (Preview Statistik) */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Judul */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              📈 Statistik Inventaris (Preview)
            </h2>
            <p className="text-gray-600 mt-3">
              Grafik dan laporan aktivitas inventaris ditampilkan dengan data
              dummy.{" "}
              <span className="italic text-gray-500">
                (Nantinya akan terhubung ke data real)
              </span>
            </p>
          </div>

          {/* Layout 2 baris: Line Chart & Ringkasan */}
          <div className="space-y-10">
            {/* Line Chart */}
            <div className="bg-white shadow-md rounded-xl p-6 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Olahraga"
                    stroke="#FF9913"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="Akademik"
                    stroke="#4CAF50"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="Kesenian"
                    stroke="#2196F3"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Donut + Table */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Donut Chart */}
              <div className="bg-white shadow-md rounded-xl p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="bg-white shadow-md rounded-xl p-6 h-80 overflow-auto">
                <h3 className="text-lg font-bold text-gray-700 mb-4">
                  📌 Top Barang / Kategori Paling Sering Dipinjam
                </h3>
                <table className="w-full text-sm text-left border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 border">No</th>
                      <th className="px-3 py-2 border">Kategori</th>
                      <th className="px-3 py-2 border">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pieData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 border">{idx + 1}</td>
                        <td className="px-3 py-2 border">{item.name}</td>
                        <td className="px-3 py-2 border">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

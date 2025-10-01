// Riwayat.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Check, X, Clock, RotateCcw, ShieldCheck, Package, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function Riwayat() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/riwayat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);

      // filter data yang Disetujui untuk halaman Kembalikan
      const approved = res.data.filter((item) => item.status === "Disetujui");
      localStorage.setItem("approvedItems", JSON.stringify(approved));
    } catch (err) {
      console.error("Gagal ambil data riwayat:", err);
    }
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      (item.unit?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.keperluan?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.nama_barang?.toLowerCase() || "").includes(search.toLowerCase());

    const matchStatus = filterStatus ? item.status === filterStatus : true;

    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Menunggu":
        return { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock };
      case "Disetujui":
        return { bg: "bg-green-100", text: "text-green-700", icon: Check };
      case "Ditolak":
        return { bg: "bg-red-100", text: "text-red-700", icon: X };
      case "Selesai":
        return { bg: "bg-blue-100", text: "text-blue-700", icon: RotateCcw };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", icon: Clock };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDisplayBarang = (item) => {
    if (item.unit) {
      return item.unit;
    }
    return item.nama_barang || "Barang";
  };

  return (
    <div className="p-6 relative min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="flex items-center gap-2 text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          <ShieldCheck className="text-orange-500" size={36} />
          Riwayat Peminjaman
        </h1>
        <div className="mt-1 w-28 h-1 bg-orange-500 rounded" />
        <p className="text-gray-600 mt-2">Lihat riwayat peminjaman barang Anda</p>
      </motion.div>

      {/* Search, Filter & Button Kembalikan */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari kode unit, barang, atau keperluan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg pl-10 pr-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Filter Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Ditolak">Ditolak</option>
          <option value="Selesai">Selesai</option>
        </select>

        {/* Button Kembalikan (paling kanan) */}
        <div className="flex justify-end w-full md:w-auto ml-auto">
          <button
            onClick={() => navigate("/kembalikan")}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2 rounded-lg shadow-md transition"
          >
            <RotateCcw size={18} />
            Kembalikan
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-orange-500 text-white text-center">
            <tr>
              <th className="px-4 py-3">Kode Unit</th>
              <th className="px-4 py-3">Nama Barang</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Pengajuan</th>
              <th className="px-4 py-3">Dikembalikan</th>
              <th className="px-4 py-3">Keperluan</th>
              <th className="px-4 py-3">Tanggal Verifikasi</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => {
              const StatusBadge = getStatusBadge(item.status).icon;
              const statusClass = getStatusBadge(item.status);

              return (
                <tr
                  key={item.id}
                  className={`text-center ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Package size={16} className="text-orange-500" />
                      <span className="font-mono font-bold text-orange-500">
                        {getDisplayBarang(item)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {item.nama_barang}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.kategori_barang || "Kategori"}
                  </td>
                  <td className="px-4 py-3">{formatDate(item.tanggal_pinjam)}</td>
                  <td className="px-4 py-3">{formatDate(item.tanggal_kembali)}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={item.keperluan}>
                    {item.keperluan}
                  </td>
                  <td className="px-4 py-3">
                    {item.tanggal_verifikasi ? formatDate(item.tanggal_verifikasi) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 ${statusClass.bg} ${statusClass.text} px-3 py-1 rounded-full text-sm font-medium`}
                    >
                      <StatusBadge size={14} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/detail-peminjaman/${item.id}`, { state: { data: item } })}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500 italic">
                  <div className="flex flex-col items-center justify-center">
                    <Eye size={48} className="text-gray-300 mb-2" />
                    <p>Belum ada riwayat peminjaman</p>
                    <p className="text-sm">Ajukan peminjaman barang terlebih dahulu</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

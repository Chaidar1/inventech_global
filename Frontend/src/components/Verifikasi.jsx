import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Trash2,
  Eye,
  Check,
  X,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Fungsi normalisasi status untuk handle berbagai typo
const normalizeStatus = (status) => {
  if (!status) return "Unknown";
  
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus.includes("menunggu") || lowerStatus.includes("memunggu") || lowerStatus.includes("memanggu")) {
    if (lowerStatus.includes("pengembalian") || lowerStatus.includes("verifikasi")) {
      return "Menunggu Verifikasi Pengembalian";
    }
    return "Menunggu";
  }
  
  if (lowerStatus.includes("disetujui") || lowerStatus.includes("disetujul")) {
    return "Disetujui";
  }
  
  if (lowerStatus.includes("ditolak")) {
    return "Ditolak";
  }
  
  if (lowerStatus.includes("selesai")) {
    return "Selesai";
  }
  
  return status; // Return as-is jika tidak dikenali
};

export default function Verifikasi() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/verifikasi", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // DEBUG: Log semua data yang diterima
      console.log("=== DATA DARI BACKEND ===");
      res.data.forEach((item, index) => {
        const normalized = normalizeStatus(item.status);
        console.log(`Item ${index}:`, {
          id: item.id,
          status: item.status,
          normalized: normalized,
          dikembalikan: item.dikembalikan,
          nama_barang: item.nama_barang
        });
      });
      
      setData(res.data);
    } catch (err) {
      console.error("Gagal ambil data verifikasi:", err);
      MySwal.fire({
        icon: 'error',
        title: 'Gagal memuat data',
        text: 'Silakan refresh halaman',
        confirmButtonColor: '#f97316',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update status peminjaman
  const updateStatus = async (id, status, barang_id, unit_kode) => {
    try {
      console.log(`Updating status: ${id} -> ${status}`);
      
      await axios.put(
        `http://localhost:8000/verifikasi/${id}`,
        { status, barang_id, unit_kode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchData(); // Refresh data

      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title:
          status === "Disetujui"
            ? "Peminjaman disetujui!"
            : status === "Ditolak"
            ? "Peminjaman ditolak!"
            : "Status peminjaman ditandai selesai!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Gagal update status:", err);
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Terjadi kesalahan saat update status!",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const deleteData = async (id) => {
    const result = await MySwal.fire({
      title: "Yakin hapus data ini?",
      text: "Data yang sudah dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8000/peminjaman/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();

      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Data berhasil dihapus!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Gagal hapus data:", err);
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal menghapus data!",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const filteredData = data.filter((item) => {
    const normalizedStatus = normalizeStatus(item.status);
    const matchSearch =
      (item.nama?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.nama_barang?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.keperluan?.toLowerCase() || "").includes(search.toLowerCase());

    const matchStatus = filterStatus ? normalizedStatus === filterStatus : true;

    return matchSearch && matchStatus;
  });

  // Fungsi batasi keperluan max 10 kata
  const truncateKeperluan = (text, maxWords = 10) => {
    if (!text) return "-";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  // Fungsi untuk render status
  const renderStatus = (item) => {
    const normalizedStatus = normalizeStatus(item.status);
    const isReturned = item.dikembalikan || item.dikembailikan; // Handle typo dikembailikan

    console.log(`Rendering:`, {
      original: item.status,
      normalized: normalizedStatus,
      returned: isReturned
    });

    return (
      <td className="px-4 py-2">
        {/* Tombol untuk status Menunggu */}
        {normalizedStatus === "Menunggu" && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => updateStatus(item.id, "Ditolak", item.barang_id, item.unit)}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition duration-200"
            >
              <X size={16} /> Tolak
            </button>
            <button
              onClick={() => updateStatus(item.id, "Disetujui", item.barang_id, item.unit)}
              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition duration-200"
            >
              <Check size={16} /> Setuju
            </button>
          </div>
        )}

        {/* Status Disetujui - belum dikembalikan */}
        {normalizedStatus === "Disetujui" && !isReturned && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            Disetujui
          </span>
        )}

        {/* Status Disetujui - sudah dikembalikan */}
        {normalizedStatus === "Disetujui" && isReturned && (
          <div className="flex flex-col gap-2 items-center">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Disetujui - Dikembalikan
            </span>
            <button
              onClick={() => updateStatus(item.id, "Selesai", item.barang_id, item.unit)}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition duration-200"
            >
              <RotateCcw size={16} /> Tandai Selesai
            </button>
          </div>
        )}

        {/* Status Menunggu Verifikasi Pengembalian */}
        {normalizedStatus === "Menunggu Verifikasi Pengembalian" && (
          <div className="flex flex-col gap-2 items-center">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
              Menunggu Verifikasi
            </span>
            <button
              onClick={() => updateStatus(item.id, "Selesai", item.barang_id, item.unit)}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition duration-200"
            >
              <RotateCcw size={16} /> Verifikasi
            </button>
          </div>
        )}

        {/* Status Ditolak */}
        {normalizedStatus === "Ditolak" && (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
            Ditolak
          </span>
        )}

        {/* Status Selesai */}
        {normalizedStatus === "Selesai" && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            Selesai
          </span>
        )}

        {/* Fallback untuk status tidak dikenal */}
        {!["Menunggu", "Disetujui", "Ditolak", "Selesai", "Menunggu Verifikasi Pengembalian"].includes(normalizedStatus) && (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {item.status}
          </span>
        )}
      </td>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="flex items-center gap-2 text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            <ShieldCheck className="text-orange-500" size={36} />
            Verifikasi Peminjaman
          </h1>
          
        </div>
        <div className="mt-1 w-28 h-1 bg-orange-500 rounded" />
      </motion.div>

      {/* Search & Filter */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari user, barang, atau keperluan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg pl-10 pr-3 py-2 w-full focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-orange-400 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Ditolak">Ditolak</option>
          <option value="Selesai">Selesai</option>
          <option value="Menunggu Verifikasi Pengembalian">Menunggu Verifikasi</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-orange-500 text-white text-center">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Pengajuan</th>
              <th className="px-4 py-3">Dikembalikan</th>
              <th className="px-4 py-3">Nama Barang</th>
              <th className="px-4 py-3">Jumlah</th>
              <th className="px-4 py-3">Keperluan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Detail</th>
              <th className="px-4 py-3">Hapus</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr
                key={item.id}
                className={`text-center ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-orange-50`}
              >
                <td className="px-4 py-2">{item.nama || "User"}</td>
                <td className="px-4 py-2">{item.tanggal_pinjam || "-"}</td>
                <td className="px-4 py-2">{item.tanggal_kembali || "-"}</td>
                <td className="px-4 py-2">{item.nama_barang || "-"}</td>
                <td className="px-4 py-2">{item.jumlah || "0"}</td>
                <td className="px-4 py-2">
                  {truncateKeperluan(item.keperluan, 10)}
                </td>

                {/* Render Status */}
                {renderStatus(item)}

                {/* Detail */}
                <td className="px-4 py-2">
                  <button
                    onClick={() =>
                      navigate(`/detail-verifikasi/${item.id}`, {
                        state: { data: item },
                      })
                    }
                    className="text-orange-500 hover:text-orange-600 transition duration-200"
                  >
                    <Eye size={20} />
                  </button>
                </td>

                {/* Hapus */}
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteData(item.id)}
                    className="text-red-500 hover:text-red-600 transition duration-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan="9"
                  className="p-6 text-center text-gray-500 italic"
                >
                  {loading ? "Memuat data..." : "Tidak ada data peminjaman"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
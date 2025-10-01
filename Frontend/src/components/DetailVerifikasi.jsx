import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function DetailVerifikasi() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [pengembalian, setPengembalian] = useState(null);

  const data = location.state?.data;

  useEffect(() => {
    if (data?.pengembalian) {
      setPengembalian(data.pengembalian);
    }
  }, [data]);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/verifikasi");
    }, 400);
  };

  const handleTandaiSelesai = async (id) => {
    try {
      await fetch(`http://localhost:8000/verifikasi/${id}/selesai`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      alert("Peminjaman sudah ditandai selesai.");
      handleExit();
    } catch (err) {
      console.error(err);
      alert("Gagal menandai selesai.");
    }
  };

  if (!data) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <p className="text-gray-400 text-lg font-medium">Data tidak ditemukan.</p>
      </motion.div>
    );
  }

  const tableRows = [
    ["User", data.nama],
    ["Pengajuan", data.tanggal_pinjam],
    ["Dikembalikan", data.tanggal_kembali],
    ["Nama Barang", data.nama_barang],
    ["Jumlah", data.jumlah],
    ["Keperluan", data.keperluan],
    ["Status", data.status],
  ];

  const statusClasses = {
    Disetujui: "bg-green-100 text-green-800",
    Ditolak: "bg-red-100 text-red-800",
    Selesai: "bg-blue-100 text-blue-800",
    Pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0, x: 50 }}
      animate={isExiting ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <button
              onClick={handleExit}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold drop-shadow">Detail Verifikasi</h1>
          </motion.div>
          <p className="text-orange-100 mb-6 font-medium text-lg">
            Informasi lengkap pengajuan peminjaman.
          </p>
        </div>
      </div>

      {/* Konten */}
      <motion.div
        className="max-w-5xl mx-auto px-6 -mt-8 relative z-10 space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
{/* Card Detail */}
<div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200">
  <table className="w-full border-collapse">
    <thead className="bg-orange-100">
      <tr>
        <th className="text-left py-3 px-4 rounded-tl-lg">Label</th>
        <th className="text-left py-3 px-4 rounded-tr-lg">Detail</th>
      </tr>
    </thead>
    <tbody>
      {tableRows.map(([label, value]) => (
        <tr
          key={label}
          className="border-b last:border-none bg-orange-50 hover:bg-orange-100 transition shadow-sm"
        >
          <td className="font-semibold py-3 px-4 w-40">{label}</td>
          <td className="py-3 px-4">
            {label === "Status" ? (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[value]}`}
              >
                {value}
              </span>
            ) : (
              value
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Aksi Admin */}
  {data.status === "Disetujui" && (
    <div className="mt-6 flex gap-3">
      {data.dikembalikan ? (
        <button
          onClick={() => handleTandaiSelesai(data.id)}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
        >
          Tandai Selesai
        </button>
      ) : (
        <span className="inline-block px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
          Belum dikembalikan
        </span>
      )}
    </div>
  )}
</div>

{/* Data Pengembalian */}
{pengembalian && (
  <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-orange-200">
    <h2 className="text-xl font-semibold text-orange-600 mb-4">
      Data Pengembalian
    </h2>
    <table className="w-full border-collapse">
      <thead className="bg-orange-100">
        <tr>
          <th className="text-left py-3 px-4 rounded-tl-lg">Label</th>
          <th className="text-left py-3 px-4 rounded-tr-lg">Detail</th>
        </tr>
      </thead>
      <tbody>
        {[
          ["Kondisi Barang", pengembalian.kondisi_barang],
          ["Catatan", pengembalian.catatan || "-"],
          ["Tanggal Pengembalian", pengembalian.tanggal_pengembalian],
        ].map(([label, value]) => (
          <tr
            key={label}
            className="border-b last:border-none bg-orange-50 hover:bg-orange-100 transition shadow-sm"
          >
            <td className="font-semibold py-3 px-4 w-48">{label}</td>
            <td className="py-3 px-4">{value}</td>
          </tr>
        ))}

        {/* Foto */}
        {pengembalian.foto && (
          <tr>
            <td colSpan={2} className="py-6 px-4 bg-orange-50">
              <div className="flex justify-center items-center">
                <img
                  src={`http://localhost:8000/${pengembalian.foto}`}
                  alt="Bukti Pengembalian"
                  className="rounded-lg shadow-md max-h-80 object-contain border"
                />
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}



      </motion.div>
    </motion.div>
  );
}

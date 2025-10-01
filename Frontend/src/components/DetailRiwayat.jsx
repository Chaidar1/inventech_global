import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

export default function DetailRiwayat() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  // Data pinjaman dikirim lewat navigate state
  const data = location.state?.data;

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/riwayat");
    }, 400);
  };

  if (!data) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <p className="text-gray-500">Data tidak ditemukan.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-100"
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
            <h1 className="text-3xl font-bold drop-shadow">
              Detail Riwayat
            </h1>
          </motion.div>
          <p className="text-orange-100 mb-6">
            Informasi lengkap pengajuan peminjaman.
          </p>
        </div>
      </div>

      {/* Konten */}
      <motion.div
        className="max-w-5xl mx-auto px-6 -mt-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white rounded-xl shadow-lg p-6">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="font-semibold text-gray-700 py-3 w-40">Pengguna</td>
                <td className="py-3">{data.nama}</td>
              </tr>
              <tr className="border-b">
                <td className="font-semibold text-gray-700 py-3">Pengajuan</td>
                <td className="py-3">{data.tanggal_pinjam}</td>
              </tr>
              <tr className="border-b">
                <td className="font-semibold text-gray-700 py-3">Dikembalikan</td>
                <td className="py-3">{data.tanggal_kembali}</td>
              </tr>
              <tr className="border-b">
                <td className="font-semibold text-gray-700 py-3">Nama Barang</td>
                <td className="py-3">{data.nama_barang}</td>
              </tr>
              <tr className="border-b">
                <td className="font-semibold text-gray-700 py-3">Jumlah</td>
                <td className="py-3">{data.jumlah}</td>
              </tr>
              <tr className="border-b align-top">
                <td className="font-semibold text-gray-700 py-3">Keperluan</td>
                <td className="py-3 whitespace-pre-wrap">{data.keperluan}</td>
              </tr>
              <tr>
                <td className="font-semibold text-gray-700 py-3">Status</td>
                <td className="py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      data.status === "Disetujui"
                        ? "bg-green-100 text-green-800"
                        : data.status === "Ditolak"
                        ? "bg-red-100 text-red-800"
                        : data.status === "Selesai"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {data.status}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

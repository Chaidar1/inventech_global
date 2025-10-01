import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Calendar,
  FileText,
  ClipboardCheck,
  Image as ImageIcon,
  Package,
} from "lucide-react";

export default function KembalikanBarang() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [peminjamanList, setPeminjamanList] = useState([]);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState("");
  const [tanggalKembali, setTanggalKembali] = useState("");
  const [kondisi, setKondisi] = useState("Baik");
  const [catatan, setCatatan] = useState("");
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fungsi format tanggal ke DD/MM/YYYY
  const formatTanggal = (tgl) => {
    if (!tgl) return "";
    const d = new Date(tgl);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Ambil daftar barang approved dari localStorage (Riwayat.jsx sudah nyimpen)
  useEffect(() => {
    const approved = JSON.parse(localStorage.getItem("approvedItems")) || [];
    setPeminjamanList(approved);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPeminjaman) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Barang",
        text: "Anda belum memilih barang yang akan dikembalikan.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("tanggal_kembali", tanggalKembali);
      formData.append("kondisi", kondisi);
      formData.append("catatan", catatan);
      formData.append("status", "Menunggu Verifikasi");
      if (foto) formData.append("foto", foto);

      const response = await axios.put(
        `http://localhost:8000/peminjaman/${selectedPeminjaman}/kembalikan`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: response.data.message || "Pengembalian berhasil dicatat",
      });

      navigate("/riwayat");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error.response?.data?.detail ||
          "Terjadi kesalahan saat mencatat pengembalian",
      });
    }
  };

  return (
    <div className="flex justify-center items-center p-6 bg-gray-200 min-h-screen">
      <div className="bg-gradient-to-b from-orange-100 to-white w-full max-w-2xl rounded-2xl shadow-xl p-8 border border-orange-200">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 border-b pb-3 border-orange-300">
          <ClipboardCheck className="text-orange-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">
            Form Pengembalian Barang
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pilih Barang Disetujui */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Pilih Barang Disetujui
            </label>
            <div className="relative">
              <select
                value={selectedPeminjaman}
                onChange={(e) => setSelectedPeminjaman(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              >
                <option value="">
                  {peminjamanList.length === 0
                    ? "Tidak ada barang yang disetujui"
                    : "-- Pilih Barang --"}
                </option>
                {peminjamanList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_peminjam} - {p.nama_barang} ({p.unit}) |{" "}
                    {formatTanggal(p.tanggal_pinjam)}
                  </option>
                ))}
              </select>
              <Package
                className="absolute right-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Tanggal Kembali */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Tanggal Kembali
            </label>
            <div className="relative">
              <input
                type="date"
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
              <Calendar
                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>
          </div>

          {/* Kondisi Barang */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Kondisi Barang
            </label>
            <select
              value={kondisi}
              onChange={(e) => setKondisi(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
              <option value="Hilang">Hilang</option>
            </select>
          </div>

          {/* Catatan */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Catatan
            </label>
            <div className="relative">
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows="3"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Tambahkan catatan jika diperlukan..."
              ></textarea>
              <FileText
                className="absolute right-3 top-3 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Foto Bukti Pengembalian
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer bg-gray-100 px-4 py-2 rounded-lg shadow hover:bg-gray-200 transition">
                <ImageIcon className="text-gray-600 mr-2" size={20} />
                <span className="text-sm font-medium text-gray-700">
                  Pilih Foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-20 w-20 rounded-lg border object-cover"
                />
              )}
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={peminjamanList.length === 0}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition duration-200 shadow-md ${
              peminjamanList.length === 0
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {peminjamanList.length === 0
              ? "Tidak Ada Barang untuk Dikembalikan"
              : "Simpan Pengembalian"}
          </button>
        </form>
      </div>
    </div>
  );
}

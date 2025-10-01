// TambahKategori.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function TambahKategori() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama_kategori: "",
    nama_barang: "",
    stok: 1,
    kondisi_barang: "Baik",
    tahun_perolehan: 2025,
    deskripsi: "",
    foto: null,
  });

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "foto") {
      setForm((prev) => ({ ...prev, foto: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama_kategori || !form.nama_barang || !form.stok) {
      Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Kategori, Nama Barang, dan Stok wajib diisi!",
        confirmButtonColor: "#FF9913",
      });
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("nama_kategori", form.nama_kategori);
    formData.append("nama_barang", form.nama_barang);
    formData.append("stok", form.stok);
    formData.append("kondisi_barang", form.kondisi_barang);
    formData.append("tahun_perolehan", form.tahun_perolehan);
    formData.append("deskripsi", form.deskripsi);
    if (form.foto) formData.append("foto", form.foto);

    try {
      await axios.post("http://localhost:8000/kategori", formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Kategori "${form.nama_kategori}" dan barang pertamanya berhasil ditambahkan.`,
        confirmButtonColor: "#FF9913",
      }).then(() => navigate("/barang"));
    } catch (err) {
      console.error("Tambah kategori & barang gagal:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text:
          err.response?.data?.detail ||
          "Terjadi kesalahan saat menambahkan kategori & barang.",
        confirmButtonColor: "#FF9913",
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative p-4"
      style={{ backgroundImage: "url('/add.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="relative z-10 bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-500">
          Tambah Kategori & Barang Pertama
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 text-gray-800"
        >
          {/* Nama Kategori */}
          <div className="col-span-2">
            <label className="block mb-1 font-semibold text-gray-700">
              Nama Kategori
            </label>
            <input
              name="nama_kategori"
              value={form.nama_kategori}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400"
              placeholder="Nama Kategori"
            />
          </div>

          {/* Nama Barang */}
          <div className="col-span-2">
            <label className="block mb-1 font-semibold text-gray-700">
              Nama Barang Pertama
            </label>
            <input
              name="nama_barang"
              value={form.nama_barang}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400"
              placeholder="Nama Barang Pertama"
            />
          </div>

          {/* Stok */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Stok</label>
            <input
              type="number"
              name="stok"
              value={form.stok}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400"
              placeholder="Jumlah Stok"
              min="1"
            />
          </div>

          {/* Kondisi Barang */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Kondisi Barang
            </label>
            <select
              name="kondisi_barang"
              value={form.kondisi_barang}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400"
            >
              <option value="Baik">Baik</option>
              <option value="Kurang Baik">Kurang Baik</option>
              <option value="Rusak">Rusak</option>
            </select>
          </div>

          {/* Tahun Perolehan */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Tahun Perolehan
            </label>
            <input
              type="number"
              name="tahun_perolehan"
              value={form.tahun_perolehan}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400"
              min="1900"
              max="2100"
            />
          </div>

          {/* Deskripsi */}
          <div className="col-span-2">
            <label className="block mb-1 font-semibold text-gray-700">
              Deskripsi Barang
            </label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400"
              rows={3}
            />
          </div>

          {/* Upload Foto */}
          <div className="col-span-2">
            <label className="block mb-1 font-semibold text-gray-700">
              Foto Barang Pertama
            </label>
            <input
              type="file"
              name="foto"
              accept="image/*"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Tombol */}
          <div className="col-span-2 relative">
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 rounded-xl transition duration-300 shadow-lg hover:scale-105"
            >
              Simpan
            </button>

            {/* Tombol Close "X" */}
            <button
              type="button"
              onClick={() => navigate("/barang")}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white 
                       w-10 h-10 flex items-center justify-center 
                       rounded-xl shadow-lg transition duration-300 text-2xl font-bold"
              title="Kembali ke daftar barang"
            >
              ×
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

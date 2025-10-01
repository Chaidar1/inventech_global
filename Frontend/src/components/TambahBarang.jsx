import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function TambahBarang() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    nama_barang: "",
    kategori: "",
    tahun_perolehan: "2025",
    stok: "",
    deskripsi: "",
    kondisi_barang: "",
  });

  const [foto, setFoto] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);

  // Ambil daftar kategori dari backend
  const fetchKategori = async () => {
    try {
      const res = await axios.get("http://localhost:8000/kategori", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKategoriList(res.data);
    } catch (err) {
      console.error("Gagal mengambil kategori", err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Tidak dapat mengambil daftar kategori.",
        confirmButtonColor: "#FF9913",
      });
    }
  };

  useEffect(() => {
    fetchKategori();

    // Listener custom event untuk refresh kategori
    const handleRefresh = () => fetchKategori();
    window.addEventListener("refreshKategori", handleRefresh);

    return () => window.removeEventListener("refreshKategori", handleRefresh);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nama_barang, kategori, tahun_perolehan, stok, deskripsi, kondisi_barang } = form;

    if (!nama_barang || !kategori || !tahun_perolehan || !stok || !deskripsi || !kondisi_barang) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap!",
        text: "⚠️ Semua data harus diisi.",
        confirmButtonColor: "#FF9913",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nama_barang", nama_barang);
      formData.append("kategori", kategori);
      formData.append("tahun_perolehan", tahun_perolehan);
      formData.append("stok", stok);
      formData.append("deskripsi", deskripsi);
      formData.append("kondisi_barang", kondisi_barang);
      if (foto) formData.append("foto", foto);

      await axios.post("http://localhost:8000/barang", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "✅ Data Barang berhasil ditambahkan.",
        confirmButtonColor: "#FF9913",
      }).then(() => navigate("/barang"));
    } catch (err) {
      console.error("Gagal menambahkan data barang", err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "🚫 Terjadi kesalahan saat menyimpan data.",
        confirmButtonColor: "#FF9913",
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative p-4"
      style={{ backgroundImage: "url('/perpus.jpeg')" }}
    >
      {/* Overlay gelap di background */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="relative z-10 bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-[#FF9913] mb-6 text-center">
          Tambah Barang
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 text-gray-800">
          {/* Nama Barang */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Nama Barang</label>
            <input
              name="nama_barang"
              value={form.nama_barang}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9913]"
              placeholder="Masukkan nama barang"
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9913]"
              placeholder="Masukkan jumlah stok"
            />
          </div>

          {/* Kondisi Barang */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Kondisi Barang</label>
            <select
              name="kondisi_barang"
              value={form.kondisi_barang}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9913]"
            >
              <option value="">-- Pilih Kondisi --</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          {/* Kategori */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Kategori</label>
            <select
              name="kategori"
              value={form.kategori}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9913]"
            >
              <option value="">-- Pilih Kategori --</option>
              {kategoriList.map((k, i) => {
                const namaKategori = typeof k === "string" ? k : k.nama || k.nama_kategori;
                return (
                  <option key={i} value={namaKategori}>
                    {namaKategori}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Tahun Perolehan */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Tahun Perolehan</label>
            <input
              type="number"
              name="tahun_perolehan"
              value={form.tahun_perolehan}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9913]"
              placeholder="Masukkan tahun perolehan"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Foto Barang</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
            />
          </div>

          {/* Deskripsi */}
          <div className="col-span-2">
            <label className="block mb-1 font-semibold text-gray-700">Deskripsi</label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9913]"
              placeholder="Masukkan deskripsi barang"
              rows={3}
            />
          </div>

          {/* Preview Foto */}
          {foto && (
            <div className="col-span-2 text-center">
              <img
                src={URL.createObjectURL(foto)}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg"
              />
              <p className="text-sm text-gray-500 mt-1">(Preview foto)</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="col-span-2 relative">
            <button
              type="submit"
              className="w-full bg-[#FF9913] hover:bg-[#e68a12] text-white font-semibold py-2 rounded-xl transition duration-300 shadow-lg hover:scale-105"
            >
              Simpan
            </button>

            {/* Tombol Close "X" */}
            <button
              type="button"
              onClick={() => navigate("/barang")}
              className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white 
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

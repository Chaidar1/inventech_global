// EditBarang.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function EditBarang() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State form
  const [form, setForm] = useState({
    nama_barang: "",
    kategori: "",
    tahun_perolehan: "2025",
    deskripsi: "",
    stok_tambah: 0,
    kondisi_barang: "Baik",
  });

  // State foto & barang
  const [hapusFoto, setHapusFoto] = useState(false);
  const [fotoBaru, setFotoBaru] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [barang, setBarang] = useState(null);

  // Ambil data barang dari state lokasi atau API
  useEffect(() => {
    if (location.state?.barang) {
      const data = location.state.barang;
      setBarang(data);
      setForm({
        nama_barang: data.nama_barang,
        kategori: data.kategori,
        tahun_perolehan: data.tahun_perolehan || "2025",
        deskripsi: data.deskripsi,
        stok_tambah: 0,
        kondisi_barang: "Baik",
      });
    } else {
      axios
        .get(`http://localhost:8000/barang/${id}`)
        .then((res) => {
          setBarang(res.data);
          setForm({
            nama_barang: res.data.nama_barang,
            kategori: res.data.kategori,
            tahun_perolehan: res.data.tahun_perolehan || "2025",
            deskripsi: res.data.deskripsi,
            stok_tambah: 0,
            kondisi_barang: "Baik",
          });
        })
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Tidak dapat mengambil data barang.",
          });
        });
    }
  }, [id, location.state]);

  // Handler perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      nama_barang,
      kategori,
      tahun_perolehan,
      deskripsi,
      stok_tambah,
      kondisi_barang,
    } = form;

    // Validasi form
    if (!nama_barang || !kategori || !tahun_perolehan || !deskripsi) {
      Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Nama, kategori, tahun perolehan, dan deskripsi wajib diisi!",
        confirmButtonColor: "#FF9913",
      });
      return;
    }

    // Siapkan formData
    const formData = new FormData();
    formData.append("nama_barang", nama_barang);
    formData.append("kategori", kategori);
    formData.append("tahun_perolehan", tahun_perolehan);
    formData.append("deskripsi", deskripsi);
    formData.append("stok_tambah", stok_tambah);
    formData.append("kondisi_barang", kondisi_barang);
    formData.append("hapus_foto", hapusFoto ? "true" : "false");
    if (fotoBaru) formData.append("foto", fotoBaru);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.put(
        `http://localhost:8000/barang/${id}`,
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
        title: "Berhasil!",
        text: "Barang berhasil diperbarui.",
        confirmButtonColor: "#FF9913",
      }).then(() => {
        navigate("/barang", { state: { updatedBarang: res.data } });
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat memperbarui barang.",
        confirmButtonColor: "#FF9913",
      });
    }
  };

  // Loading state
  if (!barang) return <p className="text-center mt-10">Memuat data...</p>;

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative p-4"
      style={{ backgroundImage: "url('/edit.jpeg')" }}
    >
      {/* Overlay gelap */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Container utama */}
      <div className="relative z-10 bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Tombol Close */}
        <button
          onClick={() => navigate("/barang")}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white 
                     w-10 h-10 flex items-center justify-center 
                     rounded-xl shadow-lg transition duration-300 text-2xl font-bold"
          title="Kembali ke daftar barang"
        >
          ×
        </button>

        {/* Judul */}
        <h2 className="text-3xl font-bold mb-6 text-center text-[#FF9913]">
          Edit Barang
        </h2>

        {/* Formulir */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 text-gray-800"
        >
          {/* Nama Barang */}
          <div className="col-span-2">
            <label className="block mb-1 font-semibold text-gray-700">
              Nama Barang
            </label>
            <input
              name="nama_barang"
              value={form.nama_barang}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#FF9913]"
              placeholder="Nama Barang"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Kategori
            </label>
            <select
              name="kategori"
              value={form.kategori}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#FF9913]"
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="Olahraga">Olahraga</option>
              <option value="Kesenian">Kesenian</option>
              <option value="Akademik">Akademik</option>
              <option value="Laboratorium">Laboratorium</option>
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#FF9913]"
              placeholder="Tahun Perolehan"
              min="1900"
              max="2100"
            />
          </div>

          {/* Tambah Stok */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Tambah Stok
            </label>
            <input
              type="number"
              name="stok_tambah"
              value={form.stok_tambah}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#FF9913]"
              placeholder="Tambah Stok Baru"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Isi angka jika ingin menambah stok baru. Stok lama tidak berubah.
            </p>
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#FF9913]"
            >
              <option value="Baik">Baik</option>
              <option value="Kurang Baik">Kurang Baik</option>
              <option value="Rusak">Rusak</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Kondisi stok baru akan mengikuti pilihan ini.
            </p>
          </div>

          {/* Deskripsi */}
          <div className="col-span-2">
            <label className="block mb-1 font-semibold text-gray-700">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#FF9913]"
              placeholder="Deskripsi Barang"
              rows={3}
            />
          </div>

          {/* Foto Lama */}
          <div className="col-span-2 text-center">
            {barang.foto ? (
              <>
                <img
                  src={`http://localhost:8000/uploads/${barang.foto}`}
                  alt="Foto Lama"
                  className="w-32 h-32 object-cover rounded-xl mx-auto shadow mb-2"
                />
                <p className="text-sm text-gray-500">(Foto saat ini)</p>
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">Belum ada foto</p>
            )}
          </div>

          {/* Upload Foto Baru */}
          <div className="col-span-2">
            <label className="block mb-1 font-semibold text-gray-700">
              Foto Baru
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setFotoBaru(file);
                setPreviewFoto(file ? URL.createObjectURL(file) : null);
              }}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
            />
            {previewFoto && (
              <div className="text-center mt-3">
                <img
                  src={previewFoto}
                  alt="Preview Foto Baru"
                  className="w-32 h-32 object-cover rounded-xl mx-auto shadow"
                />
                <p className="text-sm text-gray-500 mt-1">(Preview foto baru)</p>
              </div>
            )}
          </div>

          {/* Checkbox Hapus Foto */}
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={hapusFoto}
              onChange={(e) => setHapusFoto(e.target.checked)}
            />
            <span className="text-sm">Hapus Foto Barang</span>
          </div>

          {/* Tombol Submit */}
          <div className="col-span-2">
            <button
              type="submit"
              className="w-full bg-[#FF9913] hover:bg-[#e68a12] text-white font-semibold py-2 rounded-xl transition duration-300 shadow-lg hover:scale-105"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

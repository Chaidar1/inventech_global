// EditStokUnit.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function EditStokUnit() {
  const { id, kode } = useParams(); // id barang + kode unit
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    kode: "",
    kondisi: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil data unit dari backend
  useEffect(() => {
    fetch(`http://localhost:8000/barang/${id}/stok/${kode}`)
      .then((res) => {
        if (!res.ok) throw new Error("Unit tidak ditemukan");
        return res.json();
      })
      .then((data) => {
        setFormData({
          kode: data.kode || "",
          kondisi: data.kondisi || "",
          status: data.status || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat unit:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id, kode]);

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const payload = new URLSearchParams();
      payload.append("kondisi", formData.kondisi);
      payload.append("status", formData.status);

      const res = await fetch(
        `http://localhost:8000/barang/${id}/stok/${kode}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload.toString(),
        }
      );

      if (!res.ok) throw new Error("Gagal mengupdate unit");

      toast.success("✅ Unit berhasil diperbarui!", {
        duration: 2000,
        style: {
          background: "#16a34a",
          color: "#fff",
          fontWeight: "bold",
        },
      });

      setTimeout(() => navigate(`/barang/${id}`), 1800);
    } catch (err) {
      toast.error("❌ Error: " + err.message, {
        duration: 3000,
        style: {
          background: "#dc2626",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Memuat data unit...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Kembali
        </button>
      </div>
    );
  }

  // Main UI
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6 relative">
          {/* Toaster untuk notifikasi */}
          <Toaster position="top-center" />

          <h2 className="text-2xl font-bold text-center mb-6 text-[#FF9913]">
            Edit Unit Barang
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kode Unit (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kode Unit
              </label>
              <input
                type="text"
                name="kode"
                value={formData.kode}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Kondisi */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kondisi
              </label>
              <select
                name="kondisi"
                value={formData.kondisi}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">-- Pilih Kondisi --</option>
                <option value="Baik">Baik</option>
                <option value="Kurang Baik">Kurang Baik</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">-- Pilih Status --</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Dipinjam">Dipinjam</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => navigate(`/barang/${id}`)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Calendar,
  ClipboardList,
  User,
  ChevronDown,
  Check,
} from "lucide-react";

// Decode token sederhana
function decodeToken(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split("|");
    if (parts.length < 3) return null;
    return { role: parts[1] };
  } catch {
    return null;
  }
}

export default function PinjamBarang() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const barangFromState = location.state?.barang;
  const preselectedUnit = location.state?.unitKode || "";

  const [barang, setBarang] = useState(barangFromState || null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    tanggal_pinjam: "",
    tanggal_kembali: "",
    unit_kode: preselectedUnit, // ✅ sesuaikan dengan backend
    keperluan: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [jarakHari, setJarakHari] = useState(null);

  // Auto isi nama dari localStorage/token
  useEffect(() => {
    const savedUser = localStorage.getItem("userName");
    if (savedUser) {
      setFormData((prev) => ({ ...prev, nama: savedUser }));
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        decodeToken(token);
        const userName = localStorage.getItem("loginUsername") || "User";
        setFormData((prev) => ({ ...prev, nama: userName }));
        localStorage.setItem("userName", userName);
      }
    }
  }, []);

  // Fetch barang detail kalau belum ada
  useEffect(() => {
    if (!barang && id) {
      axios
        .get(`http://localhost:8000/barang/${id}`)
        .then((res) => setBarang(res.data))
        .catch(() => {
          toast.error("❌ Barang tidak ditemukan.");
          navigate("/barang");
        });
    }
  }, [id, barang, navigate]);

  // Fetch stok units
  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:8000/barang/${id}/stok`)
        .then((res) => setUnits(res.data.units || []))
        .catch(() => toast.error("❌ Gagal mengambil unit stok."));
    }
  }, [id]);

  // Update unit jika state berubah
  useEffect(() => {
    if (location.state?.unitKode) {
      setFormData((prev) => ({ ...prev, unit_kode: location.state.unitKode }));
    }
  }, [location.state]);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const kondisiBadge = (status) => {
    switch (status) {
      case "Baik":
        return "bg-green-500 text-white";
      case "Rusak Ringan":
        return "bg-yellow-500 text-white";
      case "Rusak Berat":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const handleSelectUnit = (u) => {
    if (u.kondisi === "Rusak Berat") {
      toast.error("❌ Unit dengan kondisi 'Rusak Berat' tidak bisa dipinjam.");
      return;
    }
    setFormData((prev) => ({ ...prev, unit_kode: u.kode }));
    setDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "tanggal_pinjam" || name === "tanggal_kembali") {
        const start = new Date(updated.tanggal_pinjam);
        const end = new Date(updated.tanggal_kembali);
        if (updated.tanggal_pinjam && updated.tanggal_kembali) {
          const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          setJarakHari(diff > 0 ? diff : null);
        } else {
          setJarakHari(null);
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.unit_kode) {
      toast.error("❌ Harap pilih unit stok terlebih dahulu.");
      setLoading(false);
      return;
    }
    if (!formData.tanggal_pinjam || !formData.tanggal_kembali) {
      toast.error("❌ Harap isi tanggal pinjam & tanggal kembali.");
      setLoading(false);
      return;
    }

    const start = new Date(formData.tanggal_pinjam);
    const end = new Date(formData.tanggal_kembali);
    if (end <= start) {
      toast.error("❌ Tanggal kembali harus setelah tanggal pinjam.");
      setLoading(false);
      return;
    }

    const selectedUnit = units.find((u) => u.kode === formData.unit_kode);
    if (!selectedUnit) {
      toast.error("❌ Unit yang dipilih tidak valid.");
      setLoading(false);
      return;
    }
    if (selectedUnit.kondisi === "Rusak Berat") {
      toast.error("❌ Unit dengan kondisi 'Rusak Berat' tidak bisa dipinjam.");
      setLoading(false);
      return;
    }

    try {
      const pinjamData = {
        barang_id: parseInt(id),
        nama: formData.nama,
        unit_kode: formData.unit_kode, // ✅ sesuai backend
        tanggal_pinjam: formData.tanggal_pinjam,
        tanggal_kembali: formData.tanggal_kembali,
        keperluan: formData.keperluan,
      };

      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/pinjam", pinjamData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Peminjaman berhasil diajukan! Menunggu verifikasi admin.");
      navigate("/riwayat");
    } catch (error) {
      toast.error(
        `❌ ${error.response?.data?.detail || "Terjadi kesalahan saat meminjam."}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!barang)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full md:w-3/4 lg:w-1/2"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-[#FF9913]">
          Form Peminjaman Barang
        </h2>

        {/* Info Barang */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold">{barang.nama_barang}</h3>
          <p className="text-gray-600">Kategori: {barang.kategori}</p>
        </div>

        {/* Nama */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Nama Peminjam *</label>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <User className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="flex-1 outline-none ml-2"
              required
            />
          </div>
        </div>

        {/* Unit */}
        <div className="mb-4 relative" ref={dropdownRef}>
          <label className="block text-gray-700 mb-1">Unit yang Dipinjam *</label>
          <div
            className="border rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {formData.unit_kode ? (
              <span>
                {formData.unit_kode} -{" "}
                <span
                  className={`px-2 py-0.5 rounded text-xs ${kondisiBadge(
                    units.find((u) => u.kode === formData.unit_kode)?.kondisi
                  )}`}
                >
                  {units.find((u) => u.kode === formData.unit_kode)?.kondisi}
                </span>
              </span>
            ) : (
              <span className="text-gray-400">Pilih Unit</span>
            )}
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </div>

          {dropdownOpen && (
            <ul className="absolute z-10 bg-white border rounded-lg shadow-md mt-1 w-full max-h-48 overflow-y-auto">
              {units.map((unit) => (
                <li
                  key={unit.kode}
                  className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectUnit(unit)}
                >
                  <span>
                    {unit.kode} -{" "}
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${kondisiBadge(
                        unit.kondisi
                      )}`}
                    >
                      {unit.kondisi}
                    </span>
                  </span>
                  {formData.unit_kode === unit.kode && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tanggal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Tanggal Pinjam *</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="tanggal_pinjam"
                value={formData.tanggal_pinjam}
                onChange={handleChange}
                className="flex-1 outline-none ml-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Tanggal Kembali *</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="tanggal_kembali"
                value={formData.tanggal_kembali}
                onChange={handleChange}
                min={formData.tanggal_pinjam || ""}
                disabled={!formData.tanggal_pinjam}
                className="flex-1 outline-none ml-2 disabled:bg-gray-100"
                required
              />
            </div>
            {jarakHari !== null && (
              <p className="text-sm text-gray-600 mt-1">
                Durasi: <span className="font-semibold">{jarakHari} hari</span>
              </p>
            )}
          </div>
        </div>

        {/* Keperluan */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Keperluan</label>
          <div className="flex items-start border rounded-lg px-3 py-2">
            <ClipboardList className="w-5 h-5 text-gray-400 mt-1" />
            <textarea
              name="keperluan"
              placeholder="Masukkan keperluan peminjaman"
              value={formData.keperluan}
              onChange={handleChange}
              className="flex-1 outline-none ml-2"
              rows="3"
            />
          </div>
        </div>

        {/* Tombol */}
        <div className="flex justify-between mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#FF9913] text-white px-5 py-2 rounded-lg hover:bg-[#e68a12] transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Mengajukan..." : "Ajukan Peminjaman"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500 transition-colors shadow-md"
          >
            Batalkan
          </button>
        </div>
      </form>
    </div>
  );
}

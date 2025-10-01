import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FolderPlus,
  MoreVertical,
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function InventarisList({
  barangData,
  setBarangData,
  kategoriData,
  setKategoriData,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [hoveredKategori, setHoveredKategori] = useState(null);
  const [openMenuKategori, setOpenMenuKategori] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const scrollRefs = useRef({});
  const menuRefs = useRef({});

  /** 🔹 Normalisasi kategori */
  const normalizeKategori = (k) => {
    if (!k && k !== "") return "";
    return typeof k === "string" ? k : k.nama || "";
  };

  /** 🔹 Ambil kategori terbaru dari server */
  const refreshKategori = async () => {
    try {
      const res = await fetch("http://localhost:8000/kategori", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof setKategoriData === "function") {
        setKategoriData(data);
      } else {
        window.dispatchEvent(new Event("refreshKategori"));
      }
    } catch (err) {
      console.error("Gagal mengambil kategori:", err);
    }
  };

  useEffect(() => {
    if (typeof setKategoriData === "function") {
      refreshKategori();
    }
  }, []);

  /** 🔹 Update barang setelah edit */
  useEffect(() => {
    if (location.state?.updatedBarang) {
      setBarangData((prev) =>
        prev.map((b) =>
          b.id === location.state.updatedBarang.id
            ? {
                ...location.state.updatedBarang,
                foto: `${location.state.updatedBarang.foto}?t=${Date.now()}`,
              }
            : b
        )
      );
    }
  }, [location.state, setBarangData]);

  /** 🔹 Tutup menu kategori jika klik di luar */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        openMenuKategori &&
        menuRefs.current[openMenuKategori] &&
        !menuRefs.current[openMenuKategori].contains(e.target)
      ) {
        setOpenMenuKategori(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuKategori]);

  /** 🔹 Hapus barang */
  const handleDeleteClick = (id, namaBarang, kategoriBarang) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: `Apakah Anda yakin ingin menghapus barang "${namaBarang}"? Data yang dihapus tidak dapat dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await fetch(`http://localhost:8000/barang/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal menghapus barang");

        setBarangData((prev) => {
          const newArr = prev.filter((item) => item.id !== id);
          const masihAda = newArr.some((b) => b.kategori === kategoriBarang);
          if (!masihAda) {
            refreshKategori();
          }
          return newArr;
        });

        MySwal.fire("Berhasil!", `Barang "${namaBarang}" berhasil dihapus.`, "success");
      } catch (err) {
        MySwal.fire("Gagal!", err.message || "Terjadi kesalahan.", "error");
      }
    });
  };

  /** 🔹 Hapus kategori */
  const handleDeleteKategori = (namaKategori) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: `Apakah Anda yakin ingin menghapus kategori "${namaKategori}"? Data yang dihapus tidak dapat dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await fetch(
          `http://localhost:8000/kategori/${encodeURIComponent(namaKategori)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Gagal menghapus kategori");

        await refreshKategori();
        if (selectedKategori === namaKategori) setSelectedKategori("Semua");

        MySwal.fire("Berhasil!", `Kategori "${namaKategori}" berhasil dihapus.`, "success");
      } catch (err) {
        MySwal.fire("Gagal!", err.message || "Terjadi kesalahan.", "error");
      }
    });
  };

  /** 🔹 Filter barang */
  const filteredBarangData = (barangData || []).filter((barang) => {
    const matchNama = barang.nama_barang
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchKondisi =
      barang.stok &&
      barang.stok.some((unit) =>
        unit.kondisi.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchNama || matchKondisi;
  });

  /** 🔹 Kelompokkan barang */
  const grupBarang = (data) => {
    const grup = {};
    const kategoriList = (kategoriData || [])
      .map(normalizeKategori)
      .filter(Boolean);

    if (selectedKategori === "Semua") {
      kategoriList.forEach((k) => (grup[k] = []));
      data.forEach((barang) => {
        const kb = barang.kategori || "";
        grup[kb] = grup[kb] || [];
        grup[kb].push(barang);
      });
    } else {
      grup[selectedKategori] = [];
      data.forEach((barang) => {
        if ((barang.kategori || "") === selectedKategori) {
          grup[selectedKategori].push(barang);
        }
      });
    }
    return grup;
  };

  const barangUntukTampil = grupBarang(filteredBarangData);

  /** 🔹 Scroll kiri/kanan */
  const scroll = (kategori, direction) => {
    const container = scrollRefs.current[kategori];
    if (container) {
      const scrollAmount = direction === "left" ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const kategoriListForSelect = (kategoriData || [])
    .map(normalizeKategori)
    .filter(Boolean);

  const totalBarang = barangData?.length || 0;
  const totalKategori = kategoriListForSelect.length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <img
              src="/Logo PT.png"
              alt="Logo"
              className="w-12 h-12 object-contain rounded-full shadow-md bg-white p-1"
            />
            <h1 className="text-3xl font-bold drop-shadow">
              Inventaris Barang
            </h1>
          </motion.div>
          <p className="text-orange-100 mb-6">
            Kelola data barang dan kategori inventaris dengan mudah.
          </p>

          {/* Statistik Ringkas */}
          <div className="flex flex-wrap gap-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md">
              <p className="text-sm text-orange-100">Total Barang</p>
              <p className="text-2xl font-bold">{totalBarang}</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md">
              <p className="text-sm text-orange-100">Total Kategori</p>
              <p className="text-2xl font-bold">{totalKategori}</p>
            </div>
            {Object.entries(barangUntukTampil).map(([kategori, list]) => (
              <div
                key={kategori}
                className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md"
              >
                <p className="text-sm text-orange-100 capitalize">{kategori}</p>
                <p className="text-2xl font-bold">{list.length}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= SEARCH & ACTION ================= */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-4 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau kondisi barang..."
              className="px-4 py-2 rounded-lg w-full md:w-80 border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            >
              <option value="Semua">Semua Kategori</option>
              {kategoriListForSelect.map((kat, i) => (
                <option key={i} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/tambah")}
              className="flex items-center gap-2 bg-[#FF9913] hover:bg-[#e68a12] text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              <Plus size={20} /> Tambah Barang
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/kategori/tambah")}
              className="flex items-center gap-2 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              <FolderPlus size={20} /> Tambah Kategori
            </motion.button>
          </div>
        </div>
      </div>

      {/* ================= LIST BARANG ================= */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {Object.keys(barangUntukTampil).length === 0 ? (
          <p className="text-center text-gray-500">
            Tidak ada barang yang cocok dengan pencarian atau filter.
          </p>
        ) : (
          Object.entries(barangUntukTampil).map(([kategori, barangList]) => (
            <div
              key={kategori}
              className="mb-10 relative"
              onMouseEnter={() => setHoveredKategori(kategori)}
              onMouseLeave={() => setHoveredKategori(null)}
            >
              {/* ====== Header kategori ====== */}
              <div
                className="flex items-center gap-3 mb-3 relative"
                ref={(el) => (menuRefs.current[kategori] = el)}
              >
                <button
                  onClick={() =>
                    setOpenMenuKategori(
                      openMenuKategori === kategori ? null : kategori
                    )
                  }
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <MoreVertical size={18} />
                </button>
                <h2 className="text-lg font-semibold capitalize">{kategori}</h2>
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  {barangList.length} barang
                </span>

                {openMenuKategori === kategori && (
                  <div className="absolute top-6 left-0 bg-white text-black rounded-md shadow-lg w-40 z-50">
                    <button
                      onClick={() => {
                        setOpenMenuKategori(null);
                        handleDeleteKategori(kategori);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                    >
                      Hapus Kategori
                    </button>
                  </div>
                )}
              </div>

              {/* ====== List barang per kategori ====== */}
              {barangList.length === 0 ? (
                <p className="text-gray-400 italic ml-8">Barang kosong</p>
              ) : (
                <>
                  {hoveredKategori === kategori && (
                    <button
                      onClick={() => scroll(kategori, "left")}
                      className="absolute -left-14 top-1/2 transform -translate-y-1/2 z-30 text-[#FF9913] hover:scale-110 transition-transform"
                    >
                      <ChevronLeft size={60} strokeWidth={3} />
                    </button>
                  )}

                  <div
                    ref={(el) => (scrollRefs.current[kategori] = el)}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory scroll-smooth relative z-10"
                  >
                    {barangList.map((barang) => (
                      <motion.div
                        key={barang.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0 w-48 snap-center transition duration-300 hover:scale-105 hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={`http://localhost:8000/uploads/${barang.foto}`}
                          alt={barang.nama_barang}
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-image.png";
                          }}
                        />
                        <div className="px-3 py-2 text-center">
                          <p className="text-lg font-semibold text-gray-800 truncate">
                            {barang.nama_barang}
                          </p>
                          <div className="flex justify-center gap-2 mt-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Stok: {barang.stok ? barang.stok.length : 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between px-2 pb-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/barang/${barang.id}`)}
                            className="text-xs px-2 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 shadow"
                          >
                            Detail
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              navigate(`/edit/${barang.id}`, {
                                state: { barang },
                              })
                            }
                            className="text-xs px-2 py-1 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 shadow"
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleDeleteClick(
                                barang.id,
                                barang.nama_barang,
                                barang.kategori
                              )
                            }
                            className="text-xs px-2 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 shadow"
                          >
                            Hapus
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {hoveredKategori === kategori && (
                    <button
                      onClick={() => scroll(kategori, "right")}
                      className="absolute -right-14 top-1/2 transform -translate-y-1/2 z-30 text-[#FF9913] hover:scale-110 transition-transform"
                    >
                      <ChevronRight size={60} strokeWidth={3} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* ===== CSS Hide Scrollbar ===== */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

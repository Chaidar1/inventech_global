import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

export default function InventarisListUser({ barangData, kategoriData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [hoveredKategori, setHoveredKategori] = useState(null);
  const [openMenuKategori, setOpenMenuKategori] = useState(null);

  const navigate = useNavigate();
  const scrollRefs = useRef({});
  const menuRefs = useRef({});

  // 🔹 Normalisasi kategori (handle kalau backend kirim string atau objek)
  const normalizeKategori = (k) =>
    typeof k === "string" ? k : k?.nama || "";

  // 🔹 Filter barang sesuai pencarian
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

  // 🔹 Kelompokkan barang berdasarkan kategori
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

  // 🔹 Fungsi scroll kiri/kanan
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
      {/* 🔹 Header Section */}
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
            Lihat dan pinjam barang inventaris dengan mudah.
          </p>

          {/* 🔹 Statistik Ringkas */}
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

      {/* 🔹 Search + Filter */}
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
        </div>
      </div>

      {/* 🔹 List Barang */}
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
              {/* 🔹 Header kategori */}
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
              </div>

              {/* 🔹 Isi kategori */}
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

                        {/* 🔹 Tombol aksi */}
                        <div className="flex justify-center gap-3 px-2 pb-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/barang/${barang.id}`)}
                            className="text-xs px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 shadow"
                          >
                            Detail
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              navigate(`/pinjam/${barang.id}`, {
                                state: { barang: barang || null },
                              })
                            }
                            className="text-xs px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 shadow"
                          >
                            Pinjam
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

      {/* 🔹 CSS Hilangkan scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { useAppTheme } from "../hooks/useTheme";

export default function InventarisListUser({ barangData, kategoriData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [hoveredKategori, setHoveredKategori] = useState(null);
  const [openMenuKategori, setOpenMenuKategori] = useState(null);

  const navigate = useNavigate();
  const scrollRefs = useRef({});
  const menuRefs = useRef({});
  const { themeClasses, isDarkMode } = useAppTheme();

  // === Enhanced Background Particles for Dark Mode ===
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Fungsi untuk inisialisasi particles
  const initParticles = () => {
    if (!isDarkMode || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Clear existing animation
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles - SAMA DENGAN LOGIN.JSX
    const particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.4 + 0.3,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.05 + 0.02
      });
    }
    
    particlesRef.current = particles;

    const animate = () => {
      if (!canvasRef.current || !particlesRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((p) => {
        const pulseFactor = Math.sin(p.pulse) * 0.2 + 0.8;
        p.pulse += p.pulseSpeed;
        
        ctx.save();
        ctx.globalAlpha = p.opacity * pulseFactor;
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        
        if (p.r > 2) {
          const gradient = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.r * 1.5
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulseFactor, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Movement with boundary checking
        p.x += p.dx;
        p.y += p.dy;
        
        if (p.x < -p.r || p.x > canvas.width + p.r) p.dx *= -1;
        if (p.y < -p.r || p.y > canvas.height + p.r) p.dy *= -1;
        
        p.x = Math.max(-p.r, Math.min(canvas.width + p.r, p.x));
        p.y = Math.max(-p.r, Math.min(canvas.height + p.r, p.y));
      });
      
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  };

  // Effect untuk particles - dijalankan setiap kali isDarkMode berubah atau komponen mount
  useEffect(() => {
    let cleanupResize;
    
    if (isDarkMode) {
      // Delay sedikit untuk memastikan canvas sudah ter-render
      const timer = setTimeout(() => {
        cleanupResize = initParticles();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        if (cleanupResize) cleanupResize();
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
      };
    } else {
      // Cleanup ketika light mode
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [isDarkMode]);

  // Effect tambahan untuk handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isDarkMode) {
        // Restart particles ketika tab menjadi visible lagi
        setTimeout(() => {
          initParticles();
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDarkMode]);

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
    <div className={`min-h-screen transition-colors duration-300 relative ${
      isDarkMode ? "bg-slate-900" : "bg-gray-100"
    }`}>
      {/* Enhanced Background Particles untuk Dark Mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-10 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* 🔹 Header Section */}
      <div className={`shadow-lg transition-colors duration-300 relative z-20 ${
        isDarkMode 
          ? "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900" 
          : "bg-gradient-to-r from-orange-500 to-orange-400"
      }`}>
        {/* Reduced overlay opacity untuk memperlihatkan particles */}
        {isDarkMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-blue-900/60 to-indigo-900/70 z-0"></div>
        )}
        
        <div className="max-w-7xl mx-auto px-6 py-10 text-white relative z-20">
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
          <p className={`mb-6 ${
            isDarkMode ? "text-blue-100" : "text-orange-100"
          }`}>
            Lihat dan pinjam barang inventaris dengan mudah.
          </p>

          {/* 🔹 Statistik Ringkas */}
          <div className="flex flex-wrap gap-6 relative z-20">
            <div className={`backdrop-blur-sm px-6 py-4 rounded-xl shadow-md ${
              isDarkMode 
                ? "bg-blue-800/40 border border-blue-700/30" 
                : "bg-white bg-opacity-20"
            }`}>
              <p className={`text-sm ${
                isDarkMode ? "text-blue-200" : "text-orange-100"
              }`}>
                Total Barang
              </p>
              <p className="text-2xl font-bold">{totalBarang}</p>
            </div>
            <div className={`backdrop-blur-sm px-6 py-4 rounded-xl shadow-md ${
              isDarkMode 
                ? "bg-indigo-800/40 border border-indigo-700/30" 
                : "bg-white bg-opacity-20"
            }`}>
              <p className={`text-sm ${
                isDarkMode ? "text-indigo-200" : "text-orange-100"
              }`}>
                Total Kategori
              </p>
              <p className="text-2xl font-bold">{totalKategori}</p>
            </div>
            {Object.entries(barangUntukTampil).map(([kategori, list]) => (
              <div
                key={kategori}
                className={`backdrop-blur-sm px-6 py-4 rounded-xl shadow-md ${
                  isDarkMode 
                    ? "bg-slate-800/40 border border-slate-700/30" 
                    : "bg-white bg-opacity-20"
                }`}
              >
                <p className={`text-sm capitalize ${
                  isDarkMode ? "text-slate-200" : "text-orange-100"
                }`}>
                  {kategori}
                </p>
                <p className="text-2xl font-bold">{list.length}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔹 Search + Filter */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className={`rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300 relative z-20 ${
          isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
        }`}>
          <div className="flex gap-4 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau kondisi barang..."
              className={`px-4 py-2 rounded-lg w-full md:w-80 border focus:outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500" 
                  : "border-gray-300 focus:ring-2 focus:ring-orange-400"
              }`}
            />
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500" 
                  : "border-gray-300 focus:ring-2 focus:ring-orange-400"
              }`}
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
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-20">
        {Object.keys(barangUntukTampil).length === 0 ? (
          <p className={`text-center transition-colors duration-300 ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}>
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
                  className={`p-1 rounded transition-colors duration-300 ${
                    isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-200"
                  }`}
                >
                  <MoreVertical size={18} />
                </button>
                <h2 className={`text-lg font-semibold capitalize transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  {kategori}
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-blue-900 text-blue-200" 
                    : "bg-orange-100 text-orange-800"
                }`}>
                  {barangList.length} barang
                </span>
              </div>

              {/* 🔹 Isi kategori */}
              {barangList.length === 0 ? (
                <p className={`italic ml-8 transition-colors duration-300 ${
                  isDarkMode ? "text-slate-500" : "text-gray-400"
                }`}>
                  Barang kosong
                </p>
              ) : (
                <>
                  {hoveredKategori === kategori && (
                    <button
                      onClick={() => scroll(kategori, "left")}
                      className={`absolute -left-14 top-1/2 transform -translate-y-1/2 z-30 hover:scale-110 transition-transform ${
                        isDarkMode ? "text-blue-400" : "text-[#FF9913]"
                      }`}
                    >
                      <ChevronLeft size={60} strokeWidth={3} />
                    </button>
                  )}

                  <div
                    ref={(el) => (scrollRefs.current[kategori] = el)}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory scroll-smooth relative z-20"
                  >
                    {barangList.map((barang) => (
                      <motion.div
                        key={barang.id}
                        className={`rounded-xl shadow-md overflow-hidden flex-shrink-0 w-48 snap-center transition duration-300 hover:scale-105 hover:shadow-xl relative z-20 ${
                          isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
                        }`}
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
                          <p className={`text-lg font-semibold truncate transition-colors duration-300 ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}>
                            {barang.nama_barang}
                          </p>
                          <div className="flex justify-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
                              isDarkMode 
                                ? "bg-green-900 text-green-200" 
                                : "bg-green-100 text-green-800"
                            }`}>
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
                            className={`text-xs px-3 py-1 rounded-md text-white hover:shadow transition-colors ${
                              isDarkMode 
                                ? "bg-green-700 hover:bg-green-600" 
                                : "bg-green-600 hover:bg-green-700"
                            }`}
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
                            className={`text-xs px-3 py-1 rounded-md text-white hover:shadow transition-colors ${
                              isDarkMode 
                                ? "bg-blue-600 hover:bg-blue-500" 
                                : "bg-blue-500 hover:bg-blue-600"
                            }`}
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
                      className={`absolute -right-14 top-1/2 transform -translate-y-1/2 z-30 hover:scale-110 transition-transform ${
                        isDarkMode ? "text-blue-400" : "text-[#FF9913]"
                      }`}
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
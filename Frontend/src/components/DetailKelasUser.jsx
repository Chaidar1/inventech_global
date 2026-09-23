// DetailKelasUser.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useAppTheme } from "../hooks/useTheme";

// Import Lucide React icons
import {
  ArrowLeft,
  Users,
  Tag,
  DollarSign,
  Clock,
  MapPin,
  FileText,
  Eye,
  Info,
  CheckCircle2,
  Star,
  X,
  ShoppingCart,
  ChevronRight,
  Ticket,
  Calendar,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Ban,
  Images,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react";

export default function DetailKelasUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useAppTheme();

  const [kelas, setKelas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showGambaranModal, setShowGambaranModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageAlt, setModalImageAlt] = useState("");
  const [tiketKategori, setTiketKategori] = useState([]);
  const [loadingTiket, setLoadingTiket] = useState(true);
  const [totalPeserta, setTotalPeserta] = useState(0);
  
  // Refs untuk section tiket kategori
  const tiketSectionRef = useRef(null);
  const mainContentRef = useRef(null);
  const scrollToTiketFlag = useRef(false);

  // === Enhanced Background Particles for Dark Mode ===
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Fungsi untuk inisialisasi particles
  const initParticles = () => {
    if (!isDarkMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

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
          gradient.addColorStop(0, 'rgba(215, 254, 81, 0.8)');
          gradient.addColorStop(0.5, 'rgba(215, 254, 81, 0.3)');
          gradient.addColorStop(1, 'rgba(215, 254, 81, 0)');
          ctx.fillStyle = gradient;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulseFactor, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

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

  useEffect(() => {
    let cleanupResize;

    if (isDarkMode) {
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
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [isDarkMode]);

  // Fetch detail kelas
  const fetchKelas = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8000/kelas/${id}`, {
        headers: {
          "Cache-Control": "no-cache",
          "Accept": "application/json"
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Kelas tidak ditemukan");
      }

      const data = await res.json();

      if (data.foto) {
        data.foto_url = `http://localhost:8000/uploads/${data.foto}?t=${Date.now()}`;
      }

      // Gambaran event diambil dari DetailKelas.jsx
      if (data.gambaran_event_urls && Array.isArray(data.gambaran_event_urls)) {
        data.gambaran_event_urls = data.gambaran_event_urls.map(url => 
          `${url}?t=${Date.now()}`
        );
      } else if (data.gambaran_event) {
        try {
          const gambaranEvent = JSON.parse(data.gambaran_event);
          if (Array.isArray(gambaranEvent)) {
            data.gambaran_event_urls = gambaranEvent.map(filename => 
              `http://localhost:8000/uploads/${filename}?t=${Date.now()}`
            );
          }
        } catch (error) {
          data.gambaran_event_urls = [];
        }
      } else {
        data.gambaran_event_urls = [];
      }

      // Set data kelas
      setKelas(data);
      
      // Set total peserta dari data API
      setTotalPeserta(data.total_peserta || 0);
      
      setError(null);
      await fetchTiketKategori();
    } catch (err) {
      setError(err.message);
      console.error("Error fetching kelas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchTiketKategori = useCallback(async () => {
    try {
      setLoadingTiket(true);
      const res = await fetch(`http://localhost:8000/kelas/${id}/tiket-kategori`);
      if (res.ok) {
        const data = await res.json();
        const formattedData = data.map(tiket => ({
          ...tiket,
          harga: typeof tiket.harga === 'number' ? tiket.harga : parseFloat(tiket.harga || 0),
          is_populer: Boolean(tiket.is_populer),
          is_active: tiket.is_active === undefined ? true : Boolean(tiket.is_active)
        }));
        setTiketKategori(formattedData);
      } else {
        setTiketKategori([]);
      }
    } catch (error) {
      console.error("Error fetching tiket kategori:", error);
      setTiketKategori([]);
    } finally {
      setLoadingTiket(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKelas();
    scrollToTiketFlag.current = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id, fetchKelas]);

  useEffect(() => {
    const shouldScrollToTiket = location.state?.scrollToTiket;
    
    if (shouldScrollToTiket && !scrollToTiketFlag.current) {
      scrollToTiketFlag.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      
      const scrollImmediately = () => {
        if (tiketSectionRef.current) {
          tiketSectionRef.current.scrollIntoView({ 
            behavior: 'instant',
            block: 'start'
          });
          
          const section = tiketSectionRef.current;
          const originalStyle = section.style.cssText;
          
          section.style.transition = 'all 0.3s ease';
          section.style.border = isDarkMode 
            ? '2px solid rgba(215, 254, 81, 0.7)' 
            : '2px solid rgba(100, 107, 94, 0.7)';
          section.style.boxShadow = isDarkMode 
            ? '0 0 25px rgba(215, 254, 81, 0.4)' 
            : '0 0 25px rgba(100, 107, 94, 0.4)';
          
          setTimeout(() => {
            section.style.cssText = originalStyle;
          }, 1500);
        }
      };
      
      scrollImmediately();
      setTimeout(scrollImmediately, 100);
      
      const checkAndScroll = setInterval(() => {
        if (tiketSectionRef.current && !isLoading && !loadingTiket) {
          scrollImmediately();
          clearInterval(checkAndScroll);
        }
      }, 50);
      
      setTimeout(() => clearInterval(checkAndScroll), 2000);
    }
  }, [location.state, location.pathname, navigate, isDarkMode, isLoading, loadingTiket]);

  const formatRupiah = useCallback((angka) => {
    if (angka === undefined || angka === null || isNaN(angka) || angka === "") {
      return "Gratis";
    }
    const num = typeof angka === 'string' ? parseFloat(angka) : angka;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }, []);

  const openImageModal = useCallback((imageUrl, altText) => {
    setModalImageUrl(imageUrl);
    setModalImageAlt(altText);
    setShowImageModal(true);
  }, []);

  const openGambaranModal = useCallback((index) => {
    if (kelas.gambaran_event_urls && kelas.gambaran_event_urls.length > 0) {
      setSelectedImageIndex(index);
      setShowGambaranModal(true);
    }
  }, [kelas]);

  const closeImageModal = useCallback(() => {
    setShowImageModal(false);
    setShowGambaranModal(false);
  }, []);

  const nextImage = useCallback(() => {
    if (kelas.gambaran_event_urls && kelas.gambaran_event_urls.length > 0) {
      setSelectedImageIndex(prev => 
        (prev + 1) % kelas.gambaran_event_urls.length
      );
    }
  }, [kelas]);

  const prevImage = useCallback(() => {
    if (kelas.gambaran_event_urls && kelas.gambaran_event_urls.length > 0) {
      setSelectedImageIndex(prev => 
        prev === 0 ? kelas.gambaran_event_urls.length - 1 : prev - 1
      );
    }
  }, [kelas]);

  const scrollToTiketSection = useCallback(() => {
    if (tiketSectionRef.current) {
      tiketSectionRef.current.scrollIntoView({ 
        behavior: 'instant',
        block: 'start'
      });
      
      const section = tiketSectionRef.current;
      const originalStyle = section.style.cssText;
      
      section.style.transition = 'all 0.3s ease';
      section.style.border = isDarkMode 
        ? '2px solid rgba(215, 254, 81, 0.7)' 
        : '2px solid rgba(100, 107, 94, 0.7)';
      section.style.boxShadow = isDarkMode 
        ? '0 0 25px rgba(215, 254, 81, 0.4)' 
        : '0 0 25px rgba(100, 107, 94, 0.4)';
      
      setTimeout(() => {
        section.style.cssText = originalStyle;
      }, 1500);
    }
  }, [isDarkMode]);

  // MODIFIKASI: Fungsi handleBeliClick dengan pengecekan link navigasi
  const handleBeliClick = useCallback((tiketKategoriId = null) => {
    console.log("Tombol Beli diklik untuk kelas:", kelas);
    
    // Cek apakah ada link navigasi khusus yang diset admin
    if (kelas.link_navigasi && kelas.link_navigasi.trim() !== '') {
      console.log("Menggunakan link navigasi khusus:", kelas.link_navigasi);
      
      if (kelas.is_link_eksternal) {
        // Jika link eksternal, buka di tab baru
        window.open(kelas.link_navigasi, '_blank');
        return; // Keluar dari fungsi karena sudah membuka tab baru
      } else {
        // Jika link internal, navigasi dengan React Router
        console.log("Navigasi ke link internal:", kelas.link_navigasi);
        navigate(kelas.link_navigasi, {
          state: { 
            scrollToTiket: true,
            kelas: kelas
          }
        });
        return; // Keluar dari fungsi karena sudah navigasi
      }
    }
    
    // Jika tidak ada link khusus, lanjutkan dengan logika pembelian tiket biasa
    console.log("Menggunakan logika pembelian default");
    
    const selectedTiket = tiketKategoriId ?
      tiketKategori.find(t => t.id === tiketKategoriId) : null;

    if (selectedTiket && !selectedTiket.is_active) {
      Swal.fire({
        title: "Tiket Tidak Tersedia",
        text: `Kategori tiket "${selectedTiket.nama_kategori}" sedang tidak aktif untuk dijual.`,
        icon: "warning",
        confirmButtonText: "Mengerti",
        background: isDarkMode ? '#1A1F16' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
        confirmButtonColor: isDarkMode ? "#D7FE51" : "#d97706",
      });
      return;
    }

    Swal.fire({
      title: "Konfirmasi Pembelian",
      html: `<div class="text-left space-y-3">
               <p>Anda akan membeli kelas: <strong>${kelas.nama_kelas}</strong></p>
               ${selectedTiket ?
          `<div>
                    <p>Kategori Tiket: <strong>${selectedTiket.nama_kategori}</strong></p>
                    <p>Harga: <strong>${formatRupiah(selectedTiket.harga)}</strong></p>
                    <p class="text-sm ${isDarkMode ? 'text-[#ABB89D]' : 'text-gray-600'}">${selectedTiket.deskripsi}</p>
                  </div>` :
          `<p>Biaya: <strong>${formatRupiah(kelas.biaya)}</strong></p>`
        }
               <p class="text-sm ${isDarkMode ? 'text-[#ABB89D]' : 'text-gray-600'} mt-2">
                 Setelah mengkonfirmasi, Anda akan dialihkan ke halaman pembayaran.
               </p>
             </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Lanjutkan",
      cancelButtonText: "Batal",
      background: isDarkMode ? '#1A1F16' : '#ffffff',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
      confirmButtonColor: isDarkMode ? "#D7FE51" : "#3b82f6",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/beli-tiket/${id}`, {
          state: {
            kelas: kelas,
            selectedTiket: selectedTiket,
            tiketKategori: tiketKategori
          }
        });
      }
    });
  }, [kelas, tiketKategori, id, isDarkMode, navigate, formatRupiah]);

  const TiketKategoriCard = useCallback(({ tiket, index }) => {
    return (
      <motion.div
        key={tiket.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`relative rounded-2xl p-6 transition-all duration-300 border-2 h-full ${!tiket.is_active
            ? isDarkMode
              ? "border-red-700/60 bg-gradient-to-br from-red-900/20 to-[#1A1F16]/30"
              : "border-red-300 bg-gradient-to-br from-red-50/50 to-white/50"
            : tiket.is_populer
            ? isDarkMode
              ? "border-[#D7FE51] bg-gradient-to-br from-[#D7FE51]/10 to-[#1A1F16]/50"
              : "border-purple-400 bg-gradient-to-br from-purple-50 to-white"
            : isDarkMode
            ? "border-[#363D30] bg-[#1A1F16]/30"
            : "border-gray-200 bg-white"
          } hover:shadow-lg hover:scale-[1.02] flex flex-col`}
        onClick={() => {
          if (tiket.is_active) {
            handleBeliClick(tiket.id);
          }
        }}
        style={{ cursor: tiket.is_active ? 'pointer' : 'not-allowed' }}
      >
        {!tiket.is_active && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full shadow-lg ${
              isDarkMode
                ? "bg-red-700 text-red-100"
                : "bg-red-600 text-white"
            }`}>
              <Ban size={12} />
              <span className="text-xs font-bold">HABIS</span>
            </div>
          </div>
        )}
        
        {tiket.is_populer && tiket.is_active && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full shadow-lg ${
              isDarkMode
                ? "bg-gradient-to-r from-[#D7FE51] to-[#9ECB45] text-[#1A1F16]"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            }`}>
              <Star size={12} />
              <span className="text-xs font-bold">POPULER</span>
            </div>
          </div>
        )}

        <div className="mb-4 flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={18} className={
              !tiket.is_active
                ? isDarkMode ? "text-red-400" : "text-red-500"
                : isDarkMode ? "text-[#D7FE51]" : "text-purple-600"
            } />
            <h4 className={`text-lg font-bold ${!tiket.is_active
                ? isDarkMode ? "text-red-400" : "text-red-600"
                : isDarkMode ? "text-white" : "text-gray-800"
              }`}>
              {tiket.nama_kategori}
            </h4>
          </div>

          <div className={`text-sm mb-3 ${!tiket.is_active
              ? isDarkMode ? "text-red-400/70" : "text-red-500/70"
              : isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
            }`}>
            {tiket.deskripsi}
          </div>

          <div className={`h-px mb-4 ${!tiket.is_active
              ? isDarkMode ? "bg-red-700/30" : "bg-red-300"
              : isDarkMode ? "bg-[#363D30]" : "bg-gray-200"
            }`} />
        </div>

        <div className="mb-6">
          <div className={`text-2xl font-bold mb-2 ${!tiket.is_active
              ? isDarkMode ? "text-red-400" : "text-red-500"
              : isDarkMode ? "text-[#D7FE51]" : "text-emerald-600"
            }`}>
            {formatRupiah(tiket.harga)}
          </div>
        </div>

        <div className="flex-grow">
          <h5 className={`text-sm font-semibold mb-3 ${!tiket.is_active
              ? isDarkMode ? "text-red-400/70" : "text-red-500/70"
              : isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
            }`}>
            Benefit yang didapatkan:
          </h5>
          <ul className="space-y-2">
            {tiket.manfaat && typeof tiket.manfaat === 'string' && tiket.manfaat.trim() !== '' ? (
              tiket.manfaat.split(',').map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className={`mt-0.5 flex-shrink-0 ${!tiket.is_active
                      ? isDarkMode ? "text-red-400" : "text-red-400"
                      : isDarkMode ? "text-[#D7FE51]" : "text-green-500"
                    }`} />
                  <span className={`text-sm ${!tiket.is_active
                      ? isDarkMode ? "text-red-400/70" : "text-red-500/70"
                      : isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                    }`}>
                    {benefit.trim()}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-[#ABB89D] text-sm italic">Tidak ada benefit yang ditentukan</li>
            )}
          </ul>
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-700/20 dark:border-[#363D30]">
          {/* MODIFIKASI: Tombol Pilih dengan logika link navigasi */}
          <motion.button
            whileHover={{ scale: tiket.is_active ? 1.1 : 1 }}
            whileTap={{ scale: tiket.is_active ? 0.9 : 1 }}
            onClick={(e) => {
              e.stopPropagation();
              if (tiket.is_active) {
                handleBeliClick(tiket.id);
              }
            }}
            disabled={!tiket.is_active}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${!tiket.is_active
                ? isDarkMode
                  ? "bg-gray-700/30 text-gray-400 cursor-not-allowed border border-gray-600/30"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400"
                : isDarkMode
                ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]"
                : "bg-purple-500 hover:bg-purple-600 text-white"
              }`}
            title={!tiket.is_active ? "Tiket tidak tersedia" : "Pilih tiket ini"}
          >
            <ShoppingCart size={14} className="inline mr-1" />
            {!tiket.is_active ? "Habis" : "Pilih"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              Swal.fire({
                title: tiket.nama_kategori,
                html: `<div class="text-left space-y-3">
                         <p><strong>Status:</strong> <span class="${!tiket.is_active
                    ? (isDarkMode ? 'text-red-400' : 'text-red-600')
                    : (isDarkMode ? 'text-green-400' : 'text-green-600')
                  }">${!tiket.is_active ? 'Tidak Tersedia' : 'Tersedia'}</span></p>
                         <p><strong>Deskripsi:</strong> ${tiket.deskripsi}</p>
                         <p><strong>Harga:</strong> ${formatRupiah(tiket.harga)}</p>
                         <p><strong>Benefits:</strong></p>
                         <ul class="space-y-1">
                           ${tiket.manfaat && typeof tiket.manfaat === 'string' ?
                    tiket.manfaat.split(',').map(benefit => `<li>• ${benefit.trim()}</li>`).join('') :
                    '<li>Tidak ada benefit yang ditentukan</li>'}
                         </ul>
                         ${!tiket.is_active ? '<p class="text-sm text-red-500 mt-2">⚠️ Tiket ini sedang tidak tersedia untuk pembelian</p>' : ''}
                       </div>`,
                icon: !tiket.is_active ? "warning" : "info",
                confirmButtonText: "Mengerti",
                background: isDarkMode ? '#1A1F16' : '#ffffff',
                color: isDarkMode ? '#f8fafc' : '#1f2937',
                confirmButtonColor: isDarkMode ? "#D7FE51" : "#3b82f6",
              });
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDarkMode
                ? "bg-[#1A1F16] hover:bg-[#363D30] text-[#ABB89D]"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
          >
            <Info size={14} className="inline mr-1" />
            Detail
          </motion.button>
        </div>
      </motion.div>
    );
  }, [isDarkMode, handleBeliClick, formatRupiah]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 relative ${isDarkMode ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" : "bg-gray-50"
        }`}>
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-[#D7FE51]' : 'border-blue-600'
            }`}></div>
          <p className={`text-lg ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
            }`}>
            Memuat data kelas...
          </p>
        </div>
      </div>
    );
  }

  if (error || !kelas) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 relative ${isDarkMode ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" : "bg-gray-50"
        }`}>
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        <div className="text-center p-8 rounded-xl max-w-md relative z-10">
          <div className={`p-4 rounded-full mx-auto mb-4 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
            }`}>
            <Users size={48} className={`mx-auto ${isDarkMode ? 'text-red-400' : 'text-red-500'
              }`} />
          </div>
          <p className={`text-lg font-medium mb-4 ${isDarkMode ? "text-red-400" : "text-red-600"
            }`}>
            {error || "Kelas tidak ditemukan"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 text-white px-6 py-3 rounded-lg ${isDarkMode
                ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            <ArrowLeft size={20} />
            Kembali ke Beranda
          </motion.button>
        </div>
      </div>
    );
  }

  const shouldHighlightTiket = location.state?.scrollToTiket;
  const activeTiketCount = tiketKategori.filter(tiket => tiket.is_active).length;

  return (
    <div className={`min-h-screen ${isDarkMode
        ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]"
        : "bg-gray-50"
      } p-4 relative`}>
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      <div className="max-w-6xl mx-auto relative z-10" ref={mainContentRef}>
        {/* Header */}
        <div className="flex items-center justify-center mb-8 relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className={`absolute left-0 flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode
                ? "bg-[#1A1F16] hover:bg-[#363D30] text-white border border-[#363D30]"
                : "bg-white hover:bg-gray-100 text-gray-700 border"
              }`}
          >
            <ArrowLeft size={18} />
            Kembali
          </motion.button>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-blue-100'
              }`}>
              <Users size={24} className={
                isDarkMode ? "text-[#D7FE51]" : "text-blue-600"
              } />
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"
              }`}>
              Detail Events
            </h1>
            {shouldHighlightTiket && (
              <div className={`text-xs px-3 py-1 rounded-full animate-pulse ${isDarkMode 
                ? 'bg-[#D7FE51]/30 text-[#D7FE51] border border-[#D7FE51]/50' 
                : 'bg-blue-100 text-blue-600 border border-blue-200'
              }`}>
                ⚡ Langsung ke Tiket
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* SECTION 1: INFORMASI KELAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Kelas Image */}
              <div className={`rounded-xl p-6 ${isDarkMode
                  ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50"
                  : "bg-white shadow-sm"
                }`}>
                {kelas.foto_url ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer relative group"
                    onClick={() => openImageModal(kelas.foto_url, kelas.nama_kelas)}
                  >
                    <img
                      src={kelas.foto_url}
                      alt={kelas.nama_kelas}
                      className="w-full h-64 object-cover rounded-lg transition-all duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-image.png";
                        e.target.classList.add("bg-gray-200", "dark:bg-gray-800");
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all duration-300">
                      <Eye
                        size={32}
                        className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      Klik untuk melihat foto
                    </div>
                  </motion.div>
                ) : (
                  <div className={`text-center p-8 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-[#363D30] text-[#ABB89D]' : 'border-gray-300 text-gray-500'
                    }`}>
                    <Users size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="italic">Tidak ada foto</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-6">
                  {/* Total Peserta */}
                  <div className={`text-center p-3 rounded-lg ${isDarkMode ? "bg-[#1A1F16] border border-[#363D30]" : "bg-gray-100"
                    }`}>
                    <p className={`text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                      }`}>Total Peserta</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Users size={16} className={
                        totalPeserta > 0 
                          ? (isDarkMode ? "text-[#D7FE51]" : "text-blue-600")
                          : (isDarkMode ? "text-gray-400" : "text-gray-500")
                      } />
                      <p className={`text-xl font-bold ${totalPeserta > 0 
                          ? (isDarkMode ? "text-[#D7FE51]" : "text-blue-600")
                          : (isDarkMode ? "text-gray-400" : "text-gray-500")
                        }`}>
                        {totalPeserta}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-500"
                      }`}>
                      orang
                    </p>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${isDarkMode ? "bg-[#1A1F16] border border-[#363D30]" : "bg-gray-100"
                    }`}>
                    <p className={`text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                      }`}>Tiket Tersedia</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Ticket size={16} className={
                        activeTiketCount > 0 
                          ? (isDarkMode ? "text-[#D7FE51]" : "text-purple-600")
                          : (isDarkMode ? "text-red-400" : "text-red-500")
                      } />
                      <p className={`text-xl font-bold ${activeTiketCount > 0 
                          ? (isDarkMode ? "text-[#D7FE51]" : "text-purple-600")
                          : (isDarkMode ? "text-red-400" : "text-red-500")
                        }`}>
                        {activeTiketCount}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-500"
                      }`}>
                      dari {tiketKategori.length} kategori
                    </p>
                  </div>
                </div>
              </div>

              {/* Kelas Details Card */}
              <div className={`rounded-xl p-6 ${isDarkMode
                  ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50"
                  : "bg-white shadow-sm"
                }`}>
                <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                  <Info size={20} className={isDarkMode ? "text-[#D7FE51]" : "text-blue-600"} />
                  Informasi Event
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                      }`}>Nama Event</label>
                    <p className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-800"
                      }`}>{kelas.nama_kelas || "-"}</p>
                  </div>

                  <div>
                    <label className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                      }`}>Kategori</label>
                    <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"
                      }`}>{kelas.kategori || "-"}</p>
                  </div>

                  <div>
                    <label className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                      }`}>Harga Tiket</label>
                    <p className={`font-semibold text-lg ${isDarkMode ? "text-[#D7FE51]" : "text-emerald-600"
                      }`}>{formatRupiah(kelas.biaya)}</p>
                  </div>

                  <div>
                    <label className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                      }`}>Total Peserta</label>
                    <div className="flex items-center gap-2">
                      <Users size={18} className={
                        isDarkMode ? "text-[#D7FE51]" : "text-blue-600"
                      } />
                      <p className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-800"
                      }`}>
                        {totalPeserta} orang
                      </p>
                    </div>
                  </div>
                </div>

                {/* MODIFIKASI: Tombol "Daftar Sekarang" dengan logika link navigasi */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Panggil handleBeliClick tanpa parameter tiket
                    handleBeliClick();
                  }}
                  className={`w-full mt-6 py-4 rounded-lg flex items-center justify-center gap-3 text-lg font-bold ${isDarkMode
                      ? "bg-gradient-to-r from-[#D7FE51] to-[#9ECB45] hover:from-[#C4E840] hover:to-[#8AB83D] text-[#1A1F16]"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    }`}
                >
                  <ShoppingCart size={24} />
                  <span>Daftar Sekarang</span>
                  <ChevronRight size={24} />
                </motion.button>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <div className={`rounded-xl p-6 ${isDarkMode
                  ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50"
                  : "bg-white shadow-sm"
                } h-full`}>
                <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                  Informasi Events
                </h3>

                <div className="space-y-8">
                  {/* Jadwal dan Ruangan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {kelas.jadwal && (
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border'
                        }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-orange-100'
                            }`}>
                            <Clock size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-orange-600"} />
                          </div>
                          <div>
                            <label className={`text-sm font-medium ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                              }`}>Waktu</label>
                            <p className={`font-medium mt-1 ${isDarkMode ? "text-[#D7FE51]" : "text-orange-800"
                              }`}>{kelas.jadwal}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {kelas.ruangan && (
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border'
                        }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-purple-100'
                            }`}>
                            <MapPin size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-purple-600"} />
                          </div>
                          <div>
                            <label className={`text-sm font-medium ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                              }`}>Lokasi</label>
                            <p className={`font-medium mt-1 ${isDarkMode ? "text-[#D7FE51]" : "text-purple-800"
                              }`}>{kelas.ruangan}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deskripsi */}
                  {kelas.deskripsi && (
                    <div className={`p-5 rounded-lg ${isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border'
                      }`}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-blue-100'
                          }`}>
                          <FileText size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-blue-600"} />
                        </div>
                        <div className="flex-1">
                          <label className={`text-sm font-medium block mb-3 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                            }`}>Deskripsi</label>
                          <div className={`mt-3 p-4 rounded-lg ${isDarkMode ? 'bg-[#0A0E0B] border border-[#363D30]' : 'bg-white border'
                            }`}>
                            <p className={`leading-relaxed ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                              }`}>{kelas.deskripsi}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GAMBARAN EVENT */}
                  {kelas.gambaran_event_urls && kelas.gambaran_event_urls.length > 0 && (
                    <div className={`p-5 rounded-lg ${isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border'
                      }`}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-purple-100'
                          }`}>
                          <Images size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-purple-600"} />
                        </div>
                        <div className="flex-1">
                          <label className={`text-sm font-medium block mb-3 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                            }`}>
                            Gambaran Event
                          </label>
                          
                          <div className="mb-4">
                            <p className={`text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                              }`}>
                              Lihat foto-foto seputar gambaran event <strong>{kelas.nama_kelas}</strong>.
                            </p>
                            <p className={`text-xs mt-2 ${isDarkMode ? "text-[#646B5E]" : "text-gray-500"
                              }`}>
                              Klik foto untuk melihat detail
                            </p>
                          </div>
                          
                          <div className="relative">
                            <div className="flex space-x-4 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#363D30] scrollbar-track-transparent">
                              {kelas.gambaran_event_urls.map((url, index) => (
                                <motion.div
                                  key={index}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex-shrink-0 cursor-pointer group relative"
                                  onClick={() => openGambaranModal(index)}
                                >
                                  <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-[#363D30]">
                                    <img
                                      src={url}
                                      alt={`Gambaran event ${index + 1}`}
                                      className="w-48 h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/default-image.png";
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Eye size={24} className="text-white" />
                                  </div>
                                  <div className="mt-2 text-center">
                                    <p className={`text-xs font-medium ${
                                      isDarkMode ? "text-[#ABB89D]" : "text-gray-700"
                                    }`}>
                                      Foto {index + 1}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                          
                          <div className={`mt-4 pt-4 border-t ${
                            isDarkMode ? 'border-[#363D30]' : 'border-gray-200'
                          }`}>
                            <p className={`text-xs ${
                              isDarkMode ? 'text-[#ABB89D]' : 'text-gray-500'
                            }`}>
                              Total {kelas.gambaran_event_urls.length} foto • Geser untuk melihat lebih banyak
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informasi Tanggal */}
                  <div className={`p-5 rounded-lg ${isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border'
                    }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#0A0E0B] border border-[#363D30]' : 'bg-white border'
                        }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-blue-100'
                            }`}>
                            <Calendar size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-blue-600"} />
                          </div>
                          <div className="flex-1">
                            <label className={`text-sm font-medium ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                              }`}>Tanggal Dibuat</label>
                            <p className={`font-medium mt-1 ${isDarkMode ? "text-white" : "text-gray-800"
                              }`}>
                              {kelas.created_at ? new Date(kelas.created_at).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#0A0E0B] border border-[#363D30]' : 'bg-white border'
                        }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#D7FE51]/20' : 'bg-green-100'
                            }`}>
                            <RefreshCw size={18} className={isDarkMode ? "text-[#D7FE51]" : "text-green-600"} />
                          </div>
                          <div className="flex-1">
                            <label className={`text-sm font-medium ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                              }`}>Terakhir Diupdate</label>
                            <p className={`font-medium mt-1 ${isDarkMode ? "text-white" : "text-gray-800"
                              }`}>
                              {kelas.updated_at ? new Date(kelas.updated_at).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-[#363D30]' : 'border-gray-200'
                      }`}>
                      <p className={`text-xs ${isDarkMode ? 'text-[#ABB89D]' : 'text-gray-500'
                        }`}>
                        Data ini menunjukkan riwayat event sejak dibuat dan terakhir diperbarui.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: KATEGORI TIKET */}
          <div 
            ref={tiketSectionRef} 
            className={`rounded-xl p-8 transition-all duration-300 ${isDarkMode
                ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50"
                : "bg-white shadow-sm"
              } ${shouldHighlightTiket ? 'animate-pulse-subtle' : ''}`}
            id="tiket-kategori-section"
            style={shouldHighlightTiket ? {
              border: isDarkMode 
                ? '2px solid rgba(215, 254, 81, 0.5)' 
                : '2px solid rgba(100, 107, 94, 0.5)',
              boxShadow: isDarkMode 
                ? '0 0 20px rgba(215, 254, 81, 0.3)' 
                : '0 0 20px rgba(100, 107, 94, 0.3)'
            } : {}}
          >
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className={`p-3 rounded-lg ${isDarkMode ? "bg-[#D7FE51]/20" : "bg-purple-100"
                    }`}>
                    <Ticket size={28} className={
                      isDarkMode ? "text-[#D7FE51]" : "text-purple-600"
                    } />
                  </div>
                  <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"
                    }`}>
                    KATEGORI TIKET
                  </h2>
                  {shouldHighlightTiket && (
                    <div className={`text-xs px-3 py-1 rounded-full ${isDarkMode 
                      ? 'bg-[#D7FE51]/30 text-[#D7FE51] border border-[#D7FE51]/50' 
                      : 'bg-blue-100 text-blue-600 border border-blue-200'
                    }`}>
                      ⚡ Langsung ke Tiket
                    </div>
                  )}
                </div>
                <p className={`text-lg ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                  Pilih Kategori Tiket yang Tersedia
                </p>
                {activeTiketCount < tiketKategori.length && (
                  <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDarkMode 
                    ? 'bg-yellow-900/30 text-yellow-400' 
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <AlertTriangle size={14} />
                    <span className="text-sm">
                      {tiketKategori.length - activeTiketCount} kategori tidak tersedia
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className={`text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                  {activeTiketCount} dari {tiketKategori.length} kategori tiket tersedia
                </div>
                {activeTiketCount === 0 && (
                  <div className={`text-sm flex items-center gap-2 ${isDarkMode ? "text-red-400" : "text-red-600"
                    }`}>
                    <AlertCircle size={16} />
                    <span>Tidak ada tiket yang tersedia</span>
                  </div>
                )}
              </div>

              {loadingTiket ? (
                <div className="flex justify-center py-12">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-[#D7FE51]' : 'border-purple-600'
                    }`}></div>
                </div>
              ) : tiketKategori.length === 0 ? (
                <div className={`text-center py-16 rounded-xl ${isDarkMode ? "bg-[#1A1F16]/50" : "bg-gray-50"
                  }`}>
                  <div className={`p-4 rounded-full mx-auto mb-6 ${
                    isDarkMode ? "bg-red-900/20" : "bg-red-100"
                  }`}>
                    <AlertCircle size={64} className={`mx-auto ${
                      isDarkMode ? "text-red-400" : "text-red-500"
                    }`} />
                  </div>
                  <h4 className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-800"
                    }`}>
                    Tiket Tidak Tersedia
                  </h4>
                  <p className={`mb-6 max-w-md mx-auto ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}>
                    Belum ada tiket untuk kelas ini. Silakan hubungi admin atau coba lagi nanti.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/")}
                      className={`px-6 py-3 rounded-xl font-semibold ${
                        isDarkMode
                          ? "bg-[#363D30] hover:bg-[#2A3025] text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      Kembali ke Beranda
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fetchTiketKategori()}
                      className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 ${
                        isDarkMode
                          ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      <RefreshCw size={18} />
                      Refresh Tiket
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {tiketKategori.map((tiket, index) => (
                    <TiketKategoriCard key={tiket.id} tiket={tiket} index={index} />
                  ))}
                </div>
              )}

              {activeTiketCount < tiketKategori.length && (
                <div className={`mt-8 p-4 rounded-lg border ${isDarkMode 
                  ? 'border-yellow-700/30 bg-yellow-900/10' 
                  : 'border-yellow-300 bg-yellow-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className={`mt-0.5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Informasi Tiket
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-yellow-400/80' : 'text-yellow-600/90'}`}>
                        Tiket yang sudah habis tidak tersedia untuk pembelian. 
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal untuk gambar utama */}
      <AnimatePresence>
        {showImageModal && modalImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeImageModal}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X size={24} />
              </motion.button>

              <img
                src={modalImageUrl}
                alt={modalImageAlt}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-image.png";
                }}
              />

              <div className="text-center mt-4">
                <p className="text-white text-lg font-medium">{modalImageAlt}</p>
                <p className="text-gray-400 text-sm">
                  Foto Kelas • Klik di luar gambar untuk menutup
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal untuk gambaran event */}
      <AnimatePresence>
        {showGambaranModal && kelas.gambaran_event_urls && kelas.gambaran_event_urls.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-6xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeImageModal}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X size={24} />
              </motion.button>
              
              {kelas.gambaran_event_urls.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full"
                  >
                    <ChevronLeft size={28} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full"
                  >
                    <ChevronRightIcon size={28} />
                  </motion.button>
                </>
              )}
              
              <img
                src={kelas.gambaran_event_urls[selectedImageIndex]}
                alt={`Gambaran event ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-image.png";
                }}
              />
              
              <div className="text-center mt-6">
                <p className="text-white text-lg font-medium">
                  Gambaran Event {selectedImageIndex + 1} dari {kelas.gambaran_event_urls.length}
                </p>
                
                {kelas.gambaran_event_urls.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {kelas.gambaran_event_urls.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === selectedImageIndex
                            ? 'bg-white w-6'
                            : 'bg-gray-500 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                <p className="text-gray-400 text-sm mt-4">
                  Klik di luar gambar untuk menutup • Gunakan tombol panah untuk navigasi
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
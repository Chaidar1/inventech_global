import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAppTheme } from "../hooks/useTheme";

export default function EditStokUnit() {
  const { id, kode } = useParams(); // id barang + kode unit
  const navigate = useNavigate();
  const { isDarkMode } = useAppTheme();

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

    // Initialize particles
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

  const [formData, setFormData] = useState({
    kode: "",
    kondisi: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [barangInfo, setBarangInfo] = useState(null);

  // Ambil data unit dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/barang/${id}/stok/${kode}`);
        
        if (!response.ok) {
          throw new Error(`Unit tidak ditemukan (${response.status})`);
        }
        
        const data = await response.json();
        
        setFormData({
          kode: data.kode || "",
          kondisi: data.kondisi || "",
          status: data.status || "",
        });

        // Ambil info barang untuk konteks
        const barangResponse = await fetch(`http://localhost:8000/barang/${id}`);
        if (barangResponse.ok) {
          const barangData = await barangResponse.json();
          setBarangInfo(barangData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Gagal memuat unit:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
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
    
    if (!formData.kondisi && !formData.status) {
      toast.error("❌ Pilih setidaknya satu field untuk diupdate", {
        duration: 3000,
        style: {
          background: isDarkMode ? "#dc2626" : "#dc2626",
          color: "#fff",
        },
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      // Gunakan FormData untuk konsistensi
      const formDataToSend = new FormData();
      if (formData.kondisi) formDataToSend.append("kondisi", formData.kondisi);
      if (formData.status) formDataToSend.append("status", formData.status);

      const res = await fetch(
        `http://localhost:8000/barang/${id}/stok/${kode}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.detail || `Gagal mengupdate unit (${res.status})`);
      }

      toast.success("✅ Unit berhasil diperbarui!", {
        duration: 2000,
        style: {
          background: "#16a34a",
          color: "#fff",
          fontWeight: "bold",
        },
      });

      setTimeout(() => navigate(`/barang/${id}`), 1500);
    } catch (err) {
      console.error("Error updating unit:", err);
      toast.error(`❌ ${err.message}`, {
        duration: 4000,
        style: {
          background: "#dc2626",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900 text-slate-300" : "bg-gray-50 text-gray-600"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Memuat data unit...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center p-6 transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}>
        <div className={`max-w-md w-full p-6 rounded-2xl text-center ${
          isDarkMode ? "bg-slate-800" : "bg-white shadow-lg"
        }`}>
          <div className="text-6xl mb-4">😕</div>
          <h2 className={`text-xl font-bold mb-2 ${
            isDarkMode ? "text-red-400" : "text-red-600"
          }`}>
            Terjadi Kesalahan
          </h2>
          <p className={`mb-6 ${
            isDarkMode ? "text-slate-300" : "text-gray-600"
          }`}>
            {error}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className={`px-4 py-2 rounded transition-colors ${
                isDarkMode 
                  ? "bg-slate-600 hover:bg-slate-500 text-white" 
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }`}
            >
              Kembali
            </button>
            <button
              onClick={() => window.location.reload()}
              className={`px-4 py-2 rounded transition-colors ${
                isDarkMode 
                  ? "bg-blue-600 hover:bg-blue-500 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <>
      <div className={`min-h-screen flex items-center justify-center p-6 relative transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}>
        {/* Canvas untuk particles di dark mode */}
        {isDarkMode && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        )}

        <div className={`shadow-lg rounded-2xl w-full max-w-md relative z-10 transition-colors duration-300 ${
          isDarkMode 
            ? "bg-slate-800/80 border border-slate-700 backdrop-blur-sm" 
            : "bg-white shadow-xl"
        }`}>
          
          {/* Header */}
          <div className={`p-6 border-b ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}>
            <h2 className={`text-2xl font-bold text-center ${
              isDarkMode ? "text-blue-400" : "text-[#FF9913]"
            }`}>
              Edit Unit Barang
            </h2>
            {barangInfo && (
              <p className={`text-center mt-2 text-sm ${
                isDarkMode ? "text-slate-400" : "text-gray-600"
              }`}>
                {barangInfo.nama_barang}
              </p>
            )}
          </div>

          {/* Toaster untuk notifikasi */}
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: isDarkMode ? '#1e293b' : '#fff',
                color: isDarkMode ? '#f8fafc' : '#1f2937',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Kode Unit (readonly) */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-slate-200" : "text-gray-700"
              }`}>
                Kode Unit
              </label>
              <input
                type="text"
                name="kode"
                value={formData.kode}
                readOnly
                className={`mt-1 block w-full border rounded-xl px-4 py-3 cursor-not-allowed transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-slate-700 border-slate-600 text-slate-300" 
                    : "border-gray-300 bg-gray-100 text-gray-600"
                }`}
              />
              <p className={`text-xs mt-1 ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>
                Kode unit tidak dapat diubah
              </p>
            </div>

            {/* Kondisi - DIPERBAIKI untuk sinkron dengan backend */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-slate-200" : "text-gray-700"
              }`}>
                Kondisi Barang
              </label>
              <select
                name="kondisi"
                value={formData.kondisi}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    : "border-gray-300 focus:ring-2 focus:ring-[#FF9913] focus:border-[#FF9913]"
                }`}
              >
                <option value="">-- Pilih Kondisi --</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                <option value="Hilang">Hilang</option>
              </select>
              <p className={`text-xs mt-1 ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>
                Pilih kondisi fisik barang
              </p>
            </div>

            {/* Status - DIPERBAIKI untuk sinkron dengan backend */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-slate-200" : "text-gray-700"
              }`}>
                Status Ketersediaan
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    : "border-gray-300 focus:ring-2 focus:ring-[#FF9913] focus:border-[#FF9913]"
                }`}
              >
                <option value="">-- Pilih Status --</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Dipinjam">Dipinjam</option>
                <option value="Rusak">Rusak</option>
                <option value="Menunggu">Menunggu</option>
              </select>
              <p className={`text-xs mt-1 ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>
                Pilih status ketersediaan barang
              </p>
            </div>

            {/* Preview Changes */}
            {(formData.kondisi || formData.status) && (
              <div className={`p-4 rounded-xl border ${
                isDarkMode ? "bg-slate-700 border-slate-600" : "bg-blue-50 border-blue-200"
              }`}>
                <h3 className={`text-sm font-semibold mb-2 ${
                  isDarkMode ? "text-blue-300" : "text-blue-800"
                }`}>
                  Perubahan yang akan disimpan:
                </h3>
                <div className="space-y-1 text-sm">
                  {formData.kondisi && (
                    <p className={isDarkMode ? "text-slate-300" : "text-blue-700"}>
                      • Kondisi: <span className="font-medium">{formData.kondisi}</span>
                    </p>
                  )}
                  {formData.status && (
                    <p className={isDarkMode ? "text-slate-300" : "text-blue-700"}>
                      • Status: <span className="font-medium">{formData.status}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => navigate(`/barang/${id}`)}
                disabled={submitting}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDarkMode 
                    ? "bg-slate-600 hover:bg-slate-500 text-white disabled:bg-slate-700" 
                    : "bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-400"
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || (!formData.kondisi && !formData.status)}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDarkMode 
                    ? "bg-blue-600 hover:bg-blue-500 text-white disabled:bg-blue-800" 
                    : "bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </span>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
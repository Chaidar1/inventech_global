import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import socketService from "../services/socket";

export default function DetailBarangUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [barang, setBarang] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exitAnim, setExitAnim] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Setup Socket
  useEffect(() => {
    socketService.connect();
    setSocketConnected(socketService.isConnected);

    socketService.on("unitStatusUpdated", handleUnitStatusUpdate);
    socketService.on("connect", () => setSocketConnected(true));
    socketService.on("disconnect", () => setSocketConnected(false));

    return () => {
      socketService.off("unitStatusUpdated", handleUnitStatusUpdate);
      socketService.off("connect");
      socketService.off("disconnect");
    };
  }, []);

  // Real-time update handler
  const handleUnitStatusUpdate = (data) => {
    if (data.itemId === parseInt(id) || data.barangId === parseInt(id)) {
      setBarang((prevBarang) => {
        if (!prevBarang || !prevBarang.stok) return prevBarang;

        const updatedStok = prevBarang.stok.map((unit) =>
          unit.kode === data.unitCode || unit.id === data.unitId
            ? { ...unit, status: data.newStatus }
            : unit
        );

        return { ...prevBarang, stok: updatedStok };
      });
    }
  };

  // Fallback sync jika socket terputus
  useEffect(() => {
    let syncInterval;
    if (!socketConnected) {
      syncInterval = setInterval(() => {
        fetchBarang();
      }, 30000);
    }
    return () => {
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [socketConnected, id]);

  // Fetch detail barang
  const fetchBarang = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8000/barang/${id}`, {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) throw new Error("Barang tidak ditemukan");

      const data = await res.json();
      setBarang(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, [id]);

  useEffect(() => {
    if (location.state?.updatedBarang) {
      setBarang(location.state.updatedBarang);
    }
  }, [location.state]);

  // Pinjam unit → navigasi ke halaman pinjam
  const handlePinjamUnit = async (unit) => {
    if (unit.kondisi === "Rusak") {
      Swal.fire({
        title: "Unit Rusak",
        text: `Unit ${unit.kode} dalam kondisi rusak dan tidak bisa dipinjam.`,
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      return;
    }

    if (unit.status !== "Tersedia") {
      Swal.fire({
        title: "Tidak Bisa Dipinjam",
        text: `Unit ${unit.kode} sedang ${unit.status.toLowerCase()}, pilih unit lain.`,
        icon: "warning",
        confirmButtonColor: "#f0ad4e",
        confirmButtonText: "OK",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Konfirmasi Peminjaman",
      text: `Apakah Anda ingin meminjam unit ${unit.kode}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Ya, lanjut",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    navigate(`/pinjam/${barang.id}`, {
      state: { unitKode: unit.kode },
    });
  };

  // Exit animasi
  const handleExit = () => {
    setExitAnim(true);
    setTimeout(() => navigate("/barang"), 400);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600 animate-pulse">Memuat data barang...</p>
      </div>
    );
  }

  if (error || !barang || barang.detail === "Barang tidak ditemukan") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-lg font-medium text-red-600">
          {error || "Barang tidak ditemukan"}
        </p>
        <button
          onClick={handleExit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-cover bg-center relative px-4 py-10"
        style={{ backgroundImage: "url('/detail-bg.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60" />

        <motion.div
          animate={exitAnim ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 bg-white bg-opacity-95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition text-sm"
            >
              ← Kembali
            </motion.button>

            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold text-[#FF9913]">Detail Barang</h2>
            </div>
          </div>

          {/* Info barang */}
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            {/* Foto */}
            <div className="flex-shrink-0 flex justify-center w-full md:w-1/3">
              {barang.foto ? (
                <motion.img
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                  src={`http://localhost:8000/uploads/${barang.foto}`}
                  alt={barang.nama_barang}
                  className="rounded-xl shadow-lg max-w-[280px] w-full object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-image.png";
                  }}
                />
              ) : (
                <div className="text-gray-500 text-center italic">
                  📷 Tidak ada foto
                </div>
              )}
            </div>

            {/* Detail */}
            <div className="text-gray-800 text-base font-medium flex-1 space-y-4">
              <p>
                <span className="font-semibold">📦 Nama Barang:</span>{" "}
                {barang.nama_barang || "-"}
              </p>
              <p>
                <span className="font-semibold">📂 Kategori:</span>{" "}
                {barang.kategori || "-"}
              </p>
              <p>
                <span className="font-semibold">📅 Tahun Perolehan:</span>{" "}
                {barang.tahun_perolehan || "2025"}
              </p>
              <p>
                <span className="font-semibold">📦 Jumlah Unit:</span>{" "}
                {barang.stok?.length ?? 0}
              </p>
              <p>
                <span className="font-semibold">📑 Deskripsi:</span>{" "}
                {barang.deskripsi || "-"}
              </p>
            </div>
          </div>

          {/* Daftar Unit */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Daftar Unit Barang
            </h3>

            {barang.stok && barang.stok.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left">Kode</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Kondisi</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-3 py-2 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barang.stok.map((unit, index) => {
                      const isDisabled =
                        unit.status !== "Tersedia" || unit.kondisi === "Rusak";

                      return (
                        <tr key={unit.kode || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2">
                            {unit.kode || `Unit #${index + 1}`}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <span
                              className={`px-2 py-1 rounded text-white text-xs ${
                                unit.kondisi === "Baik"
                                  ? "bg-green-500"
                                  : unit.kondisi?.includes("Kurang")
                                  ? "bg-yellow-500"
                                  : unit.kondisi?.includes("Rusak")
                                  ? "bg-red-600"
                                  : "bg-gray-400"
                              }`}
                            >
                              {unit.kondisi || "-"}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <span
                              className={`px-2 py-1 rounded text-white text-xs ${
                                unit.status === "Tersedia"
                                  ? "bg-green-600"
                                  : unit.status === "Dipinjam"
                                  ? "bg-blue-500"
                                  : "bg-orange-500"
                              }`}
                            >
                              {unit.status || "-"}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <motion.button
                              whileHover={{ scale: !isDisabled ? 1.05 : 1 }}
                              whileTap={{ scale: !isDisabled ? 0.95 : 1 }}
                              disabled={isDisabled}
                              onClick={() => handlePinjamUnit(unit)}
                              data-tooltip-id={`tooltip-${unit.kode}`}
                              data-tooltip-content={
                                isDisabled
                                  ? unit.kondisi === "Rusak"
                                    ? "Tidak bisa dipinjam karena rusak"
                                    : "Unit sedang tidak tersedia"
                                  : "Klik untuk meminjam unit ini"
                              }
                              className={`px-3 py-1 rounded shadow text-xs text-white ${
                                !isDisabled
                                  ? "bg-blue-500 hover:bg-green-700"
                                  : "bg-gray-400 cursor-not-allowed"
                              }`}
                            >
                              Pinjam
                            </motion.button>
                            <Tooltip id={`tooltip-${unit.kode}`} place="top" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                Belum ada detail unit barang.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

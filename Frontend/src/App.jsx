import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import axios from "axios";

// Socket
import socketService from './services/socket';

// Komponen
import Home from "./components/Home";
import HomeUser from "./components/HomeUser"; 
import DetailBarang from "./components/DetailBarang";
import DetailBarangUser from "./components/DetailBarangUser"; 
import TambahBarang from "./components/TambahBarang";
import EditBarang from "./components/EditBarang";
import EditStokUnit from "./components/EditStokUnit";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import InventarisList from "./components/InventarisList";
import InventarisListUser from "./components/InventarisListUser";
import TambahKategori from "./components/TambahKategori";
import PinjamBarang from "./components/PinjamBarang";
import VerifikasiPeminjaman from "./components/Verifikasi";
import DetailVerifikasi from "./components/DetailVerifikasi";
import Riwayat from "./components/Riwayat";
import DetailRiwayat from "./components/DetailRiwayat";
import KembalikanBarang from "./components/KembalikanBarang"; // ✅ Tambahan
import Navbar from "./components/Navbar";

// Inisialisasi socket
socketService.connect();
window.socketService = socketService;

function AppContent() {
  const [barangData, setBarangData] = useState([]);
  const [kategoriData, setKategoriData] = useState([]);
  const location = useLocation();
  const role = localStorage.getItem("role");

  useEffect(() => {
    axios.get("http://localhost:8000/barang").then((res) => {
      setBarangData(res.data);

      const kategoriUnik = [...new Set(res.data.map((barang) => barang.kategori))];
      setKategoriData(kategoriUnik);
    });
  }, []);

  return (
    <>
      {/* Navbar tidak tampil di halaman login */}
      {location.pathname !== "/login" && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<h1>Akses Ditolak ❌</h1>} />

        {/* Shared (admin & user) */}
        <Route
          path="/"
          element={
            <PrivateRoute allowedRoles={["admin", "user"]}>
              {role === "admin" ? <Home /> : <HomeUser />}
            </PrivateRoute>
          }
        />
        <Route
          path="/barang"
          element={
            <PrivateRoute allowedRoles={["admin", "user"]}>
              {role === "admin" ? (
                <InventarisList
                  barangData={barangData}
                  setBarangData={setBarangData}
                  kategoriData={kategoriData}
                />
              ) : (
                <InventarisListUser
                  barangData={barangData}
                  kategoriData={kategoriData}
                />
              )}
            </PrivateRoute>
          }
        />
        <Route
          path="/barang/:id"
          element={
            <PrivateRoute allowedRoles={["admin", "user"]}>
              {role === "admin" ? <DetailBarang /> : <DetailBarangUser />}
            </PrivateRoute>
          }
        />

        {/* Admin-only */}
        <Route
          path="/tambah"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <TambahBarang setBarangData={setBarangData} />
            </PrivateRoute>
          }
        />
        <Route
          path="/kategori/tambah"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <TambahKategori />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <EditBarang barangData={barangData} setBarangData={setBarangData} />
            </PrivateRoute>
          }
        />
        <Route
          path="/barang/:id/stok/:kode/edit"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <EditStokUnit />
            </PrivateRoute>
          }
        />
        <Route
          path="/verifikasi"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <VerifikasiPeminjaman />
            </PrivateRoute>
          }
        />
        <Route
          path="/detail-verifikasi/:id"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <DetailVerifikasi />
            </PrivateRoute>
          }
        />

        {/* User-only */}
        <Route
          path="/pinjam/:id"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <PinjamBarang />
            </PrivateRoute>
          }
        />
        <Route
          path="/riwayat"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <Riwayat />
            </PrivateRoute>
          }
        />
        <Route
          path="/detail-peminjaman/:id"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <DetailRiwayat />
            </PrivateRoute>
          }
        />
        <Route
          path="/kembalikan"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <KembalikanBarang />
            </PrivateRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

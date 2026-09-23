import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import axios from "axios";

// Socket
import socketService from './services/socket';

// Theme Context
import { ThemeProvider } from "./context/ThemeContext";

// Komponen
import Home from "./components/Home";
import HomeUser from "./components/HomeUser"; 
import DetailKelas from "./components/DetailKelas";
import DetailKelasUser from "./components/DetailKelasUser";
import TambahKelas from "./components/TambahKelas";
import EditKelas from "./components/EditKelas";
import Login from "./components/Login";
import LoginAdmin from "./components/LoginAdmin";
import RegisterUser from "./components/RegisterUser";
import PrivateRoute from "./components/PrivateRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import KelasList from "./components/KelasList";
import KelasListUser from "./components/KelasListUser";
import TambahKategori from "./components/TambahKategori";
import Navbar from "./components/Navbar";
import TentangKami from "./components/TentangKami";
import TentangKamiAdmin from "./components/TentangKamiAdmin";
import LayananKamiAdmin from "./components/LayananKamiAdmin";
import FooterKontakEditor from "./components/FooterKontakEditor";
import Kontak from "./components/Kontak";
import KontakAdmin from "./components/KontakAdmin";
import Layanan from "./components/Layanan";

// ✅ TAMBAHKAN IMPORT UNTUK PARTNER
import Partner from "./components/Partner"; // Halaman public Partner
import PartnerAdmin from "./components/PartnerAdmin"; // Halaman admin Partner

// Inisialisasi socket
socketService.connect();
window.socketService = socketService;

// Hook sederhana untuk update title berdasarkan URL
function useTitleUpdater() {
  const location = useLocation();
  
  useEffect(() => {
    // LOGIKA SANGAT SEDERHANA:
    // Jika path mengandung "/admin" → "Gastronomi Admin"
    // Selain itu → "Gastronomi Run"
    if (location.pathname.startsWith('/admin')) {
      document.title = 'Gastronomi Admin';
    } else {
      document.title = 'Gastronomi Run';
    }
  }, [location]);
}

function AppContent() {
  const [kelasData, setKelasData] = useState([]);
  const [kategoriData, setKategoriData] = useState([]);
  const location = useLocation();

  // Gunakan title updater
  useTitleUpdater();

  // Path yang tidak perlu navbar
  const hideNavbarPaths = ["/login", "/register", "/admin/login"];

  // Hapus navbar jika di path tertentu
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  useEffect(() => {
    // Fetch data dari endpoint /kelas
    axios.get("http://localhost:8000/kelas")
      .then((res) => {
        console.log("Data kelas berhasil di-fetch:", res.data);
        setKelasData(res.data);
        
        // Ekstrak kategori dari data kelas
        const kategoriUnik = [...new Set(res.data.map((kelas) => {
          return kelas.kategori || "";
        }))];
        setKategoriData(kategoriUnik.filter(Boolean));
        console.log("Kategori unik:", kategoriUnik.filter(Boolean));
      })
      .catch((err) => {
        console.error("Error fetching kelas data:", err);
      });
  }, []);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        {/* ==================== */}
        {/* PUBLIC USER ROUTES */}
        {/* ==================== */}
        <Route path="/" element={<HomeUser />} />
        <Route path="/tentang-kami" element={<TentangKami />} />
        <Route path="/layanan" element={<Layanan />} />
        
        {/* ✅ TAMBAHKAN ROUTE UNTUK PARTNER (PUBLIC) */}
        <Route path="/partner" element={<Partner />} />
        
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/events" element={<KelasListUser kelasData={kelasData} kategoriData={kategoriData} />} />
        <Route path="/events/:id" element={<DetailKelasUser />} />
        <Route path="/barang/:id" element={<DetailKelasUser />} />
        
        {/* Login dan Register (opsional) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        
        {/* ==================== */}
        {/* ADMIN LOGIN PAGE */}
        {/* ==================== */}
        <Route path="/admin/login" element={<LoginAdmin />} />
        
        {/* ==================== */}
        {/* ADMIN AREA ROUTES dengan AdminProtectedRoute */}
        {/* ==================== */}
        <Route element={<AdminProtectedRoute />}>
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Home />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/events"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <KelasList
                  kelasData={kelasData}
                  setKelasData={setKelasData}
                  kategoriData={kategoriData}
                />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/tambah-events"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <TambahKelas />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/events/:id"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <DetailKelas />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/edit-events/:id"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <EditKelas />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/kategori/tambah"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <TambahKategori />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/tentang-kami"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <TentangKamiAdmin />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/layanan"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <LayananKamiAdmin />
              </PrivateRoute>
            }
          />
          
          {/* ✅ TAMBAHKAN ROUTE UNTUK PARTNER ADMIN */}
          <Route
            path="/admin/partner"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <PartnerAdmin />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/kontak"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <KontakAdmin />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/footer-kontak"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <FooterKontakEditor />
              </PrivateRoute>
            }
          />
        </Route>
        
        {/* ==================== */}
        {/* REDIRECT ROUTES */}
        {/* ==================== */}
        <Route path="/about" element={<Navigate to="/tentang-kami" replace />} />
        <Route path="/contact" element={<Navigate to="/kontak" replace />} />
        <Route path="/services" element={<Navigate to="/layanan" replace />} />
        <Route path="/layanan-kami" element={<Navigate to="/layanan" replace />} />
        <Route path="/barang" element={<Navigate to="/events" replace />} />
        <Route path="/tambah-events" element={<Navigate to="/admin/tambah-events" replace />} />
        <Route path="/admin/tambah" element={<Navigate to="/admin/tambah-events" replace />} />
        
        {/* ✅ TAMBAHKAN REDIRECT UNTUK PARTNER */}
        <Route path="/partners" element={<Navigate to="/partner" replace />} />
        <Route path="/sponsorship" element={<Navigate to="/partner" replace />} />
        <Route path="/sponsors" element={<Navigate to="/partner" replace />} />
        
        {/* ==================== */}
        {/* ADMIN ROOT REDIRECT */}
        {/* ==================== */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
        
        {/* ==================== */}
        {/* 404 PAGE */}
        {/* ==================== */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center max-w-2xl">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-6">Halaman tidak ditemukan</p>
              <a href="/" className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition inline-block">
                Kembali ke Beranda
              </a>
            </div>
          </div>
        } />
      </Routes>

      <ToastContainer 
        position="top-center" 
        autoClose={2000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
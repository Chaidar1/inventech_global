import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminProtectedRoute = () => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      
      // Cek jika tidak ada token atau bukan admin
      if (!token || role !== "admin") {
        // Clear localStorage untuk admin
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("loginUsername");
        localStorage.removeItem("nama_lengkap");
        localStorage.removeItem("profile");
        localStorage.removeItem("lastActiveTime");
        localStorage.removeItem("wasAdmin");
        
        window.dispatchEvent(new Event('storage'));
        setIsAuthenticated(false);
        setIsValidating(false);
        toast.error("🔒 Akses ditolak. Silakan login sebagai admin");
        return;
      }

      try {
        // Cek token ke backend
        await axios.get("http://localhost:8000/auth/check", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        // Update last active time untuk inactivity detection
        localStorage.setItem("lastActiveTime", Date.now().toString());
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token validation failed:", error);
        // Clear localStorage jika token tidak valid
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("loginUsername");
        localStorage.removeItem("nama_lengkap");
        localStorage.removeItem("profile");
        localStorage.removeItem("lastActiveTime");
        localStorage.removeItem("wasAdmin");
        
        window.dispatchEvent(new Event('storage'));
        
        toast.error("🔒 Sesi telah berakhir. Silakan login kembali");
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();

    // Setup inactivity timer reset events
    const resetInactiveTimer = () => {
      localStorage.setItem("lastActiveTime", Date.now().toString());
    };

    // Cek interval untuk auto logout setelah waktu tertentu
    const inactivityCheckInterval = setInterval(() => {
      const role = localStorage.getItem("role");
      if (role === "admin") {
        const lastActive = localStorage.getItem("lastActiveTime");
        const currentTime = Date.now();
        const inactiveDuration = currentTime - (parseInt(lastActive) || currentTime);
        const MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 menit
        
        if (inactiveDuration > MAX_INACTIVE_TIME) {
          // Auto logout
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("loginUsername");
          localStorage.removeItem("nama_lengkap");
          localStorage.removeItem("profile");
          localStorage.removeItem("lastActiveTime");
          localStorage.removeItem("wasAdmin");
          
          window.dispatchEvent(new Event('storage'));
          setIsAuthenticated(false);
          
          toast.info("⏰ Sesi telah berakhir karena tidak aktif");
          navigate("/admin/login");
          clearInterval(inactivityCheckInterval);
        } else if (inactiveDuration > 25 * 60 * 1000) {
          // Warning 5 menit sebelum logout
          toast.warning("⚠️ Sesi akan berakhir dalam 5 menit");
        }
      }
    }, 60000); // Cek setiap 1 menit

    // Tambahkan event listeners untuk reset timer
    const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetInactiveTimer);
    });

    // Cleanup function
    return () => {
      clearInterval(inactivityCheckInterval);
      events.forEach(event => {
        window.removeEventListener(event, resetInactiveTimer);
      });
    };
  }, [navigate]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D7FE51] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Memverifikasi sesi admin...</p>
          <p className="text-[#ABB89D] text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;
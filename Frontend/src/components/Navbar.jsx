import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLogin, setIsLogin] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    setIsLogin(!!token);
    setRole(savedRole);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLogin(false);
    setRole(null);
    navigate("/login");
  };

  return (
    <nav
      className="relative bg-[#FF9913] text-white py-4 px-6 shadow-md flex items-center justify-between"
      style={{
        background: "linear-gradient(90deg, #FF9913, #e08a10)",
      }}
    >
      {/* Kiri: Judul */}
      <div className="font-bold text-lg">📦 Inventaris</div>

      {/* Tengah: Menu */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-6 font-semibold">
        <Link to="/" className="hover:text-yellow-100 transition-colors">
          Beranda
        </Link>
        <Link to="/barang" className="hover:text-yellow-100 transition-colors">
          Barang
        </Link>

        {role === "admin" && (
          <Link
            to="/verifikasi"
            className="hover:text-yellow-100 transition-colors"
          >
            Verifikasi
          </Link>
        )}

        {role === "user" && (
          <Link
            to="/riwayat"
            className="hover:text-yellow-100 transition-colors"
          >
            Riwayat
          </Link>
        )}
      </div>

      {/* Kanan: Logout */}
      {isLogin && (
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
        >
          Logout
        </button>
      )}
    </nav>
  );
}
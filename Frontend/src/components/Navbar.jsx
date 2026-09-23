import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Shield, Menu, X, Home, Calendar, Info, Briefcase, Phone, LogOut, User, Handshake } from "lucide-react";

export default function Navbar() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Tentukan apakah user berada di halaman admin
  const isAdminPath = location.pathname.startsWith("/admin");

  // Update status admin login
  const updateAdminStatus = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    // Cek apakah admin sedang login
    setIsAdminLoggedIn(!!(token && role === 'admin'));
  };

  useEffect(() => {
    // SETEL TEMA DARK SECARA MANUAL DI LOCALSTORAGE
    localStorage.setItem("theme", "dark");
    document.documentElement.classList.add("dark");
    
    updateAdminStatus();

    // Update setiap 3 detik
    const interval = setInterval(updateAdminStatus, 3000);

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location]);

  useEffect(() => {
    // Tutup mobile menu saat route berubah
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("profile");
    setIsAdminLoggedIn(false);
    setIsMobileMenuOpen(false);

    // Redirect berdasarkan halaman saat ini
    if (isAdminPath) {
      navigate("/admin-login");
    } else {
      navigate("/");
      window.location.reload();
    }
  };

  // Fungsi untuk menentukan apakah link aktif
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Menu untuk user biasa (non-admin) - SEMUA USER BISA LIHAT
  const userMenuItems = [
    { path: "/", label: "Beranda", icon: <Home size={20} /> },
    { path: "/events", label: "Event", icon: <Calendar size={20} /> },
    { path: "/tentang-kami", label: "Tentang Kami", icon: <Info size={20} /> },
    { path: "/layanan", label: "Layanan", icon: <Briefcase size={20} /> },
    { path: "/partner", label: "Partner", icon: <Handshake size={20} /> },
    { path: "/kontak", label: "Kontak", icon: <Phone size={20} /> },
  ];

  // Menu untuk admin (hanya tampil di halaman admin)
  const adminMenuItems = [
    { path: "/admin/dashboard", label: "Beranda", icon: <Home size={20} /> },
    { path: "/admin/events", label: "Event", icon: <Calendar size={20} /> },
    { path: "/admin/tentang-kami", label: "Tentang Kami", icon: <Info size={20} /> },
    { path: "/admin/layanan", label: "Layanan", icon: <Briefcase size={20} /> },
    { path: "/admin/partner", label: "Partner", icon: <Handshake size={20} /> },
    { path: "/admin/kontak", label: "Kontak", icon: <Phone size={20} /> },
  ];

  // Menu yang aktif saat ini (user atau admin)
  const currentMenuItems = isAdminPath ? adminMenuItems : userMenuItems;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 text-white py-3 md:py-4 px-4 md:px-8 shadow-lg flex items-center justify-between transition-all duration-300 bg-[#1A1F16] border-b border-[#2A3025] ${
          isScrolled ? 'backdrop-blur-sm bg-[#1A1F16]/95' : ''
        }`}
        style={{
          minHeight: '64px'
        }}
      >
        {/* Kiri: Logo dan Hamburger Menu */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Hamburger Menu untuk Mobile - SIMPLE LAYOUT */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 bg-[#2A3025] hover:bg-[#363D30] text-white focus:outline-none focus:ring-2 focus:ring-[#D7FE51]/50"
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link 
            to={isAdminPath ? "/admin/dashboard" : "/"} 
            className="flex items-center"
          >
            <div className="flex items-center">
              <img
                src="/Logo GRun.png"
                alt="Gastronomi Run Logo"
                className="h-10 md:h-14 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/logo-gastronomi-run.png";
                  e.target.onError = (e2) => {
                    e2.target.style.display = 'none';
                  };
                }}
              />
            </div>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {/* Menu Navigasi - Tampilkan menu sesuai tipe halaman */}
          <div className="flex gap-6 lg:gap-8 font-medium whitespace-nowrap items-center">
            {currentMenuItems.map((item) => (
              <div key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={`transition-all duration-200 px-2 py-1 font-medium ${
                    isActive(item.path)
                      ? "text-[#D7FE51] font-semibold"
                      : "hover:text-[#D7FE51] text-[#F9F9F9]"
                  }`}
                >
                  {item.label}
                </Link>
                {isActive(item.path) && (
                  <div className="absolute -bottom-1 left-0 right-0">
                    <div className="h-0.5 bg-[#D7FE51] rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Action Buttons - Hanya tampil di halaman admin */}
          {isAdminPath && (
            <div className="flex items-center gap-4 whitespace-nowrap">
              {isAdminLoggedIn ? (
                <div className="flex items-center gap-3">
                  {/* Badge Admin */}
                  <div className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B] backdrop-blur-sm border border-[#363D30] text-[#D7FE51]">
                    <Shield size={14} />
                    <span>Admin</span>
                  </div>

                  {/* Tombol Logout */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm bg-[#1A1F16] hover:bg-[#2A3025] text-[#ABB89D] border border-[#363D30] hover:border-[#D7FE51]/30 hover:text-[#D7FE51] focus:outline-none focus:ring-2 focus:ring-[#D7FE51]/50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                /* Jika di halaman admin tapi belum login */
                <Link
                  to="/admin-login"
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm flex items-center gap-2 bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B] backdrop-blur-sm border border-[#363D30] text-[#D7FE51] hover:bg-[#1A1F16] hover:border-[#D7FE51]/50 focus:outline-none focus:ring-2 focus:ring-[#D7FE51]/50"
                >
                  <Shield size={14} />
                  <span>Login Admin</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile: Action Buttons - SIMPLE VERSION */}
        <div className="md:hidden flex items-center gap-2">
          {isAdminPath && (
            <>
              {isAdminLoggedIn ? (
                <>
                  {/* Admin Badge Mobile */}
                  <div className="px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs font-medium bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B] border border-[#363D30] text-[#D7FE51]">
                    <Shield size={12} />
                    <span className="hidden xs:inline">Admin</span>
                  </div>
                  
                  {/* Logout Button Mobile */}
                  <button
                    onClick={handleLogout}
                    className="px-2 py-1.5 rounded-lg font-medium transition-all duration-300 text-xs bg-[#1A1F16] hover:bg-[#2A3025] text-[#ABB89D] border border-[#363D30] hover:border-[#D7FE51]/30 hover:text-[#D7FE51] focus:outline-none focus:ring-2 focus:ring-[#D7FE51]/50"
                    aria-label="Logout"
                  >
                    <span className="hidden sm:inline">Logout</span>
                    <LogOut size={14} className="sm:hidden" />
                  </button>
                </>
              ) : (
                <Link
                  to="/admin-login"
                  className="px-2 py-1.5 rounded-lg font-medium transition-all duration-300 text-xs flex items-center gap-1 bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B] border border-[#363D30] text-[#D7FE51] hover:bg-[#1A1F16] hover:border-[#D7FE51]/50 focus:outline-none focus:ring-2 focus:ring-[#D7FE51]/50"
                  aria-label="Login Admin"
                >
                  <Shield size={14} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-16 left-0 right-0 max-h-[calc(100vh-64px)] overflow-y-auto bg-[#1A1F16] border-t border-[#2A3025]">
            <div className="px-4 py-3">
              {/* Menu Items */}
              <div className="space-y-1">
                {currentMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-[#2A3025] text-[#D7FE51]"
                        : "hover:bg-[#2A3025] text-white"
                    }`}
                  >
                    <span className={isActive(item.path) ? "text-[#D7FE51]" : "text-white"}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm flex-1">{item.label}</span>
                    {isActive(item.path) && (
                      <div className="w-2 h-2 rounded-full bg-[#D7FE51]"></div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="my-4 h-px bg-[#2A3025]" />

              {/* Admin Section (jika di halaman admin) */}
              {isAdminPath && (
                <div className="space-y-3">
                  <div className="px-4 py-2 rounded-lg bg-[#2A3025]">
                    <p className="text-xs font-medium text-[#ABB89D]">
                      Admin Panel
                    </p>
                  </div>

                  {isAdminLoggedIn ? (
                    <>
                      <div className="px-4 py-3 rounded-lg flex items-center gap-3 bg-[#2A3025]">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#363D30] text-[#D7FE51]">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            Admin User
                          </p>
                          <p className="text-xs text-[#ABB89D]">
                            Administrator
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium text-sm bg-[#2A3025] hover:bg-[#363D30] text-[#D46B5E] border border-[#363D30] focus:outline-none focus:ring-2 focus:ring-[#D46B5E]/50"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/admin-login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 text-sm bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B] border border-[#363D30] text-[#D7FE51] hover:bg-[#1A1F16] focus:outline-none focus:ring-2 focus:ring-[#D7FE51]/50"
                    >
                      <Shield size={18} />
                      <span>Login Admin</span>
                    </Link>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-[#2A3025]">
                <p className="text-center text-xs text-[#ABB89D]">
                  Gastronomi Run © {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
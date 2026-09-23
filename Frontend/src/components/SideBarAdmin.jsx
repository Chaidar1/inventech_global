import React from "react";
import { 
  X, 
  User, 
  Sun, 
  Moon, 
  Shield,
  Package,
  Users,
  CheckSquare,
  Info,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SideBarAdmin({ 
  isOpen, 
  onClose, 
  profile, 
  isDarkMode, 
  onToggleTheme,
  onLogout 
}) {
  const navigate = useNavigate();

  // Fungsi untuk mendapatkan URL foto profil
  const getProfilePictureUrl = (filename) => {
    if (!filename) return null;
    return `http://localhost:8000/uploads/profile_pictures/${filename}`;
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const fallback = e.target.nextElementSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  // Navigasi dari sidebar
  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  // Custom Icon Components dengan styling yang lebih menarik
  const CustomIcons = {
    Profile: () => (
      <div className={`p-2 rounded-lg ${
        isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
      }`}>
        <User size={18} />
      </div>
    ),
    Barang: () => (
      <div className={`p-2 rounded-lg ${
        isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
      }`}>
        <Package size={18} />
      </div>
    ),
    Users: () => (
      <div className={`p-2 rounded-lg ${
        isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
      }`}>
        <Users size={18} />
      </div>
    ),
    Verifikasi: () => (
      <div className={`p-2 rounded-lg ${
        isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
      }`}>
        <CheckSquare size={18} />
      </div>
    ),
    About: () => (
      <div className={`p-2 rounded-lg ${
        isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
      }`}>
        <Info size={18} />
      </div>
    ),
    Theme: () => (
      <div className={`p-2 rounded-lg ${
        isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
      }`}>
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </div>
    ),
    Logout: () => (
      <div className={`p-2 rounded-lg ${
        isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
      }`}>
        <LogOut size={18} />
      </div>
    ),
    AdminBadge: () => (
      <div className={`p-2 rounded-lg ${
        isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
      }`}>
        <Shield size={18} />
      </div>
    )
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 transform transition-transform duration-300 z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900' 
            : 'bg-gradient-to-br from-white via-orange-50 to-amber-50'
        } shadow-2xl`}
      >
        {/* Sidebar Header */}
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-orange-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CustomIcons.AdminBadge />
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Menu Admin
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'hover:bg-slate-700 text-slate-300 hover:text-white' 
                  : 'hover:bg-orange-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className={`p-4 rounded-xl border ${
            isDarkMode 
              ? 'bg-slate-700/50 border-slate-600' 
              : 'bg-orange-50/80 border-orange-200'
          } backdrop-blur-sm`}>
            <div className="flex items-center space-x-3">
              {profile?.foto_profil ? (
                <>
                  <div className="relative">
                    <img
                      src={getProfilePictureUrl(profile.foto_profil)}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-transparent"
                      onError={handleImageError}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div 
                    className="hidden w-12 h-12 rounded-full items-center justify-center bg-slate-600"
                    style={{ display: 'none' }}
                  >
                    <User size={24} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-slate-600' : 'bg-orange-200'
                  }`}>
                    <User size={24} className={isDarkMode ? 'text-white' : 'text-orange-600'} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {profile?.nama_lengkap || profile?.username || "Admin"}
                </p>
                <p className={`text-sm truncate ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  {profile?.email || "admin@example.com"}
                </p>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mt-1 ${
                  isDarkMode 
                    ? 'bg-indigo-500/20 text-indigo-300' 
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  <Shield size={10} />
                  <span>Administrator</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Menu Items - Takes available space */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => handleNavigation("/profile")}
            className={`group w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
              isDarkMode
                ? 'hover:bg-slate-700/80 text-slate-200 hover:shadow-lg'
                : 'hover:bg-white text-gray-700 hover:shadow-md border border-transparent hover:border-orange-200'
            }`}
          >
            <CustomIcons.Profile />
            <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
              Lihat Profile
            </span>
          </button>

          <button
            onClick={() => handleNavigation("/barang")}
            className={`group w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
              isDarkMode
                ? 'hover:bg-slate-700/80 text-slate-200 hover:shadow-lg'
                : 'hover:bg-white text-gray-700 hover:shadow-md border border-transparent hover:border-orange-200'
            }`}
          >
            <CustomIcons.Barang />
            <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
              Daftar Barang
            </span>
          </button>

          <button
            onClick={() => handleNavigation("/users")}
            className={`group w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
              isDarkMode
                ? 'hover:bg-slate-700/80 text-slate-200 hover:shadow-lg'
                : 'hover:bg-white text-gray-700 hover:shadow-md border border-transparent hover:border-orange-200'
            }`}
          >
            <CustomIcons.Users />
            <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
              Daftar User
            </span>
          </button>

          <button
            onClick={() => handleNavigation("/verifikasi")}
            className={`group w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
              isDarkMode
                ? 'hover:bg-slate-700/80 text-slate-200 hover:shadow-lg'
                : 'hover:bg-white text-gray-700 hover:shadow-md border border-transparent hover:border-orange-200'
            }`}
          >
            <CustomIcons.Verifikasi />
            <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
              Verifikasi
            </span>
          </button>

          <button
            onClick={() => handleNavigation("/tentang-kami")}
            className={`group w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
              isDarkMode
                ? 'hover:bg-slate-700/80 text-slate-200 hover:shadow-lg'
                : 'hover:bg-white text-gray-700 hover:shadow-md border border-transparent hover:border-orange-200'
            }`}
          >
            <CustomIcons.About />
            <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
              Tentang Kami
            </span>
          </button>
        </div>

        {/* Bottom Bar - Fixed at bottom */}
        <div className={`mt-auto p-4 border-t ${
          isDarkMode ? 'border-slate-700' : 'border-orange-200'
        }`}>
          <div className="space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`group w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                isDarkMode
                  ? 'hover:bg-slate-700/80 text-slate-200 hover:shadow-lg'
                  : 'hover:bg-white text-gray-700 hover:shadow-md border border-transparent hover:border-orange-200'
              }`}
            >
              <CustomIcons.Theme />
              <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className={`group w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                isDarkMode
                  ? 'hover:bg-red-500/20 text-red-400 hover:shadow-lg'
                  : 'hover:bg-red-50 text-red-600 hover:shadow-md border border-transparent hover:border-red-200'
              }`}
            >
              <CustomIcons.Logout />
              <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
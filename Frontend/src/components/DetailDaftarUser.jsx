import { useState } from "react";
import { 
  User, 
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Circle,
  XCircle,
  CheckCircle,
  Ban
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppTheme } from "../hooks/useTheme";
import axios from "axios";

const MySwal = withReactContent(Swal);

export default function DetailDaftarUser({ 
  user, 
  onClose, 
  onUserUpdate,
  isDarkMode 
}) {
  const token = localStorage.getItem("token");
  const { themeClasses } = useAppTheme();

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

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  // Format last login
  const formatLastLogin = (dateString) => {
    if (!dateString || dateString === "null" || dateString === "undefined" || dateString === "0000-00-00 00:00:00") {
      return "Belum pernah login";
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Belum pernah login";
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) {
        return "Baru saja";
      } else if (diffMinutes < 60) {
        return `${diffMinutes} menit lalu`;
      } else if (diffHours < 24) {
        return `${diffHours} jam lalu`;
      } else if (diffDays === 1) {
        return "Kemarin";
      } else if (diffDays < 7) {
        return `${diffDays} hari lalu`;
      } else {
        return date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error("Error formatting last login:", error);
      return "Belum pernah login";
    }
  };

  // Cek apakah user sedang aktif
  const isUserActive = (user) => {
    // Untuk implementasi lengkap, Anda perlu menyesuaikan dengan logika active session
    // Ini adalah contoh sederhana
    if (!user.last_login) return false;
    
    const lastLogin = new Date(user.last_login);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastLogin) / (1000 * 60));
    
    return diffMinutes <= 2;
  };

  // Cek apakah ini admin yang sedang login
  const isCurrentAdmin = (user) => {
    try {
      const token = localStorage.getItem("token");
      const tokenParts = token.split('|');
      if (tokenParts.length >= 1) {
        const adminId = parseInt(tokenParts[0]);
        return user.id === adminId;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
    return false;
  };

  // Render badge role
  const renderRoleBadge = (role) => {
    const roleConfig = {
      admin: { 
        color: isDarkMode ? "bg-purple-900/50 text-purple-300 border-purple-700" : "bg-purple-100 text-purple-700",
        icon: <Shield size={12} />
      },
      user: { 
        color: isDarkMode ? "bg-blue-900/50 text-blue-300 border-blue-700" : "bg-blue-100 text-blue-700",
        icon: <User size={12} />
      }
    };

    const config = roleConfig[role] || roleConfig.user;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
        config.color
      }`}>
        {config.icon}
        {role === 'admin' ? 'Administrator' : 'User'}
      </span>
    );
  };

  // Render status badge
  const renderStatusBadge = (user) => {
    if (user.is_active === false) {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
          isDarkMode 
            ? "bg-red-900/50 text-red-300 border-red-700" 
            : "bg-red-100 text-red-700"
        }`}>
          <XCircle size={12} />
          Nonaktif
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
        isDarkMode 
          ? "bg-green-900/50 text-green-300 border-green-700" 
          : "bg-green-100 text-green-700"
      }`}>
        <CheckCircle size={12} />
        Aktif
      </span>
    );
  };

  // Toggle user status
  const toggleUserStatus = async (user) => {
    // Cek: Tidak bisa nonaktifkan diri sendiri
    if (isCurrentAdmin(user)) {
      MySwal.fire({
        icon: "warning",
        title: "Tidak dapat menonaktifkan akun sendiri",
        text: "Anda tidak dapat menonaktifkan akun yang sedang digunakan",
        confirmButtonColor: "#f97316",
        background: isDarkMode ? "#0f172a" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
      return;
    }

    const action = user.is_active === false ? 'mengaktifkan' : 'menonaktifkan';
    
    const result = await MySwal.fire({
      title: `Yakin ${action} user ini?`,
      text: user.is_active === false 
        ? "User akan dapat login kembali ke sistem."
        : "User tidak akan dapat login ke sistem.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: user.is_active === false ? "#10b981" : "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: user.is_active === false ? "Ya, Aktifkan" : "Ya, Nonaktifkan",
      cancelButtonText: "Batal",
      background: isDarkMode ? "#0f172a" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#1f2937",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(
        `http://localhost:8000/admin/users/${user.id}/status`,
        { is_active: user.is_active === false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Panggil callback untuk update data
      if (onUserUpdate) {
        onUserUpdate();
      }
      
      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `User berhasil ${action}!`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: isDarkMode ? "#1e293b" : "#ffffff",
      });
    } catch (err) {
      console.error("Gagal update status user:", err);
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Terjadi kesalahan saat mengupdate status user!",
        confirmButtonColor: "#f97316",
        background: isDarkMode ? "#0f172a" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
        isDarkMode ? "bg-slate-800" : "bg-white"
      }`}>
        {/* Header Modal */}
        <div className={`p-6 border-b ${
          isDarkMode ? "border-slate-700" : "border-gray-200"
        }`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              Detail User
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? "hover:bg-slate-700 text-slate-300" 
                  : "hover:bg-gray-100 text-gray-500"
              }`}
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>

        {/* Content Modal */}
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            {user.foto_profil ? (
              <div className="relative">
                <img
                  src={getProfilePictureUrl(user.foto_profil)}
                  alt={`Foto ${user.nama_lengkap || user.username}`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-300"
                  onError={handleImageError}
                />
                {/* Indicator Online di Modal */}
                {isUserActive(user) && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Circle size={8} fill="white" />
                  </div>
                )}
                {/* Indicator khusus untuk admin yang sedang login */}
                {isCurrentAdmin(user) && (
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Shield size={12} className="text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 relative ${
                isDarkMode ? "border-slate-600 bg-slate-700" : "border-gray-300 bg-gray-100"
              }`}>
                <User size={32} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                {/* Indicator Online di Modal */}
                {isUserActive(user) && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Circle size={8} fill="white" />
                  </div>
                )}
                {/* Indicator khusus untuk admin yang sedang login */}
                {isCurrentAdmin(user) && (
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Shield size={12} className="text-white" />
                  </div>
                )}
              </div>
            )}
            <div>
              <h4 className={`text-2xl font-bold mb-1 flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}>
                {user.nama_lengkap || user.username}
                {/* Badge Sedang Aktif di Modal */}
                {isUserActive(user) && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isDarkMode 
                      ? "bg-green-900/50 text-green-300 border border-green-700" 
                      : "bg-green-100 text-green-700 border border-green-300"
                  }`}>
                    <Circle size={8} fill="currentColor" />
                    Sedang Aktif
                  </span>
                )}
                {/* Badge khusus untuk admin yang sedang login */}
                {isCurrentAdmin(user) && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isDarkMode 
                      ? "bg-blue-900/50 text-blue-300 border border-blue-700" 
                      : "bg-blue-100 text-blue-700 border border-blue-300"
                  }`}>
                    <Shield size={8} />
                    Anda (Admin)
                  </span>
                )}
              </h4>
              <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                @{user.username}
              </p>
              <div className="flex gap-2 mt-2">
                {renderRoleBadge(user.role)}
                {renderStatusBadge(user)}
              </div>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? "border-slate-700 bg-slate-700/50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                <span className={`font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Email
                </span>
              </div>
              <p className={isDarkMode ? "text-slate-200" : "text-gray-800"}>
                {user.email || "-"}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode ? "border-slate-700 bg-slate-700/50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Phone size={16} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                <span className={`font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                  No. Telepon
                </span>
              </div>
              <p className={isDarkMode ? "text-slate-200" : "text-gray-800"}>
                {user.no_telepon || "-"}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode ? "border-slate-700 bg-slate-700/50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                <span className={`font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Alamat
                </span>
              </div>
              <p className={isDarkMode ? "text-slate-200" : "text-gray-800"}>
                {user.alamat || "-"}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode ? "border-slate-700 bg-slate-700/50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                <span className={`font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Bergabung
                </span>
              </div>
              <p className={isDarkMode ? "text-slate-200" : "text-gray-800"}>
                {formatDate(user.created_at)}
              </p>
            </div>

            {/* Last Login */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? "border-slate-700 bg-slate-700/50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                <span className={`font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Terakhir Login
                </span>
              </div>
              <p className={
                isUserActive(user) 
                  ? (isDarkMode ? "text-green-400 font-medium" : "text-green-600 font-medium")
                  : (isDarkMode ? "text-slate-200" : "text-gray-800")
              }>
                {isUserActive(user) ? "Sedang Aktif" : formatLastLogin(user.last_login)}
              </p>
            </div>

            {/* Status Online */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? "border-slate-700 bg-slate-700/50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Circle size={16} className={isUserActive(user) ? "text-green-500" : (isDarkMode ? "text-slate-400" : "text-gray-500")} />
                <span className={`font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Status Online
                </span>
              </div>
              <p className={isUserActive(user) ? (isDarkMode ? "text-green-400" : "text-green-600") : (isDarkMode ? "text-slate-200" : "text-gray-800")}>
                {isUserActive(user) ? "Sedang Aktif" : "Tidak Aktif"}
              </p>
            </div>
          </div>

          {/* Updated At Info */}
          {user.updated_at && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              isDarkMode ? "bg-slate-700/30 text-slate-400" : "bg-gray-100 text-gray-600"
            }`}>
              Terakhir update: {formatDate(user.updated_at)}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className={`p-6 border-t ${
          isDarkMode ? "border-slate-700" : "border-gray-200"
        }`}>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Tutup
            </button>
            {/* Tombol Nonaktifkan/Aktifkan - Nonaktifkan untuk admin sendiri */}
            {!isCurrentAdmin(user) && (
              <button
                onClick={() => {
                  toggleUserStatus(user);
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                  user.is_active === false
                    ? isDarkMode
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                    : isDarkMode
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
              >
                {user.is_active === false ? "Aktifkan User" : "Nonaktifkan User"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
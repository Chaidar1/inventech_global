import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Trash2, 
  Eye, 
  User, 
  Shield,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Circle
} from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppTheme } from "../hooks/useTheme";
import DetailDaftarUser from "./DetailDaftarUser";

const MySwal = withReactContent(Swal);

export default function DaftarUser() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const token = localStorage.getItem("token");
  const { themeClasses, isDarkMode } = useAppTheme();

  // State untuk tracking user yang sedang aktif
  const [activeUsers, setActiveUsers] = useState(new Set());
  const [currentAdminId, setCurrentAdminId] = useState(null);

  // State untuk session tracking
  const [userSessions, setUserSessions] = useState(new Set());

  // Background Particles untuk Dark Mode
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);
  const animationFrameIdRef = useRef(null);

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
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isDarkMode) {
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

  // Load sessions dari localStorage saat component mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('userSessions');
    if (savedSessions) {
      try {
        const sessionsArray = JSON.parse(savedSessions);
        setUserSessions(new Set(sessionsArray));
        console.log("✅ Sessions loaded from localStorage:", sessionsArray);
      } catch (error) {
        console.error("Error loading sessions:", error);
      }
    }

    // Setup interval untuk membersihkan session yang expired
    const cleanupInterval = setInterval(() => {
      cleanupExpiredSessions();
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Fetch data users
  useEffect(() => {
    fetchUsers();
    
    // Setup interval untuk check active users setiap 30 detik
    const interval = setInterval(() => {
      checkActiveUsers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Ambil ID admin yang sedang login dari token
  const getCurrentAdminId = () => {
    try {
      const tokenParts = token.split('|');
      if (tokenParts.length >= 1) {
        return parseInt(tokenParts[0]);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
    return null;
  };

  // Ambil user ID dari token (untuk logout)
  const getCurrentUserId = () => {
    try {
      const tokenParts = token.split('|');
      if (tokenParts.length >= 1) {
        return parseInt(tokenParts[0]);
      }
    } catch (error) {
      console.error("Error decoding token for user ID:", error);
    }
    return null;
  };

  // Tambah session aktif
  const addActiveSession = (userId) => {
    const sessionData = {
      userId,
      timestamp: Date.now(),
      expiresAt: Date.now() + (2 * 60 * 1000)
    };
    
    const newSessions = new Set(userSessions);
    
    // Hapus session lama untuk user yang sama
    for (let sessionStr of newSessions) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.userId === userId) {
          newSessions.delete(sessionStr);
          break;
        }
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    }
    
    // Tambah session baru
    newSessions.add(JSON.stringify(sessionData));
    setUserSessions(newSessions);
    
    // Simpan ke localStorage
    localStorage.setItem('userSessions', JSON.stringify(Array.from(newSessions)));
    console.log(`✅ Session added for user ${userId}`);
  };

  // Hapus session (saat logout)
  const removeActiveSession = (userId) => {
    const newSessions = new Set(userSessions);
    let removed = false;
    
    for (let sessionStr of newSessions) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.userId === userId) {
          newSessions.delete(sessionStr);
          removed = true;
          break;
        }
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    }
    
    if (removed) {
      setUserSessions(newSessions);
      localStorage.setItem('userSessions', JSON.stringify(Array.from(newSessions)));
      console.log(`✅ Session removed for user ${userId}`);
    }
  };

  // Bersihkan session yang expired
  const cleanupExpiredSessions = () => {
    const now = Date.now();
    const newSessions = new Set();
    let changed = false;

    userSessions.forEach(sessionStr => {
      try {
        const session = JSON.parse(sessionStr);
        if (session.expiresAt > now) {
          newSessions.add(sessionStr);
        } else {
          changed = true;
          console.log(`🧹 Session expired for user ${session.userId}`);
        }
      } catch (error) {
        console.error('Error parsing session during cleanup:', error);
        changed = true;
      }
    });

    if (changed) {
      setUserSessions(newSessions);
      localStorage.setItem('userSessions', JSON.stringify(Array.from(newSessions)));
    }
  };

  // Cek apakah user punya session aktif
  const hasActiveSession = (userId) => {
    const now = Date.now();
    
    for (let sessionStr of userSessions) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.userId === userId && session.expiresAt > now) {
          return true;
        }
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    }
    return false;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("=== DEBUG DATA USERS ===");
      console.log("Data users dari backend:", res.data);
      
      setUsers(res.data);
      setFilteredUsers(res.data);
      
      const adminId = getCurrentAdminId();
      setCurrentAdminId(adminId);
      console.log("🔍 Current Admin ID:", adminId);
      
      if (adminId) {
        addActiveSession(adminId);
      }
      
      setTimeout(() => {
        checkActiveUsers();
      }, 100);
      
    } catch (err) {
      console.error("Gagal ambil data users:", err);
      MySwal.fire({
        icon: "error",
        title: "Gagal memuat data",
        text: "Silakan refresh halaman",
        confirmButtonColor: "#f97316",
        background: isDarkMode ? "#0f172a" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mengecek user yang sedang aktif dengan session tracking
  const checkActiveUsers = () => {
    const now = new Date();
    const activeUserIds = new Set();
    
    // Tambahkan admin yang sedang login sebagai aktif
    const adminId = getCurrentAdminId();
    if (adminId) {
      activeUserIds.add(adminId);
      console.log("✅ Admin yang sedang login ditambahkan sebagai aktif:", adminId);
    }
    
    users.forEach(user => {
      // Skip jika ini adalah admin yang sedang login
      if (user.id === adminId) return;
      
      // Prioritaskan session tracking over last_login
      if (hasActiveSession(user.id)) {
        activeUserIds.add(user.id);
        console.log(`✅ User ${user.username} aktif berdasarkan session tracking`);
      } else if (user.last_login) {
        try {
          const lastLogin = new Date(user.last_login);
          const diffMs = now - lastLogin;
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          
          console.log(`🔍 User ${user.username}: last_login = ${user.last_login}, diffMinutes = ${diffMinutes}`);
          
          if (diffMinutes <= 2) {
            activeUserIds.add(user.id);
            console.log(`✅ User ${user.username} aktif berdasarkan last_login`);
          } else {
            console.log(`❌ User ${user.username} tidak aktif (last_login terlalu lama)`);
          }
        } catch (error) {
          console.error("Error checking active user:", error);
        }
      } else {
        console.log(`❌ User ${user.username} tidak memiliki last_login`);
      }
    });
    
    setActiveUsers(activeUserIds);
    console.log("🔍 Active users:", Array.from(activeUserIds));
    console.log("🔍 Total sessions:", userSessions.size);
  };

  // Filter users berdasarkan pencarian dan filter
  useEffect(() => {
    let filtered = users;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchLower) ||
        user.nama_lengkap?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.alamat?.toLowerCase().includes(searchLower)
      );
    }

    if (filterRole) {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (filterStatus) {
      filtered = filtered.filter(user => {
        if (filterStatus === 'active') return user.is_active !== false;
        if (filterStatus === 'inactive') return user.is_active === false;
        if (filterStatus === 'online') return activeUsers.has(user.id);
        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [search, filterRole, filterStatus, users, activeUsers]);

  useEffect(() => {
    if (currentAdminId) {
      checkActiveUsers();
    }
  }, [currentAdminId, users]);

  useEffect(() => {
    const adminId = getCurrentAdminId();
    if (adminId) {
      setCurrentAdminId(adminId);
      console.log("🔄 Page refresh - Current Admin ID:", adminId);
      addActiveSession(adminId);
    }
  }, []);

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
    console.log("🔍 formatLastLogin dipanggil dengan:", dateString);
    
    if (!dateString || dateString === "null" || dateString === "undefined" || dateString === "0000-00-00 00:00:00") {
      return "Belum pernah login";
    }
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.log("❌ Invalid date:", dateString);
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
      console.error("❌ Error formatting last login:", error);
      return "Belum pernah login";
    }
  };

  // Cek apakah user sedang aktif (termasuk admin yang login)
  const isUserActive = (user) => {
    // Jika ini adalah admin yang sedang login, selalu aktif
    if (isCurrentAdmin(user)) {
      return true;
    }
    
    // Untuk user lain, cek berdasarkan session tracking terlebih dahulu
    if (hasActiveSession(user.id)) {
      return true;
    }
    
    // Fallback ke last_login check
    return activeUsers.has(user.id);
  };

  // Cek apakah ini admin yang sedang login
  const isCurrentAdmin = (user) => {
    const adminId = getCurrentAdminId();
    return user.id === adminId;
  };

  // Tampilkan detail user
  const showUserDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Nonaktifkan/aktifkan user
  const toggleUserStatus = async (user) => {
    // CEK: Tidak bisa nonaktifkan diri sendiri
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
      
      fetchUsers();
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

  // Hapus user
  const deleteUser = async (user) => {
    // CEK: Tidak bisa hapus diri sendiri
    if (isCurrentAdmin(user)) {
      MySwal.fire({
        icon: "warning",
        title: "Tidak dapat menghapus akun sendiri",
        text: "Anda tidak dapat menghapus akun yang sedang digunakan",
        confirmButtonColor: "#f97316",
        background: isDarkMode ? "#0f172a" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
      return;
    }

    const result = await MySwal.fire({
      title: "Yakin hapus user ini?",
      text: "Data user yang sudah dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      background: isDarkMode ? "#0f172a" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#1f2937",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8000/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      fetchUsers();
      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "User berhasil dihapus!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: isDarkMode ? "#1e293b" : "#ffffff",
      });
    } catch (err) {
      console.error("Gagal hapus user:", err);
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal menghapus user!",
        confirmButtonColor: "#f97316",
        background: isDarkMode ? "#0f172a" : "#ffffff",
        color: isDarkMode ? "#f8fafc" : "#1f2937",
      });
    }
  };

  // Handle user update dari modal detail
  const handleUserUpdate = () => {
    fetchUsers(); // Refresh data users
  };

  // Komponen untuk menampilkan foto profil user
  const UserProfileWithPhoto = ({ user }) => {
    const getLastLoginDisplay = () => {
      if (isUserActive(user)) {
        return "Sedang Aktif";
      }
      
      if (!user || !('last_login' in user)) {
        return "Data tidak tersedia";
      }
      
      if (!user.last_login) {
        return "Belum pernah login";
      }
      
      return formatLastLogin(user.last_login);
    };

    const isActive = isUserActive(user);
    const isCurrentUser = isCurrentAdmin(user);

    return (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 relative">
          {user.foto_profil ? (
            <>
              <img
                src={getProfilePictureUrl(user.foto_profil)}
                alt={`Foto ${user.nama_lengkap || user.username}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                onError={handleImageError}
              />
              {/* Indicator Online */}
              {isActive && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
              {/* Indicator khusus untuk admin yang sedang login */}
              {isCurrentUser && (
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Shield size={8} className="text-white" />
                </div>
              )}
            </>
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 relative ${
              isDarkMode ? "border-slate-600 bg-slate-700" : "border-gray-300 bg-gray-100"
            }`}>
              <User size={20} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
              {/* Indicator Online */}
              {isActive && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
              {/* Indicator khusus untuk admin yang sedang login */}
              {isCurrentUser && (
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Shield size={8} className="text-white" />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-left">
          <div className={`font-medium flex items-center gap-2 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
            {user.nama_lengkap || user.username}
            {/* Badge Sedang Aktif */}
            {isActive && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isDarkMode 
                  ? "bg-green-900/50 text-green-300 border border-green-700" 
                  : "bg-green-100 text-green-700 border border-green-300"
              }`}>
                <Circle size={8} fill="currentColor" />
                Online
              </span>
            )}
            {/* Badge khusus untuk admin yang sedang login */}
            {isCurrentUser && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isDarkMode 
                  ? "bg-blue-900/50 text-blue-300 border border-blue-700" 
                  : "bg-blue-100 text-blue-700 border border-blue-300"
              }`}>
                <Shield size={8} />
                Anda
              </span>
            )}
          </div>
          <div className={`text-xs flex items-center gap-1 ${
            isActive 
              ? (isDarkMode ? "text-green-400" : "text-green-600") 
              : (isDarkMode ? "text-slate-400" : "text-gray-500")
          }`}>
            <Clock size={10} />
            {getLastLoginDisplay()}
          </div>
        </div>
      </div>
    );
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

  return (
    <div className={`p-6 min-h-screen transition-colors duration-300 relative ${
      isDarkMode ? "bg-slate-900" : "bg-gray-50"
    }`}>
      {/* Background Particles untuk Dark Mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <h1 className={`flex items-center gap-2 text-3xl font-extrabold ${
              isDarkMode
                ? "text-white"
                : "bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
            }`}>
              <Users className={isDarkMode ? "text-blue-400" : "text-orange-500"} size={36} />
              Daftar User
            </h1>
          </div>
          <div className={`mt-1 w-28 h-1 rounded ${
            isDarkMode ? "bg-blue-500" : "bg-orange-500"
          }`} />
          <p className={`mt-2 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
            Kelola semua user yang terdaftar dalam sistem
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className={`shadow-md rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 transition-colors duration-300 backdrop-blur-sm ${
          isDarkMode ? "bg-slate-800/80 border border-slate-700" : "bg-white"
        }`}>
          <div className="relative md:col-span-2">
            <Search className={`absolute left-3 top-3 ${
              isDarkMode ? "text-slate-400" : "text-gray-400"
            }`} size={18} />
            <input
              type="text"
              placeholder="Cari user, nama, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`border rounded-lg pl-10 pr-3 py-2 w-full focus:outline-none transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                  : "border-gray-300 focus:ring-2 focus:ring-orange-400"
              }`}
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`border rounded-lg px-3 py-2 w-full focus:outline-none transition-colors duration-300 ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
                : "border-gray-300 focus:ring-2 focus:ring-orange-400"
            }`}
          >
            <option value="">Semua Role</option>
            <option value="admin">Administrator</option>
            <option value="user">User</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`border rounded-lg px-3 py-2 w-full focus:outline-none transition-colors duration-300 ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
                : "border-gray-300 focus:ring-2 focus:ring-orange-400"
            }`}
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="online">Sedang Aktif</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              {users.length}
            </div>
            <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
              Total User
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
              Administrator
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              {users.filter(u => u.role === 'user').length}
            </div>
            <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
              User
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              {users.filter(u => u.is_active === false).length}
            </div>
            <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
              Nonaktif
            </div>
          </div>
          {/* STATS CARD BARU: SEDANG AKTIF */}
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-2xl font-bold flex items-center gap-2 ${
              isDarkMode ? "text-green-400" : "text-green-600"
            }`}>
              {Array.from(activeUsers).length}
              <Circle size={16} fill="currentColor" className="text-green-500" />
            </div>
            <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
              Sedang Aktif
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`shadow-md rounded-lg overflow-hidden transition-colors duration-300 backdrop-blur-sm ${
            isDarkMode ? "bg-slate-800/80 border border-slate-700" : "bg-white"
          }`}>
          <table className="w-full text-sm text-left">
            <thead className={`text-white text-center ${
              isDarkMode
                ? "bg-gradient-to-r from-slate-800/90 via-blue-900/90 to-indigo-900/90"
                : "bg-orange-500"
            }`}>
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">No. Telepon</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bergabung</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`text-center transition-colors duration-200 ${
                    isDarkMode
                      ? idx % 2 === 0
                        ? "bg-slate-800/60"
                        : "bg-slate-700/40"
                      : idx % 2 === 0
                      ? "bg-gray-50"
                      : "bg-white"
                  } ${
                    isDarkMode ? "hover:bg-slate-700/60" : "hover:bg-orange-50"
                  } ${
                    isUserActive(user) ? (isDarkMode ? "bg-green-900/10" : "bg-green-50") : ""
                  } ${
                    isCurrentAdmin(user) ? (isDarkMode ? "bg-blue-900/10" : "bg-blue-50") : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <UserProfileWithPhoto user={user} />
                  </td>
                  
                  <td className={`px-4 py-2 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                    {user.email || "-"}
                  </td>
                  
                  <td className={`px-4 py-2 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                    {user.no_telepon || "-"}
                  </td>

                  <td className="px-4 py-2">
                    {renderRoleBadge(user.role)}
                  </td>

                  <td className="px-4 py-2">
                    {renderStatusBadge(user)}
                  </td>

                  <td className={`px-4 py-2 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                    {formatDate(user.created_at)}
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => showUserDetail(user)}
                        className={`p-2 rounded-lg transition duration-200 ${
                          isDarkMode
                            ? "text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                            : "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                      
                      <button
                        onClick={() => toggleUserStatus(user)}
                        disabled={isCurrentAdmin(user)}
                        className={`p-2 rounded-lg transition duration-200 ${
                          isCurrentAdmin(user) 
                            ? "opacity-50 cursor-not-allowed text-gray-400"
                            : user.is_active === false
                            ? isDarkMode
                              ? "text-green-400 hover:text-green-300 hover:bg-slate-700"
                              : "text-green-500 hover:text-green-600 hover:bg-green-50"
                            : isDarkMode
                            ? "text-yellow-400 hover:text-yellow-300 hover:bg-slate-700"
                            : "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                        }`}
                        title={isCurrentAdmin(user) ? "Tidak dapat mengubah status akun sendiri" : (user.is_active === false ? "Aktifkan User" : "Nonaktifkan User")}
                      >
                        {user.is_active === false ? <CheckCircle size={16} /> : <Ban size={16} />}
                      </button>
                      
                      <button
                        onClick={() => deleteUser(user)}
                        disabled={isCurrentAdmin(user)}
                        className={`p-2 rounded-lg transition duration-200 ${
                          isCurrentAdmin(user)
                            ? "opacity-50 cursor-not-allowed text-gray-400"
                            : isDarkMode
                            ? "text-red-400 hover:text-red-300 hover:bg-slate-700"
                            : "text-red-500 hover:text-red-600 hover:bg-red-50"
                        }`}
                        title={isCurrentAdmin(user) ? "Tidak dapat menghapus akun sendiri" : "Hapus User"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className={`p-6 text-center italic ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {loading ? "Memuat data..." : "Tidak ada data user"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail User */}
      {showDetailModal && selectedUser && (
        <DetailDaftarUser
          user={selectedUser}
          onClose={() => setShowDetailModal(false)}
          onUserUpdate={handleUserUpdate}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  X, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Package,
  RefreshCw,
  Clock,
  ShoppingCart,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Icon mapping
const iconComponents = {
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Clock,
  ShoppingCart,
  Bell
};

// Validation function untuk notifikasi
const validateNotification = (notification) => {
  return notification && 
         notification.id && 
         notification.title && 
         notification.message;
};

export default function NotifikasiUser({ isDarkMode, buttonSize, iconSize }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");

  // Helper function untuk update state dengan konsisten
  const updateNotificationState = (updatedNotifications) => {
    const validNotifications = Array.isArray(updatedNotifications) ? updatedNotifications : [];
    setNotifications(validNotifications);
    
    // Hitung unread count secara konsisten
    const unread = validNotifications.filter(notif => !notif.read).length;
    setUnreadCount(unread);
  };

  // Fetch real notifications dari API - IMPROVED VERSION
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/notifications/user", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });
      
      // Validasi response data
      if (!response.data || !Array.isArray(response.data.notifications)) {
        throw new Error("Invalid response format");
      }
      
      const validNotifications = response.data.notifications
        .filter(validateNotification)
        .map(notif => ({
          ...notif,
          icon: iconComponents[notif.icon] || Bell,
          // Ensure read property is boolean
          read: Boolean(notif.read)
        }));
      
      updateNotificationState(validNotifications);
      
    } catch (error) {
      console.error("Error fetching real user notifications:", error);
      
      // Fallback dengan error handling yang lebih baik
      try {
        await generateUserNotificationsFromData();
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        // Set empty state dengan validasi
        updateNotificationState([]);
        
        MySwal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Gagal memuat notifikasi",
          showConfirmButton: false,
          timer: 3000,
          background: isDarkMode ? "#334155" : "#ffffff",
          color: isDarkMode ? "#f1f5f9" : "#1f2937",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Generate notifications from actual user data
  const generateUserNotificationsFromData = async () => {
    try {
      const userProfile = JSON.parse(localStorage.getItem("profile") || "{}");
      const username = userProfile.username;

      const [borrowingsRes, itemsRes] = await Promise.all([
        axios.get("http://localhost:8000/peminjaman/user", {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get("http://localhost:8000/barang", {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      const generatedNotifications = [];
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

      // 1. Notifikasi peminjaman berhasil diajukan
      if (borrowingsRes.data && Array.isArray(borrowingsRes.data)) {
        const pendingBorrowings = borrowingsRes.data.filter(borrowing => 
          borrowing.status === 'Menunggu' &&
          new Date(borrowing.created_at) > oneWeekAgo
        );

        pendingBorrowings.forEach(borrowing => {
          generatedNotifications.push({
            id: `peminjaman_berhasil_${borrowing.id}`,
            type: 'peminjaman_berhasil',
            title: 'Peminjaman Berhasil',
            message: `Peminjaman "${borrowing.nama_barang}" berhasil diajukan. Tunggu verifikasi oleh admin!`,
            timestamp: borrowing.created_at,
            read: false,
            icon: CheckCircle,
            color: 'green',
            metadata: { borrowing_id: borrowing.id }
          });
        });
      }

      // 2. Notifikasi status peminjaman
      if (borrowingsRes.data && Array.isArray(borrowingsRes.data)) {
        const recentBorrowings = borrowingsRes.data.filter(borrowing => {
          const updatedTime = new Date(borrowing.updated_at || borrowing.created_at);
          return updatedTime > oneWeekAgo;
        });

        recentBorrowings.forEach(borrowing => {
          if (borrowing.status === 'Disetujui') {
            generatedNotifications.push({
              id: `peminjaman_disetujui_${borrowing.id}`,
              type: 'peminjaman_disetujui',
              title: 'Peminjaman Disetujui',
              message: `Peminjaman "${borrowing.nama_barang}" telah disetujui`,
              timestamp: borrowing.updated_at || borrowing.created_at,
              read: false,
              icon: CheckCircle,
              color: 'green',
              metadata: { borrowing_id: borrowing.id }
            });
          } else if (borrowing.status === 'Ditolak') {
            generatedNotifications.push({
              id: `peminjaman_ditolak_${borrowing.id}`,
              type: 'peminjaman_ditolak',
              title: 'Peminjaman Ditolak',
              message: `Peminjaman "${borrowing.nama_barang}" ditolak`,
              timestamp: borrowing.updated_at || borrowing.created_at,
              read: false,
              icon: XCircle,
              color: 'red',
              metadata: { borrowing_id: borrowing.id }
            });
          } else if (borrowing.status === 'Selesai') {
            generatedNotifications.push({
              id: `pengembalian_verifikasi_${borrowing.id}`,
              type: 'pengembalian_verifikasi',
              title: 'Pengembalian Diverifikasi',
              message: `Pengembalian "${borrowing.nama_barang}" telah diverifikasi`,
              timestamp: borrowing.updated_at || borrowing.created_at,
              read: false,
              icon: Package,
              color: 'blue',
              metadata: { borrowing_id: borrowing.id }
            });
          } else if (borrowing.status === 'Menunggu Verifikasi Pengembalian') {
            generatedNotifications.push({
              id: `pengembalian_menunggu_${borrowing.id}`,
              type: 'pengembalian_menunggu',
              title: 'Pengembalian Diproses',
              message: `Pengembalian "${borrowing.nama_barang}" sedang diverifikasi admin`,
              timestamp: borrowing.updated_at || borrowing.created_at,
              read: false,
              icon: Clock,
              color: 'orange',
              metadata: { borrowing_id: borrowing.id }
            });
          }
        });
      }

      // 3. Notifikasi barang yang pernah dipinjam sekarang tersedia
      if (borrowingsRes.data && Array.isArray(borrowingsRes.data) && 
          itemsRes.data && Array.isArray(itemsRes.data)) {
        
        const borrowedItemIds = [...new Set(borrowingsRes.data.map(b => b.barang_id))];
        const availableItems = itemsRes.data.filter(item => 
          borrowedItemIds.includes(item.id) && 
          item.stok_tersedia > 0
        );

        availableItems.forEach(item => {
          // Cari peminjaman terakhir untuk item ini
          const userBorrowings = borrowingsRes.data.filter(b => b.barang_id === item.id);
          if (userBorrowings.length > 0) {
            const lastBorrowed = userBorrowings.sort((a, b) => 
              new Date(b.created_at) - new Date(a.created_at)
            )[0];

            generatedNotifications.push({
              id: `stok_tersedia_${item.id}`,
              type: 'stok_update',
              title: 'Barang Tersedia Kembali',
              message: `"${item.nama_barang}" yang pernah Anda pinjam sekarang tersedia`,
              timestamp: now.toISOString(),
              read: false,
              icon: AlertCircle,
              color: 'green',
              metadata: { barang_id: item.id }
            });
          }
        });
      }

      // 4. Notifikasi pengingat pengembalian (jika ada peminjaman aktif)
      if (borrowingsRes.data && Array.isArray(borrowingsRes.data)) {
        const activeBorrowings = borrowingsRes.data.filter(b => 
          b.status === 'Dipinjam' || b.status === 'Disetujui'
        );

        activeBorrowings.forEach(borrowing => {
          const returnDate = new Date(borrowing.tanggal_kembali);
          const daysUntilReturn = Math.ceil((returnDate - now) / (1000 * 60 * 60 * 24));
          
          if (daysUntilReturn <= 2 && daysUntilReturn > 0) {
            generatedNotifications.push({
              id: `pengingat_pengembalian_${borrowing.id}`,
              type: 'pengingat_pengembalian',
              title: 'Pengingat Pengembalian',
              message: `"${borrowing.nama_barang}" harus dikembalikan dalam ${daysUntilReturn} hari`,
              timestamp: now.toISOString(),
              read: false,
              icon: Clock,
              color: 'orange',
              metadata: { borrowing_id: borrowing.id }
            });
          }
        });
      }

      // Sort by timestamp (newest first) dan limit
      generatedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const finalNotifications = generatedNotifications.slice(0, 20);
      
      updateNotificationState(finalNotifications);

    } catch (error) {
      console.error("Error generating user notifications from data:", error);
      throw error;
    }
  };

  // Mark notification as read - IMPROVED VERSION
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8000/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(notif => {
          if (notif.id === notificationId && !notif.read) {
            return { ...notif, read: true };
          }
          return notif;
        })
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setNotifications(prev => 
        prev.map(notif => {
          if (notif.id === notificationId && !notif.read) {
            return { ...notif, read: true };
          }
          return notif;
        })
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Delete single notification - FIXED VERSION dengan endpoint permanent delete
  const deleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    
    const result = await MySwal.fire({
      title: "Hapus notifikasi?",
      text: "Notifikasi ini akan dihapus permanen dari sistem",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      background: isDarkMode ? "#1e293b" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#1f2937",
      customClass: {
        popup: isDarkMode ? "dark-swal" : ""
      }
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/notifications/${notificationId}/permanent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setNotifications(prev => {
          const updatedNotifications = prev.filter(notif => notif.id !== notificationId);
          return updatedNotifications;
        });
        
        setUnreadCount(prev => {
          const deletedNotification = notifications.find(notif => notif.id === notificationId);
          const wasUnread = deletedNotification && !deletedNotification.read;
          return wasUnread ? Math.max(0, prev - 1) : prev;
        });
        
        MySwal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Notifikasi dihapus",
          showConfirmButton: false,
          timer: 1500,
          background: isDarkMode ? "#334155" : "#ffffff",
          color: isDarkMode ? "#f1f5f9" : "#1f2937",
        });
        
      } catch (error) {
        console.error("Error deleting notification with permanent endpoint:", error);
        
        // Fallback: coba endpoint delete biasa
        try {
          await axios.delete(`http://localhost:8000/notifications/${notificationId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
          
          MySwal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Notifikasi dihapus",
            showConfirmButton: false,
            timer: 1500,
            background: isDarkMode ? "#334155" : "#ffffff",
            color: isDarkMode ? "#f1f5f9" : "#1f2937",
          });
          
        } catch (fallbackError) {
          console.error("Fallback delete also failed:", fallbackError);
          
          setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
          
          MySwal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            title: "Notifikasi dihapus dari tampilan",
            text: "Mungkin muncul kembali saat refresh",
            showConfirmButton: false,
            timer: 2000,
            background: isDarkMode ? "#334155" : "#ffffff",
            color: isDarkMode ? "#f1f5f9" : "#1f2937",
          });
        }
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put("http://localhost:8000/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      
      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Semua notifikasi ditandai sudah dibaca",
        showConfirmButton: false,
        timer: 2000,
        background: isDarkMode ? "#334155" : "#ffffff",
        color: isDarkMode ? "#f1f5f9" : "#1f2937",
      });
      
    } catch (error) {
      console.error("Error marking all as read:", error);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    const result = await MySwal.fire({
      title: "Hapus semua notifikasi?",
      text: "Semua notifikasi akan dihapus permanen dari sistem",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus semua",
      cancelButtonText: "Batal",
      background: isDarkMode ? "#1e293b" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#1f2937",
      customClass: {
        popup: isDarkMode ? "dark-swal" : ""
      }
    });

    if (result.isConfirmed) {
      try {
        await axios.delete("http://localhost:8000/notifications/user", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await fetchNotifications();
        
        MySwal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Semua notifikasi dihapus",
          showConfirmButton: false,
          timer: 2000,
          background: isDarkMode ? "#334155" : "#ffffff",
          color: isDarkMode ? "#f1f5f9" : "#1f2937",
        });
        
      } catch (error) {
        console.error("Error clearing notifications:", error);
        
        try {
          const deletePromises = notifications.map(notif => 
            axios.delete(`http://localhost:8000/notifications/${notif.id}/permanent`, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.warn(`Failed to delete ${notif.id}:`, e))
          );
          
          await Promise.allSettled(deletePromises);
          
          updateNotificationState([]);
          
          MySwal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Semua notifikasi dihapus",
            showConfirmButton: false,
            timer: 2000,
            background: isDarkMode ? "#334155" : "#ffffff",
            color: isDarkMode ? "#f1f5f9" : "#1f2937",
          });
          
        } catch (fallbackError) {
          console.error("Fallback clear also failed:", fallbackError);
          
          updateNotificationState([]);
          
          MySwal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: "Notifikasi dihapus dari tampilan",
            text: "Mungkin muncul kembali saat refresh",
            showConfirmButton: false,
            timer: 2000,
            background: isDarkMode ? "#334155" : "#ffffff",
            color: isDarkMode ? "#f1f5f9" : "#1f2937",
          });
        }
      }
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "Baru saja";
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return time.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get icon color based on type
  const getIconColor = (color) => {
    const colorMap = {
      green: isDarkMode ? "text-green-400" : "text-green-600",
      red: isDarkMode ? "text-red-400" : "text-red-600",
      blue: isDarkMode ? "text-blue-400" : "text-blue-600",
      orange: isDarkMode ? "text-orange-400" : "text-orange-600"
    };
    return colorMap[color] || colorMap.blue;
  };

  // Get background color based on type
  const getBgColor = (color) => {
    const colorMap = {
      green: isDarkMode ? "bg-green-500/10" : "bg-green-50",
      red: isDarkMode ? "bg-red-500/10" : "bg-red-50",
      blue: isDarkMode ? "bg-blue-500/10" : "bg-blue-50",
      orange: isDarkMode ? "bg-orange-500/10" : "bg-orange-50"
    };
    return colorMap[color] || colorMap.blue;
  };

  // Get border color based on type
  const getBorderColor = (color) => {
    const colorMap = {
      green: isDarkMode ? "border-l-green-400" : "border-l-green-500",
      red: isDarkMode ? "border-l-red-400" : "border-l-red-500",
      blue: isDarkMode ? "border-l-blue-400" : "border-l-blue-500",
      orange: isDarkMode ? "border-l-orange-400" : "border-l-orange-500"
    };
    return colorMap[color] || colorMap.blue;
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    switch(notification.type) {
      case 'peminjaman_berhasil':
      case 'peminjaman_disetujui':
      case 'peminjaman_ditolak':
      case 'pengembalian_verifikasi':
      case 'pengembalian_menunggu':
      case 'pengingat_pengembalian':
        window.location.href = '/riwayat';
        break;
      case 'stok_update':
        window.location.href = '/barang';
        break;
      default:
        break;
    }
    
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Notifikasi dengan glow effect */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className={`
          relative ${buttonSize || "w-10 h-10"} 
          flex items-center justify-center 
          rounded-xl 
          transition-all duration-300 
          group
          ${isDarkMode 
            ? "bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25" 
            : "bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-lg shadow-blue-500/25"
          }
          ${isOpen ? (isDarkMode ? "ring-2 ring-indigo-400" : "ring-2 ring-blue-400") : ""}
          transform hover:scale-105 active:scale-95
        `}
        title="Notifikasi"
      >
        <Bell 
          size={iconSize || 20} 
          className="text-white transition-transform group-hover:scale-110" 
        />
        
        {/* Badge notifikasi dengan animasi */}
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
              absolute -top-1 -right-1 
              min-w-5 h-5 
              flex items-center justify-center 
              rounded-full text-xs font-bold 
              border-2
              ${isDarkMode ? "border-slate-800" : "border-white"}
              ${isDarkMode 
                ? "bg-red-500 text-white" 
                : "bg-red-500 text-white"
              }
              shadow-lg
            `}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Notifikasi */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className={`
              absolute right-0 top-14 
              w-80 sm:w-96 
              rounded-2xl 
              shadow-2xl 
              border 
              backdrop-blur-xl 
              z-50 
              max-h-96 
              overflow-hidden
              ${isDarkMode
                ? "bg-slate-800/90 border-slate-700 shadow-slate-900/50"
                : "bg-white/95 border-gray-200/80 shadow-gray-400/20"
              }
            `}
          >
            {/* Header dengan gradient */}
            <div className={`
              p-4 border-b 
              relative overflow-hidden
              ${isDarkMode 
                ? "border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700/50" 
                : "border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
              }
            `}>
              {/* Background pattern */}
              <div className={`
                absolute inset-0 opacity-5
                ${isDarkMode ? "bg-gradient-to-br from-indigo-400 to-purple-400" : "bg-gradient-to-br from-blue-400 to-indigo-400"}
              `}></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-xl
                    ${isDarkMode 
                      ? "bg-indigo-500/20 text-indigo-300" 
                      : "bg-blue-500/20 text-blue-600"
                    }
                  `}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className={`
                      font-bold text-sm
                      ${isDarkMode ? "text-white" : "text-gray-900"}
                    `}>
                      Notifikasi Saya
                    </h3>
                    <p className={`
                      text-xs
                      ${isDarkMode ? "text-slate-400" : "text-gray-500"}
                    `}>
                      {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={fetchNotifications}
                    disabled={loading}
                    className={`
                      p-2 rounded-lg transition-all duration-200
                      ${isDarkMode 
                        ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-300" 
                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      }
                      ${loading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                    title="Refresh"
                  >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`
                      p-2 rounded-lg transition-all duration-200
                      ${isDarkMode 
                        ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-300" 
                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      }
                    `}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-64 custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className={`
                      mx-auto mb-3 p-3 rounded-full
                      ${isDarkMode 
                        ? "bg-slate-700/50 text-indigo-400" 
                        : "bg-gray-100 text-blue-500"
                      }
                    `}
                  >
                    <RefreshCw size={20} />
                  </motion.div>
                  <p className={`
                    text-sm
                    ${isDarkMode ? "text-slate-400" : "text-gray-500"}
                  `}>
                    Memuat notifikasi...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className={`
                    mx-auto mb-3 p-4 rounded-2xl
                    ${isDarkMode 
                      ? "bg-slate-700/50 text-slate-400" 
                      : "bg-gray-100 text-gray-400"
                    }
                  `}>
                    <Bell size={24} />
                  </div>
                  <p className={`
                    text-sm font-medium
                    ${isDarkMode ? "text-slate-300" : "text-gray-600"}
                  `}>
                    Tidak ada notifikasi
                  </p>
                  <p className={`
                    text-xs mt-1
                    ${isDarkMode ? "text-slate-500" : "text-gray-400"}
                  `}>
                    Notifikasi status peminjaman akan muncul di sini
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                  {notifications.map((notification, index) => {
                    const IconComponent = notification.icon;
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          p-4 transition-all duration-200 cursor-pointer group relative
                          border-l-4
                          ${getBorderColor(notification.color)}
                          ${notification.read 
                            ? (isDarkMode 
                                ? "bg-transparent hover:bg-slate-700/30" 
                                : "bg-transparent hover:bg-gray-50/80"
                              )
                            : (isDarkMode 
                                ? "bg-blue-500/5 hover:bg-slate-700/50" 
                                : "bg-blue-50/80 hover:bg-blue-50"
                              )
                          }
                        `}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {/* Delete Button */}
                        <button
                          onClick={(e) => deleteNotification(notification.id, e)}
                          className={`
                            absolute right-3 top-3 
                            p-1.5 rounded-lg 
                            opacity-0 group-hover:opacity-100 
                            transition-all duration-200 
                            transform translate-x-1 group-hover:translate-x-0
                            ${isDarkMode 
                              ? "hover:bg-slate-600 text-slate-400 hover:text-red-400" 
                              : "hover:bg-gray-200 text-gray-400 hover:text-red-500"
                            }
                          `}
                          title="Hapus notifikasi"
                        >
                          <Trash2 size={12} />
                        </button>

                        <div className="flex items-start gap-3 pr-8">
                          <div className={`
                            p-2 rounded-xl flex-shrink-0 
                            ${getBgColor(notification.color)}
                            ${getIconColor(notification.color)}
                          `}>
                            <IconComponent size={16} />
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`
                                font-semibold text-sm leading-tight break-words line-clamp-1
                                ${isDarkMode ? "text-white" : "text-gray-900"}
                              `}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <motion.div 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`
                                    w-2 h-2 rounded-full flex-shrink-0 mt-1
                                    ${isDarkMode ? "bg-blue-400" : "bg-blue-500"}
                                  `}
                                />
                              )}
                            </div>
                            
                            <p className={`
                              text-sm leading-relaxed break-words line-clamp-2
                              whitespace-normal overflow-wrap-anywhere
                              ${isDarkMode ? "text-slate-300" : "text-gray-600"}
                            `}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between pt-1">
                              <p className={`
                                text-xs
                                ${isDarkMode ? "text-slate-500" : "text-gray-400"}
                              `}>
                                {formatTime(notification.timestamp)}
                              </p>
                              {notification.read ? (
                                <Eye size={12} className={isDarkMode ? "text-slate-500" : "text-gray-400"} />
                              ) : (
                                <EyeOff size={12} className={isDarkMode ? "text-blue-400" : "text-blue-500"} />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {notifications.length > 0 && (
              <div className={`
                p-3 border-t 
                ${isDarkMode 
                  ? "border-slate-700 bg-slate-800/80" 
                  : "border-gray-200 bg-gray-50/80"
                }
              `}>
                <div className="flex gap-2">
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className={`
                      flex-1 px-3 py-2 
                      text-xs font-medium rounded-lg 
                      transition-all duration-200
                      flex items-center justify-center gap-1
                      ${unreadCount === 0
                        ? "opacity-50 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900"
                      }
                    `}
                  >
                    <Eye size={12} />
                    Tandai Dibaca
                  </button>
                  
                  <button
                    onClick={clearAllNotifications}
                    className={`
                      flex-1 px-3 py-2 
                      text-xs font-medium rounded-lg 
                      transition-all duration-200
                      flex items-center justify-center gap-1
                      ${isDarkMode
                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300"
                        : "bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800"
                      }
                    `}
                  >
                    <Trash2 size={12} />
                    Hapus Semua
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(243, 244, 246, 0.5)'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? 'rgba(100, 116, 139, 0.5)' : 'rgba(156, 163, 175, 0.5)'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? 'rgba(100, 116, 139, 0.8)' : 'rgba(156, 163, 175, 0.8)'};
        }
      `}</style>
    </div>
  );
}
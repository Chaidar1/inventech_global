import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // Jika belum login
  if (!token) {
    // Untuk route admin, redirect ke /admin-login
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin-login" state={{ from: location.pathname }} replace />;
    }
    // Untuk route lainnya, redirect ke login biasa (jika masih diperlukan)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Jika role tidak sesuai
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Jika lolos validasi
  return children;
}
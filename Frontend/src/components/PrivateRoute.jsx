import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Jika belum login → redirect ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika role tidak sesuai → redirect ke unauthorized
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Jika lolos validasi → tampilkan children (halaman tujuan)
  return children;
}

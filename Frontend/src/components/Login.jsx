import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, User, Lock } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input
    if (!username || !password) {
      toast.warning("⚠️ Username dan Password wajib diisi!");
      return;
    }

    // Buat formData sesuai format x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // Simpan token & role ke localStorage
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);

      toast.success("✅ Login berhasil!");

      // Redirect ke halaman utama
      setTimeout(() => {
        navigate("/");
      }, 600);
    } catch (err) {
      toast.error("❌ Login gagal. Username atau password salah!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg flex overflow-hidden w-[900px] max-w-full relative">
        
        {/* Logo Header */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <img
            src="/Logo PT.png"
            alt="Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-bold text-gray-700 text-lg">Inventech</span>
        </div>

        {/* Bagian Kiri - Form Login */}
        <div className="w-1/2 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Login</h1>
          <p className="text-gray-500 mb-8">Hallo! Selamat Datang</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username / Email
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <User className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="flex-1 outline-none ml-2"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="flex-1 outline-none ml-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              className="w-full bg-[#FF9913] text-white font-semibold py-2 rounded-lg hover:bg-[#e68a12] transition-colors"
              disabled={loading}
            >
              {loading ? "Memproses..." : "LOGIN →"}
            </button>
          </form>
        </div>

        {/* Bagian Kanan - Ilustrasi */}
        <div className="w-1/2 bg-[#FF9913] flex flex-col items-center justify-center p-6 relative">
          <img
            src="/Logo PT.png"
            alt="Ilustrasi Login"
            className="max-h-[350px] object-contain"
          />
          <h2 className="text-2xl font-bold text-white mt-6">
            PT INVENTECH GLOBAL
          </h2>
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";

export default function NotFoundPage() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-500">
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        
        {/* Admin Hint Section */}
        {isAdminPath && (
          <div className="mt-6 p-6 bg-blue-50 rounded-xl max-w-md mx-auto border border-blue-200 shadow-sm">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold text-blue-800 mb-2 text-lg">Akses Admin</h3>
            <p className="text-sm text-blue-600 mb-4">
              Jika Anda adalah administrator website, gunakan link khusus untuk login:
            </p>
            <Link 
              to="/admin-login" 
              className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md"
            >
              🔐 Login sebagai Admin
            </Link>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Bookmark link ini:</strong>
                <code className="block mt-1 bg-white px-3 py-1 rounded text-blue-800 font-mono">
                  {window.location.origin}/admin-login
                </code>
              </p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium shadow"
          >
            ← Kembali ke Beranda
          </Link>
          <Link 
            to="/events" 
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow"
          >
            📅 Lihat Event
          </Link>
          <Link 
            to="/kontak" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow"
          >
            📞 Hubungi Kami
          </Link>
        </div>
        
        {/* Additional Info */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Website ini bisa diakses sepenuhnya tanpa login. 
            Semua halaman user tersedia untuk umum.
          </p>
        </div>
      </div>
    </div>
  );
}
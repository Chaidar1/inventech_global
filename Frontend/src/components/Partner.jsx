import { useAppTheme } from "../hooks/useTheme";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Handshake, 
  Building, 
  Globe, 
  ExternalLink,
  Users,
  ChevronRight,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from "lucide-react";

export default function Partner() {
  const { themeClasses, isDarkMode } = useAppTheme();
  const navigate = useNavigate();
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [footerKontakData, setFooterKontakData] = useState({
    email: "",
    phone: "",
    address: "",
    description: "",
    copyright: "",
    social_media: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: ""
    }
  });

  // ✅ FUNGSI: Normalize image URL
  const normalizeImageUrl = (url) => {
    if (!url) return "";
    
    // Jika URL sudah lengkap, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Jika URL dimulai dengan /static, tambahkan base URL
    if (url.startsWith('/static/')) {
      return `http://localhost:8000${url}`;
    }
    
    // Jika hanya nama file, buat URL lengkap
    if (url && !url.includes('://') && !url.startsWith('/')) {
      return `http://localhost:8000/static/uploads/partner/${url}`;
    }
    
    // Jika dimulai dengan static (tanpa slash), tambahkan slash dan base URL
    if (url.startsWith('static/')) {
      return `http://localhost:8000/${url}`;
    }
    
    return url;
  };

  // Fetch data partner dari API
  useEffect(() => {
    fetchPartnerData();
    fetchFooterKontakData();
  }, []);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/partner/public");
      
      if (res.ok) {
        const data = await res.json();
        console.log("📊 Partner public data:", data);
        
        // ✅ PERBAIKAN: Normalize semua logo URL
        const normalizedData = {
          ...data,
          partners: data.partners?.map(partner => ({
            ...partner,
            logo: normalizeImageUrl(partner.logo)
          })) || []
        };
        
        setPartnerData(normalizedData);
        
        // Log untuk debugging
        normalizedData.partners?.forEach((partner, index) => {
          console.log(`Partner ${index} (${partner.name}):`, {
            originalLogo: data.partners?.[index]?.logo,
            normalizedLogo: partner.logo
          });
        });
      } else {
        console.error("Gagal mengambil data Partner");
        // Set data default jika API error
        setPartnerData({
          hero_title: "Partner & Sponsorship",
          hero_subtitle: "Berkolaborasi untuk Kesuksesan Bersama",
          partners: []
        });
      }
    } catch (error) {
      console.error("Error fetching Partner data:", error);
      // Set data default
      setPartnerData({
        hero_title: "Partner & Sponsorship",
        hero_subtitle: "Berkolaborasi untuk Kesuksesan Bersama",
        partners: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data footer kontak
  const fetchFooterKontakData = async () => {
    try {
      const res = await fetch("http://localhost:8000/footer-kontak/public");
      
      if (res.ok) {
        const data = await res.json();
        
        if (data && Object.keys(data).length > 0) {
          setFooterKontakData({
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            description: data.description || "",
            copyright: data.copyright || "",
            social_media: data.social_media || {
              facebook: "",
              instagram: "",
              twitter: "",
              youtube: ""
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching footer kontak data:", error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-[#D7FE51]" : "border-[#646B5E]"
          } mx-auto mb-4`}></div>
          <p className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}>
            Memuat data Partner...
          </p>
        </div>
      </div>
    );
  }

  const { hero_title, hero_subtitle, partners } = partnerData;

  // Group partners by category
  const sponsors = partners.filter(p => p.category === 'sponsor');
  const mediaPartners = partners.filter(p => p.category === 'media');
  const communityPartners = partners.filter(p => p.category === 'community');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg}`}>
      {/* Hero Section */}
      <section className={`py-12 md:py-16 px-4 md:px-8 ${
        isDarkMode 
          ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" 
          : "bg-gradient-to-br from-gray-50 to-white"
      }`}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium bg-gradient-to-r from-[#D7FE51] to-[#9BCB3D] text-[#1A1F16]">
            <Handshake size={16} />
            <span>Partnership</span>
          </div>
          
          <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 ${
            isDarkMode ? "text-white" : "text-[#646B5E]"
          }`}>
            {hero_title}
          </h1>
          
          <p className={`text-lg md:text-xl mb-8 md:mb-12 max-w-3xl mx-auto ${
            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
          }`}>
            {hero_subtitle}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
            <div className={`p-4 md:p-6 rounded-xl text-center ${
              isDarkMode 
                ? "bg-[#1A1F16]/50 backdrop-blur-sm border border-[#363D30]/50" 
                : "bg-white border border-gray-200 shadow-sm"
            }`}>
              <div className="text-2xl md:text-3xl font-bold text-[#D7FE51] mb-2">
                {partners.length}
              </div>
              <div className={`text-sm md:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                Total Partners
              </div>
            </div>
            
            <div className={`p-4 md:p-6 rounded-xl text-center ${
              isDarkMode 
                ? "bg-[#1A1F16]/50 backdrop-blur-sm border border-[#363D30]/50" 
                : "bg-white border border-gray-200 shadow-sm"
            }`}>
              <div className="text-2xl md:text-3xl font-bold text-[#D7FE51] mb-2">
                {sponsors.length}
              </div>
              <div className={`text-sm md:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                Official Sponsors
              </div>
            </div>
            
            <div className={`p-4 md:p-6 rounded-xl text-center ${
              isDarkMode 
                ? "bg-[#1A1F16]/50 backdrop-blur-sm border border-[#363D30]/50" 
                : "bg-white border border-gray-200 shadow-sm"
            }`}>
              <div className="text-2xl md:text-3xl font-bold text-[#D7FE51] mb-2">
                {mediaPartners.length + communityPartners.length}
              </div>
              <div className={`text-sm md:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                Support Partners
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Section - PERBAIKAN: Ditambahkan gradien background */}
      {sponsors.length > 0 && (
        <section className={`py-12 md:py-16 px-4 md:px-8 ${
          isDarkMode 
            ? "bg-gradient-to-br from-[#1A1F16] via-[#0A0E0B] to-[#1A1F16]" 
            : "bg-gradient-to-br from-gray-50 to-white"
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className={`text-2xl md:text-3xl font-bold mb-3 md:mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Official Sponsors
              </h2>
              <p className={`max-w-2xl mx-auto ${
                isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
              }`}>
                Perusahaan-perusahaan terkemuka yang mendukung event kami
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {sponsors.map((sponsor, index) => (
                <div key={index} className={`p-4 md:p-6 rounded-xl text-center transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-[#1A1F16]/50 backdrop-blur-sm border border-[#363D30]/50 hover:border-[#D7FE51]/30 hover:shadow-lg hover:shadow-[#D7FE51]/10" 
                    : "bg-white border border-gray-200 hover:border-[#646B5E] hover:shadow-lg"
                }`}>
                  <div className="aspect-square mb-4">
                    {sponsor.logo ? (
                      <img 
                        src={sponsor.logo} 
                        alt={sponsor.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error(`❌ Image failed to load in user page: ${sponsor.logo}`);
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dominant-baseline='middle'>No Logo</text></svg>";
                        }}
                        onLoad={() => console.log(`✅ User page image loaded: ${sponsor.logo}`)}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center rounded-lg ${
                        isDarkMode ? "bg-[#2A3025]" : "bg-gray-100"
                      }`}>
                        <Building size={32} className={isDarkMode ? "text-[#ABB89D]" : "text-gray-400"} />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-bold text-sm md:text-base mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                    {sponsor.name}
                  </h3>
                  <p className={`text-xs md:text-sm mb-3 ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                    {sponsor.description}
                  </p>
                  {sponsor.website && (
                    <a 
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 text-xs md:text-sm ${
                        isDarkMode ? "text-[#D7FE51] hover:text-[#C4E840]" : "text-[#646B5E] hover:text-[#ABB89D]"
                      }`}
                    >
                      Visit Website
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Media Partners Section */}
      {mediaPartners.length > 0 && (
        <section className={`py-12 md:py-16 px-4 md:px-8 ${
          isDarkMode 
            ? "bg-gradient-to-br from-[#1A1F16] via-[#0A0E0B] to-[#1A1F16]" 
            : "bg-gradient-to-br from-gray-50 to-white"
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className={`text-2xl md:text-3xl font-bold mb-3 md:mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Media Partners
              </h2>
              <p className={`max-w-2xl mx-auto ${
                isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
              }`}>
                Media terpercaya yang membantu menyebarkan informasi event kami
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {mediaPartners.map((partner, index) => (
                <div key={index} className={`p-4 md:p-6 rounded-xl text-center transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-[#1A1F16]/50 backdrop-blur-sm border border-[#363D30]/50 hover:border-[#D7FE51]/30" 
                    : "bg-white border border-gray-200 hover:border-[#646B5E]"
                }`}>
                  <div className="aspect-square mb-4">
                    {partner.logo ? (
                      <img 
                        src={partner.logo} 
                        alt={partner.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error(`❌ Media partner image failed: ${partner.logo}`);
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dominant-baseline='middle'>No Logo</text></svg>";
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center rounded-lg ${
                        isDarkMode ? "bg-[#2A3025]" : "bg-gray-100"
                      }`}>
                        <Globe size={32} className={isDarkMode ? "text-[#ABB89D]" : "text-gray-400"} />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-bold text-sm md:text-base mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                    {partner.name}
                  </h3>
                  <p className={`text-xs md:text-sm ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                    Media Partner
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Partners Section - PERBAIKAN: Ditambahkan gradien background */}
      {communityPartners.length > 0 && (
        <section className={`py-12 md:py-16 px-4 md:px-8 ${
          isDarkMode 
            ? "bg-gradient-to-br from-[#1A1F16] via-[#0A0E0B] to-[#1A1F16]" 
            : "bg-gradient-to-br from-gray-50 to-white"
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className={`text-2xl md:text-3xl font-bold mb-3 md:mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Community Partners
              </h2>
              <p className={`max-w-2xl mx-auto ${
                isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
              }`}>
                Komunitas-komunitas yang mendukung dan berpartisipasi dalam event kami
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {communityPartners.map((partner, index) => (
                <div key={index} className={`p-4 md:p-6 rounded-xl text-center transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-[#1A1F16]/50 backdrop-blur-sm border border-[#363D30]/50 hover:border-[#D7FE51]/30" 
                    : "bg-white border border-gray-200 hover:border-[#646B5E]"
                }`}>
                  <div className="aspect-square mb-4">
                    {partner.logo ? (
                      <img 
                        src={partner.logo} 
                        alt={partner.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error(`❌ Community partner image failed: ${partner.logo}`);
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dominant-baseline='middle'>No Logo</text></svg>";
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center rounded-lg ${
                        isDarkMode ? "bg-[#2A3025]" : "bg-gray-100"
                      }`}>
                        <Users size={32} className={isDarkMode ? "text-[#ABB89D]" : "text-gray-400"} />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-bold text-sm md:text-base mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                    {partner.name}
                  </h3>
                  <p className={`text-xs md:text-sm ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                    Community Partner
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className={`py-12 md:py-16 px-4 md:px-8 ${
        isDarkMode 
          ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" 
          : "bg-gradient-to-br from-gray-50 to-white"
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 md:mb-6 ${
            isDarkMode ? "text-white" : "text-[#646B5E]"
          }`}>
            Ingin Menjadi Partner Kami?
          </h2>
          <p className={`text-lg md:text-xl mb-8 md:mb-12 max-w-3xl mx-auto ${
            isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
          }`}>
            Bergabunglah dengan jaringan partner Gastronomi Run dan dapatkan manfaat eksklusif untuk brand Anda.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/kontak"
              className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                isDarkMode 
                  ? "bg-[#D7FE51] text-[#1A1F16] hover:bg-[#C4E840] hover:shadow-lg hover:shadow-[#D7FE51]/30" 
                  : "bg-[#646B5E] text-white hover:bg-[#ABB89D] hover:shadow-lg"
              }`}
            >
              <span>Hubungi Tim Partnership</span>
              <ChevronRight size={20} />
            </a>
            
            <a 
              href="/events"
              className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium border transition-all duration-300 ${
                isDarkMode 
                  ? "border-[#363D30] text-[#ABB89D] hover:bg-[#363D30] hover:text-white" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Lihat Event Kami
            </a>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className={`pt-16 pb-8 px-4 md:px-6 border-t transition-colors duration-300 w-full ${
        isDarkMode ? "bg-[#0A0E0B]/90 backdrop-blur-sm border-[#1A1F16]" : "bg-white border-gray-200"
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            {/* Kolom 1: Kontak Kami */}
            <div>
              <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Kontak Kami
              </h3>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                  <span className={`text-sm md:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                    {footerKontakData.email || "info@gastronomirun.com"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                  <span className={`text-sm md:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                    {footerKontakData.phone || "(021) 1234-5678"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon size={18} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                  <span className={`text-sm md:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                    {footerKontakData.address || "Jakarta Running Center, Indonesia"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Kolom 2: Ikuti Kami */}
            <div>
              <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Ikuti Kami
              </h3>
              <div className="flex gap-3 md:gap-4">
                {footerKontakData.social_media && Object.entries(footerKontakData.social_media).map(([platform, url]) => (
                  url && (
                    <a 
                      key={platform}
                      href={url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`p-2 md:p-3 rounded-full transition-colors ${
                        isDarkMode 
                          ? "bg-[#1A1F16] border border-[#363D30] text-[#ABB89D] hover:bg-[#D7FE51] hover:text-[#0A0E0B]" 
                          : "bg-gray-100 text-[#646B5E] hover:bg-[#D7FE51]"
                      }`}
                    >
                      {platform === 'facebook' && <Facebook size={18} />}
                      {platform === 'instagram' && <Instagram size={18} />}
                      {platform === 'twitter' && <Twitter size={18} />}
                      {platform === 'youtube' && <Youtube size={18} />}
                    </a>
                  )
                ))}
              </div>
            </div>
            
            {/* Kolom 3: Tautan Cepat */}
            <div>
              <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Tautan Cepat
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate("/")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm md:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Beranda
                </button>
                <button 
                  onClick={() => navigate("/events")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm md:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Lihat Event
                </button>
                <button 
                  onClick={() => navigate("/tentang-kami")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm md:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Tentang Kami
                </button>
                <button 
                  onClick={() => navigate("/layanan")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm md:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Layanan
                </button>
                <button 
                  onClick={() => navigate("/kontak")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm md:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Kontak
                </button>
              </div>
            </div>
          </div>
          
          {/* Bagian Bawah Footer */}
          <div className={`pt-6 md:pt-8 border-t text-center ${
            isDarkMode ? "border-[#1A1F16]" : "border-gray-200"
          }`}>
            <div className="mb-3 md:mb-4">
              <h4 className={`text-xl md:text-2xl font-black mb-2 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                GASTRONOMI RUN
              </h4>
              <p className={`text-sm md:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                Where Running Meets Culinary Adventure
              </p>
            </div>
            
            <p className={`text-xs md:text-sm mb-3 md:mb-4 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
              {footerKontakData.description || "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang."}
            </p>
            
            <div className={`flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 mb-4 md:mb-6 ${
              isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
            }`}>
              <span className="text-xs md:text-sm">{footerKontakData.copyright || "© 2024 Gastronomi Run. All rights reserved."}</span>
              <span className="hidden md:inline">|</span>
              <a 
                href="https://store.gastronomirun.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#D7FE51] transition-colors text-xs md:text-sm"
              >
                Visit our Store
              </a>
            </div>
            
            <p className={`text-xs ${isDarkMode ? "text-[#ABB89D]/70" : "text-gray-500"}`}>
              Diselenggarakan oleh <strong>GastronomiRun.com</strong> - Your Track, Your Victory
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
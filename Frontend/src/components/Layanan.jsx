import { motion } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity,
  Utensils,
  Trophy,
  Users,
  Users as UsersIcon,
  Award as AwardIcon,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Mail,
  Phone,
  MapPin as MapPinIcon
} from "lucide-react";

export default function Layanan() {
  const { themeClasses, isDarkMode } = useAppTheme();
  const navigate = useNavigate();

  // State untuk data Layanan dari API
  const [layananData, setLayananData] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_description: "",
    services: [],
    target_audience: [],
    kontak_info: {
      email: "",
      phone: "",
      address: "",
      social_media: {}
    }
  });

  // State untuk data footer kontak dari admin
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

  const [loadingLayanan, setLoadingLayanan] = useState(true);
  const [loadingFooter, setLoadingFooter] = useState(true);

  // Fungsi render icon berdasarkan nama
  const renderIcon = (iconName, size = 32) => {
    const iconProps = { size };
    switch(iconName) {
      case 'Activity': return <Activity {...iconProps} />;
      case 'Utensils': return <Utensils {...iconProps} />;
      case 'Trophy': return <Trophy {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'Award': return <AwardIcon {...iconProps} />;
      case 'Heart': return <Users {...iconProps} />;
      case 'Shield': return <Users {...iconProps} />;
      case 'Globe': return <Users {...iconProps} />;
      case 'Star': return <Users {...iconProps} />;
      default: return <Activity {...iconProps} />;
    }
  };

  // Fetch data Layanan dari endpoint public
  const fetchLayananData = async () => {
    try {
      setLoadingLayanan(true);
      const res = await fetch("http://localhost:8000/layanan/public");
      
      if (res.ok) {
        const data = await res.json();
        console.log("Data layanan received in Layanan:", data);
        
        if (data && Object.keys(data).length > 0) {
          setLayananData({
            hero_title: data.hero_title || "LAYANAN KAMI",
            hero_subtitle: data.hero_subtitle || "Solusi Lengkap untuk Pengalaman Lari Terbaik",
            hero_description: data.hero_description || "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan.",
            services: data.services || [],
            target_audience: data.target_audience || [
              {
                title: "Untuk Pelari",
                icon: "Users",
                description: "Kami menyediakan event lari berkualitas dengan rute yang menarik, sistem pendaftaran yang mudah, dan pengalaman yang memuaskan. Setiap event dirancang untuk memberikan pengalaman terbaik bagi pelari dari berbagai level.",
                features: ["Event berkualitas", "Rute menarik", "Pendaftaran mudah", "Pengalaman memuaskan"]
              },
              {
                title: "Untuk Event Organizer & Brand",
                icon: "Award",
                description: "Kami adalah partner terpercaya untuk menyelenggarakan event lari yang tepat sasaran dengan desain yang kreatif dan profesional. Kami membantu brand dan event organizer meningkatkan reach mereka melalui platform dan jaringan yang luas.",
                features: ["Partner terpercaya", "Desain kreatif", "Platform luas", "Jaringan kuat"]
              }
            ],
            kontak_info: data.kontak_info || {
              email: "info@gastronomirun.com",
              phone: "(021) 1234-5678",
              address: "Jakarta Running Center, Indonesia",
              social_media: {
                facebook: "https://facebook.com/gastronomirun",
                instagram: "https://instagram.com/gastronomirun",
                twitter: "https://twitter.com/gastronomirun",
                youtube: "https://youtube.com/gastronomirun"
              }
            }
          });
        }
      } else {
        console.warn("Gagal mengambil data layanan, menggunakan data default");
        // Gunakan data default
        setLayananData({
          hero_title: "LAYANAN KAMI",
          hero_subtitle: "Solusi Lengkap untuk Pengalaman Lari Terbaik",
          hero_description: "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan.",
          services: [
            {
              icon: "Activity",
              title: "Event Organization",
              description: "Menyelenggarakan berbagai jenis event lari dengan rute yang menarik melalui kota-kota besar Indonesia.",
              features: ["Rute terukur & aman", "Pendaftaran online", "Tim medis standby"]
            },
            {
              icon: "Utensils",
              title: "Culinary Experience",
              description: "Mengintegrasikan pengalaman kuliner lokal dalam setiap event untuk memperkaya petualangan peserta.",
              features: ["Food tasting", "Local cuisine", "Nutrition guidance"]
            },
            {
              icon: "Trophy",
              title: "Race Package",
              description: "Paket lengkap termasuk jersey, medali finisher, timing chip, dan souvenir eksklusif.",
              features: ["Quality merchandise", "Finisher medal", "Digital certificate"]
            },
            {
              icon: "Users",
              title: "Community Building",
              description: "Membangun komunitas pelari yang solid dengan regular training sessions dan gathering.",
              features: ["Weekly runs", "Training programs", "Social events"]
            }
          ],
          target_audience: [
            {
              title: "Untuk Pelari",
              icon: "Users",
              description: "Kami menyediakan event lari berkualitas dengan rute yang menarik, sistem pendaftaran yang mudah, dan pengalaman yang memuaskan. Setiap event dirancang untuk memberikan pengalaman terbaik bagi pelari dari berbagai level.",
              features: ["Event berkualitas", "Rute menarik", "Pendaftaran mudah", "Pengalaman memuaskan"]
            },
            {
              title: "Untuk Event Organizer & Brand",
              icon: "Award",
              description: "Kami adalah partner terpercaya untuk menyelenggarakan event lari yang tepat sasaran dengan desain yang kreatif dan profesional. Kami membantu brand dan event organizer meningkatkan reach mereka melalui platform dan jaringan yang luas.",
              features: ["Partner terpercaya", "Desain kreatif", "Platform luas", "Jaringan kuat"]
            }
          ],
          kontak_info: {
            email: "info@gastronomirun.com",
            phone: "(021) 1234-5678",
            address: "Jakarta Running Center, Indonesia",
            social_media: {
              facebook: "https://facebook.com/gastronomirun",
              instagram: "https://instagram.com/gastronomirun",
              twitter: "https://twitter.com/gastronomirun",
              youtube: "https://youtube.com/gastronomirun"
            }
          }
        });
      }
    } catch (error) {
      console.error("Error fetching layanan data in Layanan:", error);
      // Gunakan data default jika error
      setLayananData({
        hero_title: "LAYANAN KAMI",
        hero_subtitle: "Solusi Lengkap untuk Pengalaman Lari Terbaik",
        hero_description: "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan.",
        services: [
          {
            icon: "Activity",
            title: "Event Organization",
            description: "Menyelenggarakan berbagai jenis event lari dengan rute yang menarik melalui kota-kota besar Indonesia.",
            features: ["Rute terukur & aman", "Pendaftaran online", "Tim medis standby"]
          },
          {
            icon: "Utensils",
            title: "Culinary Experience",
            description: "Mengintegrasikan pengalaman kuliner lokal dalam setiap event untuk memperkaya petualangan peserta.",
            features: ["Food tasting", "Local cuisine", "Nutrition guidance"]
          },
          {
            icon: "Trophy",
            title: "Race Package",
            description: "Paket lengkap termasuk jersey, medali finisher, timing chip, dan souvenir eksklusif.",
            features: ["Quality merchandise", "Finisher medal", "Digital certificate"]
          },
          {
            icon: "Users",
            title: "Community Building",
            description: "Membangun komunitas pelari yang solid dengan regular training sessions dan gathering.",
            features: ["Weekly runs", "Training programs", "Social events"]
          }
        ],
        target_audience: [
          {
            title: "Untuk Pelari",
            icon: "Users",
            description: "Kami menyediakan event lari berkualitas dengan rute yang menarik, sistem pendaftaran yang mudah, dan pengalaman yang memuaskan. Setiap event dirancang untuk memberikan pengalaman terbaik bagi pelari dari berbagai level.",
            features: ["Event berkualitas", "Rute menarik", "Pendaftaran mudah", "Pengalaman memuaskan"]
          },
          {
            title: "Untuk Event Organizer & Brand",
            icon: "Award",
            description: "Kami adalah partner terpercaya untuk menyelenggarakan event lari yang tepat sasaran dengan desain yang kreatif dan profesional. Kami membantu brand dan event organizer meningkatkan reach mereka melalui platform dan jaringan yang luas.",
            features: ["Partner terpercaya", "Desain kreatif", "Platform luas", "Jaringan kuat"]
          }
        ],
        kontak_info: {
          email: "info@gastronomirun.com",
          phone: "(021) 1234-5678",
          address: "Jakarta Running Center, Indonesia",
          social_media: {
            facebook: "https://facebook.com/gastronomirun",
            instagram: "https://instagram.com/gastronomirun",
            twitter: "https://twitter.com/gastronomirun",
            youtube: "https://youtube.com/gastronomirun"
          }
        }
      });
    } finally {
      setLoadingLayanan(false);
    }
  };

  // Fetch data footer kontak dari endpoint public
  const fetchFooterKontakData = async () => {
    try {
      setLoadingFooter(true);
      const res = await fetch("http://localhost:8000/footer-kontak/public");
      
      if (res.ok) {
        const data = await res.json();
        console.log("Data footer kontak received in Layanan:", data);
        
        if (data && Object.keys(data).length > 0) {
          setFooterKontakData({
            email: data.email || "info@gastronomirun.com",
            phone: data.phone || "(021) 1234-5678",
            address: data.address || "Jakarta Running Center, Indonesia",
            description: data.description || "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
            copyright: data.copyright || "© 2024 Gastronomi Run. All rights reserved.",
            social_media: data.social_media || {
              facebook: "https://facebook.com/gastronomirun",
              instagram: "https://instagram.com/gastronomirun",
              twitter: "https://twitter.com/gastronomirun",
              youtube: "https://youtube.com/gastronomirun"
            }
          });
        }
      } else {
        console.warn("Gagal mengambil data footer kontak di Layanan, menggunakan data default");
        // Gunakan data default
        setFooterKontakData({
          email: "info@gastronomirun.com",
          phone: "(021) 1234-5678",
          address: "Jakarta Running Center, Indonesia",
          description: "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
          copyright: "© 2024 Gastronomi Run. All rights reserved.",
          social_media: {
            facebook: "https://facebook.com/gastronomirun",
            instagram: "https://instagram.com/gastronomirun",
            twitter: "https://twitter.com/gastronomirun",
            youtube: "https://youtube.com/gastronomirun"
          }
        });
      }
    } catch (error) {
      console.error("Error fetching footer kontak data in Layanan:", error);
      // Gunakan data default jika error
      setFooterKontakData({
        email: "info@gastronomirun.com",
        phone: "(021) 1234-5678",
        address: "Jakarta Running Center, Indonesia",
        description: "Gastronomi Run adalah bagian dari komitmen untuk merealisasikan kemajuan urban dan industri olahraga di Indonesia. Kami menyediakan layanan yang terbaik dan inovatif untuk semua orang.",
        copyright: "© 2024 Gastronomi Run. All rights reserved.",
        social_media: {
          facebook: "https://facebook.com/gastronomirun",
          instagram: "https://instagram.com/gastronomirun",
          twitter: "https://twitter.com/gastronomirun",
          youtube: "https://youtube.com/gastronomirun"
        }
      });
    } finally {
      setLoadingFooter(false);
    }
  };

  // Effect untuk fetch data layanan dan footer kontak
  useEffect(() => {
    fetchLayananData();
    fetchFooterKontakData();
  }, []);

  // Tampilkan loading jika data masih loading
  if (loadingLayanan) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-[#D7FE51]" : "border-[#646B5E]"
          } mx-auto mb-4`}></div>
          <p className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}>
            Memuat data Layanan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? "bg-gradient-to-br from-[#0A0E0B] via-[#1A1F16] to-[#0A0E0B]" : "bg-white"
    }`}>
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section untuk Layanan - RESPONSIVE */}
        <section 
          className={`relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 transition-colors duration-300 overflow-hidden ${
            isDarkMode 
              ? "bg-gradient-to-br from-[#1A1F16] via-[#2A3025] to-[#1A1F16]" 
              : "bg-gradient-to-br from-[#646B5E] via-[#ABB89D] to-[#646B5E]"
          }`}
        >
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6 sm:mb-8"
            >
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-white leading-tight break-words"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <span className="block">{layananData.hero_title}</span>
                <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal mt-2 sm:mt-4 opacity-90">
                  {layananData.hero_subtitle}
                </span>
              </motion.h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "120px" }}
                transition={{ duration: 1, delay: 0.8 }}
                className={`h-1 mx-auto mb-6 sm:mb-8 rounded-full bg-[#D7FE51]`}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0">
                {layananData.hero_description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Layanan Kami Section - RESPONSIVE */}
        <section className={`py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 transition-colors duration-300 ${
          isDarkMode ? "bg-transparent" : "bg-gray-50"
        }`}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-10 sm:mb-12 md:mb-16"
            >
              <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 break-words ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Apa yang Kami Lakukan?
              </h2>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100px" }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`h-1 mx-auto mb-4 sm:mb-6 rounded-full bg-[#D7FE51]`}
              />
              <p className={`text-lg sm:text-xl max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-0 ${
                isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"
              }`}>
                Menghubungkan semangat lari dengan petualangan kuliner
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {layananData.services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className={`group p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl transition-all duration-300 ${
                    isDarkMode 
                      ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border border-[#363D30]/50 hover:border-[#D7FE51] hover:shadow-[0_0_20px_rgba(215,254,81,0.1)] sm:hover:shadow-[0_0_30px_rgba(215,254,81,0.2)]" 
                      : "bg-white border border-gray-200 hover:border-[#D7FE51] hover:shadow-lg sm:hover:shadow-xl shadow-md"
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mb-4 sm:mb-6 ${
                    isDarkMode ? "bg-[#D7FE51]/20 text-[#D7FE51]" : "bg-[#D7FE51]/20 text-[#646B5E]"
                  } group-hover:bg-[#D7FE51] group-hover:text-[#1A1F16] transition-colors duration-300`}>
                    {renderIcon(service.icon, 24)}
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 break-words ${
                    isDarkMode ? "text-white" : "text-[#646B5E]"
                  }`}>
                    {service.title}
                  </h3>
                  <p className={`mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}>
                    {service.description}
                  </p>
                  <div className="space-y-1 sm:space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isDarkMode ? "bg-[#D7FE51]" : "bg-[#646B5E]"}`}></div>
                        <span className={`text-xs sm:text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Untuk Siapa Kami? - Target Audience - RESPONSIVE */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true, margin: "-50px" }}
              className="mt-12 sm:mt-16 md:mt-20"
            >
              <h3 className={`text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-10 md:mb-12 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Untuk Siapa Kami?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {layananData.target_audience.map((audience, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`relative p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl ${
                      isDarkMode 
                        ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border-2 border-[#363D30]/50" 
                        : "bg-white border-2 border-gray-200"
                    }`}
                  >
                    <div className={`absolute -top-4 -left-4 sm:-top-5 sm:-left-5 md:-top-6 md:-left-6 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center ${
                      index === 0 ? "bg-[#D7FE51]" : "bg-[#ABB89D]"
                    } shadow-lg`}>
                      {renderIcon(audience.icon, 24)}
                    </div>
                    
                    <div className="pt-6 sm:pt-8 md:pt-10">
                      <h4 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${
                        index === 0 ? "text-[#D7FE51]" : "text-[#ABB89D]"
                      }`}>
                        {audience.title}
                      </h4>
                      <p className={`leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base ${
                        isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"
                      }`}>
                        {audience.description}
                      </p>
                      
                      <div className="space-y-1 sm:space-y-2">
                        {audience.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                              index === 0 ? "bg-[#D7FE51]" : "bg-[#ABB89D]"
                            }`}></div>
                            <span className={`text-xs sm:text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}`}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Kontak & Footer Section - DIMODIFIKASI seperti HomeUser.jsx */}
        <footer className={`pt-16 pb-8 px-6 border-t transition-colors duration-300 w-full ${
          isDarkMode ? "bg-[#0A0E0B]/90 backdrop-blur-sm border-[#1A1F16]" : "bg-white border-gray-200"
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Kolom 1: Kontak Kami */}
              <div>
                <h3 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
                }`}>
                  Kontak Kami
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                    <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                      {footerKontakData.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                    <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                      {footerKontakData.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon size={20} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                    <span className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                      {footerKontakData.address}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Kolom 2: Ikuti Kami */}
              <div>
                <h3 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
                }`}>
                  Ikuti Kami
                </h3>
                <div className="flex gap-4">
                  {Object.entries(footerKontakData.social_media || {}).map(([platform, url]) => (
                    url && (
                      <a 
                        key={platform}
                        href={url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`p-2 rounded-full transition-colors ${
                          isDarkMode 
                            ? "bg-[#1A1F16] border border-[#363D30] text-[#ABB89D] hover:bg-[#D7FE51] hover:text-[#0A0E0B]" 
                            : "bg-gray-100 text-[#646B5E] hover:bg-[#D7FE51]"
                        }`}
                      >
                        {platform === 'facebook' && <Facebook size={20} />}
                        {platform === 'instagram' && <Instagram size={20} />}
                        {platform === 'twitter' && <Twitter size={20} />}
                        {platform === 'youtube' && <Youtube size={20} />}
                      </a>
                    )
                  ))}
                </div>
              </div>
              
              {/* Kolom 3: Tautan Cepat */}
              <div>
                <h3 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
                }`}>
                  Tautan Cepat
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate("/")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Beranda
                  </button>
                  <button 
                    onClick={() => navigate("/events")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Lihat Event
                  </button>
                  <button 
                    onClick={() => navigate("/tentang-kami")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Tentang Kami
                  </button>
                  <button 
                    onClick={() => navigate("/partner")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Partner
                  </button>
                  <button 
                    onClick={() => navigate("/kontak")}
                    className={`block text-left hover:text-[#D7FE51] transition-colors ${
                      isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                    }`}
                  >
                    Kontak
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bagian Bawah Footer */}
            <div className={`pt-8 border-t text-center ${
              isDarkMode ? "border-[#1A1F16]" : "border-gray-200"
            }`}>
              <div className="mb-4">
                <h4 className={`text-2xl font-black mb-2 ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
                }`}>
                  GASTRONOMI RUN
                </h4>
                <p className={isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}>
                  Where Running Meets Culinary Adventure
                </p>
              </div>
              
              <p className={`text-sm mb-4 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                {footerKontakData.description}
              </p>
              
              <div className={`flex flex-col md:flex-row justify-center items-center gap-4 mb-6 ${
                isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
              }`}>
                <span>{footerKontakData.copyright}</span>
                <span className="hidden md:inline">|</span>
                <a 
                  href="https://store.gastronomirun.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#D7FE51] transition-colors"
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
    </div>
  );
}
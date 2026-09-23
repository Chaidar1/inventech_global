import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppTheme } from "../hooks/useTheme";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ChevronDown, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ArrowRight,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  MapPin as MapPinIcon,
  Star,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Briefcase,
  Maximize2,
  X,
  ChevronRight as ChevronRightIcon,
  Search,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Play,
  Pause,
  Loader2,
  Heart,
  Shield,
  Award,
  Check,
  Activity,
  Utensils,
  Trophy,
  Globe,
  Handshake
} from "lucide-react";
import { fetchKelasData, getCategoriesFromKelas } from "./KelasListUser";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Import SwiperJS dan modul-modul yang diperlukan
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Zoom, Keyboard, EffectFade, Autoplay } from 'swiper/modules';

// Import styles SwiperJS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import 'swiper/css/effect-fade';
import 'swiper/css/thumbs';

// Import Google Fonts untuk Poppins
import "@fontsource/poppins/700.css"; // Bold weight

// Komponen Lightbox Modal untuk User (hanya view)
const LightboxModal = ({ 
  images, 
  initialIndex, 
  isOpen, 
  onClose, 
  isDarkMode 
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [showThumbs, setShowThumbs] = useState(true);

  useEffect(() => {
    if (isOpen && mainSwiper) {
      mainSwiper.slideTo(initialIndex, 0);
    }
  }, [isOpen, initialIndex, mainSwiper]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && mainSwiper) mainSwiper.slideNext();
      if (e.key === 'ArrowLeft' && mainSwiper) mainSwiper.slidePrev();
      if (e.key === 't' || e.key === 'T') setShowThumbs(prev => !prev);
      if (e.key === 'z' || e.key === 'Z') setZoomEnabled(prev => !prev);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, mainSwiper]);

  if (!isOpen || !images?.length) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${
      isDarkMode ? 'bg-black/95' : 'bg-black/95'
    }`}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[10000] p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Image counter */}
      <div className="absolute top-6 left-6 z-[10000] px-3 py-1.5 rounded-full bg-black/50 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Controls info */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[10000] px-3 py-1.5 rounded-full bg-black/50 text-white text-xs hidden md:block">
        ← → Navigasi | Z Zoom | T Thumbnail | ESC Tutup
      </div>

      {/* Main Swiper container */}
      <div className="w-full h-full max-w-7xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Thumbs, Zoom, Keyboard, EffectFade]}
          spaceBetween={50}
          slidesPerView={1}
          navigation
          pagination={{ 
            type: 'fraction',
            clickable: true 
          }}
          zoom={{
            maxRatio: 3,
            minRatio: 1,
            toggle: zoomEnabled
          }}
          keyboard={{ enabled: true }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
          className="w-full h-full"
          initialSlide={initialIndex}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        >
          {images.map((image, index) => {
            const isPortrait = image.orientation === 'portrait' || 
              (image.width && image.height && image.height > image.width * 1.1);
            
            return (
              <SwiperSlide key={image.id || index} className="relative">
                <div className="swiper-zoom-container w-full h-full flex items-center justify-center">
                  <div className={`relative flex items-center justify-center ${
                    isPortrait 
                      ? 'h-full max-h-[80vh] w-auto' 
                      : 'w-full max-w-full h-auto'
                  }`}>
                    <img
                      src={image.url}
                      alt={image.description || `Slide ${index + 1}`}
                      className={`${
                        isPortrait 
                          ? 'max-h-[80vh] h-auto w-auto object-contain' 
                          : 'w-full h-auto max-h-[80vh] object-contain'
                      }`}
                      style={{
                        backgroundColor: isPortrait 
                          ? (isDarkMode ? '#1A1F16' : '#f5f5f5') 
                          : 'transparent'
                      }}
                      loading="lazy"
                    />
                    
                    {/* Badge untuk orientasi */}
                    {isPortrait && (
                      <div className="absolute top-4 right-4 px-2 py-1 rounded bg-black/60 text-white text-xs">
                        Portrait
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Deskripsi gambar */}
                {image.description && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-black/70 text-white max-w-lg text-center">
                    {image.description}
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Thumbnail swiper */}
        {showThumbs && images.length > 1 && (
          <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl ${
            isDarkMode ? 'bg-black/40' : 'bg-black/30'
          } backdrop-blur-sm rounded-lg p-2`}>
            <Swiper
              modules={[Thumbs]}
              watchSlidesProgress
              onSwiper={setThumbsSwiper}
              spaceBetween={8}
              slidesPerView="auto"
              freeMode={true}
              centeredSlides={true}
              slideToClickedSlide={true}
              className="thumbnail-swiper"
              breakpoints={{
                320: { slidesPerView: 3 },
                640: { slidesPerView: 5 },
                1024: { slidesPerView: 7 }
              }}
            >
              {images.map((image, index) => {
                const isPortrait = image.orientation === 'portrait' || 
                  (image.width && image.height && image.height > image.width * 1.1);
                
                return (
                  <SwiperSlide key={image.id || index} className="!w-16 !h-16 cursor-pointer">
                    <div className={`relative w-full h-full rounded overflow-hidden ${
                      currentIndex === index 
                        ? 'ring-2 ring-[#D7FE51]' 
                        : 'ring-1 ring-white/30'
                    }`}>
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-full h-full object-cover ${
                          isPortrait ? 'object-contain' : 'object-cover'
                        }`}
                        style={{
                          backgroundColor: isPortrait 
                            ? (isDarkMode ? '#2A3025' : '#f0f0f0') 
                            : 'transparent'
                        }}
                      />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}

        {/* Control buttons */}
        <div className="absolute bottom-20 right-6 z-[10000] flex gap-2">
          <button
            onClick={() => setZoomEnabled(!zoomEnabled)}
            className={`p-3 rounded-full ${
              zoomEnabled 
                ? 'bg-[#D7FE51] text-black' 
                : 'bg-black/50 text-white hover:bg-black/70'
            } transition-colors`}
            title="Toggle Zoom (Z)"
          >
            <ZoomIn size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Komponen Slider Event untuk User - MENGAMBIL DATA DARI API SLIDER EVENTS
// MODIFIKASI: Tombol navigasi akan selalu bisa diklik dengan loop: true
const EventSliderUser = ({ isDarkMode, navigate }) => {
  const [sliderImages, setSliderImages] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventImagesData, setEventImagesData] = useState({});
  const swiperRef = useRef(null);

  // Fetch data event slider dari API public
  const fetchSliderEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/slider-events/public");
      
      if (response.ok) {
        const data = await response.json();
        
        // Data berisi array of event IDs yang dipilih untuk slider
        if (data && Array.isArray(data.selected_events)) {
          await fetchEventImagesForSlider(data.selected_events);
        } else {
          console.warn("Data slider events tidak valid:", data);
          setSliderImages([]);
        }
      } else {
        console.warn("Tidak ada data slider events");
        setSliderImages([]);
      }
    } catch (error) {
      console.error("Error fetching slider events:", error);
      setSliderImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch gambar untuk event yang dipilih
  const fetchEventImagesForSlider = async (eventIds) => {
    if (!eventIds || eventIds.length === 0) {
      setSliderImages([]);
      setLoading(false);
      return;
    }
    
    const allImages = [];
    const eventImagesDataMap = {};
    
    try {
      for (const eventId of eventIds.slice(0, 5)) { // Maksimal 5 event
        try {
          const response = await fetch(`http://localhost:8000/kelas/${eventId}/public`);
          
          if (response.ok) {
            const eventData = await response.json();
            
            // HANYA ambil foto utama, IGNORE gambaran_event
            const eventImages = [];
            
            // Tambahkan foto utama saja
            if (eventData.foto) {
              const mainImageUrl = eventData.foto_url || `http://localhost:8000/uploads/${eventData.foto}?t=${Date.now()}`;
              eventImages.push({
                id: `main-${eventId}`,
                url: mainImageUrl,
                type: 'main',
                description: eventData.nama_kelas,
                eventId: eventId,
                eventName: eventData.nama_kelas,
                eventData: {
                  id: eventData.id,
                  nama_kelas: eventData.nama_kelas,
                  kategori: eventData.kategori,
                  jadwal: eventData.jadwal,
                  ruangan: eventData.ruangan
                }
              });
            }
            
            // TIDAK mengambil gambaran_event sama sekali
            
            // Tambahkan ke data mapping
            eventImagesDataMap[eventId] = {
              eventData,
              images: eventImages,
              hasImages: eventImages.length > 0
            };
            
            // Tambahkan hanya gambar utama ke slider images
            allImages.push(...eventImages);
          }
        } catch (error) {
          console.error(`Error fetching images for event ${eventId}:`, error);
        }
      }
      
      setEventImagesData(eventImagesDataMap);
      
      // Preload images untuk mendapatkan dimensi
      const formattedImages = await Promise.all(
        allImages.map(async (image, index) => {
          const dimensions = await getImageDimensions(image.url);
          return {
            ...image,
            width: dimensions.width,
            height: dimensions.height,
            orientation: dimensions.isPortrait ? 'portrait' : 'landscape',
            sliderIndex: index
          };
        })
      );
      
      setSliderImages(formattedImages);
      
    } catch (error) {
      console.error('Error fetching event images:', error);
    }
  };

  // Fungsi untuk mendapatkan dimensi gambar
  const getImageDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const isPortrait = img.height > img.width * 1.1;
        resolve({
          width: img.width,
          height: img.height,
          isPortrait
        });
      };
      img.onerror = () => {
        resolve({
          width: 800,
          height: 600,
          isPortrait: false
        });
      };
      img.src = url;
    });
  };

  useEffect(() => {
    fetchSliderEvents();
  }, [fetchSliderEvents]);

  // Fungsi untuk handle klik pada gambar slider - NAVIGASI KE DETAIL EVENT
  const handleImageClick = (image) => {
    // Navigasi ke halaman detail event saat gambar diklik
    if (image.eventId) {
      navigate(`/events/${image.eventId}`);
    }
  };

  const handleThumbnailClick = (index) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  if (loading) {
    return (
      <div className="relative mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`text-2xl font-bold font-poppins-bold ${isDarkMode ? 'text-white' : 'text-[#646B5E]'}`}>
              Recap Event
            </h3>
            <p className={`${isDarkMode ? 'text-[#ABB89D]' : 'text-[#646B5E]/70'}`}>
              Memuat gambar event...
            </p>
          </div>
        </div>
        <div className={`h-96 rounded-2xl overflow-hidden flex items-center justify-center ${
          isDarkMode ? 'bg-[#2A3025]' : 'bg-gray-100'
        }`}>
          <div className="text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
              isDarkMode ? 'border-[#D7FE51]' : 'border-[#646B5E]'
            } mx-auto mb-4`}></div>
            <p className={isDarkMode ? 'text-[#ABB89D]' : 'text-gray-600'}>
              Memuat slider dan gambar event...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (sliderImages.length === 0) {
    return (
      <div className="relative mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`text-2xl font-bold font-poppins-bold ${isDarkMode ? 'text-white' : 'text-[#646B5E]'}`}>
              Recap Event
            </h3>
            <p className={`${isDarkMode ? 'text-[#ABB89D]' : 'text-[#646B5E]/70'}`}>
              Klik gambar untuk melihat detail event
            </p>
          </div>
        </div>

        <div className={`relative h-96 rounded-2xl overflow-hidden border-2 border-dashed ${
          isDarkMode ? 'border-[#363D30] bg-[#1A1F16]' : 'border-gray-300 bg-gray-50'
        } flex flex-col items-center justify-center text-center p-8`}>
          <ImageIcon size={64} className={`mb-4 ${isDarkMode ? 'text-[#363D30]' : 'text-gray-300'}`} />
          <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Belum Ada Event di Slider
          </h4>
          <p className={`mb-6 ${isDarkMode ? 'text-[#ABB89D]' : 'text-gray-500'}`}>
            Admin belum memilih event untuk ditampilkan di slider
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h3 className={`text-2xl font-bold font-poppins-bold ${isDarkMode ? 'text-white' : 'text-[#646B5E]'}`}>
              Recap Event
            </h3>
            <p className={`${isDarkMode ? 'text-[#ABB89D]' : 'text-[#646B5E]/70'}`}>
              Klik gambar untuk melihat detail event
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#ABB89D]/70' : 'text-[#646B5E]/50'}`}>
              {sliderImages.length} gambar dari {Object.keys(eventImagesData).length} event
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-[#363D30] text-[#D7FE51]' : 'bg-[#ABB89D]/20 text-[#646B5E]'}`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>
        </div>

        {/* Main Swiper - MODIFIKASI: Menambahkan loop: true untuk tombol navigasi tanpa batas */}
        <div className="relative h-64 sm:h-80 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={isPlaying ? { delay: 3000, disableOnInteraction: false } : false}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            // MODIFIKASI PENTING: Tambahkan loop: true agar tombol navigasi selalu bisa diklik
            loop={true}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            className="w-full h-full"
          >
            {sliderImages.map((image, index) => {
              const isPortrait = image.orientation === 'portrait';
              const eventInfo = eventImagesData[image.eventId];
              const eventName = eventInfo?.eventData?.nama_kelas || image.eventName;
              
              return (
                <SwiperSlide key={image.id} className="relative">
                  <div 
                    className="w-full h-full flex items-center justify-center cursor-pointer"
                    onClick={() => handleImageClick(image)}
                  >
                    <div className={`w-full h-full flex items-center justify-center ${
                      isPortrait 
                        ? (isDarkMode ? 'bg-[#2A3025]' : 'bg-gray-100') 
                        : ''
                    }`}>
                      <img
                        src={image.url}
                        alt={image.description}
                        className={`${
                          isPortrait 
                            ? 'max-h-full max-w-full object-contain' 
                            : 'w-full h-full object-cover'
                        }`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-image.png";
                        }}
                      />
                    </div>
                    
                    {/* Overlay gradient dan informasi */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
                      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                        <h4 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                          {eventName}
                        </h4>
                        <div className="flex items-center justify-between pointer-events-none">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>
                            {image.type === 'main' ? 'Foto Utama' : 'Gambaran Event'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? 'bg-black/50 text-white' : 'bg-white/20 text-white'
                          } pointer-events-none`}>
                            {index + 1}/{sliderImages.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Thumbnail preview */}
          {sliderImages.length > 1 && (
            <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 hidden sm:block ${
              isDarkMode ? 'bg-black/40' : 'bg-black/30'
            } backdrop-blur-sm rounded-lg p-2`}>
              <Swiper
                spaceBetween={8}
                slidesPerView={3}
                freeMode={true}
                watchSlidesProgress={true}
                className="thumbnail-swiper"
                breakpoints={{
                  640: { slidesPerView: 5 },
                  1024: { slidesPerView: 7 }
                }}
              >
                {sliderImages.map((image, index) => {
                  const isPortrait = image.orientation === 'portrait';
                  
                  return (
                    <SwiperSlide key={image.id} className="!w-12 !h-12 cursor-pointer">
                      <div 
                        className="relative w-full h-full rounded overflow-hidden"
                        onClick={() => handleThumbnailClick(index)}
                      >
                        <img
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          className={`w-full h-full ${
                            isPortrait ? 'object-contain' : 'object-cover'
                          }`}
                          style={{
                            backgroundColor: isPortrait 
                              ? (isDarkMode ? '#2A3025' : '#f0f0f0') 
                              : 'transparent'
                          }}
                        />
                        {/* Thumbnail number */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                          {index + 1}
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          )}

          {/* Slide counter */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm flex items-center gap-2">
            <ImageIcon size={16} />
            <span>{sliderImages.length} foto</span>
          </div>
          
          {/* Play/Pause indicator */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
            {isPlaying ? 'Otomatis' : 'Dijeda'}
          </div>
        </div>
      </div>
    </>
  );
};

// Komponen Card untuk Kelas (versi HomeUser) - MODIFIKASI: Tombol "Lihat selengkapnya" dihapus
const KelasCardHomeUser = ({ 
  kelas, 
  onDetailClick,
  onBeliClick,
  onImageClick,
  isDarkMode,
  tiketStatusMap
}) => {
  const [imageError, setImageError] = useState(false);

  // Fungsi untuk mendapatkan URL gambar yang aman
  const getImageUrl = () => {
    if (!kelas.foto) return "/default-image.png";
    
    if (kelas.foto.includes('?')) {
      return `http://localhost:8000/uploads/${kelas.foto}&t=${Date.now()}`;
    }
    return `http://localhost:8000/uploads/${kelas.foto}?t=${Date.now()}`;
  };

  // Format harga ke Rupiah
  const formatRupiah = (angka) => {
    if (!angka) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  // Fungsi untuk menentukan badge status
  const getStatusBadge = () => {
    const status = tiketStatusMap[kelas.id]?.status || 'unknown';
    
    if (status === 'available') {
      return {
        text: "Tersedia",
        icon: <CheckCircle size={10} />,
        color: isDarkMode ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-green-100 text-green-800 border-green-300",
        iconColor: isDarkMode ? "text-green-400" : "text-green-600"
      };
    } else if (status === 'sold_out') {
      return {
        text: "Habis",
        icon: <XCircle size={10} />,
        color: isDarkMode ? "bg-red-900/30 text-red-400 border-red-700/50" : "bg-red-100 text-red-800 border-red-300",
        iconColor: isDarkMode ? "text-red-400" : "text-red-600"
      };
    } else {
      return {
        text: "Loading...",
        icon: null,
        color: isDarkMode ? "bg-[#363D30] text-[#ABB89D] border-[#363D30]" : "bg-gray-100 text-gray-800 border-gray-300",
        iconColor: ""
      };
    }
  };

  const statusBadge = getStatusBadge();
  const tiketStatus = tiketStatusMap[kelas.id]?.status || 'unknown';

  return (
    <motion.div
      key={kelas.id}
      className={`rounded-lg shadow-md overflow-hidden flex-shrink-0 w-[calc(33.333%-0.833rem)] min-w-[320px] max-w-[400px] snap-center transition duration-300 hover:shadow-xl relative z-20 ${
        isDarkMode 
          ? "bg-[#2A3025] border border-[#363D30] hover:border-[#D7FE51]" 
          : "bg-[#F9F9F9] border border-[#ABB89D]/30 hover:border-[#646B5E]"
      }`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Badge Status di pojok kanan atas */}
      <div className="absolute top-3 left-3 z-30">
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border backdrop-blur-sm ${statusBadge.color}`}>
          {statusBadge.icon && <span className={statusBadge.iconColor}>{statusBadge.icon}</span>}
          <span>{statusBadge.text}</span>
        </div>
      </div>

      {/* Container flex untuk layout melebar */}
      <div className="flex h-[280px]">
        {/* Gambar Kelas - Lebar 40% dengan fixed height */}
        <div className="w-2/5 h-full relative overflow-hidden">
          <img
            src={getImageUrl()}
            alt={kelas.nama_kelas}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => onImageClick(getImageUrl(), kelas.nama_kelas)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-image.png";
              setImageError(true);
            }}
            style={{ 
              minHeight: '100%',
              maxHeight: '100%',
              objectFit: 'cover' 
            }}
          />
          
          {/* Zoom icon overlay */}
          <div className="absolute top-2 right-2 z-10">
            <div className={`p-1.5 rounded-full bg-black/60 text-white transition-opacity duration-300`}>
              <ZoomIn size={16} />
            </div>
          </div>
        </div>

        {/* Konten Card - Lebar 60% dengan flex-col */}
        <div className="w-3/5 p-4 flex flex-col">
          {/* Bagian atas: Informasi kelas */}
          <div className="flex-1">
            {/* Nama Kelas */}
            <h3 className={`text-base font-bold mb-4 line-clamp-2 transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-[#646B5E]"
            }`} title={kelas.nama_kelas}>
              {kelas.nama_kelas}
            </h3>

            {/* Detail Kelas Ringkas */}
            <div className="space-y-3 mb-3">
              {/* Harga Kelas */}
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? "bg-[#D7FE51]/20" : "bg-[#D7FE51]/30"
                }`}>
                  <DollarSign size={10} className={isDarkMode ? "text-[#D7FE51]" : "text-[#646B5E]"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold transition-colors duration-300 truncate ${
                    isDarkMode ? "text-[#D7FE51]" : "text-[#646B5E]"
                  }`}>
                    {formatRupiah(kelas.biaya)}
                  </p>
                  <p className={`text-[10px] transition-colors duration-300 ${
                    isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                  }`}>
                    Harga Tiket
                  </p>
                </div>
              </div>

              {/* Jadwal Kelas */}
              {kelas.jadwal && (
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isDarkMode ? "bg-[#D46B5E]/20" : "bg-[#D46B5E]/20"
                  }`}>
                    <Clock size={10} className={isDarkMode ? "text-[#D46B5E]" : "text-[#D46B5E]"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs transition-colors duration-300 line-clamp-2 ${
                      isDarkMode ? "text-[#D46B5E]" : "text-[#D46B5E]"
                    }`} title={kelas.jadwal}>
                      {kelas.jadwal}
                    </p>
                    <p className={`text-[10px] transition-colors duration-300 ${
                      isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                    }`}>
                      Waktu
                    </p>
                  </div>
                </div>
              )}

              {/* Ruangan Kelas */}
              {kelas.ruangan && (
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDarkMode ? "bg-[#ABB89D]/20" : "bg-[#ABB89D]/30"
                  }`}>
                    <MapPin size={10} className={isDarkMode ? "text-[#ABB89D]" : "text-[#ABB89D]" } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs transition-colors duration-300 truncate ${
                      isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"
                    }`} title={kelas.ruangan}>
                      {kelas.ruangan}
                    </p>
                    <p className={`text-[10px] transition-colors duration-300 ${
                      isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                    }`}>
                      Lokasi
                    </p>
                  </div>
                </div>
              )}

              {/* MODIFIKASI: TOMBOL "LIHAH SELENGKAPNYA" DIHAPUS */}
              {/* Tidak ada tombol "Lihat selengkapnya" di sini */}
            </div>

            {/* Total Peserta */}
            {kelas.total_peserta > 0 && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isDarkMode 
                  ? "bg-[#363D30] text-[#D7FE51]" 
                  : "bg-[#ABB89D]/20 text-[#646B5E]"
              }`}>
                <Users size={10} />
                <span>{kelas.total_peserta} peserta</span>
              </div>
            )}
          </div>

          {/* Bagian bawah: Tombol Aksi - DUA BUTTON (Detail dan Beli) */}
          <div className="flex gap-1.5 mt-auto pt-3 border-t border-gray-200 dark:border-[#363D30]/30">
            {/* Tombol Detail */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDetailClick(kelas.id)}
              className={`flex-1 py-1.5 text-[10px] rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-1 ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              }`}
              title="Lihat detail kelas"
            >
              <Calendar size={10} />
              <span className="truncate">Detail</span>
            </motion.button>

            {/* Tombol Beli - Navigasi langsung ke section tiket di DetailKelasUser.jsx */}
            <motion.button
              whileHover={{ scale: tiketStatus === 'available' ? 1.05 : 1 }}
              whileTap={{ scale: tiketStatus === 'available' ? 0.95 : 1 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (tiketStatus === 'available') {
                  onBeliClick(kelas.id);
                }
              }}
              disabled={tiketStatus !== 'available'}
              className={`flex-1 py-1.5 text-[10px] rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-1 ${
                tiketStatus === 'available'
                  ? isDarkMode 
                    ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                    : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
                  : isDarkMode
                  ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={tiketStatus === 'available' ? "Beli kelas ini" : "Tiket tidak tersedia"}
            >
              <ShoppingCart size={10} />
              <span className="truncate">
                {tiketStatus === 'available' ? 'Beli' : 'Habis'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ========== KOMPONEN PARTNER CARD YANG DITAMBAHKAN ==========
const PartnerCard = ({ partner, isDarkMode, index }) => {
  const renderIcon = (category) => {
    const iconProps = { size: 32, className: "mb-4" };
    
    const iconMap = {
      'sponsor': <Award {...iconProps} />,
      'media': <Globe {...iconProps} />,
      'community': <Users {...iconProps} />,
      'official': <Shield {...iconProps} />,
      'technical': <Activity {...iconProps} />
    };
    
    return iconMap[category] || <Handshake {...iconProps} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`rounded-2xl p-6 transition-all duration-300 border-2 ${
        isDarkMode 
          ? "bg-[#1A1F16]/60 border-[#363D30] hover:border-[#D7FE51] hover:shadow-lg hover:shadow-[#D7FE51]/20" 
          : "bg-white/20 border-white/30 hover:border-[#D7FE51] hover:shadow-lg hover:shadow-[#D7FE51]/30"
      } backdrop-blur-sm h-full flex flex-col`}
    >
      <div className="text-center flex flex-col h-full">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${
            isDarkMode 
              ? "bg-[#2A3025] text-[#D7FE51]" 
              : "bg-white/20 text-[#D7FE51]"
          }`}>
            {renderIcon(partner.category || 'official')}
          </div>
        </div>
        
        <h3 className={`text-xl font-bold mb-3 font-poppins-bold ${
          isDarkMode ? "text-white" : "text-white"
        }`}>
          {partner.name || partner.nama || "Partner"}
        </h3>
        
        <p className={`text-sm leading-relaxed mb-4 flex-grow ${
          isDarkMode ? "text-[#ABB89D]" : "text-white/80"
        }`}>
          {partner.description || partner.deskripsi || "Deskripsi partner"}
        </p>
        
        {/* Tampilkan kategori */}
        <div className="mt-auto pt-4 border-t border-[#D7FE51]/20">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            isDarkMode 
              ? "bg-[#363D30] text-[#D7FE51]" 
              : "bg-white/20 text-white"
          }`}>
            <span className="capitalize">{partner.category || 'official'}</span>
            <Check size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomeUser() {
  const navigate = useNavigate();
  const { themeClasses, isDarkMode } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState("Semua"); // Ubah default menjadi "Semua"
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [hoveredKategori, setHoveredKategori] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Tambahkan state untuk search

  // State untuk status tiket setiap kelas
  const [tiketStatusMap, setTiketStatusMap] = useState({});

  // State untuk data Tentang Kami dari API
  const [tentangKamiData, setTentangKamiData] = useState({
    hero_title: "GASTRONOMI RUN",
    hero_subtitle: "Where Running Meets Culinary Adventure",
    hero_description: "Gabungkan semangat olahraga dengan petualangan kuliner dalam kelas eksklusif.",
    statistik: [
      { number: "50+", label: "Event Sukses", icon: "Calendar" },
      { number: "25K+", label: "Peserta", icon: "Users" },
      { number: "15", label: "Kota di Indonesia", icon: "MapPin" },
      { number: "98%", label: "Kepuasan Peserta", icon: "Star" }
    ]
  });

  // State untuk data Layanan Kami dari API (ditambahkan)
  const [layananKamiData, setLayananKamiData] = useState({
    hero_title: "LAYANAN KAMI",
    hero_subtitle: "Solusi Lengkap untuk Pengalaman Lari Terbaik",
    hero_description: "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan."
  });

  // State untuk data Kontak Kami dari API (ditambahkan)
  const [kontakKamiData, setKontakKamiData] = useState({
    hero_title: "Hubungi Kami",
    hero_subtitle: "Kami Siap Membantu Anda",
    hero_description: "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda."
  });

  // ========== STATE BARU UNTUK DATA PARTNER ==========
  const [partnerData, setPartnerData] = useState({
    hero_title: "Partner & Sponsorship",
    hero_subtitle: "Berkolaborasi untuk Kesuksesan Bersama",
    partners: []
  });

  const [loadingPartner, setLoadingPartner] = useState(true);

  // State untuk data footer kontak dari API (ditambahkan seperti di TentangKami.jsx)
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

  // Refs untuk scroll horizontal
  const scrollRefs = useRef({});

  // === Enhanced Background Particles for Dark Mode ===
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Fungsi untuk inisialisasi particles
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
    for (let i = 0; i < 80; i++) { // Reduced for mobile performance
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1, // Smaller particles
        dx: (Math.random() - 0.5) * 0.3, // Slower movement
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.2, // Lower opacity
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.01
      });
    }
    
    particlesRef.current = particles;

    const animate = () => {
      if (!canvasRef.current || !particlesRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((p) => {
        const pulseFactor = Math.sin(p.pulse) * 0.1 + 0.9; // Reduced pulse
        p.pulse += p.pulseSpeed;
        
        ctx.save();
        ctx.globalAlpha = p.opacity * pulseFactor;
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        
        if (p.r > 1.5) {
          const gradient = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.r * 1.2
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
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

  // Effect untuk particles
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

  // Effect untuk handle visibility change
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

  // Fetch data kelas dari API
  useEffect(() => {
    const loadKelas = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const kelasData = await fetchKelasData(token);
        
        // Tambahkan foto_url untuk setiap kelas jika belum ada
        const kelasWithPhotoUrl = kelasData.map(kelas => {
          let foto_url = kelas.foto_url;
          
          if (!foto_url && kelas.foto) {
            foto_url = `http://localhost:8000/uploads/${kelas.foto}`;
          }
          
          return {
            ...kelas,
            foto_url: foto_url,
            kuota: kelas.kuota || 50
          };
        });
        
        setKelas(kelasWithPhotoUrl);
        
        // Ambil kategori unik dari data kelas - DENGAN "Semua"
        const kelasCategories = getCategoriesFromKelas(kelasData);
        
        // Set default ke "Semua"
        setSelectedCategory("Semua");
        
        setCategories(kelasCategories);
        
        // Fetch status tiket untuk setiap kelas
        fetchTiketStatusForKelas(kelasWithPhotoUrl);
        
      } catch (error) {
        console.error("Error loading kelas:", error);
        // Hanya set array kosong jika API error
        setKelas([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadKelas();
  }, []);

  // Fetch data Tentang Kami dari API public
  useEffect(() => {
    fetchTentangKamiData();
    fetchLayananKamiData(); // Tambahkan fetch data Layanan Kami
    fetchKontakKamiData(); // Tambahkan fetch data Kontak Kami
    fetchPartnerData(); // Panggil fungsi untuk mengambil data partner
    fetchFooterKontakData(); // Panggil fungsi untuk fetch data footer
  }, []);

  // Fetch status tiket untuk semua kelas
  const fetchTiketStatusForKelas = async (kelasData) => {
    const statusMap = {};
    
    try {
      for (const kelasItem of kelasData) {
        try {
          const res = await fetch(`http://localhost:8000/kelas/${kelasItem.id}/tiket-kategori`);
          
          if (res.ok) {
            const tiketData = await res.json();
            const hasTiketKategori = tiketData && tiketData.length > 0;
            const activeTiket = tiketData.filter(tiket => 
              tiket.is_active === undefined ? true : tiket.is_active
            );
            const allTiketActive = activeTiket.length > 0;
            
            let status = 'unknown';
            if (!hasTiketKategori) {
              status = 'sold_out';
            } else if (allTiketActive) {
              status = 'available';
            } else {
              status = 'sold_out';
            }
            
            statusMap[kelasItem.id] = {
              hasTiketKategori,
              allTiketActive,
              status
            };
          } else {
            statusMap[kelasItem.id] = {
              hasTiketKategori: false,
              allTiketActive: false,
              status: 'unknown'
            };
          }
        } catch (error) {
          console.error(`Error fetching tiket status for kelas ${kelasItem.id}:`, error);
          statusMap[kelasItem.id] = {
            hasTiketKategori: false,
            allTiketActive: false,
            status: 'unknown'
          };
        }
      }
      
      setTiketStatusMap(statusMap);
    } catch (error) {
      console.error("Error fetching tiket status:", error);
    }
  };

  const fetchTentangKamiData = async () => {
    try {
      const res = await fetch("http://localhost:8000/tentang-kami/public");
      
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setTentangKamiData({
            hero_title: data.hero_title || "GASTRONOMI RUN",
            hero_subtitle: data.hero_subtitle || "Where Running Meets Culinary Adventure",
            hero_description: data.hero_description || "Gabungkan semangat olahraga dengan petualangan kuliner dalam kelas eksklusif.",
            statistik: data.statistik || [
              { number: "50+", label: "Event Sukses", icon: "Calendar" },
              { number: "25K+", label: "Peserta", icon: "Users" },
              { number: "15", label: "Kota di Indonesia", icon: "MapPin" },
              { number: "98%", label: "Kepuasan Peserta", icon: "Star" }
            ]
          });
        }
      } else {
        console.warn("Gagal mengambil data Tentang Kami, menggunakan data default");
      }
    } catch (error) {
      console.error("Error fetching Tentang Kami data:", error);
    }
  };

  // Fetch data Layanan Kami dari API public (ditambahkan)
  const fetchLayananKamiData = async () => {
    try {
      const res = await fetch("http://localhost:8000/layanan/public");
      
      if (res.ok) {
        const data = await res.json();
        console.log("Data layanan kami received:", data);
        
        if (data && Object.keys(data).length > 0) {
          setLayananKamiData({
            hero_title: data.hero_title || "LAYANAN KAMI",
            hero_subtitle: data.hero_subtitle || "Solusi Lengkap untuk Pengalaman Lari Terbaik",
            hero_description: data.hero_description || "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan."
          });
        }
      } else {
        console.warn("Gagal mengambil data Layanan Kami, menggunakan data default");
        // Gunakan data default
        setLayananKamiData({
          hero_title: "LAYANAN KAMI",
          hero_subtitle: "Solusi Lengkap untuk Pengalaman Lari Terbaik",
          hero_description: "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan."
        });
      }
    } catch (error) {
      console.error("Error fetching Layanan Kami data:", error);
      // Gunakan data default jika error
      setLayananKamiData({
        hero_title: "LAYANAN KAMI",
        hero_subtitle: "Solusi Lengkap untuk Pengalaman Lari Terbaik",
        hero_description: "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan."
      });
    }
  };

  // Fetch data Kontak Kami dari API public (ditambahkan)
  const fetchKontakKamiData = async () => {
    try {
      const res = await fetch("http://localhost:8000/kontak/public");
      
      if (res.ok) {
        const data = await res.json();
        console.log("Data kontak kami received:", data);
        
        if (data && Object.keys(data).length > 0) {
          setKontakKamiData({
            hero_title: data.hero_title || "Hubungi Kami",
            hero_subtitle: data.hero_subtitle || "Kami Siap Membantu Anda",
            hero_description: data.hero_description || "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda."
          });
        }
      } else {
        console.warn("Gagal mengambil data Kontak Kami, menggunakan data default");
        // Gunakan data default
        setKontakKamiData({
          hero_title: "Hubungi Kami",
          hero_subtitle: "Kami Siap Membantu Anda",
          hero_description: "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda."
        });
      }
    } catch (error) {
      console.error("Error fetching Kontak Kami data:", error);
      // Gunakan data default jika error
      setKontakKamiData({
        hero_title: "Hubungi Kami",
        hero_subtitle: "Kami Siap Membantu Anda",
        hero_description: "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda."
      });
    }
  };

  // ========== FETCH DATA PARTNER DARI API ==========
  const fetchPartnerData = async () => {
    try {
      setLoadingPartner(true);
      const res = await fetch("http://localhost:8000/partner/public");
      
      if (res.ok) {
        const data = await res.json();
        console.log("Data partner dari API:", data);
        
        if (data && Object.keys(data).length > 0) {
          setPartnerData({
            hero_title: data.hero_title || "Partner & Sponsorship",
            hero_subtitle: data.hero_subtitle || "Berkolaborasi untuk Kesuksesan Bersama",
            partners: data.partners || []
          });
        } else {
          // Default data jika kosong
          setPartnerData({
            hero_title: "Partner & Sponsorship",
            hero_subtitle: "Berkolaborasi untuk Kesuksesan Bersama",
            partners: [
              {
                name: "S.SWOORK",
                description: "Partner resmi dalam menyelenggarakan event lari berkualitas dengan standar internasional.",
                category: "official",
                logo: "",
                website: "https://s-swoork.com"
              },
              {
                name: "Sports Nutrition",
                description: "Penyedia nutrisi olahraga terkemuka untuk mendukung performa atlet dan pelari.",
                category: "sponsor",
                logo: "",
                website: "https://example.com"
              },
              {
                name: "Running Community",
                description: "Komunitas pelari terbesar di Indonesia yang mendukung setiap event lari kami.",
                category: "community",
                logo: "",
                website: "https://example.com"
              }
            ]
          });
        }
      } else {
        console.warn("Gagal mengambil data Partner, menggunakan data default");
        setPartnerData({
          hero_title: "Partner & Sponsorship",
          hero_subtitle: "Berkolaborasi untuk Kesuksesan Bersama",
          partners: [
            {
              name: "S.SWOORK",
              description: "Partner resmi dalam menyelenggarakan event lari berkualitas dengan standar internasional.",
              category: "official",
              logo: "",
              website: "https://s-swoork.com"
            }
          ]
        });
      }
    } catch (error) {
      console.error("Error fetching Partner data:", error);
      // Gunakan data default jika error
      setPartnerData({
        hero_title: "Partner & Sponsorship",
        hero_subtitle: "Berkolaborasi untuk Kesuksesan Bersama",
        partners: [
          {
            name: "S.SWOORK",
            description: "Partner resmi dalam menyelenggarakan event lari berkualitas dengan standar internasional.",
            category: "official",
            logo: "",
            website: "https://s-swoork.com"
          }
        ]
      });
    } finally {
      setLoadingPartner(false);
    }
  };

  // Fetch data footer kontak dari endpoint public (sama seperti di TentangKami.jsx)
  const fetchFooterKontakData = async () => {
    try {
      const res = await fetch("http://localhost:8000/footer-kontak/public");
      
      if (res.ok) {
        const data = await res.json();
        console.log("Data footer kontak received:", data);
        
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
        console.warn("Gagal mengambil data footer kontak, menggunakan data default");
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
      console.error("Error fetching footer kontak data:", error);
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
    }
  };

  // Format harga ke Rupiah
  const formatRupiah = (angka) => {
    if (!angka) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  // Fungsi untuk mendapatkan URL gambar yang aman dengan timestamp
  const getImageUrl = (kelasItem) => {
    if (kelasItem.foto_url) {
      return `${kelasItem.foto_url}?t=${Date.now()}`;
    }
    
    if (kelasItem.foto) {
      return `http://localhost:8000/uploads/${kelasItem.foto}?t=${Date.now()}`;
    }
    
    return null;
  };

  // Fungsi untuk handle klik tombol Detail
  const handleDetailClick = (id) => {
    navigate(`/events/${id}`);
  };

  // FUNGSI MODIFIKASI: Handle klik tombol Beli - Navigasi ke DetailKelasUser dengan scroll ke section tiket
  const handleBeliClick = (id) => {
    console.log("Tombol Beli diklik untuk kelas ID:", id);
    
    // Cari data kelas berdasarkan ID - GANTI NAMA VARIABLE DARI 'kelas' MENJADI 'kelasItem'
    const kelasItem = kelas.find(k => k.id === id);
    
    if (kelasItem) {
      // Navigasi ke DetailKelasUser dengan state untuk scroll ke section tiket
      navigate(`/events/${id}`, {
        state: { 
          scrollToTiket: true,
          kelas: kelasItem
        }
      });
    } else {
      // Jika kelas tidak ditemukan, navigasi normal
      navigate(`/events/${id}`);
    }
  };

  // Fungsi scroll horizontal - DISESUAIKAN dengan KelasListUser.jsx
  const scroll = (direction, category) => {
    const container = scrollRefs.current[category];
    if (container) {
      const scrollAmount = direction === "left" ? -350 : 350;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Filter kelas berdasarkan search term
  const filterKelasBySearch = (kelasList) => {
    if (!searchTerm.trim()) return kelasList;
    
    return kelasList.filter(kelasItem => 
      kelasItem.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (kelasItem.deskripsi && kelasItem.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Kelompokkan kelas berdasarkan kategori - DENGAN OPSI "Semua"
  const groupKelasByCategory = () => {
    if (selectedCategory === "Semua") {
      // Jika "Semua" dipilih, kelompokkan berdasarkan semua kategori yang ada
      const grouped = {};
      
      categories.forEach(category => {
        if (category !== "Semua") {
          const filteredKelas = kelas.filter(kelasItem => kelasItem.kategori === category);
          if (filteredKelas.length > 0) {
            grouped[category] = filterKelasBySearch(filteredKelas);
          }
        }
      });
      
      return grouped;
    } else {
      // Jika kategori spesifik dipilih
      const filteredKelas = kelas.filter(kelasItem => kelasItem.kategori === selectedCategory);
      return {
        [selectedCategory]: filterKelasBySearch(filteredKelas)
      };
    }
  };

  // Render icon berdasarkan nama
  const renderIcon = (iconName, size = 32) => {
    const iconProps = { size };
    switch(iconName) {
      case 'Calendar': return <Calendar {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'MapPin': return <MapPin {...iconProps} />;
      case 'Star': return <Star {...iconProps} />;
      case 'Handshake': return <Handshake {...iconProps} />;
      case 'Award': return <Award {...iconProps} />;
      default: return <Calendar {...iconProps} />;
    }
  };

  const kelasByCategory = groupKelasByCategory();
  const totalKelasTampil = Object.values(kelasByCategory).reduce((total, list) => total + list.length, 0);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-[#D7FE51]" : "border-[#646B5E]"
          } mx-auto mb-4`}></div>
          <p className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}>
            Memuat kelas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Enhanced Background Particles untuk Dark Mode */}
      {isDarkMode && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Section 1: Welcome Page - RESPONSIVE */}
      <section
        className={`min-h-screen flex items-center justify-center px-4 sm:px-6 transition-colors duration-300 relative overflow-hidden ${
          isDarkMode 
            ? "bg-gradient-to-b from-[#1A1F16] via-[#2A3025] to-[#1A1F16]" 
            : "bg-gradient-to-b from-[#646B5E] via-[#ABB89D] to-[#646B5E]"
        }`}
      >
        {/* Overlay */}
        <div className="absolute inset-0 z-0">
          {isDarkMode && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1F16]/80 via-[#2A3025]/60 to-[#1A1F16]/80"></div>
          )}
        </div>
        
        <motion.div
          className="text-center max-w-4xl relative z-10 px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Logo - Responsif */}
          <motion.div
            className="flex justify-center mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="/Logo GRun.png" 
              alt="Gastronomi Run Logo" 
              className="h-20 sm:h-28 md:h-32 lg:h-40 w-auto max-w-[80%] sm:max-w-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/logo-gastronomi-run.png";
                e.target.onError = (e2) => {
                  e2.target.style.display = 'none';
                };
              }}
            />
          </motion.div>
          {/* Heading GASTRONOMI RUN dengan font baru */}
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight font-poppins-bold ${
            isDarkMode ? "text-white" : "text-white"
          }`}>
            {/* Kontainer untuk Presented By dan logo S.SWOORK */}
            <div className="flex flex-col mt-2 mb-4">
              {/* Presenter section - Presented By dan logo dalam satu baris */}
              <div className="flex items-center justify-center">
                <span className={`text-lg sm:text-xl md:text-1xl lg:text-2xl font-normal ${isDarkMode ? "text-white" : "text-white"}`}>
                  Presented By
                </span>
                <span className="ml-3 flex items-center" style={{ height: '1.9em' }}>
                  <img 
                    src="/sswork.png" 
                    alt="S.SWOORK Logo" 
                    className="h-full w-auto object-contain"
                    style={{
                      height: '1.6em',
                      filter: isDarkMode ? 'none' : 'brightness(0) invert(1)'
                    }}
                  />
                </span>
              </div>
            </div>
          </h1>

          <p className={`text-base sm:text-lg md:text-xl mb-6 sm:mb-8 md:mb-10 leading-relaxed ${
            isDarkMode ? "text-[#ABB89D]" : "text-white/90"
          }`}>
            Gabungkan semangat olahraga dengan petualangan kuliner dalam kelas eksklusif.
            Tingkatkan kemampuan lari dan pengetahuan kuliner Anda dengan instruktur profesional.
          </p>

          {/* Button dengan font baru */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/events")}
            className={`font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-lg shadow-lg transition duration-300 relative z-20 text-base sm:text-lg font-poppins-bold ${
              isDarkMode 
                ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
            }`}
            style={{ letterSpacing: '0.5px' }}
          >
            <EmojiEventsIcon className="mr-2" style={{ 
              fontSize: '1rem',
              color: isDarkMode ? '#1A1F16' : '#646B5E'
            }} />
            Lihat Semua Event
          </motion.button>
        </motion.div>
      </section>

      {/* Section 3: Ringkasan Kelas dengan Horizontal Scroll - DISESUAIKAN dengan KelasListUser.jsx */}
      <section className={`py-12 sm:py-16 md:py-20 px-4 sm:px-6 transition-colors duration-300 ${
        isDarkMode ? "bg-[#1A1F16]" : "bg-[#F9F9F9]"
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Header dengan Dropdown - Heading Event Terbaru dengan font baru */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-10 md:mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <EmojiEventsIcon style={{ 
                  fontSize: '1.5rem',
                  color: isDarkMode ? '#D7FE51' : '#646B5E'
                }} />
                <h2 className={`text-2xl sm:text-3xl font-bold font-poppins-bold ${
                  isDarkMode ? "text-white" : "text-[#646B5E]"
                }`}>
                  Event Terbaru
                </h2>
              </div>
              <p className={`text-sm sm:text-base ${
                isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
              }`}>
                Pilih kategori event yang ingin Anda ikuti
              </p>
            </div>
            
            {/* Container untuk Search dan Dropdown */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
              {/* Input Search - diambil dari KelasListUser.jsx */}
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari event..."
                  className={`pl-10 pr-4 py-2 sm:py-3 rounded-lg border focus:outline-none transition-colors duration-300 w-full ${
                    isDarkMode 
                      ? "bg-[#2A3025] border-[#363D30] text-white placeholder-[#ABB89D] focus:ring-2 focus:ring-[#D7FE51] focus:border-[#D7FE51]" 
                      : "bg-white border-[#ABB89D] text-[#646B5E] placeholder-[#646B5E]/70 focus:ring-2 focus:ring-[#D7FE51] focus:border-[#D7FE51]"
                  }`}
                />
                <Search 
                  size={18} 
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                  }`} 
                />
              </div>
              
              {/* Dropdown Kategori - DENGAN OPSI "Semua" */}
              <div className="relative w-full sm:w-48">
                {categories.length > 0 ? (
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`appearance-none w-full px-4 py-2 sm:py-3 pr-10 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 font-medium text-sm sm:text-base ${
                        isDarkMode
                          ? "bg-[#2A3025] border-[#363D30] text-white focus:ring-[#D7FE51] focus:border-[#D7FE51]"
                          : "bg-white border-[#ABB89D] text-[#646B5E] focus:ring-[#D7FE51] focus:border-[#D7FE51]"
                      }`}
                    >
                      {/* OPSI "Semua" ditambahkan di sini */}
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${
                      isDarkMode ? "text-[#D7FE51]" : "text-[#646B5E]"
                    }`}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                ) : (
                  <div className={`px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? "bg-[#2A3025] border-[#363D30] text-[#ABB89D]"
                      : "bg-white border-[#ABB89D] text-[#646B5E]/70"
                  }`}>
                    Tidak ada kategori
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info hasil pencarian */}
          {searchTerm && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
              isDarkMode ? "bg-[#2A3025] border border-[#363D30]" : "bg-white border border-[#ABB89D]/30"
            }`}>
              <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}`}>
                Menampilkan hasil untuk: <span className="font-semibold">"{searchTerm}"</span>
                {totalKelasTampil > 0 ? ` (${totalKelasTampil} event ditemukan)` : " (tidak ditemukan)"}
              </p>
            </div>
          )}

          {/* List Kelas per Kategori dengan Horizontal Scroll */}
          {Object.keys(kelasByCategory).length === 0 ? (
            <div className={`text-center py-8 sm:py-12 rounded-xl ${
              isDarkMode ? "bg-[#2A3025] border border-[#363D30]" : "bg-white border border-[#ABB89D]/30"
            }`}>
              <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"}`}>
                {searchTerm 
                  ? `Tidak ada event yang cocok dengan pencarian "${searchTerm}"` 
                  : "Tidak ada event dalam kategori ini."}
              </p>
            </div>
          ) : (
            Object.entries(kelasByCategory).map(([category, kelasList]) => (
              <div 
                key={category}
                className="mb-10 relative"
                onMouseEnter={() => setHoveredKategori(category)}
                onMouseLeave={() => setHoveredKategori(null)}
              >
                {/* ====== Header kategori ====== */}
                <div className="flex items-center gap-3 mb-3 relative">
                  <h2 className={`text-lg font-semibold capitalize transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-[#646B5E]"
                  }`}>
                    {category}
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
                    isDarkMode 
                      ? "bg-[#363D30] text-[#D7FE51]" 
                      : "bg-[#ABB89D]/20 text-[#646B5E]"
                  }`}>
                    {kelasList.length} event
                  </span>
                </div>

                {/* ====== List kelas per kategori ====== */}
                {kelasList.length === 0 ? (
                  <p className={`italic ml-8 transition-colors duration-300 ${
                    isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                  }`}>
                    Event kosong
                  </p>
                ) : (
                  <>
                    {hoveredKategori === category && (
                      <button
                        onClick={() => scroll("left", category)}
                        className={`absolute -left-12 top-1/2 transform -translate-y-1/2 z-30 hover:scale-110 transition-transform ${
                          isDarkMode ? "text-[#D7FE51]" : "text-[#D46B5E]"
                        }`}
                      >
                        <ChevronLeft size={40} strokeWidth={2} />
                      </button>
                    )}

                    {/* Container untuk card dengan 3 per baris */}
                    <div
                      ref={(el) => (scrollRefs.current[category] = el)}
                      className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth relative z-20"
                    >
                      {kelasList.map((kelas) => (
                        <KelasCardHomeUser
                          key={kelas.id}
                          kelas={kelas}
                          onDetailClick={handleDetailClick}
                          onBeliClick={handleBeliClick}
                          onImageClick={(url, alt) => {
                            // Handle image click jika perlu
                            console.log("Image clicked:", url, alt);
                          }}
                          isDarkMode={isDarkMode}
                          tiketStatusMap={tiketStatusMap}
                        />
                      ))}
                    </div>

                    {hoveredKategori === category && (
                      <button
                        onClick={() => scroll("right", category)}
                        className={`absolute -right-12 top-1/2 transform -translate-y-1/2 z-30 hover:scale-110 transition-transform ${
                          isDarkMode ? "text-[#D7FE51]" : "text-[#D46B5E]"
                        }`}
                      >
                        <ChevronRight size={40} strokeWidth={2} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Section 4: Tentang Kami Highlight (Menggunakan data dari API) - RESPONSIVE */}
      <section 
        className={`relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 transition-colors duration-300 overflow-hidden ${
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
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-white leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {tentangKamiData.hero_title}
              <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal mt-2 sm:mt-4">
                {tentangKamiData.hero_subtitle}
              </span>
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "150px" }}
              transition={{ duration: 1, delay: 0.8 }}
              className={`h-1 mx-auto mb-6 sm:mb-8 rounded-full bg-[#D7FE51]`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-sm sm:text-base lg:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed"
            >
              {tentangKamiData.hero_description}
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 md:mt-16 max-w-3xl mx-auto"
          >
            {/* Statistik dari API */}
            {tentangKamiData.statistik && tentangKamiData.statistik.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -3 }}
                className={`p-4 sm:p-6 rounded-xl backdrop-blur-sm border text-center ${
                  isDarkMode 
                    ? "bg-[#1A1F16]/90 backdrop-blur-sm border-[#363D30]/50" 
                    : "bg-white/20 border-white/30"
                }`}
              >
                <div className="flex justify-center items-center gap-2 mb-2">
                  <div className="text-[#D7FE51]">
                    {renderIcon(stat.icon, 16)}
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                </div>
                <div className="text-xs sm:text-sm text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tombol Pelajari Selengkapnya */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-8 sm:mt-12 md:mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/tentang-kami")}
              className={`inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold transition-colors duration-300 text-base sm:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                  : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <span>Pelajari Selengkapnya...</span>
              <ArrowRight size={18} />
            </motion.button>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/70">
              Temukan lebih banyak tentang visi, misi, dan nilai-nilai kami
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Layanan Kami Highlight (Memanggil data dari API LayananKamiAdmin) - RESPONSIVE */}
      <section 
        className={`relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 transition-colors duration-300 overflow-hidden ${
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
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-white leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {layananKamiData.hero_title}
              <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal mt-2 sm:mt-4">
                {layananKamiData.hero_subtitle}
              </span>
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "150px" }}
              transition={{ duration: 1, delay: 0.8 }}
              className={`h-1 mx-auto mb-6 sm:mb-8 rounded-full bg-[#D7FE51]`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-sm sm:text-base lg:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed"
            >
              {layananKamiData.hero_description}
            </motion.p>
          </motion.div>

          {/* Tombol Layanan Kami */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-8 sm:mt-12 md:mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/layanan")}
              className={`inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold transition-colors duration-300 text-base sm:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                  : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <span>Jelajahi Layanan Kami</span>
              <ArrowRight size={18} />
            </motion.button>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/70">
              Temukan berbagai layanan kami yang dirancang untuk kebutuhan Anda
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== SECTION BARU: HIGHLIGHT PARTNER (DARI API PARTNER) - RESPONSIVE ========== */}
      <section 
        className={`relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 transition-colors duration-300 overflow-hidden ${
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
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-white leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {partnerData.hero_title || "Partner & Sponsorship"}
              <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal mt-2 sm:mt-4">
                {partnerData.hero_subtitle || "Berkolaborasi untuk Kesuksesan Bersama"}
              </span>
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "150px" }}
              transition={{ duration: 1, delay: 0.8 }}
              className={`h-1 mx-auto mb-6 sm:mb-8 rounded-full bg-[#D7FE51]`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-sm sm:text-base lg:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8"
            >
              Bergabunglah dengan jaringan partner dan sponsor kami untuk menciptakan pengalaman event yang lebih baik bersama.
            </motion.p>
          </motion.div>

          {/* Tombol Partner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-8 sm:mt-12 md:mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/partner")}
              className={`inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold transition-colors duration-300 text-base sm:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                  : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <Handshake size={18} />
              <span>Lihat Partner Kami</span>
              <ArrowRight size={18} />
            </motion.button>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/70">
              Temukan berbagai partner dan sponsor yang mendukung kesuksesan event kami
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 6: Kontak Kami Highlight (Memanggil data dari API KontakAdmin) - RESPONSIVE */}
      <section 
        className={`relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 transition-colors duration-300 overflow-hidden ${
          isDarkMode 
            ? "bg-gradient-to-br from-[#1A1F16] via-[#2A3025] to-[#1A1F16]" 
            : "bg-gradient-to-br from-[#646B5E] via-[#ABB89D] to-[#646B5E]"
        }`}
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 sm:mb-8"
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-white leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {kontakKamiData.hero_title}
              <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal mt-2 sm:mt-4">
                {kontakKamiData.hero_subtitle}
              </span>
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "150px" }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-1 mx-auto mb-6 sm:mb-8 rounded-full bg-[#D7FE51]`}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-sm sm:text-base lg:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            {kontakKamiData.hero_description}
          </motion.p>

          {/* Tombol Hubungi Kami */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-8 sm:mt-12 md:mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/kontak")}
              className={`inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold transition-colors duration-300 text-base sm:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                  : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <span>Hubungi Kami Sekarang</span>
              <ArrowRight size={18} />
            </motion.button>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/70">
              Dapatkan informasi lebih lanjut tentang event dan kolaborasi
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer Section - RESPONSIVE */}
      <footer className={`pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 border-t transition-colors duration-300 w-full ${
        isDarkMode ? "bg-[#0A0E0B]/90 backdrop-blur-sm border-[#1A1F16]" : "bg-white border-gray-200"
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div>
              <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Kontak Kami
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                  <span className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                    {footerKontakData.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                  <span className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                    {footerKontakData.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon size={18} className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"} />
                  <span className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                    {footerKontakData.address}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Ikuti Kami
              </h3>
              <div className="flex gap-3 sm:gap-4">
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
                      {platform === 'facebook' && <Facebook size={18} />}
                      {platform === 'instagram' && <Instagram size={18} />}
                      {platform === 'twitter' && <Twitter size={18} />}
                      {platform === 'youtube' && <Youtube size={18} />}
                    </a>
                  )
                ))}
              </div>
            </div>
            
            <div>
              <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                Tautan Cepat
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate("/events")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Lihat Event
                </button>
                <button 
                  onClick={() => navigate("/tentang-kami")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Tentang Kami
                </button>
                <button 
                  onClick={() => navigate("/layanan")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Layanan
                </button>
                <button 
                  onClick={() => navigate("/partner")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Partner
                </button>
                <button 
                  onClick={() => navigate("/kontak")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Kontak
                </button>
              </div>
            </div>
          </div>
          
          <div className={`pt-6 sm:pt-8 border-t text-center ${
            isDarkMode ? "border-[#1A1F16]" : "border-gray-200"
          }`}>
            <div className="mb-3 sm:mb-4">
              <h4 className={`text-xl sm:text-2xl font-black mb-2 ${
                isDarkMode ? "text-white" : "text-[#646B5E]"
              }`}>
                GASTRONOMI RUN
              </h4>
              <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                Where Running Meets Culinary Adventure
              </p>
            </div>
            
            <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
              {footerKontakData.description}
            </p>
            
            <div className={`flex flex-col md:flex-row justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6 ${
              isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
            }`}>
              <span className="text-xs sm:text-sm">{footerKontakData.copyright}</span>
              <span className="hidden md:inline">|</span>
              <a 
                href="https://store.gastronomirun.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#D7FE51] transition-colors text-xs sm:text-sm"
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

      {/* CSS untuk hide scrollbar dan font classes */}
      <style>{`
        /* Import font Poppins secara lokal jika perlu */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
        
        /* Import Swiper CSS tambahan */
        @import url('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css');
        
        /* Class untuk font Poppins Bold */
        .font-poppins-bold {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }
        
        /* Scrollbar hide untuk semua browser */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Untuk line clamp */
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* CSS khusus untuk SwiperJS */
        .swiper {
          width: 100%;
          height: 100%;
        }
        
        .swiper-slide {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Custom styles untuk navigation buttons */
        .swiper-button-next,
        .swiper-button-prev {
          color: #D7FE51;
          background: rgba(0, 0, 0, 0.5);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 16px;
          font-weight: bold;
        }
        
        .swiper-button-next {
          right: 5px;
        }
        
        .swiper-button-prev {
          left: 5px;
        }
        
        /* Responsive navigation buttons */
        @media (min-width: 640px) {
          .swiper-button-next,
          .swiper-button-prev {
            width: 40px;
            height: 40px;
          }
          
          .swiper-button-next:after,
          .swiper-button-prev:after {
            font-size: 20px;
          }
          
          .swiper-button-next {
            right: 10px;
          }
          
          .swiper-button-prev {
            left: 10px;
          }
        }
        
        /* Pagination styles */
        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: white;
          opacity: 0.5;
        }
        
        .swiper-pagination-bullet-active {
          background: #D7FE51;
          opacity: 1;
        }
        
        /* Thumbnail swiper styles */
        .thumbnail-swiper .swiper-slide {
          opacity: 0.4;
          transition: opacity 0.3s;
        }
        
        .thumbnail-swiper .swiper-slide-thumb-active {
          opacity: 1;
        }
        
        /* Lightbox modal styles */
        .swiper-zoom-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Portrait mode image handling */
        .portrait-image {
          max-height: 80vh;
          width: auto;
          object-fit: contain;
        }
        
        .landscape-image {
          max-width: 100%;
          height: auto;
          object-fit: contain;
        }
        
        /* Responsive text sizes */
        @media (max-width: 640px) {
          .text-6xl {
            font-size: 2.5rem;
          }
          
          .text-5xl {
            font-size: 2rem;
          }
          
          .text-4xl {
            font-size: 1.75rem;
          }
          
          .text-3xl {
            font-size: 1.5rem;
          }
          
          .text-2xl {
            font-size: 1.25rem;
          }
        }
        
        /* Custom styling untuk card 3 per baris - DISESUAIKAN dengan KelasListUser.jsx */
        @media (min-width: 1024px) {
          .flex.gap-5.overflow-x-auto > .w-\[calc\(33\.333\%-0\.833rem\)\] {
            flex: 0 0 calc(33.333% - 1.25rem);
          }
        }
        
        @media (max-width: 1023px) and (min-width: 640px) {
          .flex.gap-5.overflow-x-auto > .w-\[calc\(33\.333\%-0\.833rem\)\] {
            flex: 0 0 calc(50% - 1.25rem);
          }
        }
        
        @media (max-width: 639px) {
          .flex.gap-5.overflow-x-auto > .w-\[calc\(33\.333\%-0\.833rem\)\] {
            flex: 0 0 100%;
            min-width: 320px;
          }
        }
        
        button span.truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
          max-width: 100%;
          min-width: 0;
        }
      `}</style>
    </div>
  );
}
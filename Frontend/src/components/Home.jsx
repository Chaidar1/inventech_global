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
  Edit,
  Trash2,
  Plus,
  Search,
  FolderPlus,
  MoreVertical,
  X,
  Crop,
  Maximize2,
  RotateCw,
  Pause,
  Play,
  Upload,
  Save,
  Image as ImageIcon,
  ChevronLeft as LeftIcon,
  ChevronRight as RightIcon,
  CheckCircle,
  Shield,
  Target,
  Award,
  Zap,
  Heart,
  MessageSquare,
  Headphones,
  HelpCircle,
  Settings,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Activity,
  Utensils,
  Trophy,
  Globe,
  Briefcase,
  Handshake,
  XCircle // <-- DITAMBAHKAN: Import XCircle untuk badge "Habis"
} from "lucide-react";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

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

const MySwal = withReactContent(Swal);

// Import Google Fonts untuk Poppins
import "@fontsource/poppins/700.css";

// Komponen Modal Lightbox dengan SwiperJS
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
        className="absolute top-4 sm:top-6 right-4 sm:right-6 z-[10000] p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-[10000] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/50 text-white text-xs sm:text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Controls info */}
      <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-[10000] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/50 text-white text-xs hidden sm:block">
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
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 px-2 py-1 rounded bg-black/60 text-white text-xs">
                        Portrait
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Deskripsi gambar */}
                {image.description && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-black/70 text-white max-w-xs sm:max-w-lg text-center text-sm">
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
                  <SwiperSlide key={image.id || index} className="!w-12 sm:!w-16 !h-12 sm:!h-16 cursor-pointer">
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
        <div className="absolute bottom-16 sm:bottom-20 right-4 sm:right-6 z-[10000] flex gap-2">
          <button
            onClick={() => setZoomEnabled(!zoomEnabled)}
            className={`p-2 sm:p-3 rounded-full ${
              zoomEnabled 
                ? 'bg-[#D7FE51] text-black' 
                : 'bg-black/50 text-white hover:bg-black/70'
            } transition-colors`}
            title="Toggle Zoom (Z)"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setShowThumbs(!showThumbs)}
            className={`p-2 sm:p-3 rounded-full ${
              showThumbs 
                ? 'bg-[#D7FE51] text-black' 
                : 'bg-black/50 text-white hover:bg-black/70'
            } transition-colors`}
            title="Toggle Thumbnails (T)"
          >
            <ImageIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Komponen Modal untuk Mengelola Slider Event dengan Integrasi Gambar Event
const ManageEventSliderModal = ({ 
  isOpen, 
  onClose, 
  isDarkMode,
  events,
  selectedEvents,
  onUpdateSelectedEvents,
  onFetchEventImages,
  isSaving = false
}) => {
  const [selectedForSlider, setSelectedForSlider] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingEvents, setLoadingEvents] = useState({});
  const [eventImages, setEventImages] = useState({});
  const [fetchingImages, setFetchingImages] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedForSlider(selectedEvents || []);
    }
  }, [isOpen, selectedEvents]);

  // Fungsi untuk mengambil gambar event dari API
  const fetchEventImages = useCallback(async (eventId) => {
    if (!eventId || eventImages[eventId]) return;
    
    setFetchingImages(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/kelas/${eventId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.ok) {
        const eventData = await response.json();
        
        // Simpan semua gambar event: foto utama + gambaran_event
        const images = [];
        
        // Tambahkan foto utama jika ada
        if (eventData.foto) {
          const mainImageUrl = eventData.foto_url || `http://localhost:8000/uploads/${eventData.foto}?t=${Date.now()}`;
          images.push({
            id: `main-${eventId}`,
            url: mainImageUrl,
            type: 'main',
            description: `${eventData.nama_kelas} - Foto Utama`
          });
        }
        
        // Tambahkan gambaran_event jika ada
        if (eventData.gambaran_event_urls && Array.isArray(eventData.gambaran_event_urls)) {
          eventData.gambaran_event_urls.forEach((url, index) => {
            images.push({
              id: `gambaran-${eventId}-${index}`,
              url: url,
              type: 'gambaran_event',
              description: `${eventData.nama_kelas} - Gambaran Event ${index + 1}`
            });
          });
        }
        
        setEventImages(prev => ({
          ...prev,
          [eventId]: {
            eventData,
            images,
            hasImages: images.length > 0
          }
        }));
      }
    } catch (error) {
      console.error(`Error fetching images for event ${eventId}:`, error);
    } finally {
      setFetchingImages(false);
    }
  }, [eventImages]);

  // Fetch gambar untuk semua event yang memiliki foto
  useEffect(() => {
    if (isOpen && events) {
      const eventsWithPhotos = events.filter(event => event.foto);
      eventsWithPhotos.forEach(event => {
        fetchEventImages(event.id);
      });
    }
  }, [isOpen, events, fetchEventImages]);

  const handleToggleEvent = (eventId) => {
    setSelectedForSlider(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const handleSelectAll = () => {
    const eventsWithPhotos = events.filter(event => event.foto);
    const eventIds = eventsWithPhotos.map(event => event.id);
    setSelectedForSlider(eventIds);
  };

  const handleDeselectAll = () => {
    setSelectedForSlider([]);
  };

  const handleSave = () => {
    if (onUpdateSelectedEvents) {
      onUpdateSelectedEvents(selectedForSlider);
    }
  };

  // Filter events yang memiliki foto
  const eventsWithPhotos = events.filter(event => event.foto);
  
  // Filter berdasarkan search term
  const filteredEvents = eventsWithPhotos.filter(event => 
    event.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.kategori && event.kategori.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${isDarkMode ? 'bg-black/90' : 'bg-black/80'}`}>
      <div className={`relative rounded-xl overflow-hidden shadow-2xl w-full max-w-6xl max-h-[90vh] ${isDarkMode ? 'bg-[#2A3025]' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-[#363D30]' : 'border-gray-200'}`}>
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-[#646B5E]'}`}>
              Kelola Event untuk Slider
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ABB89D]' : 'text-gray-500'}`}>
              Pilih event yang akan ditampilkan di slider (Maksimal 5 event)
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className={`p-2 rounded-full hover:bg-opacity-20 transition-colors ${isDarkMode ? 'hover:bg-white text-white' : 'hover:bg-black text-gray-600'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari event..."
                className={`w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border focus:outline-none transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-[#1A1F16] border-[#363D30] text-white placeholder-[#ABB89D] focus:ring-2 focus:ring-[#D7FE51] focus:border-[#D7FE51]" 
                    : "bg-white border-gray-300 text-[#646B5E] placeholder-gray-400 focus:ring-2 focus:ring-[#D7FE51] focus:border-[#D7FE51]"
                }`}
              />
              <Search 
                size={20} 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? "text-[#ABB89D]" : "text-gray-400"
                }`} 
              />
            </div>
          </div>

          {/* Selected Count and Actions */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 p-3 rounded-lg gap-2 sm:gap-0 ${
            isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-[#D7FE51]' : 'text-[#646B5E]'}`}>
                {selectedForSlider.length} event dipilih
              </span>
              {selectedForSlider.length > 5 && (
                <span className={`ml-2 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  (Maksimal 5 event untuk hasil terbaik)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                disabled={isSaving}
                className={`px-3 py-1.5 rounded text-sm font-medium ${isDarkMode ? 'bg-[#363D30] text-[#D7FE51]' : 'bg-gray-200 text-gray-700'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Pilih Semua
              </button>
              <button
                onClick={handleDeselectAll}
                disabled={isSaving}
                className={`px-3 py-1.5 rounded text-sm font-medium ${isDarkMode ? 'bg-[#363D30] text-[#D7FE51]' : 'bg-gray-200 text-gray-700'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Hapus Semua
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.length === 0 ? (
              <div className={`col-span-full text-center py-8 rounded-lg ${
                isDarkMode ? 'bg-[#1A1F16] border border-[#363D30]' : 'bg-gray-50 border border-gray-200'
              }`}>
                <ImageIcon size={48} className={`mx-auto mb-3 ${isDarkMode ? 'text-[#363D30]' : 'text-gray-300'}`} />
                <p className={isDarkMode ? 'text-[#ABB89D]' : 'text-gray-500'}>
                  {searchTerm ? 'Tidak ada event yang cocok dengan pencarian' : 'Belum ada event dengan foto'}
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const isSelected = selectedForSlider.includes(event.id);
                const eventImageData = eventImages[event.id];
                const hasMultipleImages = eventImageData?.images && eventImageData.images.length > 1;
                
                // Ambil foto utama atau default
                const getImageUrl = () => {
                  if (eventImageData?.images && eventImageData.images.length > 0) {
                    return eventImageData.images[0].url;
                  }
                  return event.foto ? `http://localhost:8000/uploads/${event.foto}?t=${Date.now()}` : null;
                };
                
                const imageUrl = getImageUrl();
                
                return (
                  <div
                    key={event.id}
                    className={`rounded-lg overflow-hidden border cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? (isDarkMode ? 'border-[#D7FE51] ring-2 ring-[#D7FE51]/30' : 'border-[#D7FE51] ring-2 ring-[#D7FE51]/30')
                        : (isDarkMode ? 'border-[#363D30] hover:border-[#ABB89D]' : 'border-gray-200 hover:border-gray-400')
                    } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={() => !isSaving && handleToggleEvent(event.id)}
                  >
                    {/* Image Container */}
                    <div className="h-40 sm:h-48 relative overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={event.nama_kelas}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-image.png";
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          isDarkMode ? 'bg-[#1A1F16]' : 'bg-gray-100'
                        }`}>
                          <ImageIcon size={48} className={isDarkMode ? 'text-[#363D30]' : 'text-gray-300'} />
                        </div>
                      )}
                      
                      {/* Selection Indicator */}
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected 
                          ? (isDarkMode ? 'bg-[#D7FE51] text-[#1A1F16]' : 'bg-[#D7FE51] text-white')
                          : (isDarkMode ? 'bg-[#363D30] text-[#ABB89D]' : 'bg-gray-200 text-gray-500')
                      }`}>
                        {isSelected ? <Check size={14} /> : <Plus size={14} />}
                      </div>
                      
                      {/* Order Number if selected */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center text-sm font-bold">
                          {selectedForSlider.indexOf(event.id) + 1}
                        </div>
                      )}
                      
                      {/* Gambaran Event Indicator */}
                      {hasMultipleImages && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <ImageIcon size={12} />
                          <span>{eventImageData.images.length} foto</span>
                        </div>
                      )}
                      
                      {/* Loading Indicator */}
                      {fetchingImages && !eventImageData && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${
                            isDarkMode ? 'border-[#D7FE51]' : 'border-white'
                          }`}></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Event Info */}
                    <div className={`p-3 sm:p-4 ${isDarkMode ? 'bg-[#1A1F16]' : 'bg-white'}`}>
                      <h4 className={`font-medium mb-1 truncate text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {event.nama_kelas}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isDarkMode ? 'text-[#ABB89D]' : 'text-gray-500'}`}>
                          {event.kategori || 'Tanpa kategori'}
                        </span>
                        <div className="flex items-center gap-2">
                          {hasMultipleImages && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDarkMode ? 'bg-[#363D30] text-[#D7FE51]' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {eventImageData.images.length} foto
                            </span>
                          )}
                          {isSelected ? (
                            <Eye size={14} className={isDarkMode ? 'text-[#D7FE51]' : 'text-[#646B5E]'} />
                          ) : (
                            <EyeOff size={14} className={isDarkMode ? 'text-[#ABB89D]' : 'text-gray-400'} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Instructions */}
          <div className={`mt-6 p-3 rounded-lg text-sm ${
            isDarkMode ? 'bg-[#1A1F16] text-[#ABB89D] border border-[#363D30]' : 'bg-gray-50 text-gray-600 border border-gray-200'
          }`}>
            <p className="font-medium mb-1">Petunjuk:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Pilih event dengan foto untuk ditampilkan di slider</li>
              <li>Maksimal 5 event untuk hasil tampilan terbaik</li>
              <li>Urutan ditentukan berdasarkan urutan pemilihan (drag and drop tidak tersedia)</li>
              <li>Untuk mengubah urutan, hapus dan pilih ulang event sesuai urutan yang diinginkan</li>
              <li>Sistem akan mengambil semua gambar event (foto utama dan gambaran event) untuk slider</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-[#363D30]' : 'border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-[#D7FE51]' : 'bg-[#646B5E]'}`}></div>
              <span className={`text-sm ${isDarkMode ? 'text-[#ABB89D]' : 'text-gray-500'}`}>
                {eventsWithPhotos.length} event tersedia dengan foto
              </span>
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <button
                onClick={onClose}
                disabled={isSaving}
                className={`px-4 py-2 rounded font-medium ${isDarkMode ? 'bg-[#363D30] text-[#ABB89D]' : 'bg-gray-200 text-gray-700'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={selectedForSlider.length === 0 || isSaving}
                className={`px-4 py-2 rounded font-medium flex items-center gap-2 ${isDarkMode ? 'bg-[#D7FE51] text-[#1A1F16]' : 'bg-[#646B5E] text-white'} ${selectedForSlider.length === 0 || isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  `Simpan (${selectedForSlider.length})`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen Slider untuk Menampilkan Foto Event dengan Integrasi Gambar Event
// MODIFIKASI: Tombol navigasi akan selalu bisa diklik dengan loop: true
const EventSlider = ({ 
  isDarkMode, 
  events, 
  selectedEventIds,
  onOpenManageModal,
  isLoading = false,
  navigate // DITAMBAHKAN: navigate prop
}) => {
  const [sliderImages, setSliderImages] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventImagesData, setEventImagesData] = useState({});
  const swiperRef = useRef(null);

  // Fetch semua gambar untuk event yang dipilih
const fetchAllEventImages = useCallback(async () => {
  if (!events || !selectedEventIds || selectedEventIds.length === 0) {
    setSliderImages([]);
    setLoading(false);
    return;
  }
  
  setLoading(true);
  
  const selectedEvents = events
    .filter(event => selectedEventIds.includes(event.id) && event.foto) // Hanya event dengan foto
    .slice(0, 5); // Maksimal 5 event
  
  const allImages = [];
  const eventImagesDataMap = {};
  
  try {
    const token = localStorage.getItem("token");
    
    for (const event of selectedEvents) {
      try {
        const response = await fetch(`http://localhost:8000/kelas/${event.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (response.ok) {
          const eventData = await response.json();
          
          // HANYA ambil foto utama, IGNORE gambaran_event
          const eventImages = [];
          
          // Tambahkan foto utama saja
          if (eventData.foto) {
            const mainImageUrl = eventData.foto_url || `http://localhost:8000/uploads/${eventData.foto}?t=${Date.now()}`;
            eventImages.push({
              id: `main-${event.id}`,
              url: mainImageUrl,
              type: 'main',
              description: eventData.nama_kelas,
              eventId: event.id,
              eventName: eventData.nama_kelas,
              eventData: { // Simpan data event yang diperlukan
                id: eventData.id, // DITAMBAHKAN: ID event untuk navigasi
                nama_kelas: eventData.nama_kelas,
                kategori: eventData.kategori,
                jadwal: eventData.jadwal,
                ruangan: eventData.ruangan
              }
            });
          }
          
          // TIDAK mengambil gambaran_event sama sekali
          
          // Tambahkan ke data mapping
          eventImagesDataMap[event.id] = {
            eventData,
            images: eventImages,
            hasImages: eventImages.length > 0
          };
          
          // Tambahkan hanya gambar utama ke slider images
          allImages.push(...eventImages);
        }
      } catch (error) {
        console.error(`Error fetching images for event ${event.id}:`, error);
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
  } finally {
    setLoading(false);
  }
}, [events, selectedEventIds]);

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
    fetchAllEventImages();
  }, [fetchAllEventImages]);

  // Fungsi untuk handle klik pada gambar slider - DIMODIFIKASI
  const handleImageClick = (image) => {
    // Navigasi ke halaman detail event saat gambar diklik
    if (image.eventId) {
      navigate(`/admin/events/${image.eventId}`);
    }
  };

  const handleThumbnailClick = (index) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="relative mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h3 className={`text-xl sm:text-2xl font-bold font-poppins-bold ${isDarkMode ? 'text-white' : 'text-[#646B5E]'}`}>
              Recap Event
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ABB89D]' : 'text-[#646B5E]/70'}`}>
              Memuat gambar event...
            </p>
          </div>
        </div>
        <div className={`h-64 sm:h-80 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center ${
          isDarkMode ? 'bg-[#2A3025]' : 'bg-gray-100'
        }`}>
          <div className="text-center">
            <div className={`animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 ${
              isDarkMode ? 'border-[#D7FE51]' : 'border-[#646B5E]'
            } mx-auto mb-3 sm:mb-4`}></div>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-[#ABB89D]' : 'text-gray-600'}`}>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h3 className={`text-xl sm:text-2xl font-bold font-poppins-bold ${isDarkMode ? 'text-white' : 'text-[#646B5E]'}`}>
              Recap Event
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ABB89D]' : 'text-[#646B5E]/70'}`}>
              Pilih event untuk ditampilkan di slider
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenManageModal}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                isDarkMode 
                  ? 'bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]' 
                  : 'bg-[#646B5E] text-white hover:bg-[#ABB89D]'
              }`}
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Kelola Slider</span>
              <span className="sm:hidden">Kelola</span>
            </button>
          </div>
        </div>

        <div className={`relative h-64 sm:h-80 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-dashed ${
          isDarkMode ? 'border-[#363D30] bg-[#1A1F16]' : 'border-gray-300 bg-gray-50'
        } flex flex-col items-center justify-center text-center p-6 sm:p-8`}>
          <ImageIcon size={48} className={`mb-3 sm:mb-4 ${isDarkMode ? 'text-[#363D30]' : 'text-gray-300'}`} />
          <h4 className={`text-lg sm:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Belum Ada Event di Slider
          </h4>
          <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isDarkMode ? 'text-[#ABB89D]' : 'text-gray-500'}`}>
            Pilih event dengan foto untuk ditampilkan di slider
          </p>
          <button
            onClick={onOpenManageModal}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
              isDarkMode ? 'bg-[#D7FE51] text-[#1A1F16]' : 'bg-[#646B5E] text-white'
            }`}
          >
            <Settings size={18} />
            Pilih Event untuk Slider
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h3 className={`text-xl sm:text-2xl font-bold font-poppins-bold ${isDarkMode ? 'text-white' : 'text-[#646B5E]'}`}>
              Recap Event
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ABB89D]' : 'text-[#646B5E]/70'}`}>
              Klik gambar untuk melihat detail event
            </p> {/* DIMODIFIKASI: Text diubah */}
            <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-[#ABB89D]/70' : 'text-[#646B5E]/50'}`}>
              {sliderImages.length} gambar dari {selectedEventIds.length} event
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenManageModal}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base ${
                isDarkMode 
                  ? 'bg-[#363D30] text-[#D7FE51] hover:bg-[#2A3025]' 
                  : 'bg-[#646B5E] text-white hover:bg-[#ABB89D]'
              }`}
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Kelola Slider</span>
              <span className="sm:hidden">Kelola</span>
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-[#363D30] text-[#D7FE51]' : 'bg-[#ABB89D]/20 text-[#646B5E]'}`}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
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
                  {/* DIMODIFIKASI: Hapus div wrapper dan tambahkan onClick langsung pada container */}
                  <div 
                    className="w-full h-full flex items-center justify-center cursor-pointer"
                    onClick={() => handleImageClick(image)} // DIMODIFIKASI: Panggil fungsi handleImageClick dengan image sebagai parameter
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
                        <h4 className={`text-base sm:text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                          {eventName}
                        </h4>
                        <div className="flex items-center justify-between pointer-events-none">
                          <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>
                            {image.type === 'main' ? 'Foto Utama' : 'Gambaran Event'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? 'bg-black/50 text-white' : 'bg-white/20 text-white'
                          } pointer-events-none`}>
                            {index + 1}/{sliderImages.length}
                          </span>
                        </div>
                      </div>
                      
                      {/* DIMODIFIKASI: Hapus Zoom button */}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Thumbnail preview */}
          {sliderImages.length > 1 && (
            <div className={`absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 hidden sm:block ${
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
          <div className="absolute top-4 right-4 px-2 sm:px-3 py-1 rounded-full bg-black/50 text-white text-xs sm:text-sm flex items-center gap-2">
            <ImageIcon size={14} />
            <span>{sliderImages.length} foto</span>
          </div>
          
          {/* Play/Pause indicator */}
          <div className="absolute top-4 left-4 px-2 sm:px-3 py-1 rounded-full bg-black/50 text-white text-xs sm:text-sm">
            {isPlaying ? 'Otomatis' : 'Dijeda'}
          </div>
        </div>
      </div>

      {/* DIMODIFIKASI: Hapus Lightbox Modal karena tidak dibutuhkan lagi */}
    </>
  );
};

// Komponen Card untuk Event (Admin Version) - MODIFIKASI: Badge dipindah ke kiri dan status tiket ditambahkan
const EventCard = ({ 
  event, 
  onDetailClick, 
  onEditClick, 
  onDeleteClick,
  onImageClick,
  isDarkMode 
}) => {
  const [imageError, setImageError] = useState(false);
  // ========== STATE BARU UNTUK STATUS TIKET ==========
  const [tiketStatus, setTiketStatus] = useState({
    hasTiketKategori: false,
    allTiketActive: false,
    status: 'unknown' // 'available', 'sold_out', 'unknown'
  });

  const getImageUrl = () => {
    if (!event.foto) return "/default-image.png";
    
    if (event.foto.includes('?')) {
      return `http://localhost:8000/uploads/${event.foto}&t=${Date.now()}`;
    }
    return `http://localhost:8000/uploads/${event.foto}?t=${Date.now()}`;
  };

  const formatRupiah = (angka) => {
    if (!angka) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  // ========== FETCH STATUS TIKET ==========
  useEffect(() => {
    const fetchTiketStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/kelas/${event.id}/tiket-kategori`);
        
        if (res.ok) {
          const tiketData = await res.json();
          
          // Cek apakah ada tiket kategori
          const hasTiketKategori = tiketData && tiketData.length > 0;
          
          // Cek apakah semua tiket aktif
          const activeTiket = tiketData.filter(tiket => 
            tiket.is_active === undefined ? true : tiket.is_active
          );
          const allTiketActive = activeTiket.length > 0;
          
          // Tentukan status
          let status = 'unknown';
          if (!hasTiketKategori) {
            status = 'sold_out'; // Tidak ada tiket kategori sama sekali
          } else if (allTiketActive) {
            status = 'available'; // Ada tiket aktif
          } else {
            status = 'sold_out'; // Ada tiket tapi semua nonaktif
          }
          
          setTiketStatus({
            hasTiketKategori,
            allTiketActive,
            status
          });
        } else {
          setTiketStatus({
            hasTiketKategori: false,
            allTiketActive: false,
            status: 'unknown'
          });
        }
      } catch (error) {
        console.error("Error fetching tiket status:", error);
        setTiketStatus({
          hasTiketKategori: false,
          allTiketActive: false,
          status: 'unknown'
        });
      }
    };

    fetchTiketStatus();
  }, [event.id]);

  // ========== FUNGSI UNTUK MENENTUKAN BADGE STATUS ==========
  const getStatusBadge = () => {
    if (tiketStatus.status === 'available') {
      return {
        text: "Tersedia",
        icon: <CheckCircle size={10} />,
        color: isDarkMode ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-green-100 text-green-800 border-green-300",
        iconColor: isDarkMode ? "text-green-400" : "text-green-600"
      };
    } else if (tiketStatus.status === 'sold_out') {
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

  return (
    <motion.div
      key={event.id}
      className={`rounded-lg shadow-md overflow-hidden flex-shrink-0 w-full sm:w-[calc(50%-0.625rem)] md:w-[calc(33.333%-0.833rem)] min-w-[280px] sm:min-w-[320px] max-w-[400px] snap-center transition duration-300 hover:shadow-xl relative z-20 ${
        isDarkMode 
          ? "bg-[#2A3025] border border-[#363D30] hover:border-[#D7FE51]" 
          : "bg-white border border-[#ABB89D]/30 hover:border-[#646B5E]"
      }`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* ========== BADGE STATUS DI POJOK KIRI ATAS (DIMODIFIKASI) ========== */}
      <div className="absolute top-3 left-3 z-30">
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border backdrop-blur-sm ${statusBadge.color}`}>
          {statusBadge.icon && <span className={statusBadge.iconColor}>{statusBadge.icon}</span>}
          <span>{statusBadge.text}</span>
        </div>
      </div>

      <div className="flex h-[250px] sm:h-[280px]">
        <div className="w-2/5 h-full relative overflow-hidden">
          <img
            src={getImageUrl()}
            alt={event.nama_kelas}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => onImageClick(getImageUrl(), event.nama_kelas)}
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
          
          <div className="absolute top-2 right-2 z-10">
            <div className={`p-1.5 rounded-full bg-black/60 text-white transition-opacity duration-300`}>
              <ZoomIn size={14} />
            </div>
          </div>
        </div>

        <div className="w-3/5 p-3 sm:p-4 flex flex-col">
          <div className="flex-1">
            <h3 className={`text-sm sm:text-base font-bold mb-3 sm:mb-4 line-clamp-2 transition-colors duration-300 font-poppins-bold ${
              isDarkMode ? "text-white" : "text-[#646B5E]"
            }`} title={event.nama_kelas}>
              {event.nama_kelas}
            </h3>

            <div className="space-y-2 sm:space-y-3 mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? "bg-[#D7FE51]/20" : "bg-[#D7FE51]/30"
                }`}>
                  <DollarSign size={8} className={isDarkMode ? "text-[#D7FE51]" : "text-[#646B5E]"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold transition-colors duration-300 truncate ${
                    isDarkMode ? "text-[#D7FE51]" : "text-[#646B5E]"
                  }`}>
                    {formatRupiah(event.biaya)}
                  </p>
                  <p className={`text-[10px] transition-colors duration-300 ${
                    isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                  }`}>
                    Biaya Event
                  </p>
                </div>
              </div>

              {event.jadwal && (
                <div className="flex items-start gap-2">
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isDarkMode ? "bg-[#D46B5E]/20" : "bg-[#D46B5E]/20"
                  }`}>
                    <Calendar size={8} className={isDarkMode ? "text-[#D46B5E]" : "text-[#D46B5E]"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs transition-colors duration-300 line-clamp-2 ${
                      isDarkMode ? "text-[#D46B5E]" : "text-[#D46B5E]"
                    }`} title={event.jadwal}>
                      {event.jadwal}
                    </p>
                    <p className={`text-[10px] transition-colors duration-300 ${
                      isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
                    }`}>
                      Jadwal
                    </p>
                  </div>
                </div>
              )}

              {event.ruangan && (
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDarkMode ? "bg-[#ABB89D]/20" : "bg-[#ABB89D]/30"
                  }`}>
                    <MapPin size={8} className={isDarkMode ? "text-[#ABB89D]" : "text-[#ABB89D]" } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs transition-colors duration-300 truncate ${
                      isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"
                    }`} title={event.ruangan}>
                      {event.ruangan}
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

            {event.total_peserta > 0 && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isDarkMode 
                  ? "bg-[#363D30] text-[#D7FE51]" 
                  : "bg-[#ABB89D]/20 text-[#646B5E]"
              }`}>
                <Users size={10} />
                <span>{event.total_peserta} peserta</span>
              </div>
            )}
          </div>

          {/* TOMBOL AKSI ADMIN: Detail, Edit, Hapus */}
          <div className="flex gap-1.5 mt-auto pt-3 border-t border-gray-200 dark:border-[#363D30]/30">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDetailClick(event.id)}
              className={`flex-1 py-1.5 text-[10px] rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-1 ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              }`}
              title="Lihat detail event"
            >
              <Calendar size={10} />
              <span className="truncate">Detail</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEditClick(event.id, event)}
              className={`flex-1 py-1.5 text-[10px] rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-1 ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              }`}
              title="Edit event"
            >
              <Edit size={10} />
              <span className="truncate">Edit</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDeleteClick(event.id, event.nama_kelas, event.kategori)}
              className={`flex-1 py-1.5 text-[10px] rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-1 ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              }`}
              title="Hapus event"
            >
              <Trash2 size={10} />
              <span className="truncate">Hapus</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ========== KOMONEN LAYANAN KAMI CARD YANG DIMODIFIKASI ==========
// Komponen LayananKamiCard untuk Section 5 dengan data dari API
const LayananKamiCard = ({ layanan, isDarkMode, index }) => {
  // Fungsi untuk merender icon berdasarkan nama
  const renderIcon = (iconName) => {
    const iconProps = { size: 48, className: "mb-4" };
    
    // Daftar icon yang didukung
    const iconMap = {
      'Activity': <Activity {...iconProps} />,
      'Utensils': <Utensils {...iconProps} />,
      'Trophy': <Trophy {...iconProps} />,
      'Users': <Users {...iconProps} />,
      'Heart': <Heart {...iconProps} />,
      'Shield': <Shield {...iconProps} />,
      'Globe': <Globe {...iconProps} />,
      'Award': <Award {...iconProps} />,
      'Star': <Star {...iconProps} />,
      'CheckCircle': <CheckCircle {...iconProps} />,
      'Target': <Target {...iconProps} />,
      'Zap': <Zap {...iconProps} />,
      'Briefcase': <Briefcase {...iconProps} />,
      'MessageSquare': <MessageSquare {...iconProps} />
    };
    
    // Default ke CheckCircle jika icon tidak ditemukan
    return iconMap[iconName] || <CheckCircle {...iconProps} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`rounded-2xl p-4 sm:p-6 transition-all duration-300 border-2 ${
        isDarkMode 
          ? "bg-[#1A1F16]/60 border-[#363D30] hover:border-[#D7FE51] hover:shadow-lg hover:shadow-[#D7FE51]/20" 
          : "bg-white/20 border-white/30 hover:border-[#D7FE51] hover:shadow-lg hover:shadow-[#D7FE51]/30"
      } backdrop-blur-sm h-full flex flex-col`}
    >
      <div className="text-center flex flex-col h-full">
        <div className="flex justify-center mb-4">
          <div className={`p-2 sm:p-3 rounded-full ${
            isDarkMode 
              ? "bg-[#2A3025] text-[#D7FE51]" 
              : "bg-white/20 text-[#D7FE51]"
          }`}>
            {renderIcon(layanan.icon || 'CheckCircle')}
          </div>
        </div>
        
        <h3 className={`text-lg sm:text-xl font-bold mb-3 font-poppins-bold ${
          isDarkMode ? "text-white" : "text-white"
        }`}>
          {layanan.title || layanan.judul || layanan.nama_layanan || "Layanan"}
        </h3>
        
        <p className={`text-sm leading-relaxed mb-4 flex-grow ${
          isDarkMode ? "text-[#ABB89D]" : "text-white/80"
        }`}>
          {layanan.description || layanan.deskripsi || layanan.keterangan || "Deskripsi layanan"}
        </p>
        
        {/* Tampilkan features jika ada */}
        {layanan.features && layanan.features.length > 0 && (
          <div className="mt-auto pt-4 border-t border-[#D7FE51]/20">
            <ul className="space-y-2">
              {layanan.features.slice(0, 3).map((fitur, idx) => (
                <li key={idx} className={`flex items-center gap-2 text-xs sm:text-sm ${
                  isDarkMode ? "text-[#ABB89D]" : "text-white/90"
                }`}>
                  <CheckCircle size={14} className="text-[#D7FE51] flex-shrink-0" />
                  <span className="text-left">{fitur}</span>
                </li>
              ))}
              {layanan.features.length > 3 && (
                <li className={`text-xs ${isDarkMode ? "text-[#ABB89D]/70" : "text-white/70"}`}>
                  +{layanan.features.length - 3} fitur lainnya
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ========== KOMPONEN TARGET AUDIENCE CARD ==========
const TargetAudienceCard = ({ audience, isDarkMode, index }) => {
  const renderIcon = (iconName) => {
    const iconProps = { size: 32, className: "mb-4" };
    
    const iconMap = {
      'Users': <Users {...iconProps} />,
      'Award': <Award {...iconProps} />,
      'Trophy': <Trophy {...iconProps} />,
      'Star': <Star {...iconProps} />,
      'Heart': <Heart {...iconProps} />,
      'Shield': <Shield {...iconProps} />,
      'Globe': <Globe {...iconProps} />,
      'Activity': <Activity {...iconProps} />,
      'CheckCircle': <CheckCircle {...iconProps} />,
      'Briefcase': <Briefcase {...iconProps} />
    };
    
    return iconMap[iconName] || <Users {...iconProps} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={`rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
        isDarkMode 
          ? index === 0 
            ? "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border-2 border-[#D7FE51]/30"
            : "bg-gradient-to-br from-[#1A1F16]/90 to-[#0A0E0B]/90 backdrop-blur-sm border-2 border-[#ABB89D]/30"
          : index === 0 
            ? "bg-gradient-to-br from-white to-gray-50 border-2 border-[#D7FE51]/30"
            : "bg-gradient-to-br from-white to-gray-50 border-2 border-[#ABB89D]/30"
      }`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 ${
        index === 0 
          ? (isDarkMode ? "bg-[#D7FE51]/20 text-[#D7FE51]" : "bg-[#D7FE51]/20 text-[#D7FE51]")
          : (isDarkMode ? "bg-[#ABB89D]/20 text-[#ABB89D]" : "bg-[#ABB89D]/20 text-[#646B5E]")
      }`}>
        {renderIcon(audience.icon)}
      </div>
      
      <h3 className={`text-lg sm:text-xl font-bold mb-3 ${
        index === 0 
          ? (isDarkMode ? "text-[#D7FE51]" : "text-[#646B5E]")
          : (isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]")
      }`}>
        {audience.title}
      </h3>
      
      <p className={`text-sm leading-relaxed mb-4 ${
        isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
      }`}>
        {audience.description}
      </p>
      
      {audience.features && audience.features.length > 0 && (
        <div className="space-y-2">
          {audience.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                index === 0 ? (isDarkMode ? "bg-[#D7FE51]" : "bg-[#D7FE51]") : (isDarkMode ? "bg-[#ABB89D]" : "bg-[#ABB89D]")
              }`}></div>
              <span className={`text-xs sm:text-sm ${isDarkMode ? "text-[#ABB89D]" : "text-gray-600"}`}>
                {feature}
              </span>
            </div>
          ))}
          {audience.features.length > 3 && (
            <div className={`text-xs ${isDarkMode ? "text-[#ABB89D]/70" : "text-gray-500"}`}>
              +{audience.features.length - 3} kelebihan lainnya
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const { themeClasses, isDarkMode } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [hoveredKategori, setHoveredKategori] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState("Semua");
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingSlider, setIsSavingSlider] = useState(false);
  
  // State untuk event yang dipilih untuk slider
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const [sliderLoading, setSliderLoading] = useState(false);
  
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
  
  // ========== STATE BARU UNTUK DATA LAYANAN KAMI ==========
  const [layananData, setLayananData] = useState({
    hero_title: "LAYANAN KAMI",
    hero_subtitle: "Solusi Lengkap untuk Pengalaman Lari Terbaik",
    hero_description: "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan.",
    services: [],
    target_audience: []
  });

  const [loadingLayanan, setLoadingLayanan] = useState(true);

  // State untuk data Kontak Kami dari API
  const [kontakKamiData, setKontakKamiData] = useState({
    hero_title: "Hubungi Kami",
    hero_subtitle: "Kami Siap Membantu Anda",
    hero_description: "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda."
  });
  
  // State untuk data footer kontak dari API (DITAMBAHKAN)
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

  // State untuk data Partner dari API
  const [partnerData, setPartnerData] = useState({
    hero_title: "Partner & Sponsorship",
    hero_subtitle: "Berkolaborasi untuk Kesuksesan Bersama",
    partners: []
  });
  
  // State untuk Lightbox Modal dengan SwiperJS
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Refs untuk scroll horizontal
  const scrollRefs = useRef({});
  const menuRefs = useRef({});

  // === Enhanced Background Particles for Dark Mode ===
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

  // Fungsi untuk mendapatkan kategori dari data event
  const getCategoriesFromEvents = (eventsData) => {
    const categories = [...new Set(eventsData
      .map(event => event.kategori)
      .filter(Boolean)
    )];
    return categories;
  };

  // Fetch data event slider dari database
  const fetchSliderEvents = useCallback(async () => {
    try {
      setSliderLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/slider-events", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.selected_events)) {
          setSelectedEventIds(data.selected_events);
        }
      }
    } catch (error) {
      console.error("Error fetching slider events:", error);
    } finally {
      setSliderLoading(false);
    }
  }, []);

  // Simpan selected events ke database
  const saveSliderEvents = async (selectedEventIds) => {
    try {
      setIsSavingSlider(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:8000/slider-events", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selected_events: selectedEventIds
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update state setelah berhasil disimpan
        setSelectedEventIds(selectedEventIds);
        
        MySwal.fire({
          title: "Berhasil!",
          text: `Event slider telah disimpan ke database.`,
          icon: "success",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
        
        return true;
      } else {
        throw new Error("Gagal menyimpan ke database");
      }
    } catch (error) {
      console.error("Error saving slider events:", error);
      MySwal.fire({
        title: "Gagal!",
        text: "Gagal menyimpan event slider ke database.",
        icon: "error",
        background: isDarkMode ? '#1A1F16' : '#F9F9F9',
        color: isDarkMode ? '#f8fafc' : '#1f2937',
      });
      return false;
    } finally {
      setIsSavingSlider(false);
    }
  };

  // Fungsi untuk update selected events
  const handleUpdateSelectedEvents = async (newSelectedEventIds) => {
    const success = await saveSliderEvents(newSelectedEventIds);
    if (success) {
      setModalOpen(false);
    }
  };

  // Fetch data event dari API
  const fetchEventsData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/kelas", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const dataWithTimestamp = data.map(event => ({
          ...event,
          foto: event.foto ? `${event.foto}?t=${Date.now()}` : event.foto
        }));
        
        setEvents(dataWithTimestamp);
        
        // Ambil kategori unik dari data event - TANPA "Semua"
        const eventCategories = getCategoriesFromEvents(data);
        const filteredCategories = eventCategories.filter(cat => cat !== "Semua");
        
        if (filteredCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(filteredCategories[0]);
        }
        
        setCategories(filteredCategories);
      } else {
        console.error("Data event tidak valid:", data);
        setEvents([]);
        setCategories([]);
      }
    } catch (err) {
      console.error("Gagal mengambil data event:", err);
      setEvents([]);
        setCategories([]);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [selectedCategory]);

  // Fetch data Tentang Kami dari API (untuk admin)
  const fetchTentangKamiData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/admin/tentang-kami", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
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
  }, []);

  // ========== FETCH DATA LAYANAN KAMI DARI API ==========
  const fetchLayananKamiData = useCallback(async () => {
    try {
      setLoadingLayanan(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/admin/layanan", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Data layanan dari API:", data);
        
        if (data && Object.keys(data).length > 0) {
          setLayananData({
            hero_title: data.hero_title || "LAYANAN KAMI",
            hero_subtitle: data.hero_subtitle || "Solusi Lengkap untuk Pengalaman Lari Terbaik",
            hero_description: data.hero_description || "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan.",
            services: data.services || [],
            target_audience: data.target_audience || []
          });
        } else {
          // Default data jika kosong
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
            ]
          });
        }
      } else {
        console.warn("Gagal mengambil data Layanan Kami, menggunakan data default");
      }
    } catch (error) {
      console.error("Error fetching Layanan Kami data:", error);
    } finally {
      setLoadingLayanan(false);
    }
  }, []);

  // Fetch data Kontak Kami dari API (untuk admin) - HANYA HERO SECTION
  const fetchKontakKamiData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/admin/kontak", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          // Ambil hanya data hero section dari API
          setKontakKamiData({
            hero_title: data.hero_title || "Hubungi Kami",
            hero_subtitle: data.hero_subtitle || "Kami Siap Membantu Anda",
            hero_description: data.hero_description || "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda."
          });
        }
      } else {
        console.warn("Gagal mengambil data Kontak Kami, menggunakan data default");
        // Data default jika API belum ada
        setKontakKamiData({
          hero_title: "Hubungi Kami",
          hero_subtitle: "Kami Siap Membantu Anda",
          hero_description: "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda."
        });
      }
    } catch (error) {
      console.error("Error fetching Kontak Kami data:", error);
    }
  }, []);

  // Fetch data Partner dari API
  const fetchPartnerData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/admin/partner", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
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
                name: "Contoh Sponsor",
                description: "Partner resmi dalam mendukung event lari berkualitas",
                category: "sponsor",
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
              name: "Contoh Sponsor",
              description: "Partner resmi dalam mendukung event lari berkualitas",
              category: "sponsor",
              logo: "",
              website: "https://example.com"
            }
          ]
        });
      }
    } catch (error) {
      console.error("Error fetching Partner data:", error);
    }
  }, []);

  // Fetch data footer kontak dari endpoint public
  const fetchFooterKontakData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchEventsData();
    fetchSliderEvents();
    fetchTentangKamiData();
    fetchLayananKamiData(); // Panggil fungsi untuk mengambil data layanan
    fetchKontakKamiData();
    fetchPartnerData(); // Panggil fungsi untuk mengambil data partner
    fetchFooterKontakData();
  }, [fetchEventsData, fetchSliderEvents, fetchTentangKamiData, fetchLayananKamiData, fetchKontakKamiData]);

  // Fungsi untuk mendapatkan URL gambar yang aman dengan timestamp
  const getImageUrl = (eventItem) => {
    if (eventItem.foto_url) {
      return `${eventItem.foto_url}?t=${Date.now()}`;
    }
    
    if (eventItem.foto) {
      return `http://localhost:8000/uploads/${eventItem.foto}?t=${Date.now()}`;
    }
    
    return null;
  };

  // Fungsi untuk handle klik tombol Detail
  const handleDetailClick = (id) => {
    navigate(`/admin/events/${id}`);
  };

  // Fungsi untuk handle klik tombol Edit
  const handleEditClick = (id, eventData) => {
    navigate(`/admin/edit-events/${id}`, { 
      state: { 
        kelas: eventData,
        fromList: true
      } 
    });
  };

  // Fungsi untuk handle klik tombol Hapus
  const handleDeleteClick = (id, namaEvent, kategoriEvent) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: `Apakah Anda yakin ingin menghapus event "${namaEvent}"? Data yang dihapus tidak dapat dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: isDarkMode ? "#D7FE51" : "#D46B5E",
      cancelButtonColor: "#6c757d",
      background: isDarkMode ? '#1A1F16' : '#F9F9F9',
      color: isDarkMode ? '#f8fafc' : '#1f2937',
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/kelas/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal menghapus event");

        // Refresh data setelah penghapusan berhasil
        await fetchEventsData();

        // Jika event yang dihapus ada di slider, hapus dari selectedEventIds
        if (selectedEventIds.includes(id)) {
          const newSelectedEvents = selectedEventIds.filter(eventId => eventId !== id);
          await saveSliderEvents(newSelectedEvents);
        }

        MySwal.fire({
          title: "Berhasil!",
          text: `Event "${namaEvent}" berhasil dihapus.`,
          icon: "success",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      } catch (err) {
        MySwal.fire({
          title: "Gagal!",
          text: err.message || "Terjadi kesalahan.",
          icon: "error",
          background: isDarkMode ? '#1A1F16' : '#F9F9F9',
          color: isDarkMode ? '#f8fafc' : '#1f2937',
        });
      }
    });
  };

  // Fungsi scroll horizontal
  const scroll = (direction, category) => {
    const container = scrollRefs.current[category];
    if (container) {
      const scrollAmount = direction === "left" ? -350 : 350;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Fungsi untuk membuka modal gambar dengan SwiperJS Lightbox
  const handleImageClick = (imageUrl, altText) => {
    // Siapkan images untuk lightbox
    const eventImages = events
      .filter(event => getImageUrl(event))
      .map(event => ({
        id: event.id,
        url: getImageUrl(event),
        description: event.nama_kelas,
        width: 800,
        height: 600
      }));
    
    // Cari index gambar yang diklik
    const clickedIndex = eventImages.findIndex(img => img.url === imageUrl);
    
    setLightboxImages(eventImages);
    setLightboxIndex(clickedIndex >= 0 ? clickedIndex : 0);
    setIsLightboxOpen(true);
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

  // Render icon berdasarkan nama
  const renderIcon = (iconName, size = 32) => {
    const iconProps = { size };
    switch(iconName) {
      case 'Calendar': return <Calendar {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'MapPin': return <MapPin {...iconProps} />;
      case 'Star': return <Star {...iconProps} />;
      case 'MessageSquare': return <MessageSquare {...iconProps} />;
      case 'Headphones': return <Headphones {...iconProps} />;
      case 'HelpCircle': return <HelpCircle {...iconProps} />;
      default: return <Calendar {...iconProps} />;
    }
  };

  // Filter event berdasarkan search dan kategori - DITAMBAHKAN
  const filteredEvents = events.filter((event) => {
    const matchNama = event.nama_kelas
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchKategori = selectedKategoriFilter === "Semua" || 
      (event.kategori || "") === selectedKategoriFilter;

    return matchNama && matchKategori;
  });

  // Kelompokkan event berdasarkan kategori yang dipilih - DIMODIFIKASI
  const groupEventsByCategory = () => {
    if (selectedKategoriFilter === "Semua") {
      // Jika "Semua" dipilih, kelompokkan berdasarkan semua kategori yang ada
      const grouped = {};
      
      categories.forEach(category => {
        if (category !== "Semua") {
          const filteredEventsByCat = filteredEvents.filter(event => event.kategori === category);
          if (filteredEventsByCat.length > 0) {
            grouped[category] = filteredEventsByCat;
          }
        }
      });
      
      return grouped;
    } else if (!selectedKategoriFilter) {
      // Jika tidak ada kategori yang dipilih, gunakan selectedCategory lama
      if (!selectedCategory) {
        return {};
      }
      
      const filteredEventsByCat = filteredEvents.filter(event => event.kategori === selectedCategory);
      return {
        [selectedCategory]: filteredEventsByCat
      };
    } else {
      // Jika kategori spesifik dipilih dari dropdown kedua
      const filteredEventsByCat = filteredEvents.filter(event => event.kategori === selectedKategoriFilter);
      return {
        [selectedKategoriFilter]: filteredEventsByCat
      };
    }
  };

  const eventsByCategory = groupEventsByCategory();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-[#D7FE51]" : "border-[#646B5E]"
          } mx-auto mb-4`}></div>
          <p className={isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}>
            Memuat event...
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

      {/* SwiperJS Lightbox Modal */}
      <LightboxModal
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Modal untuk mengelola event slider */}
      <ManageEventSliderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isDarkMode={isDarkMode}
        events={events}
        selectedEvents={selectedEventIds}
        onUpdateSelectedEvents={handleUpdateSelectedEvents}
        isSaving={isSavingSlider}
      />

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
            onClick={() => navigate("/admin/events")}
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
            Kelola Semua Event
          </motion.button>
        </motion.div>
      </section>

      {/* Section 3: Management Event dengan Horizontal Scroll - DIMODIFIKASI & RESPONSIVE */}
      <section className={`py-12 sm:py-16 md:py-20 px-4 sm:px-6 transition-colors duration-300 ${
        isDarkMode ? "bg-[#1A1F16]" : "bg-[#F9F9F9]"
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Header dengan Search dan Dropdown - DITAMBAHKAN */}
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
                  Kelola Event
                </h2>
              </div>
              <p className={`text-sm sm:text-base ${
                isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"
              }`}>
                Pilih kategori event yang ingin Anda kelola
              </p>
            </div>
            
            {/* Container untuk Search dan Dropdown - DITAMBAHKAN */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
              {/* Input Search - DITAMBAHKAN */}
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
              
              {/* Dropdown Kategori Filter - DITAMBAHKAN dengan OPSI "Semua" */}
              <div className="relative w-full sm:w-48">
                {categories.length > 0 ? (
                  <div className="relative">
                    <select
                      value={selectedKategoriFilter}
                      onChange={(e) => setSelectedKategoriFilter(e.target.value)}
                      className={`appearance-none w-full px-4 py-2 sm:py-3 pr-10 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 font-medium text-sm sm:text-base ${
                        isDarkMode
                          ? "bg-[#2A3025] border-[#363D30] text-white focus:ring-[#D7FE51] focus:border-[#D7FE51]"
                          : "bg-white border-[#ABB89D] text-[#646B5E] focus:ring-[#D7FE51] focus:border-[#D7FE51]"
                      }`}
                    >
                      <option value="Semua">Semua</option>
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

          {/* Info hasil pencarian - DITAMBAHKAN */}
          {searchTerm && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
              isDarkMode ? "bg-[#2A3025] border border-[#363D30]" : "bg-white border border-[#ABB89D]/30"
            }`}>
              <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]"}`}>
                Menampilkan hasil untuk: <span className="font-semibold">"{searchTerm}"</span>
                {Object.keys(eventsByCategory).length > 0 ? 
                  ` (${Object.values(eventsByCategory).reduce((total, list) => total + list.length, 0)} event ditemukan)` : 
                  " (tidak ditemukan)"}
              </p>
            </div>
          )}

          {/* Event List per Kategori dengan Horizontal Scroll */}
          {Object.keys(eventsByCategory).length === 0 ? (
            <div className={`text-center py-8 sm:py-12 rounded-xl ${
              isDarkMode ? "bg-[#2A3025] border border-[#363D30]" : "bg-white border border-[#ABB89D]/30"
            }`}>
              <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-[#646B5E]/70"}`}>
                {searchTerm 
                  ? `Tidak ada event yang cocok dengan pencarian "${searchTerm}"` 
                  : selectedKategoriFilter === "Semua"
                  ? "Tidak ada event dalam kategori apapun."
                  : `Tidak ada event dalam kategori ${selectedKategoriFilter}.`}
              </p>
            </div>
          ) : (
            Object.entries(eventsByCategory).map(([category, eventList]) => (
              <div 
                key={category}
                className="mb-8 sm:mb-12 md:mb-16 relative"
                onMouseEnter={() => setHoveredKategori(category)}
                onMouseLeave={() => setHoveredKategori(null)}
              >
                {/* Header Kategori */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-xl sm:text-2xl font-bold font-poppins-bold ${
                      isDarkMode ? "text-white" : "text-[#646B5E]"
                    }`}>
                      {category}
                    </h3>
                    <span className={`px-2 py-1 text-xs sm:text-sm rounded-full ${
                      isDarkMode 
                        ? "bg-[#363D30] text-[#D7FE51]" 
                        : "bg-[#ABB89D]/20 text-[#646B5E]"
                    }`}>
                      {eventList.length} event
                    </span>
                  </div>
                  
                  {hoveredKategori === category && eventList.length > 3 && (
                    <div className="hidden sm:flex gap-2">
                      <button
                        onClick={() => scroll("left", category)}
                        className={`p-2 rounded-full transition-colors ${
                          isDarkMode 
                            ? "bg-[#2A3025] hover:bg-[#363D30] text-[#D7FE51]" 
                            : "bg-white hover:bg-gray-100 text-[#646B5E] border border-[#ABB89D]"
                        }`}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => scroll("right", category)}
                        className={`p-2 rounded-full transition-colors ${
                          isDarkMode 
                            ? "bg-[#2A3025] hover:bg-[#363D30] text-[#D7FE51]" 
                            : "bg-white hover:bg-gray-100 text-[#646B5E] border border-[#ABB89D]"
                        }`}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Container Horizontal Scroll - DIPERBAIKI: Responsif card */}
                {eventList.length > 0 ? (
                  <>
                    <div 
                      ref={(el) => scrollRefs.current[category] = el}
                      className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth relative z-20"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {eventList.map((eventItem) => {
                        const imageUrl = getImageUrl(eventItem);
                        
                        return (
                          <EventCard
                            key={eventItem.id}
                            event={eventItem}
                            onDetailClick={handleDetailClick}
                            onEditClick={handleEditClick}
                            onDeleteClick={handleDeleteClick}
                            onImageClick={handleImageClick}
                            isDarkMode={isDarkMode}
                          />
                        );
                      })}
                    </div>

                    {/* Tombol navigasi scroll - hanya muncul saat hover di desktop */}
                    {hoveredKategori === category && eventList.length > 3 && (
                      <>
                        <button
                          onClick={() => scroll("left", category)}
                          className={`absolute -left-4 sm:-left-12 top-1/2 transform -translate-y-1/2 z-30 hover:scale-110 transition-transform hidden sm:block ${
                            isDarkMode ? "text-[#D7FE51]" : "text-[#D46B5E]"
                          }`}
                        >
                          <ChevronLeft size={30} strokeWidth={2} />
                        </button>
                        
                        <button
                          onClick={() => scroll("right", category)}
                          className={`absolute -right-4 sm:-right-12 top-1/2 transform -translate-y-1/2 z-30 hover:scale-110 transition-transform hidden sm:block ${
                            isDarkMode ? "text-[#D7FE51]" : "text-[#D46B5E]"
                          }`}
                        >
                          <ChevronRight size={30} strokeWidth={2} />
                        </button>
                      </>
                    )}

                    {/* Indikator scroll untuk mobile */}
                    {eventList.length > 3 && (
                      <div className="flex justify-center gap-2 mt-4 sm:mt-6 md:hidden">
                        {[...Array(Math.ceil(eventList.length / 3))].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              const container = scrollRefs.current[category];
                              if (container) {
                                container.scrollTo({
                                  left: index * container.clientWidth,
                                  behavior: 'smooth'
                                });
                              }
                            }}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              isDarkMode 
                                ? "bg-[#363D30] hover:bg-[#D7FE51]" 
                                : "bg-[#ABB89D]/30 hover:bg-[#646B5E]"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className={`text-center py-8 rounded-lg ${
                    isDarkMode ? "bg-[#2A3025]" : "bg-gray-50"
                  }`}>
                    <p className={`text-sm sm:text-base ${isDarkMode ? "text-[#ABB89D]" : "text-gray-500"}`}>
                      Belum ada event dalam kategori ini.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Section 4: Tentang Kami Highlight (Menggunakan data dari API untuk Admin) - RESPONSIVE */}
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

          {/* Tombol untuk ke Halaman Pengelolaan Tentang Kami */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-8 sm:mt-12 md:mt-16 flex flex-col md:flex-row gap-3 sm:gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/tentang-kami")}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 md:px-8 md:py-4 rounded-lg font-bold transition-colors duration-300 text-sm sm:text-base md:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                  : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <span>Lihat Halaman User</span>
              <ArrowRight size={16} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/tentang-kami")}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 md:px-8 md:py-4 rounded-lg font-bold transition-colors duration-300 text-sm sm:text-base md:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <Edit size={16} />
              <span className="hidden sm:inline">Kelola Konten Tentang Kami</span>
              <span className="sm:hidden">Kelola Tentang Kami</span>
            </motion.button>
          </motion.div>
          
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/70">
            Temukan lebih banyak tentang visi, misi, dan nilai-nilai kami
          </p>
        </div>
      </section>

      {/* ========== SECTION 5: LAYANAN KAMI HIGHLIGHT (DARI API LAYANANKAMIADMIN.JSX) - RESPONSIVE ========== */}
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
              {layananData.hero_title || "LAYANAN KAMI"}
              <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal mt-2 sm:mt-4">
                {layananData.hero_subtitle || "Solusi Lengkap untuk Pengalaman Lari Terbaik"}
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
              {layananData.hero_description || "Dari event organization hingga community building, kami menyediakan semua yang Anda butuhkan untuk pengalaman lari yang tak terlupakan."}
            </motion.p>
          </motion.div>

          {/* Tombol untuk ke Halaman Pengelolaan Layanan Kami - PERTAHANKAN FUNGSI ADMIN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-8 sm:mt-12 md:mt-16 flex flex-col md:flex-row gap-3 sm:gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/layanan")}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 md:px-8 md:py-4 rounded-lg font-bold transition-colors duration-300 text-sm sm:text-base md:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                  : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <span>Lihat Halaman User</span>
              <ArrowRight size={16} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/layanan")}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 md:px-8 md:py-4 rounded-lg font-bold transition-colors duration-300 text-sm sm:text-base md:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <Edit size={16} />
              <span className="hidden sm:inline">Kelola Konten Layanan Kami</span>
              <span className="sm:hidden">Kelola Layanan</span>
            </motion.button>
          </motion.div>
          
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/70">
            Temukan berbagai layanan kami yang dirancang untuk kebutuhan Anda
          </p>
        </div>
      </section>

      {/* ========== SECTION BARU: HIGHLIGHT PARTNER (DARI API PARTNERADMIN.JSX) - RESPONSIVE ========== */}
      {/* Section 6: Partner Highlight - DITAMBAHKAN */}
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

          {/* Tombol untuk ke Halaman Pengelolaan Partner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-8 sm:mt-12 md:mt-16 flex flex-col md:flex-row gap-3 sm:gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/partner")}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 md:px-8 md:py-4 rounded-lg font-bold transition-colors duration-300 text-sm sm:text-base md:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                  : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <span>Lihat Halaman User</span>
              <ArrowRight size={16} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/partner")}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 md:px-8 md:py-4 rounded-lg font-bold transition-colors duration-300 text-sm sm:text-base md:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <Edit size={16} />
              <span className="hidden sm:inline">Kelola Konten Partner</span>
              <span className="sm:hidden">Kelola Partner</span>
            </motion.button>
          </motion.div>
          
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/70">
            Temukan berbagai partner dan sponsor yang mendukung kesuksesan event kami
          </p>
        </div>
      </section>

      {/* Section 7: Kontak Kami Highlight - MENGAMBIL DATA DARI API - RESPONSIVE */}
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
              {kontakKamiData.hero_title || "Hubungi Kami"}
              <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal mt-2 sm:mt-4">
                {kontakKamiData.hero_subtitle || "Kami Siap Membantu Anda"}
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
            {kontakKamiData.hero_description || "Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda dengan solusi terbaik untuk kebutuhan event lari Anda."}
          </motion.p>

          {/* Tombol Hubungi Kami */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-8 sm:mt-12 md:mt-16 flex flex-col md:flex-row gap-3 sm:gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/kontak")}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 md:px-8 md:py-4 rounded-lg font-bold transition-colors duration-300 text-sm sm:text-base md:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#D7FE51] hover:bg-[#C4E840] text-[#1A1F16]" 
                  : "bg-[#D7FE51] hover:bg-[#C4E840] text-[#646B5E]"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <span>Lihat Halaman User</span>
              <ArrowRight size={16} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/kontak")}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 md:px-8 md:py-4 rounded-lg font-bold transition-colors duration-300 text-sm sm:text-base md:text-lg font-poppins-bold ${
                isDarkMode 
                  ? "bg-[#363D30] hover:bg-[#2A3025] text-[#D7FE51]" 
                  : "bg-[#646B5E] hover:bg-[#ABB89D] text-white"
              } shadow-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              <Edit size={16} />
              <span className="hidden sm:inline">Kelola Konten Kontak Kami</span>
              <span className="sm:hidden">Kelola Kontak</span>
            </motion.button>
          </motion.div>
          
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/70">
            Dapatkan informasi lebih lanjut tentang event dan kolaborasi
          </p>
        </div>
      </section>

      {/* Footer Section - DIMODIFIKASI untuk memanggil data dari API - RESPONSIVE */}
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
                  onClick={() => navigate("/admin/events")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Lihat Event
                </button>
                <button 
                  onClick={() => navigate("/admin/tentang-kami")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Tentang Kami
                </button>
                <button 
                  onClick={() => navigate("/admin/layanan")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Layanan
                </button>
                <button 
                  onClick={() => navigate("/admin/partner")}
                  className={`block text-left hover:text-[#D7FE51] transition-colors text-sm sm:text-base ${
                    isDarkMode ? "text-[#ABB89D]" : "text-gray-600"
                  }`}
                >
                  Partner
                </button>
                <button 
                  onClick={() => navigate("/admin/kontak")}
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
        .thumbnail-s
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
      `}</style>
    </div>
  );
}
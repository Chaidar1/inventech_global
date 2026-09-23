import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, ZoomIn, ZoomOut, RotateCcw, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ViewProfilePhoto() {
  const [profile, setProfile] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Error parsing profile:", e);
      }
    }
  }, []);

  const getProfilePictureUrl = (filename) => {
    if (!filename) return null;
    // Tambahkan timestamp untuk menghindari cache
    return `http://localhost:8000/uploads/profile_pictures/${filename}?t=${new Date().getTime()}`;
  };

  const handleDownload = () => {
    if (profile?.foto_profil) {
      const link = document.createElement('a');
      link.href = getProfilePictureUrl(profile.foto_profil);
      link.download = `profile-${profile.username}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 1));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse events untuk drag
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events untuk mobile
  const handleTouchStart = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && scale > 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel event untuk zoom dengan mouse wheel
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div 
      className={`min-h-screen ${isDarkMode ? "bg-black" : "bg-gray-900"} text-white relative overflow-hidden`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Header Controls */}
      <div className={`absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center backdrop-blur-sm ${
        isDarkMode ? "bg-black/50" : "bg-gray-900/50"
      }`}>
        <button
          onClick={() => navigate(-1)}
          className={`p-3 rounded-full transition-all duration-300 ${
            isDarkMode 
              ? "bg-white/10 hover:bg-white/20" 
              : "bg-gray-700/50 hover:bg-gray-600/50"
          }`}
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className={`p-3 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20 disabled:opacity-30" 
                : "bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-30"
            }`}
          >
            <ZoomOut size={20} />
          </button>

          <button
            onClick={handleReset}
            className={`p-3 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20" 
                : "bg-gray-700/50 hover:bg-gray-600/50"
            }`}
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className={`p-3 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20 disabled:opacity-30" 
                : "bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-30"
            }`}
          >
            <ZoomIn size={20} />
          </button>

          {/* Download Button */}
          {profile?.foto_profil && (
            <button
              onClick={handleDownload}
              className={`p-3 rounded-full transition-all duration-300 ${
                isDarkMode 
                  ? "bg-white/10 hover:bg-white/20" 
                  : "bg-gray-700/50 hover:bg-gray-600/50"
              }`}
            >
              <Download size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Photo Container */}
      <div 
        ref={containerRef}
        className="flex items-center justify-center w-full h-screen"
      >
        {profile?.foto_profil ? (
          <div className="relative">
            <img
              ref={imageRef}
              src={getProfilePictureUrl(profile.foto_profil)}
              alt="Foto Profile"
              className="max-w-full max-h-full object-contain cursor-move"
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              draggable="false"
            />
            
            {/* Zoom Level Indicator */}
            <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm ${
              isDarkMode ? "bg-white/20" : "bg-gray-700/50"
            }`}>
              {Math.round(scale * 100)}%
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className={`w-48 h-48 rounded-full flex flex-col items-center justify-center border-4 mx-auto mb-6 ${
              isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-500 bg-gray-700"
            }`}>
              <User size={80} className="text-gray-400 mb-4" />
              <p className="text-gray-400 text-lg">Tidak ada foto profile</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                isDarkMode
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Kembali
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      {profile?.foto_profil && (
        <div className={`absolute bottom-4 right-4 text-sm ${
          isDarkMode ? "text-white/60" : "text-gray-400"
        }`}>
          <p>• Scroll mouse untuk zoom</p>
          <p>• Drag untuk menggeser</p>
          <p>• Klik ikon reset untuk kembali ke ukuran normal</p>
        </div>
      )}
    </div>
  );
}
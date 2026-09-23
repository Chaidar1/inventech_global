import { useTheme } from "../context/ThemeContext";

export const useAppTheme = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const themeClasses = {
    // Background classes
    bg: isDarkMode ? "bg-gray-900" : "bg-white",
    bgPrimary: isDarkMode ? "bg-gray-800" : "bg-white",
    bgSecondary: isDarkMode ? "bg-gray-700" : "bg-gray-50",
    
    // Text classes
    text: isDarkMode ? "text-white" : "text-gray-900",
    textPrimary: isDarkMode ? "text-white" : "text-gray-900",
    textSecondary: isDarkMode ? "text-gray-300" : "text-gray-600",
    textMuted: isDarkMode ? "text-gray-400" : "text-gray-500",
    
    // Border classes
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    borderLight: isDarkMode ? "border-gray-600" : "border-gray-300",
    
    // Card classes
    card: isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900",
    
    // Input classes
    input: isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
    
    // Button classes
    btnPrimary: isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white",
    btnSecondary: isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900",
    btnDanger: isDarkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white",
    
    // Table classes
    table: isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    tableHeader: isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900",
    tableRow: isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50",
    
    // Status colors
    success: isDarkMode ? "text-green-400" : "text-green-600",
    warning: isDarkMode ? "text-yellow-400" : "text-yellow-600",
    error: isDarkMode ? "text-red-400" : "text-red-600",
    info: isDarkMode ? "text-blue-400" : "text-blue-600",
  };

  return {
    isDarkMode,
    toggleTheme,
    themeClasses
  };
};
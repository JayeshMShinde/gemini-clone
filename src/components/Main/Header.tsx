import React, { useContext, useState } from 'react';
import { assets } from "../../assets/assets";
import { ThemeContext } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="sticky top-0 right-0 bg-white/90 dark:bg-gray-900/85 backdrop-blur-3xl border-b border-gray-200 dark:border-gray-500 z-10">
      <div className="w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo/Title - Responsive text size */}
        <div className="flex items-center gap-2 max-w-[70%] sm:max-w-none">
          <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
            Coders ke sath bhi, debugging ke baad bhi! 🛠️🐞
          </span>
        </div>
        
        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-yellow-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <img
            className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            src={assets.user_icon}
            alt="User Profile"
          />
        </div>
        
        {/* Mobile Controls */}
        <div className="flex sm:hidden items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-yellow-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={toggleMenu}
            className="p-1 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
          
          <img
            className="w-7 h-7 rounded-full shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            src={assets.user_icon}
            alt="User Profile"
          />
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-3 px-4 animate-fadeIn">
          <nav className="flex flex-col space-y-3">
            <a href="#" className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Settings
            </a>
            <a href="#" className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Help
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
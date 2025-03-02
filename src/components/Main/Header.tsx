import React, { useContext } from 'react';
import { assets } from "../../assets/assets";
import { ThemeContext } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  return (
    <header className="sticky top-0 right-0 bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
      <div className="max-w-[1900px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Balle Balle Bonanza</span>
        </div>
        <div className="flex items-center gap-4">
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
            className="w-10 h-10 rounded-full shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            src={assets.user_icon}
            alt="User Profile"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
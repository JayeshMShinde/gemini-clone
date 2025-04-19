import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../../context/context';
import { ThemeContext } from '../../context/ThemeContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  extended: boolean;
}

interface ContextType {
  extended: boolean;
  setExtended: React.Dispatch<React.SetStateAction<boolean>>;
  previousPrompt?: string[];
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  text, 
  onClick, 
  extended 
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <div 
      onClick={onClick}
      className={`
        flex items-center gap-3 p-2 md:p-3 rounded-lg transition-colors
        ${isDarkMode 
          ? 'hover:bg-gray-700 active:bg-gray-600' 
          : 'hover:bg-gray-200 active:bg-gray-300'}
        cursor-pointer
      `}
    >
      <div className="flex-shrink-0">{icon}</div>
      {extended && (
        <span className="text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
          {text}
        </span>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const context = useContext<ContextType | null>(Context as any);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768 && context?.extended) {
        context.setExtended(false);
      }
    };

    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [context]);
  
  if (!context) {
    return (
      <div className="p-4 text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded">
        Error: Context not available
      </div>
    );
  }

  const { extended, setExtended, previousPrompt = [] } = context;

  const handleToggleExtended = (): void => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setExtended((prev: boolean) => !prev);
    }
  };

  const MenuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H21V18H3V16Z" fill={isDarkMode ? "#90CAF9" : "#1E88E5"} />
    </svg>
  );

  const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill={isDarkMode ? "#90CAF9" : "#1E88E5"} />
    </svg>
  );

  const MessageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4.58 16.59L4 17.17V4H20V16Z" fill={isDarkMode ? "#90CAF9" : "#1E88E5"} />
    </svg>
  );

  const QuestionIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 17H13V15H11V17ZM11 13H13V7H11V13Z" fill={isDarkMode ? "#90CAF9" : "#1E88E5"} />
    </svg>
  );

  const HistoryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3C8.03 3 4 7.03 4 12H1L5 16L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.22 8.11 16.95L6.69 18.36C8.27 20.05 10.53 21 13 21C18.52 21 23 16.52 23 12C23 7.48 18.52 3 13 3ZM12 8V13L16.25 15.52L17.02 14.24L13.5 12.25V8H12Z" fill={isDarkMode ? "#90CAF9" : "#1E88E5"} />
    </svg>
  );

  const SettingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.14 12.94C19.14 12.63 19.12 12.32 19.08 12.02L21.19 10.47C21.34 10.36 21.39 10.14 21.31 9.96L19.31 6.36C19.23 6.18 19.03 6.1 18.84 6.16L16.5 7.05C16.05 6.73 15.56 6.47 15.03 6.28L14.65 3.72C14.63 3.53 14.47 3.39 14.28 3.39H9.72C9.53 3.39 9.37 3.53 9.35 3.72L8.97 6.28C8.44 6.47 7.95 6.73 7.5 7.05L5.16 6.16C4.97 6.1 4.77 6.18 4.69 6.36L2.69 9.96C2.61 10.14 2.66 10.36 2.81 10.47L4.92 12.02C4.88 12.32 4.86 12.63 4.86 12.94C4.86 13.25 4.88 13.56 4.92 13.86L2.81 15.41C2.66 15.52 2.61 15.74 2.69 15.92L4.69 19.52C4.77 19.7 4.97 19.78 5.16 19.72L7.5 18.83C7.95 19.15 8.44 19.41 8.97 19.6L9.35 22.16C9.37 22.35 9.53 22.49 9.72 22.49H14.28C14.47 22.49 14.63 22.35 14.65 22.16L15.03 19.6C15.56 19.41 16.05 19.15 16.5 18.83L18.84 19.72C19.03 19.78 19.23 19.7 19.31 19.52L21.31 15.92C21.39 15.74 21.34 15.52 21.19 15.41L19.08 13.86C19.12 13.56 19.14 13.25 19.14 12.94ZM12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5Z" fill={isDarkMode ? "#90CAF9" : "#1E88E5"} />
    </svg>
  );

  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill={isDarkMode ? "#90CAF9" : "#1E88E5"} />
    </svg>
  );
  
  // Mobile sidebar overlay
  const mobileOverlay = isMobile && isOpen && (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-10"
      onClick={() => setIsOpen(false)}
    />
  );
  
  return (
    <>
      {mobileOverlay}
      <aside 
        className={`
          fixed left-0 top-0 h-screen z-20
          ${isDarkMode 
            ? 'bg-gray-800 border-r border-gray-700' 
            : 'bg-gray-50 border-r border-gray-200'}
          flex flex-col justify-between
          transition-all duration-300 ease-in-out
          ${isMobile 
            ? isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full' 
            : extended ? 'w-64' : 'w-16 md:w-20'}
          p-3 md:p-4
        `}
      >
        {/* Top Section */}
        <div className="space-y-4 md:space-y-6">
          {/* Menu Toggle */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleToggleExtended}
              className={`
                p-2 rounded-full transition-colors
                ${isDarkMode 
                  ? 'hover:bg-gray-700 active:bg-gray-600' 
                  : 'hover:bg-gray-200 active:bg-gray-300'}
              `}
              type="button"
              aria-label="Toggle sidebar"
            >
              {isMobile && isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            
            {isMobile && isOpen && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Menu</span>
            )}
          </div>

          {/* New Chat Button */}
          <div className="px-1">
            <div 
              role="button"
              tabIndex={0}
              className={`
                flex items-center gap-3 p-2 md:p-3 rounded-lg cursor-pointer
                ${isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400'}
                transition-colors
              `}
            >
              <PlusIcon />
              {(extended || (isMobile && isOpen)) && (
                <span className="text-gray-800 dark:text-gray-200 text-sm">New Chat</span>
              )}
            </div>
          </div>

          {/* Recent Chats Section */}
          {(extended || (isMobile && isOpen)) && previousPrompt && previousPrompt.length > 0 && (
            <div className="mt-6 md:mt-8">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-3 md:px-4 mb-2 md:mb-3">Recent</h2>
              <div className="space-y-1 max-h-[40vh] md:max-h-[60vh] overflow-y-auto pr-2 sidebar-scroll">
                {previousPrompt.map((item: string, index: number) => (
                  <SidebarItem
                    key={index}
                    icon={<MessageIcon />}
                    text={item.length > 25 ? `${item.slice(0, 25)}...` : item}
                    extended={extended || (isMobile && isOpen)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="space-y-1 mt-auto pt-3 md:pt-4 border-t dark:border-gray-700">
          <SidebarItem
            icon={<QuestionIcon />}
            text="Help"
            extended={extended || (isMobile && isOpen)}
          />
          <SidebarItem
            icon={<HistoryIcon />}
            text="Activity"
            extended={extended || (isMobile && isOpen)}
          />
          <SidebarItem
            icon={<SettingIcon />}
            text="Settings"
            extended={extended || (isMobile && isOpen)}
          />
        </div>
      </aside>
      
      {/* Floating hamburger button on mobile when sidebar is closed */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`
            fixed top-4 left-4 z-10 p-2 rounded-full shadow-md
            ${isDarkMode 
              ? 'bg-gray-800 text-gray-200' 
              : 'bg-white text-gray-700'}
          `}
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </button>
      )}
    </>
  );
};

export default Sidebar;
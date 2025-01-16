import React, { useContext } from 'react';
import { Context } from '../../context/context';
import { assets } from '../../assets/assets';

interface SidebarItemProps {
  icon: string;
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
}) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-3 p-3 rounded-full transition-colors hover:bg-gray-200 cursor-pointer"
  >
    <img src={icon} alt="" className="w-5 h-5 min-w-5" />
    {extended && <span className="text-gray-700 text-sm whitespace-nowrap">{text}</span>}
  </div>
);

const Sidebar: React.FC = () => {
  const context = useContext<ContextType | null>(Context as any);

  if (!context) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded">
        Error: Context not available
      </div>
    );
  }

  const { extended, setExtended, previousPrompt = [] } = context;

  const handleToggleExtended = (): void => {
    setExtended((prev: boolean) => !prev);
  };

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen
        bg-[#f0f4f9] shadow-sm
        flex flex-col justify-between
        transition-all duration-300 ease-in-out
        ${extended ? 'w-64' : 'w-20'}
        p-4
      `}
    >
      {/* Top Section */}
      <div className="space-y-6">
        {/* Menu Toggle */}
        <button
          onClick={handleToggleExtended}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          type="button"
          aria-label="Toggle sidebar"
        >
          <img 
            src={assets.menu_icon} 
            alt="Toggle Menu"
            className="w-5 h-5" 
          />
        </button>

        {/* New Chat Button */}
        <div className="px-1">
          <div 
            role="button"
            tabIndex={0}
            className="flex items-center gap-3 p-3 bg-[#e6eaf1] rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <img src={assets.plus_icon} alt="New Chat" className="w-5 h-5" />
            {extended && <span className="text-gray-600 text-sm">New Chat</span>}
          </div>
        </div>

        {/* Recent Chats Section */}
        {extended && previousPrompt.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-gray-500 px-4 mb-3">Recent</h2>
            <div className="space-y-1">
              {previousPrompt.map((item: string, index: number) => (
                <SidebarItem
                  key={index}
                  icon={assets.message_icon}
                  text={item.length > 25 ? `${item.slice(0, 25)}...` : item}
                  extended={extended}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="space-y-1">
        <SidebarItem
          icon={assets.question_icon}
          text="Help"
          extended={extended}
        />
        <SidebarItem
          icon={assets.history_icon}
          text="Activity"
          extended={extended}
        />
        <SidebarItem
          icon={assets.setting_icon}
          text="Settings"
          extended={extended}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
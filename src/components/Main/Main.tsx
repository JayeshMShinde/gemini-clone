import React, { useContext, useEffect, useRef } from "react";
import { Context } from "../../context/context";
import { ThemeContext } from "../../context/ThemeContext";
import Header from "./Header";
import { grid } from "ldrs";

grid.register();

// Types

interface FooterProps {
  input: string;
  setInput: (value: string) => void;
  onSent: (message: string) => void;
  // Make sure this matches the original definition's modifiers
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  extended: boolean;
}

interface ContextType {
  onSent: (value: string) => void;
  recentPrompt?: string;
  showResult: boolean;
  loading: boolean;
  resultData?: string;
  setInput: (value: string) => void;
  input?: string;
  extended: boolean;
}

// interface SuggestionCardProps {
//   text: string;
//   icon: string;
//   onClick?: () => void;
// }

interface ResultViewProps {
  recentPrompt: string;
  loading: boolean;
  resultData: string;
}

// Icon SVG Components
const GalleryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM13.96 12.29L11.21 15.83L9.25 13.47L6.5 17H17.5L13.96 12.29Z" fill="currentColor" />
  </svg>
);

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 14C13.66 14 14.99 12.66 14.99 11L15 5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM17.3 11C17.3 14 14.76 16.1 12 16.1C9.24 16.1 6.7 14 6.7 11H5C5 14.41 7.72 17.23 11 17.72V21H13V17.72C16.28 17.24 19 14.42 19 11H17.3Z" fill="currentColor" />
  </svg>
);

const SendIcon = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill={isDarkMode ? "#90CAF9" : "#1E88E5"} />
  </svg>
);

const CompassIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM6.5 17.5L14.01 14.01L17.5 6.5L9.99 9.99L6.5 17.5ZM12 10.9C12.61 10.9 13.1 11.39 13.1 12C13.1 12.61 12.61 13.1 12 13.1C11.39 13.1 10.9 12.61 10.9 12C10.9 11.39 11.39 10.9 12 10.9Z" fill="currentColor" />
  </svg>
);

const BulbIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21C9 21.55 9.45 22 10 22H14C14.55 22 15 21.55 15 21V20H9V21ZM12 2C8.14 2 5 5.14 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.14 15.86 2 12 2ZM14.85 13.1L14 13.7V16H10V13.7L9.15 13.1C7.8 12.16 7 10.63 7 9C7 6.24 9.24 4 12 4C14.76 4 17 6.24 17 9C17 10.63 16.2 12.16 14.85 13.1Z" fill="currentColor" />
  </svg>
);

const MessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4.58 16.59L4 17.17V4H20V16Z" fill="currentColor" />
  </svg>
);

const CodeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z" fill="currentColor" />
  </svg>
);

const UserIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#E0E0E0" />
    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#757575" />
  </svg>
);

const GeminiIcon = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill={isDarkMode ? "#2D3748" : "#E8F0FE"} />
    <path d="M6 12.75C6 9.5725 8.573 7 11.75 7H12.25C15.427 7 18 9.5725 18 12.75V17H12.25C8.913 17 6 14.087 6 10.75V12.75Z" fill={isDarkMode ? "#90CAF9" : "#1E88E5"} />
    <path d="M12.25 7C15.427 7 18 9.5725 18 12.75V10.75C18 7.5725 15.427 5 12.25 5H11.75C8.573 5 6 7.5725 6 10.75C6 14.087 8.913 17 12.25 17H18V19H11.75C7.201 19 3.5 15.299 3.5 10.75C3.5 7.5725 6.073 5 9.25 5H12.25Z" fill={isDarkMode ? "#1565C0" : "#0D47A1"} />
  </svg>
);

// Main Component
const Main: React.FC = () => {
  const context = useContext<ContextType | null>(Context as any);

  if (!context) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 bg-red-50 dark:bg-red-900/50 dark:text-red-200">
        Error: Context not available
      </div>
    );
  }

  const {
    onSent,
    recentPrompt,
    showResult,
    loading,
    resultData,
    setInput,
    input,
    extended,
  } = context;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && input?.trim()) {
      e.preventDefault();
      onSent(input);
    }
  };

  return (
    <div 
      className={`
        flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
        ${extended ? 'ml-64' : 'ml-20'}
        transition-all duration-300
      `}
    >
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto px-6 md:px-20 lg:px-40 py-5">
          {!showResult ? (
            <InitialView />
          ) : (
            <ResultView
              recentPrompt={recentPrompt || ""}
              loading={loading}
              resultData={resultData || ""}
            />
          )}
        </div>
      </main>
      <Footer
        input={input || ""}
        setInput={setInput}
        onSent={onSent}
        handleKeyDown={handleKeyDown}
        extended={extended}
      />
    </div>
  );
};

// Initial View Components
const InitialView: React.FC = () => {
  return (
    <div className="py-12 max-w-6xl mx-auto">
      <WelcomeMessage />
      <SuggestionGrid />
    </div>
  );
};

const WelcomeMessage: React.FC = () => (
  <div className="mb-16 text-center">
    <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4">
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
        Gemini
      </span>
    </h1>
    <p className="text-4xl md:text-5xl font-semibold text-gray-600 dark:text-gray-300">
      How can I help you today?
    </p>
  </div>
);

const SuggestionGrid: React.FC = () => {
  const svgIcons = [
    <CompassIcon key="compass" />,
    <BulbIcon key="bulb" />,
    <MessageIcon key="message" />,
    <CodeIcon key="code" />
  ];
  
  const suggestions = [
    {
      text: "Show me how to build something by hand",
      iconComponent: svgIcons[0],
    },
    {
      text: "Give me tips to help care for a tricky plant",
      iconComponent: svgIcons[1],
    },
    {
      text: "Come up with a product name for a new app",
      iconComponent: svgIcons[2],
    },
    {
      text: "Explain how something works like an engineer",
      iconComponent: svgIcons[3],
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
      {suggestions.map((suggestion, index) => (
        <SuggestionCard key={index} text={suggestion.text} iconComponent={suggestion.iconComponent} />
      ))}
    </div>
  );
};

const SuggestionCard = ({ text, iconComponent } : { text: string, iconComponent: React.ReactNode }) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <div className={`
      group h-[200px] p-6 rounded-2xl relative cursor-pointer
      transition-all duration-300 shadow-sm hover:shadow-md
      ${isDarkMode 
        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}
    `}>
      <p className="text-gray-800 dark:text-gray-200 text-lg font-medium leading-relaxed">{text}</p>
      <div className={`
        absolute bottom-4 right-4 p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all
        ${isDarkMode ? 'bg-gray-700' : 'bg-white'}
      `}>
        <div className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300">
          {iconComponent}
        </div>
      </div>
    </div>
  );
};

// Result View Components
const ResultView: React.FC<ResultViewProps> = ({ recentPrompt, loading, resultData }) => (
  <div className="py-8 min-h-[calc(100vh-200px)] max-w">
    <UserPrompt prompt={recentPrompt} />
    <GeminiResponse loading={loading} resultData={resultData} />
  </div>
);

const UserPrompt: React.FC<{ prompt: string }> = ({ prompt }) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <div className={`
      flex items-start gap-5 mb-8 p-4 rounded-2xl
      ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}
    `}>
      <div className="w-10 h-10 rounded-full shadow-sm overflow-hidden">
        <UserIcon />
      </div>
      <p className="flex-1 text-gray-800 dark:text-gray-200 leading-relaxed pt-1">{prompt}</p>
    </div>
  );
};

const GeminiResponse: React.FC<{ loading: boolean; resultData: string }> = ({
  loading,
  resultData,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <div className={`
      flex items-start gap-5 p-4 rounded-2xl
      ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}
    `}>
      <div className="w-10 h-10 rounded-full shadow-sm overflow-hidden">
        <GeminiIcon isDarkMode={isDarkMode} />
      </div>
      {loading ? (
        <div className="flex-1 flex justify-center py-8">
          <l-grid size="100" speed="2.8" color={isDarkMode ? "#90CAF9" : "#1E88E5"} />
        </div>
      ) : (
        <div
          className="flex-1 prose prose-blue dark:prose-invert max-w-none leading-relaxed pt-1"
          dangerouslySetInnerHTML={{ __html: resultData }}
        />
      )}
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({
  input,
  setInput,
  onSent,
  handleKeyDown
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  
  // Custom handler for textarea keydown events
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow default behavior (new line) when Shift+Enter is pressed
        return;
      } else {
        // Prevent default and send message on Enter without shift
        e.preventDefault();
        if (input.trim()) {
          onSent(input);
        }
      }
    } else {
      // Pass the event to the original handler
      // Type casting to avoid type conflicts
      handleKeyDown(e as any);
    }
  };
  
  return (
    <footer className={`
      sticky bottom-0 right-0 z-10
      ${isDarkMode 
        ? 'bg-gray-900/95 border-t border-gray-700' 
        : 'bg-white/95 border-t border-gray-200'}
      backdrop-blur-md shadow-sm
    `}>
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className={`
          flex items-center gap-4 px-6 py-3 rounded-full shadow-sm
          ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}
        `}>
          <textarea
            ref={textareaRef}
            onChange={(e) => setInput(e.target.value)}
            value={input}
            className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none overflow-hidden min-h-[24px] max-h-32"
            placeholder="Enter a prompt here... (Shift+Enter for new line)"
            onKeyDown={handleTextareaKeyDown}
            rows={1}
          />
          <div className="flex items-center gap-6">
            <button className="hover:opacity-70 transition-opacity text-gray-700 dark:text-gray-300">
              <GalleryIcon />
            </button>
            <button className="hover:opacity-70 transition-opacity text-gray-700 dark:text-gray-300">
              <MicIcon />
            </button>
            <button
              onClick={() => input.trim() && onSent(input)}
              className={`
                p-2 rounded-full transition-colors
                ${input.trim() ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}
                ${isDarkMode 
                  ? 'hover:bg-gray-700 active:bg-gray-600' 
                  : 'hover:bg-gray-200 active:bg-gray-300'}
              `}
              disabled={!input.trim()}
            >
              <SendIcon isDarkMode={isDarkMode} />
            </button>
          </div>
        </div>
        <p className="text-sm text-center mt-3 text-gray-500 dark:text-gray-400">
          Gemini may display inaccurate info, including about people, so double-check
          its responses. Your privacy and Gemini Apps.
        </p>
      </div>
    </footer>
  );
};

export default Main;
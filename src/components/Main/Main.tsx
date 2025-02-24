import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Context } from "../../context/context";
import { grid } from "ldrs";
import Header from "./Header";
import { ThemeContext } from "../../context/ThemeContext";

grid.register();

// Types
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

interface SuggestionCardProps {
  text: string;
  icon: string;
  onClick?: () => void;
}

interface ResultViewProps {
  recentPrompt: string;
  loading: boolean;
  resultData: string;
}

interface FooterProps {
  input: string;
  setInput: (value: string) => void;
  onSent: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  extended: boolean;
}

// Main Component
const Main: React.FC = () => {
  const context = useContext<ContextType | null>(Context as any);
  // Removed unused isDarkMode from ThemeContext in Main component

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
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
const InitialView: React.FC = () => (
  <div className="py-12 max-w-6xl mx-auto">
    <WelcomeMessage />
    <SuggestionGrid />
  </div>
);

const WelcomeMessage: React.FC = () => (
  <div className="mb-16 text-center">
    <h1 className="text-5xl md:text-6xl font-bold text-gray-700 dark:text-gray-200 mb-4">
      <span className="bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">
        Hello, Dev.
      </span>
    </h1>
    <p className="text-4xl md:text-5xl font-semibold text-gray-500 dark:text-gray-400">
      How can I help you today?
    </p>
  </div>
);

const SuggestionGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
    {suggestions.map((suggestion, index) => (
      <SuggestionCard key={index} {...suggestion} />
    ))}
  </div>
);

const SuggestionCard: React.FC<SuggestionCardProps> = ({ text, icon }) => (
  <div className="group h-[200px] p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md">
    <p className="text-gray-700 dark:text-gray-200 text-lg font-medium leading-relaxed">{text}</p>
    <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-700 p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all">
      <img className="w-8 h-8" src={icon} alt="" />
    </div>
  </div>
);

// Result View Components
const ResultView: React.FC<ResultViewProps> = ({ recentPrompt, loading, resultData }) => (
  <div className="py-8 min-h-[calc(100vh-200px)] max-w">
    <UserPrompt prompt={recentPrompt} />
    <GeminiResponse loading={loading} resultData={resultData} />
  </div>
);

const UserPrompt: React.FC<{ prompt: string }> = ({ prompt }) => (
  <div className="flex items-start gap-5 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
    <img
      className="w-10 h-10 rounded-full shadow-sm"
      src={assets.user_icon}
      alt="User"
    />
    <p className="flex-1 text-gray-700 dark:text-gray-200 leading-relaxed pt-1">{prompt}</p>
  </div>
);

const GeminiResponse: React.FC<{ loading: boolean; resultData: string }> = ({
  loading,
  resultData,
}) => {
  // Keep ThemeContext here since it's actually used for the loading spinner color
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <div className="flex items-start gap-5 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
      <img
        className="w-10 h-10 rounded-full shadow-sm"
        src={assets.gemini_icon}
        alt="Gemini"
      />
      {loading ? (
        <div className="flex-1 flex justify-center py-8">
          <l-grid size="100" speed="2.8" color={isDarkMode ? "#90CAF9" : "#61ABFF"} />
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

// Footer Component
const Footer: React.FC<FooterProps> = ({
  input,
  setInput,
  onSent,
  handleKeyDown
}) => (
  <footer className="sticky bottom-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-sm z-10">
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 px-6 py-3 rounded-full shadow-sm">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          type="text"
          placeholder="Enter a prompt here..."
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center gap-6">
          <button className="hover:opacity-70 transition-opacity">
            <img className="w-5 h-5" src={assets.gallery_icon} alt="Gallery" />
          </button>
          <button className="hover:opacity-70 transition-opacity">
            <img className="w-5 h-5" src={assets.mic_icon} alt="Mic" />
          </button>
          <button
            onClick={() => input.trim() && onSent(input)}
            className="hover:opacity-70 transition-opacity"
          >
            <img className="w-5 h-5" src={assets.send_icon} alt="Send" />
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

// Suggestion data
const suggestions = [
  {
    text: "Show me how to build something by hand",
    icon: assets.compass_icon,
  },
  {
    text: "Give me tips to help care for a tricky plant",
    icon: assets.bulb_icon,
  },
  {
    text: "Come up with a product name for a new app",
    icon: assets.message_icon,
  },
  {
    text: "Explain how something works like an engineer",
    icon: assets.code_icon,
  },
];

export default Main;
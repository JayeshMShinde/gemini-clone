import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Context } from "../../context/context";
import { grid } from "ldrs";

grid.register();

const Main: React.FC = () => {
  const context = useContext(Context);

  if (!context) {
    return <div>Error: Context not available</div>;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSent(input as string);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1900px] mx-auto px-40 py-5">
          {!showResult ? (
            <InitialView />
          ) : (
            <ResultView
              recentPrompt={recentPrompt as string}
              loading={loading}
              resultData={resultData as string}
            />
          )}
        </div>
      </main>
      <Footer
        input={input as string}
        setInput={setInput}
        onSent={onSent}
        handleKeyDown={handleKeyDown}
        extended={extended}
      />
    </div>
  );
};

const Header: React.FC = () => (
<header className="flex items-center justify-between p-5 text-md text-[#585858]">
    <p>Gemini</p>
    <img className="w-10 rounded-full" src={assets.user_icon} alt="User" />
  </header>
);

const InitialView: React.FC = () => (
  <div className="py-12">
    <WelcomeMessage />
    <SuggestionGrid />
  </div>
);

const WelcomeMessage: React.FC = () => (
  <div className="mt-12 mb-12 text-6xl text-[#c4c7c5] font-semibold p-2">
    <p>
      <span className="bg-clip-text bg-gradient-to-r from-[#4b90ff] to-[#ff5546] text-transparent">
        Hello, Dev.
      </span>
    </p>
    <p>How can I help you today?</p>
  </div>
);

const SuggestionGrid: React.FC = () => (
  <div className="grid grid-cols-4 gap-3 p-2">
    <SuggestionCard
      text="Show me how to build something by hand"
      icon={assets.compass_icon}
    />
    <SuggestionCard
      text="Give me tips to help care for a tricky plant"
      icon={assets.bulb_icon}
    />
    <SuggestionCard
      text="Come up with a product name for a new app"
      icon={assets.message_icon}
    />
    <SuggestionCard
      text="Explain how something works like an engineer"
      icon={assets.code_icon}
    />
  </div>
);

const SuggestionCard: React.FC<{ text: string; icon: string }> = ({
  text,
  icon,
}) => (
  <div className="h-[200px] p-4 bg-[#f0f4f9] rounded-xl relative cursor-pointer hover:bg-[#dfe4ea]">
    <p className="text-[#585858] text-md">{text}</p>
    <img
      className="w-9 p-1.5 absolute bg-white rounded-[20px] bottom-2.5 right-2.5"
      src={icon}
      alt=""
    />
  </div>
);

// Other components remain the same until ResultView

const ResultView: React.FC<{
  recentPrompt: string;
  loading: boolean;
  resultData: string;
}> = ({ recentPrompt, loading, resultData }) => (
  <div className="py-8 min-h-[calc(100vh-200px)]">
    <UserPrompt prompt={recentPrompt} />
    <GeminiResponse loading={loading} resultData={resultData} />
  </div>
);

const UserPrompt: React.FC<{ prompt: string }> = ({ prompt }) => (
  <div className="flex items-start gap-5 mb-8">
    <img className="w-10 rounded-full flex-shrink-0" src={assets.user_icon} alt="User" />
    <p className="flex-1">{prompt}</p>
  </div>
);

const GeminiResponse: React.FC<{ loading: boolean; resultData: string }> = ({
  loading,
  resultData,
}) => (
  <div className="flex items-start gap-5">
    <img className="w-10 rounded-full flex-shrink-0" src={assets.gemini_icon} alt="Gemini" />
    {loading ? (
      <div className="flex-1">
        <l-grid size="100" speed="2.8" color="#61ABFF"></l-grid>
      </div>
    ) : (
      <p
        className="flex-1 leading-7"
        dangerouslySetInnerHTML={{ __html: resultData }}
      ></p>
    )}
  </div>
);

const Footer: React.FC<{
  input: string;
  setInput: (value: string) => void;
  onSent: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  extended: boolean;
}> = ({ input, setInput, onSent, handleKeyDown, extended }) => (
  <footer className={`sticky bottom-0 bg-white border-t ${extended ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
    <div className="max-w-[900px] mx-auto px-4 py-4">
      <div className="flex items-center gap-4 bg-[#f0f4f9] px-4 py-2 rounded-full">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          className="flex-1 bg-transparent border-none outline-none"
          type="text"
          placeholder="Enter a prompt here ..."
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center gap-4">
          <img className="w-5 cursor-pointer" src={assets.gallery_icon} alt="Gallery" />
          <img className="w-5 cursor-pointer" src={assets.mic_icon} alt="Mic" />
          <img
            className="w-5 cursor-pointer"
            src={assets.send_icon}
            alt="Send"
            onClick={() => onSent(input)}
          />
        </div>
      </div>
      <p className="text-sm text-center mt-2 text-gray-600">
        Gemini may display inaccurate info, including about people, so
        double-check its responses. Your privacy and Gemini Apps.
      </p>
    </div>
  </footer>
);

export default Main;

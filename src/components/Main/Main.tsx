import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Context } from "../../context/context";
import { grid } from 'ldrs'

const Main: React.FC = () => {
  const context = useContext(Context);
  grid.register()

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
  } = context;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSent(input as string);
    }
  };

  return (
    <div className="flex-1 min-h-screen relative pb-[15vh]">
      <Header />
      <main className="max-w-[900px] m-auto">
        {!showResult ? (
          <InitialView />
        ) : (
          <ResultView
            recentPrompt={recentPrompt as string}
            loading={loading}
            resultData={resultData as string}
          />
        )}
      </main>
      <Footer
        input={input as string}
        setInput={setInput}
        onSent={onSent}
        handleKeyDown={handleKeyDown}
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
  <>
    <WelcomeMessage />
    <SuggestionGrid />
  </>
);

const WelcomeMessage: React.FC = () => (
  <div className="mt-12 mb-12 text-6xl text-[#c4c7c5] font-semibold p-5">
    <p>
      <span className="bg-clip-text bg-gradient-to-r from-[#4b90ff] to-[#ff5546] text-transparent">
        Hello, Dev.
      </span>
    </p>
    <p>How can I help you today?</p>
  </div>
);

const SuggestionGrid: React.FC = () => (
  <div className="grid grid-cols-4 gap-3 p-5">
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

const SuggestionCard: React.FC<{ text: string; icon: string }> = ({ text, icon }) => (
  <div className="h-[200px] p-4 bg-[#f0f4f9] rounded-xl relative cursor-pointer hover:bg-[#dfe4ea]">
    <p className="text-[#585858] text-md">{text}</p>
    <img
      className="w-9 p-1.5 absolute bg-white rounded-[20px] bottom-2.5 right-2.5"
      src={icon}
      alt=""
    />
  </div>
);

const ResultView: React.FC<{
  recentPrompt: string;
  loading: boolean;
  resultData: string;
}> = ({ recentPrompt, loading, resultData }) => (
  <div className="px-0 py-[5%] min-h-[70vh] overflow-y-hidden">
    <UserPrompt prompt={recentPrompt} />
    <GeminiResponse loading={loading} resultData={resultData} />
  </div>
);

const UserPrompt: React.FC<{ prompt: string }> = ({ prompt }) => (
  <div className="mx-10 my-0 flex items-start gap-5 mb-10">
    <img className="rounded-[50px] w-10" src={assets.user_icon} alt="User" />
    <p>{prompt}</p>
  </div>
);

const GeminiResponse: React.FC<{ loading: boolean; resultData: string }> = ({
  loading,
  resultData,
}) => (
  <div className="mx-10 my-0 flex items-start gap-5">
    <img className="rounded-[50px] w-10" src={assets.gemini_icon} alt="Gemini" />
    {loading ? (
      <div className="w-full flex-col gap-5">
        <l-grid size="100" speed="2.8" color="#61ABFF"></l-grid>
      </div>
    ) : (
      <p
        className="text-md leading-7"
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
}> = ({ input, setInput, onSent, handleKeyDown }) => (
  <footer className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[900px] px-0 py-5">
    <div className="flex items-center justify-between gap-4 bg-[#f0f4f9] px-2.5 py-2 rounded-[50px]">
      <input
        onChange={(e) => setInput(e.target.value)}
        value={input}
        className="flex-1 bg-transparent border-none outline-none p-2 text-md"
        type="text"
        placeholder="Enter a prompt here ..."
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center gap-3">
        <img className="w-5 cursor-pointer" src={assets.gallery_icon} alt="Gallery" />
        <img className="w-5 cursor-pointer" src={assets.mic_icon} alt="Mic" />
        <img
          className="w-5 cursor-pointer"
          src={assets.send_icon}
          alt="Send"
          onClick={() => onSent(input as string)}
        />
      </div>
    </div>
    <p className="text-sm mx-3 my-auto p-1 items-center text-center">
      Gemini may display inaccurate info, including about people, so
      double-check its responses. Your privacy and Gemini Apps.
    </p>
  </footer>
);

export default Main;
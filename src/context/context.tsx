import React, { createContext, useState, useCallback } from "react";
import run from "../config/gemini";

interface ContextType {
  input?: string;
  setInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  recentPrompt?: string;
  setrecentPrompt: React.Dispatch<React.SetStateAction<string | undefined>>;
  previousPrompt?: string[];
  setpreviousPrompt: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  showResult: boolean;
  setshowResult: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resultData?: string;
  setresultData: React.Dispatch<React.SetStateAction<string | undefined>>;
  onSent: (prompt: string) => Promise<void>;
  extended: boolean;
  setExtended: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Context = createContext<ContextType | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [input, setInput] = useState<string>();
  const [recentPrompt, setrecentPrompt] = useState<string>();
  const [previousPrompt, setpreviousPrompt] = useState<string[]>();
  const [showResult, setshowResult] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultData, setresultData] = useState<string>();
  const [extended, setExtended] = useState<boolean>(false);
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);

  const delayPara = useCallback((text: string) => {
    setAnimationInProgress(true);
    const words = text.split(" ");
    let currentIndex = 0;

    const animateWord = () => {
      if (currentIndex < words.length) {
        setresultData(prev => (prev || "") + words[currentIndex] + " ");
        currentIndex++;
        setTimeout(animateWord, 75);
      } else {
        setAnimationInProgress(false);
      }
    };

    animateWord();
  }, []);

  const onSent = async (prompt: string) => {
    if (animationInProgress) return;
    
    setresultData("");
    setLoading(true);
    setshowResult(true);
    setrecentPrompt(prompt);

    try {
      const response = await run(prompt);
      
      const formattedText = response.split("**").reduce((acc, curr, i) => 
        i % 2 === 1 ? acc + `<b>${curr}</b>` : acc + curr
      , "");
      
      const withLineBreaks = formattedText.split("*").join("<br/>");
      delayPara(withLineBreaks);
      setInput("");
    } catch (error) {
      console.error("Error:", error);
      setresultData("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  const contextValue: ContextType = {
    input,
    setInput,
    recentPrompt,
    setrecentPrompt,
    previousPrompt,
    setpreviousPrompt,
    showResult,
    setshowResult,
    loading,
    setLoading,
    resultData,
    setresultData,
    onSent,
    extended,
    setExtended,
  };

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};

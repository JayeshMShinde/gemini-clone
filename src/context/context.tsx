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

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [input, setInput] = useState<string>();
  const [recentPrompt, setrecentPrompt] = useState<string>();
  const [previousPrompt, setpreviousPrompt] = useState<string[]>();
  const [showResult, setshowResult] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultData, setresultData] = useState<string>();
  const [extended, setExtended] = useState<boolean>(false);
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);

  const formatMarkdownCodeBlocks = (text: string) => {
    // Split text into parts using code block markers
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language if specified
        const firstLineEnd = part.indexOf('\n');
        const firstLine = part.slice(3, firstLineEnd).trim();
        const code = part.slice(firstLineEnd + 1, -3).trim();
        
        return `<pre class="code-block ${firstLine}"><code>${code}</code></pre>`;
      }
      return part;
    }).join('');
  };

  const delayPara = useCallback((text: string) => {
    setAnimationInProgress(true);
    // Split by HTML tags to preserve them during animation
    const parts = text.split(/(<.*?>)/g);
    let currentIndex = 0;
    let buffer = '';

    const animatePart = () => {
      if (currentIndex < parts.length) {
        const part = parts[currentIndex];
        
        if (part.startsWith('<') && part.endsWith('>')) {
          // If it's an HTML tag, add it directly
          buffer += part;
        } else {
          // If it's text content, animate word by word
          const words = part.split(' ');
          const word = words[0];
          if (word) {
            buffer += word + ' ';
            parts[currentIndex] = words.slice(1).join(' ');
            if (parts[currentIndex].length === 0) {
              currentIndex++;
            }
          } else {
            currentIndex++;
          }
        }
        
        setresultData(buffer);
        setTimeout(animatePart, 75);
      } else {
        setAnimationInProgress(false);
      }
    };

    animatePart();
  }, []);

  const onSent = async (prompt: string) => {
    if (animationInProgress) return;
    
    setresultData("");
    setLoading(true);
    setshowResult(true);
    setrecentPrompt(prompt);

    try {
      const response = await run(prompt);
      
      // Process the response in order:
      // 1. Handle code blocks
      const withCodeBlocks = formatMarkdownCodeBlocks(response);
      
      // 2. Handle bold text
      const withBoldText = withCodeBlocks.split("**").reduce((acc, curr, i) => 
        i % 2 === 1 ? acc + `<b>${curr}</b>` : acc + curr
      , "");
      
      // 3. Handle line breaks
      const withLineBreaks = withBoldText.split("*").join("<br/>");
      
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
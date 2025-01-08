import React, { createContext, useState, useCallback } from "react";
import run from "../config/gemini";

interface ContextType {
  input?: string;
  setInput: React.Dispatch<React.SetStateAction<string | any>>;
  recentPrompt?: string;
  setrecentPrompt: React.Dispatch<React.SetStateAction<string | any>>;
  previousPrompt?: string[];
  setpreviousPrompt: React.Dispatch<React.SetStateAction<string[] | any>>;
  showResult: boolean;
  setshowResult: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resultData?: string;
  setresultData: React.Dispatch<React.SetStateAction<string | any>>;
  onSent: (prompt: string) => Promise<void>;
  extended: boolean;
  setExtended: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Context = createContext<ContextType | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [input, setInput] = useState<string>("");
  const [recentPrompt, setrecentPrompt] = useState<string>("");
  const [previousPrompt, setpreviousPrompt] = useState<string[]>([]);
  const [showResult, setshowResult] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultData, setresultData] = useState<string>("");
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
        
        return `<pre key="code-${index}" class="code-block ${firstLine}"><code>${code}</code></pre>`;
      }
      return part;
    }).join('');
  };

  const formatMarkdown = (text: string) => {
    if (!text) return "";

    let formattedText = text;

    // 1. Handle code blocks first
    formattedText = formatMarkdownCodeBlocks(formattedText);

    // 2. Handle bold text with numbered items
    formattedText = formattedText.replace(/\*\*(\d+\.\s*[^*]+)\*\*/g, (_, content) => {
      return `<br/><b>${content}</b><br/>`;
    });

    // 3. Handle remaining bold text
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

    // 4. Handle paragraphs and line breaks
    formattedText = formattedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('<br/><br/>');

    return formattedText;
  };

  const delayPara = useCallback((text: string) => {
    if (!text) return;
    
    setAnimationInProgress(true);
    const parts = text.split(/(<.*?>)/g);
    let currentIndex = 0;
    let buffer = '';

    const animatePart = () => {
      if (currentIndex < parts.length) {
        const part = parts[currentIndex];
        
        if (part.startsWith('<') && part.endsWith('>')) {
          buffer += part;
          currentIndex++;
        } else {
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
        requestAnimationFrame(() => setTimeout(animatePart, 75));
      } else {
        setAnimationInProgress(false);
      }
    };

    animatePart();
  }, []);

  const onSent = async (prompt: string) => {
    if (animationInProgress || !prompt.trim()) return;
    
    setresultData("");
    setLoading(true);
    setshowResult(true);
    setrecentPrompt(prompt);
    
    try {
      const response = await run(prompt);
      
      if (!response) {
        throw new Error("Empty response received");
      }
      
      const formattedResponse = formatMarkdown(response);
      delayPara(formattedResponse);
      setInput("");
      
      // Update previous prompts
      setpreviousPrompt(prev => prev ? [...prev, prompt] : [prompt]);
    } catch (error) {
      console.error("Error:", error);
      setresultData("Error processing request. Please try again.");
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

export default ContextProvider;
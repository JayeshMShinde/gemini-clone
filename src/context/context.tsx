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
    // Handle triple backtick code blocks
    return text.replace(/(```(\w*)\n([\s\S]*?)\n```)/g, (_, language, code) => {
      language = language.trim();
      return `<pre class="code-block ${language ? `language-${language}` : ''}"><code>${code}</code></pre>`;
    });
  };

  const formatMarkdown = (text: string) => {
    if (!text) return "";
  
    let formattedText = text;
  
    // 1. Handle code blocks first (preserve them from other transformations)
    formattedText = formatMarkdownCodeBlocks(formattedText);
  
    // 2. Handle headers
    formattedText = formattedText.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, content) => {
      const level = hashes.length;
      return `<h${level}>${content}</h${level}>`;
    });
  
    // 3. Handle bold text
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  
    // 4. Handle italic text
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<i>$1</i>');
  
    // 5. Handle inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
    // 6. Handle unordered lists
    formattedText = formattedText.replace(/^(\s*)-\s+(.+)$/gm, '<li>$2</li>');
  
    // 7. Handle ordered lists
    formattedText = formattedText.replace(/^(\s*)(\d+)\.\s+(.+)$/gm, (_, num, content) => {
      // Check if content is bold
      if (content.startsWith('<b>') && content.endsWith('</b>')) {
        return `<div class="list-item"><span class="number">${num}. </span>${content}</div>`;
      }
      return `<li>${content}</li>`;
    });
  
    // 8. Handle paragraphs - preserve existing HTML tags
    const paragraphs = formattedText.split('\n\n');
    formattedText = paragraphs.map(para => {
      para = para.trim();
      if (para && !para.startsWith('<')) {
        return `<p>${para}</p>`;
      }
      return para;
    }).join('\n');
  
    return formattedText;
  };

  const delayPara = useCallback((text: string) => {
    if (!text) return;
    
    setAnimationInProgress(true);
    // Split by HTML tags to preserve them during animation
    const parts = text.split(/(<[^>]+>)/g);
    let currentIndex = 0;
    let buffer = '';
  
    const animatePart = () => {
      if (currentIndex < parts.length) {
        const part = parts[currentIndex];
        buffer += part;
        currentIndex++;
        
        setresultData(buffer);
        
        if (currentIndex < parts.length) {
          setTimeout(animatePart, 15); // Slightly faster animation
        } else {
          setAnimationInProgress(false);
        }
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
      
      // Format and animate the response
      const formattedResponse = formatMarkdown(response);
      delayPara(formattedResponse);
      
      // Clear the input field
      setInput("");
      
      // Update previous prompts
      setpreviousPrompt(prev => (prev ? [...prev, prompt] : [prompt]));
    } catch (error) {
      console.error("Error:", error);
      setresultData("<p>Error processing request. Please try again.</p>");
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
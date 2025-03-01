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
  darkMode?: boolean;
  setDarkMode?: React.Dispatch<React.SetStateAction<boolean>>;
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
  
  // Add dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check user preference or system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode ? JSON.parse(savedMode) : 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Effect to apply dark mode to body
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  const formatCodeBlock = (language: string, code: string) => {
    language = language.trim();
    
    // Apply syntax highlighting based on language
    let highlightedCode = code;
    
    if (language) {
      // Simple syntax highlighting for common languages
      if (['javascript', 'typescript', 'js', 'ts'].includes(language.toLowerCase())) {
        highlightedCode = code
          // Keywords
          .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|as|async|await|try|catch|throw|new|this)\b/g, 
                   '<span class="keyword">$1</span>')
          // Strings
          .replace(/(['"`])(.*?)\1/g, '<span class="string">$1$2$1</span>')
          // Comments
          .replace(/\/\/(.*)/g, '<span class="comment">//$1</span>')
          // Numbers
          .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
      } 
      else if (['python', 'py'].includes(language.toLowerCase())) {
        highlightedCode = code
          // Keywords
          .replace(/\b(def|class|import|from|as|return|if|elif|else|for|while|in|try|except|raise|with|assert|None|True|False)\b/g, 
                   '<span class="keyword">$1</span>')
          // Strings
          .replace(/(['"])(.*?)\1/g, '<span class="string">$1$2$1</span>')
          // Comments
          .replace(/#(.*)/g, '<span class="comment">#$1</span>')
          // Numbers
          .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
      }
    }
    
    // Return code block with proper classes
    return `<div class="code-block" data-language="${language || 'code'}"><code>${highlightedCode}</code></div>`;
  };

  const formatMarkdownCodeBlocks = (text: string) => {
    // Handle triple backtick code blocks
    return text.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, language, code) => {
      return formatCodeBlock(language, code);
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
      return `<h${level} class="mt-6 mb-4 font-semibold">${content}</h${level}>`;
    });
  
    // 3. Handle bold text
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
    // 4. Handle italic text
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
    // 5. Handle inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
    // 6. Handle unordered lists
    let inList = false;
    formattedText = formattedText.replace(/^(\s*)-\s+(.+)$/gm, (_, content) => {
      if (!inList) {
        inList = true;
        return `<ul class="my-4 pl-5">\n<li class="my-2">${content}</li>`;
      }
      return `<li class="my-2">${content}</li>`;
    });
    if (inList) {
      formattedText += '\n</ul>';
      inList = false;
    }
  
    // 7. Handle ordered lists
    let inOrderedList = false;
    formattedText = formattedText.replace(/^(\s*)(\d+)\.\s+(.+)$/gm, (_,content) => {
      if (!inOrderedList) {
        inOrderedList = true;
        return `<ol class="my-4 pl-5">\n<li class="my-2">${content}</li>`;
      }
      return `<li class="my-2">${content}</li>`;
    });
    if (inOrderedList) {
      formattedText += '\n</ol>';
      inOrderedList = false;
    }
  
    // 8. Handle paragraphs - preserve existing HTML tags
    const paragraphs = formattedText.split('\n\n');
    formattedText = paragraphs.map(para => {
      para = para.trim();
      if (para && !para.startsWith('<')) {
        return `<p class="my-4 leading-relaxed">${para}</p>`;
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
      setresultData(`<p class="my-4 text-red-600 dark:text-red-400">Error processing request. Please try again.</p>`);
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
    darkMode,
    setDarkMode
  };

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
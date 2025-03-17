import React, { createContext, useState, useCallback, useEffect, useMemo } from "react";
import run from "../config/gemini";
import hljs from "highlight.js";

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

// Debounce function to limit function calls
// const debounce = (func: Function, wait: number) => {
//   let timeout: ReturnType<typeof setTimeout>;
//   return function(...args: any[]) {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// };

// Memoized formatCodeBlock function to avoid unnecessary re-rendering
const createFormatCodeBlock = () => {
  const cache = new Map<string, string>();
  
  return (language: string, code: string): string => {
    const cacheKey = `${language}:${code}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
    
    // Remove extra indentation
    const lines = code.split('\n');
    const minIndent = lines
      .filter(line => line.trim().length > 0)
      .reduce((min, line) => {
        const indent = line.match(/^\s*/)?.[0].length || 0;
        return Math.min(min, indent);
      }, Infinity) || 0;
    
    const normalizedCode = lines
      .map(line => line.substring(minIndent))
      .join('\n');
    
    language = language.trim().toLowerCase();
    
    let highlightedCode;
    try {
      if (language && hljs.getLanguage(language)) {
        highlightedCode = hljs.highlight(normalizedCode, { language }).value;
      } else {
        highlightedCode = hljs.highlightAuto(normalizedCode).value;
        language = hljs.highlightAuto(normalizedCode).language || 'text';
      }
    } catch (error) {
      console.error("Syntax highlighting error:", error);
      highlightedCode = normalizedCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    
    const result = `
      <pre class="code-block rounded-md overflow-x-auto my-4" data-language="${language || 'text'}">
        <div class="flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
          <span class="text-sm font-mono text-gray-700 dark:text-gray-300">${language || 'text'}</span>
          <button class="copy-code-btn text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" 
            onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">
            Copy
          </button>
        </div>
        <code class="hljs px-4 py-3 block">${highlightedCode}</code>
      </pre>
    `;
    
    cache.set(cacheKey, result);
    return result;
  };
};

// Worker for processing markdown (simulated with a memoized function)
const createMarkdownProcessor = () => {
  const formatCodeBlockFn = createFormatCodeBlock();
  const markdownCache = new Map<string, string>();
  
  // Process markdown code blocks
  const formatMarkdownCodeBlocks = (text: string) => {
    return text.replace(/```([\w-]*)\n([\s\S]*?)\n```/g, (_, language, code) => {
      return formatCodeBlockFn(language, code);
    });
  };

  return (text: string): string => {
    if (!text) return "";
    
    // Check cache first
    const cacheKey = text;
    if (markdownCache.has(cacheKey)) {
      return markdownCache.get(cacheKey)!;
    }
    
    // Store code blocks temporarily
    const codeBlocks: string[] = [];
    let processedText = text;
    
    // 1. Extract code blocks
    processedText = processedText.replace(/```([\w-]*)\n([\s\S]*?)\n```/g, (match) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(match);
      return placeholder;
    });
    
    // 2. Extract inline code
    const inlineCodeBlocks: string[] = [];
    processedText = processedText.replace(/`([^`]+)`/g, (match) => {
      const placeholder = `__INLINE_CODE_${inlineCodeBlocks.length}__`;
      inlineCodeBlocks.push(match);
      return placeholder;
    });
  
    // 3. Handle headers
    processedText = processedText.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, content) => {
      const level = hashes.length;
      const size = 7 - level;
      return `<h${level} class="text-${size}xl font-semibold mt-6 mb-4">${content}</h${level}>`;
    });
  
    // 4. Handle bold text
    processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');
  
    // 5. Handle italic text
    processedText = processedText.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  
    // 6. Handle paragraphs
    const paragraphs = processedText.split('\n\n');
    processedText = paragraphs.map(paragraph => {
      if (
        paragraph.includes('__CODE_BLOCK_') || 
        paragraph.includes('__INLINE_CODE_') || 
        paragraph.startsWith('<')
      ) {
        return paragraph;
      }
      return `<p class="my-4 leading-relaxed break-words">${paragraph}</p>`;
    }).join('\n');
  
    // 7. Restore code blocks
    processedText = processedText.replace(/__CODE_BLOCK_(\d+)__/g, (_match, index) => {
      const original = codeBlocks[parseInt(index)];
      const formatted = formatMarkdownCodeBlocks(original);
      return `<div class="overflow-x-auto w-full">${formatted}</div>`;
    });
    
    // 8. Restore inline code
    processedText = processedText.replace(/__INLINE_CODE_(\d+)__/g, (_match, index) => {
      const original = inlineCodeBlocks[parseInt(index)];
      return `<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-sm whitespace-normal break-all">${original.slice(1, -1)}</code>`;
    });
  
    // Cache the result
    markdownCache.set(cacheKey, processedText);
    return processedText;
  };
};

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [input, setInput] = useState<string>("");
  const [recentPrompt, setrecentPrompt] = useState<string>("");
  const [previousPrompt, setpreviousPrompt] = useState<string[]>([]);
  const [showResult, setshowResult] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultData, setresultData] = useState<string>("");
  const [extended, setExtended] = useState<boolean>(false);
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);
  
  // Add dark mode state with proper initialization
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Initialize formatMarkdown processor
  const formatMarkdown = useMemo(() => createMarkdownProcessor(), []);

  // Effect to apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Use requestAnimationFrame to batch DOM operations
    requestAnimationFrame(() => {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    });
  }, [darkMode]);
  
  // Effect to load highlight.js styles - optimized with cleanup
  useEffect(() => {
    const linkId = 'hljs-theme-link';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Set the href based on dark mode
    link.href = darkMode 
      ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css'
      : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-light.min.css';
      
    return () => {
      // No cleanup needed for link as we reuse it
    };
  }, [darkMode]);

  // Optimized text animation using requestAnimationFrame
  const delayPara = useCallback((text: string) => {
    if (!text || animationInProgress) return;
    
    setAnimationInProgress(true);
    setresultData('');
    
    // Process content once
    const processedContent = text.trim();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedContent;
    
    // Extract nodes in proper sequence
    const getNodeSequence = (element: HTMLElement) => {
      const result: Array<{type: 'tag' | 'text', content: string}> = [];
      
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && node.textContent.trim()) {
            result.push({type: 'text', content: node.textContent});
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as HTMLElement;
          const openTag = elem.outerHTML.slice(0, elem.outerHTML.indexOf(elem.innerHTML));
          result.push({type: 'tag', content: openTag});
          
          Array.from(node.childNodes).forEach(processNode);
          
          const closeTag = `</${elem.tagName.toLowerCase()}>`;
          result.push({type: 'tag', content: closeTag});
        }
      };
      
      Array.from(element.childNodes).forEach(processNode);
      return result;
    };
    
    const nodeSequence = getNodeSequence(tempDiv);
    let currentIndex = 0;
    let buffer = '';
    
    const renderNextPart = () => {
      const CHUNK_SIZE = 5; // Process multiple nodes at once for better performance
      let processedChunks = 0;
      
      while (currentIndex < nodeSequence.length && processedChunks < CHUNK_SIZE) {
        const node = nodeSequence[currentIndex];
        
        if (node.type === 'text') {
          buffer += node.content;
        } else { // tag
          buffer += node.content;
        }
        
        currentIndex++;
        processedChunks++;
      }
      
      setresultData(buffer);
      
      if (currentIndex < nodeSequence.length) {
        requestAnimationFrame(renderNextPart);
      } else {
        setAnimationInProgress(false);
        
        // Apply syntax highlighting to code blocks after animation completes
        requestAnimationFrame(() => {
          document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block as HTMLElement);
          });
        });
      }
    };
    
    requestAnimationFrame(renderNextPart);
  }, [animationInProgress]);

  // Create a debounced version of formatMarkdown
  // const debouncedFormatMarkdown = useCallback(
  //   debounce((text: string) => formatMarkdown(text), 100),
  //   [formatMarkdown]
  // );

  // Optimized API call handling
  const onSent = useCallback(async (prompt: string) => {
    if (animationInProgress || !prompt.trim()) return;
    
    setresultData("");
    setLoading(true);
    setshowResult(true);
    setrecentPrompt(prompt);
    
    try {
      // Use AbortController for request cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await run(prompt);
      clearTimeout(timeoutId);
      
      if (!response) {
        throw new Error("Empty response received");
      }
      
      // Format and animate the response
      const formattedResponse = formatMarkdown(response);
      delayPara(formattedResponse);
      
      // Update state with batched updates
      setInput("");
      setpreviousPrompt(prev => (prev ? [...prev, prompt] : [prompt]));
    } catch (error) {
      console.error("Error:", error);
      setresultData(`<p class="my-4 text-red-600 dark:text-red-400">Error processing request. Please try again.</p>`);
    } finally {
      setLoading(false);
    }
  }, [animationInProgress, formatMarkdown, delayPara]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
  }), [
    input, 
    recentPrompt, 
    previousPrompt,
    showResult,
    loading,
    resultData,
    onSent,
    extended,
    darkMode
  ]);

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
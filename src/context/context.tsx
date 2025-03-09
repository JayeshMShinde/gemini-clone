import React, { createContext, useState, useCallback, useEffect } from "react";
import run from "../config/gemini";
import hljs from "highlight.js"; // Import highlight.js for syntax highlighting

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
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  // Effect to load highlight.js styles
  useEffect(() => {
    // Load highlight.js styles dynamically based on dark mode
    const linkId = 'hljs-theme-link';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Choose a theme based on dark mode
    link.href = darkMode 
      ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css'
      : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-light.min.css';
  }, [darkMode]);
  
  // Enhanced code block formatting with syntax highlighting
  const formatCodeBlock = (language: string, code: string) => {
    // Remove extra indentation that might be present in the code
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
    
    // Apply syntax highlighting using highlight.js
    let highlightedCode;
    try {
      // Auto-detect language if not specified
      if (language && hljs.getLanguage(language)) {
        highlightedCode = hljs.highlight(normalizedCode, { language }).value;
      } else {
        highlightedCode = hljs.highlightAuto(normalizedCode).value;
        // Get the detected language
        language = hljs.highlightAuto(normalizedCode).language || 'text';
      }
    } catch (error) {
      // Fallback to escaped code if highlighting fails
      console.error("Syntax highlighting error:", error);
      highlightedCode = normalizedCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    
    // Return code block with proper classes and enhanced styling
    return `
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
  };

  // Improved markdown code block detection
  const formatMarkdownCodeBlocks = (text: string) => {
    // Fix for triple backtick code blocks
    // This pattern captures the language (if any) and the code content
    return text.replace(/```([\w-]*)\n([\s\S]*?)\n```/g, (_, language, code) => {
      return formatCodeBlock(language, code);
    });
  };

  // Completely rewritten markdown formatter
  const formatMarkdown = (text: string) => {
    if (!text) return "";
  
    // Store code blocks temporarily to prevent other formatting from affecting them
    const codeBlocks: string[] = [];
    let processedText = text;
    
    // 1. Extract and preserve code blocks first
    processedText = processedText.replace(/```([\w-]*)\n([\s\S]*?)\n```/g, (match) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(match);
      return placeholder;
    });
    
    // 2. Extract and preserve inline code
    const inlineCodeBlocks: string[] = [];
    processedText = processedText.replace(/`([^`]+)`/g, (match) => {
      const placeholder = `__INLINE_CODE_${inlineCodeBlocks.length}__`;
      inlineCodeBlocks.push(match);
      return placeholder;
    });
  
    // 3. Handle headers - must be at start of line
    processedText = processedText.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, content) => {
      const level = hashes.length;
      const size = 7 - level; // h1 is largest, h6 is smallest
      return `<h${level} class="text-${size}xl font-semibold mt-6 mb-4">${content}</h${level}>`;
    });
  
    // 4. Handle bold text
    processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');
  
    // 5. Handle italic text
    processedText = processedText.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  
    // 6. Handle paragraphs and line breaks better
    processedText = processedText
      .split('\n\n')
      .map(paragraph => {
        // Skip paragraphs that are placeholders or already HTML
        if (
          paragraph.includes('__CODE_BLOCK_') || 
          paragraph.includes('__INLINE_CODE_') || 
          paragraph.startsWith('<')
        ) {
          return paragraph;
        }
        
        // For normal text paragraphs
        return `<p class="my-4 leading-relaxed break-words">${paragraph}</p>`;
      })
      .join('\n');
  
    // 7. Restore code blocks with proper width control
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
  
    return processedText;
  };

  // Fixed delayPara function to avoid displaying unwanted text at the start
  const delayPara = useCallback((text: string) => {
    if (!text) return;
    
    setAnimationInProgress(true);
    
    // First, process the entire content at once to get properly formatted HTML
    const processedContent = text.trim();
    
    // Then create a temporary DOM element to properly parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedContent;
    
    // Extract all text nodes and HTML tags in proper sequence
    const nodes: Node[] = [];
    const walkNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent && node.textContent.trim()) {
          nodes.push(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // For element nodes, push the opening tag
        const element = node as Element;
        const clone = element.cloneNode(false) as Element;
        clone.innerHTML = '';
        nodes.push(clone);
        
        // Process all child nodes
        Array.from(node.childNodes).forEach(walkNodes);
        
        // Push a closing marker node (we'll reconstruct the closing tag later)
        const closingMarker = document.createTextNode(`__CLOSING_TAG_${element.tagName.toLowerCase()}__`);
        nodes.push(closingMarker);
      }
    };
    
    Array.from(tempDiv.childNodes).forEach(walkNodes);
    
    // Now animate through these nodes sequentially
    let currentIndex = 0;
    let buffer = '';
    let openTags: string[] = [];
    
    const animatePart = () => {
      if (currentIndex < nodes.length) {
        const node = nodes[currentIndex];
        
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          if (text.startsWith('__CLOSING_TAG_')) {
            // This is our marker for a closing tag
            const tagName = text.replace('__CLOSING_TAG_', '').replace('__', '');
            buffer += `</${tagName}>`;
            
            // Remove the last open tag
            if (openTags.length > 0) {
              openTags.pop();
            }
          } else {
            // Regular text node, animate character by character for text
            buffer += text;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // For element nodes, add the entire opening tag at once
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();
          
          // Create an opening tag with all attributes
          let openingTag = `<${tagName}`;
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            openingTag += ` ${attr.name}="${attr.value}"`;
          }
          openingTag += '>';
          
          buffer += openingTag;
          
          // Keep track of open tags for proper nesting
          openTags.push(tagName);
          
          // For self-closing tags, we need to make sure we don't expect a closing tag
          if (tagName === 'br' || tagName === 'hr' || tagName === 'img' || tagName === 'input') {
            openTags.pop();
          }
        }
        
        setresultData(buffer);
        currentIndex++;
        
        // Continue animation
        setTimeout(animatePart, 15);
      } else {
        // Animation complete
        setAnimationInProgress(false);
        
        // Apply syntax highlighting to code blocks
        setTimeout(() => {
          if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach(block => {
              hljs.highlightElement(block as HTMLElement);
            });
          }
        }, 100);
      }
    };
    
    // Start the animation
    setresultData('');
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
import React, { createContext, useState } from "react";
import run from "../config/gemini"; // Adjust the import based on your file structure

// Define the type for the context
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

// Create the context with a default undefined value
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

  const delayPara = (index: number, nextWord: string) => {
    setTimeout(function () {
      setresultData((prev) => prev + nextWord);
    }, 75 * index);
  };
  const onSent = async (prompt: string) => {
    setresultData("");
    setLoading(true);
    setshowResult(true);
    setrecentPrompt(prompt);
    setpreviousPrompt((prev: any) => {
      if (!prev) prev = [];
      return [...prev, input];
    });

    try {
      const response = await run(prompt); // Make sure 'run' is properly defined in your gemini config
      let responseArray = response.split("**");
      let newResponse: any = "";
      for (let i = 0; i < responseArray.length; i++) {
        if (i == 0 || i % 2 !== 1) {
          newResponse += responseArray[i];
        } else {
          newResponse += "<b>" + responseArray[i] + "</b>";
        }
      }
      let newResponse2 = newResponse.split("*").join("<br/>");
      let newResponseArray = newResponse2.split(" ");
      for (let i = 0; i < newResponseArray.length; i++) {
        delayPara(i, newResponseArray[i] + " ");
      }
      setresultData(newResponse2);
      setLoading(false);
      setInput("");
    } catch (error) {
      console.error("Error fetching response:", error);
      setresultData("There was an error processing your request.");
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

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

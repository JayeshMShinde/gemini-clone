
export const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY

// HarmCategory,
// HarmBlockThreshold,
import {
    GoogleGenerativeAI,
    GenerativeModel,
    GenerationConfig,
    ChatSession,
  } from "@google/generative-ai";
  
  const apiKey = geminiApiKey;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model: GenerativeModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig: GenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function run(prompt: string) {
    const chatSession: ChatSession = model.startChat({
      generationConfig,
      // safetySettings: Adjust safety settings
      // See https://ai.google.dev/gemini-api/docs/safety-settings
      history: [],
    });
  
    const result = await chatSession.sendMessage(prompt);
    console.log(result.response.text());
    return result.response.text()
  }
  
  export default run;
  
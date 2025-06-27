import { GoogleGenAI, Chat, GenerateContentResponse, GenerateContentParameters, Part, Content, GroundingChunk } from "@google/genai";
import { SprintPhase } from "../types";

const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;
let currentChatInstance: Chat | null = null;

export const initializeGemini = (): boolean => {
  if (!API_KEY) {
    console.error("API_KEY is not set in environment variables. Gemini service cannot be initialized.");
    // In a real app, you might want to throw an error or handle this more gracefully UI-wise
    return false;
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return true;
};

const getAiInstance = (): GoogleGenAI => {
    if (!ai) {
        if (!initializeGemini()) {
            throw new Error("Gemini AI could not be initialized. API_KEY missing or invalid.");
        }
    }
    return ai!; // ai will be non-null here due to the check above
}

export const startNewChat = async (systemInstruction: string, history?: Content[]): Promise<Chat> => {
  const currentAi = getAiInstance();
  currentChatInstance = currentAi.chats.create({
    model: 'gemini-2.5-flash-preview-04-17',
    config: {
      systemInstruction: systemInstruction,
    },
    history: history || [],
  });
  return currentChatInstance;
};

export const sendMessageToChat = async (chat: Chat, message: string | Part[]): Promise<GenerateContentResponse> => {
  getAiInstance(); // Ensures AI is initialized
  const result = await chat.sendMessage({ message });
  return result;
};

export const generateText = async (prompt: string, systemInstruction?: string, useGoogleSearch: boolean = false): Promise<GenerateContentResponse> => {
  const currentAi = getAiInstance();
  const model = 'gemini-2.5-flash-preview-04-17';
  
  const config: Partial<GenerateContentParameters['config']> = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  if (useGoogleSearch) {
    config.tools = [{googleSearch: {}}];
  } else {
    // Only set responseMimeType if not using Google Search
    // Let's use markdown by default unless JSON is explicitly needed
    // config.responseMimeType = "application/json"; 
  }

  // Disable thinking for potentially faster, lower latency, useful for some tasks.
  // For creative tasks like ideation, default thinking (enabled) is often better.
  // config.thinkingConfig = { thinkingBudget: 0 };


  const response = await currentAi.models.generateContent({
    model: model,
    contents: prompt,
    config: config,
  });
  return response;
};

export const generateImage = async (prompt: string): Promise<string> => { // Returns base64 string
  const currentAi = getAiInstance();
  try {
    const response = await currentAi.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      console.error("Image generation response:", response);
      throw new Error("Image generation failed or returned no images.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const generateSummary = async (content: string, phase: SprintPhase): Promise<string> => {
  const currentAi = getAiInstance();
  const model = 'gemini-2.5-flash-preview-04-17';
  
  const prompt = `Based on the provided content from the "${phase}" phase of a design sprint, create a concise summary. This summary should capture the key outcomes, decisions, and insights, making it suitable as a context-setter for the next sprint phase. Distill the information into a clear, actionable paragraph.

---
CONTENT TO SUMMARIZE:
${content}
---

CONCISE SUMMARY:`;

  try {
    const response = await currentAi.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
      console.error("Error generating summary:", error);
      throw new Error("Failed to generate summary from AI.");
  }
};

export const extractJsonFromString = (text: string): any | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // console.warn("Failed to parse JSON from response:", e, "\nRaw text:", text);
    return null;
  }
};

export const extractMarkdownListItems = (text: string): string[] => {
    const lines = text.split('\n');
    const listItems = lines
      .map(line => line.trim())
      .filter(line => line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line))
      .map(line => line.replace(/^[-*]\s*|^\d+\.\s*/, '').trim())
      .filter(item => item.length > 0);
    return listItems;
};

export const getCurrentChatInstance = (): Chat | null => {
  return currentChatInstance;
};

export const resetChat = () => {
    currentChatInstance = null;
};
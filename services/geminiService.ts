
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are 'Aria', the dedicated luxury jewelry concierge for Vroica. 
Vroica is a premium jewelry brand inspired by heritage and modern elegance (similar to Tanishq).
Your tone should be sophisticated, warm, helpful, and polite. 
You assist customers in choosing jewelry for occasions (weddings, gifts, daily wear).
You can explain diamond clarity (4Cs), gold purity (18k vs 22k vs 24k), and care instructions.
Do not invent specific product prices unless they are general estimates for the market.
Keep responses concise but elegant.
If asked about a specific product from our catalogue, assume we have it in stock.
`;



export const sendMessageToGemini = async (message: string) => {
  // Always use process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  return ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: message,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      // Setting thinkingBudget to 0 for lower latency in conversational AI.
      thinkingConfig: { thinkingBudget: 0 }
    },
  });
};
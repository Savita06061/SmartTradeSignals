
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { AnalysisInput } from "../types";

export const analyzeTrade = async (input: AnalysisInput) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const currentTime = new Date().toLocaleString();
  
  const prompt = `
    CURRENT TIME: ${currentTime}
    ASSET: ${input.symbol}/USDT
    TIMEFRAME: ${input.timeframe}
    LANGUAGE: ${input.language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}
    
    INSTRUCTIONS:
    1. Search for the absolute latest price and 1h/4h candle behavior.
    2. Check BTC status (is it pushing $90k or rejecting?).
    3. Analyze RSI and Volume for ${input.symbol}.
    4. Give a definitive FINAL ACTION.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    return {
      text: response.text || "Analysis failed.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

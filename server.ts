import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "./constants";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for trade analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { symbol, timeframe, language } = req.body;
      if (!symbol || !timeframe) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Check both GEMINI_API_KEY and general API_KEY (just in case)
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Gemini API key is not configured. Please locate settings on the portal to supply your GEMINI_API_KEY." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const currentTime = new Date().toLocaleString();
      const prompt = `
        CURRENT TIME: ${currentTime}
        ASSET: ${symbol}/USDT
        TIMEFRAME: ${timeframe}
        LANGUAGE: ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}
        
        INSTRUCTIONS:
        1. Search for the absolute latest price and 1h/4h candle behavior.
        2. Check BTC status (is it pushing $90k or rejecting?).
        3. Analyze RSI and Volume for ${symbol}.
        4. Give a definitive FINAL ACTION.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.1,
        },
      });

      res.json({
        text: response.text || "Analysis failed.",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      });
    } catch (error: any) {
      console.error("Gemini API Error on Server:", error);
      res.status(500).json({ error: error.message || "Failed to analyze trade." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

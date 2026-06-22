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
      
      // Fetch precise real-world spot price to ground Gemini's context
      let livePriceStr = "unobtainable";
      try {
        const binanceSymbol = symbol === 'PEPE' ? 'PEPEUSDT' : `${symbol}USDT`;
        const pRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`);
        if (pRes.ok) {
          const tick = await pRes.json() as { symbol: string; price: string };
          if (tick && tick.price) {
            livePriceStr = `${parseFloat(tick.price).toLocaleString()} USDT`;
          }
        }
      } catch (err) {
        console.warn("Could not fetch spot price for Gemini context:", err);
      }

      const prompt = `
        CURRENT TIME: ${currentTime}
        ASSET: ${symbol}/USDT
        PRECISE SPOT PRICE RIGHT NOW: ${livePriceStr}
        TIMEFRAME: ${timeframe}
        LANGUAGE: ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}
        
        INSTRUCTIONS:
        1. Search for the absolute latest price and 1h/4h candle behavior. Verify against the PRECISE SPOT PRICE: ${livePriceStr}.
        2. Check BTC status (is it pushing new highs or consolidating?).
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

  // API endpoint to fetch genuine real-time crypto prices
  app.get("/api/prices", async (req, res) => {
    try {
      const fetchResponse = await fetch("https://api.binance.com/api/v3/ticker/price");
      if (!fetchResponse.ok) {
        throw new Error(`Binance endpoint invalid status: ${fetchResponse.status}`);
      }
      const tickers = await fetchResponse.json() as { symbol: string; price: string }[];
      const pricesMap: Record<string, number> = {};

      tickers.forEach((ticker) => {
        if (ticker.symbol.endsWith("USDT")) {
          const symbol = ticker.symbol.slice(0, -4);
          pricesMap[symbol] = parseFloat(ticker.price);
        }
      });

      res.json(pricesMap);
    } catch (err: any) {
      console.warn("Binance price connection failed, fallback to CoinGecko simple prices...", err.message);
      try {
        const cgResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,the-open-network,avalanche-2,tron,sui,starknet,near,optimism,arbitrum,celestia,chainlink,pepe&vs_currencies=usd"
        );
        if (cgResponse.ok) {
          const data = await cgResponse.json() as any;
          const cgMapping: Record<string, string> = {
            bitcoin: "BTC",
            ethereum: "ETH",
            binancecoin: "BNB",
            solana: "SOL",
            ripple: "XRP",
            cardano: "ADA",
            dogecoin: "DOGE",
            "the-open-network": "TON",
            "avalanche-2": "AVAX",
            tron: "TRX",
            sui: "SUI",
            starknet: "STRK",
            near: "NEAR",
            optimism: "OP",
            arbitrum: "ARB",
            celestia: "TIA",
            chainlink: "LINK",
            pepe: "PEPE"
          };
          const pricesMap: Record<string, number> = {};
          Object.keys(data).forEach((cgId) => {
            const sym = cgMapping[cgId];
            if (sym) {
              pricesMap[sym] = data[cgId].usd;
            }
          });
          return res.json(pricesMap);
        }
      } catch (cgErr: any) {
        console.error("CoinGecko price connection failed too:", cgErr.message);
      }
      res.json({});
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

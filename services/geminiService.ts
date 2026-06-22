import { AnalysisInput } from "../types";

export const analyzeTrade = async (input: AnalysisInput) => {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      symbol: input.symbol,
      timeframe: input.timeframe,
      language: input.language,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  const data = await response.json();
  return {
    text: data.text,
    sources: data.sources || [],
  };
};

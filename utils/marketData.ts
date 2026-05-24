// Market baseline values for real-time tickers and charting
export interface TokenConfig {
  symbol: string;
  name: string;
  basePrice: number;
  decimals: number;
}

export const TOKEN_CONFIGS: Record<string, TokenConfig> = {
  BTC: { symbol: 'BTC', name: 'Bitcoin', basePrice: 94250, decimals: 2 },
  ETH: { symbol: 'ETH', name: 'Ethereum', basePrice: 3450, decimals: 2 },
  BNB: { symbol: 'BNB', name: 'BNB', basePrice: 590, decimals: 1 },
  SOL: { symbol: 'SOL', name: 'Solana', basePrice: 152.40, decimals: 2 },
  XRP: { symbol: 'XRP', name: 'Ripple', basePrice: 1.18, decimals: 4 },
  ADA: { symbol: 'ADA', name: 'Cardano', basePrice: 0.65, decimals: 4 },
  DOGE: { symbol: 'DOGE', name: 'Dogecoin', basePrice: 0.385, decimals: 4 },
  TON: { symbol: 'TON', name: 'Toncoin', basePrice: 5.45, decimals: 3 },
  AVAX: { symbol: 'AVAX', name: 'Avalanche', basePrice: 29.80, decimals: 2 },
  TRX: { symbol: 'TRX', name: 'TRON', basePrice: 0.198, decimals: 4 },
  SUI: { symbol: 'SUI', name: 'Sui', basePrice: 1.92, decimals: 4 },
  STRK: { symbol: 'STRK', name: 'Starknet', basePrice: 0.72, decimals: 4 },
  NEAR: { symbol: 'NEAR', name: 'Near Protocol', basePrice: 4.65, decimals: 3 },
  OP: { symbol: 'OP', name: 'Optimism', basePrice: 2.10, decimals: 3 },
  ARB: { symbol: 'ARB', name: 'Arbitrum', basePrice: 1.15, decimals: 4 },
  TIA: { symbol: 'TIA', name: 'Celestia', basePrice: 5.12, decimals: 3 },
  LINK: { symbol: 'LINK', name: 'Chainlink', basePrice: 17.20, decimals: 2 },
  PEPE: { symbol: 'PEPE', name: 'Pepe', basePrice: 0.00000885, decimals: 9 }
};

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi: number;
  macd: number;
}

// Generates simulated historical data for a specific asset and trend bias
export const generateChartData = (
  symbol: string, 
  pointsCount = 30, 
  bias: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL'
): ChartDataPoint[] => {
  const config = TOKEN_CONFIGS[symbol] || { symbol, name: symbol, basePrice: 100, decimals: 2 };
  const base = config.basePrice;
  const list: ChartDataPoint[] = [];
  
  let currentPrice = base * 0.95; // start lower
  const trendCoefficient = bias === 'LONG' ? 0.003 : bias === 'SHORT' ? -0.003 : 0.0002;
  
  const now = new Date();
  
  for (let i = 0; i < pointsCount; i++) {
    const timePast = new Date(now.getTime() - (pointsCount - i) * 15 * 60 * 1000);
    const timeStr = timePast.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Random walk with trend bias
    const changePercent = (Math.random() - 0.48 + trendCoefficient) * 0.02;
    const open = currentPrice;
    const close = currentPrice * (1 + changePercent);
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low = Math.min(open, close) * (1 - Math.random() * 0.008);
    const volume = Math.round(1000 + Math.random() * 9000 * (base > 10000 ? 0.1 : 10));
    
    // Simulated RSI value around trend lines
    const rsiBase = bias === 'LONG' ? 62 : bias === 'SHORT' ? 38 : 50;
    const rsi = Math.max(15, Math.min(85, rsiBase + (Math.random() - 0.5) * 18));
    
    // Simulated MACD
    const macd = (close - open) * 1.5 + (Math.random() - 0.5) * (base * 0.002);

    list.push({
      time: timeStr,
      open: Number(open.toFixed(config.decimals)),
      high: Number(high.toFixed(config.decimals)),
      low: Number(low.toFixed(config.decimals)),
      close: Number(close.toFixed(config.decimals)),
      volume,
      rsi: Math.round(rsi),
      macd: Number(macd.toFixed(config.decimals))
    });
    
    currentPrice = close;
  }
  
  return list;
};

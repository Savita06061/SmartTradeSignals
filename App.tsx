import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Globe2, 
  Clock, 
  Activity, 
  Flame, 
  HelpCircle,
  Network,
  Cpu,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Info
} from 'lucide-react';
import TradingForm from './components/TradingForm';
import AnalysisResult from './components/AnalysisResult';
import { AnalysisInput, Language } from './types';
import { analyzeTrade } from './services/geminiService';
import { TOKEN_CONFIGS } from './utils/marketData';

// Top list of ticker tape cryptos
const TAPE_CRYPTOS = ['BTC', 'ETH', 'SOL', 'BNB', 'SUI', 'STRK', 'LTC', 'XRP'];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  
  // Terminal system clock state
  const [utcTime, setUtcTime] = useState<string>('');
  const [sessionName, setSessionName] = useState<string>('Asia');

  // Realistic mock pricing tape changes
  const [tapePrices, setTapePrices] = useState<Record<string, { price: number; change: number }>>({});

  // Loading stepper index
  const [loadingStep, setLoadingStep] = useState<number>(0);

  // Initialize tape prices
  useEffect(() => {
    const prices: Record<string, { price: number; change: number }> = {};
    TAPE_CRYPTOS.forEach((symbol) => {
      const config = TOKEN_CONFIGS[symbol] || { basePrice: 100 };
      prices[symbol] = {
        price: config.basePrice,
        change: Number(((Math.random() - 0.4) * 6).toFixed(2)) // random 24h change
      };
    });
    setTapePrices(prices);
  }, []);

  // Update clock & tickers
  useEffect(() => {
    const updateTimeAndTickers = () => {
      // 1. Time Calculations
      const d = new Date();
      setUtcTime(d.toUTCString().replace('GMT', 'UTC'));
      
      const hours = d.getUTCHours();
      if (hours >= 1 && hours < 8) {
        setSessionName('Tokyo / Asia Open');
      } else if (hours >= 8 && hours < 13) {
        setSessionName('London / Europe Open');
      } else if (hours >= 13 && hours < 21) {
        setSessionName('New York / US Active');
      } else {
        setSessionName('Global Market Overlap');
      }

      // 2. Tickers fluctuation
      setTapePrices((prev) => {
        const next = { ...prev };
        const symbolsToUpdate = Object.keys(next);
        if (symbolsToUpdate.length > 0) {
          // Select a random symbol to tick-fluctuate
          const randomSymbol = symbolsToUpdate[Math.floor(Math.random() * symbolsToUpdate.length)];
          const currentItem = next[randomSymbol];
          if (currentItem) {
            const variance = (Math.random() - 0.5) * 0.002; // very small changes
            const originalPrice = TOKEN_CONFIGS[randomSymbol]?.basePrice || currentItem.price;
            const updatedPrice = currentItem.price * (1 + variance);
            const calculatedChange = ((updatedPrice - originalPrice) / originalPrice) * 100 + currentItem.change;

            next[randomSymbol] = {
              price: updatedPrice,
              change: Number(calculatedChange.toFixed(2))
            };
          }
        }
        return next;
      });
    };

    updateTimeAndTickers();
    const clockInterval = setInterval(updateTimeAndTickers, 1500);
    return () => clearInterval(clockInterval);
  }, []);

  // Handle Loading step simulator
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : 0));
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async (input: AnalysisInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeTrade(input);
      setResult(data);
    } catch (err) {
      setError(language === 'hi' 
        ? "मार्केट डेटा प्राप्त करने में विफल। कृपया पुनः प्रयास करें और सुनिश्चित करें कि आपका जेमिनी एपीआई की सक्रिय है।" 
        : "Failed to compile market data. Please verify your Gemini connection and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadingSteps = language === 'hi' ? [
    'रीयल-टाइम न्यूज एवं मार्केट सेंटीमेंट एकत्रित किया जा रहा है...',
    'RSI, MACD एवं मूविंग एवरेज क्लस्टर की गणना की जा रही है...',
    'एक्सचेंज ऑर्डर बुक डेप्थ और लिक्विडिटी मैप किया जा रहा है...',
    'ए2जेड क्वांटम सिग्नल और जोखिम अनुपात को समेकित किया जा रहा है...'
  ] : [
    'Retrieving real-time news & global market sentiment...',
    'Calculating RSI, MACD, and exponential moving average indicators...',
    'Analyzing order books density & liquidity sweep arrays...',
    'Synthesizing final A2Z actionable signal & target SL/TP guidelines...'
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] antialiased selection:bg-amber-400 selection:text-black">
      
      {/* 1. TOP PREMIUM TICKER TAPE BAR */}
      <div className="w-full bg-[#0a0d14] border-b border-slate-800/60 overflow-hidden py-2 px-4 shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 overflow-x-auto no-scrollbar scroll-smooth">
          
          {/* Ticker Tape */}
          <div className="flex items-center gap-6 divide-x divide-slate-800/80 pr-4">
            {TAPE_CRYPTOS.map((symbol) => {
              const data = tapePrices[symbol];
              const isPositive = data ? data.change >= 0 : true;
              return (
                <div key={symbol} className="flex items-center gap-2 pl-6 first:pl-2 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{symbol}</span>
                  <span className="text-[10px] font-extrabold text-slate-100 font-mono">
                    ${data ? data.price.toLocaleString(undefined, { maximumFractionDigits: symbol === 'PEPE' ? 8 : 2 }) : '---'}
                  </span>
                  <span className={`text-[9px] font-black font-mono flex items-center ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}{data ? data.change : '0.00'}%
                    {isPositive ? <TrendingUp className="w-2.5 h-2.5 ml-0.5" /> : <TrendingDown className="w-2.5 h-2.5 ml-0.5" />}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Info & Translation */}
          <div className="flex items-center gap-4 shrink-0 font-mono">
            
            {/* Clock */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#0f141c] border border-slate-800 rounded-lg text-slate-400 text-[10px] uppercase">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{utcTime || 'SYS REBOOT'}</span>
            </div>

            {/* Language Selection Widgets */}
            <div className="flex bg-[#0f141c] rounded-lg p-0.5 border border-slate-800/95 shadow-lg select-none">
              <button 
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 text-[9px] font-black rounded-md transition-all uppercase tracking-wide cursor-pointer ${
                  language === 'hi' 
                    ? 'bg-amber-400 text-black font-extrabold' 
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                HINDI
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-[9px] font-black rounded-md transition-all uppercase tracking-wide cursor-pointer ${
                  language === 'en' 
                    ? 'bg-amber-400 text-black font-extrabold' 
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                ENGLISH
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. PRIMARY NAV TERMINAL BAR */}
      <nav className="border-b border-slate-800/80 bg-[#07090e]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tighter text-white leading-none">
                  A2Z <span className="text-amber-400">QUANT</span>
                </h1>
                <span className="text-[8px] font-extrabold bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-400/20 font-mono uppercase tracking-widest">PRO ENGINE</span>
              </div>
              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-[0.3em] mt-1 font-mono">Autonomous Decision System v4.1</p>
            </div>
          </div>

          {/* Network Status indicators */}
          <div className="flex items-center gap-6 font-mono text-[10px]">
            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <span className="flex items-center gap-1.5 text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest leading-none">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                SYSTEM SECURED
              </span>
              <span className="text-slate-500 text-[9px] mt-0.5 uppercase tracking-wider">{sessionName}</span>
            </div>
          </div>

        </div>
      </nav>

      {/* 3. MAIN TERMINAL DASHBOARD CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* Intro Tapes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* LEFT WIDGET COLUMN: INPUT AND SELECTION */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Trading Form wrap */}
            <TradingForm onAnalyze={handleAnalyze} isLoading={loading} language={language} />

            {/* Side Static Helper Cards */}
            <div className="bg-[#0f141c]/50 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2.5">
                <Network className="w-4 h-4 text-amber-500" />
                <span>Engine Methodology</span>
              </div>
              
              <ul className="space-y-3.5 text-xs text-slate-400 leading-relaxed font-mono">
                <li className="flex gap-2.5 items-start">
                  <span className="text-amber-400 font-bold">1.</span>
                  <span><strong>Multi-Interval Crawl:</strong> Analyzes trend direction over 1-day range dynamically.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-amber-400 font-bold">2.</span>
                  <span><strong>Sentiment Integration:</strong> Searches live news, liquidations, and major volatility drivers.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-amber-400 font-bold">3.</span>
                  <span><strong>Grounded Calculations:</strong> Validates decisions via Google active web search queries.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* RIGHT VIEW COLUMN: RESULTS OR INTROS */}
          <div className="lg:col-span-8">
            {loading ? (
              
              /* GLOWING HIGH PROFILE LOADER */
              <div className="flex flex-col items-center justify-center py-28 bg-[#0f141c]/80 rounded-2xl border border-slate-800/80 relative overflow-hidden backdrop-blur-md shadow-2xl min-h-[460px]">
                
                {/* Spinning Scanner */}
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-amber-400 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border border-dashed border-slate-700 animate-pulse flex items-center justify-center text-amber-400">
                    <Cpu className="w-8 h-8 animate-bounce text-amber-400" />
                  </div>
                </div>

                <h3 className="text-lg font-black uppercase tracking-[0.2em] text-white">Quantum Processing</h3>
                <p className="text-xs text-amber-400 font-mono tracking-widest mt-1.5 uppercase">Analyzing Selected Vector</p>
                
                {/* Simulated stepper log */}
                <div className="mt-8 space-y-2 w-full max-w-sm px-4">
                  <div className="h-1 bg-[#07090e] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                      style={{ width: `${(loadingStep + 1) * 25}%` }}
                    ></div>
                  </div>
                  
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/40 text-center">
                    <p className="text-[10px] text-slate-300 font-mono tracking-normal transition-all duration-300 animate-pulse flex items-center justify-center gap-1.5">
                      <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                      {loadingSteps[loadingStep]}
                    </p>
                  </div>
                </div>
              </div>

            ) : error ? (
              
              /* HIGH TECH ERROR COMPONENT */
              <div className="bg-rose-500/5 border border-rose-500/25 p-12 rounded-2xl text-center relative overflow-hidden shadow-2xl min-h-[430px] flex flex-col justify-center items-center">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6 shadow-inner">
                  <Info className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white mb-2 uppercase tracking-widest">Processing Terminated</h3>
                <p className="text-slate-400 text-xs max-w-md leading-relaxed mb-8">{error}</p>
                <button 
                  onClick={() => setError(null)} 
                  className="px-8 py-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl font-bold uppercase tracking-widest hover:text-white transition-all transform active:scale-95 text-xs outline-none focus:outline-none"
                >
                  Clear Terminal
                </button>
              </div>

            ) : result ? (
              
              /* FULLY LOADED RESPONSE BLOCK */
              <AnalysisResult content={result.text} sources={result.sources} />

            ) : (
              
              /* INTRO Terminal Ready view */
              <div className="flex flex-col items-center justify-center py-28 bg-[#0f141c]/25 rounded-2xl border-2 border-dashed border-slate-800/90 text-slate-400 text-center relative overflow-hidden min-h-[460px]">
                <div className="absolute -inset-x-20 -inset-y-20 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>
                
                <div className="p-4 bg-slate-900/40 rounded-full border border-slate-800/80 mb-6 text-slate-500">
                  <Bot className="w-10 h-10 animate-pulse text-amber-500/70" />
                </div>
                
                <h3 className="text-sm font-bold uppercase text-slate-300 tracking-[0.25em]">Ready for Verification</h3>
                <p className="text-xs mt-2 text-slate-500 uppercase tracking-widest max-w-sm leading-relaxed">
                  Select a digital asset token and analysis interval. Launch trade matrix computation block.
                </p>

                {/* Micro stats banner */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 px-6 max-w-lg w-full text-left font-mono">
                  <div className="p-2.5 bg-[#0e131b]/60 border border-slate-800/60 rounded-xl">
                    <span className="text-[8px] text-slate-600 block uppercase font-bold tracking-wider">Tick Feed</span>
                    <span className="text-[10px] text-emerald-400 font-extrabold font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      ACTIVE
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#0e131b]/60 border border-slate-800/60 rounded-xl">
                    <span className="text-[8px] text-slate-600 block uppercase font-bold tracking-wider">Model Range</span>
                    <span className="text-[10px] text-slate-300 font-semibold block mt-0.5">3-Pro</span>
                  </div>
                  <div className="p-2.5 bg-[#0e131b]/60 border border-slate-800/60 rounded-xl">
                    <span className="text-[8px] text-slate-600 block uppercase font-bold tracking-wider">Languages</span>
                    <span className="text-[10px] text-slate-300 font-semibold block mt-0.5">EN / HI</span>
                  </div>
                  <div className="p-2.5 bg-[#0e131b]/60 border border-slate-800/60 rounded-xl">
                    <span className="text-[8px] text-slate-600 block uppercase font-bold tracking-wider">Precision</span>
                    <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">High Ratio</span>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </main>

      {/* 4. TERMINAL PROFESSIONAL FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#06080c] py-12 mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.25em] font-mono">Advanced Institutional Quant Decision Engine</p>
          </div>
          <p className="text-[10px] text-slate-600 max-w-4xl mx-auto leading-relaxed italic">
            Disclaimer: AI Quant Decision calculations provide model-based probability guides derived from web sources and prompt signals. Cryptocurrency trading involves substantial market risk. Real trades are user responsibility. Always set strict risk management boundaries.
          </p>
        </div>
      </footer>

      {/* Embedded generic styles for scrollbar removal */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default App;

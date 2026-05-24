import React, { useEffect, useState } from 'react';
import { 
  Bot, 
  Settings2, 
  Zap, 
  Clock, 
  ChevronDown, 
  Globe, 
  ShieldAlert,
  Gauge,
  Loader2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { AnalysisInput, Timeframe, Language } from '../types';
import { TOP_CRYPTOS, TIMEFRAMES } from '../constants';
import { TOKEN_CONFIGS } from '../utils/marketData';

interface TradingFormProps {
  onAnalyze: (input: AnalysisInput) => void;
  isLoading: boolean;
  language: Language;
  livePrice: number;
  priceDirection: 'up' | 'down' | 'neutral';
  activeMultiplier: number;
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const TradingForm: React.FC<TradingFormProps> = ({ 
  onAnalyze, 
  isLoading, 
  language,
  livePrice,
  priceDirection,
  activeMultiplier,
  selectedSymbol,
  onSymbolChange
}) => {
  const [formData, setFormData] = useState({
    symbol: selectedSymbol,
    timeframe: Timeframe.H1,
  });

  useEffect(() => {
    setFormData(p => ({ ...p, symbol: selectedSymbol }));
  }, [selectedSymbol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({ ...formData, language });
  };

  const currentToken = TOKEN_CONFIGS[formData.symbol] || { name: 'Crypto asset', decimals: 2 };

  const t = {
    en: {
      select: "Select Digital Asset",
      time: "Analysis Depth / Interval",
      btn: "Launch Quantum Scan",
      loading: "Scanning Quantum Matrices...",
      desc: "Instant live multi-vector calculation (Search Grounding Enabled).",
      livePrice: "Estimated Live Price",
      stat1: "Grounding",
      stat2: "Priority",
      stateActive: "Engine ON",
      stateUltra: "Tier-1 API"
    },
    hi: {
      select: "क्रिप्टो परिसंपत्ति चुनें",
      time: "विश्लेषण अंतराल",
      btn: "क्वांटम स्कैन शुरू करें",
      loading: "मेट्रिक्स स्कैन हो रहे हैं...",
      desc: "लाइव मल्टी-वेक्टर विश्लेषण (गूगल सर्च ग्राउंडिंग सक्षम)।",
      livePrice: "संभावित लाइव मूल्य",
      stat1: "सर्च एंकर",
      stat2: "स्पीड",
      stateActive: "गतिमान",
      stateUltra: "सक्षम"
    }
  }[language];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Outer Card Wrapper */}
      <div className="bg-[#0f141c]/90 border border-slate-800/80 p-6 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-md">
        
        {/* Glow Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">A2Z Quant Analyzer</p>
              <h3 className="text-xs font-semibold text-white">Scanner Engine</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">{t.stateActive}</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="space-y-5">
          
          {/* Asset Selection */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2.5">
              {t.select}
            </label>
            <div className="relative">
              <select 
                value={formData.symbol} 
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(p => ({...p, symbol: val}));
                  onSymbolChange(val);
                }}
                className="w-full bg-[#0a0d14] border border-slate-800 focus:border-amber-500 rounded-xl py-4 pl-4 pr-12 text-slate-100 font-bold text-lg select-none hover:bg-slate-900/60 transition-all cursor-pointer shadow-lg outline-none appearance-none"
              >
                {TOP_CRYPTOS.map(c => {
                  const info = TOKEN_CONFIGS[c];
                  return (
                    <option key={c} value={c}>
                      {c} - {info ? info.name : c}
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 flex items-center">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Live Price Widget */}
          <div className="bg-[#07090e] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between transition-all">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t.livePrice}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-300 font-mono">{formData.symbol}/USDT</span>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 animate-pulse">
                  {language === 'hi' ? 'उच्च सटीकता' : 'HIGH ALPHA STATE'}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`text-xl font-bold font-mono tracking-tight transition-all duration-300 ${
                priceDirection === 'up' 
                  ? 'text-emerald-400 scale-102 filter shadow-emerald-500/10' 
                  : priceDirection === 'down' 
                    ? 'text-rose-400 scale-98' 
                    : 'text-amber-400'
              }`}>
                ${livePrice > 0 ? livePrice.toLocaleString(undefined, { minimumFractionDigits: currentToken.decimals, maximumFractionDigits: currentToken.decimals }) : '--.--'}
              </span>
              <div className="flex items-center justify-end gap-1 mt-0.5 text-[8px] font-bold text-slate-500">
                <Activity className="w-2.5 h-2.5 text-slate-400" />
                <span>Simulating Feed</span>
              </div>
            </div>
          </div>

          {/* Timeframe Scope Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{t.time}</label>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {TIMEFRAMES.map(tf => {
                const isSelected = formData.timeframe === tf;
                return (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setFormData(p => ({...p, timeframe: tf as Timeframe}))}
                    className={`py-2.5 text-xs font-bold rounded-lg border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-amber-400 text-black border-amber-400 hover:bg-amber-500 font-bold shadow-lg shadow-amber-500/15'
                        : 'bg-[#0a0d14] text-slate-400 border-slate-800/85 hover:text-slate-100 hover:border-slate-700'
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Primary Action Button */}
      <button 
        type="submit" 
        disabled={isLoading}
        className={`w-full py-4 px-6 rounded-xl font-bold text-sm text-black uppercase tracking-[0.15em] shadow-xl hover:shadow-2xl transition-all duration-300 transform active:scale-[0.98] focus:outline-none ${
          isLoading 
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60' 
            : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-105 active:brightness-95 hover:shadow-amber-400/20'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            {t.loading}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-black fill-cyan-400/0" />
            {t.btn}
          </span>
        )}
      </button>

      {/* Footer Info Box */}
      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
        <div className="bg-[#0f141c]/50 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-0.5">
          <span className="font-bold uppercase tracking-wider text-slate-600 text-[8px]">{t.stat1}</span>
          <span className="text-white font-mono flex items-center gap-1">
            <Globe className="w-3 h-3 text-amber-500" />
            GG-Search Active
          </span>
        </div>
        <div className="bg-[#0f141c]/50 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-0.5">
          <span className="font-bold uppercase tracking-wider text-slate-600 text-[8px]">{t.stat2}</span>
          <span className="text-white font-mono flex items-center gap-1">
            <Gauge className="w-3 h-3 text-amber-500" />
            {t.stateUltra}
          </span>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[10px] text-slate-500 text-left flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed leading-normal">{t.desc}</p>
      </div>

    </form>
  );
};

export default TradingForm;

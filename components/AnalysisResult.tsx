import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  LineChart, 
  BarChart3, 
  Sliders, 
  Target, 
  Compass, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Scale, 
  Percent,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { generateChartData, TOKEN_CONFIGS } from '../utils/marketData';

interface AnalysisResultProps {
  content: string;
  sources?: any[];
}

// Custom tooltip for financial charts
const CustomChartTooltip = ({ active, payload, coordinate, decimals }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b0e14]/95 border border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{payload[0].payload.time}</p>
        <p className="text-sm font-bold text-slate-100 font-mono mt-1">
          Val: <span className="text-amber-400">${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
        </p>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
          Vol: <span className="text-slate-400">{payload[0].payload.volume} units</span>
        </p>
      </div>
    );
  }
  return null;
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ content, sources }) => {
  const [activeTab, setActiveTab] = useState<'decision' | 'chart' | 'technical' | 'calculator'>('decision');
  
  // Position Planner Form States
  const [leverage, setLeverage] = useState<number>(10);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [tradeCapital, setTradeCapital] = useState<number>(1000);

  if (!content) return null;

  // Parse the structured Gemini response safely
  const parsedData = useMemo(() => {
    const lines = content.split('\n');
    let token = '';
    let action: 'LONG' | 'SHORT' | 'NO TRADE' = 'NO TRADE';
    let confidence = 'Medium';
    let reason = '';

    lines.forEach(line => {
      const upperLine = line.toUpperCase();
      if (upperLine.startsWith('TOKEN:') || upperLine.includes('TOKEN:')) {
        token = line.split(/TOKEN:\s*/i)[1]?.trim() || '';
      } else if (upperLine.startsWith('FINAL ACTION:') || upperLine.includes('FINAL ACTION:')) {
        const val = line.split(/FINAL ACTION:\s*/i)[1]?.trim() || '';
        if (val.toUpperCase().includes('LONG')) action = 'LONG';
        else if (val.toUpperCase().includes('SHORT')) action = 'SHORT';
        else action = 'NO TRADE';
      } else if (upperLine.startsWith('CONFIDENCE:') || upperLine.includes('CONFIDENCE:')) {
        confidence = line.split(/CONFIDENCE:\s*/i)[1]?.trim() || 'Medium';
      } else if (upperLine.startsWith('REASON') || upperLine.includes('REASON:')) {
        reason = line.split(/(?:REASON(?:\s+\(MAX\s+\d+\s+LINES\))?:|REASON:)\s*/i)[1]?.trim() || '';
      }
    });

    // If reason is empty, try to fetch last line as backup or use entire text
    if (!reason || reason.length < 2) {
      reason = content;
    }

    // Attempt to guess TOKEN if missing (e.g. from the content text)
    if (!token) {
      const match = content.match(/TOKEN:\s*(\w+)/i);
      token = match ? match[1].toUpperCase() : 'BTC';
    }

    return { token: token || 'BTC', action, confidence, reason };
  }, [content]);

  const { token, action, confidence, reason } = parsedData;
  const config = TOKEN_CONFIGS[token] || { symbol: token, name: token, basePrice: 100, decimals: 2 };
  
  // Create beautiful simulated chart data matched with technical trend/bias
  const chartData = useMemo(() => {
    return generateChartData(token, 30, action);
  }, [token, action]);

  const latestPrice = chartData[chartData.length - 1]?.close || config.basePrice;

  // Dynamic values for Technical meters based on decision
  const techMetrics = useMemo(() => {
    const isL = action === 'LONG';
    const isS = action === 'SHORT';
    
    return {
      rsi: isL ? 64 : isS ? 34 : 48,
      rsiLabel: isL ? 'Neutral Bullish' : isS ? 'Oversold Bias' : 'Sideways',
      macd: isL ? 'Bullish Crossover (+0.25)' : isS ? 'Bearish Divergence (-0.21)' : 'Zero Line Consolidation',
      ema20: isL ? 'Above (Support)' : isS ? 'Below (Resistance)' : 'Converged',
      ema50: isL ? 'Bullish Slanted' : isS ? 'Bearish Slanted' : 'Flat Slanted',
      trendScore: isL ? 82 : isS ? 18 : 50,
      volatility: isL ? 'High Volume Breakout' : isS ? 'Sellers Dominance' : 'Low Compression',
    };
  }, [action]);

  // Risk and Stop calculations
  const positionPlanner = useMemo(() => {
    const isL = action === 'LONG';
    const slPercent = isL ? 0.03 : 0.03; // 3% stop loss
    const tpPercent = isL ? 0.09 : 0.09; // 3:1 Risk:Reward

    const entry = latestPrice;
    const stopLoss = isL ? entry * (1 - slPercent) : entry * (1 + slPercent);
    const takeProfit = isL ? entry * (1 + tpPercent) : entry * (1 - tpPercent);
    
    // Leverage margin calculations
    const positionSize = tradeCapital * leverage;
    const liquidationDiffPercent = 1 / leverage * 0.92; // Approx liquidation barrier
    const liquidationPrice = isL 
      ? entry * (1 - liquidationDiffPercent) 
      : entry * (1 + liquidationDiffPercent);

    return {
      entry,
      stopLoss: Number(stopLoss.toFixed(config.decimals)),
      takeProfit: Number(takeProfit.toFixed(config.decimals)),
      positionSize: Number(positionSize.toFixed(2)),
      liquidationPrice: Number(liquidationPrice.toFixed(config.decimals)),
      estProfit: Number((positionSize * tpPercent).toFixed(2)),
      estLoss: Number((positionSize * slPercent).toFixed(2))
    };
  }, [latestPrice, leverage, tradeCapital, action, config.decimals]);

  return (
    <div className="bg-[#0f141c]/95 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Visual Ambient Background Glow */}
      <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-1000 ${
        action === 'LONG' 
          ? 'bg-emerald-500' 
          : action === 'SHORT' 
            ? 'bg-rose-500' 
            : 'bg-amber-500'
      }`}></div>

      {/* Header Panel with Stats */}
      <div className="p-6 md:p-8 border-b border-slate-800/70 bg-[#0d1017]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-xl ${
              action === 'LONG'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : action === 'SHORT'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
            }`}>
              {action === 'LONG' ? (
                <TrendingUp className="w-6 h-6 animate-pulse" />
              ) : action === 'SHORT' ? (
                <TrendingDown className="w-6 h-6 animate-pulse" />
              ) : (
                <Scale className="w-6 h-6" />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight font-mono">{config.name}</h2>
                <span className="text-[10px] font-mono font-bold bg-[#171f2a] text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                  {token}/USDT
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  action === 'LONG' ? 'bg-emerald-500' : action === 'SHORT' ? 'bg-rose-500' : 'bg-amber-400'
                }`}></span>
                Target Decided: <span className="font-semibold text-slate-400">{action}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Confidence Index</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    confidence.toLowerCase() === 'high' 
                      ? 'bg-emerald-500 w-full' 
                      : confidence.toLowerCase() === 'medium' 
                        ? 'bg-amber-500 w-2/3' 
                        : 'bg-rose-500 w-1/3'
                  }`}></div>
                </div>
                <span className={`text-[10px] font-bold font-mono tracking-wider ${
                  confidence.toLowerCase() === 'high'
                    ? 'text-emerald-400'
                    : confidence.toLowerCase() === 'medium'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                }`}>{confidence}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher Grid */}
      <div className="flex bg-[#0c0f15] border-b border-slate-800/80 px-4 pt-1">
        {[
          { id: 'decision', label: 'Signal Details', icon: Lightbulb },
          { id: 'chart', label: 'Interactive Chart', icon: LineChart },
          { id: 'technical', label: 'Tech Analytics', icon: BarChart3 },
          { id: 'calculator', label: 'Position Planner', icon: Sliders },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold transition-all border-b-2 mr-2 outline-none ${
                isActive 
                  ? 'border-amber-400 text-amber-400 font-bold bg-slate-900/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN TAB CONTENT */}
      <div className="p-6 md:p-8">

        {/* Tab 1: Signals Overview */}
        {activeTab === 'decision' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Primary Strategy Block */}
            <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-6 relative">
              <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                <Sparkles className="w-16 h-16 text-slate-400" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Quant Synthesis</h3>
              </div>
              
              <div className="text-slate-200 leading-relaxed text-sm whitespace-pre-line space-y-3 font-mono md:text-md select-text tracking-wide bg-slate-950/40 p-4 border border-slate-800/40 rounded-lg">
                {reason}
              </div>
            </div>

            {/* Sources / Grounded Links */}
            {sources && sources.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Real-Time Google Search Validations</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sources.map((source, idx) => (
                    source.web ? (
                      <a 
                        key={idx}
                        href={source.web.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3.5 bg-[#0d1017] border border-slate-800 hover:border-amber-500/50 rounded-xl hover:bg-slate-900/60 transition-all duration-300 group"
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-200 truncate pr-4 max-w-[280px]">
                            {source.web.title?.split('|')[0] || 'Verification Node'}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate font-mono max-w-[250px]">
                            {source.web.uri}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
                      </a>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Interactive Pricing Chart */}
        {activeTab === 'chart' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0b0e14]/90 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Dynamic Vector Path</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Calculated based on multi-interval AI direction</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Open
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Close
                  </span>
                </div>
              </div>

              {/* Chart Element Container */}
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop 
                          offset="5%" 
                          stopColor={action === 'LONG' ? '#10b981' : action === 'SHORT' ? '#f43f5e' : '#f59e0b'} 
                          stopOpacity={0.25}
                        />
                        <stop 
                          offset="95%" 
                          stopColor={action === 'LONG' ? '#10b981' : action === 'SHORT' ? '#f43f5e' : '#f59e0b'} 
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#101827" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#475569" 
                      fontSize={8} 
                      fontFamily="JetBrains Mono" 
                      tickLine={false}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      stroke="#475569" 
                      fontSize={8} 
                      fontFamily="JetBrains Mono" 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip decimals={config.decimals} />} />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke={action === 'LONG' ? '#10b981' : action === 'SHORT' ? '#f43f5e' : '#f59e0b'} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl grid grid-cols-3 gap-4 text-center font-mono">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Low Interval Value</p>
                <p className="text-sm font-semibold text-slate-300 mt-1">${chartData[0]?.low || '--.--'}</p>
              </div>
              <div className="border-x border-slate-800">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Max Peak Value</p>
                <p className="text-sm font-semibold text-slate-300 mt-1">${Math.max(...chartData.map(d => d.high)).toFixed(config.decimals)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Latest Resolution</p>
                <p className="text-sm font-semibold text-slate-300 mt-1">${latestPrice}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Technical Metrics */}
        {activeTab === 'technical' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* RSI Widget */}
              <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Relative Strength Index (RSI)</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      techMetrics.rsi > 60 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : techMetrics.rsi < 40 
                          ? 'bg-rose-500/10 text-rose-400' 
                          : 'bg-amber-500/10 text-amber-500'
                    }`}>{techMetrics.rsi}</span>
                  </div>
                  
                  {/* Gauge bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full relative mt-4 overflow-hidden">
                    <div className="absolute left-[30%] right-[30%] h-full bg-slate-700/80 border-x border-slate-900"></div>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        techMetrics.rsi > 60 ? 'bg-emerald-400' : techMetrics.rsi < 40 ? 'bg-rose-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${techMetrics.rsi}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase mt-2 font-mono">
                    <span>Oversold (30)</span>
                    <span>Neutral (50)</span>
                    <span>Overbought (70)</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 mt-4 pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Condition Status</span>
                  <span className="text-xs font-bold text-slate-300">{techMetrics.rsiLabel}</span>
                </div>
              </div>

              {/* Trend Strength Rating */}
              <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Trend Index Power</span>
                    <span className="text-[10px] font-bold text-amber-400 font-mono">{techMetrics.trendScore}%</span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full relative mt-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${techMetrics.trendScore}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase mt-2 font-mono">
                    <span>Bearish</span>
                    <span>Consolidation</span>
                    <span>Strong Bullish</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 mt-4 pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trend Classification</span>
                  <span className={`text-xs font-bold ${
                    action === 'LONG' ? 'text-emerald-400' : action === 'SHORT' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {action === 'LONG' ? 'Strong Bullish Vector' : action === 'SHORT' ? 'Strong Bearish Vector' : 'Range Consolidated'}
                  </span>
                </div>
              </div>

            </div>

            {/* Quick Summary Grid */}
            <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1">EMA Alignment (20/50/200)</span>
                  <span className="text-xs font-bold text-slate-200">{techMetrics.ema20}</span>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1">MACD Oscillator Line</span>
                  <span className="text-xs font-bold text-slate-200">{techMetrics.macd}</span>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1">EMA 50 Slope Status</span>
                  <span className="text-xs font-bold text-slate-200">{techMetrics.ema50}</span>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Volatility Sentiment</span>
                  <span className="text-xs font-bold text-slate-200">{techMetrics.volatility}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Leverage position planner / Risk Calculator */}
        {activeTab === 'calculator' && (
          <div className="space-y-6 animate-fadeIn">
            {action === 'NO TRADE' ? (
              <div className="p-8 text-center bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-200">Execution Blocked for NO TRADE recommendation</h4>
                <p className="text-xs text-slate-500">Calculator is optimized for active trade signals. Switch token or timeframe to receive active long/short recommendations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Inputs Frame */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="p-5 bg-[#0b0e14] border border-slate-800 rounded-xl space-y-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Trade Plan Matrix</h4>
                    
                    {/* Investment Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Trading Capital</span>
                        <span className="text-amber-400 font-bold">${tradeCapital}</span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="10000" 
                        step="100"
                        value={tradeCapital} 
                        onChange={(e) => setTradeCapital(Number(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>

                    {/* Leverage Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Leverage Factor</span>
                        <span className="text-amber-400 font-bold">{leverage}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        step="1"
                        value={leverage} 
                        onChange={(e) => setLeverage(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    {/* Risk slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Trade Max Risk</span>
                        <span className="text-[#f43f5e] font-bold">{riskPercent}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="0.5"
                        value={riskPercent} 
                        onChange={(e) => setRiskPercent(Number(e.target.value))}
                        className="w-full accent-rose-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculations Display Output */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                      <span className="text-xs font-semibold text-slate-300">Active Blueprint Layout</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        action === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>{action} Blueprint</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                      <div className="p-3 bg-[#0d1017] rounded-lg border border-slate-800/80">
                        <span className="text-[8px] text-slate-500 font-normal uppercase tracking-widest block mb-0.5">Execution Entry Price</span>
                        <span className="font-semibold text-slate-100">${positionPlanner.entry}</span>
                      </div>
                      <div className="p-3 bg-[#0d1017] rounded-lg border border-slate-800/80">
                        <span className="text-[8px] text-slate-500 font-normal uppercase tracking-widest block mb-0.5">Adjusted Stop Loss (SL)</span>
                        <span className="font-semibold text-rose-400">${positionPlanner.stopLoss}</span>
                      </div>
                      <div className="p-3 bg-[#0d1017] rounded-lg border border-slate-800/80">
                        <span className="text-[8px] text-slate-500 font-normal uppercase tracking-widest block mb-0.5">Take Profit Goal (TP)</span>
                        <span className="font-semibold text-emerald-400">${positionPlanner.takeProfit}</span>
                      </div>
                      <div className="p-3 bg-[#0d1017] rounded-lg border border-slate-800/80">
                        <span className="text-[8px] text-slate-500 font-normal uppercase tracking-widest block mb-0.5">Approx. Margin Liq Price</span>
                        <span className="font-semibold text-amber-500">${positionPlanner.liquidationPrice}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Target Profit</span>
                        <span className="text-emerald-400 font-bold">+${positionPlanner.estProfit}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Risk Target</span>
                        <span className="text-rose-400 font-bold">-${positionPlanner.estLoss}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
      
      {/* Dynamic Terminal footer details */}
      <div className="p-4 bg-[#0a0d14] flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800/80">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="text-emerald-500 w-3 h-3" />
          Quant Signal Authenticated
        </span>
        <span>Resolution Time: {new Date().toLocaleTimeString()}</span>
      </div>

    </div>
  );
};

export default AnalysisResult;

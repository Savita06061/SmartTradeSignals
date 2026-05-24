
export enum Timeframe {
  M1 = '1m',
  M5 = '5m',
  M15 = '15m',
  H1 = '1h',
  H4 = '4h',
  D1 = '1d'
}

export type Language = 'en' | 'hi';

export interface AnalysisInput {
  symbol: string;
  timeframe: Timeframe;
  language: Language;
}

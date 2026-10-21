export interface StockQuote {
  symbol: string;
  name: string;
  sector: string;
  current: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  ldcp: number; // Previous Close
  volume: number;
  turnover?: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  changeYear?: number;
  freeFloat?: number;
  listedIndices?: string;
  isShariah?: boolean;
  isKse100?: boolean;
  logoUrl?: string;
  updatedAt?: string;
}

export interface IndexQuote {
  name: string;
  code: string;
  current: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  value?: number;
  open?: number;
  ldcp?: number;
  yearHigh?: number;
  yearLow?: number;
}

export interface ChartPoint {
  time: number | string; // Unix timestamp or 'YYYY-MM-DD'
  value?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  category?: string;
}

export interface CompanyAnnouncement {
  id: string;
  symbol: string;
  companyName: string;
  date: string;
  time: string;
  title: string;
  type: string;
  documentUrl: string;
  attachmentId?: string;
  summary?: string;
}

export interface MarketSummary {
  kse100: IndexQuote | null;
  indices: IndexQuote[];
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  topVolume: StockQuote[];
  isOpen: boolean;
  marketTime: string;
  advance?: number;
  decline?: number;
  unchanged?: number;
  totalVolume?: number;
}

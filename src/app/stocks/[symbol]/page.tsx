import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchMarketWatch, fetchStockHistory, fetchTimeseries, fetchCompanyAnnouncements } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StockHistoryChart from '@/components/StockHistoryChart';
import CompanyHealthScore from '@/components/CompanyHealthScore';
import StockDetailTabs from '@/components/StockDetailTabs';
import AppPromoBanner from '@/components/AppPromoBanner';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Activity,
  Smartphone,
} from 'lucide-react';

interface Props {
  params: { symbol: string };
}

export const revalidate = 30; // Revalidate every 30 seconds

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const symbol = params.symbol.toUpperCase();
  const quotes = await fetchMarketWatch();
  const quote = quotes.find((q) => q.symbol.toUpperCase() === symbol);

  if (!quote) {
    return {
      title: `${symbol} Stock Price & Live Chart - Daulat Invest`,
    };
  }

  const sign = quote.change >= 0 ? '+' : '';
  const priceStr = `Rs ${quote.current.toFixed(2)}`;
  const changeStr = `${sign}${quote.change.toFixed(2)} (${sign}${quote.changePercent.toFixed(2)}%)`;

  return {
    title: `${symbol} Share Price: ${priceStr} (${changeStr}) - ${quote.name} PSX | Daulat Invest`,
    description: `Live ${symbol} stock price today: ${priceStr}. Track live ${quote.name} Pakistan Stock Exchange (PSX) trading volume, intraday & historical charts, key ratios, and corporate announcements on Daulat Invest.`,
    keywords: [
      `${symbol} share price`,
      `${symbol} stock`,
      `${quote.name}`,
      `${symbol} dividend`,
      `${symbol} PSX`,
      `${symbol} target price`,
      'Pakistan Stock Exchange',
    ],
    openGraph: {
      title: `${symbol} (${quote.name}) - ${priceStr} | Daulat Invest`,
      description: `Live PSX price, charts, and analysis for ${quote.name} (${symbol}).`,
      url: `https://daulatinvest.com/stocks/${symbol}`,
      siteName: 'Daulat Invest',
      type: 'article',
    },
  };
}

export default async function StockDetailPage({ params }: Props) {
  const symbol = params.symbol.toUpperCase();
  const [quotes, history, kseHistory, announcements] = await Promise.all([
    fetchMarketWatch(),
    fetchStockHistory(symbol),
    fetchTimeseries('KSE100', false),
    fetchCompanyAnnouncements(),
  ]);

  const quote = quotes.find((q) => q.symbol.toUpperCase() === symbol);

  if (!quote) {
    notFound();
  }

  const isPositive = quote.change >= 0;
  const relatedStocks = quotes
    .filter((q) => q.sector === quote.sector && q.symbol !== quote.symbol)
    .slice(0, 5);

  // Schema.org Structured Data for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `${quote.name} (${quote.symbol})`,
    description: `Common stock of ${quote.name} listed on Pakistan Stock Exchange.`,
    offers: {
      '@type': 'Offer',
      price: quote.current,
      priceCurrency: 'PKR',
      priceChange: quote.change,
      priceChangePercent: quote.changePercent,
    },
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs text-[#A4AEC1]">
          <Link href="/" className="hover:text-[#EFF3FA] transition-colors flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Markets</span>
          </Link>
          <span>/</span>
          <Link href="/stocks" className="hover:text-[#EFF3FA] transition-colors">
            Stocks
          </Link>
          <span>/</span>
          <span className="text-[#B69249] font-semibold">{quote.symbol}</span>
        </div>

        {/* Stock Hero Header */}
        <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <span className="text-2xl sm:text-3xl font-semibold text-[#EFF3FA] tracking-tight">
                {quote.symbol}
              </span>
              <span className="text-xs bg-[#1C2940] text-[#B69249] font-semibold px-2.5 py-1 rounded-lg border border-[#28354A]">
                PSX: {quote.symbol}
              </span>
              <span className="text-xs text-[#A4AEC1] bg-[#0B1120] px-2.5 py-1 rounded-lg border border-[#28354A]">
                {quote.sector}
              </span>
            </div>
            <h1 className="text-sm sm:text-base text-[#A4AEC1] font-medium">{quote.name}</h1>
          </div>

          {/* Price & Change Box */}
          <div className="text-left md:text-right">
            <div className="text-3xl sm:text-4xl font-mono font-semibold text-[#EFF3FA] tracking-tight">
              Rs {quote.current.toFixed(2)}
            </div>
            <div
              className={`inline-flex items-center space-x-1 text-sm sm:text-base font-mono font-semibold mt-1 ${
                isPositive ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}
                {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
                {quote.changePercent.toFixed(2)}%)
              </span>
              <span className="text-xs text-[#A4AEC1] ml-1.5 font-normal">Today</span>
            </div>
          </div>
        </div>

        <StockDetailTabs stock={quote} peers={relatedStocks} announcements={announcements.filter(a => a.symbol.toUpperCase() === symbol)} overview={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <StockHistoryChart
              symbol={quote.symbol}
              history={history}
              kseHistory={kseHistory}
              currentPrice={quote.current}
              change={quote.change}
            />
          </div>

          {/* Right Column: Daulat Health Score (Sarmaaya Score) & Stats */}
          <div className="lg:col-span-4 space-y-4">
            <CompanyHealthScore stock={quote} />

            <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5 shadow-xl">
              <h2 className="text-sm font-semibold text-[#EFF3FA] uppercase tracking-wider mb-4 border-b border-[#28354A] pb-3 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#B69249]" />
                <span>Trading Statistics</span>
              </h2>

              <div className="divide-y divide-[#28354A]/60 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Day High</span>
                  <span className="font-mono font-semibold text-[#EFF3FA]">
                    Rs {quote.high.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Day Low</span>
                  <span className="font-mono font-semibold text-[#EFF3FA]">
                    Rs {quote.low.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Opening Price</span>
                  <span className="font-mono font-semibold text-[#EFF3FA]">
                    Rs {quote.open.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Previous Close (LDCP)</span>
                  <span className="font-mono font-semibold text-[#EFF3FA]">
                    Rs {quote.ldcp.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Trading Volume</span>
                  <span className="font-mono font-semibold text-[#B69249]">
                    {quote.volume.toLocaleString()} shares
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Market</span>
                  <span className="text-[#EFF3FA] font-semibold">PSX Ready Board (REG)</span>
                </div>
              </div>
            </div>

            {/* In-App Portfolio Sync Callout */}
            <div className="bg-gradient-to-br from-[#111A2B] to-[#1C2940] border border-[#28354A] rounded-xl p-5 shadow-xl text-center">
              <Smartphone className="w-8 h-8 text-[#B69249] mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-[#EFF3FA]">Track {quote.symbol} in Daulat App</h3>
              <p className="text-xs text-[#A4AEC1] mt-1 leading-relaxed">
                Add {quote.symbol} to your portfolio to track live profit/loss, price breakout
                alerts, and average buy cost.
              </p>
              <a
                href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full bg-[#B69249] hover:bg-[#C6A45B] text-black font-semibold py-2 rounded-xl text-xs transition-colors"
              >
                Open in App
              </a>
            </div>
          </div>
        </div>

        } />

        <AppPromoBanner />
      </main>

      <Footer />
    </div>
  );
}

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchMarketWatch, fetchStockHistory } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StockHistoryChart from '@/components/StockHistoryChart';
import AppPromoBanner from '@/components/AppPromoBanner';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Share2,
  Building2,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
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
  const [quotes, history] = await Promise.all([
    fetchMarketWatch(),
    fetchStockHistory(symbol),
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
    <div className="min-h-screen bg-[#0B0E14] text-[#F0F6FC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs text-[#8B949E]">
          <Link href="/" className="hover:text-[#F0F6FC] transition-colors flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Markets</span>
          </Link>
          <span>/</span>
          <Link href="/stocks" className="hover:text-[#F0F6FC] transition-colors">
            Stocks
          </Link>
          <span>/</span>
          <span className="text-[#FFB401] font-bold">{quote.symbol}</span>
        </div>

        {/* Stock Hero Header */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <span className="text-2xl sm:text-3xl font-black text-[#F0F6FC] tracking-tight">
                {quote.symbol}
              </span>
              <span className="text-xs bg-[#21262D] text-[#FFB401] font-bold px-2.5 py-1 rounded-lg border border-[#30363D]">
                PSX: {quote.symbol}
              </span>
              <span className="text-xs text-[#8B949E] bg-[#0B0E14] px-2.5 py-1 rounded-lg border border-[#30363D]">
                {quote.sector}
              </span>
            </div>
            <h1 className="text-sm sm:text-base text-[#8B949E] font-medium">{quote.name}</h1>
          </div>

          {/* Price & Change Box */}
          <div className="text-left md:text-right">
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#F0F6FC] tracking-tight">
              Rs {quote.current.toFixed(2)}
            </div>
            <div
              className={`inline-flex items-center space-x-1 text-sm sm:text-base font-mono font-bold mt-1 ${
                isPositive ? 'text-[#00C076]' : 'text-[#F85149]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}
                {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
                {quote.changePercent.toFixed(2)}%)
              </span>
              <span className="text-xs text-[#8B949E] ml-1.5 font-normal">Today</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Interactive Chart & Key Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <StockHistoryChart
              symbol={quote.symbol}
              history={history}
              currentPrice={quote.current}
              change={quote.change}
            />
          </div>

          {/* Key Trading Stats Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 shadow-xl">
              <h2 className="text-sm font-bold text-[#F0F6FC] uppercase tracking-wider mb-4 border-b border-[#30363D] pb-3 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#FFB401]" />
                <span>Trading Statistics</span>
              </h2>

              <div className="divide-y divide-[#30363D]/60 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#8B949E]">Day High</span>
                  <span className="font-mono font-bold text-[#F0F6FC]">
                    Rs {quote.high.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#8B949E]">Day Low</span>
                  <span className="font-mono font-bold text-[#F0F6FC]">
                    Rs {quote.low.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#8B949E]">Opening Price</span>
                  <span className="font-mono font-bold text-[#F0F6FC]">
                    Rs {quote.open.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#8B949E]">Previous Close (LDCP)</span>
                  <span className="font-mono font-bold text-[#F0F6FC]">
                    Rs {quote.ldcp.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#8B949E]">Trading Volume</span>
                  <span className="font-mono font-bold text-[#FFB401]">
                    {quote.volume.toLocaleString()} shares
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#8B949E]">Market</span>
                  <span className="text-[#F0F6FC] font-semibold">PSX Ready Board (REG)</span>
                </div>
              </div>
            </div>

            {/* In-App Portfolio Sync Callout */}
            <div className="bg-gradient-to-br from-[#161B22] to-[#21262D] border border-[#30363D] rounded-2xl p-5 shadow-xl text-center">
              <Smartphone className="w-8 h-8 text-[#FFB401] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#F0F6FC]">Track {quote.symbol} in Daulat App</h3>
              <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">
                Add {quote.symbol} to your portfolio to track live profit/loss, price breakout
                alerts, and average buy cost.
              </p>
              <a
                href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full bg-[#FFB401] hover:bg-[#E5A300] text-black font-bold py-2 rounded-xl text-xs transition-colors"
              >
                Open in App
              </a>
            </div>
          </div>
        </div>

        {/* Related Sector Peers */}
        {relatedStocks.length > 0 && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-bold text-[#F0F6FC] mb-4 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#FFB401]" />
              <span>More Stocks in {quote.sector}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {relatedStocks.map((rel) => {
                const relPos = rel.change >= 0;
                return (
                  <Link
                    key={rel.symbol}
                    href={`/stocks/${rel.symbol}`}
                    className="bg-[#0B0E14] border border-[#30363D] hover:border-[#FFB401] p-3.5 rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#F0F6FC] group-hover:text-[#FFB401]">
                        {rel.symbol}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          relPos ? 'text-[#00C076]' : 'text-[#F85149]'
                        }`}
                      >
                        {relPos ? '+' : ''}
                        {rel.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#F0F6FC] mt-1 font-bold">
                      Rs {rel.current.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#8B949E] truncate mt-0.5">{rel.name}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <AppPromoBanner />
      </main>

      <Footer />
    </div>
  );
}

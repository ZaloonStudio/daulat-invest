import React from 'react';
import { Metadata } from 'next';
import { getMarketSummary, fetchMarketWatch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import IndicesBar from '@/components/IndicesBar';
import KseHeroChart from '@/components/KseHeroChart';
import MarketMovers from '@/components/MarketMovers';
import SectorsGrid from '@/components/SectorsGrid';
import AppPromoBanner from '@/components/AppPromoBanner';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';

export const revalidate = 15; // Revalidate every 15 seconds for live updates

export const metadata: Metadata = {
  title: 'Daulat Invest - Live Pakistan Stock Exchange (PSX) Tracker & Charts',
  description:
    'Live KSE 100 index, real-time PSX stock quotes, interactive TradingView charts, top gainers, losers, corporate announcements, and smart portfolio tracking.',
  keywords: [
    'PSX',
    'Pakistan Stock Exchange',
    'KSE 100',
    'PSX live rates',
    'Daulat app',
    'Daulat Invest',
    'stocks Pakistan',
    'OGDC share price',
    'Meezan bank share',
  ],
  openGraph: {
    title: 'Daulat Invest - Live PSX Stock Market Terminal',
    description: 'Real-time PSX 100 charts, stock screener, and portfolio intelligence.',
    url: 'https://daulatinvest.com',
    siteName: 'Daulat Invest',
    type: 'website',
  },
};

export default async function HomePage() {
  const [summary, quotes] = await Promise.all([getMarketSummary(), fetchMarketWatch()]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F0F6FC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Indices Ticker Bar */}
        <IndicesBar indices={summary.indices} />

        {/* Hero Section: KSE-100 Chart & Quick Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <KseHeroChart initialIndex={summary.kse100} />
          </div>

          {/* Right Snapshot: Top Volume Leaders */}
          <div className="lg:col-span-4 bg-[#161B22] border border-[#30363D] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#30363D] pb-3">
                <span className="text-sm font-bold text-[#F0F6FC] flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-[#FFB401]" />
                  <span>Top Traded Today</span>
                </span>
                <Link
                  href="/stocks"
                  className="text-xs text-[#388BFD] hover:underline flex items-center"
                >
                  <span>More</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {summary.topVolume.slice(0, 5).map((stock) => {
                  const isPositive = stock.change >= 0;
                  return (
                    <Link
                      key={stock.symbol}
                      href={`/stocks/${stock.symbol}`}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#21262D] transition-colors group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#0B0E14] border border-[#30363D] flex items-center justify-center font-bold text-[11px] text-[#FFB401] group-hover:border-[#FFB401] transition-colors">
                          {stock.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#F0F6FC] group-hover:text-[#FFB401] transition-colors">
                            {stock.symbol}
                          </div>
                          <div className="text-[10px] text-[#8B949E] truncate max-w-[110px]">
                            {stock.name}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-[#F0F6FC]">
                          Rs {stock.current.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-mono font-semibold ${
                            isPositive ? 'text-[#00C076]' : 'text-[#F85149]'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick App Shortcut Box inside card */}
            <div className="mt-4 pt-3 border-t border-[#30363D]/60 bg-[#0B0E14] p-3 rounded-xl border border-[#30363D]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#FFB401] flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Real-time Alerts</span>
                  </span>
                  <span className="text-[11px] text-[#8B949E] block mt-0.5">
                    Never miss a PSX breakout
                  </span>
                </div>
                <a
                  href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#484F58] transition-colors"
                >
                  Get App
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* AdSense / Sponsored Placement Slot */}
        <div className="w-full bg-[#161B22]/60 border border-dashed border-[#30363D] rounded-xl p-4 text-center">
          <span className="text-[10px] uppercase tracking-widest text-[#6E7681] block mb-1">
            Advertisement / Sponsored Placement
          </span>
          <div className="h-16 flex items-center justify-center text-xs text-[#8B949E]">
            Premium Financial Advertising Space • High Intent Pakistani Investors
          </div>
        </div>

        {/* Market Movers: Top Volume, Gainers & Losers */}
        <MarketMovers
          topVolume={summary.topVolume}
          topGainers={summary.topGainers}
          topLosers={summary.topLosers}
        />

        {/* Key Industry Sectors Breakdown */}
        <SectorsGrid quotes={quotes} />

        {/* Conversion App Promo Banner */}
        <AppPromoBanner />
      </main>

      <Footer />
    </div>
  );
}

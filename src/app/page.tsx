import React from 'react';
import { Metadata } from 'next';
import {
  getMarketSummary,
  fetchMarketWatch,
  fetchMarketNews,
  fetchCompanyAnnouncements,
  isPsxMarketOpen,
  getPakistanTimeStr,
} from '@/lib/psx';
import Navbar from '@/components/Navbar';
import HomeClientContainer from '@/components/HomeClientContainer';
import Footer from '@/components/Footer';

export const revalidate = 15; // Revalidate every 15 seconds for live updates

export const metadata: Metadata = {
  title: 'Daulat Invest - Live Pakistan Stock Exchange (PSX) Terminal & Charts',
  description:
    'Live KSE 100 index, real-time PSX stock quotes, interactive TradingView charts, top gainers, losers, corporate announcements, and smart portfolio tracking.',
  keywords: [
    'PSX',
    'Pakistan Stock Exchange',
    'KSE 100',
    'PSX live rates',
    'Daulat app',
    'Daulat Invest',
    'Investify',
    'Sarmaaya',
    'stocks Pakistan',
    'OGDC share price',
    'Meezan bank share',
  ],
  openGraph: {
    title: 'Daulat Invest - Live PSX Stock Market Terminal',
    description: 'Real-time PSX 100 charts, stock screener, corporate filings, and portfolio intelligence.',
    url: 'https://daulatinvest.com',
    siteName: 'Daulat Invest',
    type: 'website',
  },
};

export default async function HomePage() {
  const [summary, quotes, news, announcements] = await Promise.all([
    getMarketSummary(),
    fetchMarketWatch(),
    fetchMarketNews(),
    fetchCompanyAnnouncements(),
  ]);

  const isOpen = isPsxMarketOpen();
  const marketTime = getPakistanTimeStr();

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F0F6FC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HomeClientContainer
          summary={summary}
          quotes={quotes}
          news={news}
          announcements={announcements}
          isOpen={isOpen}
          marketTime={marketTime}
        />
      </main>

      <Footer />
    </div>
  );
}

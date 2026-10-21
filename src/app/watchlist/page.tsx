import React from 'react';
import { Metadata } from 'next';
import { fetchMarketWatch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WatchlistClient from './WatchlistClient';

export const revalidate = 15;

export const metadata: Metadata = {
  title: 'My Stock Watchlist - PSX Live Tracking - Daulat Invest',
  description:
    'Custom stock watchlist for the Pakistan Stock Exchange. Monitor live prices, volume shifts, valuation multiples, and dividend yields for your favorite PSX equities.',
  keywords: [
    'PSX Watchlist',
    'Pakistan stocks tracker',
    'Investify watchlist',
    'KSE 100 stock alerts',
    'Daulat Watchlist',
  ],
};

export default async function WatchlistPage() {
  const allQuotes = await fetchMarketWatch();

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WatchlistClient allStocks={allQuotes} />
      </main>

      <Footer />
    </div>
  );
}

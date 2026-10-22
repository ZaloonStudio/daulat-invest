import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import { fetchMarketWatch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WatchlistClient from './WatchlistClient';

export const revalidate = 15;

export const metadata: Metadata = pageMetadata("/watchlist", "Your PSX Stock Watchlist", "Track your saved Pakistan Stock Exchange shares and monitor prices in your personal Daulat watchlist.", false);

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

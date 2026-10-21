import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchMarketWatch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StocksDirectoryClient from '@/components/StocksDirectoryClient';

export const revalidate = 60; // 1 minute cache

export const metadata: Metadata = {
  title: 'All Pakistan Stock Exchange (PSX) Listed Stocks Directory - Daulat Invest',
  description:
    'Browse all 500+ companies listed on PSX. Filter by sector, check live market price, 24h trading volume, top gainers, and company fundamentals on Daulat Invest.',
};

export default async function StocksPage() {
  const quotes = await fetchMarketWatch();

  // Extract unique sectors
  const sectorsSet = new Set<string>();
  quotes.forEach((q) => {
    if (q.sector) sectorsSet.add(q.sector);
  });
  const sectors = Array.from(sectorsSet).sort();

  return (
    <div className="min-h-screen bg-[#0C1411] text-[#F1F5EE]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F1F5EE]">
            PSX Listed Stocks Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#A4B3A7] mt-1">
            Real-time market rates and company intelligence across all {quotes.length} listed
            equities on the Pakistan Stock Exchange.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-12 text-center text-sm text-[#A4B3A7]">
              Loading PSX directory...
            </div>
          }
        >
          <StocksDirectoryClient initialQuotes={quotes} sectors={sectors} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

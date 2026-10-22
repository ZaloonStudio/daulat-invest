import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchMarketWatch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StocksDirectoryClient from '@/components/StocksDirectoryClient';

export const revalidate = 60; // 1 minute cache

export const metadata: Metadata = pageMetadata("/stocks", "PSX Share Prices & Listed Companies", "Browse Pakistan Stock Exchange companies by sector. Compare share prices, trading volume and price changes, and open detailed stock charts.");

export default async function StocksPage() {
  const quotes = await fetchMarketWatch();

  // Extract unique sectors
  const sectorsSet = new Set<string>();
  quotes.forEach((q) => {
    if (q.sector) sectorsSet.add(q.sector);
  });
  const sectors = Array.from(sectorsSet).sort();

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#EFF3FA]">
            PSX Listed Stocks Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#A4AEC1] mt-1">
            Real-time market rates and company intelligence across all {quotes.length} listed
            equities on the Pakistan Stock Exchange.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-12 text-center text-sm text-[#A4AEC1]">
              <p className="mb-4">PSX companies</p>
              <nav aria-label="PSX company directory" className="flex flex-wrap gap-3">
                {quotes.map(quote => <Link key={quote.symbol} href={`/stocks/${quote.symbol}`}>{quote.symbol} — {quote.name}</Link>)}
              </nav>
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

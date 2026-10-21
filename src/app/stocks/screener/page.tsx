import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchMarketWatch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StockScreenerClient from '@/components/StockScreenerClient';
import { SlidersHorizontal } from 'lucide-react';

export const revalidate = 60; // 1 minute cache

export const metadata: Metadata = {
  title: 'PSX Stock Screener & Filter - Daulat Invest',
  description:
    'Custom stock screener for Pakistan Stock Exchange (PSX). Filter 500+ Pakistani stocks by Shariah compliance (KMI-30), P/E ratio, dividend yield, market capitalization, and daily volume.',
  keywords: [
    'PSX stock screener',
    'Pakistan Stock Exchange screener',
    'Shariah compliant stocks Pakistan',
    'High dividend yield PSX',
    'PSX valuation filter',
    'KMI 30 screener',
    'Daulat Invest screener',
  ],
  openGraph: {
    title: 'PSX Stock Screener & Filter | Daulat Invest',
    description: 'Filter Pakistan Stock Exchange stocks by sector, Shariah status, P/E, and dividends.',
    url: 'https://daulatinvest.com/stocks/screener',
    siteName: 'Daulat Invest',
    type: 'website',
  },
};

export default async function ScreenerPage() {
  const quotes = await fetchMarketWatch();

  // Extract unique sectors
  const sectorsSet = new Set<string>();
  quotes.forEach((q) => {
    if (q.sector) sectorsSet.add(q.sector);
  });
  const sectors = Array.from(sectorsSet).sort();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Daulat PSX Stock Screener',
    description: 'Interactive stock screening tool for equities listed on the Pakistan Stock Exchange.',
    url: 'https://daulatinvest.com/stocks/screener',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B69249] uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Market Intelligence Tool</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#EFF3FA] tracking-tight">
            Stock screener
          </h1>
          <p className="text-xs sm:text-sm text-[#A4AEC1] mt-1 max-w-3xl leading-relaxed">
            Screen all listed companies across Pakistan Stock Exchange using fundamental valuation ratios,
            KMI Shariah compliance audits, trailing dividend yields, and institutional volume activity.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-12 text-center text-sm text-[#A4AEC1]">
              Loading PSX Screener engine...
            </div>
          }
        >
          <StockScreenerClient initialQuotes={quotes} sectors={sectors} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

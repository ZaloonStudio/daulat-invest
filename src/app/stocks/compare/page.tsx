import { pageMetadata } from '@/lib/seo';
import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchMarketWatch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StockCompareClient from './StockCompareClient';

export const revalidate = 15;

export const metadata: Metadata = pageMetadata("/stocks/compare", "Compare PSX Stocks", "Compare Pakistan Stock Exchange shares side by side with prices, valuation ratios, dividends and company fundamentals.");

export default async function StockComparePage() {
  const allStocks = await fetchMarketWatch();

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-12 text-center text-sm text-[#A4AEC1]">
              Loading comparison matrix...
            </div>
          }
        >
          <StockCompareClient allStocks={allStocks} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchMarketWatch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StockCompareClient from './StockCompareClient';

export const revalidate = 15;

export const metadata: Metadata = {
  title: 'PSX Stock Comparison Tool - Side-by-Side Equities Analytics - Daulat Invest',
  description:
    'Compare Pakistan Stock Exchange equities side-by-side. Analyze valuation multiples (P/E, P/B), dividend yields, 1-year returns, market capitalizations, and Shariah compliance.',
  keywords: [
    'PSX stock compare',
    'Sarmaaya stock comparison',
    'Compare PSX stocks',
    'MEBL vs MCB',
    'HUBC vs KAPCO',
    'EFERT vs FFC',
  ],
};

export default async function StockComparePage() {
  const allStocks = await fetchMarketWatch();

  return (
    <div className="min-h-screen bg-[#0C1411] text-[#F1F5EE]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-12 text-center text-sm text-[#A4B3A7]">
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

import React from 'react';
import { Metadata } from 'next';
import { fetchMarketWatch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShariahClient from './ShariahClient';

export const revalidate = 15;

export const metadata: Metadata = {
  title: 'PSX Shariah Compliant Stocks - KMI-30 Islamic Screener - Daulat Invest',
  description:
    'Screener for all certified Shariah-compliant and Islamic stocks listed on the Pakistan Stock Exchange. Screen by sector, dividend yield, PE ratio, and live rates.',
  keywords: [
    'Shariah stocks PSX',
    'KMI 30 stocks',
    'Islamic investing Pakistan',
    'Halal stocks PSX',
    'Meezan Islamic index',
  ],
};

export default async function ShariahPage() {
  const allStocks = await fetchMarketWatch();
  const shariahStocks = allStocks.filter((s) => s.isShariah);

  return (
    <div className="min-h-screen bg-[#0C1411] text-[#F1F5EE]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShariahClient stocks={shariahStocks.length > 0 ? shariahStocks : allStocks.slice(0, 40)} />
      </main>

      <Footer />
    </div>
  );
}

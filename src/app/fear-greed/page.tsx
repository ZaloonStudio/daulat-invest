import React from 'react';
import { Metadata } from 'next';
import { getMarketSummary, calculateFearGreed } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FearGreedClient from './FearGreedClient';

export const revalidate = 15; // Revalidate every 15 seconds for live PSX sentiment

export const metadata: Metadata = {
  title: 'PSX Fear & Greed Index - Pakistan Stock Market Sentiment - Daulat Invest',
  description:
    'Track overall Pakistan Stock Exchange market sentiment in real-time. Multifactor sentiment index based on PSX advance-decline breadth, KSE-100 momentum, and trading volume velocity.',
  keywords: [
    'PSX Fear and Greed Index',
    'Pakistan Stock Exchange Sentiment',
    'Investify Fear Greed',
    'KSE 100 market sentiment',
    'PSX advance decline ratio',
  ],
};

export default async function FearGreedPage() {
  const summary = await getMarketSummary();
  const fearGreedData = calculateFearGreed(summary);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F0F6FC]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FearGreedClient data={fearGreedData} />
      </main>

      <Footer />
    </div>
  );
}

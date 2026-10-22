import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import { getMarketSummary, calculateFearGreed } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FearGreedClient from './FearGreedClient';

export const revalidate = 15; // Revalidate every 15 seconds for live PSX sentiment

export const metadata: Metadata = pageMetadata("/fear-greed", "PSX Fear & Greed Index", "Explore Pakistan stock market sentiment using KSE 100 momentum, market breadth and trading activity in the Daulat Fear & Greed Index.");

export default async function FearGreedPage() {
  const summary = await getMarketSummary();
  const fearGreedData = calculateFearGreed(summary);

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FearGreedClient data={fearGreedData} />
      </main>

      <Footer />
    </div>
  );
}

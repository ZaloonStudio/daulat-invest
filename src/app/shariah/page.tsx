import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import { fetchMarketWatch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShariahClient from './ShariahClient';

export const revalidate = 15;

export const metadata: Metadata = pageMetadata("/shariah", "Shariah Stock Screener for PSX", "Explore Shariah screening information for Pakistan Stock Exchange companies and compare available compliance and financial ratios.");

export default async function ShariahPage() {
  const allStocks = await fetchMarketWatch();
  const shariahStocks = allStocks.filter((s) => s.isShariah);

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShariahClient stocks={shariahStocks.length > 0 ? shariahStocks : allStocks.slice(0, 40)} />
      </main>

      <Footer />
    </div>
  );
}

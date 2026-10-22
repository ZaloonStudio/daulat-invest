import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommoditiesClient from './CommoditiesClient';
import { getPriceSnapshot } from '@/lib/commodity-feed';

export const revalidate = 300;

export const metadata: Metadata = pageMetadata("/commodities", "Gold & Commodity Prices in Pakistan", "Explore gold and silver prices in PKR, Pakistan petrol prices and global energy benchmarks with historical charts and calculators.");

export default async function CommoditiesPage() {
  const prices = await getPriceSnapshot();
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CommoditiesClient prices={prices} />
      </main>

      <Footer />
    </div>
  );
}

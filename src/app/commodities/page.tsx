import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommoditiesClient from './CommoditiesClient';
import { getPriceSnapshot } from '@/lib/commodity-feed';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Gold Rates in Pakistan & Commodities Tracker - Daulat Invest',
  description:
    'Explore indicative gold and silver values in PKR, notified petrol rates, energy benchmarks and commodity calculators with source timestamps.',
  alternates: { canonical: 'https://www.daulatinvest.com/commodities' },
  keywords: [
    'Gold rate in Pakistan today',
    'Gold price per tola',
    'Sarmaaya commodities',
    'Silver rate Pakistan',
    'Crude oil price PKR',
  ],
};

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

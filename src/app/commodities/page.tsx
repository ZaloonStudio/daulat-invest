import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommoditiesClient from './CommoditiesClient';

export const metadata: Metadata = {
  title: 'Gold Rates in Pakistan & Commodities Tracker - Daulat Invest',
  description:
    'Live Gold rate today in Pakistan (24K Tola, 22K Tola, 10g), Silver rates, and global crude oil prices in PKR. Interactive gold price calculator.',
  keywords: [
    'Gold rate in Pakistan today',
    'Gold price per tola',
    'Sarmaaya commodities',
    'Silver rate Pakistan',
    'Crude oil price PKR',
  ],
};

export default function CommoditiesPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CommoditiesClient />
      </main>

      <Footer />
    </div>
  );
}

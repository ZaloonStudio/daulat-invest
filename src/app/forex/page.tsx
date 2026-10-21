import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ForexClient from './ForexClient';

export const metadata: Metadata = {
  title: 'Currency Rates in Pakistan - USD to PKR Live Forex - Daulat Invest',
  description:
    'Live currency rates in Pakistan today. Track US Dollar (USD), Euro (EUR), British Pound (GBP), Saudi Riyal (SAR), and UAE Dirham (AED) to PKR in Interbank and Open Market.',
  keywords: [
    'USD to PKR today',
    'Dollar rate in Pakistan',
    'Sarmaaya forex rates',
    'Open market currency rate',
    'Riyal rate in Pakistan',
  ],
};

export default function ForexPage() {
  return (
    <div className="min-h-screen bg-[#0C1411] text-[#F1F5EE]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ForexClient />
      </main>

      <Footer />
    </div>
  );
}

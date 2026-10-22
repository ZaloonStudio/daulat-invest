import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ForexClient from './ForexClient';

export const metadata: Metadata = pageMetadata("/forex", "Currency Exchange Rates in Pakistan", "Compare USD, EUR, GBP, SAR and AED exchange rates against the Pakistani rupee with currency conversion tools.");

export default function ForexPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ForexClient />
      </main>

      <Footer />
    </div>
  );
}

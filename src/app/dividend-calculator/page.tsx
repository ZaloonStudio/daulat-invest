import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DividendCalculatorView from './DividendCalculatorView';

export const metadata: Metadata = {
  title: 'PSX Dividend Yield & Tax Calculator - Daulat Invest',
  description:
    'Calculate net dividend payouts, Filer (15%) vs Non-Filer (30%) withholding tax, annual passive income, and payback periods for high-yield Pakistan Stock Exchange stocks.',
  keywords: [
    'PSX Dividend Calculator',
    'Pakistan stocks dividend tax',
    'Filer Non Filer dividend WHT',
    'HUBC dividend yield',
    'EFERT dividend calculator',
  ],
};

export default function DividendCalculatorPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DividendCalculatorView />
      </main>

      <Footer />
    </div>
  );
}

import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SipCalculatorView from './SipCalculatorView';

export const metadata: Metadata = {
  title: 'PSX SIP & Wealth Compounding Calculator - Daulat Invest',
  description:
    'Plan disciplined Rupee-Cost Averaging across Pakistan Stock Exchange equities. Calculate future wealth, compounded interest, and long-term capital milestones.',
  keywords: [
    'SIP calculator Pakistan',
    'PSX DCA calculator',
    'Mutual funds compound returns',
    'Pakistan stocks compounding',
  ],
};

export default function SipCalculatorPage() {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F0F6FC]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SipCalculatorView />
      </main>

      <Footer />
    </div>
  );
}

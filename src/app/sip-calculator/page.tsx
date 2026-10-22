import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SipCalculatorView from './SipCalculatorView';

export const metadata: Metadata = pageMetadata("/sip-calculator", "SIP & Compound Growth Calculator in PKR", "Calculate projected growth from monthly investing in Pakistani rupees. Adjust contributions, time horizon and expected returns.");

export default function SipCalculatorPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SipCalculatorView />
      </main>

      <Footer />
    </div>
  );
}

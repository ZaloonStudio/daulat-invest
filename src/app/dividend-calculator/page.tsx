import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DividendCalculatorView from './DividendCalculatorView';

export const metadata: Metadata = pageMetadata("/dividend-calculator", "PSX Dividend Yield Calculator", "Estimate dividend income and yield for Pakistan Stock Exchange shares. Compare dividend opportunities and calculate investment income.");

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

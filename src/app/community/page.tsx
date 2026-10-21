import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommunityClient from './CommunityClient';

export const metadata: Metadata = {
  title: 'Pakistan Stock Exchange Community & Investor Forum - Daulat Invest',
  description:
    'Join Pakistan’s premier stock market investor community. Discuss PSX stocks, company earnings, share investment theses, and trade ideas with fellow retail and institutional investors.',
  keywords: [
    'PSX Community',
    'Pakistan Stock Exchange Forum',
    'PSX stock discussion',
    'Investify community',
    'KSE 100 traders',
    'Daulat Community',
  ],
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CommunityClient />
      </main>

      <Footer />
    </div>
  );
}

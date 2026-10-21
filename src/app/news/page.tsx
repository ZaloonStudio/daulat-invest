import React from 'react';
import { Metadata } from 'next';
import { fetchMarketNews } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewsClientHub from './NewsClientHub';

export const revalidate = 60; // Refresh news every minute

export const metadata: Metadata = {
  title: 'Pakistan Stock Market News & Financial Intelligence - Daulat Invest',
  description:
    'Live business news, corporate earnings, interest rate updates, IMF reforms, and market commentary from Business Recorder, Dawn, Tribune, and Profit.',
  keywords: [
    'PSX News',
    'Pakistan Stock Exchange News',
    'Business Recorder PSX',
    'Dawn Business',
    'Pakistan Economy News',
    'KSE 100 Live News',
  ],
};

export default async function NewsPage() {
  const articles = await fetchMarketNews();

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F0F6FC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewsClientHub initialArticles={articles} />
      </main>

      <Footer />
    </div>
  );
}

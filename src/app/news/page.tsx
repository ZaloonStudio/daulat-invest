import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import { fetchMarketNews } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewsClientHub from './NewsClientHub';

export const revalidate = 60; // Refresh news every minute

export const metadata: Metadata = pageMetadata("/news", "Pakistan Stock Market & Business News", "Follow Pakistan stock market and business headlines, company developments and financial market news on Daulat Invest.");

export default async function NewsPage() {
  const articles = await fetchMarketNews();

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewsClientHub initialArticles={articles} />
      </main>

      <Footer />
    </div>
  );
}

import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import {
  getMarketSummary,
  fetchMarketNews,
  fetchCompanyAnnouncements,
} from '@/lib/psx';
import Navbar from '@/components/Navbar';
import HomeClientContainer from '@/components/HomeClientContainer';
import Footer from '@/components/Footer';
import { getPriceSnapshot } from '@/lib/commodity-feed';

export const revalidate = 15; // Revalidate every 15 seconds for live updates

export const metadata: Metadata = pageMetadata("/", "PSX Live Market & KSE 100 Index", "Track the Pakistan Stock Exchange with KSE 100 charts, share prices, market movers, stock screening and portfolio tools.");

export default async function HomePage() {
  const [summary, news, announcements, commodityPrices] = await Promise.all([
    getMarketSummary(),
    fetchMarketNews(),
    fetchCompanyAnnouncements(),
    getPriceSnapshot(),
  ]);

  const isOpen = summary.isOpen;
  const marketTime = summary.marketTime;

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <HomeClientContainer
          commodityPrices={commodityPrices}
          summary={summary}
          news={news}
          announcements={announcements}
          isOpen={isOpen}
          marketTime={marketTime}
        />
      </main>

      <Footer />
    </div>
  );
}

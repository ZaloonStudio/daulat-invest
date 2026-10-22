'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { MarketSummary, StockQuote, NewsArticle, CompanyAnnouncement } from '@/lib/types';
import QuickLinksBar from '@/components/QuickLinksBar';
import CommunityPreview from '@/components/CommunityPreview';
import IndicesBar from '@/components/IndicesBar';
import KseHeroSection from '@/components/KseHeroSection';
import HomeCommoditiesWidget from '@/components/HomeCommoditiesWidget';
import type { PriceSnapshot } from '@/lib/commodity-data';
import MarketMovers from '@/components/MarketMovers';
import IndexPerformanceTable from '@/components/IndexPerformanceTable';
import MarketNewsSection from '@/components/MarketNewsSection';
import CompanyAnnouncementsSection from '@/components/CompanyAnnouncementsSection';
import SectorsGrid from '@/components/SectorsGrid';
import AppPromoBanner from '@/components/AppPromoBanner';

interface HomeClientContainerProps {
  commodityPrices: PriceSnapshot;
  summary: MarketSummary;
  quotes: StockQuote[];
  news: NewsArticle[];
  announcements: CompanyAnnouncement[];
  isOpen: boolean;
  marketTime: string;
}

export default function HomeClientContainer({
  commodityPrices,
  summary,
  quotes,
  news,
  announcements,
  isOpen,
  marketTime,
}: HomeClientContainerProps) {
  const [selectedIndexCode, setSelectedIndexCode] = useState<string>('KSE100');
  const [moversFilter, setMoversFilter] = useState<'KSE100' | 'ALL' | 'ISLAMIC'>('KSE100');

  const scrollToIndices = () => {
    const element = document.getElementById('indices-section');
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-overview space-y-10">
      <div className="overview-heading">
        <div>
          <p className="eyebrow mb-4"><span className="w-5 h-px bg-current" />THE PAKISTAN MARKET, IN FOCUS</p>
          <h1 className="overview-title">Perspective.<br /><span className="text-[#B69249]">Then possibility.</span></h1>
          <p className="text-sm text-[#A4AEC1] mt-5 max-w-md leading-relaxed">Your view of the Pakistan Stock Exchange. Follow the market, explore opportunities, and build your next move.</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-4">
          <span className="eyebrow text-[#7F8DA4]">DAULAT / MARKET OVERVIEW</span>
          <Link href="/stocks/screener" className="inline-flex primary-action px-5 py-3 text-sm">Explore the screener <ArrowUpRight className="w-4 h-4" /></Link>
          <Link href="/stocks" className="inline-flex items-center gap-2 text-xs text-[#A4AEC1] hover:text-[#B69249]">Browse all stocks <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
      </div>

      {/* 1. Sleek Indices Horizontal Carousel */}
      <section id="indices-section" className="space-y-4">
        <IndicesBar
          indices={summary.indices}
          selectedIndex={selectedIndexCode}
          onSelectIndex={(code) => setSelectedIndexCode(code)}
        />

        {/* 2. 2-Column Hero: Interactive Chart + Index Stats & Sliders */}
        <KseHeroSection
          initialIndex={summary.kse100}
          allIndices={summary.indices}
          selectedIndexCode={selectedIndexCode}
          isPsxOpen={isOpen}
          marketTime={marketTime}
        />
      </section>

      <QuickLinksBar />

      {/* 2. Live Gold, Forex & Commodities Snapshot (Daulat Mobile App Integration) */}
      <section>
      <HomeCommoditiesWidget prices={commodityPrices} />
      </section>

      {/* 3. Market Movers: Volume Leaders, Gainers, Losers with Shariah Filter */}
      <section id="movers-section">
        <MarketMovers
          allStocks={quotes}
          topVolume={summary.topVolume}
          topGainers={summary.topGainers}
          topLosers={summary.topLosers}
          filter={moversFilter}
          onFilterChange={(f) => setMoversFilter(f)}
        />
      </section>

      {/* 4. Index Performance Full Table */}
      <section>
        <IndexPerformanceTable
          indices={summary.indices}
          onSelectIndex={(code) => {
            setSelectedIndexCode(code);
            scrollToIndices();
          }}
        />
      </section>

      {/* 5. PSX Investor Community Preview */}
      <section id="community-section">
        <CommunityPreview />
      </section>

      {/* 6. Live Business News Center */}
      <section id="news-section">
        <MarketNewsSection articles={news} />
      </section>

      {/* 7. Corporate Announcements & Filings */}
      <section id="announcements-section">
        <CompanyAnnouncementsSection announcements={announcements} />
      </section>

      {/* 8. Key Industry Sectors Breakdown */}
      <section id="sectors-section">
        <SectorsGrid quotes={quotes} />
      </section>

      {/* 9. Conversion App Promo Banner */}
      <section>
        <AppPromoBanner />
      </section>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { MarketSummary, StockQuote, NewsArticle, CompanyAnnouncement } from '@/lib/types';
import QuickLinksBar from '@/components/QuickLinksBar';
import CommunityPreview from '@/components/CommunityPreview';
import IndicesBar from '@/components/IndicesBar';
import KseHeroSection from '@/components/KseHeroSection';
import MarketMovers from '@/components/MarketMovers';
import IndexPerformanceTable from '@/components/IndexPerformanceTable';
import MarketNewsSection from '@/components/MarketNewsSection';
import CompanyAnnouncementsSection from '@/components/CompanyAnnouncementsSection';
import SectorsGrid from '@/components/SectorsGrid';
import AppPromoBanner from '@/components/AppPromoBanner';
import { Activity, Zap, Newspaper, FileText, Layers, Users } from 'lucide-react';

interface HomeClientContainerProps {
  summary: MarketSummary;
  quotes: StockQuote[];
  news: NewsArticle[];
  announcements: CompanyAnnouncement[];
  isOpen: boolean;
  marketTime: string;
}

export default function HomeClientContainer({
  summary,
  quotes,
  news,
  announcements,
  isOpen,
  marketTime,
}: HomeClientContainerProps) {
  const [selectedIndexCode, setSelectedIndexCode] = useState<string>('KSE100');
  const [activeSection, setActiveSection] = useState<
    'indices' | 'movers' | 'news' | 'community' | 'announcements' | 'sectors'
  >('indices');
  const [moversFilter, setMoversFilter] = useState<'KSE100' | 'ALL' | 'ISLAMIC'>('KSE100');

  const scrollToSection = (id: string, sectionKey: typeof activeSection) => {
    setActiveSection(sectionKey);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Page Navigation Pills */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F0F6FC] tracking-tight">
          Pakistan Stock Exchange Market Overview
        </h1>
        <p className="text-xs sm:text-sm text-[#8B949E] mt-1 max-w-3xl leading-relaxed">
          PSX live rates, KSE 100 interactive charts, market breadth, corporate announcements, and business news.
        </p>

        {/* Quick Nav Filter Pills */}
        <div className="flex items-center space-x-2 mt-4 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => scrollToSection('indices-section', 'indices')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'indices'
                ? 'bg-[#00D2B4] text-black shadow-sm font-extrabold'
                : 'bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Indices</span>
          </button>

          <button
            onClick={() => scrollToSection('movers-section', 'movers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'movers'
                ? 'bg-[#00D2B4] text-black shadow-sm font-extrabold'
                : 'bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Market Movers</span>
          </button>

          <button
            onClick={() => scrollToSection('community-section', 'community')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'community'
                ? 'bg-[#00D2B4] text-black shadow-sm font-extrabold'
                : 'bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Community</span>
          </button>

          <button
            onClick={() => scrollToSection('news-section', 'news')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'news'
                ? 'bg-[#00D2B4] text-black shadow-sm font-extrabold'
                : 'bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Market News</span>
          </button>

          <button
            onClick={() => scrollToSection('announcements-section', 'announcements')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'announcements'
                ? 'bg-[#00D2B4] text-black shadow-sm font-extrabold'
                : 'bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>

          <button
            onClick={() => scrollToSection('sectors-section', 'sectors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'sectors'
                ? 'bg-[#00D2B4] text-black shadow-sm font-extrabold'
                : 'bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sectors</span>
          </button>
        </div>
      </div>

      {/* CLEAN APP-STYLE QUICK LINKS (Direct Navigation to dedicated pages) */}
      <QuickLinksBar />

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
            scrollToSection('indices-section', 'indices');
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

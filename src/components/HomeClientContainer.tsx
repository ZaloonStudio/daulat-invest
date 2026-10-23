'use client';
import type {NewsFeedStatus} from '@/lib/news-feed';

import React from 'react';
import {useRouter} from 'next/navigation';
import {indexCompaniesPath} from '@/lib/index-members';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { MarketSummary, NewsArticle, CompanyAnnouncement } from '@/lib/types';
import {homeIndices} from '@/lib/market-layout';
import QuickLinksBar from '@/components/QuickLinksBar';
import CommunityPreview from '@/components/CommunityPreview';

import dynamic from 'next/dynamic';
const KseHeroSection = dynamic(() => import('@/components/KseHeroSection'), { loading: () => <div className="h-[440px] rounded-2xl bg-[#111A2B] animate-pulse" aria-label="Loading market chart" /> });
import HomeCommoditiesWidget from '@/components/HomeCommoditiesWidget';
import type { PriceSnapshot } from '@/lib/commodity-data';


import MarketNewsSection from '@/components/MarketNewsSection';
import CompanyAnnouncementsSection from '@/components/CompanyAnnouncementsSection';



interface HomeClientContainerProps {
  commodityPrices: PriceSnapshot;
  summary: MarketSummary;
  news: NewsArticle[];
  newsStatuses:NewsFeedStatus[];
  announcements: CompanyAnnouncement[];
  isOpen: boolean;
  marketTime: string;
}

export default function HomeClientContainer({
  commodityPrices,
  summary,
  news,newsStatuses,
  announcements,
  isOpen,
  marketTime,
}: HomeClientContainerProps) {
  const selectedIndexCode='KSE100';
  const router=useRouter();


  return (
    <div className="home-overview space-y-10">
      <div className="overview-heading">
        <div>
          <p className="eyebrow mb-4"><span className="w-5 h-px bg-current" />THE PAKISTAN MARKET, IN FOCUS</p>
          <h1 className="overview-title">Pakistan markets.<br /><span className="text-[#B69249]">A clearer view.</span></h1>
          <p className="text-sm text-[#A4AEC1] mt-5 max-w-md leading-relaxed">Your view of the Pakistan Stock Exchange. Follow the market, explore opportunities, and build your next move.</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-4">
          <span className="eyebrow text-[#7F8DA4]">DAULAT / MARKET OVERVIEW</span>
          <Link href="/stocks/screener" className="inline-flex primary-action px-5 py-3 text-sm">Explore the screener <ArrowUpRight className="w-4 h-4" /></Link>
          <Link href="/stocks" className="inline-flex items-center gap-2 text-xs text-[#A4AEC1] hover:text-[#B69249]">Browse all stocks <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
      </div>

      <section aria-label="Gold, forex and commodities"><HomeCommoditiesWidget prices={commodityPrices}/></section>
      <section id="indices-section">
        <KseHeroSection initialIndex={summary.kse100} allIndices={summary.indices} selectedIndexCode={selectedIndexCode} isPsxOpen={isOpen} marketTime={marketTime} compactIndices={homeIndices(summary.indices)} onSelectIndex={code=>router.push(indexCompaniesPath(code))}/>
      </section>
      <QuickLinksBar/>

      {/* 5. PSX Investor Community Preview */}
      <section id="community-section">
        <CommunityPreview />
      </section>

      {/* 6. Live Business News Center */}
      <section id="news-section">
        <MarketNewsSection articles={news} statuses={newsStatuses}/>
      </section>

      {/* 7. Corporate Announcements & Filings */}
      <section id="announcements-section">
        <CompanyAnnouncementsSection announcements={announcements} />
      </section>


    </div>
  );
}

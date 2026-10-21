'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  Gauge,
  FileText,
  CheckCircle,
  Newspaper,
  Users,
  Star,
  Briefcase,
} from 'lucide-react';

interface QuickLinksBarProps {
  onOpenDividendCalc: () => void;
  onOpenSipCalc: () => void;
  onSelectShariahFilter?: () => void;
}

export default function QuickLinksBar({
  onOpenDividendCalc,
  onOpenSipCalc,
  onSelectShariahFilter,
}: QuickLinksBarProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#00D2B4] animate-pulse" />
          <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
            Quick Links &amp; Investor Tools
          </h3>
        </div>
        <span className="text-[11px] text-[#8B949E] hidden sm:inline">
          Instant access to PSX calculators &amp; analytics
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        {/* 1. Dividend Calculator */}
        <button
          onClick={onOpenDividendCalc}
          className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] hover:border-[#FFB401] transition-all text-center cursor-pointer shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FFB401]/15 text-[#FFB401] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Calculator className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#F0F6FC] group-hover:text-[#FFB401] transition-colors leading-tight">
            Dividend Yield
          </span>
          <span className="text-[10px] text-[#8B949E] mt-0.5">Tax &amp; Payout</span>
        </button>

        {/* 2. SIP Wealth Calculator */}
        <button
          onClick={onOpenSipCalc}
          className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] hover:border-[#00D2B4] transition-all text-center cursor-pointer shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-[#00D2B4]/15 text-[#00D2B4] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#F0F6FC] group-hover:text-[#00D2B4] transition-colors leading-tight">
            SIP Calculator
          </span>
          <span className="text-[10px] text-[#8B949E] mt-0.5">DCA Compound</span>
        </button>

        {/* 3. Fear & Greed Index */}
        <button
          onClick={() => scrollTo('fear-greed-section')}
          className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] hover:border-[#7EE787] transition-all text-center cursor-pointer shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-[#7EE787]/15 text-[#7EE787] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Gauge className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#F0F6FC] group-hover:text-[#7EE787] transition-colors leading-tight">
            Fear &amp; Greed
          </span>
          <span className="text-[10px] text-[#8B949E] mt-0.5">PSX Sentiment</span>
        </button>

        {/* 4. Shariah Stocks */}
        <button
          onClick={() => {
            if (onSelectShariahFilter) onSelectShariahFilter();
            scrollTo('movers-section');
          }}
          className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] hover:border-[#00C076] transition-all text-center cursor-pointer shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-[#00C076]/15 text-[#00C076] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#F0F6FC] group-hover:text-[#00C076] transition-colors leading-tight">
            Shariah Stocks
          </span>
          <span className="text-[10px] text-[#8B949E] mt-0.5">KMI-30 Islamic</span>
        </button>

        {/* 5. PSX Filings & Announcements */}
        <button
          onClick={() => scrollTo('announcements-section')}
          className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] hover:border-[#388BFD] transition-all text-center cursor-pointer shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-[#388BFD]/15 text-[#388BFD] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#F0F6FC] group-hover:text-[#388BFD] transition-colors leading-tight">
            Announcements
          </span>
          <span className="text-[10px] text-[#8B949E] mt-0.5">PSX DPS Filings</span>
        </button>

        {/* 6. Market News */}
        <Link
          href="/news"
          className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] hover:border-[#FFB401] transition-all text-center shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FFB401]/15 text-[#FFB401] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Newspaper className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#F0F6FC] group-hover:text-[#FFB401] transition-colors leading-tight">
            Market News
          </span>
          <span className="text-[10px] text-[#8B949E] mt-0.5">Top Coverage</span>
        </Link>

        {/* 7. Community */}
        <Link
          href="/community"
          className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] hover:border-[#A371F7] transition-all text-center shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-[#A371F7]/15 text-[#A371F7] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#F0F6FC] group-hover:text-[#A371F7] transition-colors leading-tight">
            Community
          </span>
          <span className="text-[10px] text-[#8B949E] mt-0.5">Discussions</span>
        </Link>

        {/* 8. Watchlist */}
        <Link
          href="/watchlist"
          className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] hover:border-[#FFD33D] transition-all text-center shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FFD33D]/15 text-[#FFD33D] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Star className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#F0F6FC] group-hover:text-[#FFD33D] transition-colors leading-tight">
            Watchlist
          </span>
          <span className="text-[10px] text-[#8B949E] mt-0.5">Saved Stocks</span>
        </Link>

        {/* 9. Portfolio */}
        <Link
          href="/portfolio"
          className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] hover:border-[#00D2B4] transition-all text-center shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-[#00D2B4]/15 text-[#00D2B4] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#F0F6FC] group-hover:text-[#00D2B4] transition-colors leading-tight">
            Portfolio
          </span>
          <span className="text-[10px] text-[#8B949E] mt-0.5">Live P&amp;L</span>
        </Link>
      </div>
    </div>
  );
}

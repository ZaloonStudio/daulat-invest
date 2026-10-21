'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CompanyAnnouncement } from '@/lib/types';
import { FileText, ExternalLink, ArrowRight, Calendar } from 'lucide-react';

interface CompanyAnnouncementsSectionProps {
  announcements: CompanyAnnouncement[];
}

export default function CompanyAnnouncementsSection({
  announcements,
}: CompanyAnnouncementsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!announcements || announcements.length === 0) return null;

  const categories = ['ALL', 'Board Meeting', 'Legal / Regulatory', 'AGM / EOGM', 'Briefing Presentation'];

  const filtered =
    selectedCategory === 'ALL'
      ? announcements
      : announcements.filter((a) => a.type.toLowerCase().includes(selectedCategory.toLowerCase()));

  const getTypeBadge = (type: string) => {
    if (type.includes('Board')) {
      return 'bg-[#388BFD]/15 text-[#58A6FF] border-[#388BFD]/30';
    }
    if (type.includes('Legal') || type.includes('Regulatory')) {
      return 'bg-[#00D2B4]/15 text-[#00D2B4] border-[#00D2B4]/30';
    }
    if (type.includes('AGM') || type.includes('EOGM')) {
      return 'bg-[#FFB401]/15 text-[#FFB401] border-[#FFB401]/30';
    }
    if (type.includes('Briefing')) {
      return 'bg-[#A371F7]/15 text-[#BC8CFF] border-[#A371F7]/30';
    }
    return 'bg-[#21262D] text-[#8B949E] border-[#30363D]';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-[#00D2B4] uppercase tracking-widest block">
            PSX FILINGS
          </span>
          <h2 className="text-xl font-extrabold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#00D2B4]" />
            <span>Company Announcements</span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Real-time PSX disclosures with executive summaries and original source documents
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1 bg-[#161B22] p-1 rounded-xl border border-[#30363D] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#00D2B4] text-black shadow-sm'
                  : 'text-[#8B949E] hover:text-[#F0F6FC]'
              }`}
            >
              {cat === 'ALL' ? 'All Filings' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.slice(0, 6).map((ann) => (
          <div
            key={ann.id}
            className="bg-[#161B22] border border-[#30363D] hover:border-[#484F58] rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header: Company Name, Symbol & Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0B0E14] border border-[#30363D] flex items-center justify-center font-extrabold text-xs text-[#FFB401] group-hover:border-[#00D2B4] transition-colors flex-shrink-0">
                    {ann.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/stocks/${ann.symbol}`}
                        className="font-bold text-sm text-[#F0F6FC] hover:text-[#00D2B4] transition-colors"
                      >
                        {ann.symbol}
                      </Link>
                      <span className="text-[10px] text-[#6E7681] truncate max-w-[150px]">
                        {ann.companyName}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8B949E] flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-[#6E7681]" />
                      <span>
                        {ann.date} • {ann.time}
                      </span>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${getTypeBadge(
                    ann.type
                  )}`}
                >
                  {ann.type}
                </span>
              </div>

              {/* Title & Summary */}
              <h3 className="font-bold text-sm text-[#F0F6FC] group-hover:text-[#00D2B4] transition-colors leading-snug mb-2">
                {ann.title}
              </h3>

              <p className="text-xs text-[#8B949E] leading-relaxed line-clamp-3">
                {ann.summary || ann.title}
              </p>
            </div>

            {/* Bottom Actions: Official PDF & Stock Link */}
            <div className="pt-4 mt-4 border-t border-[#30363D]/60 flex items-center justify-between">
              <a
                href={ann.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#8B949E] hover:text-[#F0F6FC] inline-flex items-center space-x-1.5 font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#FFB401]" />
                <span>Original PDF</span>
                <ExternalLink className="w-3 h-3 text-[#6E7681]" />
              </a>

              <Link
                href={`/stocks/${ann.symbol}`}
                className="text-xs text-[#00D2B4] hover:text-[#00D2B4]/80 font-bold inline-flex items-center space-x-1"
              >
                <span>View Stock</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

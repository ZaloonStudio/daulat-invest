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
      return 'bg-[#9BBCE3]/15 text-[#9BBCE3] border-[#9BBCE3]/30';
    }
    if (type.includes('Legal') || type.includes('Regulatory')) {
      return 'bg-[#B9E76A]/15 text-[#B9E76A] border-[#B9E76A]/30';
    }
    if (type.includes('AGM') || type.includes('EOGM')) {
      return 'bg-[#D5F478]/15 text-[#D5F478] border-[#D5F478]/30';
    }
    if (type.includes('Briefing')) {
      return 'bg-[#B9ADDA]/15 text-[#B9ADDA] border-[#B9ADDA]/30';
    }
    return 'bg-[#1E3026] text-[#A4B3A7] border-[#2A3C31]';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold text-[#B9E76A] uppercase tracking-widest block">
            PSX FILINGS
          </span>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-[#F1F5EE] tracking-tight flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#B9E76A]" />
              <span>Company Announcements</span>
            </h2>
            <Link
              href="/announcements"
              className="text-xs font-semibold text-[#B9E76A] hover:text-[#B9E76A]/80 hidden sm:inline-flex items-center space-x-1"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-[#A4B3A7] mt-0.5">
            Real-time PSX disclosures with executive summaries and original source documents
          </p>
        </div>

        {/* Category Filter Pills & Mobile View All Link */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-[#121E18] p-1 rounded-xl border border-[#2A3C31] overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#B9E76A] text-black shadow-sm'
                    : 'text-[#A4B3A7] hover:text-[#F1F5EE]'
                }`}
              >
                {cat === 'ALL' ? 'All Filings' : cat}
              </button>
            ))}
          </div>

          <Link
            href="/announcements"
            className="sm:hidden text-xs font-semibold text-[#B9E76A] hover:underline whitespace-nowrap flex items-center space-x-1"
          >
            <span>All ({announcements.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Announcements 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.slice(0, 6).map((ann) => (
          <div
            key={ann.id}
            className="bg-[#121E18] border border-[#2A3C31] hover:border-[#496052] rounded-xl p-5 shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header: Company Name, Symbol & Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0C1411] border border-[#2A3C31] flex items-center justify-center font-semibold text-xs text-[#D5F478] group-hover:border-[#B9E76A] transition-colors flex-shrink-0">
                    {ann.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/stocks/${ann.symbol}`}
                        className="font-semibold text-sm text-[#F1F5EE] hover:text-[#B9E76A] transition-colors"
                      >
                        {ann.symbol}
                      </Link>
                      <span className="text-[10px] text-[#84988B] truncate max-w-[150px]">
                        {ann.companyName}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#A4B3A7] flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-[#84988B]" />
                      <span>
                        {ann.date} • {ann.time}
                      </span>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${getTypeBadge(
                    ann.type
                  )}`}
                >
                  {ann.type}
                </span>
              </div>

              {/* Title & Summary */}
              <h3 className="font-semibold text-sm text-[#F1F5EE] group-hover:text-[#B9E76A] transition-colors leading-snug mb-2">
                {ann.title}
              </h3>

              <p className="text-xs text-[#A4B3A7] leading-relaxed line-clamp-3">
                {ann.summary || ann.title}
              </p>
            </div>

            {/* Bottom Actions: Official PDF & Stock Link */}
            <div className="pt-4 mt-4 border-t border-[#2A3C31]/60 flex items-center justify-between">
              <a
                href={ann.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#A4B3A7] hover:text-[#F1F5EE] inline-flex items-center space-x-1.5 font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#D5F478]" />
                <span>Original PDF</span>
                <ExternalLink className="w-3 h-3 text-[#84988B]" />
              </a>

              <Link
                href={`/stocks/${ann.symbol}`}
                className="text-xs text-[#B9E76A] hover:text-[#B9E76A]/80 font-semibold inline-flex items-center space-x-1"
              >
                <span>View Stock</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom View All Announcements CTA Button */}
      <div className="pt-2 text-center">
        <Link
          href="/announcements"
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#121E18] border border-[#2A3C31] hover:border-[#B9E76A] hover:bg-[#18271F] text-xs font-semibold text-[#F1F5EE] transition-all shadow-md group"
        >
          <FileText className="w-4 h-4 text-[#B9E76A]" />
          <span>Browse All PSX Corporate Announcements ({announcements.length}+)</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#B9E76A] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

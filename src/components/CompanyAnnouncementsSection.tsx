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
      return 'bg-[#B69249]/15 text-[#B69249] border-[#B69249]/30';
    }
    if (type.includes('AGM') || type.includes('EOGM')) {
      return 'bg-[#B69249]/15 text-[#B69249] border-[#B69249]/30';
    }
    if (type.includes('Briefing')) {
      return 'bg-[#B9ADDA]/15 text-[#B9ADDA] border-[#B9ADDA]/30';
    }
    return 'bg-[#1C2940] text-[#A4AEC1] border-[#28354A]';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold text-[#B69249] uppercase tracking-widest block">
            PSX FILINGS
          </span>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-[#EFF3FA] tracking-tight flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#B69249]" />
              <span>Company Announcements</span>
            </h2>
            <Link
              href="/announcements"
              className="text-xs font-semibold text-[#B69249] hover:text-[#B69249]/80 hidden sm:inline-flex items-center space-x-1"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-[#A4AEC1] mt-0.5">
            Real-time PSX disclosures with executive summaries and original source documents
          </p>
        </div>

        {/* Category Filter Pills & Mobile View All Link */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-[#111A2B] p-1 rounded-xl border border-[#28354A] overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#B69249] text-black shadow-sm'
                    : 'text-[#A4AEC1] hover:text-[#EFF3FA]'
                }`}
              >
                {cat === 'ALL' ? 'All Filings' : cat}
              </button>
            ))}
          </div>

          <Link
            href="/announcements"
            className="sm:hidden text-xs font-semibold text-[#B69249] hover:underline whitespace-nowrap flex items-center space-x-1"
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
            className="bg-[#111A2B] border border-[#28354A] hover:border-[#465770] rounded-xl p-5 shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header: Company Name, Symbol & Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0B1120] border border-[#28354A] flex items-center justify-center font-semibold text-xs text-[#B69249] group-hover:border-[#B69249] transition-colors flex-shrink-0">
                    {ann.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/stocks/${ann.symbol}`}
                        className="font-semibold text-sm text-[#EFF3FA] hover:text-[#B69249] transition-colors"
                      >
                        {ann.symbol}
                      </Link>
                      <span className="text-[10px] text-[#7F8DA4] truncate max-w-[150px]">
                        {ann.companyName}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#A4AEC1] flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-[#7F8DA4]" />
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
              <h3 className="font-semibold text-sm text-[#EFF3FA] group-hover:text-[#B69249] transition-colors leading-snug mb-2">
                {ann.title}
              </h3>

              <p className="text-xs text-[#A4AEC1] leading-relaxed line-clamp-3">
                {ann.summary || ann.title}
              </p>
            </div>

            {/* Bottom Actions: Official PDF & Stock Link */}
            <div className="pt-4 mt-4 border-t border-[#28354A]/60 flex items-center justify-between">
              <a
                href={ann.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#A4AEC1] hover:text-[#EFF3FA] inline-flex items-center space-x-1.5 font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#B69249]" />
                <span>Original PDF</span>
                <ExternalLink className="w-3 h-3 text-[#7F8DA4]" />
              </a>

              <Link
                href={`/stocks/${ann.symbol}`}
                className="text-xs text-[#B69249] hover:text-[#B69249]/80 font-semibold inline-flex items-center space-x-1"
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
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#111A2B] border border-[#28354A] hover:border-[#B69249] hover:bg-[#172237] text-xs font-semibold text-[#EFF3FA] transition-all shadow-md group"
        >
          <FileText className="w-4 h-4 text-[#B69249]" />
          <span>Browse All PSX Corporate Announcements ({announcements.length}+)</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#B69249] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

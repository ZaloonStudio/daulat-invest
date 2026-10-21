'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CompanyAnnouncement } from '@/lib/types';
import {
  FileText,
  Search,
  Calendar,
  ExternalLink,
  Clock,
  ArrowLeft,
} from 'lucide-react';

interface AnnouncementsClientProps {
  initialAnnouncements: CompanyAnnouncement[];
}

export default function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', 'Financial Results', 'Board Meeting', 'Dividend / Payout', 'Material Info'];

  const filtered = useMemo(() => {
    return initialAnnouncements.filter((item) => {
      const matchSearch =
        search === '' ||
        item.symbol.toLowerCase().includes(search.toLowerCase()) ||
        item.companyName.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase());

      const matchType =
        selectedType === 'All' ||
        (selectedType === 'Financial Results' && (item.type.includes('Financial') || item.title.includes('Financial') || item.title.includes('Accounts'))) ||
        (selectedType === 'Board Meeting' && (item.type.includes('Meeting') || item.title.includes('Board'))) ||
        (selectedType === 'Dividend / Payout' && (item.title.includes('Dividend') || item.title.includes('Bonus') || item.title.includes('Payout'))) ||
        (selectedType === 'Material Info' && (item.type.includes('Material') || item.title.includes('Disclosure')));

      return matchSearch && matchType;
    });
  }, [initialAnnouncements, search, selectedType]);

  const getTypeBadge = (title: string, type: string) => {
    const t = (title + ' ' + type).toLowerCase();
    if (t.includes('financial') || t.includes('result') || t.includes('accounts')) {
      return { label: 'Financials', color: 'bg-[#388BFD]/15 text-[#388BFD] border-[#388BFD]/30' };
    }
    if (t.includes('dividend') || t.includes('payout') || t.includes('bonus')) {
      return { label: 'Dividend', color: 'bg-[#00C076]/15 text-[#00C076] border-[#00C076]/30' };
    }
    if (t.includes('board') || t.includes('meeting')) {
      return { label: 'Board Meeting', color: 'bg-[#FFB401]/15 text-[#FFB401] border-[#FFB401]/30' };
    }
    return { label: 'Disclosure', color: 'bg-[#A371F7]/15 text-[#A371F7] border-[#A371F7]/30' };
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#8B949E] hover:text-[#F0F6FC] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30363D] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#388BFD] uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" />
            <span>Official Exchange Disclosures</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F0F6FC] tracking-tight">
            Corporate Announcements &amp; Filings
          </h1>
          <p className="text-sm text-[#8B949E] mt-1.5 max-w-2xl">
            Real-time material information, board meeting notices, dividend declarations, and corporate disclosures directly from the Pakistan Stock Exchange.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol (e.g. HUBC) or title..."
            className="w-full bg-[#161B22] border border-[#30363D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#388BFD] transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedType === t
                ? 'bg-[#388BFD] text-white shadow-sm font-extrabold'
                : 'bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            {t}
          </button>
        ))}
        <span className="text-xs text-[#8B949E] ml-auto shrink-0 hidden sm:inline">
          Showing <strong className="text-[#F0F6FC]">{filtered.length}</strong> announcements
        </span>
      </div>

      {/* Filings List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const badge = getTypeBadge(item.title, item.type);

          return (
            <div
              key={item.id}
              className="bg-[#161B22] border border-[#30363D] hover:border-[#388BFD]/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/stocks/${item.symbol}`}
                    className="font-black text-sm text-[#FFB401] hover:underline"
                  >
                    {item.symbol}
                  </Link>
                  <span className="text-xs text-[#8B949E] font-medium truncate max-w-[240px]">
                    {item.companyName}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#F0F6FC] leading-snug">{item.title}</h3>

                <div className="flex items-center space-x-4 text-[11px] text-[#6E7681]">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.date}</span>
                  </span>
                  {item.time && (
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </span>
                  )}
                </div>
              </div>

              {item.documentUrl && (
                <a
                  href={item.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] text-xs font-bold text-[#F0F6FC] hover:text-[#388BFD] transition-colors shrink-0 w-fit"
                >
                  <span>View PSX Filing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-[#161B22] border border-[#30363D] rounded-2xl space-y-2">
            <FileText className="w-10 h-10 text-[#6E7681] mx-auto" />
            <h3 className="text-base font-bold text-[#F0F6FC]">No announcements found</h3>
            <p className="text-xs text-[#8B949E]">
              Try adjusting your search criteria or resetting filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

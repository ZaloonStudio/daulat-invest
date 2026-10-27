'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { announcementCompanyPath } from '@/lib/announcement-links';
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

      const typeText = (item.type + ' ' + item.title).toLowerCase();
      const matchType =
        selectedType === 'All' ||
        (selectedType === 'Financial Results' && /financial|accounts|results/.test(typeText)) ||
        (selectedType === 'Board Meeting' && /board|meeting/.test(typeText)) ||
        (selectedType === 'Dividend / Payout' && /dividend|bonus|payout/.test(typeText)) ||
        (selectedType === 'Material Info' && /material|disclosure|regulatory|legal|briefing/.test(typeText));

      return matchSearch && matchType;
    });
  }, [initialAnnouncements, search, selectedType]);

  const getTypeBadge = (title: string, type: string) => {
    const t = (title + ' ' + type).toLowerCase();
    if (t.includes('financial') || t.includes('result') || t.includes('accounts')) {
      return { label: 'Financials', color: 'bg-[#9BBCE3]/15 text-[#9BBCE3] border-[#9BBCE3]/30' };
    }
    if (t.includes('dividend') || t.includes('payout') || t.includes('bonus')) {
      return { label: 'Dividend', color: 'bg-[#6DDBA5]/15 text-[#6DDBA5] border-[#6DDBA5]/30' };
    }
    if (t.includes('board') || t.includes('meeting')) {
      return { label: 'Board Meeting', color: 'bg-[#B69249]/15 text-[#B69249] border-[#B69249]/30' };
    }
    return { label: 'Disclosure', color: 'bg-[#B9ADDA]/15 text-[#B9ADDA] border-[#B9ADDA]/30' };
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#A4AEC1] hover:text-[#EFF3FA] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#28354A] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#9BBCE3] uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" />
            <span>Official Exchange Disclosures</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#EFF3FA] tracking-tight">
            Company filings
          </h1>
          <p className="text-sm text-[#A4AEC1] mt-1.5 max-w-2xl">
            Real-time material information, board meeting notices, dividend declarations, and corporate disclosures directly from the Pakistan Stock Exchange.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4AEC1]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol (e.g. HUBC) or title..."
            className="w-full bg-[#111A2B] border border-[#28354A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#EFF3FA] placeholder-[#A4AEC1] focus:outline-none focus:border-[#9BBCE3] transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedType === t
                ? 'bg-[#9BBCE3] text-white shadow-sm font-semibold'
                : 'bg-[#111A2B] text-[#A4AEC1] hover:text-[#EFF3FA] border border-[#28354A]'
            }`}
          >
            {t}
          </button>
        ))}
        <span className="text-xs text-[#A4AEC1] ml-auto shrink-0 hidden sm:inline">
          Showing <strong className="text-[#EFF3FA]">{filtered.length}</strong> announcements
        </span>
      </div>

      {/* Filings List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const badge = getTypeBadge(item.title, item.type);

          return (
            <div
              key={item.id}
              className="bg-[#111A2B] border border-[#28354A] hover:border-[#9BBCE3]/50 rounded-xl p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <Link
                    href={announcementCompanyPath(item.symbol)}
                    className="font-semibold text-sm text-[#B69249] hover:underline"
                  >
                    {item.symbol}
                  </Link>
                  <span className="text-xs text-[#A4AEC1] font-medium truncate max-w-[240px]">
                    {item.companyName}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#EFF3FA] leading-snug">{item.title}</h3>

                <div className="flex items-center space-x-4 text-[11px] text-[#7F8DA4]">
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
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0B1120] hover:bg-[#1C2940] border border-[#28354A] text-xs font-semibold text-[#EFF3FA] hover:text-[#9BBCE3] transition-colors shrink-0 w-fit"
                >
                  <span>View PSX Filing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-[#111A2B] border border-[#28354A] rounded-xl space-y-2">
            <FileText className="w-10 h-10 text-[#7F8DA4] mx-auto" />
            <h3 className="text-base font-semibold text-[#EFF3FA]">No announcements found</h3>
            <p className="text-xs text-[#A4AEC1]">
              Try adjusting your search criteria or resetting filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

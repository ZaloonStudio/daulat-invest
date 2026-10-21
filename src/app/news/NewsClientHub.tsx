'use client';

import React, { useState, useMemo } from 'react';
import { NewsArticle } from '@/lib/types';
import { Search, ExternalLink, Calendar, Globe, Newspaper } from 'lucide-react';

interface NewsClientHubProps {
  initialArticles: NewsArticle[];
}

const FALLBACK_NEWS_IMAGE =
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';

export default function NewsClientHub({ initialArticles }: NewsClientHubProps) {
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const sources = useMemo(() => {
    const set = new Set<string>();
    initialArticles.forEach((a) => {
      if (a.source) set.add(a.source);
    });
    return ['All', ...Array.from(set)];
  }, [initialArticles]);

  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const matchSearch =
        search.trim() === '' ||
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.summary.toLowerCase().includes(search.toLowerCase());

      const matchSource = selectedSource === 'All' || article.source === selectedSource;

      return matchSearch && matchSource;
    });
  }, [initialArticles, search, selectedSource]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2A3C31] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#D5F478] uppercase tracking-wider mb-2">
            <Newspaper className="w-4 h-4" />
            <span>Financial Press &amp; Market Insights</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#F1F5EE] tracking-tight">
            Market news
          </h1>
          <p className="text-sm text-[#A4B3A7] mt-1.5 max-w-2xl">
            Real-time macroeconomic reporting, corporate earnings results, monetary policy developments, and KSE-100 analysis.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4B3A7]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news by company or topic..."
            className="w-full bg-[#121E18] border border-[#2A3C31] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F1F5EE] placeholder-[#A4B3A7] focus:outline-none focus:border-[#D5F478] transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs: Source & Category */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Source Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-semibold text-[#A4B3A7] flex items-center space-x-1 shrink-0 mr-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Sources:</span>
          </span>
          {sources.map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedSource === src
                  ? 'bg-[#D5F478] text-black shadow-sm font-semibold'
                  : 'bg-[#121E18] text-[#A4B3A7] hover:text-[#F1F5EE] border border-[#2A3C31]'
              }`}
            >
              {src}
            </button>
          ))}
        </div>

        {/* Total Count */}
        <div className="text-xs text-[#A4B3A7] font-medium shrink-0">
          Showing <span className="text-[#F1F5EE] font-semibold">{filteredArticles.length}</span> articles
        </div>
      </div>

      {/* Featured / Hero Article */}
      {filteredArticles.length > 0 && (
        <a
          href={filteredArticles[0].link}
          target="_blank"
          rel="noopener noreferrer"
          className="group grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#121E18] border border-[#2A3C31] hover:border-[#D5F478] rounded-xl overflow-hidden p-6 transition-all duration-300 shadow-xl"
        >
          <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase px-2.5 py-1 bg-[#D5F478]/15 text-[#D5F478] rounded-lg">
                  {filteredArticles[0].source}
                </span>
                <span className="text-xs text-[#A4B3A7] flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{filteredArticles[0].publishedAt}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#F1F5EE] group-hover:text-[#D5F478] transition-colors leading-snug">
                {filteredArticles[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-[#A4B3A7] leading-relaxed line-clamp-3">
                {filteredArticles[0].summary}
              </p>
            </div>

            <div className="pt-4 flex items-center space-x-2 text-xs font-semibold text-[#D5F478]">
              <span>Read Full Story on {filteredArticles[0].source}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="lg:col-span-5 relative h-60 sm:h-72 w-full rounded-xl overflow-hidden bg-[#0C1411] border border-[#2A3C31]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                failedImages[filteredArticles[0].id]
                  ? FALLBACK_NEWS_IMAGE
                  : filteredArticles[0].imageUrl || FALLBACK_NEWS_IMAGE
              }
              alt={filteredArticles[0].title}
              onError={() =>
                setFailedImages((prev) => ({ ...prev, [filteredArticles[0].id]: true }))
              }
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </a>
      )}

      {/* Grid of Other Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.slice(1).map((article) => (
          <a
            key={article.id}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between bg-[#121E18] border border-[#2A3C31] hover:border-[#D5F478] rounded-xl overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 shadow-md"
          >
            <div>
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#0C1411] border border-[#2A3C31] mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    failedImages[article.id]
                      ? FALLBACK_NEWS_IMAGE
                      : article.imageUrl || FALLBACK_NEWS_IMAGE
                  }
                  alt={article.title}
                  onError={() => setFailedImages((prev) => ({ ...prev, [article.id]: true }))}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 bg-[#0C1411]/85 text-[#F1F5EE] backdrop-blur-md rounded-md border border-[#2A3C31]">
                  {article.source}
                </span>
              </div>

              <div className="text-[11px] text-[#A4B3A7] flex items-center space-x-1 mb-2">
                <Calendar className="w-3 h-3" />
                <span>{article.publishedAt}</span>
              </div>

              <h3 className="text-sm font-semibold text-[#F1F5EE] group-hover:text-[#D5F478] transition-colors leading-snug line-clamp-2 mb-2">
                {article.title}
              </h3>

              <p className="text-xs text-[#A4B3A7] line-clamp-3 leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#2A3C31]/60 text-xs text-[#A4B3A7]">
              <span className="text-[#D5F478] font-semibold flex items-center space-x-1">
                <span>Read article</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-[11px]">{article.source}</span>
            </div>
          </a>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16 bg-[#121E18] border border-[#2A3C31] rounded-xl">
          <Newspaper className="w-10 h-10 text-[#84988B] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#F1F5EE]">No articles match your search</h3>
          <p className="text-xs text-[#A4B3A7] mt-1">
            Try adjusting your search terms or selecting &quot;All&quot; sources.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedSource('All');
            }}
            className="mt-4 px-4 py-2 bg-[#1E3026] hover:bg-[#2A3C31] text-[#F1F5EE] rounded-xl text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

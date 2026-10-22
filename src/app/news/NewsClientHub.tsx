'use client';

import React, { useState, useMemo } from 'react';
import { NewsArticle } from '@/lib/types';
import { Search, ExternalLink, Calendar, Globe, Newspaper } from 'lucide-react';

interface NewsClientHubProps {
  initialArticles: NewsArticle[];
}

const FALLBACK_NEWS_IMAGE =
  '/news-placeholder.svg';

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#28354A] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B69249] uppercase tracking-wider mb-2">
            <Newspaper className="w-4 h-4" />
            <span>Financial Press &amp; Market Insights</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#EFF3FA] tracking-tight">
            Market news
          </h1>
          <p className="text-sm text-[#A4AEC1] mt-1.5 max-w-2xl">
            Business headlines from Dawn RSS. Publisher dates shown; checked every five minutes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4AEC1]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news by company or topic..."
            className="w-full bg-[#111A2B] border border-[#28354A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#EFF3FA] placeholder-[#A4AEC1] focus:outline-none focus:border-[#B69249] transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs: Source & Category */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Source Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-semibold text-[#A4AEC1] flex items-center space-x-1 shrink-0 mr-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Sources:</span>
          </span>
          {sources.map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedSource === src
                  ? 'bg-[#B69249] text-black shadow-sm font-semibold'
                  : 'bg-[#111A2B] text-[#A4AEC1] hover:text-[#EFF3FA] border border-[#28354A]'
              }`}
            >
              {src}
            </button>
          ))}
        </div>

        {/* Total Count */}
        <div className="text-xs text-[#A4AEC1] font-medium shrink-0">
          Showing <span className="text-[#EFF3FA] font-semibold">{filteredArticles.length}</span> articles
        </div>
      </div>

      {/* Featured / Hero Article */}
      {filteredArticles.length > 0 && (
        <a
          href={filteredArticles[0].link}
          target="_blank"
          rel="noopener noreferrer"
          className="group grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#111A2B] border border-[#28354A] hover:border-[#B69249] rounded-xl overflow-hidden p-6 transition-all duration-300 shadow-xl"
        >
          <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase px-2.5 py-1 bg-[#B69249]/15 text-[#B69249] rounded-lg">
                  {filteredArticles[0].source}
                </span>
                <span className="text-xs text-[#A4AEC1] flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(filteredArticles[0].publishedAt).toLocaleDateString('en-GB')}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#EFF3FA] group-hover:text-[#B69249] transition-colors leading-snug">
                {filteredArticles[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-[#A4AEC1] leading-relaxed line-clamp-3">
                {filteredArticles[0].summary}
              </p>
            </div>

            <div className="pt-4 flex items-center space-x-2 text-xs font-semibold text-[#B69249]">
              <span>Read Full Story on {filteredArticles[0].source}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="lg:col-span-5 relative h-60 sm:h-72 w-full rounded-xl overflow-hidden bg-[#0B1120] border border-[#28354A]">
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
            className="group flex flex-col justify-between bg-[#111A2B] border border-[#28354A] hover:border-[#B69249] rounded-xl overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 shadow-md"
          >
            <div>
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#0B1120] border border-[#28354A] mb-4">
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
                <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 bg-[#0B1120]/85 text-[#EFF3FA] backdrop-blur-md rounded-md border border-[#28354A]">
                  {article.source}
                </span>
              </div>

              <div className="text-[11px] text-[#A4AEC1] flex items-center space-x-1 mb-2">
                <Calendar className="w-3 h-3" />
                <span>{new Date(article.publishedAt).toLocaleDateString('en-GB')}</span>
              </div>

              <h3 className="text-sm font-semibold text-[#EFF3FA] group-hover:text-[#B69249] transition-colors leading-snug line-clamp-2 mb-2">
                {article.title}
              </h3>

              <p className="text-xs text-[#A4AEC1] line-clamp-3 leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#28354A]/60 text-xs text-[#A4AEC1]">
              <span className="text-[#B69249] font-semibold flex items-center space-x-1">
                <span>Read article</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-[11px]">{article.source}</span>
            </div>
          </a>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16 bg-[#111A2B] border border-[#28354A] rounded-xl">
          <Newspaper className="w-10 h-10 text-[#7F8DA4] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#EFF3FA]">{initialArticles.length?'No articles match your search':'Publisher news feed unavailable'}</h3>
          <p className="text-xs text-[#A4AEC1] mt-1">
            Try adjusting your search terms or selecting &quot;All&quot; sources.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedSource('All');
            }}
            className="mt-4 px-4 py-2 bg-[#1C2940] hover:bg-[#28354A] text-[#EFF3FA] rounded-xl text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

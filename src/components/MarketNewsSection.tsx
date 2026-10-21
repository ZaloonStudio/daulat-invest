'use client';

import React from 'react';
import Link from 'next/link';
import { NewsArticle } from '@/lib/types';
import { Newspaper, ExternalLink, ArrowRight } from 'lucide-react';

interface MarketNewsSectionProps {
  articles: NewsArticle[];
}

export default function MarketNewsSection({ articles }: MarketNewsSectionProps) {
  if (!articles || articles.length === 0) return null;

  const featured = articles[0];
  const sideArticles = articles.slice(1, 5);

  const getSourceBadgeColor = (source: string) => {
    switch (source.toUpperCase()) {
      case 'PROFIT':
        return 'bg-[#388BFD]/20 text-[#58A6FF] border-[#388BFD]/40';
      case 'RECORDER':
        return 'bg-[#FFB401]/20 text-[#FFB401] border-[#FFB401]/40';
      case 'DAWN':
        return 'bg-[#00C076]/20 text-[#00C076] border-[#00C076]/40';
      case 'TRIBUNE':
        return 'bg-[#F85149]/20 text-[#F85149] border-[#F85149]/40';
      case 'METTIS':
        return 'bg-[#A371F7]/20 text-[#BC8CFF] border-[#A371F7]/40';
      default:
        return 'bg-[#21262D] text-[#8B949E] border-[#30363D]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-[#00D2B4] uppercase tracking-widest block">
            LATEST HEADLINES
          </span>
          <h2 className="text-xl font-extrabold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
            <Newspaper className="w-5 h-5 text-[#00D2B4]" />
            <span>Market News</span>
          </h2>
        </div>

        <Link
          href="/news"
          className="text-xs font-bold text-[#00D2B4] hover:text-[#00D2B4]/80 inline-flex items-center space-x-1"
        >
          <span>VIEW ALL NEWS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2-Column Grid: Featured on Left, List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Featured Left Card (5 cols) */}
        {featured && (
          <div className="lg:col-span-5 bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-xl hover:border-[#484F58] transition-all flex flex-col justify-between group">
            <a
              href={featured.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative w-full h-48 sm:h-56 overflow-hidden bg-[#0B0E14]"
            >
              {featured.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-[#21262D] flex items-center justify-center text-[#8B949E]">
                  <Newspaper className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 left-3 flex items-center space-x-2">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border backdrop-blur-md ${getSourceBadgeColor(
                    featured.source
                  )}`}
                >
                  {featured.source}
                </span>
                <span className="text-[10px] font-semibold text-[#F0F6FC] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                  {featured.publishedAt}
                </span>
              </div>
            </a>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <a
                  href={featured.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-bold text-base sm:text-lg text-[#F0F6FC] group-hover:text-[#00D2B4] transition-colors leading-snug mb-2"
                >
                  {featured.title}
                </a>
                <p className="text-xs text-[#8B949E] line-clamp-3 leading-relaxed">
                  {featured.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#30363D]/60 flex items-center justify-between">
                <span className="text-[11px] text-[#6E7681]">Dawn • Recorder • Profit Feeds</span>
                <a
                  href={featured.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00D2B4] hover:underline flex items-center space-x-1 font-semibold"
                >
                  <span>Read Article</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Right 4-Item List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {sideArticles.map((article) => (
            <a
              key={article.id}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#161B22] border border-[#30363D] hover:border-[#484F58] hover:bg-[#1C2128] rounded-xl p-3.5 transition-all flex items-center space-x-3.5 group shadow-sm"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 sm:w-24 sm:h-20 rounded-lg overflow-hidden bg-[#0B0E14] flex-shrink-0 relative border border-[#30363D]/60">
                {article.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8B949E]">
                    <Newspaper className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getSourceBadgeColor(
                      article.source
                    )}`}
                  >
                    {article.source}
                  </span>
                  <span className="text-[11px] text-[#6E7681]">{article.publishedAt}</span>
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-[#F0F6FC] group-hover:text-[#00D2B4] transition-colors line-clamp-2 leading-tight">
                  {article.title}
                </h3>

                <p className="text-[11px] text-[#8B949E] line-clamp-1 mt-1 hidden sm:block">
                  {article.summary}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

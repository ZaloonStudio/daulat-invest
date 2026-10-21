'use client';

import React, { useRef } from 'react';
import { IndexQuote } from '@/lib/types';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Moon } from 'lucide-react';

interface IndicesBarProps {
  indices: IndexQuote[];
  selectedIndex?: string;
  onSelectIndex?: (code: string) => void;
}

export default function IndicesBar({
  indices,
  selectedIndex = 'KSE100',
  onSelectIndex,
}: IndicesBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!indices || indices.length === 0) return null;

  // Filter to major recognizable PSX indices first, followed by others
  const priorityOrder = ['KSE100', 'KSEALL', 'ALLSHR', 'KSE30', 'KMI30', 'KMIALL', 'PSXDIV20', 'BKTI', 'OGTI'];
  const sorted = [...indices].sort((a, b) => {
    const aIdx = priorityOrder.indexOf(a.code);
    const bIdx = priorityOrder.indexOf(b.code);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.code.localeCompare(b.code);
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll indices left"
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#161B22]/95 border border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#FFB401] items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex items-center space-x-3 overflow-x-auto scrollbar-none py-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sorted.map((idx) => {
          const isPositive = idx.change >= 0;
          const isSelected = idx.code === selectedIndex;
          const isIslamic = idx.code.includes('KMI') || idx.code.includes('MZN');

          return (
            <button
              key={idx.code}
              onClick={() => onSelectIndex?.(idx.code)}
              className={`flex-shrink-0 min-w-[170px] text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1C2128] border-[#FFB401]/80 shadow-[0_0_12px_rgba(255,180,1,0.15)] ring-1 ring-[#FFB401]/30'
                  : 'bg-[#161B22] border-[#30363D]/80 hover:border-[#484F58] hover:bg-[#1C2128]/70'
              }`}
            >
              <div className="flex items-center justify-between space-x-2">
                <span className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center space-x-1">
                  <span>{idx.code}</span>
                  {isIslamic && (
                    <span
                      title="Shariah Compliant Index"
                      className="text-[#00C076] text-[10px] flex items-center"
                    >
                      <Moon className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                </span>

                <span
                  className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded flex items-center space-x-0.5 ${
                    isPositive
                      ? 'bg-[#00C076]/15 text-[#00C076]'
                      : 'bg-[#F85149]/15 text-[#F85149]'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {idx.changePercent.toFixed(2)}%
                  </span>
                </span>
              </div>

              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-sm font-extrabold text-[#F0F6FC] font-mono tracking-tight">
                  {idx.current.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={`text-[11px] font-mono font-medium ${
                    isPositive ? 'text-[#00C076]' : 'text-[#F85149]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {idx.change.toFixed(2)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll indices right"
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#161B22]/95 border border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#FFB401] items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

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
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#111A2B]/95 border border-[#28354A] text-[#A4AEC1] hover:text-[#EFF3FA] hover:border-[#B69249] items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
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
              aria-pressed={isSelected}
              onClick={() => onSelectIndex?.(idx.code)}
              className={`flex-shrink-0 min-w-[192px] text-left p-4 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#172237] border-[#B69249]/60'
                  : 'bg-[#111A2B] border-[#28354A]/80 hover:border-[#465770] hover:bg-[#172237]/70'
              }`}
            >
              <div className="flex items-center justify-between space-x-2">
                <span className="text-xs font-semibold text-[#EFF3FA] uppercase tracking-wider flex items-center space-x-1">
                  <span>{idx.code}</span>
                  {isIslamic && (
                    <span
                      title="Shariah Compliant Index"
                      className="text-[#6DDBA5] text-[10px] flex items-center"
                    >
                      <Moon className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                </span>

                <span
                  className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded flex items-center space-x-0.5 ${
                    isPositive
                      ? 'bg-[#6DDBA5]/15 text-[#6DDBA5]'
                      : 'bg-[#F28B82]/15 text-[#F28B82]'
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

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-lg font-semibold text-[#EFF3FA] font-mono tracking-tight">
                  {idx.current.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={`text-[11px] font-mono font-medium ${
                    isPositive ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
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
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#111A2B]/95 border border-[#28354A] text-[#A4AEC1] hover:text-[#EFF3FA] hover:border-[#B69249] items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

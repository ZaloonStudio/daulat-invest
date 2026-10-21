'use client';

import React from 'react';
import { IndexQuote } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface IndicesBarProps {
  indices: IndexQuote[];
}

export default function IndicesBar({ indices }: IndicesBarProps) {
  if (!indices || indices.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {indices.map((idx) => {
        const isPositive = idx.change >= 0;
        return (
          <div
            key={idx.code}
            className="bg-[#161B22] border border-[#30363D] hover:border-[#484F58] rounded-xl p-3.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
                {idx.code}
              </span>
              <span
                className={`text-[11px] font-bold font-mono flex items-center space-x-0.5 ${
                  isPositive ? 'text-[#00C076]' : 'text-[#F85149]'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                  {isPositive ? '+' : ''}
                  {idx.changePercent.toFixed(2)}%
                </span>
              </span>
            </div>

            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-extrabold text-[#F0F6FC] font-mono">
                {idx.current.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span
                className={`text-xs font-mono font-medium ${
                  isPositive ? 'text-[#00C076]' : 'text-[#F85149]'
                }`}
              >
                {isPositive ? '+' : ''}
                {idx.change.toFixed(2)}
              </span>
            </div>

            <div className="mt-1.5 flex justify-between text-[10px] text-[#6E7681] border-t border-[#30363D]/50 pt-1">
              <span>H: {idx.high.toLocaleString()}</span>
              <span>L: {idx.low.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { IndexQuote } from '@/lib/types';
import { TrendingUp, TrendingDown, Moon, ArrowRight } from 'lucide-react';

interface IndexPerformanceTableProps {
  indices: IndexQuote[];
  onSelectIndex?: (code: string) => void;
}

export default function IndexPerformanceTable({
  indices,
  onSelectIndex,
}: IndexPerformanceTableProps) {
  if (!indices || indices.length === 0) return null;

  const formatVolume = (vol?: number) => {
    if (!vol) return '—';
    if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(2)}B`;
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toLocaleString();
  };

  return (
    <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-5 shadow-xl">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#2A3C31]">
        <div>
          <span className="text-[10px] font-semibold text-[#B9E76A] uppercase tracking-widest block">
            PSX INDICES
          </span>
          <h2 className="text-xl font-semibold text-[#F1F5EE] tracking-tight">
            Index Performance
          </h2>
        </div>

        <Link
          href="/stocks?tab=indices"
          className="text-xs font-semibold text-[#B9E76A] hover:text-[#B9E76A]/80 inline-flex items-center space-x-1"
        >
          <span>VIEW ALL INDICES</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-[11px] font-semibold text-[#A4B3A7] uppercase tracking-wider border-b border-[#2A3C31]/60">
              <th className="pb-3 pl-2">Indices</th>
              <th className="pb-3 text-right">Current</th>
              <th className="pb-3 text-right">Change (%)</th>
              <th className="pb-3 text-right">Volume</th>
              <th className="pb-3 text-right">Value</th>
              <th className="pb-3 text-right">Open</th>
              <th className="pb-3 text-right">High</th>
              <th className="pb-3 text-right pr-2">Low</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3C31]/40">
            {indices.slice(0, 8).map((idx) => {
              const isPositive = idx.change >= 0;
              const isIslamic = idx.code.includes('KMI') || idx.code.includes('MZN');

              return (
                <tr
                  key={idx.code}
                  onClick={() => onSelectIndex?.(idx.code)}
                  className="hover:bg-[#1E3026]/60 transition-colors group cursor-pointer"
                >
                  {/* Code & Name */}
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-[#F1F5EE] group-hover:text-[#B9E76A] transition-colors">
                        {idx.code}
                      </span>
                      {isIslamic && (
                        <span
                          title="Shariah Compliant Index"
                          className="text-[#6DDBA5] text-xs flex items-center"
                        >
                          <Moon className="w-3 h-3 fill-current" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#A4B3A7] block">{idx.name}</span>
                  </td>

                  {/* Current Value */}
                  <td className="py-3.5 text-right font-mono font-semibold text-sm text-[#F1F5EE]">
                    {idx.current.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Change & Percent */}
                  <td className="py-3.5 text-right font-mono text-xs">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded font-semibold ${
                        isPositive
                          ? 'bg-[#6DDBA5]/15 text-[#6DDBA5]'
                          : 'bg-[#F28B82]/15 text-[#F28B82]'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}
                        {idx.change.toFixed(2)} ({isPositive ? '+' : ''}
                        {idx.changePercent.toFixed(2)}%)
                      </span>
                    </span>
                  </td>

                  {/* Volume */}
                  <td className="py-3.5 text-right font-mono text-xs text-[#A4B3A7]">
                    {formatVolume(idx.volume)}
                  </td>

                  {/* Value */}
                  <td className="py-3.5 text-right font-mono text-xs text-[#A4B3A7]">
                    {idx.value ? `${formatVolume(idx.value)} PKR` : '—'}
                  </td>

                  {/* Open */}
                  <td className="py-3.5 text-right font-mono text-xs text-[#A4B3A7]">
                    {(idx.open || idx.ldcp || idx.current).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* High */}
                  <td className="py-3.5 text-right font-mono text-xs text-[#A4B3A7]">
                    {idx.high.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Low */}
                  <td className="py-3.5 text-right pr-2 font-mono text-xs text-[#A4B3A7]">
                    {idx.low.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

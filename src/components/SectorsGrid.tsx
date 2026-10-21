import React from 'react';
import Link from 'next/link';
import { StockQuote } from '@/lib/types';
import { Layers } from 'lucide-react';

interface SectorsGridProps {
  quotes: StockQuote[];
}

export default function SectorsGrid({ quotes }: SectorsGridProps) {
  // Aggregate sectors
  const sectorMap: Record<string, { count: number; totalVolume: number; avgChange: number; topStock: string }> = {};

  quotes.forEach((q) => {
    const s = q.sector || 'MISCELLANEOUS';
    if (!sectorMap[s]) {
      sectorMap[s] = { count: 0, totalVolume: 0, avgChange: 0, topStock: q.symbol };
    }
    sectorMap[s].count++;
    sectorMap[s].totalVolume += q.volume;
    sectorMap[s].avgChange += q.changePercent;
  });

  const sectors = Object.entries(sectorMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      totalVolume: data.totalVolume,
      avgChange: data.count > 0 ? data.avgChange / data.count : 0,
      topStock: data.topStock,
    }))
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, 8); // Top 8 active sectors

  return (
    <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5 border-b border-[#28354A] pb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#EFF3FA] flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#B69249]" />
            <span>Key Sectors</span>
          </h2>
          <p className="text-xs text-[#A4AEC1] mt-0.5">Top industry sectors ranked by trading volume</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sectors.map((sec) => {
          const isPositive = sec.avgChange >= 0;
          return (
            <Link
              key={sec.name}
              href={`/stocks?sector=${encodeURIComponent(sec.name)}`}
              className="bg-[#0B1120] border border-[#28354A] hover:border-[#B69249]/50 p-3.5 rounded-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-[#EFF3FA] group-hover:text-[#B69249] transition-colors line-clamp-1">
                  {sec.name}
                </span>
                <span className="text-[11px] text-[#A4AEC1] mt-0.5 block">
                  {sec.count} Companies Listed
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#28354A]/60 flex items-center justify-between text-xs font-mono">
                <span className="text-[#A4AEC1]">
                  {(sec.totalVolume / 1000000).toFixed(1)}M vol
                </span>
                <span
                  className={`font-semibold ${
                    isPositive ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {sec.avgChange.toFixed(2)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

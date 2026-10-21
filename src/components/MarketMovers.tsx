'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StockQuote } from '@/lib/types';
import { Flame, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

interface MarketMoversProps {
  topVolume: StockQuote[];
  topGainers: StockQuote[];
  topLosers: StockQuote[];
}

export default function MarketMovers({
  topVolume,
  topGainers,
  topLosers,
}: MarketMoversProps) {
  const [activeTab, setActiveTab] = useState<'volume' | 'gainers' | 'losers'>('volume');

  const currentList =
    activeTab === 'volume' ? topVolume : activeTab === 'gainers' ? topGainers : topLosers;

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toLocaleString();
  };

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-xl">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#30363D] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#F0F6FC]">Market Movers</h2>
          <p className="text-xs text-[#8B949E] mt-0.5">Top active stocks and daily leaders on PSX</p>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#0B0E14] p-1 rounded-xl border border-[#30363D]">
          <button
            onClick={() => setActiveTab('volume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'volume'
                ? 'bg-[#21262D] text-[#FFB401] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Top Volume</span>
          </button>

          <button
            onClick={() => setActiveTab('gainers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'gainers'
                ? 'bg-[#21262D] text-[#00C076] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Gainers</span>
          </button>

          <button
            onClick={() => setActiveTab('losers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'losers'
                ? 'bg-[#21262D] text-[#F85149] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Losers</span>
          </button>
        </div>
      </div>

      {/* Stocks Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D]">
              <th className="pb-3 pl-2">Symbol</th>
              <th className="pb-3">Sector</th>
              <th className="pb-3 text-right">Price</th>
              <th className="pb-3 text-right">Change</th>
              <th className="pb-3 text-right pr-2">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363D]/60">
            {currentList.map((stock, idx) => {
              const isPositive = stock.change >= 0;
              return (
                <tr
                  key={stock.symbol}
                  className="hover:bg-[#21262D]/60 transition-colors group cursor-pointer"
                >
                  <td className="py-3 pl-2">
                    <Link href={`/stocks/${stock.symbol}`} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#21262D] border border-[#30363D] flex items-center justify-center font-bold text-xs text-[#FFB401] group-hover:border-[#FFB401] transition-colors">
                        {stock.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-[#F0F6FC] group-hover:text-[#FFB401] transition-colors flex items-center space-x-1">
                          <span>{stock.symbol}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-[#8B949E] truncate max-w-[160px] sm:max-w-[220px]">
                          {stock.name}
                        </div>
                      </div>
                    </Link>
                  </td>

                  <td className="py-3 text-xs text-[#8B949E] truncate max-w-[140px]">
                    <span className="bg-[#0B0E14] px-2 py-0.5 rounded border border-[#30363D] text-[10px]">
                      {stock.sector}
                    </span>
                  </td>

                  <td className="py-3 text-right font-mono font-bold text-[#F0F6FC]">
                    Rs {stock.current.toFixed(2)}
                  </td>

                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        isPositive
                          ? 'bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/30'
                          : 'bg-[#F85149]/10 text-[#F85149] border border-[#F85149]/30'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%)
                    </span>
                  </td>

                  <td className="py-3 text-right font-mono text-xs text-[#8B949E] pr-2">
                    {formatVolume(stock.volume)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Link to All Stocks */}
      <div className="mt-4 pt-4 border-t border-[#30363D] text-center">
        <Link
          href="/stocks"
          className="text-xs text-[#388BFD] hover:underline font-semibold inline-flex items-center space-x-1"
        >
          <span>View All 500+ PSX Listed Stocks</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

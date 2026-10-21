'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { StockQuote } from '@/lib/types';
import { Search, ChevronRight, ArrowUpDown, Filter } from 'lucide-react';

interface Props {
  initialQuotes: StockQuote[];
  sectors: string[];
}

export default function StocksDirectoryClient({ initialQuotes, sectors }: Props) {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'volume' | 'gainers' | 'losers' | 'symbol' | 'price'>('volume');

  const filtered = useMemo(() => {
    let list = [...initialQuotes];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (item) => item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
      );
    }

    if (selectedSector !== 'ALL') {
      list = list.filter((item) => item.sector === selectedSector);
    }

    switch (sortBy) {
      case 'volume':
        list.sort((a, b) => b.volume - a.volume);
        break;
      case 'gainers':
        list.sort((a, b) => b.changePercent - a.changePercent);
        break;
      case 'losers':
        list.sort((a, b) => a.changePercent - b.changePercent);
        break;
      case 'symbol':
        list.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
      case 'price':
        list.sort((a, b) => b.current - a.current);
        break;
    }

    return list;
  }, [initialQuotes, search, selectedSector, sortBy]);

  return (
    <div className="space-y-6">
      {/* Controls: Search, Sector dropdown & Sort */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by symbol or company name..."
            className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl pl-10 pr-4 py-2 text-sm text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#FFB401]"
          />
        </div>

        {/* Sector Selector */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-[#0B0E14] border border-[#30363D] text-xs text-[#F0F6FC] rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-[#FFB401]"
          >
            <option value="ALL">All Sectors ({initialQuotes.length})</option>
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0B0E14] border border-[#30363D] text-xs text-[#F0F6FC] rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-[#FFB401]"
          >
            <option value="volume">Sort: Highest Volume</option>
            <option value="gainers">Sort: Top Gainers</option>
            <option value="losers">Sort: Top Losers</option>
            <option value="price">Sort: Highest Price</option>
            <option value="symbol">Sort: Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-[#8B949E] px-1 flex items-center justify-between">
        <span>Showing {filtered.length} of {initialQuotes.length} stocks</span>
        {selectedSector !== 'ALL' && (
          <button
            onClick={() => setSelectedSector('ALL')}
            className="text-[#FFB401] hover:underline"
          >
            Clear sector filter
          </button>
        )}
      </div>

      {/* Directory Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#0B0E14] text-[11px] font-bold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D]">
                <th className="py-3.5 pl-4">Company</th>
                <th className="py-3.5">Sector</th>
                <th className="py-3.5 text-right">Current Price</th>
                <th className="py-3.5 text-right">Day Change</th>
                <th className="py-3.5 text-right">High / Low</th>
                <th className="py-3.5 text-right pr-4">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60">
              {filtered.map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-[#21262D]/60 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 pl-4">
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#0B0E14] border border-[#30363D] flex items-center justify-center font-bold text-xs text-[#FFB401] group-hover:border-[#FFB401] transition-colors">
                          {stock.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-[#F0F6FC] group-hover:text-[#FFB401] transition-colors flex items-center space-x-1">
                            <span>{stock.symbol}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-xs text-[#8B949E] truncate max-w-[180px] sm:max-w-[260px]">
                            {stock.name}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="py-3.5 text-xs text-[#8B949E]">
                      <span className="bg-[#0B0E14] px-2 py-0.5 rounded border border-[#30363D] text-[10px]">
                        {stock.sector}
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono font-bold text-[#F0F6FC]">
                      Rs {stock.current.toFixed(2)}
                    </td>

                    <td className="py-3.5 text-right">
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

                    <td className="py-3.5 text-right font-mono text-xs text-[#8B949E]">
                      {stock.high > 0 ? stock.high.toFixed(2) : '-'} /{' '}
                      {stock.low > 0 ? stock.low.toFixed(2) : '-'}
                    </td>

                    <td className="py-3.5 text-right font-mono text-xs text-[#F0F6FC] pr-4">
                      {stock.volume.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

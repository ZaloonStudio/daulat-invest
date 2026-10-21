'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { StockQuote } from '@/lib/types';
import { Search, ArrowLeft, ExternalLink, Moon } from 'lucide-react';

interface ShariahClientProps {
  stocks: StockQuote[];
}

export default function ShariahClient({ stocks }: ShariahClientProps) {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');

  const sectors = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach((s) => {
      if (s.sector) set.add(s.sector);
    });
    return ['All', ...Array.from(set)];
  }, [stocks]);

  const filtered = useMemo(() => {
    return stocks.filter((s) => {
      const matchSearch =
        search === '' ||
        s.symbol.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase());

      const matchSector = selectedSector === 'All' || s.sector === selectedSector;
      return matchSearch && matchSector;
    });
  }, [stocks, search, selectedSector]);

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#8B949E] hover:text-[#F0F6FC] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30363D] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#00C076] uppercase tracking-wider mb-2">
            <Moon className="w-4 h-4 fill-current" />
            <span>KMI Islamic Screener</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F0F6FC] tracking-tight">
            Shariah-Compliant Stocks (KMI-30 / All Shares)
          </h1>
          <p className="text-sm text-[#8B949E] mt-1.5 max-w-2xl">
            Equities screened and approved in accordance with certified Islamic Shariah criteria (debt-to-asset thresholds, non-permissible revenue caps, and cash ratios).
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Shariah stock (e.g. MEBL)..."
            className="w-full bg-[#161B22] border border-[#30363D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#00C076] transition-colors"
          />
        </div>
      </div>

      {/* Sector Filter & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedSector === sec
                  ? 'bg-[#00C076] text-black shadow-sm font-extrabold'
                  : 'bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#8B949E] shrink-0">
          Showing <strong className="text-[#F0F6FC]">{filtered.length}</strong> compliant stocks
        </span>
      </div>

      {/* Stocks Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0E14] border-b border-[#30363D] text-[10px] text-[#8B949E] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Symbol &amp; Name</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">Price (PKR)</th>
                <th className="py-3 px-4 text-right">Day %</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">Div Yield</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">P/E Ratio</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">Volume</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60">
              {filtered.map((stock) => {
                const isPos = stock.change >= 0;
                return (
                  <tr key={stock.symbol} className="hover:bg-[#21262D]/60 transition-colors group">
                    <td className="py-3 px-4">
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        className="flex flex-col group-hover:text-[#FFB401] transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-[#F0F6FC] text-sm group-hover:text-[#FFB401]">
                            {stock.symbol}
                          </span>
                          <span className="text-[9px] bg-[#00C076]/15 text-[#00C076] px-1.5 py-0.2 rounded font-bold">
                            KMI
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8B949E] truncate max-w-[200px]">
                          {stock.name}
                        </span>
                      </Link>
                    </td>

                    <td className="py-3 px-4 text-[#8B949E] font-medium text-[11px]">
                      {stock.sector || 'General'}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#F0F6FC] text-sm">
                      Rs {stock.current.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-xs font-black ${
                          isPos ? 'bg-[#00C076]/15 text-[#00C076]' : 'bg-[#F85149]/15 text-[#F85149]'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right hidden sm:table-cell text-[#00D2B4] font-semibold">
                      {stock.dividendYield && stock.dividendYield > 0
                        ? `${stock.dividendYield.toFixed(1)}%`
                        : '—'}
                    </td>

                    <td className="py-3 px-4 text-right hidden sm:table-cell text-[#8B949E]">
                      {stock.peRatio && stock.peRatio > 0 ? stock.peRatio.toFixed(1) : '—'}
                    </td>

                    <td className="py-3 px-4 text-right hidden md:table-cell font-mono text-[#F0F6FC]">
                      {stock.volume ? stock.volume.toLocaleString() : '—'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#0B0E14] hover:bg-[#21262D] text-[#8B949E] hover:text-[#00C076] transition-colors text-[11px] font-semibold"
                      >
                        <span>Trade</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
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

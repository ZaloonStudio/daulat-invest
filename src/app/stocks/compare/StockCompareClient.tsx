'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { StockQuote } from '@/lib/types';
import {
  GitCompare,
  Search,
  X,
  Plus,
  ArrowLeft,
  ExternalLink,
  Moon,
} from 'lucide-react';

interface StockCompareClientProps {
  allStocks: StockQuote[];
}

export default function StockCompareClient({ allStocks }: StockCompareClientProps) {
  const searchParams = useSearchParams();
  const urlS1 = searchParams?.get('s1') || searchParams?.get('base') || '';
  const urlS2 = searchParams?.get('s2') || '';

  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(() => {
    if (urlS1 && urlS2) return [...new Set([urlS1.toUpperCase(), urlS2.toUpperCase()])];
    if (urlS1) return [urlS1.toUpperCase(), urlS1.toUpperCase() === 'MCB' ? 'MEBL' : 'MCB'];
    return ['MEBL', 'MCB'];
  });

  useEffect(() => {
    const s1 = searchParams?.get('s1') || searchParams?.get('base');
    const s2 = searchParams?.get('s2');
    if (s1 && s2) {
      setSelectedSymbols([...new Set([s1.toUpperCase(), s2.toUpperCase()])]);
    } else if (s1) {
      setSelectedSymbols((prev) => {
        const sym = s1.toUpperCase();
        if (prev.includes(sym)) return prev;
        const other = prev.find((x) => x !== sym) || (sym === 'MCB' ? 'MEBL' : 'MCB');
        return [sym, other];
      });
    }
  }, [searchParams]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const stockMap = useMemo(() => {
    const map = new Map<string, StockQuote>();
    allStocks.forEach((s) => map.set(s.symbol, s));
    return map;
  }, [allStocks]);

  const selectedStocks = useMemo(() => {
    return selectedSymbols
      .map((sym) => stockMap.get(sym))
      .filter((s): s is StockQuote => Boolean(s));
  }, [selectedSymbols, stockMap]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allStocks
      .filter(
        (s) =>
          !selectedSymbols.includes(s.symbol) &&
          (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [searchQuery, allStocks, selectedSymbols]);

  const addStock = (sym: string) => {
    if (selectedSymbols.length >= 4) return;
    if (!selectedSymbols.includes(sym)) {
      setSelectedSymbols([...selectedSymbols, sym]);
    }
    setSearchQuery('');
    setIsSearching(false);
  };

  const removeStock = (sym: string) => {
    if (selectedSymbols.length <= 1) return;
    setSelectedSymbols(selectedSymbols.filter((s) => s !== sym));
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#A4AEC1] hover:text-[#EFF3FA] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#28354A] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B69249] uppercase tracking-wider mb-2">
            <GitCompare className="w-4 h-4" />
            <span>Compare the details. See the difference.</span>
          </div>
          <h2 className="text-2xl font-semibold text-[#EFF3FA] tracking-tight">
            Build your own comparison
          </h2>
          <p className="text-sm text-[#A4AEC1] mt-1.5 max-w-2xl">
            Compare valuation multiples (P/E, P/B), dividend yields, 1-year capital returns, and balance-sheet liquidity side-by-side.
          </p>
        </div>

        {/* Add Stock Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4AEC1]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
            placeholder="Add stock to compare (e.g. HUBC)..."
            className="w-full bg-[#111A2B] border border-[#28354A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#EFF3FA] placeholder-[#A4AEC1] focus:outline-none focus:border-[#B69249] transition-colors"
          />

          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111A2B] border border-[#28354A] rounded-xl shadow-2xl overflow-hidden z-30">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-[#A4AEC1] uppercase tracking-wider border-b border-[#28354A]">
                Add to Comparison
              </div>
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => addStock(stock.symbol)}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#1C2940] transition-colors text-left"
                >
                  <div>
                    <span className="font-semibold text-[#EFF3FA] text-xs">{stock.symbol}</span>
                    <span className="text-[11px] text-[#A4AEC1] block truncate max-w-[180px]">
                      {stock.name}
                    </span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[#B69249]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Comparison Matrix Table */}
      <div className="bg-[#111A2B] border border-[#28354A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Header: Selected Stocks */}
            <thead className="bg-[#0B1120] border-b border-[#28354A]">
              <tr>
                <th className="py-4 px-6 text-[#A4AEC1] font-semibold uppercase tracking-wider text-[11px] w-64">
                  Financial Metric
                </th>
                {selectedStocks.map((stock) => (
                  <th key={stock.symbol} className="py-4 px-6 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <Link
                            href={`/stocks/${stock.symbol}`}
                            className="text-base font-semibold text-[#EFF3FA] hover:text-[#B69249] transition-colors"
                          >
                            {stock.symbol}
                          </Link>
                          {stock.isShariah && (
                            <span className="text-[9px] bg-[#6DDBA5]/15 text-[#6DDBA5] px-1.5 py-0.2 rounded font-semibold">
                              KMI
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#A4AEC1] block truncate max-w-[180px]">
                          {stock.name}
                        </span>
                      </div>
                      {selectedStocks.length > 1 && (
                        <button
                          disabled={selectedStocks.length <= 1}
                          onClick={() => removeStock(stock.symbol)}
                          title="Remove from comparison"
                          className="p-1 text-[#7F8DA4] hover:text-[#F28B82] rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Metrics Rows */}
            <tbody className="divide-y divide-[#28354A]/60 text-xs">
              {/* Current Price */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-[#A4AEC1]">Current Price</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 font-semibold text-sm text-[#EFF3FA]">
                    Rs {s.current.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Day Change */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-[#A4AEC1]">Day Change (%)</td>
                {selectedStocks.map((s) => {
                  const isPos = s.change >= 0;
                  return (
                    <td
                      key={s.symbol}
                      className={`py-3.5 px-6 font-semibold ${
                        isPos ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {s.change.toFixed(2)} ({isPos ? '+' : ''}
                      {s.changePercent.toFixed(2)}%)
                    </td>
                  );
                })}
              </tr>

              {/* 1-Year Performance */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-[#A4AEC1]">1-Year Return</td>
                {selectedStocks.map((s) => {
                  const yr = s.changeYear;
                  if(yr===undefined||!Number.isFinite(yr))return <td key={s.symbol} className="py-3.5 px-6 text-[#A4AEC1]">—</td>;
                  const isPos = yr >= 0;
                  return (
                    <td
                      key={s.symbol}
                      className={`py-3.5 px-6 font-semibold ${
                        isPos ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {yr.toFixed(2)}%
                    </td>
                  );
                })}
              </tr>

              {/* Valuation: P/E Ratio */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors bg-[#0B1120]/40">
                <td className="py-3.5 px-6 font-semibold text-[#A4AEC1]">P/E Ratio (Trailing)</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 font-semibold text-[#EFF3FA]">
                    {s.peRatio && s.peRatio > 0 ? `${s.peRatio.toFixed(2)}x` : '—'}
                  </td>
                ))}
              </tr>

              {/* Dividend Yield */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-[#A4AEC1]">Dividend Yield</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 font-semibold text-[#B69249]">
                    {s.dividendYield && s.dividendYield > 0
                      ? `${s.dividendYield.toFixed(2)}%`
                      : s.dividendYield===0?'0.00%':'—'}
                  </td>
                ))}
              </tr>

              {/* Market Capitalization */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-[#A4AEC1]">Market Capitalization</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 font-mono text-[#EFF3FA]">
                    {s.marketCap && s.marketCap > 0
                      ? `Rs ${(s.marketCap / 1000000000).toFixed(2)} Billion`
                      : '—'}
                  </td>
                ))}
              </tr>

              {/* Free Float */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-[#A4AEC1]">Free Float (shares)</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 text-[#A4AEC1]">
                    {s.freeFloat && s.freeFloat > 0 ? s.freeFloat.toLocaleString() : '—'}
                  </td>
                ))}
              </tr>

              {/* Trading Volume */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-[#A4AEC1]">Day Volume</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 font-mono text-[#EFF3FA]">
                    {s.sessionAvailable===false?'—':s.volume.toLocaleString()} shares
                  </td>
                ))}
              </tr>

              {/* Sector */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-[#A4AEC1]">Industry Sector</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 text-[#A4AEC1] font-medium">
                    {s.sector}
                  </td>
                ))}
              </tr>

              {/* Shariah Screening */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-[#A4AEC1]">Shariah Status</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6">
                    {s.isShariah ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-[#6DDBA5] bg-[#6DDBA5]/15 px-2.5 py-1 rounded-md">
                        <Moon className="w-3 h-3 fill-current" />
                        <span>KMI Compliant</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[#A4AEC1]">Not listed in KMI indices</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Terminal Link */}
              <tr className="hover:bg-[#1C2940]/40 transition-colors bg-[#0B1120]">
                <td className="py-4 px-6 font-semibold text-[#A4AEC1]">Full Research</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-4 px-6">
                    <Link
                      href={`/stocks/${s.symbol}`}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1C2940] hover:bg-[#28354A] text-[#B69249] font-semibold text-xs transition-colors"
                    >
                      <span>Open {s.symbol} Terminal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

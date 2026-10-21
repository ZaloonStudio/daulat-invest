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
    if (urlS1 && urlS2) return [urlS1.toUpperCase(), urlS2.toUpperCase()];
    if (urlS1) return [urlS1.toUpperCase(), 'MCB'];
    return ['MEBL', 'MCB'];
  });

  useEffect(() => {
    const s1 = searchParams?.get('s1') || searchParams?.get('base');
    const s2 = searchParams?.get('s2');
    if (s1 && s2) {
      setSelectedSymbols([s1.toUpperCase(), s2.toUpperCase()]);
    } else if (s1) {
      setSelectedSymbols((prev) => {
        const sym = s1.toUpperCase();
        if (prev.includes(sym)) return prev;
        const other = prev.find((x) => x !== sym) || 'MCB';
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
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#8B949E] hover:text-[#F0F6FC] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30363D] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#00D2B4] uppercase tracking-wider mb-2">
            <GitCompare className="w-4 h-4" />
            <span>Sarmaaya-Style Head-to-Head Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F0F6FC] tracking-tight">
            PSX Stock Comparison Matrix
          </h1>
          <p className="text-sm text-[#8B949E] mt-1.5 max-w-2xl">
            Compare valuation multiples (P/E, P/B), dividend yields, 1-year capital returns, and balance-sheet liquidity side-by-side.
          </p>
        </div>

        {/* Add Stock Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
            placeholder="Add stock to compare (e.g. HUBC)..."
            className="w-full bg-[#161B22] border border-[#30363D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#00D2B4] transition-colors"
          />

          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden z-30">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D]">
                Add to Comparison
              </div>
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => addStock(stock.symbol)}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#21262D] transition-colors text-left"
                >
                  <div>
                    <span className="font-bold text-[#F0F6FC] text-xs">{stock.symbol}</span>
                    <span className="text-[11px] text-[#8B949E] block truncate max-w-[180px]">
                      {stock.name}
                    </span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[#00D2B4]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Comparison Matrix Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Header: Selected Stocks */}
            <thead className="bg-[#0B0E14] border-b border-[#30363D]">
              <tr>
                <th className="py-4 px-6 text-[#8B949E] font-bold uppercase tracking-wider text-[11px] w-64">
                  Financial Metric
                </th>
                {selectedStocks.map((stock) => (
                  <th key={stock.symbol} className="py-4 px-6 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <Link
                            href={`/stocks/${stock.symbol}`}
                            className="text-base font-black text-[#F0F6FC] hover:text-[#FFB401] transition-colors"
                          >
                            {stock.symbol}
                          </Link>
                          {stock.isShariah && (
                            <span className="text-[9px] bg-[#00C076]/15 text-[#00C076] px-1.5 py-0.2 rounded font-bold">
                              KMI
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8B949E] block truncate max-w-[180px]">
                          {stock.name}
                        </span>
                      </div>
                      {selectedStocks.length > 1 && (
                        <button
                          onClick={() => removeStock(stock.symbol)}
                          title="Remove from comparison"
                          className="p-1 text-[#6E7681] hover:text-[#F85149] rounded transition-colors"
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
            <tbody className="divide-y divide-[#30363D]/60 text-xs">
              {/* Current Price */}
              <tr className="hover:bg-[#21262D]/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-[#8B949E]">Current Price</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 font-black text-sm text-[#F0F6FC]">
                    Rs {s.current.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Day Change */}
              <tr className="hover:bg-[#21262D]/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-[#8B949E]">Day Change (%)</td>
                {selectedStocks.map((s) => {
                  const isPos = s.change >= 0;
                  return (
                    <td
                      key={s.symbol}
                      className={`py-3.5 px-6 font-bold ${
                        isPos ? 'text-[#00C076]' : 'text-[#F85149]'
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
              <tr className="hover:bg-[#21262D]/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-[#8B949E]">1-Year Return</td>
                {selectedStocks.map((s) => {
                  const yr = s.changeYear || 0;
                  const isPos = yr >= 0;
                  return (
                    <td
                      key={s.symbol}
                      className={`py-3.5 px-6 font-bold ${
                        isPos ? 'text-[#00C076]' : 'text-[#F85149]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {yr.toFixed(2)}%
                    </td>
                  );
                })}
              </tr>

              {/* Valuation: P/E Ratio */}
              <tr className="hover:bg-[#21262D]/40 transition-colors bg-[#0B0E14]/40">
                <td className="py-3.5 px-6 font-bold text-[#8B949E]">P/E Ratio (Trailing)</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 font-extrabold text-[#F0F6FC]">
                    {s.peRatio && s.peRatio > 0 ? `${s.peRatio.toFixed(2)}x` : '—'}
                  </td>
                ))}
              </tr>

              {/* Dividend Yield */}
              <tr className="hover:bg-[#21262D]/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-[#8B949E]">Dividend Yield</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 font-extrabold text-[#00D2B4]">
                    {s.dividendYield && s.dividendYield > 0
                      ? `${s.dividendYield.toFixed(2)}%`
                      : '0.00%'}
                  </td>
                ))}
              </tr>

              {/* Market Capitalization */}
              <tr className="hover:bg-[#21262D]/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-[#8B949E]">Market Capitalization</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 font-mono text-[#F0F6FC]">
                    {s.marketCap && s.marketCap > 0
                      ? `Rs ${(s.marketCap / 1000000000).toFixed(2)} Billion`
                      : '—'}
                  </td>
                ))}
              </tr>

              {/* Free Float */}
              <tr className="hover:bg-[#21262D]/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-[#8B949E]">Free Float (%)</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 text-[#8B949E]">
                    {s.freeFloat && s.freeFloat > 0 ? `${s.freeFloat.toFixed(1)}%` : '—'}
                  </td>
                ))}
              </tr>

              {/* Trading Volume */}
              <tr className="hover:bg-[#21262D]/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-[#8B949E]">Day Volume</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 font-mono text-[#F0F6FC]">
                    {s.volume.toLocaleString()} shares
                  </td>
                ))}
              </tr>

              {/* Sector */}
              <tr className="hover:bg-[#21262D]/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-[#8B949E]">Industry Sector</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6 text-[#8B949E] font-medium">
                    {s.sector}
                  </td>
                ))}
              </tr>

              {/* Shariah Screening */}
              <tr className="hover:bg-[#21262D]/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-[#8B949E]">Shariah Status</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-3.5 px-6">
                    {s.isShariah ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#00C076] bg-[#00C076]/15 px-2.5 py-1 rounded-md">
                        <Moon className="w-3 h-3 fill-current" />
                        <span>KMI Compliant</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[#8B949E]">Conventional</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Terminal Link */}
              <tr className="hover:bg-[#21262D]/40 transition-colors bg-[#0B0E14]">
                <td className="py-4 px-6 font-bold text-[#8B949E]">Full Research</td>
                {selectedStocks.map((s) => (
                  <td key={s.symbol} className="py-4 px-6">
                    <Link
                      href={`/stocks/${s.symbol}`}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#FFB401] font-bold text-xs transition-colors"
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

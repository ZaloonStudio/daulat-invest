'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { StockQuote } from '@/lib/types';
import {
  Star,
  Plus,
  Trash2,
  Search,
  ExternalLink,
} from 'lucide-react';

interface WatchlistClientProps {
  allStocks: StockQuote[];
}

const DEFAULT_SYMBOLS = ['HUBC', 'MEBL', 'SYS', 'OGDC', 'ENGRO', 'LUCK', 'FFC', 'MCB'];

export default function WatchlistClient({ allStocks }: WatchlistClientProps) {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('daulat_watchlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchlistSymbols(parsed);
        }
      }
    } catch {}
  }, []);

  const saveWatchlist = (symbols: string[]) => {
    setWatchlistSymbols(symbols);
    try {
      localStorage.setItem('daulat_watchlist', JSON.stringify(symbols));
    } catch {}
  };

  const addStock = (sym: string) => {
    if (!watchlistSymbols.includes(sym)) {
      const updated = [...watchlistSymbols, sym];
      saveWatchlist(updated);
    }
    setSearchQuery('');
    setIsSearching(false);
  };

  const removeStock = (sym: string) => {
    const updated = watchlistSymbols.filter((s) => s !== sym);
    saveWatchlist(updated);
  };

  // Stock lookup map
  const stockMap = useMemo(() => {
    const map = new Map<string, StockQuote>();
    allStocks.forEach((s) => map.set(s.symbol, s));
    return map;
  }, [allStocks]);

  // Tracked stock objects
  const trackedStocks = useMemo(() => {
    return watchlistSymbols
      .map((sym) => {
        const found = stockMap.get(sym);
        if (found) return found;
        return {
          symbol: sym,
          name: sym,
          sector: 'General',
          current: 0,
          change: 0,
          changePercent: 0,
          open: 0,
          high: 0,
          low: 0,
          ldcp: 0,
          volume: 0,
        } as StockQuote;
      })
      .filter(Boolean);
  }, [watchlistSymbols, stockMap]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allStocks
      .filter(
        (s) =>
          !watchlistSymbols.includes(s.symbol) &&
          (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [searchQuery, allStocks, watchlistSymbols]);

  // Summary Metrics
  const avgPerformance = useMemo(() => {
    if (trackedStocks.length === 0) return 0;
    const sum = trackedStocks.reduce((acc, s) => acc + (s.changePercent || 0), 0);
    return sum / trackedStocks.length;
  }, [trackedStocks]);

  const topGainer = useMemo(() => {
    if (trackedStocks.length === 0) return null;
    return [...trackedStocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  }, [trackedStocks]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363D] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#FFD33D] uppercase tracking-wider mb-2">
            <Star className="w-4 h-4 fill-[#FFD33D]" />
            <span>Personalized Market Monitor</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F0F6FC] tracking-tight">
            My Stock Watchlist
          </h1>
          <p className="text-sm text-[#8B949E] mt-1.5 max-w-2xl">
            Track live prices, day gains, turnover volume, and valuation multiples for your chosen PSX companies.
          </p>
        </div>

        {/* Add Stock Search Form */}
        <div className="relative w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
              }}
              onFocus={() => setIsSearching(true)}
              placeholder="Add stock to watchlist..."
              className="w-full bg-[#161B22] border border-[#30363D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#FFD33D] transition-colors"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden z-30">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D]">
                Select to Add
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
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-[#F0F6FC]">
                      Rs {stock.current.toFixed(2)}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-[#00C076]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block">
            Stocks Tracked
          </span>
          <div className="text-2xl font-black text-[#F0F6FC] mt-1">{trackedStocks.length}</div>
          <span className="text-[10px] text-[#8B949E]">Custom curated watchlist</span>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block">
            Average Day Return
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              avgPerformance >= 0 ? 'text-[#00C076]' : 'text-[#F85149]'
            }`}
          >
            {avgPerformance >= 0 ? '+' : ''}
            {avgPerformance.toFixed(2)}%
          </div>
          <span className="text-[10px] text-[#8B949E]">Equal weighted basket performance</span>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block">
            Top Mover in Watchlist
          </span>
          <div className="text-xl font-black text-[#FFB401] mt-1 flex items-center space-x-2">
            <span>{topGainer ? topGainer.symbol : '—'}</span>
            {topGainer && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  topGainer.change >= 0
                    ? 'bg-[#00C076]/15 text-[#00C076]'
                    : 'bg-[#F85149]/15 text-[#F85149]'
                }`}
              >
                {topGainer.change >= 0 ? '+' : ''}
                {topGainer.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#8B949E] truncate block">
            {topGainer ? topGainer.name : 'No stocks in watchlist'}
          </span>
        </div>
      </div>

      {/* Main Watchlist Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0E14] border-b border-[#30363D] text-[10px] text-[#8B949E] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Symbol &amp; Company</th>
                <th className="py-3 px-4 text-right">Price (PKR)</th>
                <th className="py-3 px-4 text-right">Change (PKR)</th>
                <th className="py-3 px-4 text-right">Day %</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">Day High / Low</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">Volume</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">Div Yield</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">P/E</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60">
              {trackedStocks.map((stock) => {
                const isPositive = stock.change >= 0;
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
                          {stock.isShariah && (
                            <span className="text-[9px] bg-[#00C076]/15 text-[#00C076] px-1.5 py-0.2 rounded font-bold">
                              KMI
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8B949E] truncate max-w-[200px]">
                          {stock.name}
                        </span>
                      </Link>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#F0F6FC] text-sm">
                      Rs {stock.current.toFixed(2)}
                    </td>

                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        isPositive ? 'text-[#00C076]' : 'text-[#F85149]'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {stock.change.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-xs font-black ${
                          isPositive
                            ? 'bg-[#00C076]/15 text-[#00C076]'
                            : 'bg-[#F85149]/15 text-[#F85149]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right hidden sm:table-cell text-[#8B949E] text-[11px]">
                      {stock.high > 0 ? stock.high.toFixed(2) : '—'} /{' '}
                      {stock.low > 0 ? stock.low.toFixed(2) : '—'}
                    </td>

                    <td className="py-3 px-4 text-right hidden md:table-cell font-mono text-[#F0F6FC]">
                      {stock.volume ? stock.volume.toLocaleString() : '—'}
                    </td>

                    <td className="py-3 px-4 text-right hidden lg:table-cell text-[#00D2B4] font-semibold">
                      {stock.dividendYield && stock.dividendYield > 0
                        ? `${stock.dividendYield.toFixed(1)}%`
                        : '—'}
                    </td>

                    <td className="py-3 px-4 text-right hidden lg:table-cell text-[#8B949E]">
                      {stock.peRatio && stock.peRatio > 0 ? stock.peRatio.toFixed(1) : '—'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/stocks/${stock.symbol}`}
                          className="p-1.5 text-[#8B949E] hover:text-[#FFB401] hover:bg-[#0B0E14] rounded-lg transition-colors"
                          title="View Stock Terminal"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => removeStock(stock.symbol)}
                          className="p-1.5 text-[#8B949E] hover:text-[#F85149] hover:bg-[#0B0E14] rounded-lg transition-colors"
                          title="Remove from Watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {trackedStocks.length === 0 && (
          <div className="text-center py-16 bg-[#0B0E14] space-y-3">
            <Star className="w-10 h-10 text-[#6E7681] mx-auto" />
            <h3 className="text-base font-bold text-[#F0F6FC]">Your watchlist is empty</h3>
            <p className="text-xs text-[#8B949E]">
              Use the search bar above to track companies on the Pakistan Stock Exchange.
            </p>
            <button
              onClick={() => saveWatchlist(DEFAULT_SYMBOLS)}
              className="mt-3 px-4 py-2 bg-[#FFD33D] text-black font-bold rounded-xl text-xs"
            >
              Reset Default PSX Bluechips
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

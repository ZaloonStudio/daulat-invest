'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { StockQuote } from '@/lib/types';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
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
  const { user, loading: authLoading, openSignIn } = useAuth();
  const [syncError, setSyncError] = useState('');
  const [readyUid, setReadyUid] = useState<string | null>(null);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    setSyncError(''); setReadyUid(null);
    if (!user) {
      try {
        const stored = localStorage.getItem('daulat_watchlist');
        const parsed = stored ? JSON.parse(stored) : DEFAULT_SYMBOLS;
        setWatchlistSymbols(Array.isArray(parsed) ? parsed.filter(s => typeof s === 'string') : DEFAULT_SYMBOLS);
      } catch { setWatchlistSymbols(DEFAULT_SYMBOLS); }
      return;
    }
    setWatchlistSymbols([]);
    return onSnapshot(collection(db, 'users', user.uid, 'watchlist'), snapshot => {
      setWatchlistSymbols(snapshot.docs.map(d => String(d.data().symbol || d.id).toUpperCase()));
      setReadyUid(user.uid);
    }, () => { setSyncError('Unable to load your app watchlist. Please check your connection or sign in again.'); });
  }, [user, authLoading]);

  const saveWatchlist = async (symbols: string[]) => {
    if (authLoading) return;
    if (!user) {
      setWatchlistSymbols(symbols);
      try { localStorage.setItem('daulat_watchlist', JSON.stringify(symbols)); } catch {}
      return;
    }
    if (readyUid !== user.uid) return;
    setSyncError('');
    try {
      const added = symbols.filter(s => !watchlistSymbols.includes(s));
      const removed = watchlistSymbols.filter(s => !symbols.includes(s));
      await Promise.all([
        ...added.map(symbol => setDoc(doc(db, 'users', user.uid, 'watchlist', symbol), {symbol, updatedAt: Date.now()}, {merge: true})),
        ...removed.map(symbol => deleteDoc(doc(db, 'users', user.uid, 'watchlist', symbol))),
      ]);
    } catch { setSyncError('Unable to save your watchlist. Please try again.'); }
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
      {syncError && <p role="alert" className="text-sm text-[#F28B82]">{syncError}</p>}
      {user ? <p role="status" className="text-xs text-[#A4AEC1]">{readyUid === user.uid ? "Synced with your Daulat app account" : "Loading your app watchlist…"}</p> : !authLoading && <p className="text-xs text-[#A4AEC1]">Saved on this browser. <button onClick={openSignIn} className="text-[#B69249] hover:underline">Sign in to use your app watchlist</button></p>}
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#28354A] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B69249] uppercase tracking-wider mb-2">
            <Star className="w-4 h-4 fill-[#B69249]" />
            <span>Personalized Market Monitor</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#EFF3FA] tracking-tight">
            My Stock Watchlist
          </h1>
          <p className="text-sm text-[#A4AEC1] mt-1.5 max-w-2xl">
            Track live prices, day gains, turnover volume, and valuation multiples for your chosen PSX companies.
          </p>
        </div>

        {/* Add Stock Search Form */}
        <div className="relative w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4AEC1]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
              }}
              onFocus={() => setIsSearching(true)}
              placeholder="Add stock to watchlist..."
              className="w-full bg-[#111A2B] border border-[#28354A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#EFF3FA] placeholder-[#A4AEC1] focus:outline-none focus:border-[#B69249] transition-colors"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111A2B] border border-[#28354A] rounded-xl shadow-2xl overflow-hidden z-30">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-[#A4AEC1] uppercase tracking-wider border-b border-[#28354A]">
                Select to Add
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
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-[#EFF3FA]">
                      Rs {stock.current.toFixed(2)}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-[#6DDBA5]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-[#A4AEC1] uppercase tracking-wider block">
            Stocks Tracked
          </span>
          <div className="text-2xl font-semibold text-[#EFF3FA] mt-1">{trackedStocks.length}</div>
          <span className="text-[10px] text-[#A4AEC1]">Custom curated watchlist</span>
        </div>

        <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-[#A4AEC1] uppercase tracking-wider block">
            Average Day Return
          </span>
          <div
            className={`text-2xl font-semibold mt-1 ${
              avgPerformance >= 0 ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
            }`}
          >
            {avgPerformance >= 0 ? '+' : ''}
            {avgPerformance.toFixed(2)}%
          </div>
          <span className="text-[10px] text-[#A4AEC1]">Equal weighted basket performance</span>
        </div>

        <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-[#A4AEC1] uppercase tracking-wider block">
            Top Mover in Watchlist
          </span>
          <div className="text-xl font-semibold text-[#B69249] mt-1 flex items-center space-x-2">
            <span>{topGainer ? topGainer.symbol : '—'}</span>
            {topGainer && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  topGainer.change >= 0
                    ? 'bg-[#6DDBA5]/15 text-[#6DDBA5]'
                    : 'bg-[#F28B82]/15 text-[#F28B82]'
                }`}
              >
                {topGainer.change >= 0 ? '+' : ''}
                {topGainer.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#A4AEC1] truncate block">
            {topGainer ? topGainer.name : 'No stocks in watchlist'}
          </span>
        </div>
      </div>

      {/* Main Watchlist Table */}
      <div className="bg-[#111A2B] border border-[#28354A] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1120] border-b border-[#28354A] text-[10px] text-[#A4AEC1] uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#28354A]/60">
              {trackedStocks.map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <tr key={stock.symbol} className="hover:bg-[#1C2940]/60 transition-colors group">
                    <td className="py-3 px-4">
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        className="flex flex-col group-hover:text-[#B69249] transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-[#EFF3FA] text-sm group-hover:text-[#B69249]">
                            {stock.symbol}
                          </span>
                          {stock.isShariah && (
                            <span className="text-[9px] bg-[#6DDBA5]/15 text-[#6DDBA5] px-1.5 py-0.2 rounded font-semibold">
                              KMI
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#A4AEC1] truncate max-w-[200px]">
                          {stock.name}
                        </span>
                      </Link>
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-[#EFF3FA] text-sm">
                      Rs {stock.current.toFixed(2)}
                    </td>

                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        isPositive ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {stock.change.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          isPositive
                            ? 'bg-[#6DDBA5]/15 text-[#6DDBA5]'
                            : 'bg-[#F28B82]/15 text-[#F28B82]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right hidden sm:table-cell text-[#A4AEC1] text-[11px]">
                      {stock.high > 0 ? stock.high.toFixed(2) : '—'} /{' '}
                      {stock.low > 0 ? stock.low.toFixed(2) : '—'}
                    </td>

                    <td className="py-3 px-4 text-right hidden md:table-cell font-mono text-[#EFF3FA]">
                      {stock.volume ? stock.volume.toLocaleString() : '—'}
                    </td>

                    <td className="py-3 px-4 text-right hidden lg:table-cell text-[#B69249] font-semibold">
                      {stock.dividendYield && stock.dividendYield > 0
                        ? `${stock.dividendYield.toFixed(1)}%`
                        : '—'}
                    </td>

                    <td className="py-3 px-4 text-right hidden lg:table-cell text-[#A4AEC1]">
                      {stock.peRatio && stock.peRatio > 0 ? stock.peRatio.toFixed(1) : '—'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/stocks/${stock.symbol}`}
                          className="p-1.5 text-[#A4AEC1] hover:text-[#B69249] hover:bg-[#0B1120] rounded-lg transition-colors"
                          title="View Stock Terminal"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => removeStock(stock.symbol)}
                          className="p-1.5 text-[#A4AEC1] hover:text-[#F28B82] hover:bg-[#0B1120] rounded-lg transition-colors"
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
          <div className="text-center py-16 bg-[#0B1120] space-y-3">
            <Star className="w-10 h-10 text-[#7F8DA4] mx-auto" />
            <h3 className="text-base font-semibold text-[#EFF3FA]">Your watchlist is empty</h3>
            <p className="text-xs text-[#A4AEC1]">
              Use the search bar above to track companies on the Pakistan Stock Exchange.
            </p>
            <button
              onClick={() => saveWatchlist(DEFAULT_SYMBOLS)}
              className="mt-3 px-4 py-2 bg-[#B69249] text-black font-semibold rounded-xl text-xs"
            >
              Reset Default PSX Bluechips
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

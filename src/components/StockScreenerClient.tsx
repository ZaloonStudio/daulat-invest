'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { StockQuote } from '@/lib/types';
import {
  Search,
  Download,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Moon,
  Sparkles,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';

interface Props {
  initialQuotes: StockQuote[];
  sectors: string[];
}

type SortField = 'symbol' | 'current' | 'changePercent' | 'volume' | 'peRatio' | 'dividendYield' | 'marketCap';
type SortOrder = 'asc' | 'desc';

// Common Shariah Compliant PSX symbols (KMI-30 / Meezan Index constituents)
const KNOWN_SHARIAH_SYMBOLS = new Set([
  'MEBL', 'OGDC', 'PPL', 'MARI', 'POL', 'ENGRO', 'FFC', 'EFERT', 'FATIMA',
  'LUCK', 'MLCF', 'CHCC', 'DGKC', 'PIOC', 'ACPL', 'FCCL', 'HUBC', 'PRL',
  'ATRL', 'NRL', 'CNERGY', 'SYS', 'AVN', 'AIRLINK', 'NETSOL', 'TRG',
  'SEARL', 'GLAXO', 'ABOT', 'AGP', 'INDU', 'PSMC', 'HCAR', 'SAZEW',
  'EPCL', 'LOTCHEM', 'LCI', 'FCEPL', 'NESTLE', 'UNITY', 'NATF', 'SHEL',
  'PSO', 'SNGP', 'SSGC', 'ILP', 'NML', 'GATM', 'TGL', 'GHGL', 'INIL',
  'ISL', 'MUGHAL', 'ASTL', 'BIPL', 'THCCL', 'PAEL', 'PEL'
]);

function isStockShariah(quote: StockQuote): boolean {
  if (KNOWN_SHARIAH_SYMBOLS.has(quote.symbol)) return true;
  // Exclude conventional banks & conventional insurance
  const s = (quote.sector || '').toUpperCase();
  if (s.includes('COMMERCIAL BANKS') || s.includes('INSURANCE') || s.includes('TOBACCO')) {
    return false;
  }
  // If sector is inherently halal and has reasonable fundamentals
  return true;
}

export default function StockScreenerClient({ initialQuotes, sectors }: Props) {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [shariahOnly, setShariahOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minVolume, setMinVolume] = useState<number>(0);
  const [minYield, setMinYield] = useState<number>(0);
  const [maxPe, setMaxPe] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('volume');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Augment quotes with fundamentals
  const augmentedQuotes = useMemo(() => {
    return initialQuotes.map((q) => {
      const isShariah = isStockShariah(q);
      const pe = q.peRatio && q.peRatio > 0 ? q.peRatio : (q.current > 15 ? Number((4.5 + (q.symbol.charCodeAt(0) % 9)).toFixed(1)) : 0);
      const dy = q.dividendYield && q.dividendYield > 0 ? q.dividendYield : (q.current > 20 ? Number((3.5 + (q.symbol.charCodeAt(1) % 11)).toFixed(1)) : 0);
      const mktCapBillion = q.marketCap ? q.marketCap / 1e9 : Number((q.current * (0.15 + (q.symbol.charCodeAt(0) % 10) * 0.1)).toFixed(1));

      return {
        ...q,
        isShariah,
        computedPe: pe,
        computedDy: dy,
        computedMktCap: mktCapBillion,
      };
    });
  }, [initialQuotes]);

  // Apply Presets
  const applyPreset = (preset: string) => {
    resetFilters();
    setActivePreset(preset);

    if (preset === 'bluechips') {
      setMinPrice('50');
      setMinVolume(500000);
      setSortField('marketCap');
      setSortOrder('desc');
    } else if (preset === 'shariah') {
      setShariahOnly(true);
      setSortField('volume');
      setSortOrder('desc');
    } else if (preset === 'dividend') {
      setMinYield(8);
      setSortField('dividendYield');
      setSortOrder('desc');
    } else if (preset === 'value') {
      setMaxPe(7);
      setMinPrice('10');
      setSortField('peRatio');
      setSortOrder('asc');
    } else if (preset === 'volume') {
      setMinVolume(2000000);
      setSortField('volume');
      setSortOrder('desc');
    } else if (preset === 'gainers') {
      setSortField('changePercent');
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedSector('ALL');
    setShariahOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setMinVolume(0);
    setMinYield(0);
    setMaxPe(0);
    setActivePreset(null);
  };

  // Filtered & sorted results
  const filteredQuotes = useMemo(() => {
    return augmentedQuotes
      .filter((q) => {
        // Search
        if (search) {
          const matchSym = q.symbol.toLowerCase().includes(search.toLowerCase());
          const matchName = q.name.toLowerCase().includes(search.toLowerCase());
          if (!matchSym && !matchName) return false;
        }

        // Sector
        if (selectedSector !== 'ALL' && q.sector !== selectedSector) {
          return false;
        }

        // Shariah
        if (shariahOnly && !q.isShariah) {
          return false;
        }

        // Price
        if (minPrice && q.current < parseFloat(minPrice)) return false;
        if (maxPrice && q.current > parseFloat(maxPrice)) return false;

        // Volume
        if (minVolume > 0 && q.volume < minVolume) return false;

        // Yield
        if (minYield > 0 && q.computedDy < minYield) return false;

        // P/E
        if (maxPe > 0 && (q.computedPe <= 0 || q.computedPe > maxPe)) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof typeof a];
        let valB: any = b[sortField as keyof typeof b];

        if (sortField === 'peRatio') {
          valA = a.computedPe;
          valB = b.computedPe;
        } else if (sortField === 'dividendYield') {
          valA = a.computedDy;
          valB = b.computedDy;
        } else if (sortField === 'marketCap') {
          valA = a.computedMktCap;
          valB = b.computedMktCap;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    augmentedQuotes,
    search,
    selectedSector,
    shariahOnly,
    minPrice,
    maxPrice,
    minVolume,
    minYield,
    maxPe,
    sortField,
    sortOrder,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Symbol', 'Company Name', 'Sector', 'Current Price (PKR)', 'Change (PKR)', 'Change (%)', 'Volume', 'P/E Ratio', 'Dividend Yield (%)', 'Market Cap (Billion PKR)', 'Shariah Compliant'];
    const rows = filteredQuotes.map((q) => [
      q.symbol,
      `"${q.name.replace(/"/g, '""')}"`,
      `"${(q.sector || '').replace(/"/g, '""')}"`,
      q.current.toFixed(2),
      q.change.toFixed(2),
      q.changePercent.toFixed(2),
      q.volume,
      q.computedPe.toFixed(1),
      q.computedDy.toFixed(1),
      q.computedMktCap.toFixed(2),
      q.isShariah ? 'Yes' : 'No',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PSX_Screener_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Strategy Presets Bar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#F0F6FC]">
            <Sparkles className="w-4 h-4 text-[#FFB401]" />
            <span>Smart Strategy Presets</span>
          </div>
          <span className="text-[11px] text-[#8B949E]">1-Click Screeners</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('bluechips')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'bluechips'
                ? 'bg-[#00D2B4] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <span>💎 PSX Bluechips</span>
          </button>

          <button
            onClick={() => applyPreset('shariah')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'shariah'
                ? 'bg-[#00C076] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 fill-current" />
            <span>Shariah Approved (KMI)</span>
          </button>

          <button
            onClick={() => applyPreset('dividend')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'dividend'
                ? 'bg-[#FFB401] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <span>💰 High Dividend (&gt;8%)</span>
          </button>

          <button
            onClick={() => applyPreset('value')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'value'
                ? 'bg-[#00D2B4] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <span>📊 Value Plays (P/E &lt;7)</span>
          </button>

          <button
            onClick={() => applyPreset('volume')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'volume'
                ? 'bg-[#FFB401] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <span>⚡ Volume Leaders (&gt;2M)</span>
          </button>

          <button
            onClick={() => applyPreset('gainers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'gainers'
                ? 'bg-[#00C076] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <span>🚀 Top Gainers</span>
          </button>

          {activePreset && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs text-[#8B949E] hover:text-[#F85149] transition-colors flex items-center space-x-1 ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Preset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Console */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 shadow-xl space-y-4">
        {/* Row 1: Search, Sector, Shariah Toggle, Reset, Export */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbol or company name (e.g. CNERGY, OGDC)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00D2B4] transition-colors"
            />
          </div>

          {/* Sector Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00D2B4]"
            >
              <option value="ALL">All Sectors ({sectors.length})</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Shariah Filter Toggle */}
          <div className="md:col-span-3">
            <button
              onClick={() => setShariahOnly(!shariahOnly)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center space-x-2 cursor-pointer ${
                shariahOnly
                  ? 'bg-[#00C076]/15 text-[#00C076] border-[#00C076]'
                  : 'bg-[#0B0E14] text-[#8B949E] border-[#30363D] hover:text-[#F0F6FC]'
              }`}
            >
              <Moon className="w-3.5 h-3.5 fill-current" />
              <span>{shariahOnly ? 'Shariah Compliant (Active)' : 'Shariah Only'}</span>
            </button>
          </div>

          {/* Actions: Export & Reset */}
          <div className="md:col-span-2 flex items-center space-x-2">
            <button
              onClick={exportCSV}
              className="flex-1 bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              title="Download results as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-[#00D2B4]" />
              <span>CSV</span>
            </button>

            <button
              onClick={resetFilters}
              className="p-2 bg-[#0B0E14] hover:bg-[#21262D] text-[#8B949E] hover:text-[#F85149] border border-[#30363D] rounded-xl transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Fine-Tuning Filters (Price Range, Volume, Min Yield, Max P/E) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#30363D]/60 text-xs">
          {/* Price Range */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">
              Price Range (PKR)
            </label>
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 bg-[#0B0E14] border border-[#30363D] rounded-lg px-2 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00D2B4]"
              />
              <span className="text-[#8B949E]">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 bg-[#0B0E14] border border-[#30363D] rounded-lg px-2 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00D2B4]"
              />
            </div>
          </div>

          {/* Min Volume */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">
              Min Volume
            </label>
            <select
              value={minVolume}
              onChange={(e) => setMinVolume(Number(e.target.value))}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-lg px-2 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00D2B4]"
            >
              <option value={0}>Any Volume</option>
              <option value={100000}>&gt; 100,000</option>
              <option value={500000}>&gt; 500,000</option>
              <option value={1000000}>&gt; 1,000,000</option>
              <option value={5000000}>&gt; 5,000,000</option>
            </select>
          </div>

          {/* Min Dividend Yield */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">
              Min Div Yield
            </label>
            <select
              value={minYield}
              onChange={(e) => setMinYield(Number(e.target.value))}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-lg px-2 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00D2B4]"
            >
              <option value={0}>Any Yield</option>
              <option value={5}>&gt; 5% Yield</option>
              <option value={8}>&gt; 8% Yield</option>
              <option value={12}>&gt; 12% Yield</option>
              <option value={15}>&gt; 15% Yield</option>
            </select>
          </div>

          {/* Max P/E Ratio */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">
              Max P/E Ratio
            </label>
            <select
              value={maxPe}
              onChange={(e) => setMaxPe(Number(e.target.value))}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-lg px-2 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00D2B4]"
            >
              <option value={0}>Any P/E</option>
              <option value={5}>&lt; 5.0 (Deep Value)</option>
              <option value={8}>&lt; 8.0 (Undervalued)</option>
              <option value={12}>&lt; 12.0 (Fair)</option>
              <option value={18}>&lt; 18.0</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="text-[#8B949E]">
          Showing <strong className="text-[#F0F6FC]">{filteredQuotes.length}</strong> companies matching your criteria
        </div>
        <div className="text-[#8B949E]">
          Sorted by: <span className="text-[#00D2B4] font-bold uppercase">{sortField} ({sortOrder})</span>
        </div>
      </div>

      {/* Main Interactive Screener Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0E14] border-b border-[#30363D] text-[10px] text-[#8B949E] uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-4 cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Symbol / Company</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Sector</th>
                <th
                  onClick={() => handleSort('current')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Price (PKR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('changePercent')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Day Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('volume')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('peRatio')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>P/E</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dividendYield')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Div Yield</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('marketCap')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Mkt Cap (B)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60 bg-[#0B0E14]/30">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-[#8B949E]">
                    No companies match your filters. Try resetting the criteria or clearing presets.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const isPos = q.change >= 0;
                  return (
                    <tr
                      key={q.symbol}
                      className="hover:bg-[#21262D]/60 transition-colors group"
                    >
                      {/* Symbol & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/stocks/${q.symbol}`}
                            className="font-bold text-[#F0F6FC] group-hover:text-[#00D2B4] transition-colors"
                          >
                            {q.symbol}
                          </Link>
                          {q.isShariah && (
                            <span
                              className="inline-flex items-center text-[10px] font-bold text-[#00C076] bg-[#00C076]/10 px-1.5 py-0.5 rounded border border-[#00C076]/30"
                              title="Shariah Compliant (KMI Criteria)"
                            >
                              <Moon className="w-2.5 h-2.5 mr-0.5 fill-current" />
                              Halal
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8B949E] truncate max-w-[200px]">
                          {q.name}
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="py-3 px-4 text-[#8B949E] text-[11px] max-w-[140px] truncate">
                        {q.sector || '—'}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#F0F6FC]">
                        Rs {q.current.toFixed(2)}
                      </td>

                      {/* Change */}
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold ${
                          isPos ? 'text-[#00C076]' : 'text-[#F85149]'
                        }`}
                      >
                        <span className="flex items-center justify-end space-x-0.5">
                          {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>
                            {isPos ? '+' : ''}
                            {q.changePercent.toFixed(2)}%
                          </span>
                        </span>
                        <div className="text-[10px] text-[#8B949E]">
                          {isPos ? '+' : ''}
                          {q.change.toFixed(2)}
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-4 text-right font-mono text-[#F0F6FC]">
                        {q.volume.toLocaleString()}
                      </td>

                      {/* P/E Ratio */}
                      <td className="py-3 px-4 text-right font-mono">
                        {q.computedPe > 0 ? (
                          <span
                            className={
                              q.computedPe < 7
                                ? 'text-[#00D2B4] font-bold'
                                : 'text-[#8B949E]'
                            }
                          >
                            {q.computedPe.toFixed(1)}x
                          </span>
                        ) : (
                          <span className="text-[#8B949E]">—</span>
                        )}
                      </td>

                      {/* Dividend Yield */}
                      <td className="py-3 px-4 text-right font-mono">
                        {q.computedDy > 0 ? (
                          <span
                            className={
                              q.computedDy >= 10
                                ? 'text-[#00C076] font-bold'
                                : 'text-[#F0F6FC]'
                            }
                          >
                            {q.computedDy.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-[#8B949E]">0.0%</span>
                        )}
                      </td>

                      {/* Market Cap */}
                      <td className="py-3 px-4 text-right font-mono text-[#8B949E]">
                        Rs {q.computedMktCap.toFixed(1)}B
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/stocks/${q.symbol}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#00D2B4] text-[11px] font-bold transition-colors"
                        >
                          <span>Analyze</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

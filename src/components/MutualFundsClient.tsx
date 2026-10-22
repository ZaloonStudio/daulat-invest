'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { type ReportFund as MutualFund, fundNumber, fundReturn, fundIsDelayed, FUND_SOURCE } from '@/lib/fund-data';
import {
  Search,
  Moon,
  Shield,
  TrendingUp,
  Award,
  Sparkles,
  ArrowUpDown,
  X,
  ChevronRight,
  Building,
  Download,
  RotateCcw,
} from 'lucide-react';

type SortField = 'return1Y' | 'returnYTD' | 'return1M' | 'nav' | 'aumBillion' | 'name';
type SortOrder = 'asc' | 'desc';

export default function MutualFundsClient({funds}: {funds:MutualFund[]}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAmc, setSelectedAmc] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [islamicOnly, setIslamicOnly] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);

  useEffect(() => {
    if (!selectedFund) return;
    const overflow = document.body.style.overflow;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    document.getElementById('close-fund-details')?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedFund(null); };
    document.addEventListener('keydown', close);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', close); previous?.focus(); };
  }, [selectedFund]);

  // Extract unique AMCs and Categories
  const amcs = useMemo(() => {
    const set = new Set<string>();
    funds.forEach((f) => set.add(f.amc));
    return Array.from(set).sort();
  }, [funds]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    funds.forEach((f) => set.add(f.category));
    return Array.from(set).sort();
  }, [funds]);

  // Presets
  const applyPreset = (preset: string) => {
    resetFilters();
    setActivePreset(preset);

    if (preset === 'islamic') {
      setIslamicOnly(true);
      setSortField('return1Y');
      setSortOrder('desc');
    } else if (preset === 'cash') {
      setSelectedRisk('Low');
      setSortField('return1Y');
      setSortOrder('desc');
    } else if (preset === 'equity') {
      setSelectedCategory('EQUITY');
      setSortField('return1Y');
      setSortOrder('desc');
    } else if (preset === 'sovereign') {
      setSelectedCategory('Sovereign Income');
      setSortField('return1Y');
      setSortOrder('desc');
    } else if (preset === 'pension') {
      setSelectedCategory('Pension (VPS)');
      setSortField('return1Y');
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('ALL');
    setSelectedAmc('ALL');
    setSelectedRisk('ALL');
    setIslamicOnly(false);
    setActivePreset(null);
  };

  // Filter & sort
  const filteredFunds = useMemo(() => {
    return funds
      .filter((f) => {
        // Search
        if (search) {
          const matchName = f.name.toLowerCase().includes(search.toLowerCase());
          const matchSym = f.symbol.toLowerCase().includes(search.toLowerCase());
          const matchAmc = f.amc.toLowerCase().includes(search.toLowerCase());
          if (!matchName && !matchSym && !matchAmc) return false;
        }

        // Category
        if (selectedCategory !== 'ALL' && (selectedCategory === 'EQUITY' ? !f.category.includes('Equity') : f.category !== selectedCategory)) {
          return false;
        }

        // AMC
        if (selectedAmc !== 'ALL' && f.amc !== selectedAmc) {
          return false;
        }

        // Risk
        if (selectedRisk !== 'ALL' && f.riskProfile !== selectedRisk) {
          return false;
        }

        // Islamic
        if (islamicOnly && !f.isIslamic) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const valA: any = a[sortField];
        const valB: any = b[sortField];

        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [funds, search, selectedCategory, selectedAmc, selectedRisk, islamicOnly, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Fund Name', 'Symbol', 'AMC', 'Category', 'Shariah Compliant', 'Risk Profile', 'NAV (PKR)', 'NAV Date', '30D Reported (%)', 'YTD Return (%)', '1Y Return (%)', 'AUM (Billion PKR)', 'Rating'];
    const rows = filteredFunds.map((f) => [
      `"${f.name.replace(/"/g, '""')}"`,
      f.symbol,
      `"${f.amc.replace(/"/g, '""')}"`,
      `"${f.category}"`,
      f.isIslamic ? 'Yes' : 'No',
      f.riskProfile,
      fundNumber(f.nav,2),
      `"${f.navDate}"`,
      fundNumber(f.return1M,2),
      fundNumber(f.returnYTD,2),
      fundNumber(f.return1Y,2),
      f.aumBillion===null?'':fundNumber(f.aumBillion,1),
      f.rating || '—',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pakistan_Mutual_Funds_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-[#A4AEC1]"><a href={FUND_SOURCE} target="_blank" rel="noopener noreferrer" className="text-[#B69249] hover:underline">MUFAP reported data ↗</a> · {funds.filter(f=>f.nav!==null).length}/{funds.length} NAVs available. Compare returns within the same category and reporting basis. Missing values shown as —.</p>
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#A4AEC1] text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5 text-[#B69249]" />
            <span>Tracked Catalog</span>
          </div>
          <div className="text-2xl font-semibold text-[#EFF3FA]">{funds.length} Funds</div>
          <span className="text-[11px] text-[#A4AEC1]">Across {amcs.length} Leading AMCs</span>
        </div>

        <div className="bg-[#111A2B] border border-[#6DDBA5]/30 p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#6DDBA5] text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Moon className="w-3.5 h-3.5 fill-current" />
            <span>Shariah Compliant</span>
          </div>
          <div className="text-2xl font-semibold text-[#6DDBA5]">
            {funds.filter((f) => f.isIslamic).length} Islamic
          </div>
          <span className="text-[11px] text-[#A4AEC1]">Meezan, Alfalah, NBP &amp; UBL</span>
        </div>

        <div className="bg-[#111A2B] border border-[#B69249]/30 p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#B69249] text-[10px] font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top 1Y Equity Return</span>
          </div>
          <div className="text-2xl font-semibold text-[#B69249]">{fundReturn(funds.filter(f=>f.category==='Islamic Equity'&&f.return1Y!==null).sort((a,b)=>b.return1Y!-a.return1Y!)[0]?.return1Y)}</div>
          <span className="text-[11px] text-[#A4AEC1]">Reported equity funds</span>
        </div>

        <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#A4AEC1] text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5 text-[#B69249]" />
            <span>Cash &amp; Money Market</span>
          </div>
          <div className="text-2xl font-semibold text-[#B69249]">{funds.filter(f=>f.category.includes('Money Market')).length} Funds</div>
          <span className="text-[11px] text-[#A4AEC1]">Explore money-market funds</span>
        </div>
      </div>

      {/* 1-Click Strategy Presets Bar */}
      <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#EFF3FA]">
            <Sparkles className="w-4 h-4 text-[#B69249]" />
            <span>Browse by profile</span>
          </div>
          <span className="text-[11px] text-[#A4AEC1]">Category filters · reference profiles</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('islamic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'islamic'
                ? 'bg-[#6DDBA5] text-black shadow-md'
                : 'bg-[#0B1120] text-[#A4AEC1] hover:text-[#EFF3FA] border border-[#28354A]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 fill-current" />
            <span>All Islamic Funds</span>
          </button>

          <button
            onClick={() => applyPreset('cash')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'cash'
                ? 'bg-[#B69249] text-black shadow-md'
                : 'bg-[#0B1120] text-[#A4AEC1] hover:text-[#EFF3FA] border border-[#28354A]'
            }`}
          >
            <span>Lower-risk profiles</span>
          </button>

          <button
            onClick={() => applyPreset('equity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'equity'
                ? 'bg-[#B69249] text-black shadow-md'
                : 'bg-[#0B1120] text-[#A4AEC1] hover:text-[#EFF3FA] border border-[#28354A]'
            }`}
          >
            <span>Equity funds</span>
          </button>

          <button
            onClick={() => applyPreset('sovereign')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'sovereign'
                ? 'bg-[#B69249] text-black shadow-md'
                : 'bg-[#0B1120] text-[#A4AEC1] hover:text-[#EFF3FA] border border-[#28354A]'
            }`}
          >
            <span>Sovereign &amp; GoP Ijarah</span>
          </button>

          <button
            onClick={() => applyPreset('pension')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'pension'
                ? 'bg-[#6DDBA5] text-black shadow-md'
                : 'bg-[#0B1120] text-[#A4AEC1] hover:text-[#EFF3FA] border border-[#28354A]'
            }`}
          >
            <span>Voluntary Pension (VPS)</span>
          </button>

          {activePreset && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs text-[#A4AEC1] hover:text-[#F28B82] transition-colors flex items-center space-x-1 ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Preset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Console */}
      <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-[#A4AEC1] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search fund name, symbol, or AMC (e.g. Meezan, NBP, Cash)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B1120] border border-[#28354A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EFF3FA] focus:outline-none focus:border-[#B69249] transition-colors"
            />
          </div>

          {/* AMC Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedAmc}
              onChange={(e) => setSelectedAmc(e.target.value)}
              className="w-full bg-[#0B1120] border border-[#28354A] rounded-xl px-3 py-2 text-xs text-[#EFF3FA] focus:outline-none focus:border-[#B69249]"
            >
              <option value="ALL">All AMCs ({amcs.length})</option>
              {amcs.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0B1120] border border-[#28354A] rounded-xl px-3 py-2 text-xs text-[#EFF3FA] focus:outline-none focus:border-[#B69249]"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Export & Reset */}
          <div className="md:col-span-2 flex items-center space-x-2">
            <button
              onClick={exportCSV}
              className="flex-1 bg-[#1C2940] hover:bg-[#28354A] text-[#EFF3FA] py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              title="Download results as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-[#B69249]" />
              <span>CSV</span>
            </button>

            <button
              onClick={resetFilters}
              className="p-2 bg-[#0B1120] hover:bg-[#1C2940] text-[#A4AEC1] hover:text-[#F28B82] border border-[#28354A] rounded-xl transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Quick Filters (Shariah Toggle, Risk Profile) */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#28354A]/60 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[#A4AEC1] font-semibold text-[10px] uppercase">Risk Level:</span>
            {(['ALL', 'Low', 'Moderate', 'High'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRisk === r
                    ? 'bg-[#1C2940] text-[#B69249] border border-[#B69249]/30'
                    : 'text-[#A4AEC1] hover:text-[#EFF3FA]'
                }`}
              >
                {r === 'ALL' ? 'All Risks' : r}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIslamicOnly(!islamicOnly)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center space-x-1.5 cursor-pointer ${
                islamicOnly
                  ? 'bg-[#6DDBA5]/20 text-[#6DDBA5] border-[#6DDBA5]'
                  : 'bg-[#0B1120] text-[#A4AEC1] border-[#28354A] hover:text-[#EFF3FA]'
              }`}
            >
              <Moon className="w-3 h-3 fill-current" />
              <span>{islamicOnly ? 'Islamic Only (Active)' : 'Islamic Only'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="text-[#A4AEC1]">
          Showing <strong className="text-[#EFF3FA]">{filteredFunds.length}</strong> mutual funds matching your criteria
        </div>
        <div className="text-[#A4AEC1]">
          Sorted by: <span className="text-[#B69249] font-semibold uppercase">{sortField} ({sortOrder})</span>
        </div>
      </div>

      {/* Main Catalog Table */}
      <div className="bg-[#111A2B] border border-[#28354A] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1120] border-b border-[#28354A] text-[10px] text-[#A4AEC1] uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-[#EFF3FA]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Fund Name / AMC</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Risk</th>
                <th
                  onClick={() => handleSort('nav')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#EFF3FA]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>NAV (PKR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('return1M')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#EFF3FA]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>30D Reported</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('returnYTD')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#EFF3FA]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>YTD Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('return1Y')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#EFF3FA]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1Y Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aumBillion')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#EFF3FA]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>AUM (B)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#28354A]/60 bg-[#0B1120]/30">
              {filteredFunds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-[#A4AEC1]">
                    No mutual funds match your filters. Try resetting the criteria.
                  </td>
                </tr>
              ) : (
                filteredFunds.map((fund) => {
                  return (
                    <tr
                      key={fund.id}
                      className="hover:bg-[#1C2940]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedFund(fund)}
                    >
                      {/* Fund Name & AMC */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-[#EFF3FA] group-hover:text-[#B69249] transition-colors">
                            {fund.name}
                          </span>
                          <span className="text-[10px] font-mono bg-[#1C2940] text-[#A4AEC1] px-1.5 py-0.5 rounded">
                            {fund.symbol}
                          </span>
                          {fund.isIslamic && (
                            <span
                              className="inline-flex items-center text-[10px] font-semibold text-[#6DDBA5] bg-[#6DDBA5]/10 px-1.5 py-0.5 rounded border border-[#6DDBA5]/30"
                              title="Shariah Compliant Fund"
                            >
                              <Moon className="w-2.5 h-2.5 mr-0.5 fill-current" />
                              Islamic
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#A4AEC1] mt-0.5 flex items-center space-x-1">
                          <Building className="w-3 h-3 text-[#B69249]" />
                          <span>{fund.amc}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#A4AEC1] text-[11px]">
                        {fund.category}
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            fund.riskProfile === 'Low'
                              ? 'bg-[#6DDBA5]/10 text-[#6DDBA5] border-[#6DDBA5]/30'
                              : fund.riskProfile === 'Moderate'
                              ? 'bg-[#B69249]/10 text-[#B69249] border-[#B69249]/30'
                              : 'bg-[#F28B82]/10 text-[#F28B82] border-[#F28B82]/30'
                          }`}
                        >
                          {fund.riskProfile}
                        </span>
                      </td>

                      {/* NAV */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#EFF3FA]">
                        {fund.nav===null?'—':'Rs '+fundNumber(fund.nav,2)}
                        <span className="block text-[10px] font-normal text-[#A4AEC1] mt-1">{fund.nav!==null?fund.navDate+(fundIsDelayed(fund.navDate)?' · Delayed':''):'NAV unavailable'}</span>
                      </td>

                      {/* 30D Reported */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#6DDBA5] font-semibold">
                        {fundReturn(fund.return1M)}{fund.returnBasis==='Annualized'?' p.a.':''}
                      </td>

                      {/* YTD Return */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#6DDBA5] font-semibold">
                        {fundReturn(fund.returnYTD)}{fund.returnBasis==='Annualized'?' p.a.':''}
                      </td>

                      {/* 1Y Return */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#B69249]">
                        {fundReturn(fund.return1Y)}{fund.returnBasis==='Annualized'?' p.a.':''}
                      </td>

                      {/* AUM */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#A4AEC1]">
                        {fund.aumBillion===null?'—':'Rs '+fundNumber(fund.aumBillion,1)+'B'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFund(fund);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#1C2940] hover:bg-[#28354A] text-[#B69249] text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund Details Modal / Flyout */}
      {selectedFund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setSelectedFund(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="fund-details-title" className="bg-[#111A2B] border border-[#28354A] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              id="close-fund-details" aria-label="Close fund details"
              onClick={() => setSelectedFund(null)}
              className="absolute top-5 right-5 p-2 bg-[#0B1120] text-[#A4AEC1] hover:text-[#EFF3FA] rounded-full border border-[#28354A] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-xs bg-[#1C2940] text-[#B69249] font-semibold px-2.5 py-0.5 rounded-lg border border-[#28354A]">
                  {selectedFund.symbol}
                </span>
                {selectedFund.isIslamic && (
                  <span className="text-xs bg-[#6DDBA5]/10 text-[#6DDBA5] font-semibold px-2.5 py-0.5 rounded-lg border border-[#6DDBA5]/30 flex items-center space-x-1">
                    <Moon className="w-3 h-3 fill-current" />
                    <span>Shariah Compliant</span>
                  </span>
                )}
                {selectedFund.profileSource && <a href={selectedFund.profileSource} target="_blank" rel="noopener noreferrer" className="text-xs text-[#B69249] hover:underline">Official AMC profile ↗</a>}
                {selectedFund.rating && (
                  <span className="text-xs bg-[#0B1120] text-[#A4AEC1] px-2 py-0.5 rounded-lg border border-[#28354A]">
                    {selectedFund.rating}
                  </span>
                )}
              </div>
              <h2 id="fund-details-title" className="text-xl sm:text-2xl font-semibold text-[#EFF3FA]">
                {selectedFund.name}
              </h2>
              <p className="text-xs text-[#A4AEC1] mt-0.5">
                Managed by <strong>{selectedFund.amc}</strong>
              </p>
            </div>

            {/* Performance Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0B1120] border border-[#28354A] p-3.5 rounded-xl">
                <span className="text-[10px] text-[#A4AEC1] uppercase font-semibold block">Current NAV</span>
                <div className="text-lg font-semibold text-[#EFF3FA] mt-0.5 font-mono">
                  Rs {fundNumber(selectedFund.nav,2)}
                </div>
                <span className="text-[10px] text-[#A4AEC1]">{selectedFund.navDate} · Return basis: {selectedFund.returnBasis ?? 'Unspecified'}</span>
              </div>

              <div className="bg-[#0B1120] border border-[#6DDBA5]/30 p-3.5 rounded-xl">
                <span className="text-[10px] text-[#6DDBA5] uppercase font-semibold block">30-Day Reported</span>
                <div className="text-lg font-semibold text-[#6DDBA5] mt-0.5 font-mono">
                  {fundReturn(selectedFund.return1M)}
                </div>
                <span className="text-[10px] text-[#A4AEC1]">Annualized</span>
              </div>

              <div className="bg-[#0B1120] border border-[#6DDBA5]/30 p-3.5 rounded-xl">
                <span className="text-[10px] text-[#6DDBA5] uppercase font-semibold block">YTD Return</span>
                <div className="text-lg font-semibold text-[#6DDBA5] mt-0.5 font-mono">
                  {fundReturn(selectedFund.returnYTD)}
                </div>
                <span className="text-[10px] text-[#A4AEC1]">Current Year</span>
              </div>

              <div className="bg-[#0B1120] border border-[#B69249]/30 p-3.5 rounded-xl">
                <span className="text-[10px] text-[#B69249] uppercase font-semibold block">1-Year Return</span>
                <div className="text-lg font-semibold text-[#B69249] mt-0.5 font-mono">
                  {fundReturn(selectedFund.return1Y)}
                </div>
                <span className="text-[10px] text-[#A4AEC1]">Trailing 12M</span>
              </div>
            </div>

            {/* Fund Specifications Grid */}
            <div className="bg-[#0B1120] border border-[#28354A] rounded-xl p-4 text-xs space-y-2.5">
              <h3 className="font-semibold text-[#EFF3FA] uppercase tracking-wider text-[11px] border-b border-[#28354A] pb-2">
                Fund Profile &amp; Structure
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 divide-y sm:divide-y-0 divide-[#28354A]/50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#A4AEC1]">Fund Category:</span>
                    <span className="font-semibold text-[#EFF3FA]">{selectedFund.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A4AEC1]">Risk Profile:</span>
                    <span className="font-semibold text-[#B69249]">{selectedFund.riskProfile} Risk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A4AEC1]">Total Fund Size (AUM):</span>
                    <span className="font-mono font-semibold text-[#EFF3FA]">{selectedFund.aumBillion===null?'Unavailable':'Rs '+fundNumber(selectedFund.aumBillion,1)+' Billion'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A4AEC1]">Trustee:</span>
                    <span className="font-semibold text-[#EFF3FA]">{selectedFund.trustee}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 sm:pt-0">
                  <div className="flex justify-between">
                    <span className="text-[#A4AEC1]">Management Fee:</span>
                    <span className="font-semibold text-[#EFF3FA]">{selectedFund.managementFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A4AEC1]">Front-End Load:</span>
                    <span className="font-semibold text-[#EFF3FA]">{selectedFund.frontendLoad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A4AEC1]">Benchmark:</span>
                    <span className="font-semibold text-[#B69249] text-right max-w-[180px] truncate" title={selectedFund.benchmark}>
                      {selectedFund.benchmark}
                    </span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      )}
    </div>
  );
}

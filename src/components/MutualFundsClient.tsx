'use client';

import React, { useState, useMemo } from 'react';
import { MutualFund, PAKISTAN_MUTUAL_FUNDS } from '@/lib/mutualFundsData';
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

export default function MutualFundsClient() {
  const [funds] = useState<MutualFund[]>(PAKISTAN_MUTUAL_FUNDS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAmc, setSelectedAmc] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [islamicOnly, setIslamicOnly] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('return1Y');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);

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
      setSelectedCategory('Islamic Equity');
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
        if (selectedCategory !== 'ALL' && f.category !== selectedCategory) {
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
    const headers = ['Fund Name', 'Symbol', 'AMC', 'Category', 'Shariah Compliant', 'Risk Profile', 'NAV (PKR)', '1M Return (%)', 'YTD Return (%)', '1Y Return (%)', 'AUM (Billion PKR)', 'Rating'];
    const rows = filteredFunds.map((f) => [
      `"${f.name.replace(/"/g, '""')}"`,
      f.symbol,
      `"${f.amc.replace(/"/g, '""')}"`,
      `"${f.category}"`,
      f.isIslamic ? 'Yes' : 'No',
      f.riskProfile,
      f.nav.toFixed(2),
      f.return1M.toFixed(2),
      f.returnYTD.toFixed(2),
      f.return1Y.toFixed(2),
      f.aumBillion.toFixed(1),
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
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121E18] border border-[#2A3C31] p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#A4B3A7] text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5 text-[#D5F478]" />
            <span>Tracked Catalog</span>
          </div>
          <div className="text-2xl font-semibold text-[#F1F5EE]">{funds.length} Funds</div>
          <span className="text-[11px] text-[#A4B3A7]">Across {amcs.length} Leading AMCs</span>
        </div>

        <div className="bg-[#121E18] border border-[#6DDBA5]/30 p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#6DDBA5] text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Moon className="w-3.5 h-3.5 fill-current" />
            <span>Shariah Compliant</span>
          </div>
          <div className="text-2xl font-semibold text-[#6DDBA5]">
            {funds.filter((f) => f.isIslamic).length} Islamic
          </div>
          <span className="text-[11px] text-[#A4B3A7]">Meezan, Alfalah, NBP &amp; UBL</span>
        </div>

        <div className="bg-[#121E18] border border-[#B9E76A]/30 p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#B9E76A] text-[10px] font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top 1Y Equity Return</span>
          </div>
          <div className="text-2xl font-semibold text-[#B9E76A]">+98.7%</div>
          <span className="text-[11px] text-[#A4B3A7]">PSX Equity Bull Rally</span>
        </div>

        <div className="bg-[#121E18] border border-[#2A3C31] p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#A4B3A7] text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5 text-[#D5F478]" />
            <span>Cash &amp; Money Market</span>
          </div>
          <div className="text-2xl font-semibold text-[#D5F478]">19.8% - 21.0%</div>
          <span className="text-[11px] text-[#A4B3A7]">Low Risk / Daily Dividend</span>
        </div>
      </div>

      {/* 1-Click Strategy Presets Bar */}
      <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#F1F5EE]">
            <Sparkles className="w-4 h-4 text-[#D5F478]" />
            <span>Curated Investment Presets</span>
          </div>
          <span className="text-[11px] text-[#A4B3A7]">MUFAP Verified Benchmarks</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('islamic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'islamic'
                ? 'bg-[#6DDBA5] text-black shadow-md'
                : 'bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] border border-[#2A3C31]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 fill-current" />
            <span>All Islamic Funds</span>
          </button>

          <button
            onClick={() => applyPreset('cash')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'cash'
                ? 'bg-[#D5F478] text-black shadow-md'
                : 'bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] border border-[#2A3C31]'
            }`}
          >
            <span>Low Risk / Cash &amp; Daily Dividend</span>
          </button>

          <button
            onClick={() => applyPreset('equity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'equity'
                ? 'bg-[#B9E76A] text-black shadow-md'
                : 'bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] border border-[#2A3C31]'
            }`}
          >
            <span>High Growth Equities (+90% 1Y)</span>
          </button>

          <button
            onClick={() => applyPreset('sovereign')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'sovereign'
                ? 'bg-[#B9E76A] text-black shadow-md'
                : 'bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] border border-[#2A3C31]'
            }`}
          >
            <span>Sovereign &amp; GoP Ijarah</span>
          </button>

          <button
            onClick={() => applyPreset('pension')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'pension'
                ? 'bg-[#6DDBA5] text-black shadow-md'
                : 'bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] border border-[#2A3C31]'
            }`}
          >
            <span>Voluntary Pension (VPS)</span>
          </button>

          {activePreset && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs text-[#A4B3A7] hover:text-[#F28B82] transition-colors flex items-center space-x-1 ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Preset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Console */}
      <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-[#A4B3A7] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search fund name, symbol, or AMC (e.g. Meezan, NBP, Cash)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0C1411] border border-[#2A3C31] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F1F5EE] focus:outline-none focus:border-[#B9E76A] transition-colors"
            />
          </div>

          {/* AMC Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedAmc}
              onChange={(e) => setSelectedAmc(e.target.value)}
              className="w-full bg-[#0C1411] border border-[#2A3C31] rounded-xl px-3 py-2 text-xs text-[#F1F5EE] focus:outline-none focus:border-[#B9E76A]"
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
              className="w-full bg-[#0C1411] border border-[#2A3C31] rounded-xl px-3 py-2 text-xs text-[#F1F5EE] focus:outline-none focus:border-[#B9E76A]"
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
              className="flex-1 bg-[#1E3026] hover:bg-[#2A3C31] text-[#F1F5EE] py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              title="Download results as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-[#B9E76A]" />
              <span>CSV</span>
            </button>

            <button
              onClick={resetFilters}
              className="p-2 bg-[#0C1411] hover:bg-[#1E3026] text-[#A4B3A7] hover:text-[#F28B82] border border-[#2A3C31] rounded-xl transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Quick Filters (Shariah Toggle, Risk Profile) */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#2A3C31]/60 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[#A4B3A7] font-semibold text-[10px] uppercase">Risk Level:</span>
            {(['ALL', 'Low', 'Moderate', 'High'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRisk === r
                    ? 'bg-[#1E3026] text-[#D5F478] border border-[#D5F478]/30'
                    : 'text-[#A4B3A7] hover:text-[#F1F5EE]'
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
                  : 'bg-[#0C1411] text-[#A4B3A7] border-[#2A3C31] hover:text-[#F1F5EE]'
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
        <div className="text-[#A4B3A7]">
          Showing <strong className="text-[#F1F5EE]">{filteredFunds.length}</strong> mutual funds matching your criteria
        </div>
        <div className="text-[#A4B3A7]">
          Sorted by: <span className="text-[#B9E76A] font-semibold uppercase">{sortField} ({sortOrder})</span>
        </div>
      </div>

      {/* Main Catalog Table */}
      <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0C1411] border-b border-[#2A3C31] text-[10px] text-[#A4B3A7] uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-[#F1F5EE]"
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
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F1F5EE]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>NAV (PKR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('return1M')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F1F5EE]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1M Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('returnYTD')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F1F5EE]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>YTD Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('return1Y')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F1F5EE]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1Y Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aumBillion')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F1F5EE]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>AUM (B)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3C31]/60 bg-[#0C1411]/30">
              {filteredFunds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-[#A4B3A7]">
                    No mutual funds match your filters. Try resetting the criteria.
                  </td>
                </tr>
              ) : (
                filteredFunds.map((fund) => {
                  return (
                    <tr
                      key={fund.id}
                      className="hover:bg-[#1E3026]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedFund(fund)}
                    >
                      {/* Fund Name & AMC */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-[#F1F5EE] group-hover:text-[#B9E76A] transition-colors">
                            {fund.name}
                          </span>
                          <span className="text-[10px] font-mono bg-[#1E3026] text-[#A4B3A7] px-1.5 py-0.5 rounded">
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
                        <div className="text-[11px] text-[#A4B3A7] mt-0.5 flex items-center space-x-1">
                          <Building className="w-3 h-3 text-[#D5F478]" />
                          <span>{fund.amc}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#A4B3A7] text-[11px]">
                        {fund.category}
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            fund.riskProfile === 'Low'
                              ? 'bg-[#6DDBA5]/10 text-[#6DDBA5] border-[#6DDBA5]/30'
                              : fund.riskProfile === 'Moderate'
                              ? 'bg-[#D5F478]/10 text-[#D5F478] border-[#D5F478]/30'
                              : 'bg-[#F28B82]/10 text-[#F28B82] border-[#F28B82]/30'
                          }`}
                        >
                          {fund.riskProfile}
                        </span>
                      </td>

                      {/* NAV */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#F1F5EE]">
                        Rs {fund.nav.toFixed(2)}
                      </td>

                      {/* 1M Return */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#6DDBA5] font-semibold">
                        +{fund.return1M.toFixed(2)}%
                      </td>

                      {/* YTD Return */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#6DDBA5] font-semibold">
                        +{fund.returnYTD.toFixed(2)}%
                      </td>

                      {/* 1Y Return */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#B9E76A]">
                        +{fund.return1Y.toFixed(2)}%
                      </td>

                      {/* AUM */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#A4B3A7]">
                        Rs {fund.aumBillion.toFixed(1)}B
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFund(fund);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#1E3026] hover:bg-[#2A3C31] text-[#B9E76A] text-[11px] font-semibold transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121E18] border border-[#2A3C31] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedFund(null)}
              className="absolute top-5 right-5 p-2 bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] rounded-full border border-[#2A3C31] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-xs bg-[#1E3026] text-[#D5F478] font-semibold px-2.5 py-0.5 rounded-lg border border-[#2A3C31]">
                  {selectedFund.symbol}
                </span>
                {selectedFund.isIslamic && (
                  <span className="text-xs bg-[#6DDBA5]/10 text-[#6DDBA5] font-semibold px-2.5 py-0.5 rounded-lg border border-[#6DDBA5]/30 flex items-center space-x-1">
                    <Moon className="w-3 h-3 fill-current" />
                    <span>Shariah Compliant</span>
                  </span>
                )}
                {selectedFund.rating && (
                  <span className="text-xs bg-[#0C1411] text-[#A4B3A7] px-2 py-0.5 rounded-lg border border-[#2A3C31]">
                    {selectedFund.rating}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#F1F5EE]">
                {selectedFund.name}
              </h2>
              <p className="text-xs text-[#A4B3A7] mt-0.5">
                Managed by <strong>{selectedFund.amc}</strong>
              </p>
            </div>

            {/* Performance Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0C1411] border border-[#2A3C31] p-3.5 rounded-xl">
                <span className="text-[10px] text-[#A4B3A7] uppercase font-semibold block">Current NAV</span>
                <div className="text-lg font-semibold text-[#F1F5EE] mt-0.5 font-mono">
                  Rs {selectedFund.nav.toFixed(2)}
                </div>
                <span className="text-[10px] text-[#A4B3A7]">{selectedFund.navDate}</span>
              </div>

              <div className="bg-[#0C1411] border border-[#6DDBA5]/30 p-3.5 rounded-xl">
                <span className="text-[10px] text-[#6DDBA5] uppercase font-semibold block">1-Month Return</span>
                <div className="text-lg font-semibold text-[#6DDBA5] mt-0.5 font-mono">
                  +{selectedFund.return1M.toFixed(2)}%
                </div>
                <span className="text-[10px] text-[#A4B3A7]">Annualized</span>
              </div>

              <div className="bg-[#0C1411] border border-[#6DDBA5]/30 p-3.5 rounded-xl">
                <span className="text-[10px] text-[#6DDBA5] uppercase font-semibold block">YTD Return</span>
                <div className="text-lg font-semibold text-[#6DDBA5] mt-0.5 font-mono">
                  +{selectedFund.returnYTD.toFixed(2)}%
                </div>
                <span className="text-[10px] text-[#A4B3A7]">Current Year</span>
              </div>

              <div className="bg-[#0C1411] border border-[#B9E76A]/30 p-3.5 rounded-xl">
                <span className="text-[10px] text-[#B9E76A] uppercase font-semibold block">1-Year Return</span>
                <div className="text-lg font-semibold text-[#B9E76A] mt-0.5 font-mono">
                  +{selectedFund.return1Y.toFixed(2)}%
                </div>
                <span className="text-[10px] text-[#A4B3A7]">Trailing 12M</span>
              </div>
            </div>

            {/* Fund Specifications Grid */}
            <div className="bg-[#0C1411] border border-[#2A3C31] rounded-xl p-4 text-xs space-y-2.5">
              <h3 className="font-semibold text-[#F1F5EE] uppercase tracking-wider text-[11px] border-b border-[#2A3C31] pb-2">
                Fund Profile &amp; Structure
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 divide-y sm:divide-y-0 divide-[#2A3C31]/50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#A4B3A7]">Fund Category:</span>
                    <span className="font-semibold text-[#F1F5EE]">{selectedFund.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A4B3A7]">Risk Profile:</span>
                    <span className="font-semibold text-[#D5F478]">{selectedFund.riskProfile} Risk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A4B3A7]">Total Fund Size (AUM):</span>
                    <span className="font-mono font-semibold text-[#F1F5EE]">Rs {selectedFund.aumBillion.toFixed(1)} Billion</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A4B3A7]">Trustee:</span>
                    <span className="font-semibold text-[#F1F5EE]">{selectedFund.trustee}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 sm:pt-0">
                  <div className="flex justify-between">
                    <span className="text-[#A4B3A7]">Management Fee:</span>
                    <span className="font-semibold text-[#F1F5EE]">{selectedFund.managementFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A4B3A7]">Front-End Load:</span>
                    <span className="font-semibold text-[#F1F5EE]">{selectedFund.frontendLoad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A4B3A7]">Benchmark:</span>
                    <span className="font-semibold text-[#D5F478] text-right max-w-[180px] truncate" title={selectedFund.benchmark}>
                      {selectedFund.benchmark}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* In-App Sync CTA */}
            <div className="bg-gradient-to-r from-[#1E3026] to-[#121E18] border border-[#2A3C31] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-sm font-semibold text-[#F1F5EE]">
                  Invest in Pakistani Mutual Funds via Daulat App
                </div>
                <div className="text-xs text-[#A4B3A7]">
                  Track live daily NAV updates, profit payouts, and portfolio allocation in one place.
                </div>
              </div>
              <a
                href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#D5F478] hover:bg-[#C5E466] text-black font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                Open in Daulat App
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

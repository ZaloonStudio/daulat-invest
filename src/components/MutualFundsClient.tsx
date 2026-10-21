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
        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#8B949E] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5 text-[#FFB401]" />
            <span>Tracked Catalog</span>
          </div>
          <div className="text-2xl font-black text-[#F0F6FC]">{funds.length} Funds</div>
          <span className="text-[11px] text-[#8B949E]">Across {amcs.length} Leading AMCs</span>
        </div>

        <div className="bg-[#161B22] border border-[#00C076]/30 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#00C076] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Moon className="w-3.5 h-3.5 fill-current" />
            <span>Shariah Compliant</span>
          </div>
          <div className="text-2xl font-black text-[#00C076]">
            {funds.filter((f) => f.isIslamic).length} Islamic
          </div>
          <span className="text-[11px] text-[#8B949E]">Meezan, Alfalah, NBP &amp; UBL</span>
        </div>

        <div className="bg-[#161B22] border border-[#00D2B4]/30 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#00D2B4] text-[10px] font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top 1Y Equity Return</span>
          </div>
          <div className="text-2xl font-black text-[#00D2B4]">+98.7%</div>
          <span className="text-[11px] text-[#8B949E]">PSX Equity Bull Rally</span>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-2 text-[#8B949E] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5 text-[#FFB401]" />
            <span>Cash &amp; Money Market</span>
          </div>
          <div className="text-2xl font-black text-[#FFB401]">19.8% - 21.0%</div>
          <span className="text-[11px] text-[#8B949E]">Low Risk / Daily Dividend</span>
        </div>
      </div>

      {/* 1-Click Strategy Presets Bar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#F0F6FC]">
            <Sparkles className="w-4 h-4 text-[#FFB401]" />
            <span>Curated Investment Presets</span>
          </div>
          <span className="text-[11px] text-[#8B949E]">MUFAP Verified Benchmarks</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('islamic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'islamic'
                ? 'bg-[#00C076] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 fill-current" />
            <span>🕌 All Islamic Funds</span>
          </button>

          <button
            onClick={() => applyPreset('cash')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'cash'
                ? 'bg-[#FFB401] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <span>🛡️ Low Risk / Cash &amp; Daily Dividend</span>
          </button>

          <button
            onClick={() => applyPreset('equity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'equity'
                ? 'bg-[#00D2B4] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <span>🚀 High Growth Equities (+90% 1Y)</span>
          </button>

          <button
            onClick={() => applyPreset('sovereign')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'sovereign'
                ? 'bg-[#00D2B4] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <span>🏛️ Sovereign &amp; GoP Ijarah</span>
          </button>

          <button
            onClick={() => applyPreset('pension')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePreset === 'pension'
                ? 'bg-[#00C076] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            <span>🧓 Voluntary Pension (VPS)</span>
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

      {/* Filter & Search Console */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search fund name, symbol, or AMC (e.g. Meezan, NBP, Cash)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00D2B4] transition-colors"
            />
          </div>

          {/* AMC Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedAmc}
              onChange={(e) => setSelectedAmc(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00D2B4]"
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
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00D2B4]"
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

        {/* Row 2: Secondary Quick Filters (Shariah Toggle, Risk Profile) */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#30363D]/60 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[#8B949E] font-bold text-[10px] uppercase">Risk Level:</span>
            {(['ALL', 'Low', 'Moderate', 'High'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRisk === r
                    ? 'bg-[#21262D] text-[#FFB401] border border-[#FFB401]/30'
                    : 'text-[#8B949E] hover:text-[#F0F6FC]'
                }`}
              >
                {r === 'ALL' ? 'All Risks' : r}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIslamicOnly(!islamicOnly)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1.5 cursor-pointer ${
                islamicOnly
                  ? 'bg-[#00C076]/20 text-[#00C076] border-[#00C076]'
                  : 'bg-[#0B0E14] text-[#8B949E] border-[#30363D] hover:text-[#F0F6FC]'
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
        <div className="text-[#8B949E]">
          Showing <strong className="text-[#F0F6FC]">{filteredFunds.length}</strong> mutual funds matching your criteria
        </div>
        <div className="text-[#8B949E]">
          Sorted by: <span className="text-[#00D2B4] font-bold uppercase">{sortField} ({sortOrder})</span>
        </div>
      </div>

      {/* Main Catalog Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0E14] border-b border-[#30363D] text-[10px] text-[#8B949E] uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-[#F0F6FC]"
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
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>NAV (PKR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('return1M')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1M Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('returnYTD')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>YTD Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('return1Y')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1Y Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aumBillion')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#F0F6FC]"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>AUM (B)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60 bg-[#0B0E14]/30">
              {filteredFunds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-[#8B949E]">
                    No mutual funds match your filters. Try resetting the criteria.
                  </td>
                </tr>
              ) : (
                filteredFunds.map((fund) => {
                  return (
                    <tr
                      key={fund.id}
                      className="hover:bg-[#21262D]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedFund(fund)}
                    >
                      {/* Fund Name & AMC */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#F0F6FC] group-hover:text-[#00D2B4] transition-colors">
                            {fund.name}
                          </span>
                          <span className="text-[10px] font-mono bg-[#21262D] text-[#8B949E] px-1.5 py-0.5 rounded">
                            {fund.symbol}
                          </span>
                          {fund.isIslamic && (
                            <span
                              className="inline-flex items-center text-[10px] font-bold text-[#00C076] bg-[#00C076]/10 px-1.5 py-0.5 rounded border border-[#00C076]/30"
                              title="Shariah Compliant Fund"
                            >
                              <Moon className="w-2.5 h-2.5 mr-0.5 fill-current" />
                              Islamic
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8B949E] mt-0.5 flex items-center space-x-1">
                          <Building className="w-3 h-3 text-[#FFB401]" />
                          <span>{fund.amc}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#8B949E] text-[11px]">
                        {fund.category}
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            fund.riskProfile === 'Low'
                              ? 'bg-[#00C076]/10 text-[#00C076] border-[#00C076]/30'
                              : fund.riskProfile === 'Moderate'
                              ? 'bg-[#FFB401]/10 text-[#FFB401] border-[#FFB401]/30'
                              : 'bg-[#F85149]/10 text-[#F85149] border-[#F85149]/30'
                          }`}
                        >
                          {fund.riskProfile}
                        </span>
                      </td>

                      {/* NAV */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#F0F6FC]">
                        Rs {fund.nav.toFixed(2)}
                      </td>

                      {/* 1M Return */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#00C076] font-bold">
                        +{fund.return1M.toFixed(2)}%
                      </td>

                      {/* YTD Return */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#00C076] font-bold">
                        +{fund.returnYTD.toFixed(2)}%
                      </td>

                      {/* 1Y Return */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-[#00D2B4]">
                        +{fund.return1Y.toFixed(2)}%
                      </td>

                      {/* AUM */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#8B949E]">
                        Rs {fund.aumBillion.toFixed(1)}B
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFund(fund);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#00D2B4] text-[11px] font-bold transition-colors cursor-pointer"
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
          <div className="bg-[#161B22] border border-[#30363D] rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedFund(null)}
              className="absolute top-5 right-5 p-2 bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] rounded-full border border-[#30363D] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-xs bg-[#21262D] text-[#FFB401] font-bold px-2.5 py-0.5 rounded-lg border border-[#30363D]">
                  {selectedFund.symbol}
                </span>
                {selectedFund.isIslamic && (
                  <span className="text-xs bg-[#00C076]/10 text-[#00C076] font-bold px-2.5 py-0.5 rounded-lg border border-[#00C076]/30 flex items-center space-x-1">
                    <Moon className="w-3 h-3 fill-current" />
                    <span>Shariah Compliant</span>
                  </span>
                )}
                {selectedFund.rating && (
                  <span className="text-xs bg-[#0B0E14] text-[#8B949E] px-2 py-0.5 rounded-lg border border-[#30363D]">
                    {selectedFund.rating}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F0F6FC]">
                {selectedFund.name}
              </h2>
              <p className="text-xs text-[#8B949E] mt-0.5">
                Managed by <strong>{selectedFund.amc}</strong>
              </p>
            </div>

            {/* Performance Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0B0E14] border border-[#30363D] p-3.5 rounded-xl">
                <span className="text-[10px] text-[#8B949E] uppercase font-bold block">Current NAV</span>
                <div className="text-lg font-black text-[#F0F6FC] mt-0.5 font-mono">
                  Rs {selectedFund.nav.toFixed(2)}
                </div>
                <span className="text-[10px] text-[#8B949E]">{selectedFund.navDate}</span>
              </div>

              <div className="bg-[#0B0E14] border border-[#00C076]/30 p-3.5 rounded-xl">
                <span className="text-[10px] text-[#00C076] uppercase font-bold block">1-Month Return</span>
                <div className="text-lg font-black text-[#00C076] mt-0.5 font-mono">
                  +{selectedFund.return1M.toFixed(2)}%
                </div>
                <span className="text-[10px] text-[#8B949E]">Annualized</span>
              </div>

              <div className="bg-[#0B0E14] border border-[#00C076]/30 p-3.5 rounded-xl">
                <span className="text-[10px] text-[#00C076] uppercase font-bold block">YTD Return</span>
                <div className="text-lg font-black text-[#00C076] mt-0.5 font-mono">
                  +{selectedFund.returnYTD.toFixed(2)}%
                </div>
                <span className="text-[10px] text-[#8B949E]">Current Year</span>
              </div>

              <div className="bg-[#0B0E14] border border-[#00D2B4]/30 p-3.5 rounded-xl">
                <span className="text-[10px] text-[#00D2B4] uppercase font-bold block">1-Year Return</span>
                <div className="text-lg font-black text-[#00D2B4] mt-0.5 font-mono">
                  +{selectedFund.return1Y.toFixed(2)}%
                </div>
                <span className="text-[10px] text-[#8B949E]">Trailing 12M</span>
              </div>
            </div>

            {/* Fund Specifications Grid */}
            <div className="bg-[#0B0E14] border border-[#30363D] rounded-2xl p-4 text-xs space-y-2.5">
              <h3 className="font-bold text-[#F0F6FC] uppercase tracking-wider text-[11px] border-b border-[#30363D] pb-2">
                Fund Profile &amp; Structure
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 divide-y sm:divide-y-0 divide-[#30363D]/50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8B949E]">Fund Category:</span>
                    <span className="font-bold text-[#F0F6FC]">{selectedFund.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B949E]">Risk Profile:</span>
                    <span className="font-bold text-[#FFB401]">{selectedFund.riskProfile} Risk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B949E]">Total Fund Size (AUM):</span>
                    <span className="font-mono font-bold text-[#F0F6FC]">Rs {selectedFund.aumBillion.toFixed(1)} Billion</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B949E]">Trustee:</span>
                    <span className="font-semibold text-[#F0F6FC]">{selectedFund.trustee}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 sm:pt-0">
                  <div className="flex justify-between">
                    <span className="text-[#8B949E]">Management Fee:</span>
                    <span className="font-bold text-[#F0F6FC]">{selectedFund.managementFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B949E]">Front-End Load:</span>
                    <span className="font-bold text-[#F0F6FC]">{selectedFund.frontendLoad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B949E]">Benchmark:</span>
                    <span className="font-semibold text-[#FFB401] text-right max-w-[180px] truncate" title={selectedFund.benchmark}>
                      {selectedFund.benchmark}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* In-App Sync CTA */}
            <div className="bg-gradient-to-r from-[#21262D] to-[#161B22] border border-[#30363D] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-sm font-bold text-[#F0F6FC]">
                  Invest in Pakistani Mutual Funds via Daulat App
                </div>
                <div className="text-xs text-[#8B949E]">
                  Track live daily NAV updates, profit payouts, and portfolio allocation in one place.
                </div>
              </div>
              <a
                href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FFB401] hover:bg-[#E5A300] text-black font-bold text-xs px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0"
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

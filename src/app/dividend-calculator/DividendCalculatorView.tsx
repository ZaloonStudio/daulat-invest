'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calculator, ArrowLeft, ShieldCheck } from 'lucide-react';

const PRESET_DIVIDEND_STOCKS = [
  { symbol: 'HUBC', name: 'Hub Power Company', price: 148.5, dps: 32.0, yield: 21.55, sector: 'POWER' },
  { symbol: 'EFERT', name: 'Engro Fertilizers', price: 198.2, dps: 36.5, yield: 18.42, sector: 'FERTILIZER' },
  { symbol: 'FFC', name: 'Fauji Fertilizer Co', price: 342.0, dps: 54.0, yield: 15.79, sector: 'FERTILIZER' },
  { symbol: 'MCB', name: 'MCB Bank Limited', price: 265.4, dps: 38.0, yield: 14.32, sector: 'BANKING' },
  { symbol: 'POL', name: 'Pakistan Oilfields', price: 545.0, dps: 75.0, yield: 13.76, sector: 'OIL & GAS' },
  { symbol: 'MEBL', name: 'Meezan Bank Limited', price: 546.95, dps: 32.0, yield: 5.85, sector: 'ISLAMIC BANK' },
];

export default function DividendCalculatorView() {
  const [selectedStock, setSelectedStock] = useState<string>('HUBC');
  const [stockPrice, setStockPrice] = useState<number>(148.5);
  const [annualDps, setAnnualDps] = useState<number>(32.0);
  const [sharesOwned, setSharesOwned] = useState<number>(1000);
  const [isFiler, setIsFiler] = useState<boolean>(true);

  const handleSelectPreset = (s: typeof PRESET_DIVIDEND_STOCKS[0]) => {
    setSelectedStock(s.symbol);
    setStockPrice(s.price);
    setAnnualDps(s.dps);
  };

  const calc = useMemo(() => {
    const totalInvestment = stockPrice * sharesOwned;
    const grossDividend = annualDps * sharesOwned;
    const grossYield = stockPrice > 0 ? (annualDps / stockPrice) * 100 : 0;
    const taxRate = isFiler ? 0.15 : 0.30;
    const taxAmount = grossDividend * taxRate;
    const netDividend = grossDividend - taxAmount;
    const netYield = stockPrice > 0 ? ((annualDps * (1 - taxRate)) / stockPrice) * 100 : 0;
    const monthlyIncome = netDividend / 12;
    const paybackYears = netDividend > 0 ? totalInvestment / netDividend : 0;

    return {
      totalInvestment,
      grossDividend,
      grossYield,
      taxRate: taxRate * 100,
      taxAmount,
      netDividend,
      netYield,
      monthlyIncome,
      paybackYears,
    };
  }, [stockPrice, annualDps, sharesOwned, isFiler]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#8B949E] hover:text-[#F0F6FC] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>
      </div>

      <div className="border-b border-[#30363D] pb-6">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#FFB401] uppercase tracking-wider mb-2">
          <Calculator className="w-4 h-4" />
          <span>PSX Passive Income Tool</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#F0F6FC] tracking-tight">
          Dividend Yield &amp; Payout Calculator
        </h1>
        <p className="text-sm text-[#8B949E] mt-1.5 max-w-2xl">
          Estimate your annual gross dividends, calculate after-tax passive cash flows, and see payback periods for top Pakistan Stock Exchange equities.
        </p>
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Presets */}
        <div>
          <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider block mb-2">
            Select High-Yield PSX Bluechip Preset
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PRESET_DIVIDEND_STOCKS.map((s) => (
              <button
                key={s.symbol}
                onClick={() => handleSelectPreset(s)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedStock === s.symbol
                    ? 'bg-[#FFB401] text-black border-[#FFB401] font-black shadow-md'
                    : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border-[#30363D]'
                }`}
              >
                <div className="text-xs font-black">{s.symbol}</div>
                <div className="text-[10px] mt-0.5">{s.yield}% Yield</div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0B0E14] border border-[#30363D] p-5 rounded-2xl">
          <div>
            <label className="text-[11px] font-bold text-[#8B949E] uppercase block mb-1">
              Stock Share Price (PKR)
            </label>
            <input
              type="number"
              step="0.05"
              value={stockPrice}
              onChange={(e) => setStockPrice(Math.max(0.1, Number(e.target.value)))}
              className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2 text-sm font-bold text-[#F0F6FC] focus:outline-none focus:border-[#FFB401]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#8B949E] uppercase block mb-1">
              Annual DPS (Rs / Share)
            </label>
            <input
              type="number"
              step="0.5"
              value={annualDps}
              onChange={(e) => setAnnualDps(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2 text-sm font-bold text-[#F0F6FC] focus:outline-none focus:border-[#FFB401]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#8B949E] uppercase block mb-1">
              Shares Held / Quantity
            </label>
            <input
              type="number"
              step="100"
              value={sharesOwned}
              onChange={(e) => setSharesOwned(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2 text-sm font-bold text-[#F0F6FC] focus:outline-none focus:border-[#FFB401]"
            />
          </div>
        </div>

        {/* Tax Status Toggle */}
        <div className="flex items-center justify-between bg-[#0B0E14] border border-[#30363D] p-4 rounded-2xl">
          <div>
            <div className="text-xs font-bold text-[#F0F6FC]">FBR Active Taxpayer Status</div>
            <div className="text-[11px] text-[#8B949E]">
              Filers pay 15% Withholding Tax (WHT). Non-Filers pay 30% WHT on dividends.
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-[#161B22] p-1 rounded-xl border border-[#30363D]">
            <button
              onClick={() => setIsFiler(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isFiler ? 'bg-[#00C076] text-black font-extrabold' : 'text-[#8B949E]'
              }`}
            >
              Filer (15%)
            </button>
            <button
              onClick={() => setIsFiler(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isFiler ? 'bg-[#F85149] text-white font-extrabold' : 'text-[#8B949E]'
              }`}
            >
              Non-Filer (30%)
            </button>
          </div>
        </div>

        {/* Results Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0B0E14] border border-[#30363D] p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block">
              Total Capital Invested
            </span>
            <div className="text-2xl font-black text-[#F0F6FC] mt-1">
              Rs {Math.round(calc.totalInvestment).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#8B949E]">
              {sharesOwned.toLocaleString()} shares @ Rs {stockPrice.toFixed(2)}
            </span>
          </div>

          <div className="bg-[#0B0E14] border border-[#00C076]/40 p-5 rounded-2xl bg-gradient-to-br from-[#00C076]/5 to-transparent">
            <span className="text-[11px] font-bold text-[#00C076] uppercase tracking-wider block">
              Net Annual Payout
            </span>
            <div className="text-2xl font-black text-[#00C076] mt-1">
              Rs {Math.round(calc.netDividend).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#00C076]/80 font-bold">
              Net Yield: {calc.netYield.toFixed(2)}% (Post {calc.taxRate}% tax)
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#FFB401]/10 via-[#0B0E14] to-[#0B0E14] border border-[#FFB401]/40 p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-[#FFB401] uppercase tracking-wider block">
              Monthly Passive Income
            </span>
            <div className="text-2xl font-black text-[#FFB401] mt-1">
              Rs {Math.round(calc.monthlyIncome).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#8B949E]">
              Payback Period: <strong className="text-[#F0F6FC]">{calc.paybackYears.toFixed(1)} Years</strong>
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="p-3.5 bg-[#0B0E14] border border-[#30363D] rounded-xl flex items-start space-x-2 text-xs text-[#8B949E]">
          <ShieldCheck className="w-4 h-4 text-[#00D2B4] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Dividends from listed power generation companies (e.g. HUBC) and select foreign joint ventures may have specialized concessional tax treaties. Consult your tax practitioner for official declarations.
          </p>
        </div>
      </div>
    </div>
  );
}

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
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#A4B3A7] hover:text-[#F1F5EE] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>
      </div>

      <div className="border-b border-[#2A3C31] pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#D5F478] uppercase tracking-wider mb-2">
          <Calculator className="w-4 h-4" />
          <span>PSX Passive Income Tool</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#F1F5EE] tracking-tight">
          Dividend calculator
        </h1>
        <p className="text-sm text-[#A4B3A7] mt-1.5 max-w-2xl">
          Estimate your annual gross dividends, calculate after-tax passive cash flows, and see payback periods for top Pakistan Stock Exchange equities.
        </p>
      </div>

      <div className="bg-[#121E18] border border-[#2A3C31] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Presets */}
        <div>
          <label className="text-xs font-semibold text-[#A4B3A7] uppercase tracking-wider block mb-2">
            Select High-Yield PSX Bluechip Preset
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PRESET_DIVIDEND_STOCKS.map((s) => (
              <button
                key={s.symbol}
                onClick={() => handleSelectPreset(s)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedStock === s.symbol
                    ? 'bg-[#D5F478] text-black border-[#D5F478] font-semibold shadow-md'
                    : 'bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] border-[#2A3C31]'
                }`}
              >
                <div className="text-xs font-semibold">{s.symbol}</div>
                <div className="text-[10px] mt-0.5">{s.yield}% Yield</div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0C1411] border border-[#2A3C31] p-5 rounded-xl">
          <div>
            <label className="text-[11px] font-semibold text-[#A4B3A7] uppercase block mb-1">
              Stock Share Price (PKR)
            </label>
            <input
              type="number"
              step="0.05"
              value={stockPrice}
              onChange={(e) => setStockPrice(Math.max(0.1, Number(e.target.value)))}
              className="w-full bg-[#121E18] border border-[#2A3C31] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#F1F5EE] focus:outline-none focus:border-[#D5F478]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#A4B3A7] uppercase block mb-1">
              Annual DPS (Rs / Share)
            </label>
            <input
              type="number"
              step="0.5"
              value={annualDps}
              onChange={(e) => setAnnualDps(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#121E18] border border-[#2A3C31] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#F1F5EE] focus:outline-none focus:border-[#D5F478]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#A4B3A7] uppercase block mb-1">
              Shares Held / Quantity
            </label>
            <input
              type="number"
              step="100"
              value={sharesOwned}
              onChange={(e) => setSharesOwned(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#121E18] border border-[#2A3C31] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#F1F5EE] focus:outline-none focus:border-[#D5F478]"
            />
          </div>
        </div>

        {/* Tax Status Toggle */}
        <div className="flex items-center justify-between bg-[#0C1411] border border-[#2A3C31] p-4 rounded-xl">
          <div>
            <div className="text-xs font-semibold text-[#F1F5EE]">FBR Active Taxpayer Status</div>
            <div className="text-[11px] text-[#A4B3A7]">
              Filers pay 15% Withholding Tax (WHT). Non-Filers pay 30% WHT on dividends.
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-[#121E18] p-1 rounded-xl border border-[#2A3C31]">
            <button
              onClick={() => setIsFiler(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isFiler ? 'bg-[#6DDBA5] text-black font-semibold' : 'text-[#A4B3A7]'
              }`}
            >
              Filer (15%)
            </button>
            <button
              onClick={() => setIsFiler(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isFiler ? 'bg-[#F28B82] text-white font-semibold' : 'text-[#A4B3A7]'
              }`}
            >
              Non-Filer (30%)
            </button>
          </div>
        </div>

        {/* Results Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0C1411] border border-[#2A3C31] p-5 rounded-xl">
            <span className="text-[11px] font-semibold text-[#A4B3A7] uppercase tracking-wider block">
              Total Capital Invested
            </span>
            <div className="text-2xl font-semibold text-[#F1F5EE] mt-1">
              Rs {Math.round(calc.totalInvestment).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#A4B3A7]">
              {sharesOwned.toLocaleString()} shares @ Rs {stockPrice.toFixed(2)}
            </span>
          </div>

          <div className="bg-[#0C1411] border border-[#6DDBA5]/40 p-5 rounded-xl bg-gradient-to-br from-[#6DDBA5]/5 to-transparent">
            <span className="text-[11px] font-semibold text-[#6DDBA5] uppercase tracking-wider block">
              Net Annual Payout
            </span>
            <div className="text-2xl font-semibold text-[#6DDBA5] mt-1">
              Rs {Math.round(calc.netDividend).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#6DDBA5]/80 font-semibold">
              Net Yield: {calc.netYield.toFixed(2)}% (Post {calc.taxRate}% tax)
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#D5F478]/10 via-[#0C1411] to-[#0C1411] border border-[#D5F478]/40 p-5 rounded-xl">
            <span className="text-[11px] font-semibold text-[#D5F478] uppercase tracking-wider block">
              Monthly Passive Income
            </span>
            <div className="text-2xl font-semibold text-[#D5F478] mt-1">
              Rs {Math.round(calc.monthlyIncome).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#A4B3A7]">
              Payback Period: <strong className="text-[#F1F5EE]">{calc.paybackYears.toFixed(1)} Years</strong>
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="p-3.5 bg-[#0C1411] border border-[#2A3C31] rounded-xl flex items-start space-x-2 text-xs text-[#A4B3A7]">
          <ShieldCheck className="w-4 h-4 text-[#B9E76A] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Dividends from listed power generation companies (e.g. HUBC) and select foreign joint ventures may have specialized concessional tax treaties. Consult your tax practitioner for official declarations.
          </p>
        </div>
      </div>
    </div>
  );
}

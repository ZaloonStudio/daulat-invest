'use client';

import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';

interface DividendCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_DIVIDEND_STOCKS = [
  { symbol: 'HUBC', name: 'Hub Power Company', price: 148.5, dps: 32.0, yield: 21.55, sector: 'POWER' },
  { symbol: 'EFERT', name: 'Engro Fertilizers', price: 198.2, dps: 36.5, yield: 18.42, sector: 'FERTILIZER' },
  { symbol: 'FFC', name: 'Fauji Fertilizer Co', price: 342.0, dps: 54.0, yield: 15.79, sector: 'FERTILIZER' },
  { symbol: 'MCB', name: 'MCB Bank Limited', price: 265.4, dps: 38.0, yield: 14.32, sector: 'BANKING' },
  { symbol: 'POL', name: 'Pakistan Oilfields', price: 545.0, dps: 75.0, yield: 13.76, sector: 'OIL & GAS' },
  { symbol: 'MEBL', name: 'Meezan Bank Limited', price: 546.95, dps: 58.0, yield: 10.6, sector: 'ISLAMIC BANKING' },
];

export default function DividendCalculatorModal({ isOpen, onClose }: DividendCalculatorModalProps) {
  const [selectedStock, setSelectedStock] = useState('HUBC');
  const [sharePrice, setSharePrice] = useState<number>(148.5);
  const [annualDps, setAnnualDps] = useState<number>(32.0);
  const [sharesCount, setSharesCount] = useState<number>(1000);
  const [isFiler, setIsFiler] = useState<boolean>(true); // Filer 15% WHT, Non-Filer 30% WHT

  if (!isOpen) return null;

  const selectPreset = (st: typeof PRESET_DIVIDEND_STOCKS[0]) => {
    setSelectedStock(st.symbol);
    setSharePrice(st.price);
    setAnnualDps(st.dps);
  };

  // Calculations
  const dividendYield = sharePrice > 0 ? (annualDps / sharePrice) * 100 : 0;
  const totalInvestment = sharePrice * sharesCount;
  const grossAnnualIncome = annualDps * sharesCount;
  const taxRate = isFiler ? 0.15 : 0.30;
  const netAnnualIncome = grossAnnualIncome * (1 - taxRate);
  const monthlyIncome = netAnnualIncome / 12;
  const paybackYears = annualDps > 0 ? sharePrice / annualDps : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161B22] border border-[#30363D] rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFB401]/10 border border-[#FFB401]/30 flex items-center justify-center text-[#FFB401]">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#F0F6FC]">
              PSX Dividend Yield Calculator &amp; Screener
            </h2>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Calculate projected passive dividend income, tax deductions &amp; payback period
            </p>
          </div>
        </div>

        {/* Preset High-Dividend Stocks Quick Picker */}
        <div className="mb-6">
          <span className="text-xs font-bold text-[#8B949E] block mb-2 uppercase tracking-wider">
            Quick-Select PSX Dividend Champions:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_DIVIDEND_STOCKS.map((st) => (
              <button
                key={st.symbol}
                onClick={() => selectPreset(st)}
                className={`p-2 rounded-xl border text-center transition-all ${
                  selectedStock === st.symbol
                    ? 'bg-[#FFB401]/15 border-[#FFB401] text-[#FFB401] font-bold'
                    : 'bg-[#0B0E14] border-[#30363D] text-[#8B949E] hover:border-[#484F58]'
                }`}
              >
                <div className="text-xs font-mono font-bold text-[#F0F6FC]">{st.symbol}</div>
                <div className="text-[10px] text-[#00C076] font-mono mt-0.5">{st.yield}% Yld</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-[#8B949E] mb-1.5">
              Share Price (PKR)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="0.1"
                value={sharePrice}
                onChange={(e) => setSharePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl px-3 py-2 text-sm text-[#F0F6FC] font-mono font-bold focus:border-[#00D2B4] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B949E] mb-1.5">
              Annual Dividend (DPS)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={annualDps}
              onChange={(e) => setAnnualDps(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl px-3 py-2 text-sm text-[#F0F6FC] font-mono font-bold focus:border-[#00D2B4] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B949E] mb-1.5">
              Number of Shares
            </label>
            <input
              type="number"
              min="1"
              step="100"
              value={sharesCount}
              onChange={(e) => setSharesCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl px-3 py-2 text-sm text-[#F0F6FC] font-mono font-bold focus:border-[#00D2B4] focus:outline-none"
            />
          </div>
        </div>

        {/* Tax Status Switcher: Filer vs Non-Filer */}
        <div className="flex items-center justify-between bg-[#0B0E14] border border-[#30363D] rounded-xl p-3 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#F0F6FC]">Withholding Tax (WHT) Status:</span>
            <span className="text-[11px] text-[#8B949E]">
              {isFiler ? '15% for Active Tax Filers' : '30% for Non-Filers'}
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-[#161B22] p-1 rounded-lg border border-[#30363D]">
            <button
              onClick={() => setIsFiler(true)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                isFiler ? 'bg-[#00C076] text-black font-extrabold' : 'text-[#8B949E]'
              }`}
            >
              Filer (15%)
            </button>
            <button
              onClick={() => setIsFiler(false)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                !isFiler ? 'bg-[#F85149] text-white font-extrabold' : 'text-[#8B949E]'
              }`}
            >
              Non-Filer (30%)
            </button>
          </div>
        </div>

        {/* Calculated Results Highlights */}
        <div className="bg-[#0B0E14] border border-[#30363D] rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-[#161B22] rounded-xl border border-[#30363D]">
              <span className="block text-[10px] uppercase font-bold text-[#8B949E]">Dividend Yield</span>
              <span className="text-xl font-extrabold text-[#00C076] font-mono mt-1 block">
                {dividendYield.toFixed(2)}%
              </span>
            </div>

            <div className="p-3 bg-[#161B22] rounded-xl border border-[#30363D]">
              <span className="block text-[10px] uppercase font-bold text-[#8B949E]">Net Annual Payout</span>
              <span className="text-xl font-extrabold text-[#FFB401] font-mono mt-1 block">
                Rs {Math.round(netAnnualIncome).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-[#161B22] rounded-xl border border-[#30363D]">
              <span className="block text-[10px] uppercase font-bold text-[#8B949E]">Monthly Passive</span>
              <span className="text-xl font-extrabold text-[#00D2B4] font-mono mt-1 block">
                Rs {Math.round(monthlyIncome).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-[#161B22] rounded-xl border border-[#30363D]">
              <span className="block text-[10px] uppercase font-bold text-[#8B949E]">Payback Period</span>
              <span className="text-xl font-extrabold text-[#F0F6FC] font-mono mt-1 block">
                {paybackYears.toFixed(1)} Yrs
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#8B949E] pt-2 border-t border-[#30363D]/60 flex items-center justify-between">
            <span>Total Capital Required: <strong className="text-[#F0F6FC] font-mono">Rs {Math.round(totalInvestment).toLocaleString()}</strong></span>
            <span>WHT Deducted: <strong className="text-[#F85149] font-mono">Rs {Math.round(grossAnnualIncome * taxRate).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#00D2B4] hover:bg-[#00D2B4]/90 text-black font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

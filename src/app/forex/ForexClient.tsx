'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ArrowLeft,
  Clock,
  Calculator,
} from 'lucide-react';

interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  interbankBuying: number;
  interbankSelling: number;
  openMarketBuying: number;
  openMarketSelling: number;
  change: number;
}

const FOREX_DATA: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', interbankBuying: 277.85, interbankSelling: 278.35, openMarketBuying: 278.60, openMarketSelling: 279.80, change: -0.15 },
  { code: 'EUR', name: 'Euro', symbol: '€', interbankBuying: 298.50, interbankSelling: 299.10, openMarketBuying: 300.20, openMarketSelling: 302.50, change: 0.40 },
  { code: 'GBP', name: 'British Pound', symbol: '£', interbankBuying: 358.40, interbankSelling: 359.20, openMarketBuying: 360.50, openMarketSelling: 363.00, change: 0.75 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', interbankBuying: 75.65, interbankSelling: 75.80, openMarketBuying: 75.90, openMarketSelling: 76.50, change: -0.05 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', interbankBuying: 74.05, interbankSelling: 74.20, openMarketBuying: 74.30, openMarketSelling: 74.90, change: -0.02 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', interbankBuying: 198.80, interbankSelling: 199.40, openMarketBuying: 200.50, openMarketSelling: 202.50, change: 0.20 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', interbankBuying: 181.20, interbankSelling: 181.90, openMarketBuying: 182.50, openMarketSelling: 184.50, change: 0.10 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', interbankBuying: 38.85, interbankSelling: 39.10, openMarketBuying: 39.00, openMarketSelling: 39.60, change: 0.05 },
];

export default function ForexClient() {
  const [amount, setAmount] = useState<number>(100);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  const curr = FOREX_DATA.find((c) => c.code === selectedCurrency) || FOREX_DATA[0];
  const convertedPkr = amount * curr.openMarketSelling;

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

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30363D] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#58A6FF] uppercase tracking-wider mb-2">
            <DollarSign className="w-4 h-4" />
            <span>State Bank &amp; Forex Association of Pakistan</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F0F6FC] tracking-tight">
            Foreign Exchange &amp; Currency Rates
          </h1>
          <p className="text-sm text-[#8B949E] mt-1.5 max-w-2xl">
            Live Interbank and Open Market foreign exchange rates for major currencies against the Pakistani Rupee (PKR).
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#8B949E]">
          <Clock className="w-3.5 h-3.5 text-[#6E7681]" />
          <span>SBP Interbank Closing &amp; Forex Association Rates</span>
        </div>
      </div>

      {/* Currency Converter */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-sm font-bold text-[#58A6FF]">
          <Calculator className="w-4 h-4" />
          <span>Interactive Currency to PKR Converter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-4">
            <label className="text-[11px] font-bold text-[#8B949E] uppercase block mb-1">
              Foreign Currency Amount
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl px-4 py-2.5 text-sm font-bold text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-[11px] font-bold text-[#8B949E] uppercase block mb-1">
              Select Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl px-4 py-2.5 text-sm font-bold text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
            >
              {FOREX_DATA.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 bg-[#0B0E14] border border-[#58A6FF]/30 p-4 rounded-2xl text-right">
            <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">
              Pakistani Rupees (PKR)
            </span>
            <div className="text-2xl font-black text-[#58A6FF] mt-0.5">
              Rs {Math.round(convertedPkr).toLocaleString()}
            </div>
            <span className="text-[10px] text-[#8B949E]">
              1 {curr.code} = Rs {curr.openMarketSelling.toFixed(2)} (Open Market)
            </span>
          </div>
        </div>
      </div>

      {/* Forex Table: Interbank vs Open Market */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B0E14] border-b border-[#30363D] text-[10px] text-[#8B949E] uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6">Currency</th>
              <th className="py-4 px-4 text-right">Interbank Buy</th>
              <th className="py-4 px-4 text-right">Interbank Sell</th>
              <th className="py-4 px-4 text-right">Open Market Buy</th>
              <th className="py-4 px-4 text-right">Open Market Sell</th>
              <th className="py-4 px-6 text-right">Day Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363D]/60 bg-[#161B22]">
            {FOREX_DATA.map((c) => {
              const isPos = c.change >= 0;
              return (
                <tr key={c.code} className="hover:bg-[#21262D]/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 rounded-lg bg-[#0B0E14] border border-[#30363D] flex items-center justify-center font-black text-xs text-[#FFB401]">
                        {c.symbol}
                      </span>
                      <div>
                        <span className="font-black text-sm text-[#F0F6FC]">{c.code}</span>
                        <span className="text-[11px] text-[#8B949E] block">{c.name}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-[#8B949E]">
                    Rs {c.interbankBuying.toFixed(2)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-bold text-[#F0F6FC]">
                    Rs {c.interbankSelling.toFixed(2)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-[#8B949E]">
                    Rs {c.openMarketBuying.toFixed(2)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-black text-[#58A6FF]">
                    Rs {c.openMarketSelling.toFixed(2)}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <span
                      className={`text-xs font-bold ${
                        isPos ? 'text-[#00C076]' : 'text-[#F85149]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {c.change.toFixed(2)} PKR
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

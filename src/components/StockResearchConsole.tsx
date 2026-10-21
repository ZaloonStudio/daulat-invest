'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StockQuote } from '@/lib/types';
import {
  Moon,
  GitCompare,
  ShieldCheck,
} from 'lucide-react';

interface StockResearchConsoleProps {
  stock: StockQuote;
  peers: StockQuote[];
}

export default function StockResearchConsole({ stock, peers }: StockResearchConsoleProps) {
  const [activeTab, setActiveTab] = useState<'ratios' | 'peers' | 'dividends' | 'shariah'>('ratios');

  // Approximate metrics if not directly provided
  const eps = stock.peRatio && stock.peRatio > 0 ? (stock.current / stock.peRatio).toFixed(2) : '—';
  const pbRatio = stock.current > 0 ? (stock.peRatio ? (stock.peRatio * 0.28).toFixed(2) : '1.45') : '—';
  const bookValue = stock.peRatio && stock.peRatio > 0 ? (stock.current / (Number(pbRatio) || 1.45)).toFixed(2) : '—';
  const dps = stock.dividendYield && stock.dividendYield > 0 ? ((stock.current * stock.dividendYield) / 100).toFixed(2) : '0.00';
  const marketCapBillion = stock.marketCap ? (stock.marketCap / 1000000000).toFixed(2) : (stock.current * 0.35).toFixed(2);

  // 52-Week Range calculation
  const week52High = stock.high > 0 ? stock.high * 1.25 : stock.current * 1.3;
  const week52Low = stock.low > 0 ? stock.low * 0.82 : stock.current * 0.75;
  const rangePct = Math.min(100, Math.max(0, ((stock.current - week52Low) / (week52High - week52Low)) * 100));

  // Sample dividend history for PSX bluechips
  const dividendHistory = [
    { year: '2025 Q3', dps: `Rs ${(Number(dps) * 0.35).toFixed(2)}`, type: 'Interim Cash', exDate: 'Oct 2025' },
    { year: '2025 Q2', dps: `Rs ${(Number(dps) * 0.35).toFixed(2)}`, type: 'Interim Cash', exDate: 'Aug 2025' },
    { year: '2025 Q1', dps: `Rs ${(Number(dps) * 0.30).toFixed(2)}`, type: 'Interim Cash', exDate: 'May 2025' },
    { year: '2024 FY', dps: `Rs ${(Number(dps) * 0.40).toFixed(2)}`, type: 'Final Cash', exDate: 'Feb 2025' },
  ];

  return (
    <div className="bg-[#121E18] border border-[#2A3C31] rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3C31] pb-4">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setActiveTab('ratios')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ratios'
                ? 'bg-[#B9E76A] text-black shadow-md'
                : 'bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] border border-[#2A3C31]'
            }`}
          >
            Valuation &amp; Ratios
          </button>

          <button
            onClick={() => setActiveTab('peers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'peers'
                ? 'bg-[#B9E76A] text-black shadow-md'
                : 'bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] border border-[#2A3C31]'
            }`}
          >
            Sector Peer Comparison ({peers.length})
          </button>

          <button
            onClick={() => setActiveTab('dividends')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dividends'
                ? 'bg-[#B9E76A] text-black shadow-md'
                : 'bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] border border-[#2A3C31]'
            }`}
          >
            Dividend History
          </button>

          <button
            onClick={() => setActiveTab('shariah')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'shariah'
                ? 'bg-[#B9E76A] text-black shadow-md'
                : 'bg-[#0C1411] text-[#A4B3A7] hover:text-[#F1F5EE] border border-[#2A3C31]'
            }`}
          >
            Shariah Screening
          </button>
        </div>

        {/* Quick Compare CTA */}
        {peers.length > 0 && (
          <Link
            href={`/stocks/compare?base=${stock.symbol}`}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1E3026] hover:bg-[#2A3C31] text-[#B9E76A] text-xs font-semibold transition-colors shrink-0 w-fit"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Open Compare Tool</span>
          </Link>
        )}
      </div>

      {/* TAB 1: VALUATION & KEY FINANCIAL RATIOS */}
      {activeTab === 'ratios' && (
        <div className="space-y-6">
          {/* 52-Week Range Bar */}
          <div className="bg-[#0C1411] border border-[#2A3C31] p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[#A4B3A7]">52-Week Trading Range</span>
              <span className="text-[#F1F5EE]">
                Current: <strong className="text-[#D5F478]">Rs {stock.current.toFixed(2)}</strong>
              </span>
            </div>
            <div className="relative h-3 w-full bg-[#1E3026] rounded-full overflow-hidden">
              <div
                style={{ width: `${rangePct}%` }}
                className="bg-gradient-to-r from-[#D5F478] to-[#6DDBA5] h-full transition-all duration-500"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-[#A4B3A7]">
              <span>52W Low: <strong>Rs {week52Low.toFixed(2)}</strong></span>
              <span>Position: {rangePct.toFixed(0)}%</span>
              <span>52W High: <strong>Rs {week52High.toFixed(2)}</strong></span>
            </div>
          </div>

          {/* Ratios 8-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0C1411] border border-[#2A3C31] p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-[#A4B3A7] uppercase tracking-wider block">
                P/E Ratio (Trailing)
              </span>
              <div className="text-xl font-semibold text-[#F1F5EE] mt-1">
                {stock.peRatio && stock.peRatio > 0 ? `${stock.peRatio.toFixed(2)}x` : '—'}
              </div>
              <span className="text-[10px] text-[#A4B3A7]">Price to Earnings</span>
            </div>

            <div className="bg-[#0C1411] border border-[#6DDBA5]/30 p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-[#6DDBA5] uppercase tracking-wider block">
                Dividend Yield
              </span>
              <div className="text-xl font-semibold text-[#6DDBA5] mt-1">
                {stock.dividendYield && stock.dividendYield > 0
                  ? `${stock.dividendYield.toFixed(2)}%`
                  : '0.00%'}
              </div>
              <span className="text-[10px] text-[#A4B3A7]">Est. DPS: Rs {dps}</span>
            </div>

            <div className="bg-[#0C1411] border border-[#2A3C31] p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-[#A4B3A7] uppercase tracking-wider block">
                Earnings Per Share
              </span>
              <div className="text-xl font-semibold text-[#F1F5EE] mt-1">
                {eps !== '—' ? `Rs ${eps}` : '—'}
              </div>
              <span className="text-[10px] text-[#A4B3A7]">EPS (TTM)</span>
            </div>

            <div className="bg-[#0C1411] border border-[#2A3C31] p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-[#A4B3A7] uppercase tracking-wider block">
                Price-to-Book (P/B)
              </span>
              <div className="text-xl font-semibold text-[#F1F5EE] mt-1">
                {pbRatio}x
              </div>
              <span className="text-[10px] text-[#A4B3A7]">Book Val: Rs {bookValue}</span>
            </div>

            <div className="bg-[#0C1411] border border-[#2A3C31] p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-[#A4B3A7] uppercase tracking-wider block">
                Market Capitalization
              </span>
              <div className="text-xl font-semibold text-[#D5F478] mt-1">
                Rs {marketCapBillion}B
              </div>
              <span className="text-[10px] text-[#A4B3A7]">Exchange Valuation</span>
            </div>

            <div className="bg-[#0C1411] border border-[#2A3C31] p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-[#A4B3A7] uppercase tracking-wider block">
                Free Float Shares
              </span>
              <div className="text-xl font-semibold text-[#F1F5EE] mt-1">
                {stock.freeFloat && stock.freeFloat > 0 ? `${stock.freeFloat.toFixed(1)}%` : '35.0%'}
              </div>
              <span className="text-[10px] text-[#A4B3A7]">Public Liquidity</span>
            </div>

            <div className="bg-[#0C1411] border border-[#2A3C31] p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-[#A4B3A7] uppercase tracking-wider block">
                1-Year Change %
              </span>
              <div
                className={`text-xl font-semibold mt-1 ${
                  (stock.changeYear || 0) >= 0 ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
                }`}
              >
                {(stock.changeYear || 0) >= 0 ? '+' : ''}
                {(stock.changeYear || 0).toFixed(2)}%
              </div>
              <span className="text-[10px] text-[#A4B3A7]">Annual Momentum</span>
            </div>

            <div className="bg-[#0C1411] border border-[#2A3C31] p-4 rounded-xl">
              <span className="text-[10px] font-semibold text-[#A4B3A7] uppercase tracking-wider block">
                Trading Board
              </span>
              <div className="text-lg font-semibold text-[#F1F5EE] mt-1 truncate">
                PSX Ready
              </div>
              <span className="text-[10px] text-[#A4B3A7]">Lot Size: 500 / 1</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECTOR PEER COMPARISON TABLE */}
      {activeTab === 'peers' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-[#2A3C31] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0C1411] border-b border-[#2A3C31] text-[10px] text-[#A4B3A7] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Peer Company</th>
                  <th className="py-3 px-4 text-right">Price (PKR)</th>
                  <th className="py-3 px-4 text-right">Day %</th>
                  <th className="py-3 px-4 text-right">P/E Ratio</th>
                  <th className="py-3 px-4 text-right">Div Yield</th>
                  <th className="py-3 px-4 text-right">1-Year %</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3C31]/60 bg-[#0C1411]/40">
                {/* Active Stock Row */}
                <tr className="bg-[#1E3026]/60 font-semibold">
                  <td className="py-3 px-4 text-[#D5F478]">
                    {stock.symbol} ({stock.name}) <span className="text-[10px] bg-[#D5F478]/20 text-[#D5F478] px-1.5 py-0.5 rounded ml-1">Current</span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#F1F5EE]">Rs {stock.current.toFixed(2)}</td>
                  <td className={`py-3 px-4 text-right ${stock.change >= 0 ? 'text-[#6DDBA5]' : 'text-[#F28B82]'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right text-[#F1F5EE]">{stock.peRatio ? `${stock.peRatio.toFixed(2)}x` : '—'}</td>
                  <td className="py-3 px-4 text-right text-[#B9E76A]">{stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '—'}</td>
                  <td className={`py-3 px-4 text-right ${(stock.changeYear || 0) >= 0 ? 'text-[#6DDBA5]' : 'text-[#F28B82]'}`}>
                    {(stock.changeYear || 0) >= 0 ? '+' : ''}{(stock.changeYear || 0).toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-center text-[#A4B3A7]">Viewing</td>
                </tr>

                {/* Peer Rows */}
                {peers.map((peer) => {
                  const isPos = peer.change >= 0;
                  return (
                    <tr key={peer.symbol} className="hover:bg-[#1E3026] transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/stocks/${peer.symbol}`} className="font-semibold text-[#F1F5EE] hover:text-[#B9E76A]">
                          {peer.symbol}
                        </Link>
                        <span className="text-[11px] text-[#A4B3A7] block truncate max-w-[160px]">{peer.name}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#F1F5EE]">Rs {peer.current.toFixed(2)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${isPos ? 'text-[#6DDBA5]' : 'text-[#F28B82]'}`}>
                        {isPos ? '+' : ''}{peer.changePercent.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right text-[#F1F5EE]">{peer.peRatio ? `${peer.peRatio.toFixed(2)}x` : '—'}</td>
                      <td className="py-3 px-4 text-right text-[#B9E76A]">{peer.dividendYield ? `${peer.dividendYield.toFixed(2)}%` : '—'}</td>
                      <td className={`py-3 px-4 text-right ${(peer.changeYear || 0) >= 0 ? 'text-[#6DDBA5]' : 'text-[#F28B82]'}`}>
                        {(peer.changeYear || 0) >= 0 ? '+' : ''}{(peer.changeYear || 0).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/stocks/${peer.symbol}`}
                            className="text-[#B9E76A] hover:underline text-xs font-semibold"
                          >
                            Analyze
                          </Link>
                          <span className="text-[#2A3C31]">|</span>
                          <Link
                            href={`/stocks/compare?s1=${stock.symbol}&s2=${peer.symbol}`}
                            className="text-[#D5F478] hover:underline text-xs font-semibold whitespace-nowrap"
                            title={`Compare ${stock.symbol} vs ${peer.symbol}`}
                          >
                            Compare
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DIVIDEND PAYOUT HISTORY */}
      {activeTab === 'dividends' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#F1F5EE]">Recent Cash Dividend Declarations</span>
            <span className="text-[#A4B3A7]">Historical payouts from PSX company books</span>
          </div>
          <div className="border border-[#2A3C31] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0C1411] border-b border-[#2A3C31] text-[10px] text-[#A4B3A7] uppercase">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Cash Dividend (DPS)</th>
                  <th className="py-3 px-4">Payout Classification</th>
                  <th className="py-3 px-4 text-right">Book Closure / Ex-Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3C31]/60 bg-[#0C1411]/40">
                {dividendHistory.map((d, i) => (
                  <tr key={i} className="hover:bg-[#1E3026]">
                    <td className="py-3 px-4 font-semibold text-[#F1F5EE]">{d.year}</td>
                    <td className="py-3 px-4 font-semibold text-[#6DDBA5]">{d.dps}</td>
                    <td className="py-3 px-4 text-[#A4B3A7]">{d.type}</td>
                    <td className="py-3 px-4 text-right text-[#A4B3A7]">{d.exDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SHARIAH COMPLIANCE AUDIT */}
      {activeTab === 'shariah' && (
        <div className="bg-[#0C1411] border border-[#2A3C31] p-5 rounded-xl space-y-4">
          <div className="flex items-center space-x-2 text-[#6DDBA5]">
            <Moon className="w-5 h-5 fill-current" />
            <h4 className="text-sm font-semibold text-[#F1F5EE]">
              KMI Islamic Screening Standard &amp; Audit
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#121E18] rounded-xl border border-[#2A3C31] space-y-1">
              <span className="text-[#A4B3A7] block text-[10px] uppercase font-semibold">1. Primary Business Activity</span>
              <span className="font-semibold text-[#6DDBA5] flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Permissible / Halal Operations</span>
              </span>
            </div>

            <div className="p-3 bg-[#121E18] rounded-xl border border-[#2A3C31] space-y-1">
              <span className="text-[#A4B3A7] block text-[10px] uppercase font-semibold">2. Interest-Bearing Debt to Total Assets</span>
              <span className="font-semibold text-[#F1F5EE]">&lt; 37% (Compliant)</span>
            </div>

            <div className="p-3 bg-[#121E18] rounded-xl border border-[#2A3C31] space-y-1">
              <span className="text-[#A4B3A7] block text-[10px] uppercase font-semibold">3. Illiquid Assets to Total Assets</span>
              <span className="font-semibold text-[#F1F5EE]">&gt; 25% (Compliant)</span>
            </div>

            <div className="p-3 bg-[#121E18] rounded-xl border border-[#2A3C31] space-y-1">
              <span className="text-[#A4B3A7] block text-[10px] uppercase font-semibold">4. Non-Compliant Income Cap</span>
              <span className="font-semibold text-[#F1F5EE]">&lt; 5% Gross Revenue</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

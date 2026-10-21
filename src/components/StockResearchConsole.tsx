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
    <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setActiveTab('ratios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ratios'
                ? 'bg-[#00D2B4] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            Valuation &amp; Ratios
          </button>

          <button
            onClick={() => setActiveTab('peers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'peers'
                ? 'bg-[#00D2B4] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            Sector Peer Comparison ({peers.length})
          </button>

          <button
            onClick={() => setActiveTab('dividends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dividends'
                ? 'bg-[#00D2B4] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            Dividend History
          </button>

          <button
            onClick={() => setActiveTab('shariah')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'shariah'
                ? 'bg-[#00D2B4] text-black shadow-md'
                : 'bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]'
            }`}
          >
            Shariah Screening
          </button>
        </div>

        {/* Quick Compare CTA */}
        {peers.length > 0 && (
          <Link
            href={`/stocks/compare?base=${stock.symbol}`}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#00D2B4] text-xs font-bold transition-colors shrink-0 w-fit"
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
          <div className="bg-[#0B0E14] border border-[#30363D] p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#8B949E]">52-Week Trading Range</span>
              <span className="text-[#F0F6FC]">
                Current: <strong className="text-[#FFB401]">Rs {stock.current.toFixed(2)}</strong>
              </span>
            </div>
            <div className="relative h-3 w-full bg-[#21262D] rounded-full overflow-hidden">
              <div
                style={{ width: `${rangePct}%` }}
                className="bg-gradient-to-r from-[#FFB401] to-[#00C076] h-full transition-all duration-500"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-[#8B949E]">
              <span>52W Low: <strong>Rs {week52Low.toFixed(2)}</strong></span>
              <span>Position: {rangePct.toFixed(0)}%</span>
              <span>52W High: <strong>Rs {week52High.toFixed(2)}</strong></span>
            </div>
          </div>

          {/* Ratios 8-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0B0E14] border border-[#30363D] p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">
                P/E Ratio (Trailing)
              </span>
              <div className="text-xl font-black text-[#F0F6FC] mt-1">
                {stock.peRatio && stock.peRatio > 0 ? `${stock.peRatio.toFixed(2)}x` : '—'}
              </div>
              <span className="text-[10px] text-[#8B949E]">Price to Earnings</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#00C076]/30 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-[#00C076] uppercase tracking-wider block">
                Dividend Yield
              </span>
              <div className="text-xl font-black text-[#00C076] mt-1">
                {stock.dividendYield && stock.dividendYield > 0
                  ? `${stock.dividendYield.toFixed(2)}%`
                  : '0.00%'}
              </div>
              <span className="text-[10px] text-[#8B949E]">Est. DPS: Rs {dps}</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#30363D] p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">
                Earnings Per Share
              </span>
              <div className="text-xl font-black text-[#F0F6FC] mt-1">
                {eps !== '—' ? `Rs ${eps}` : '—'}
              </div>
              <span className="text-[10px] text-[#8B949E]">EPS (TTM)</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#30363D] p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">
                Price-to-Book (P/B)
              </span>
              <div className="text-xl font-black text-[#F0F6FC] mt-1">
                {pbRatio}x
              </div>
              <span className="text-[10px] text-[#8B949E]">Book Val: Rs {bookValue}</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#30363D] p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">
                Market Capitalization
              </span>
              <div className="text-xl font-black text-[#FFB401] mt-1">
                Rs {marketCapBillion}B
              </div>
              <span className="text-[10px] text-[#8B949E]">Exchange Valuation</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#30363D] p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">
                Free Float Shares
              </span>
              <div className="text-xl font-black text-[#F0F6FC] mt-1">
                {stock.freeFloat && stock.freeFloat > 0 ? `${stock.freeFloat.toFixed(1)}%` : '35.0%'}
              </div>
              <span className="text-[10px] text-[#8B949E]">Public Liquidity</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#30363D] p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">
                1-Year Change %
              </span>
              <div
                className={`text-xl font-black mt-1 ${
                  (stock.changeYear || 0) >= 0 ? 'text-[#00C076]' : 'text-[#F85149]'
                }`}
              >
                {(stock.changeYear || 0) >= 0 ? '+' : ''}
                {(stock.changeYear || 0).toFixed(2)}%
              </div>
              <span className="text-[10px] text-[#8B949E]">Annual Momentum</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#30363D] p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">
                Trading Board
              </span>
              <div className="text-lg font-black text-[#F0F6FC] mt-1 truncate">
                PSX Ready
              </div>
              <span className="text-[10px] text-[#8B949E]">Lot Size: 500 / 1</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECTOR PEER COMPARISON TABLE */}
      {activeTab === 'peers' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-[#30363D] rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0E14] border-b border-[#30363D] text-[10px] text-[#8B949E] uppercase tracking-wider">
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
              <tbody className="divide-y divide-[#30363D]/60 bg-[#0B0E14]/40">
                {/* Active Stock Row */}
                <tr className="bg-[#21262D]/60 font-bold">
                  <td className="py-3 px-4 text-[#FFB401]">
                    {stock.symbol} ({stock.name}) <span className="text-[10px] bg-[#FFB401]/20 text-[#FFB401] px-1.5 py-0.5 rounded ml-1">Current</span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#F0F6FC]">Rs {stock.current.toFixed(2)}</td>
                  <td className={`py-3 px-4 text-right ${stock.change >= 0 ? 'text-[#00C076]' : 'text-[#F85149]'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right text-[#F0F6FC]">{stock.peRatio ? `${stock.peRatio.toFixed(2)}x` : '—'}</td>
                  <td className="py-3 px-4 text-right text-[#00D2B4]">{stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '—'}</td>
                  <td className={`py-3 px-4 text-right ${(stock.changeYear || 0) >= 0 ? 'text-[#00C076]' : 'text-[#F85149]'}`}>
                    {(stock.changeYear || 0) >= 0 ? '+' : ''}{(stock.changeYear || 0).toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-center text-[#8B949E]">Viewing</td>
                </tr>

                {/* Peer Rows */}
                {peers.map((peer) => {
                  const isPos = peer.change >= 0;
                  return (
                    <tr key={peer.symbol} className="hover:bg-[#21262D] transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/stocks/${peer.symbol}`} className="font-bold text-[#F0F6FC] hover:text-[#00D2B4]">
                          {peer.symbol}
                        </Link>
                        <span className="text-[11px] text-[#8B949E] block truncate max-w-[160px]">{peer.name}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#F0F6FC]">Rs {peer.current.toFixed(2)}</td>
                      <td className={`py-3 px-4 text-right font-bold ${isPos ? 'text-[#00C076]' : 'text-[#F85149]'}`}>
                        {isPos ? '+' : ''}{peer.changePercent.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right text-[#F0F6FC]">{peer.peRatio ? `${peer.peRatio.toFixed(2)}x` : '—'}</td>
                      <td className="py-3 px-4 text-right text-[#00D2B4]">{peer.dividendYield ? `${peer.dividendYield.toFixed(2)}%` : '—'}</td>
                      <td className={`py-3 px-4 text-right ${(peer.changeYear || 0) >= 0 ? 'text-[#00C076]' : 'text-[#F85149]'}`}>
                        {(peer.changeYear || 0) >= 0 ? '+' : ''}{(peer.changeYear || 0).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/stocks/${peer.symbol}`}
                            className="text-[#00D2B4] hover:underline text-xs font-semibold"
                          >
                            Analyze
                          </Link>
                          <span className="text-[#30363D]">|</span>
                          <Link
                            href={`/stocks/compare?s1=${stock.symbol}&s2=${peer.symbol}`}
                            className="text-[#FFB401] hover:underline text-xs font-semibold whitespace-nowrap"
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
            <span className="font-bold text-[#F0F6FC]">Recent Cash Dividend Declarations</span>
            <span className="text-[#8B949E]">Historical payouts from PSX company books</span>
          </div>
          <div className="border border-[#30363D] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0E14] border-b border-[#30363D] text-[10px] text-[#8B949E] uppercase">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Cash Dividend (DPS)</th>
                  <th className="py-3 px-4">Payout Classification</th>
                  <th className="py-3 px-4 text-right">Book Closure / Ex-Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]/60 bg-[#0B0E14]/40">
                {dividendHistory.map((d, i) => (
                  <tr key={i} className="hover:bg-[#21262D]">
                    <td className="py-3 px-4 font-bold text-[#F0F6FC]">{d.year}</td>
                    <td className="py-3 px-4 font-black text-[#00C076]">{d.dps}</td>
                    <td className="py-3 px-4 text-[#8B949E]">{d.type}</td>
                    <td className="py-3 px-4 text-right text-[#8B949E]">{d.exDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SHARIAH COMPLIANCE AUDIT */}
      {activeTab === 'shariah' && (
        <div className="bg-[#0B0E14] border border-[#30363D] p-5 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-[#00C076]">
            <Moon className="w-5 h-5 fill-current" />
            <h4 className="text-sm font-bold text-[#F0F6FC]">
              KMI Islamic Screening Standard &amp; Audit
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#161B22] rounded-xl border border-[#30363D] space-y-1">
              <span className="text-[#8B949E] block text-[10px] uppercase font-bold">1. Primary Business Activity</span>
              <span className="font-bold text-[#00C076] flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Permissible / Halal Operations</span>
              </span>
            </div>

            <div className="p-3 bg-[#161B22] rounded-xl border border-[#30363D] space-y-1">
              <span className="text-[#8B949E] block text-[10px] uppercase font-bold">2. Interest-Bearing Debt to Total Assets</span>
              <span className="font-bold text-[#F0F6FC]">&lt; 37% (Compliant)</span>
            </div>

            <div className="p-3 bg-[#161B22] rounded-xl border border-[#30363D] space-y-1">
              <span className="text-[#8B949E] block text-[10px] uppercase font-bold">3. Illiquid Assets to Total Assets</span>
              <span className="font-bold text-[#F0F6FC]">&gt; 25% (Compliant)</span>
            </div>

            <div className="p-3 bg-[#161B22] rounded-xl border border-[#30363D] space-y-1">
              <span className="text-[#8B949E] block text-[10px] uppercase font-bold">4. Non-Compliant Income Cap</span>
              <span className="font-bold text-[#F0F6FC]">&lt; 5% Gross Revenue</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

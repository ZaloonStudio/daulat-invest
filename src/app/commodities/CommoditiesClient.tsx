'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Coins,
  ArrowLeft,
  Calculator,
  Clock,
  Droplet,
} from 'lucide-react';

interface CommodityItem {
  name: string;
  unit: string;
  pricePkr: number;
  change: number;
  changePct: number;
  category: 'Gold' | 'Silver' | 'Energy';
}

const COMMODITIES_DATA: CommodityItem[] = [
  { name: 'Gold 24K (Pure)', unit: 'Per Tola (11.66g)', pricePkr: 278500, change: 1200, changePct: 0.43, category: 'Gold' },
  { name: 'Gold 24K (Pure)', unit: 'Per 10 Grams', pricePkr: 238770, change: 1030, changePct: 0.43, category: 'Gold' },
  { name: 'Gold 22K (Jewellery)', unit: 'Per Tola (11.66g)', pricePkr: 255290, change: 1100, changePct: 0.43, category: 'Gold' },
  { name: 'Gold 22K (Jewellery)', unit: 'Per 10 Grams', pricePkr: 218870, change: 940, changePct: 0.43, category: 'Gold' },
  { name: 'Silver 24K', unit: 'Per Tola', pricePkr: 3350, change: 30, changePct: 0.90, category: 'Silver' },
  { name: 'Silver 24K', unit: 'Per 10 Grams', pricePkr: 2872, change: 25, changePct: 0.88, category: 'Silver' },
  { name: 'Brent Crude Oil', unit: 'Per Barrel (USD 74.20)', pricePkr: 20616, change: -180, changePct: -0.86, category: 'Energy' },
  { name: 'WTI Crude Oil', unit: 'Per Barrel (USD 70.80)', pricePkr: 19671, change: -150, changePct: -0.76, category: 'Energy' },
  { name: 'Natural Gas', unit: 'MMBtu (USD 2.85)', pricePkr: 792, change: 14, changePct: 1.80, category: 'Energy' },
];

export default function CommoditiesClient() {
  const [activeTab, setActiveTab] = useState<'All' | 'Gold' | 'Silver' | 'Energy'>('All');
  const [tolaInput, setTolaInput] = useState<number>(1);
  const [selectedPurity, setSelectedPurity] = useState<'24K' | '22K'>('24K');

  const filtered = COMMODITIES_DATA.filter(
    (c) => activeTab === 'All' || c.category === activeTab
  );

  const ratePerTola = selectedPurity === '24K' ? 278500 : 255290;
  const convertedTotal = tolaInput * ratePerTola;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#A4AEC1] hover:text-[#EFF3FA] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#28354A] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B69249] uppercase tracking-wider mb-2">
            <Coins className="w-4 h-4" />
            <span>Pakistan Sarafa &amp; Bullion Rates</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#EFF3FA] tracking-tight">
            Gold &amp; commodities
          </h1>
          <p className="text-sm text-[#A4AEC1] mt-1.5 max-w-2xl">
            Live 24K and 22K gold prices per tola, 10 grams, silver rates, and global energy commodities in Pakistani Rupees (PKR).
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#A4AEC1]">
          <Clock className="w-3.5 h-3.5 text-[#7F8DA4]" />
          <span>All Pakistan Sarafa Association: Updated Today</span>
        </div>
      </div>

      {/* Gold Price Converter Card */}
      <div className="bg-[#111A2B] border border-[#28354A] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-sm font-semibold text-[#B69249]">
          <Calculator className="w-4 h-4" />
          <span>Quick Gold Value Calculator (PKR)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-4">
            <label className="text-[11px] font-semibold text-[#A4AEC1] uppercase block mb-1">
              Quantity (Tola)
            </label>
            <input
              type="number"
              step="0.25"
              min="0.1"
              value={tolaInput}
              onChange={(e) => setTolaInput(Math.max(0.01, Number(e.target.value)))}
              className="w-full bg-[#0B1120] border border-[#28354A] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#EFF3FA] focus:outline-none focus:border-[#B69249]"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-[11px] font-semibold text-[#A4AEC1] uppercase block mb-1">
              Purity
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedPurity('24K')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedPurity === '24K'
                    ? 'bg-[#B69249] text-black border-[#B69249] font-semibold'
                    : 'bg-[#0B1120] text-[#A4AEC1] border-[#28354A]'
                }`}
              >
                24K (Pure Gold)
              </button>
              <button
                onClick={() => setSelectedPurity('22K')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedPurity === '22K'
                    ? 'bg-[#B69249] text-black border-[#B69249] font-semibold'
                    : 'bg-[#0B1120] text-[#A4AEC1] border-[#28354A]'
                }`}
              >
                22K (Jewellery)
              </button>
            </div>
          </div>

          <div className="sm:col-span-4 bg-[#0B1120] border border-[#B69249]/30 p-4 rounded-xl text-right">
            <span className="text-[10px] font-semibold text-[#A4AEC1] uppercase tracking-wider block">
              Estimated Total Value
            </span>
            <div className="text-2xl font-semibold text-[#B69249] mt-0.5">
              Rs {Math.round(convertedTotal).toLocaleString()}
            </div>
            <span className="text-[10px] text-[#A4AEC1]">
              @ Rs {ratePerTola.toLocaleString()} / Tola
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2">
        {(['All', 'Gold', 'Silver', 'Energy'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === cat
                ? 'bg-[#B69249] text-black shadow-md font-semibold'
                : 'bg-[#111A2B] text-[#A4AEC1] hover:text-[#EFF3FA] border border-[#28354A]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Commodities Table */}
      <div className="bg-[#111A2B] border border-[#28354A] rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B1120] border-b border-[#28354A] text-[10px] text-[#A4AEC1] uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6">Commodity</th>
              <th className="py-4 px-6">Measuring Unit</th>
              <th className="py-4 px-6 text-right">Price in PKR</th>
              <th className="py-4 px-6 text-right">Day Change (PKR)</th>
              <th className="py-4 px-6 text-right">Day %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#28354A]/60 bg-[#111A2B]">
            {filtered.map((item, idx) => {
              const isPos = item.change >= 0;
              return (
                <tr key={idx} className="hover:bg-[#1C2940]/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-sm text-[#EFF3FA] flex items-center space-x-2">
                    {item.category === 'Gold' && <Coins className="w-4 h-4 text-[#B69249]" />}
                    {item.category === 'Silver' && <Coins className="w-4 h-4 text-[#E2E8F0]" />}
                    {item.category === 'Energy' && <Droplet className="w-4 h-4 text-[#9BBCE3]" />}
                    <span>{item.name}</span>
                  </td>
                  <td className="py-4 px-6 text-[#A4AEC1]">{item.unit}</td>
                  <td className="py-4 px-6 text-right font-semibold text-sm text-[#EFF3FA]">
                    Rs {item.pricePkr.toLocaleString()}
                  </td>
                  <td
                    className={`py-4 px-6 text-right font-semibold ${
                      isPos ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
                    }`}
                  >
                    {isPos ? '+' : ''}Rs {Math.abs(item.change).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-semibold text-xs ${
                        isPos ? 'bg-[#6DDBA5]/15 text-[#6DDBA5]' : 'bg-[#F28B82]/15 text-[#F28B82]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {item.changePct.toFixed(2)}%
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

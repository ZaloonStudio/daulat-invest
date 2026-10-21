'use client';

import React from 'react';
import Link from 'next/link';
import {
  Coins,
  DollarSign,
  Fuel,
  ArrowRight,
  Flame,
} from 'lucide-react';

export default function HomeCommoditiesWidget() {
  const commodities = [
    {
      id: 'gold-tola',
      name: 'Gold 24K (Per Tola)',
      urduName: 'سونا فی تولہ',
      rate: 'Rs 427,900',
      change: '+1,200',
      changePercent: 0.28,
      source: 'Karachi Sarafa Assoc.',
      icon: Coins,
      color: 'text-[#FFB401]',
      bg: 'bg-[#FFB401]/10 border-[#FFB401]/25',
    },
    {
      id: 'gold-10g',
      name: 'Gold 24K (10 Grams)',
      urduName: 'سونا 10 گرام',
      rate: 'Rs 366,854',
      change: '+1,028',
      changePercent: 0.28,
      source: 'Sarafa Benchmark',
      icon: Coins,
      color: 'text-[#FFD33D]',
      bg: 'bg-[#FFD33D]/10 border-[#FFD33D]/25',
    },
    {
      id: 'silver-tola',
      name: 'Silver 24K (Per Tola)',
      urduName: 'چاندی فی تولہ',
      rate: 'Rs 5,780',
      change: '+20',
      changePercent: 0.35,
      source: 'Jewellers Market',
      icon: Coins,
      color: 'text-[#7EE787]',
      bg: 'bg-[#7EE787]/10 border-[#7EE787]/25',
    },
    {
      id: 'usd-interbank',
      name: 'US Dollar (USD/PKR)',
      urduName: 'امریکی ڈالر',
      rate: 'Rs 277.50',
      change: '+0.15',
      changePercent: 0.05,
      source: 'SBP Interbank Rate',
      icon: DollarSign,
      color: 'text-[#58A6FF]',
      bg: 'bg-[#58A6FF]/10 border-[#58A6FF]/25',
    },
    {
      id: 'petrol',
      name: 'Petrol (Super)',
      urduName: 'پٹرول سپریم',
      rate: 'Rs 386.30',
      change: '0.00',
      changePercent: 0.0,
      source: 'OGRA Official Pakistan',
      icon: Fuel,
      color: 'text-[#F85149]',
      bg: 'bg-[#F85149]/10 border-[#F85149]/25',
    },
    {
      id: 'brent-oil',
      name: 'Crude Oil (Brent)',
      urduName: 'خام تیل برینٹ',
      rate: '$109.80',
      change: '+3.88',
      changePercent: 3.66,
      source: 'ICE International Spot',
      icon: Flame,
      color: 'text-[#FFA657]',
      bg: 'bg-[#FFA657]/10 border-[#FFA657]/25',
    },
  ];

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 shadow-xl space-y-4">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFB401] to-[#D99B00] flex items-center justify-center text-black font-extrabold shadow-sm">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-extrabold text-[#F0F6FC] tracking-tight">
                Gold, Forex &amp; Commodities in Pakistan
              </h3>
              <span className="text-[10px] bg-[#FFB401]/20 text-[#FFB401] px-2 py-0.5 rounded-full font-bold">
                Sarafa &amp; SBP Rates
              </span>
            </div>
            <p className="text-[11px] text-[#8B949E] mt-0.5">
              Live Karachi Sarafa market bullion rates, interbank currency, and fuel prices
            </p>
          </div>
        </div>

        <Link
          href="/commodities"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#FFB401] hover:text-[#FFB401]/80 transition-colors w-fit"
        >
          <span>Gold Calculator &amp; All Rates</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Commodity Cards (Same as Daulat App) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {commodities.map((item) => {
          const Icon = item.icon;
          const isPos = item.changePercent >= 0;
          return (
            <Link
              key={item.id}
              href="/commodities"
              className="bg-[#0B0E14] border border-[#30363D] hover:border-[#484F58] p-3 rounded-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border ${item.bg}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <span className="text-[10px] text-[#6E7681] font-arabic" dir="rtl">
                    {item.urduName}
                  </span>
                </div>

                <div className="font-bold text-xs text-[#F0F6FC] group-hover:text-[#FFB401] transition-colors line-clamp-1">
                  {item.name}
                </div>
                <div className="text-[10px] text-[#8B949E] truncate">{item.source}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#30363D]/60 flex items-baseline justify-between">
                <span className="text-xs sm:text-sm font-extrabold font-mono text-[#F0F6FC]">
                  {item.rate}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold flex items-center ${
                    isPos ? 'text-[#00C076]' : 'text-[#F85149]'
                  }`}
                >
                  {isPos ? '+' : ''}
                  {item.changePercent.toFixed(2)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

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
      color: 'text-[#D5F478]',
      bg: 'bg-[#D5F478]/10 border-[#D5F478]/25',
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
      color: 'text-[#D5F478]',
      bg: 'bg-[#D5F478]/10 border-[#D5F478]/25',
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
      color: 'text-[#6DDBA5]',
      bg: 'bg-[#6DDBA5]/10 border-[#6DDBA5]/25',
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
      color: 'text-[#9BBCE3]',
      bg: 'bg-[#9BBCE3]/10 border-[#9BBCE3]/25',
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
      color: 'text-[#F28B82]',
      bg: 'bg-[#F28B82]/10 border-[#F28B82]/25',
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
      color: 'text-[#D9B68B]',
      bg: 'bg-[#D9B68B]/10 border-[#D9B68B]/25',
    },
  ];

  return (
    <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-5 shadow-xl space-y-4">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A3C31] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D5F478] to-[#BDD766] flex items-center justify-center text-black font-semibold shadow-sm">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-semibold text-[#F1F5EE] tracking-tight">
                Gold, Forex &amp; Commodities in Pakistan
              </h3>
              <span className="text-[10px] bg-[#D5F478]/20 text-[#D5F478] px-2 py-0.5 rounded-full font-semibold">
                Sarafa &amp; SBP Rates
              </span>
            </div>
            <p className="text-[11px] text-[#A4B3A7] mt-0.5">
              Live Karachi Sarafa market bullion rates, interbank currency, and fuel prices
            </p>
          </div>
        </div>

        <Link
          href="/commodities"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#D5F478] hover:text-[#D5F478]/80 transition-colors w-fit"
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
              className="bg-[#0C1411] border border-[#2A3C31] hover:border-[#496052] p-3 rounded-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border ${item.bg}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <span className="text-[10px] text-[#84988B] font-arabic" dir="rtl">
                    {item.urduName}
                  </span>
                </div>

                <div className="font-semibold text-xs text-[#F1F5EE] group-hover:text-[#D5F478] transition-colors line-clamp-1">
                  {item.name}
                </div>
                <div className="text-[10px] text-[#A4B3A7] truncate">{item.source}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#2A3C31]/60 flex items-baseline justify-between">
                <span className="text-xs sm:text-sm font-semibold font-mono text-[#F1F5EE]">
                  {item.rate}
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold flex items-center ${
                    isPos ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
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

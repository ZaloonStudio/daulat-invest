'use client';

import React from 'react';
import Link from 'next/link';
import {
  GitCompare,
  Coins,
  DollarSign,
  Gauge,
  Calculator,
  TrendingUp,
  Moon,
  FileText,
  Filter,
  PieChart,
} from 'lucide-react';

interface QuickLinkItem {
  label: string;
  href: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

const QUICK_LINKS: QuickLinkItem[] = [
  {
    label: 'Compare',
    href: '/stocks/compare',
    icon: GitCompare,
    iconColor: 'text-[#00D2B4]',
    bgColor: 'bg-[#00D2B4]/10 group-hover:bg-[#00D2B4]/20 border-[#00D2B4]/20 group-hover:border-[#00D2B4]',
  },
  {
    label: 'Screener',
    href: '/stocks/screener',
    icon: Filter,
    iconColor: 'text-[#388BFD]',
    bgColor: 'bg-[#388BFD]/10 group-hover:bg-[#388BFD]/20 border-[#388BFD]/20 group-hover:border-[#388BFD]',
  },
  {
    label: 'Mutual Funds',
    href: '/mutual-funds',
    icon: PieChart,
    iconColor: 'text-[#A371F7]',
    bgColor: 'bg-[#A371F7]/10 group-hover:bg-[#A371F7]/20 border-[#A371F7]/20 group-hover:border-[#A371F7]',
  },
  {
    label: 'Gold',
    href: '/commodities',
    icon: Coins,
    iconColor: 'text-[#FFB401]',
    bgColor: 'bg-[#FFB401]/10 group-hover:bg-[#FFB401]/20 border-[#FFB401]/20 group-hover:border-[#FFB401]',
  },
  {
    label: 'Dollar',
    href: '/forex',
    icon: DollarSign,
    iconColor: 'text-[#58A6FF]',
    bgColor: 'bg-[#58A6FF]/10 group-hover:bg-[#58A6FF]/20 border-[#58A6FF]/20 group-hover:border-[#58A6FF]',
  },
  {
    label: 'Fear & Greed',
    href: '/fear-greed',
    icon: Gauge,
    iconColor: 'text-[#7EE787]',
    bgColor: 'bg-[#7EE787]/10 group-hover:bg-[#7EE787]/20 border-[#7EE787]/20 group-hover:border-[#7EE787]',
  },
  {
    label: 'Shariah',
    href: '/shariah',
    icon: Moon,
    iconColor: 'text-[#00C076]',
    bgColor: 'bg-[#00C076]/10 group-hover:bg-[#00C076]/20 border-[#00C076]/20 group-hover:border-[#00C076]',
  },
  {
    label: 'Dividends',
    href: '/dividend-calculator',
    icon: Calculator,
    iconColor: 'text-[#FFA657]',
    bgColor: 'bg-[#FFA657]/10 group-hover:bg-[#FFA657]/20 border-[#FFA657]/20 group-hover:border-[#FFA657]',
  },
  {
    label: 'SIP Calc',
    href: '/sip-calculator',
    icon: TrendingUp,
    iconColor: 'text-[#00D2B4]',
    bgColor: 'bg-[#00D2B4]/10 group-hover:bg-[#00D2B4]/20 border-[#00D2B4]/20 group-hover:border-[#00D2B4]',
  },
  {
    label: 'Filings',
    href: '/announcements',
    icon: FileText,
    iconColor: 'text-[#BC8CFF]',
    bgColor: 'bg-[#BC8CFF]/10 group-hover:bg-[#BC8CFF]/20 border-[#BC8CFF]/20 group-hover:border-[#BC8CFF]',
  },
];

export default function QuickLinksBar() {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-extrabold text-[#F0F6FC] tracking-tight uppercase">
          Quick links
        </h2>
        <span className="text-[11px] text-[#6E7681]">
          Tap to open investor tools
        </span>
      </div>

      {/* App-like clean circular/rounded icon row */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-2">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-[#161B22]/70 transition-all text-center active:scale-95"
            >
              {/* Sleek App Icon Tile */}
              <div
                className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center border transition-all duration-200 shadow-sm group-hover:scale-105 group-hover:shadow-md ${item.bgColor}`}
              >
                <Icon className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${item.iconColor}`} />
              </div>

              {/* Single clean label */}
              <span className="text-[11px] font-bold text-[#8B949E] group-hover:text-[#F0F6FC] transition-colors mt-2 leading-none truncate max-w-[85px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

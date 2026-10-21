'use client';
import Link from 'next/link';
import { GitCompare, Coins, DollarSign, Gauge, Calculator, TrendingUp, Moon, FileText, Filter, PieChart, ArrowUpRight } from 'lucide-react';
const tools = [
  {label: 'Stock comparison', href: '/stocks/compare', icon: GitCompare},
  {label: 'Stock screener', href: '/stocks/screener', icon: Filter},
  {label: 'Mutual funds', href: '/mutual-funds', icon: PieChart},
  {label: 'Gold & commodities', href: '/commodities', icon: Coins},
  {label: 'Currency rates', href: '/forex', icon: DollarSign},
  {label: 'Fear & greed', href: '/fear-greed', icon: Gauge},
  {label: 'Shariah investing', href: '/shariah', icon: Moon},
  {label: 'Dividend calculator', href: '/dividend-calculator', icon: Calculator},
  {label: 'SIP calculator', href: '/sip-calculator', icon: TrendingUp},
  {label: 'Company filings', href: '/announcements', icon: FileText},
];
export default function QuickLinksBar() {
 return <section aria-labelledby="research-tools-heading" className="research-tools">
   <div className="flex flex-wrap gap-2 items-center justify-between mb-4"><h2 id="research-tools-heading" className="text-base font-semibold tracking-tight">Your research toolkit</h2><span className="text-xs text-[#84988B]">A little clarity. A better decision.</span></div>
   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-[#2A3C31] border border-[#2A3C31] rounded-xl overflow-hidden">
     {tools.map(tool => <Link key={tool.href} href={tool.href} className="research-tool group"><tool.icon className="w-4 h-4 shrink-0 text-[#A4B3A7] group-hover:text-[#D5F478]"/><span>{tool.label}</span><ArrowUpRight className="w-3 h-3 ml-auto text-[#84988B] group-hover:text-[#D5F478]"/></Link>)}
   </div>
 </section>;
}

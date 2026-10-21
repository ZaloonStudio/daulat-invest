'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Brand from './Brand';
import DisclosuresModal from './DisclosuresModal';

export default function Footer() {
  const [isDisclosuresOpen, setIsDisclosuresOpen] = useState(false);

  return (
    <>
      <footer className="site-footer border-t border-[#28354A] mt-16 text-[#A4AEC1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 py-9">
            <div className="space-y-3">
              <Brand />
              <p className="text-xs leading-relaxed">A clearer view of Pakistan’s markets.</p>
            </div>
            <nav aria-label="Footer navigation" className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-7 gap-y-4 text-xs">
              <Link href="/stocks" className="footer-link">Stocks</Link>
              <Link href="/stocks/screener" className="footer-link">Screener</Link>
              <Link href="/mutual-funds" className="footer-link">Mutual funds</Link>
              <a href="https://play.google.com/store/apps/details?id=pk.psxtracker.app" target="_blank" rel="noopener noreferrer" className="footer-link inline-flex items-center gap-1.5">Get the app <ArrowUpRight className="w-3.5 h-3.5" /></a>
            </nav>
          </div>
          <div className="border-t border-[#28354A]/60 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[11px] leading-relaxed max-w-2xl text-[#7F8DA4]">Market data is for information only. Investing involves risk, including loss of capital.</p>
            <button onClick={() => setIsDisclosuresOpen(true)} className="footer-link text-[11px] inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto">Risk disclosure <ArrowUpRight className="w-3 h-3" /></button>
          </div>
          <div className="pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] text-[#7F8DA4]">
            <span>&copy; {new Date().getFullYear()} Daulat Invest. All rights reserved.</span>
            <span>Market data sourced from PSX DPS</span>
          </div>
        </div>
      </footer>
      <DisclosuresModal isOpen={isDisclosuresOpen} onClose={() => setIsDisclosuresOpen(false)} />
    </>
  );
}

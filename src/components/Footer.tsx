import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0B0E14] border-t border-[#30363D] py-12 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-[#8B949E]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Column */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFB401] to-[#D99B00] flex items-center justify-center font-black text-black text-base">
              D
            </div>
            <span className="text-lg font-bold text-[#F0F6FC]">
              Daulat<span className="text-[#FFB401] font-light">Invest</span>
            </span>
          </div>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            Pakistan Stock Exchange (PSX) live market intelligence, smart portfolio tracking,
            and institutional financial data analytics.
          </p>
          <div className="text-[11px] text-[#6E7681]">
            Website: <span className="text-[#FFB401]">daulatinvest.com</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[#F0F6FC] font-bold uppercase text-[11px] tracking-wider mb-3">
            Markets &amp; Stocks
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-[#FFB401] transition-colors">
                KSE 100 Live Index
              </Link>
            </li>
            <li>
              <Link href="/stocks" className="hover:text-[#FFB401] transition-colors">
                All 500+ PSX Stocks
              </Link>
            </li>
            <li>
              <Link href="/stocks/OGDC" className="hover:text-[#FFB401] transition-colors">
                OGDC Share Price
              </Link>
            </li>
            <li>
              <Link href="/stocks/MEBL" className="hover:text-[#FFB401] transition-colors">
                Meezan Bank (MEBL)
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform Tools */}
        <div>
          <h4 className="text-[#F0F6FC] font-bold uppercase text-[11px] tracking-wider mb-3">
            Investor Tools
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/portfolio" className="hover:text-[#FFB401] transition-colors">
                Web Portfolio Tracker
              </Link>
            </li>
            <li>
              <a
                href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FFB401] transition-colors flex items-center space-x-1"
              >
                <span>Daulat Android App</span>
                <span className="text-[9px] bg-[#FFB401]/20 text-[#FFB401] px-1 rounded">FREE</span>
              </a>
            </li>
            <li>
              <span className="text-[#6E7681]">Dividend Yield Screener</span>
            </li>
            <li>
              <span className="text-[#6E7681]">Corporate Disclosures</span>
            </li>
          </ul>
        </div>

        {/* Compliance / Disclaimer */}
        <div>
          <h4 className="text-[#F0F6FC] font-bold uppercase text-[11px] tracking-wider mb-3">
            Disclaimer
          </h4>
          <p className="text-[11px] text-[#6E7681] leading-relaxed">
            Market data feeds provided for informational purposes only. PSX trading carries market
            risks. Past performance does not guarantee future financial returns.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#30363D]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          &copy; {new Date().getFullYear()} Daulat Invest. All rights reserved. Made for Pakistani
          investors.
        </div>
        <div className="flex items-center space-x-6 text-[11px]">
          <span className="text-[#6E7681]">Data sourced from PSX DPS</span>
          <span className="text-[#00C076] font-semibold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C076]" />
            <span>Systems Operational</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Smartphone, Calculator, TrendingUp, ExternalLink } from 'lucide-react';
import DividendCalculatorModal from './DividendCalculatorModal';
import SipCalculatorModal from './SipCalculatorModal';
import DisclosuresModal from './DisclosuresModal';

export default function Footer() {
  const [isDividendOpen, setIsDividendOpen] = useState(false);
  const [isSipOpen, setIsSipOpen] = useState(false);
  const [isDisclosuresOpen, setIsDisclosuresOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#0B0E14] border-t border-[#30363D] py-12 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-[#8B949E]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFB401] to-[#D99B00] flex items-center justify-center font-black text-black text-base shadow-sm">
                D
              </div>
              <span className="text-lg font-bold text-[#F0F6FC]">
                Daulat<span className="text-[#FFB401] font-light">Invest</span>
              </span>
            </div>
            <p className="text-xs text-[#8B949E] leading-relaxed">
              Pakistan Stock Exchange (PSX) live market intelligence, real-time KSE-100 analytics,
              dividend screeners, and investor community hub.
            </p>
            <div className="text-[11px] text-[#6E7681]">
              Domain: <span className="text-[#FFB401] font-semibold">daulatinvest.com</span>
            </div>
          </div>

          {/* Markets & Screener */}
          <div>
            <h4 className="text-[#F0F6FC] font-bold uppercase text-[11px] tracking-wider mb-3">
              Markets &amp; Screening
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#FFB401] transition-colors">
                  KSE 100 Live Overview
                </Link>
              </li>
              <li>
                <Link href="/stocks/screener" className="hover:text-[#00D2B4] transition-colors flex items-center space-x-1">
                  <span>PSX Stock Screener</span>
                  <span className="text-[9px] bg-[#00D2B4]/15 text-[#00D2B4] px-1 rounded font-bold">HOT</span>
                </Link>
              </li>
              <li>
                <Link href="/mutual-funds" className="hover:text-[#00C076] transition-colors flex items-center space-x-1">
                  <span>Pakistan Mutual Funds</span>
                  <span className="text-[9px] bg-[#00C076]/15 text-[#00C076] px-1 rounded font-bold">NEW</span>
                </Link>
              </li>
              <li>
                <Link href="/stocks" className="hover:text-[#FFB401] transition-colors">
                  All PSX Stocks Directory
                </Link>
              </li>
              <li>
                <Link href="/stocks/compare" className="hover:text-[#00D2B4] transition-colors flex items-center space-x-1">
                  <span>Stock Compare Matrix</span>
                  <span className="text-[9px] bg-[#00D2B4]/15 text-[#00D2B4] px-1 rounded font-bold">NEW</span>
                </Link>
              </li>
              <li>
                <Link href="/shariah" className="hover:text-[#00C076] transition-colors">
                  KMI Shariah Screener
                </Link>
              </li>
              <li>
                <Link href="/commodities" className="hover:text-[#FFB401] transition-colors">
                  Gold &amp; Commodities (PKR)
                </Link>
              </li>
              <li>
                <Link href="/forex" className="hover:text-[#58A6FF] transition-colors">
                  Interbank &amp; Open Forex
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#FFB401] transition-colors">
                  Market &amp; Business News
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Tools */}
          <div>
            <h4 className="text-[#F0F6FC] font-bold uppercase text-[11px] tracking-wider mb-3">
              Investor Tools &amp; Calculators
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/fear-greed" className="hover:text-[#7EE787] transition-colors flex items-center space-x-1">
                  <span>PSX Fear &amp; Greed Index</span>
                  <span className="text-[9px] bg-[#7EE787]/15 text-[#7EE787] px-1 rounded font-bold">LIVE</span>
                </Link>
              </li>
              <li>
                <Link href="/dividend-calculator" className="hover:text-[#FFB401] transition-colors flex items-center space-x-1.5 text-[#8B949E]">
                  <Calculator className="w-3.5 h-3.5 text-[#FFB401]" />
                  <span>Dividend Yield Screener</span>
                </Link>
              </li>
              <li>
                <Link href="/sip-calculator" className="hover:text-[#00D2B4] transition-colors flex items-center space-x-1.5 text-[#8B949E]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#00D2B4]" />
                  <span>SIP Wealth Compounding</span>
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-[#A371F7] transition-colors">
                  Company Filings &amp; Disclosures
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-[#FFB401] transition-colors">
                  My Stock Watchlist
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[#FFB401] transition-colors">
                  Web Portfolio Tracker
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-[#A371F7] transition-colors">
                  PSX Investor Community
                </Link>
              </li>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#388BFD] transition-colors flex items-center space-x-1"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#388BFD]" />
                  <span>Daulat Android App</span>
                  <span className="text-[9px] bg-[#388BFD]/20 text-[#388BFD] px-1 rounded font-bold">
                    FREE
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance / Disclaimer */}
          <div>
            <h4 className="text-[#F0F6FC] font-bold uppercase text-[11px] tracking-wider mb-3">
              Market Compliance &amp; Disclaimers
            </h4>
            <p className="text-[11px] text-[#6E7681] leading-relaxed mb-3">
              Stock market data feeds are sourced from Pakistan Stock Exchange DPS and published for informational purposes only. Trading in equities involves capital risks.
            </p>
            <button
              onClick={() => setIsDisclosuresOpen(true)}
              className="text-[11px] text-[#FFB401] hover:underline flex items-center space-x-1"
            >
              <span>Read Full Risk Disclaimer</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#30363D]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} Daulat Invest. All rights reserved. Crafted for Pakistani investors.
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <span className="text-[#6E7681]">Data sourced from PSX DPS</span>
            <span className="text-[#00C076] font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C076]" />
              <span>All Systems Operational</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Global Footer Modals */}
      <DividendCalculatorModal
        isOpen={isDividendOpen}
        onClose={() => setIsDividendOpen(false)}
      />
      <SipCalculatorModal
        isOpen={isSipOpen}
        onClose={() => setIsSipOpen(false)}
      />
      <DisclosuresModal
        isOpen={isDisclosuresOpen}
        onClose={() => setIsDisclosuresOpen(false)}
      />
    </>
  );
}

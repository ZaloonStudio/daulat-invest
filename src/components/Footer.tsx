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
      <footer className="bg-[#0C1411] border-t border-[#2A3C31] py-12 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-[#A4B3A7]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-3 text-[#F1F5EE]" aria-label="Daulat Invest home">
              <span className="brand-mark" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 19V5h5a7 7 0 1 1 0 14H5Z" stroke="currentColor" strokeWidth="2.5"/><path d="m8 14 4-4 3 3 5-6" stroke="currentColor" strokeWidth="2"/></svg></span>
              <span className="text-xl font-semibold tracking-tight">daulat<span className="text-[#A4B3A7] font-normal"> invest</span></span>
            </Link>
            <p className="text-xs text-[#A4B3A7] leading-relaxed">
              Pakistan Stock Exchange (PSX) live market intelligence, real-time KSE-100 analytics,
              dividend screeners, and investor community hub.
            </p>
            <div className="text-[11px] text-[#84988B]">
              Domain: <span className="text-[#D5F478] font-semibold">daulatinvest.com</span>
            </div>
          </div>

          {/* Markets & Screener */}
          <div>
            <h4 className="text-[#F1F5EE] font-semibold uppercase text-[11px] tracking-wider mb-3">
              Markets &amp; Screening
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#D5F478] transition-colors">
                  KSE 100 Live Overview
                </Link>
              </li>
              <li>
                <Link href="/stocks/screener" className="hover:text-[#B9E76A] transition-colors flex items-center space-x-1">
                  <span>PSX Stock Screener</span>
                </Link>
              </li>
              <li>
                <Link href="/mutual-funds" className="hover:text-[#6DDBA5] transition-colors flex items-center space-x-1">
                  <span>Pakistan Mutual Funds</span>
                </Link>
              </li>
              <li>
                <Link href="/stocks" className="hover:text-[#D5F478] transition-colors">
                  All PSX Stocks Directory
                </Link>
              </li>
              <li>
                <Link href="/stocks/compare" className="hover:text-[#B9E76A] transition-colors flex items-center space-x-1">
                  <span>Stock Compare Matrix</span>
                </Link>
              </li>
              <li>
                <Link href="/shariah" className="hover:text-[#6DDBA5] transition-colors">
                  KMI Shariah Screener
                </Link>
              </li>
              <li>
                <Link href="/commodities" className="hover:text-[#D5F478] transition-colors">
                  Gold &amp; Commodities (PKR)
                </Link>
              </li>
              <li>
                <Link href="/forex" className="hover:text-[#9BBCE3] transition-colors">
                  Interbank &amp; Open Forex
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#D5F478] transition-colors">
                  Market &amp; Business News
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Tools */}
          <div>
            <h4 className="text-[#F1F5EE] font-semibold uppercase text-[11px] tracking-wider mb-3">
              Investor Tools &amp; Calculators
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/fear-greed" className="hover:text-[#6DDBA5] transition-colors flex items-center space-x-1">
                  <span>PSX Fear &amp; Greed Index</span>
                  <span className="text-[9px] bg-[#6DDBA5]/15 text-[#6DDBA5] px-1 rounded font-semibold">LIVE</span>
                </Link>
              </li>
              <li>
                <Link href="/dividend-calculator" className="hover:text-[#D5F478] transition-colors flex items-center space-x-1.5 text-[#A4B3A7]">
                  <Calculator className="w-3.5 h-3.5 text-[#D5F478]" />
                  <span>Dividend Yield Screener</span>
                </Link>
              </li>
              <li>
                <Link href="/sip-calculator" className="hover:text-[#B9E76A] transition-colors flex items-center space-x-1.5 text-[#A4B3A7]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#B9E76A]" />
                  <span>SIP Wealth Compounding</span>
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-[#B9ADDA] transition-colors">
                  Company Filings &amp; Disclosures
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-[#D5F478] transition-colors">
                  My Stock Watchlist
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[#D5F478] transition-colors">
                  Web Portfolio Tracker
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-[#B9ADDA] transition-colors">
                  PSX Investor Community
                </Link>
              </li>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#9BBCE3] transition-colors flex items-center space-x-1"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#9BBCE3]" />
                  <span>Daulat Android App</span>
                  <span className="text-[9px] bg-[#9BBCE3]/20 text-[#9BBCE3] px-1 rounded font-semibold">
                    FREE
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance / Disclaimer */}
          <div>
            <h4 className="text-[#F1F5EE] font-semibold uppercase text-[11px] tracking-wider mb-3">
              Market Compliance &amp; Disclaimers
            </h4>
            <p className="text-[11px] text-[#84988B] leading-relaxed mb-3">
              Stock market data feeds are sourced from Pakistan Stock Exchange DPS and published for informational purposes only. Trading in equities involves capital risks.
            </p>
            <button
              onClick={() => setIsDisclosuresOpen(true)}
              className="text-[11px] text-[#D5F478] hover:underline flex items-center space-x-1"
            >
              <span>Read Full Risk Disclaimer</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#2A3C31]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} Daulat Invest. All rights reserved. Crafted for Pakistani investors.
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <span className="text-[#84988B]">Data sourced from PSX DPS</span>
            <span className="text-[#6DDBA5] font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6DDBA5]" />
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

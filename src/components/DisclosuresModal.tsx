'use client';

import React, { useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DisclosuresModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DisclosuresModal({ isOpen, onClose }: DisclosuresModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-[#0e1424] border border-[#28354A] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#28354A] bg-[#111A2B]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#B69249]/20 text-[#B69249] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#EFF3FA]">
                Corporate Disclosures &amp; Risk Notice
              </h3>
              <p className="text-xs text-[#A4AEC1]">
                Pakistan Stock Exchange (PSX) &amp; SECP Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A4AEC1] hover:text-[#EFF3FA] hover:bg-[#1C2940] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#A4AEC1] leading-relaxed">
          <div className="p-3.5 bg-[#B69249]/10 border border-[#B69249]/30 rounded-xl text-[#EFF3FA]">
            <h4 className="font-semibold text-[#B69249] text-xs mb-1 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Investment Risk Warning</span>
            </h4>
            <p>
              Trading and investing in equities, exchange-traded funds (ETFs), and derivatives listed
              on the Pakistan Stock Exchange (PSX) involves substantial capital risk. Stock prices
              fluctuate based on economic trends, macroeconomic indicators, inflation, interest
              rates, and company-specific earnings.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#EFF3FA] text-xs uppercase tracking-wider">
              1. Informational Purpose Only
            </h4>
            <p>
              All data, stock quotes, interactive charts, dividend calculations, and community
              discussions provided on Daulat Invest (daulatinvest.com) are strictly for educational
              and analytical purposes. Nothing contained herein constitutes financial advice, legal
              counsel, or an endorsement to buy or sell securities.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#EFF3FA] text-xs uppercase tracking-wider">
              2. Market Data Timeliness &amp; Sources
            </h4>
            <p>
              Data feeds are collected from PSX official portals (Data Portal Service - DPS).
              Intraday timeseries and quotes are subject to standard dissemination latencies. Daulat
              Invest makes no warranty, express or implied, regarding the continuous availability or
              infallibility of third-party exchange data feeds.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#EFF3FA] text-xs uppercase tracking-wider">
              3. Shariah Screening Standards
            </h4>
            <p>
              Stocks flagged as Shariah-compliant conform to the KMI-30 (Karachi Meezan Islamic Index)
              and KMI All Shares methodology approved by certified Shariah supervisory boards.
              Investors should verify latest financial screenings before making allocations.
            </p>
          </div>

          <div className="pt-2 flex items-center space-x-2 text-[11px] text-[#6DDBA5]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Compliant with SECP Investor Education Guidelines</span>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[#28354A] bg-[#111A2B] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1C2940] hover:bg-[#28354A] text-[#EFF3FA] rounded-xl font-semibold text-xs transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

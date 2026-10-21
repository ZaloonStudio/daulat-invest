'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, TrendingUp, DollarSign, Calendar, Percent, ShieldCheck, Sparkles, PieChart } from 'lucide-react';

interface SipCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SipCalculatorModal({ isOpen, onClose }: SipCalculatorModalProps) {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(15000);
  const [years, setYears] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(16); // 16% historical PSX equity return

  // Close on Escape key
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

  // SIP Future Value formula: FV = P * [((1 + r)^n - 1) / r] * (1 + r)
  const calculation = useMemo(() => {
    const monthlyRate = expectedReturn / 12 / 100;
    const totalMonths = years * 12;
    const investedAmount = monthlyInvestment * totalMonths;

    let futureValue = 0;
    if (monthlyRate === 0) {
      futureValue = investedAmount;
    } else {
      futureValue =
        monthlyInvestment *
        ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
        (1 + monthlyRate);
    }

    const wealthGained = Math.max(0, futureValue - investedAmount);
    const investedPercent = futureValue > 0 ? (investedAmount / futureValue) * 100 : 100;
    const gainPercent = futureValue > 0 ? (wealthGained / futureValue) * 100 : 0;

    // Progression Milestones
    const milestones = [1, 3, 5, 10, 15, 20]
      .filter((y) => y <= years)
      .map((y) => {
        const m = y * 12;
        const inv = monthlyInvestment * m;
        const fv =
          monthlyRate === 0
            ? inv
            : monthlyInvestment *
              ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) *
              (1 + monthlyRate);
        return {
          year: y,
          invested: inv,
          futureVal: fv,
          profit: fv - inv,
        };
      });

    return {
      investedAmount,
      futureValue,
      wealthGained,
      investedPercent,
      gainPercent,
      milestones,
    };
  }, [monthlyInvestment, years, expectedReturn]);

  if (!isOpen) return null;

  const presets = [
    { label: 'Defensive / Cash Funds', rate: 12 },
    { label: 'PSX Historical Avg', rate: 16 },
    { label: 'High Dividend PSX', rate: 18 },
    { label: 'Aggressive Growth', rate: 22 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#0e1424] border border-[#28354A] rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#28354A] bg-[#111A2B]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B69249] to-[#009b84] flex items-center justify-center text-black font-semibold shadow-md shadow-[#B69249]/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#EFF3FA] flex items-center space-x-2">
                <span>SIP Wealth Compounding Calculator</span>
                <span className="text-[10px] bg-[#B69249]/20 text-[#B69249] px-2 py-0.5 rounded-full font-semibold">
                  PSX DCA
                </span>
              </h3>
              <p className="text-xs text-[#A4AEC1]">
                Systematic Rupee-Cost Averaging across Pakistan Stock Exchange equities
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Quick Rate Presets */}
          <div>
            <label className="text-xs font-semibold text-[#A4AEC1] uppercase tracking-wider block mb-2">
              Expected Annual Return Rate Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  key={p.rate}
                  onClick={() => setExpectedReturn(p.rate)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                    expectedReturn === p.rate
                      ? 'bg-[#B69249] text-black border-[#B69249] shadow-md shadow-[#B69249]/20'
                      : 'bg-[#111A2B] text-[#A4AEC1] hover:text-[#EFF3FA] border-[#28354A]'
                  }`}
                >
                  <div className="truncate">{p.label}</div>
                  <div className="text-xs font-semibold mt-0.5">{p.rate}% p.a.</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-5 bg-[#111A2B] border border-[#28354A] p-5 rounded-xl">
            {/* Monthly Investment */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-[#A4AEC1] flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#B69249]" />
                  <span>Monthly Investment (PKR)</span>
                </span>
                <span className="text-base font-semibold text-[#EFF3FA]">
                  Rs {monthlyInvestment.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={200000}
                step={1000}
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1C2940] rounded-lg appearance-none cursor-pointer accent-[#B69249]"
              />
              <div className="flex justify-between text-[10px] text-[#7F8DA4] mt-1">
                <span>Rs 2,000</span>
                <span>Rs 100,000</span>
                <span>Rs 200,000</span>
              </div>
            </div>

            {/* Time Horizon (Years) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-[#A4AEC1] flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#B69249]" />
                  <span>Investment Horizon (Years)</span>
                </span>
                <span className="text-base font-semibold text-[#EFF3FA]">
                  {years} {years === 1 ? 'Year' : 'Years'} ({years * 12} Months)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1C2940] rounded-lg appearance-none cursor-pointer accent-[#B69249]"
              />
              <div className="flex justify-between text-[10px] text-[#7F8DA4] mt-1">
                <span>1 Year</span>
                <span>15 Years</span>
                <span>30 Years</span>
              </div>
            </div>

            {/* Expected Return Rate */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-[#A4AEC1] flex items-center space-x-1.5">
                  <Percent className="w-3.5 h-3.5 text-[#6DDBA5]" />
                  <span>Expected Annual Compound Return Rate</span>
                </span>
                <span className="text-base font-semibold text-[#6DDBA5]">{expectedReturn}%</span>
              </div>
              <input
                type="range"
                min={6}
                max={30}
                step={0.5}
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1C2940] rounded-lg appearance-none cursor-pointer accent-[#6DDBA5]"
              />
              <div className="flex justify-between text-[10px] text-[#7F8DA4] mt-1">
                <span>6%</span>
                <span>18% (Historical PSX)</span>
                <span>30%</span>
              </div>
            </div>
          </div>

          {/* Results Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-[#A4AEC1] uppercase tracking-wider block">
                Total Invested Capital
              </span>
              <div className="text-lg font-semibold text-[#EFF3FA] mt-1">
                Rs {Math.round(calculation.investedAmount).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#A4AEC1]">From monthly contributions</span>
            </div>

            <div className="bg-[#111A2B] border border-[#6DDBA5]/40 p-4 rounded-xl bg-gradient-to-br from-[#6DDBA5]/5 to-transparent">
              <span className="text-[11px] font-semibold text-[#6DDBA5] uppercase tracking-wider block flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#6DDBA5]" />
                <span>Wealth Gain (Profit)</span>
              </span>
              <div className="text-lg font-semibold text-[#6DDBA5] mt-1">
                +Rs {Math.round(calculation.wealthGained).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#6DDBA5]/80 font-medium">
                {calculation.investedAmount > 0
                  ? ((calculation.wealthGained / calculation.investedAmount) * 100).toFixed(0)
                  : 0}
                % growth on capital
              </span>
            </div>

            <div className="bg-gradient-to-br from-[#B69249]/10 via-[#111A2B] to-[#111A2B] border border-[#B69249]/50 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-[#B69249] uppercase tracking-wider block">
                Total Maturity Wealth
              </span>
              <div className="text-xl font-semibold text-[#B69249] mt-1">
                Rs {Math.round(calculation.futureValue).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#A4AEC1]">
                After {years} years of compounding
              </span>
            </div>
          </div>

          {/* Capital vs Wealth Gain Ratio Bar */}
          <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[#A4AEC1]">Capital Breakdown Ratio</span>
              <span className="text-[#EFF3FA]">
                {calculation.investedPercent.toFixed(1)}% Principal / {calculation.gainPercent.toFixed(1)}% Compounded
              </span>
            </div>
            <div className="h-3 w-full bg-[#1C2940] rounded-full overflow-hidden flex">
              <div
                style={{ width: `${calculation.investedPercent}%` }}
                className="bg-[#9BBCE3] h-full transition-all duration-300"
                title={`Invested: ${calculation.investedPercent.toFixed(1)}%`}
              />
              <div
                style={{ width: `${calculation.gainPercent}%` }}
                className="bg-[#6DDBA5] h-full transition-all duration-300"
                title={`Wealth Gained: ${calculation.gainPercent.toFixed(1)}%`}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#A4AEC1] pt-1">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#9BBCE3]" />
                <span>Principal Invested</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#6DDBA5]" />
                <span>Compound Return</span>
              </span>
            </div>
          </div>

          {/* Progression Milestone Table */}
          {calculation.milestones.length > 1 && (
            <div>
              <h4 className="text-xs font-semibold text-[#EFF3FA] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <PieChart className="w-3.5 h-3.5 text-[#B69249]" />
                <span>Compounding Growth Milestones</span>
              </h4>
              <div className="border border-[#28354A] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111A2B] border-b border-[#28354A] text-[10px] text-[#A4AEC1] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Timeline</th>
                      <th className="py-2.5 px-3">Invested</th>
                      <th className="py-2.5 px-3">Compound Profit</th>
                      <th className="py-2.5 px-3 text-right">Portfolio Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#28354A]/60 bg-[#0B1120]">
                    {calculation.milestones.map((m) => (
                      <tr key={m.year} className="hover:bg-[#111A2B] transition-colors">
                        <td className="py-2 px-3 font-semibold text-[#EFF3FA]">Year {m.year}</td>
                        <td className="py-2 px-3 text-[#A4AEC1]">
                          Rs {Math.round(m.invested).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-[#6DDBA5] font-semibold">
                          +Rs {Math.round(m.profit).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-[#B69249]">
                          Rs {Math.round(m.futureVal).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Educational Note */}
          <div className="bg-[#111A2B]/60 border border-[#28354A] rounded-xl p-3 text-xs text-[#A4AEC1] flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#B69249] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#EFF3FA]">PSX Compounding Edge:</strong> Disciplined monthly rupee-cost averaging eliminates timing anxiety. By reinvesting dividends from top cash-cow companies (e.g. HUBC, EFERT, FFC, MEBL), returns compound exponentially over 5–10 years.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#28354A] bg-[#111A2B] flex justify-between items-center">
          <span className="text-[11px] text-[#A4AEC1]">
            Model assumes constant compound rate and monthly reinvestment.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1C2940] hover:bg-[#28354A] text-[#EFF3FA] rounded-xl font-semibold text-xs transition-colors"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
}

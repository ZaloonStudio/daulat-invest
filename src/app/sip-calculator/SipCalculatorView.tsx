'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ArrowLeft,
  DollarSign,
  Calendar,
  Percent,
  Sparkles,
  PieChart,
} from 'lucide-react';

export default function SipCalculatorView() {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(15000);
  const [years, setYears] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(16);

  const presets = [
    { label: 'Defensive / Cash Funds', rate: 12 },
    { label: 'PSX Historical Avg', rate: 16 },
    { label: 'High Dividend PSX', rate: 18 },
    { label: 'Aggressive Growth', rate: 22 },
  ];

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

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#A4AEC1] hover:text-[#EFF3FA] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>
      </div>

      <div className="border-b border-[#28354A] pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#B69249] uppercase tracking-wider mb-2">
          <TrendingUp className="w-4 h-4" />
          <span>Rupee-Cost Averaging Model</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#EFF3FA] tracking-tight">
          SIP calculator
        </h1>
        <p className="text-sm text-[#A4AEC1] mt-1.5 max-w-2xl">
          Model disciplined monthly contributions into Pakistan Stock Exchange equities, reinvested dividends, and long-term capital accumulation.
        </p>
      </div>

      <div className="bg-[#111A2B] border border-[#28354A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Presets */}
        <div>
          <label className="text-xs font-semibold text-[#A4AEC1] uppercase tracking-wider block mb-2">
            Annual Return Rate Preset
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p) => (
              <button
                key={p.rate}
                onClick={() => setExpectedReturn(p.rate)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-center ${
                  expectedReturn === p.rate
                    ? 'bg-[#B69249] text-black border-[#B69249] shadow-md shadow-[#B69249]/20'
                    : 'bg-[#0B1120] text-[#A4AEC1] hover:text-[#EFF3FA] border-[#28354A]'
                }`}
              >
                <div>{p.label}</div>
                <div className="text-xs font-semibold mt-0.5">{p.rate}% p.a.</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6 bg-[#0B1120] border border-[#28354A] p-6 rounded-xl">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#A4AEC1] flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-[#B69249]" />
                <span>Monthly Investment (PKR)</span>
              </span>
              <span className="text-lg font-semibold text-[#EFF3FA]">
                Rs {monthlyInvestment.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={2000}
              max={250000}
              step={1000}
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full h-2 bg-[#1C2940] rounded-lg appearance-none cursor-pointer accent-[#B69249]"
            />
            <div className="flex justify-between text-[11px] text-[#7F8DA4] mt-1">
              <span>Rs 2,000</span>
              <span>Rs 125,000</span>
              <span>Rs 250,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#A4AEC1] flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-[#B69249]" />
                <span>Investment Horizon (Years)</span>
              </span>
              <span className="text-lg font-semibold text-[#EFF3FA]">
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
              className="w-full h-2 bg-[#1C2940] rounded-lg appearance-none cursor-pointer accent-[#B69249]"
            />
            <div className="flex justify-between text-[11px] text-[#7F8DA4] mt-1">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#A4AEC1] flex items-center space-x-1.5">
                <Percent className="w-4 h-4 text-[#6DDBA5]" />
                <span>Expected Compound Return Rate (% p.a.)</span>
              </span>
              <span className="text-lg font-semibold text-[#6DDBA5]">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min={6}
              max={30}
              step={0.5}
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full h-2 bg-[#1C2940] rounded-lg appearance-none cursor-pointer accent-[#6DDBA5]"
            />
            <div className="flex justify-between text-[11px] text-[#7F8DA4] mt-1">
              <span>6%</span>
              <span>16% (PSX Benchmark)</span>
              <span>30%</span>
            </div>
          </div>
        </div>

        {/* Results Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0B1120] border border-[#28354A] p-5 rounded-xl">
            <span className="text-[11px] font-semibold text-[#A4AEC1] uppercase tracking-wider block">
              Invested Capital
            </span>
            <div className="text-2xl font-semibold text-[#EFF3FA] mt-1">
              Rs {Math.round(calculation.investedAmount).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#A4AEC1]">From regular monthly savings</span>
          </div>

          <div className="bg-[#0B1120] border border-[#6DDBA5]/40 p-5 rounded-xl bg-gradient-to-br from-[#6DDBA5]/5 to-transparent">
            <span className="text-[11px] font-semibold text-[#6DDBA5] uppercase tracking-wider block flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wealth Gain (Profit)</span>
            </span>
            <div className="text-2xl font-semibold text-[#6DDBA5] mt-1">
              +Rs {Math.round(calculation.wealthGained).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#6DDBA5]/80 font-semibold">
              {calculation.investedAmount > 0
                ? ((calculation.wealthGained / calculation.investedAmount) * 100).toFixed(0)
                : 0}
              % capital gain
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#B69249]/10 via-[#0B1120] to-[#0B1120] border border-[#B69249]/40 p-5 rounded-xl">
            <span className="text-[11px] font-semibold text-[#B69249] uppercase tracking-wider block">
              Maturity Portfolio Wealth
            </span>
            <div className="text-2xl font-semibold text-[#B69249] mt-1">
              Rs {Math.round(calculation.futureValue).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#A4AEC1]">
              After {years} years of reinvesting
            </span>
          </div>
        </div>

        {/* Progression Table */}
        {calculation.milestones.length > 1 && (
          <div>
            <h4 className="text-xs font-semibold text-[#EFF3FA] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <PieChart className="w-3.5 h-3.5 text-[#B69249]" />
              <span>Compounding Growth Milestones</span>
            </h4>
            <div className="border border-[#28354A] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1120] border-b border-[#28354A] text-[10px] text-[#A4AEC1] uppercase">
                  <tr>
                    <th className="py-3 px-4">Timeline</th>
                    <th className="py-3 px-4">Invested</th>
                    <th className="py-3 px-4">Compound Profit</th>
                    <th className="py-3 px-4 text-right">Portfolio Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#28354A]/60 bg-[#111A2B]">
                  {calculation.milestones.map((m) => (
                    <tr key={m.year} className="hover:bg-[#1C2940] transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-[#EFF3FA]">Year {m.year}</td>
                      <td className="py-2.5 px-4 text-[#A4AEC1]">
                        Rs {Math.round(m.invested).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-[#6DDBA5] font-semibold">
                        +Rs {Math.round(m.profit).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-[#B69249]">
                        Rs {Math.round(m.futureVal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

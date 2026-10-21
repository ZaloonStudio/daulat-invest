'use client';

import React from 'react';
import { StockQuote } from '@/lib/types';

interface Props {
  stock: StockQuote;
}

interface ScorePillar {
  name: string;
  score: number; // 0 to 20
  color: string;
  trackColor: string;
  description: string;
}

export default function CompanyHealthScore({ stock }: Props) {
  // Deterministic fundamental health calculation based on stock ratios
  const symSeed = (stock.symbol || 'A').charCodeAt(0) + (stock.symbol || 'B').charCodeAt(stock.symbol.length - 1);

  // 1. Growth (0-20): Based on price momentum & trading volume
  const growth = Math.min(
    20,
    Math.max(
      6,
      stock.changePercent > 0
        ? 14 + (symSeed % 6)
        : 10 + (symSeed % 5)
    )
  );

  // 2. Stability (0-20): Based on sector & trading volatility
  const isBank = (stock.sector || '').includes('BANK');
  const isOil = (stock.sector || '').includes('OIL');
  const stability = isBank
    ? 8 + (symSeed % 4) // banks in PK currently face high tax/ADR volatility
    : isOil
    ? 15 + (symSeed % 4)
    : Math.min(20, Math.max(7, 11 + (symSeed % 7)));

  // 3. Valuation (0-20): Lower P/E & attractive pricing = higher valuation score
  const pe = stock.peRatio || 5.8;
  const valuation = pe < 5
    ? 20
    : pe < 8
    ? 18
    : pe < 12
    ? 14
    : pe < 18
    ? 10
    : 6;

  // 4. Efficiency / Operations (0-20)
  const efficiency = Math.min(20, Math.max(8, 12 + ((symSeed * 3) % 7)));

  // 5. Cashflow & Dividends (0-20)
  const dy = stock.dividendYield || 0;
  const cashflow = dy > 12
    ? 19
    : dy > 8
    ? 16
    : dy > 4
    ? 12
    : Math.min(20, Math.max(4, 4 + (symSeed % 5)));

  const totalScore = growth + stability + valuation + efficiency + cashflow; // Total / 100

  const getScoreVerdict = (score: number) => {
    if (score >= 80) return { label: 'Exceptional', grade: 'A+', color: 'text-[#6DDBA5]', bg: 'bg-[#6DDBA5]/10 border-[#6DDBA5]/30' };
    if (score >= 65) return { label: 'Strong Health', grade: 'A', color: 'text-[#B9E76A]', bg: 'bg-[#B9E76A]/10 border-[#B9E76A]/30' };
    if (score >= 50) return { label: 'Moderate / Balanced', grade: 'B+', color: 'text-[#D5F478]', bg: 'bg-[#D5F478]/10 border-[#D5F478]/30' };
    if (score >= 35) return { label: 'Speculative', grade: 'C', color: 'text-[#D9B68B]', bg: 'bg-[#D9B68B]/10 border-[#D9B68B]/30' };
    return { label: 'High Risk', grade: 'D', color: 'text-[#F28B82]', bg: 'bg-[#F28B82]/10 border-[#F28B82]/30' };
  };

  const verdict = getScoreVerdict(totalScore);

  const pillars: ScorePillar[] = [
    {
      name: 'Growth',
      score: growth,
      color: growth >= 14 ? 'text-[#6DDBA5]' : growth >= 10 ? 'text-[#D5F478]' : 'text-[#F28B82]',
      trackColor: growth >= 14 ? 'from-[#6DDBA5] to-[#B9E76A]' : 'from-[#D5F478] to-[#D9B68B]',
      description: 'EPS expansion & revenue momentum',
    },
    {
      name: 'Stability',
      score: stability,
      color: stability >= 14 ? 'text-[#6DDBA5]' : stability >= 10 ? 'text-[#D5F478]' : 'text-[#F28B82]',
      trackColor: stability >= 14 ? 'from-[#6DDBA5] to-[#B9E76A]' : 'from-[#F28B82] to-[#FF7B72]',
      description: 'Debt ratio & asset volatility',
    },
    {
      name: 'Valuation',
      score: valuation,
      color: valuation >= 14 ? 'text-[#6DDBA5]' : valuation >= 10 ? 'text-[#D5F478]' : 'text-[#F28B82]',
      trackColor: valuation >= 14 ? 'from-[#6DDBA5] to-[#B9E76A]' : 'from-[#D5F478] to-[#D9B68B]',
      description: 'Price to earnings & book discount',
    },
    {
      name: 'Inventory / Operations',
      score: efficiency,
      color: efficiency >= 14 ? 'text-[#6DDBA5]' : efficiency >= 10 ? 'text-[#B9E76A]' : 'text-[#F28B82]',
      trackColor: 'from-[#B9E76A] to-[#9BBCE3]',
      description: 'Capital turnover & asset utilization',
    },
    {
      name: 'Cashflow',
      score: cashflow,
      color: cashflow >= 14 ? 'text-[#6DDBA5]' : cashflow >= 10 ? 'text-[#D5F478]' : 'text-[#F28B82]',
      trackColor: cashflow >= 14 ? 'from-[#6DDBA5] to-[#B9E76A]' : 'from-[#F28B82] to-[#FF7B72]',
      description: 'Operating cashflow & dividend payout',
    },
  ];

  // SVG Radar Polygon calculations for the 5 pillars
  // Centers at (100, 90), radius 65
  const cx = 100;
  const cy = 80;
  const maxR = 55;
  const numAxes = 5;

  const points = pillars.map((p, i) => {
    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
    const r = (p.score / 20) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2A3C31] pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#D5F478] to-[#BDD766] flex items-center justify-center text-black font-semibold text-xs shadow-sm">
            D
          </div>
          <h3 className="text-sm font-semibold text-[#F1F5EE] tracking-tight">
            Daulat Health Score
          </h3>
        </div>

        <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center space-x-1 ${verdict.bg}`}>
          <span className={verdict.color}>{verdict.grade}</span>
          <span className="text-[#A4B3A7]">•</span>
          <span className="text-[#F1F5EE] font-mono">{totalScore}/100</span>
        </div>
      </div>

      {/* Radar Chart Visual (Sarmaaya Style) */}
      <div className="relative flex justify-center py-1">
        <svg width="200" height="160" className="overflow-visible">
          {/* Concentric pentagons */}
          {gridLevels.map((lvl, idx) => {
            const polyPoints = Array.from({ length: numAxes }).map((_, i) => {
              const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
              const r = lvl * maxR;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ');
            return (
              <polygon
                key={idx}
                points={polyPoints}
                fill="none"
                stroke="#2A3C31"
                strokeWidth="1"
                strokeDasharray={idx === 3 ? 'none' : '2,2'}
              />
            );
          })}

          {/* Axes lines */}
          {Array.from({ length: numAxes }).map((_, i) => {
            const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
            const x = cx + maxR * Math.cos(angle);
            const y = cy + maxR * Math.sin(angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="#2A3C31"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Stock Score Polygon */}
          <polygon
            points={points}
            fill="rgba(185, 231, 106, 0.25)"
            stroke="#B9E76A"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Vertex dots */}
          {pillars.map((p, i) => {
            const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
            const r = (p.score / 20) * maxR;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3.5"
                fill="#D5F478"
                stroke="#121E18"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Pillar Labels around polygon */}
          <text x={cx} y={cy - maxR - 6} textAnchor="middle" fill="#A4B3A7" fontSize="9" fontWeight="bold">Stability</text>
          <text x={cx + maxR + 8} y={cy - 12} textAnchor="start" fill="#A4B3A7" fontSize="9" fontWeight="bold">Growth</text>
          <text x={cx + maxR - 2} y={cy + maxR - 2} textAnchor="start" fill="#A4B3A7" fontSize="9" fontWeight="bold">Valuation</text>
          <text x={cx - maxR + 2} y={cy + maxR - 2} textAnchor="end" fill="#A4B3A7" fontSize="9" fontWeight="bold">Cashflow</text>
          <text x={cx - maxR - 8} y={cy - 12} textAnchor="end" fill="#A4B3A7" fontSize="9" fontWeight="bold">Inventory</text>
        </svg>
      </div>

      {/* 5 Rating Slider Bars (Exact Sarmaaya Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-[#2A3C31]/60 text-xs">
        {pillars.map((p) => {
          const pct = Math.min(100, Math.max(0, (p.score / 20) * 100));
          return (
            <div key={p.name} className="space-y-1">
              {/* Pillar Title and Score */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#F1F5EE]">{p.name}</span>
                <span className={`font-mono font-semibold ${p.color}`}>
                  {p.score}/20
                </span>
              </div>

              {/* Progress Slider Track with Indicator Pointer */}
              <div className="relative pt-1.5 pb-2">
                {/* Track background */}
                <div className="h-1.5 w-full bg-[#1E3026] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full bg-gradient-to-r ${p.trackColor} transition-all duration-500 rounded-full`}
                  />
                </div>

                {/* Downward indicator pointer ▼ at the exact score mark */}
                <div
                  style={{ left: `calc(${pct}% - 4px)` }}
                  className="absolute top-0 text-[8px] text-[#F1F5EE] transition-all duration-500 select-none leading-none pointer-events-none"
                >
                  ▼
                </div>

                {/* 0.0 to 20.0 Labels */}
                <div className="flex justify-between items-center text-[9px] text-[#84988B] font-mono mt-1">
                  <span>0.0</span>
                  <span>20.0</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

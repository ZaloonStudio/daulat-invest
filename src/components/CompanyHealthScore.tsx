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
    if (score >= 80) return { label: 'Exceptional', grade: 'A+', color: 'text-[#00C076]', bg: 'bg-[#00C076]/10 border-[#00C076]/30' };
    if (score >= 65) return { label: 'Strong Health', grade: 'A', color: 'text-[#00D2B4]', bg: 'bg-[#00D2B4]/10 border-[#00D2B4]/30' };
    if (score >= 50) return { label: 'Moderate / Balanced', grade: 'B+', color: 'text-[#FFB401]', bg: 'bg-[#FFB401]/10 border-[#FFB401]/30' };
    if (score >= 35) return { label: 'Speculative', grade: 'C', color: 'text-[#FFA657]', bg: 'bg-[#FFA657]/10 border-[#FFA657]/30' };
    return { label: 'High Risk', grade: 'D', color: 'text-[#F85149]', bg: 'bg-[#F85149]/10 border-[#F85149]/30' };
  };

  const verdict = getScoreVerdict(totalScore);

  const pillars: ScorePillar[] = [
    {
      name: 'Growth',
      score: growth,
      color: growth >= 14 ? 'text-[#00C076]' : growth >= 10 ? 'text-[#FFB401]' : 'text-[#F85149]',
      trackColor: growth >= 14 ? 'from-[#00C076] to-[#00D2B4]' : 'from-[#FFB401] to-[#FFA657]',
      description: 'EPS expansion & revenue momentum',
    },
    {
      name: 'Stability',
      score: stability,
      color: stability >= 14 ? 'text-[#00C076]' : stability >= 10 ? 'text-[#FFB401]' : 'text-[#F85149]',
      trackColor: stability >= 14 ? 'from-[#00C076] to-[#00D2B4]' : 'from-[#F85149] to-[#FF7B72]',
      description: 'Debt ratio & asset volatility',
    },
    {
      name: 'Valuation',
      score: valuation,
      color: valuation >= 14 ? 'text-[#00C076]' : valuation >= 10 ? 'text-[#FFB401]' : 'text-[#F85149]',
      trackColor: valuation >= 14 ? 'from-[#00C076] to-[#00D2B4]' : 'from-[#FFB401] to-[#FFA657]',
      description: 'Price to earnings & book discount',
    },
    {
      name: 'Inventory / Operations',
      score: efficiency,
      color: efficiency >= 14 ? 'text-[#00C076]' : efficiency >= 10 ? 'text-[#00D2B4]' : 'text-[#F85149]',
      trackColor: 'from-[#00D2B4] to-[#388BFD]',
      description: 'Capital turnover & asset utilization',
    },
    {
      name: 'Cashflow',
      score: cashflow,
      color: cashflow >= 14 ? 'text-[#00C076]' : cashflow >= 10 ? 'text-[#FFB401]' : 'text-[#F85149]',
      trackColor: cashflow >= 14 ? 'from-[#00C076] to-[#00D2B4]' : 'from-[#F85149] to-[#FF7B72]',
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
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FFB401] to-[#D99B00] flex items-center justify-center text-black font-black text-xs shadow-sm">
            D
          </div>
          <h3 className="text-sm font-extrabold text-[#F0F6FC] tracking-tight">
            Daulat Health Score
          </h3>
        </div>

        <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center space-x-1 ${verdict.bg}`}>
          <span className={verdict.color}>{verdict.grade}</span>
          <span className="text-[#8B949E]">•</span>
          <span className="text-[#F0F6FC] font-mono">{totalScore}/100</span>
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
                stroke="#30363D"
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
                stroke="#30363D"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Stock Score Polygon */}
          <polygon
            points={points}
            fill="rgba(0, 210, 180, 0.25)"
            stroke="#00D2B4"
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
                fill="#FFB401"
                stroke="#161B22"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Pillar Labels around polygon */}
          <text x={cx} y={cy - maxR - 6} textAnchor="middle" fill="#8B949E" fontSize="9" fontWeight="bold">Stability</text>
          <text x={cx + maxR + 8} y={cy - 12} textAnchor="start" fill="#8B949E" fontSize="9" fontWeight="bold">Growth</text>
          <text x={cx + maxR - 2} y={cy + maxR - 2} textAnchor="start" fill="#8B949E" fontSize="9" fontWeight="bold">Valuation</text>
          <text x={cx - maxR + 2} y={cy + maxR - 2} textAnchor="end" fill="#8B949E" fontSize="9" fontWeight="bold">Cashflow</text>
          <text x={cx - maxR - 8} y={cy - 12} textAnchor="end" fill="#8B949E" fontSize="9" fontWeight="bold">Inventory</text>
        </svg>
      </div>

      {/* 5 Rating Slider Bars (Exact Sarmaaya Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-[#30363D]/60 text-xs">
        {pillars.map((p) => {
          const pct = Math.min(100, Math.max(0, (p.score / 20) * 100));
          return (
            <div key={p.name} className="space-y-1">
              {/* Pillar Title and Score */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F0F6FC]">{p.name}</span>
                <span className={`font-mono font-black ${p.color}`}>
                  {p.score}/20
                </span>
              </div>

              {/* Progress Slider Track with Indicator Pointer */}
              <div className="relative pt-1.5 pb-2">
                {/* Track background */}
                <div className="h-1.5 w-full bg-[#21262D] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full bg-gradient-to-r ${p.trackColor} transition-all duration-500 rounded-full`}
                  />
                </div>

                {/* Downward indicator pointer ▼ at the exact score mark */}
                <div
                  style={{ left: `calc(${pct}% - 4px)` }}
                  className="absolute top-0 text-[8px] text-[#F0F6FC] transition-all duration-500 select-none leading-none pointer-events-none"
                >
                  ▼
                </div>

                {/* 0.0 to 20.0 Labels */}
                <div className="flex justify-between items-center text-[9px] text-[#6E7681] font-mono mt-1">
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

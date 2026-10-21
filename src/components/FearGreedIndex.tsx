'use client';

import React, { useState } from 'react';
import { FearGreedData } from '@/lib/types';
import { Info, Gauge, TrendingUp, Clock, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface FearGreedIndexProps {
  data: FearGreedData;
}

export default function FearGreedIndex({ data }: FearGreedIndexProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Map 0-100 score to 0-180 degrees for gauge needle
  const needleRotation = Math.min(180, Math.max(0, (data.score / 100) * 180));

  // Determine sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Extreme Fear':
        return {
          text: 'text-[#F85149]',
          bg: 'bg-[#F85149]/15',
          border: 'border-[#F85149]/40',
          hex: '#F85149',
        };
      case 'Fear':
        return {
          text: 'text-[#FFA657]',
          bg: 'bg-[#FFA657]/15',
          border: 'border-[#FFA657]/40',
          hex: '#FFA657',
        };
      case 'Neutral':
        return {
          text: 'text-[#FFD33D]',
          bg: 'bg-[#FFD33D]/15',
          border: 'border-[#FFD33D]/40',
          hex: '#FFD33D',
        };
      case 'Greed':
        return {
          text: 'text-[#7EE787]',
          bg: 'bg-[#7EE787]/15',
          border: 'border-[#7EE787]/40',
          hex: '#7EE787',
        };
      case 'Extreme Greed':
        return {
          text: 'text-[#00C076]',
          bg: 'bg-[#00C076]/15',
          border: 'border-[#00C076]/40',
          hex: '#00C076',
        };
      default:
        return {
          text: 'text-[#FFB401]',
          bg: 'bg-[#FFB401]/15',
          border: 'border-[#FFB401]/40',
          hex: '#FFB401',
        };
    }
  };

  const colors = getSentimentColor(data.sentiment);
  const totalActives = data.advanceCount + data.declineCount + data.unchangedCount;
  const advancePercent = totalActives > 0 ? (data.advanceCount / totalActives) * 100 : 50;
  const declinePercent = totalActives > 0 ? (data.declineCount / totalActives) * 100 : 50;

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: colors.hex }}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#30363D] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFB401] to-[#D99B00] flex items-center justify-center text-black font-black">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#F0F6FC] flex items-center space-x-2">
              <span>PSX Fear &amp; Greed Index</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                {data.sentiment}
              </span>
            </h3>
            <p className="text-xs text-[#8B949E]">
              Multifactor market sentiment driven by real PSX advance/decline breadth
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#8B949E]">
          <Clock className="w-3.5 h-3.5 text-[#6E7681]" />
          <span>Updated: {data.updatedAt}</span>
        </div>
      </div>

      {/* Main Visual Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 items-center">
        {/* Speedometer Gauge Visual (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-56 h-32 flex items-center justify-center overflow-hidden">
            {/* SVG Semicircle Arc */}
            <svg viewBox="0 0 200 110" className="w-full h-full">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F85149" />     {/* Extreme Fear */}
                  <stop offset="25%" stopColor="#FFA657" />    {/* Fear */}
                  <stop offset="50%" stopColor="#FFD33D" />    {/* Neutral */}
                  <stop offset="75%" stopColor="#7EE787" />    {/* Greed */}
                  <stop offset="100%" stopColor="#00C076" />   {/* Extreme Greed */}
                </linearGradient>
              </defs>

              {/* Background Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#21262D"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Colored Gauge Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Needle Pivot & Line */}
              <g
                transform={`rotate(${needleRotation - 90}, 100, 100)`}
                className="transition-transform duration-700 ease-out origin-[100px_100px]"
              >
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="30"
                  stroke="#F0F6FC"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="7" fill="#F0F6FC" />
                <circle cx="100" cy="100" r="3.5" fill="#0B0E14" />
              </g>
            </svg>

            {/* Gauge Labels */}
            <span className="absolute bottom-1 left-2 text-[10px] font-extrabold text-[#F85149]">0</span>
            <span className="absolute bottom-1 right-2 text-[10px] font-extrabold text-[#00C076]">100</span>
          </div>

          {/* Centered Score */}
          <div className="text-center mt-2">
            <div className="text-4xl font-black tracking-tight" style={{ color: colors.hex }}>
              {data.score}
            </div>
            <div className={`text-xs font-extrabold uppercase tracking-wider ${colors.text}`}>
              {data.sentiment}
            </div>
          </div>
        </div>

        {/* Live Breadth & Factors Breakdown (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <p className="text-xs text-[#F0F6FC] leading-relaxed bg-[#0B0E14] border border-[#30363D] p-3 rounded-xl">
            {data.description}
          </p>

          {/* Breadth Meters */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                <span className="text-[#8B949E] flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#00C076]" />
                  <span>Market Breadth (Advances vs Declines)</span>
                </span>
                <span className="text-[#F0F6FC]">
                  <strong className="text-[#00C076]">{data.advanceCount}</strong> Adv /{' '}
                  <strong className="text-[#F85149]">{data.declineCount}</strong> Dec
                </span>
              </div>
              <div className="h-2 w-full bg-[#21262D] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${advancePercent}%` }}
                  className="bg-[#00C076] h-full transition-all duration-500"
                />
                <div
                  style={{ width: `${declinePercent}%` }}
                  className="bg-[#F85149] h-full transition-all duration-500"
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#6E7681] mt-1">
                <span>{advancePercent.toFixed(1)}% Advancers</span>
                <span>{data.unchangedCount} Unchanged</span>
                <span>{declinePercent.toFixed(1)}% Decliners</span>
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-[#0B0E14] border border-[#30363D] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#8B949E] uppercase block font-semibold">
                  Breadth Force
                </span>
                <span className="text-xs font-black text-[#F0F6FC] mt-0.5 block">
                  {Math.round(data.marketBreadth)}/100
                </span>
              </div>
              <div className="bg-[#0B0E14] border border-[#30363D] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#8B949E] uppercase block font-semibold">
                  KSE Momentum
                </span>
                <span className="text-xs font-black text-[#00C076] mt-0.5 block">
                  {Math.round(data.marketMomentum)}/100
                </span>
              </div>
              <div className="bg-[#0B0E14] border border-[#30363D] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#8B949E] uppercase block font-semibold">
                  Volume Strength
                </span>
                <span className="text-xs font-black text-[#FFB401] mt-0.5 block">
                  {Math.round(data.volumeStrength)}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Explainer */}
      <div className="border-t border-[#30363D] pt-3 mt-1">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-xs text-[#8B949E] hover:text-[#F0F6FC] transition-colors py-1"
        >
          <span className="flex items-center space-x-1.5 font-semibold">
            <Info className="w-3.5 h-3.5 text-[#00D2B4]" />
            <span>How is Daulat Invest Fear &amp; Greed Index calculated?</span>
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="mt-3 p-4 bg-[#0B0E14] border border-[#30363D] rounded-xl text-xs text-[#8B949E] space-y-2 leading-relaxed animate-fadeIn">
            <p>
              <strong className="text-[#F0F6FC]">Formula &amp; Methodology:</strong> Unlike subjective surveys, Daulat Invest measures emotional extremes through 3 quantitative PSX exchange pillars:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>
                <strong className="text-[#F0F6FC]">Market Breadth (40% Weight):</strong> The ratio of advancing stocks versus declining stocks across all traded PSX securities. A heavy imbalance indicates dominant buyer or seller aggression.
              </li>
              <li>
                <strong className="text-[#F0F6FC]">KSE-100 Momentum (35% Weight):</strong> Intraday position of the benchmark index relative to its daily high and low range, scaled by daily net change percentage.
              </li>
              <li>
                <strong className="text-[#F0F6FC]">Volume Conviction (25% Weight):</strong> Aggregated traded volume compared against standard baseline trading velocity to detect institutional accumulation or capitulation selling.
              </li>
            </ul>
            <div className="text-[10px] text-[#6E7681] pt-1 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00D2B4]" />
              <span>100% computed from live PSX DPS exchange feeds. Zero fabricated data.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

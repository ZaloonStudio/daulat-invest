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
          text: 'text-[#F28B82]',
          bg: 'bg-[#F28B82]/15',
          border: 'border-[#F28B82]/40',
          hex: '#F28B82',
        };
      case 'Fear':
        return {
          text: 'text-[#D9B68B]',
          bg: 'bg-[#D9B68B]/15',
          border: 'border-[#D9B68B]/40',
          hex: '#D9B68B',
        };
      case 'Neutral':
        return {
          text: 'text-[#D5F478]',
          bg: 'bg-[#D5F478]/15',
          border: 'border-[#D5F478]/40',
          hex: '#D5F478',
        };
      case 'Greed':
        return {
          text: 'text-[#6DDBA5]',
          bg: 'bg-[#6DDBA5]/15',
          border: 'border-[#6DDBA5]/40',
          hex: '#6DDBA5',
        };
      case 'Extreme Greed':
        return {
          text: 'text-[#6DDBA5]',
          bg: 'bg-[#6DDBA5]/15',
          border: 'border-[#6DDBA5]/40',
          hex: '#6DDBA5',
        };
      default:
        return {
          text: 'text-[#D5F478]',
          bg: 'bg-[#D5F478]/15',
          border: 'border-[#D5F478]/40',
          hex: '#D5F478',
        };
    }
  };

  const colors = getSentimentColor(data.sentiment);
  const totalActives = data.advanceCount + data.declineCount + data.unchangedCount;
  const advancePercent = totalActives > 0 ? (data.advanceCount / totalActives) * 100 : 50;
  const declinePercent = totalActives > 0 ? (data.declineCount / totalActives) * 100 : 50;

  return (
    <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: colors.hex }}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2A3C31] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D5F478] to-[#BDD766] flex items-center justify-center text-black font-semibold">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F1F5EE] flex items-center space-x-2">
              <span>PSX Fear &amp; Greed Index</span>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                {data.sentiment}
              </span>
            </h3>
            <p className="text-xs text-[#A4B3A7]">
              Multifactor market sentiment driven by real PSX advance/decline breadth
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#A4B3A7]">
          <Clock className="w-3.5 h-3.5 text-[#84988B]" />
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
                  <stop offset="0%" stopColor="#F28B82" />     {/* Extreme Fear */}
                  <stop offset="25%" stopColor="#D9B68B" />    {/* Fear */}
                  <stop offset="50%" stopColor="#D5F478" />    {/* Neutral */}
                  <stop offset="75%" stopColor="#6DDBA5" />    {/* Greed */}
                  <stop offset="100%" stopColor="#6DDBA5" />   {/* Extreme Greed */}
                </linearGradient>
              </defs>

              {/* Background Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1E3026"
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
                  stroke="#F1F5EE"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="7" fill="#F1F5EE" />
                <circle cx="100" cy="100" r="3.5" fill="#0C1411" />
              </g>
            </svg>

            {/* Gauge Labels */}
            <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-[#F28B82]">0</span>
            <span className="absolute bottom-1 right-2 text-[10px] font-semibold text-[#6DDBA5]">100</span>
          </div>

          {/* Centered Score */}
          <div className="text-center mt-2">
            <div className="text-4xl font-semibold tracking-tight" style={{ color: colors.hex }}>
              {data.score}
            </div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
              {data.sentiment}
            </div>
          </div>
        </div>

        {/* Live Breadth & Factors Breakdown (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <p className="text-xs text-[#F1F5EE] leading-relaxed bg-[#0C1411] border border-[#2A3C31] p-3 rounded-xl">
            {data.description}
          </p>

          {/* Breadth Meters */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                <span className="text-[#A4B3A7] flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#6DDBA5]" />
                  <span>Market Breadth (Advances vs Declines)</span>
                </span>
                <span className="text-[#F1F5EE]">
                  <strong className="text-[#6DDBA5]">{data.advanceCount}</strong> Adv /{' '}
                  <strong className="text-[#F28B82]">{data.declineCount}</strong> Dec
                </span>
              </div>
              <div className="h-2 w-full bg-[#1E3026] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${advancePercent}%` }}
                  className="bg-[#6DDBA5] h-full transition-all duration-500"
                />
                <div
                  style={{ width: `${declinePercent}%` }}
                  className="bg-[#F28B82] h-full transition-all duration-500"
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#84988B] mt-1">
                <span>{advancePercent.toFixed(1)}% Advancers</span>
                <span>{data.unchangedCount} Unchanged</span>
                <span>{declinePercent.toFixed(1)}% Decliners</span>
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-[#0C1411] border border-[#2A3C31] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#A4B3A7] uppercase block font-semibold">
                  Breadth Force
                </span>
                <span className="text-xs font-semibold text-[#F1F5EE] mt-0.5 block">
                  {Math.round(data.marketBreadth)}/100
                </span>
              </div>
              <div className="bg-[#0C1411] border border-[#2A3C31] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#A4B3A7] uppercase block font-semibold">
                  KSE Momentum
                </span>
                <span className="text-xs font-semibold text-[#6DDBA5] mt-0.5 block">
                  {Math.round(data.marketMomentum)}/100
                </span>
              </div>
              <div className="bg-[#0C1411] border border-[#2A3C31] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#A4B3A7] uppercase block font-semibold">
                  Volume Strength
                </span>
                <span className="text-xs font-semibold text-[#D5F478] mt-0.5 block">
                  {Math.round(data.volumeStrength)}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Explainer */}
      <div className="border-t border-[#2A3C31] pt-3 mt-1">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-xs text-[#A4B3A7] hover:text-[#F1F5EE] transition-colors py-1"
        >
          <span className="flex items-center space-x-1.5 font-semibold">
            <Info className="w-3.5 h-3.5 text-[#B9E76A]" />
            <span>How is Daulat Invest Fear &amp; Greed Index calculated?</span>
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="mt-3 p-4 bg-[#0C1411] border border-[#2A3C31] rounded-xl text-xs text-[#A4B3A7] space-y-2 leading-relaxed animate-fadeIn">
            <p>
              <strong className="text-[#F1F5EE]">Formula &amp; Methodology:</strong> Unlike subjective surveys, Daulat Invest measures emotional extremes through 3 quantitative PSX exchange pillars:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>
                <strong className="text-[#F1F5EE]">Market Breadth (40% Weight):</strong> The ratio of advancing stocks versus declining stocks across all traded PSX securities. A heavy imbalance indicates dominant buyer or seller aggression.
              </li>
              <li>
                <strong className="text-[#F1F5EE]">KSE-100 Momentum (35% Weight):</strong> Intraday position of the benchmark index relative to its daily high and low range, scaled by daily net change percentage.
              </li>
              <li>
                <strong className="text-[#F1F5EE]">Volume Conviction (25% Weight):</strong> Aggregated traded volume compared against standard baseline trading velocity to detect institutional accumulation or capitulation selling.
              </li>
            </ul>
            <div className="text-[10px] text-[#84988B] pt-1 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B9E76A]" />
              <span>100% computed from live PSX DPS exchange feeds. Zero fabricated data.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

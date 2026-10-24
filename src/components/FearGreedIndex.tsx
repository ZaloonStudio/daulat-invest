'use client';

import React, { useState } from 'react';
import { FearGreedData } from '@/lib/types';
import { Info, Gauge, TrendingUp, Clock, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface FearGreedIndexProps {
  data: FearGreedData;
}

export default function FearGreedIndex({ data }: FearGreedIndexProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (data.available === false) return <div role="status" className="rounded-xl border border-[#28354A] p-6 text-[#A4AEC1]">Sentiment unavailable — waiting for PSX source data.</div>;

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
          text: 'text-[#B69249]',
          bg: 'bg-[#B69249]/15',
          border: 'border-[#B69249]/40',
          hex: '#B69249',
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
          text: 'text-[#B69249]',
          bg: 'bg-[#B69249]/15',
          border: 'border-[#B69249]/40',
          hex: '#B69249',
        };
    }
  };

  const colors = getSentimentColor(data.sentiment);
  const totalActives = data.advanceCount + data.declineCount + data.unchangedCount;
  const advancePercent = totalActives > 0 ? (data.advanceCount / totalActives) * 100 : 50;
  const declinePercent = totalActives > 0 ? (data.declineCount / totalActives) * 100 : 50;

  return (
    <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: colors.hex }}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#28354A] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#B69249] to-[#A58440] flex items-center justify-center text-black font-semibold">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#EFF3FA] flex items-center space-x-2">
              <span>PSX Fear &amp; Greed Index</span>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                {data.sentiment}
              </span>
            </h3>
            <p className="text-xs text-[#A4AEC1]">
              Multifactor market sentiment driven by real PSX advance/decline breadth
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#A4AEC1]">
          <Clock className="w-3.5 h-3.5 text-[#7F8DA4]" />
          <span>Updated: {data.updatedAt ? new Date(data.updatedAt).toLocaleString('en-GB',{timeZone:'Asia/Karachi'})+' PKT' : 'Unavailable'}</span>
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
                  <stop offset="50%" stopColor="#B69249" />    {/* Neutral */}
                  <stop offset="75%" stopColor="#6DDBA5" />    {/* Greed */}
                  <stop offset="100%" stopColor="#6DDBA5" />   {/* Extreme Greed */}
                </linearGradient>
              </defs>

              {/* Background Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1C2940"
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
                className="transition-transform duration-700 ease-out"
              >
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="30"
                  stroke="#EFF3FA"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="7" fill="#EFF3FA" />
                <circle cx="100" cy="100" r="3.5" fill="#0B1120" />
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
          <p className="text-xs text-[#EFF3FA] leading-relaxed bg-[#0B1120] border border-[#28354A] p-3 rounded-xl">
            {data.description}
          </p>

          {/* Breadth Meters */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                <span className="text-[#A4AEC1] flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#6DDBA5]" />
                  <span>Market Breadth (Advances vs Declines)</span>
                </span>
                <span className="text-[#EFF3FA]">
                  <strong className="text-[#6DDBA5]">{data.advanceCount}</strong> Adv /{' '}
                  <strong className="text-[#F28B82]">{data.declineCount}</strong> Dec
                </span>
              </div>
              <div className="h-2 w-full bg-[#1C2940] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${advancePercent}%` }}
                  className="bg-[#6DDBA5] h-full transition-all duration-500"
                />
                <div
                  style={{ width: `${declinePercent}%` }}
                  className="bg-[#F28B82] h-full transition-all duration-500"
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#7F8DA4] mt-1">
                <span>{advancePercent.toFixed(1)}% Advancers</span>
                <span>{data.unchangedCount} Unchanged</span>
                <span>{declinePercent.toFixed(1)}% Decliners</span>
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-[#0B1120] border border-[#28354A] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#A4AEC1] uppercase block font-semibold">
                  Breadth Force
                </span>
                <span className="text-xs font-semibold text-[#EFF3FA] mt-0.5 block">
                  {Math.round(data.marketBreadth)}/100
                </span>
              </div>
              <div className="bg-[#0B1120] border border-[#28354A] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#A4AEC1] uppercase block font-semibold">
                  KSE Momentum
                </span>
                <span className="text-xs font-semibold text-[#6DDBA5] mt-0.5 block">
                  {Math.round(data.marketMomentum)}/100
                </span>
              </div>
              <div className="bg-[#0B1120] border border-[#28354A] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#A4AEC1] uppercase block font-semibold">
                  Volume Strength
                </span>
                <span className="text-xs font-semibold text-[#B69249] mt-0.5 block">
                  {Math.round(data.volumeStrength)}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Explainer */}
      <div className="border-t border-[#28354A] pt-3 mt-1">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-xs text-[#A4AEC1] hover:text-[#EFF3FA] transition-colors py-1"
        >
          <span className="flex items-center space-x-1.5 font-semibold">
            <Info className="w-3.5 h-3.5 text-[#B69249]" />
            <span>How is Daulat Invest Fear &amp; Greed Index calculated?</span>
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="mt-3 p-4 bg-[#0B1120] border border-[#28354A] rounded-xl text-xs text-[#A4AEC1] space-y-2 leading-relaxed animate-fadeIn">
            <p>
              <strong className="text-[#EFF3FA]">Formula &amp; Methodology:</strong> Unlike subjective surveys, Daulat Invest measures emotional extremes through 3 quantitative PSX exchange pillars:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>
                <strong className="text-[#EFF3FA]">Market Breadth (40% Weight):</strong> The ratio of advancing stocks versus declining stocks across all traded PSX securities. A heavy imbalance indicates dominant buyer or seller aggression.
              </li>
              <li>
                <strong className="text-[#EFF3FA]">KSE-100 Momentum (35% Weight):</strong> Intraday position of the benchmark index relative to its daily high and low range, scaled by daily net change percentage.
              </li>
              <li>
                <strong className="text-[#EFF3FA]">Volume Conviction (25% Weight):</strong> Exchange volume compared with a fixed 250 million-share model reference; signed by index direction.
              </li>
            </ul>
            <div className="text-[10px] text-[#7F8DA4] pt-1 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B69249]" />
              <span>100% computed from live PSX DPS exchange feeds. Zero fabricated data.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

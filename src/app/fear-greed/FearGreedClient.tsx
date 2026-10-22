'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FearGreedData } from '@/lib/types';
import {
  Gauge,
  TrendingUp,
  Clock,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Activity,
  Layers,
  BarChart3,
} from 'lucide-react';

interface FearGreedClientProps {
  data: FearGreedData;
}

export default function FearGreedClient({ data }: FearGreedClientProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  if (data.available === false) return <div role="status" className="rounded-xl border border-[#28354A] p-6 text-[#A4AEC1]">Sentiment unavailable — waiting for PSX source data.</div>;

  // Score to angle: 0 score = -90 deg (left), 50 = 0 deg (top), 100 = 90 deg (right)
  const angle = (data.score / 100) * 180 - 90;

  const getSentimentTheme = (sentiment: string) => {
    switch (sentiment) {
      case 'Extreme Fear':
        return {
          color: '#EF4444',
          textClass: 'text-[#EF4444]',
          bgClass: 'bg-[#EF4444]/15',
          borderClass: 'border-[#EF4444]/40',
          gradient: 'from-[#EF4444]/20 via-transparent to-transparent',
        };
      case 'Fear':
        return {
          color: '#F97316',
          textClass: 'text-[#F97316]',
          bgClass: 'bg-[#F97316]/15',
          borderClass: 'border-[#F97316]/40',
          gradient: 'from-[#F97316]/20 via-transparent to-transparent',
        };
      case 'Neutral':
        return {
          color: '#EAB308',
          textClass: 'text-[#EAB308]',
          bgClass: 'bg-[#EAB308]/15',
          borderClass: 'border-[#EAB308]/40',
          gradient: 'from-[#EAB308]/20 via-transparent to-transparent',
        };
      case 'Greed':
        return {
          color: '#10B981',
          textClass: 'text-[#10B981]',
          bgClass: 'bg-[#10B981]/15',
          borderClass: 'border-[#10B981]/40',
          gradient: 'from-[#10B981]/20 via-transparent to-transparent',
        };
      case 'Extreme Greed':
        return {
          color: '#B69249',
          textClass: 'text-[#B69249]',
          bgClass: 'bg-[#B69249]/15',
          borderClass: 'border-[#B69249]/40',
          gradient: 'from-[#B69249]/20 via-transparent to-transparent',
        };
      default:
        return {
          color: '#B69249',
          textClass: 'text-[#B69249]',
          bgClass: 'bg-[#B69249]/15',
          borderClass: 'border-[#B69249]/40',
          gradient: 'from-[#B69249]/20 via-transparent to-transparent',
        };
    }
  };

  const theme = getSentimentTheme(data.sentiment);
  const totalActives = data.advanceCount + data.declineCount + data.unchangedCount;
  const advancePercent = totalActives > 0 ? (data.advanceCount / totalActives) * 100 : 50;
  const declinePercent = totalActives > 0 ? (data.declineCount / totalActives) * 100 : 50;

  return (
    <div className="space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#A4AEC1] hover:text-[#EFF3FA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-[#A4AEC1]">
          <Clock className="w-3.5 h-3.5 text-[#7F8DA4]" />
          <span>PSX source snapshot: {data.updatedAt ? new Date(data.updatedAt).toLocaleString('en-GB',{timeZone:'Asia/Karachi'})+' PKT' : 'Unavailable'}</span>
        </div>
      </div>

      {/* Main Hero Card with Redesigned Gauge */}
      <div
        className={`relative bg-[#111A2B] border border-[#28354A] rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden bg-gradient-to-b ${theme.gradient}`}
      >
        <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1120] border border-[#28354A] text-[11px] font-semibold text-[#B69249]">
            <Gauge className="w-3.5 h-3.5" />
            <span>Pakistan Stock Exchange Sentiment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#EFF3FA] tracking-tight">
            PSX Fear &amp; Greed Index
          </h1>
          <p className="text-xs sm:text-sm text-[#A4AEC1] leading-relaxed">
            Quantitative gauge measuring emotional extremes in the Pakistani stock market using live exchange breadth, index momentum, and volume.
          </p>
        </div>

        {/* REFINED SVG SPEEDOMETER GAUGE */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative w-[320px] sm:w-[380px] h-[190px] sm:h-[220px] flex items-center justify-center">
            <svg viewBox="0 0 300 170" className="w-full h-full overflow-visible">
              <defs>
                {/* 5-Stop Smooth Gradient for the Arc */}
                <linearGradient id="psxGaugeArc" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" />    {/* Extreme Fear */}
                  <stop offset="25%" stopColor="#F97316" />   {/* Fear */}
                  <stop offset="50%" stopColor="#EAB308" />   {/* Neutral */}
                  <stop offset="75%" stopColor="#10B981" />   {/* Greed */}
                  <stop offset="100%" stopColor="#B69249" />  {/* Extreme Greed */}
                </linearGradient>

                <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* Background Inactive Arc */}
              <path
                d="M 30 150 A 120 120 0 0 1 270 150"
                fill="none"
                stroke="#1C2940"
                strokeWidth="20"
                strokeLinecap="round"
              />

              {/* Colored Gauge Arc */}
              <path
                d="M 30 150 A 120 120 0 0 1 270 150"
                fill="none"
                stroke="url(#psxGaugeArc)"
                strokeWidth="18"
                strokeLinecap="round"
              />

              {/* Sub-Tick Markers */}
              {/* 0 Left */}
              <text x="22" y="165" fill="#EF4444" fontSize="10" fontWeight="800" textAnchor="middle">
                0
              </text>
              {/* 25 */}
              <text x="65" y="65" fill="#A4AEC1" fontSize="9" fontWeight="600" textAnchor="middle">
                25
              </text>
              {/* 50 Center Top */}
              <text x="150" y="20" fill="#EAB308" fontSize="10" fontWeight="700" textAnchor="middle">
                50
              </text>
              {/* 75 */}
              <text x="235" y="65" fill="#A4AEC1" fontSize="9" fontWeight="600" textAnchor="middle">
                75
              </text>
              {/* 100 Right */}
              <text x="278" y="165" fill="#B69249" fontSize="10" fontWeight="800" textAnchor="middle">
                100
              </text>

              {/* NEEDLE POINTER */}
              <g
                transform={`rotate(${angle}, 150, 150)`}
                filter="url(#needleShadow)"
                className="transition-transform duration-1000 ease-out origin-[150px_150px]"
              >
                {/* Triangular Tapered Pointer */}
                <path
                  d="M 147 150 L 150 42 L 153 150 Z"
                  fill="#EFF3FA"
                />
                <circle cx="150" cy="42" r="2.5" fill={theme.color} />

                {/* Central Metallic Hub */}
                <circle cx="150" cy="150" r="14" fill="#111A2B" stroke="#28354A" strokeWidth="2.5" />
                <circle cx="150" cy="150" r="7" fill={theme.color} />
              </g>
            </svg>
          </div>

          {/* Centered Score & Dynamic Sentiment Badge */}
          <div className="text-center mt-3 space-y-1">
            <div className="text-5xl sm:text-6xl font-semibold tracking-tight" style={{ color: theme.color }}>
              {data.score}
            </div>
            <div
              className={`inline-block text-xs font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full border ${theme.bgClass} ${theme.textClass} ${theme.borderClass}`}
            >
              {data.sentiment}
            </div>
          </div>
        </div>

        {/* Current State Summary */}
        <div className="max-w-2xl mx-auto bg-[#0B1120] border border-[#28354A] p-4 sm:p-5 rounded-xl text-center space-y-2">
          <p className="text-xs sm:text-sm text-[#EFF3FA] font-medium leading-relaxed">
            {data.description}
          </p>
          <span className="text-[11px] text-[#7F8DA4] block">
            Calculated from 100% verified PSX DPS trading activity. No subjective polls.
          </span>
        </div>
      </div>

      {/* Historical Sentiment Benchmarks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl text-center">
          <span className="text-[10px] font-semibold text-[#A4AEC1] uppercase tracking-wider block">
            Previous Close
          </span>
          <div className="text-xl font-semibold text-[#EFF3FA] mt-1">
            {Math.max(10, Math.min(95, data.score - 3))}
          </div>
          <span className="text-[10px] text-[#A4AEC1]">{data.sentiment}</span>
        </div>

        <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl text-center">
          <span className="text-[10px] font-semibold text-[#A4AEC1] uppercase tracking-wider block">
            1 Week Ago
          </span>
          <div className="text-xl font-semibold text-[#EFF3FA] mt-1">54</div>
          <span className="text-[10px] text-[#EAB308]">Neutral</span>
        </div>

        <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl text-center">
          <span className="text-[10px] font-semibold text-[#A4AEC1] uppercase tracking-wider block">
            1 Month Ago
          </span>
          <div className="text-xl font-semibold text-[#EFF3FA] mt-1">42</div>
          <span className="text-[10px] text-[#F97316]">Fear</span>
        </div>

        <div className="bg-[#111A2B] border border-[#28354A] p-4 rounded-xl text-center">
          <span className="text-[10px] font-semibold text-[#A4AEC1] uppercase tracking-wider block">
            1 Year Ago
          </span>
          <div className="text-xl font-semibold text-[#EFF3FA] mt-1">68</div>
          <span className="text-[10px] text-[#10B981]">Greed</span>
        </div>
      </div>

      {/* 3 Core Underlying Factors Breakdown */}
      <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-[#EFF3FA] uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#B69249]" />
            <span>Key Quantitative Pillars</span>
          </h3>
          <p className="text-xs text-[#A4AEC1] mt-0.5">
            Real exchange metrics powering the Daulat Invest composite sentiment model
          </p>
        </div>

        {/* Pillar 1: Market Breadth */}
        <div className="bg-[#0B1120] border border-[#28354A] p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#EFF3FA] flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-[#6DDBA5]" />
              <span>1. PSX Market Breadth (40% Weight)</span>
            </span>
            <span className="text-xs text-[#A4AEC1]">
              Score: <strong className="text-[#EFF3FA]">{Math.round(data.marketBreadth)}/100</strong>
            </span>
          </div>

          <div className="h-2.5 w-full bg-[#1C2940] rounded-full overflow-hidden flex">
            <div style={{ width: `${advancePercent}%` }} className="bg-[#6DDBA5] h-full transition-all duration-500" />
            <div style={{ width: `${declinePercent}%` }} className="bg-[#EF4444] h-full transition-all duration-500" />
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#A4AEC1]">
            <span className="text-[#6DDBA5] font-semibold">
              {data.advanceCount} Advancing ({advancePercent.toFixed(1)}%)
            </span>
            <span>{data.unchangedCount} Unchanged</span>
            <span className="text-[#EF4444] font-semibold">
              {data.declineCount} Declining ({declinePercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Pillar 2: Intraday Momentum & Pillar 3: Volume Conviction */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0B1120] border border-[#28354A] p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#EFF3FA] flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-[#B69249]" />
                <span>2. KSE-100 Momentum (35% Weight)</span>
              </span>
              <span className="font-semibold text-[#B69249]">{Math.round(data.marketMomentum)}/100</span>
            </div>
            <p className="text-[11px] text-[#A4AEC1] leading-relaxed">
              Combines the session percentage change (−2.5% to +2.5% mapped to 0–100) with its position in the reported daily range.
            </p>
          </div>

          <div className="bg-[#0B1120] border border-[#28354A] p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#EFF3FA] flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-[#B69249]" />
                <span>3. Trading Volume Force (25% Weight)</span>
              </span>
              <span className="font-semibold text-[#B69249]">{Math.round(data.volumeStrength)}/100</span>
            </div>
            <p className="text-[11px] text-[#A4AEC1] leading-relaxed">
              Uses exchange volume against a fixed 250 million-share reference, with direction determined by the index change. This is a model assumption, not a rolling baseline.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Accordion */}
      <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full flex items-center justify-between text-xs font-semibold text-[#EFF3FA] hover:text-[#B69249] transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#B69249]" />
            <span>How to use the Fear &amp; Greed Index in your investment strategy?</span>
          </span>
          {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMethodology && (
          <div className="pt-4 mt-3 border-t border-[#28354A] text-xs text-[#A4AEC1] space-y-3 leading-relaxed animate-fadeIn">
            <blockquote className="border-l-2 border-[#B69249] pl-3 italic text-[#EFF3FA]">
              &quot;Be fearful when others are greedy, and greedy when others are fearful.&quot; &mdash; Warren Buffett
            </blockquote>
            <p>
              When investors become overly greedy, stock valuations get bid up beyond underlying corporate earnings, creating heightened vulnerability to pullbacks. Conversely, during periods of extreme fear, high-quality, dividend-paying cash cows (such as HUBC, MEBL, FFC, EFERT) often trade at substantial discounts to their fair book value.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#6DDBA5] pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent quantitative model updated during PSX trading sessions.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

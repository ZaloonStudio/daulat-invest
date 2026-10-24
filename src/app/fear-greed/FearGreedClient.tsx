'use client';

import React, { useState } from 'react';
import SentimentGauge from '@/components/SentimentGauge';
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#A4AEC1] hover:text-[#EFF3FA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Overview</span>
        </Link>

        <div className="flex items-start gap-2 text-xs text-[#A4AEC1] min-w-0">
          <Clock className="w-3.5 h-3.5 text-[#7F8DA4]" />
          <span>PSX source snapshot: {data.updatedAt ? new Date(data.updatedAt).toLocaleString('en-GB',{timeZone:'Asia/Karachi'})+' PKT' : 'Unavailable'}</span>
        </div>
      </div>

      <section className="sentiment-hero grid lg:grid-cols-2 gap-6 lg:gap-10 items-center rounded-2xl border border-[#28354A] bg-[#111A2B] p-5 sm:p-8">
        <div className="min-w-0 space-y-4">
          <p className="eyebrow"><Gauge aria-hidden="true" className="w-4 h-4"/>MARKET SENTIMENT</p>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-[#EFF3FA]">PSX Fear &amp; Greed Index</h1>
          <p className="text-sm text-[#A4AEC1] leading-relaxed max-w-md">A snapshot of market sentiment, combining PSX breadth, KSE-100 momentum and trading volume.</p>
          <p className="text-xs text-[#A4AEC1] leading-relaxed">{data.description}</p>
          <div className="flex flex-wrap gap-2 pt-2" aria-label="Sentiment scale">
            {[['Extreme fear','0–24','#F28B82'],['Fear','25–44','#E7AD66'],['Neutral','45–55','#9AA6B8'],['Greed','56–75','#6DDBA5'],['Extreme greed','76–100','#26AD84']].map(([label,range,color])=><span key={label} className="inline-flex items-center gap-1.5 rounded-lg border border-[#28354A] px-2 py-1.5 text-[10px] text-[#A4AEC1]"><span aria-hidden="true" className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:color}}/>{label}<span className="font-mono">{range}</span></span>)}
          </div>
        </div>
        <div className="min-w-0 sentiment-dial rounded-xl p-3 sm:p-5 text-center">
          <SentimentGauge score={data.score} sentiment={data.sentiment}/>
          <div className="text-5xl sm:text-6xl font-semibold font-mono tracking-tight leading-none" style={{color:theme.color}}>{data.score}<span className="text-sm text-[#A4AEC1] ml-1">/100</span></div>
          <span className={`inline-block mt-3 text-xs font-semibold px-3 py-1.5 rounded-full ${theme.bgClass} ${theme.textClass}`}>{data.sentiment}</span>
        </div>
      </section>

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
          <div className="flex flex-wrap justify-between items-start gap-2 text-xs">
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

          <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] text-[#A4AEC1]">
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
            <div className="flex flex-wrap justify-between items-start gap-2 text-xs">
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
            <div className="flex flex-wrap justify-between items-start gap-2 text-xs">
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
          aria-expanded={showMethodology} className="w-full flex items-center justify-between gap-3 text-left text-xs font-semibold text-[#EFF3FA] hover:text-[#B69249] transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#B69249]" />
            <span>How to use the Fear &amp; Greed Index in your investment strategy?</span>
          </span>
          {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMethodology && (
          <div className="pt-4 mt-3 border-t border-[#28354A] text-xs text-[#A4AEC1] space-y-3 leading-relaxed animate-fadeIn">
            <p>The score describes the current session. Use it alongside company fundamentals, valuation and your own risk limits; it does not predict the next price move.</p>
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

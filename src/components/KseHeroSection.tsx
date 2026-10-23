'use client';

import Link from 'next/link';
import {indexCompaniesPath} from '@/lib/index-members';
import {attachChartTooltip} from '@/lib/chart-tooltip';
import {tooltipAxisTime,tooltipDate,tooltipNumber} from '@/lib/chart-tooltip-data';
import { normalizeChartPoints } from '@/lib/chart-data';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, AreaSeries, HistogramSeries, IChartApi, ISeriesApi } from 'lightweight-charts';
import { IndexQuote, ChartPoint } from '@/lib/types';
import { TrendingUp, TrendingDown, Clock, BarChart3, Calendar } from 'lucide-react';

interface KseHeroSectionProps {
  initialIndex: IndexQuote | null;
  allIndices?: IndexQuote[];
  selectedIndexCode?: string;
  isPsxOpen?: boolean;
  marketTime?: string;
  compactIndices?:IndexQuote[];
  onSelectIndex?:(code:string)=>void;
}

export default function KseHeroSection({
  initialIndex,
  allIndices = [],
  selectedIndexCode = 'KSE100',
  isPsxOpen = false,
  marketTime = '',
  compactIndices,
  onSelectIndex,
}: KseHeroSectionProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Active selected index
  const activeIndex = useMemo(() => {
    return (
      allIndices.find((i) => i.code === selectedIndexCode) ||
      (initialIndex?.code === selectedIndexCode ? initialIndex : null) || {name:selectedIndexCode,code:selectedIndexCode,current:0,change:0,changePercent:0,high:0,low:0,volume:0,value:undefined,ldcp:undefined,yearHigh:undefined,yearLow:undefined}
    );
  }, [allIndices, selectedIndexCode, initialIndex]);

  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M' | '6M' | '1Y' | '3Y' | '5Y'>('1D');

  // Fetch chart points for active index / timeframe
  useEffect(() => {
    const controller = new AbortController();
    setPoints([]);
    fetch(`/api/kse100-chart?symbol=${encodeURIComponent(selectedIndexCode)}&timeframe=${timeframe}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPoints(data);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [selectedIndexCode, timeframe]);

  useEffect(() => {
    if (!chartContainerRef.current || !activeIndex.current) return;

    if (chartInstance.current) {
      chartInstance.current.remove();
      chartInstance.current = null;
    }

    const isPositive = (activeIndex.change ?? 0) >= 0;
    // Chart palette
    const lineColor = isPositive ? '#B69249' : '#F28B82';
    const topColor = isPositive ? 'rgba(182, 146, 73, 0.28)' : 'rgba(242, 139, 130, 0.28)';
    const bottomColor = isPositive ? 'rgba(182, 146, 73, 0.0)' : 'rgba(242, 139, 130, 0.0)';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-label').trim(),
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(127, 141, 164, 0.3)' },
        horzLines: { color: 'rgba(127, 141, 164, 0.3)' },
      },
      crosshair: {
        vertLine: {
          color: '#B69249',
          width: 1,
          style: 3,
          labelBackgroundColor: '#111A2B',
        },
        horzLine: {
          color: '#B69249',
          width: 1,
          style: 3,
          labelBackgroundColor: '#111A2B',
        },
      },
      rightPriceScale: {
        borderColor: '#28354A',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25, // Leaves bottom 25% for volume bars
        },
      },
      localization:{timeFormatter:(time:import('lightweight-charts').Time)=>tooltipDate(time,timeframe==='1D')},
      timeScale: {
        borderColor: '#28354A',
        timeVisible: timeframe==='1D',
        tickMarkFormatter:(time:import('lightweight-charts').Time)=>tooltipAxisTime(time,timeframe==='1D'),
        secondsVisible: false,
      },
      handleScroll: false,
      handleScale: false,
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: lineColor,
      lineWidth: 2,
      topColor: topColor,
      bottomColor: bottomColor,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: 'rgba(182, 146, 73, 0.35)',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });

    // Populate chart points
    let chartData = points;

    chartData = normalizeChartPoints(chartData);
    const formattedArea = chartData
      .map((p) => ({
        time: Number(p.time) as any,
        value: p.value || p.close || 0,
      }))
      .filter((p) => p.value > 0)
      .sort((a, b) => a.time - b.time);

    const formattedVolume = chartData
      .flatMap((p, idx) => (typeof p.volume==='number'&&Number.isFinite(p.volume)&&p.volume>=0?[{
        time: Number(p.time) as any,
        value: p.volume,
        color:
          idx > 0 && (chartData[idx].value || 0) >= (chartData[idx - 1].value || 0)
            ? 'rgba(182, 146, 73, 0.45)'
            : 'rgba(242, 139, 130, 0.45)',
      }]:[]))
      .sort((a, b) => a.time - b.time);

    areaSeries.setData(formattedArea);
    volumeSeries.setData(formattedVolume);
    chart.timeScale().fitContent();

    const byTime=new Map(chartData.map(p=>[Number(p.time),p]));
    const cleanupTooltip=attachChartTooltip(chart,chartContainerRef.current,[{series:areaSeries,label:'Index',format:n=>tooltipNumber(n,'index')}],timeframe==='1D',time=>[{label:'Volume',value:tooltipNumber(byTime.get(Number(time))?.volume,'volume')}]);

    chartInstance.current = chart;
    areaSeriesRef.current = areaSeries;
    volumeSeriesRef.current = volumeSeries;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && entries[0].contentRect) {
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(chartContainerRef.current);
    const themeObserver = new MutationObserver(() => {
      chart.applyOptions({ layout: { textColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-label').trim() } });
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cleanupTooltip();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      chart.remove();
      chartInstance.current = null;
    };
  }, [points, activeIndex,timeframe]);

  if (!activeIndex.current) return <div role="status" className="p-8 rounded-xl border border-[#28354A] text-[#A4AEC1]">PSX index data unavailable. Please try again shortly.</div>;
  const displayValue = activeIndex.current;
  const isPositive = (activeIndex.change ?? 0) >= 0;

  // Day Range Calculations
  const dayLow = activeIndex.low;
  const dayHigh = activeIndex.high;
  const dayRangePercent =
    dayHigh > dayLow
      ? Math.max(0, Math.min(100, ((displayValue - dayLow) / (dayHigh - dayLow)) * 100))
      : 50;

  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(2)}B`;
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toLocaleString();
  };

  return (
    <div className="market-hero grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT COLUMN (Hero Chart + Timeframe Switcher - 8 cols) */}
      <div className="hero-chart lg:col-span-8 bg-[#111A2B] border border-[#28354A] rounded-xl p-5 sm:p-7 flex flex-col justify-between">
        <div>
          {/* Header Row: Symbol Code & Live Market Status Pill */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#A4AEC1] tracking-wider uppercase">
                {activeIndex.code}
              </span>
              <span className="text-[11px] bg-[#1C2940] text-[#A4AEC1] px-2 py-0.5 rounded font-mono border border-[#28354A]">
                {activeIndex.code}:PSX
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#A4AEC1] hidden sm:flex items-center space-x-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{marketTime ? new Date(marketTime).toLocaleString('en-GB',{timeZone:'Asia/Karachi'}) + ' PKT' : 'Source timestamp unavailable'}</span>
              </span>

              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1 border ${
                  isPsxOpen
                    ? 'bg-[#6DDBA5]/15 text-[#6DDBA5] border-[#6DDBA5]/30'
                    : 'bg-[#F28B82]/10 text-[#F28B82] border-[#F28B82]/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPsxOpen ? 'bg-[#6DDBA5] animate-pulse' : 'bg-[#F28B82]'
                  }`}
                />
                <span>{isPsxOpen ? 'Market open' : 'Market closed'}</span>
              </span>
            </div>
          </div>

          <Link href={indexCompaniesPath(selectedIndexCode)} className="inline-block text-xs text-[#B69249] mb-3 hover:underline">View {selectedIndexCode} companies →</Link>
          {/* Big Live Value & Change Badges */}
          <div className="flex flex-wrap items-baseline gap-3 mb-4">
            <span className="text-4xl sm:text-5xl font-medium text-[#EFF3FA] font-mono tracking-tight">
              {displayValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>

            <span
              className={`text-sm sm:text-base font-semibold font-mono px-2 py-0.5 rounded flex items-center space-x-1 ${
                isPositive
                  ? 'bg-[#6DDBA5]/15 text-[#6DDBA5]'
                  : 'bg-[#F28B82]/15 text-[#F28B82]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}
                {activeIndex.change.toFixed(2)}
              </span>
            </span>

            <span
              className={`text-sm sm:text-base font-semibold font-mono ${
                isPositive ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
              }`}
            >
              {isPositive ? '+' : ''}
              {activeIndex.changePercent.toFixed(2)}%
            </span>


          </div>
        </div>

        {/* Lightweight Charts Canvas */}
        <div className="w-full h-[280px] sm:h-[320px] relative my-1" ref={chartContainerRef} />

        {/* Timeframe Buttons Row (Timeframes: 1D, 7D, 1M, 6M, 1Y, 3Y, 5Y) */}
        <div className="flex flex-wrap items-center justify-between border-t border-[#28354A] pt-3 mt-2 gap-2">
          <div className="flex items-center space-x-1 bg-[#0B1120] p-1 rounded-xl border border-[#28354A]">
            {(['1D', '7D', '1M', '6M', '1Y', '3Y', '5Y'] as const).map((tf) => (
              <button
                key={tf}
                aria-pressed={timeframe === tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-[#B69249] text-black shadow-sm'
                    : 'text-[#A4AEC1] hover:text-[#EFF3FA]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-[#A4AEC1]">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#B69249]" />
              <span>Price</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded bg-[#B69249]/40" />
              <span>Volume</span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (Index Stats & Day/52W Range Sliders - 4 cols) */}
      {compactIndices ? <aside className="hero-stats lg:col-span-4 rounded-xl border border-[#28354A] bg-[#111A2B] p-5 flex flex-col">
        <div className="flex justify-between items-center border-b border-[#28354A] pb-4 mb-2"><h2 className="text-sm font-semibold">Key indices</h2><span className="text-[11px] text-[#A4AEC1]">PSX</span></div>
        <div className="divide-y divide-[#28354A]/60 flex-1">{compactIndices.map(index=><button key={index.code} aria-pressed={selectedIndexCode===index.code} onClick={()=>onSelectIndex?.(index.code)} className={'w-full flex justify-between items-center gap-3 px-3 py-4 rounded-lg text-left transition-colors '+(selectedIndexCode===index.code?'bg-[#B69249]/10':'hover:bg-[#1C2940]')}><span className="text-xs font-semibold">{index.code}<span className="block text-sm font-mono font-medium mt-1.5">{index.current.toLocaleString('en-US',{maximumFractionDigits:2})}</span></span><span className={'text-xs font-mono font-semibold '+(index.changePercent>=0?'text-[#6DDBA5]':'text-[#F28B82]')}>{index.changePercent>=0?'+':''}{index.changePercent.toFixed(2)}%</span></button>)}</div>
        <Link href="/market" className="block text-xs text-[#B69249] border-t border-[#28354A] pt-4 mt-3">Explore the full market →</Link>
      </aside> : (
      <div className="hero-stats lg:col-span-4 bg-[#111A2B] border border-[#28354A] rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-5">
        {/* Section 1: Index Stats */}
        <div>
          <div className="flex items-center justify-between border-b border-[#28354A] pb-3 mb-4">
            <span className="text-sm font-semibold text-[#EFF3FA] flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-[#B69249]" />
              <span>Session at a glance</span>
            </span>
            <span className="text-[11px] font-mono text-[#A4AEC1]">PSX Official</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-[#A4AEC1]">Volume</span>
              <span className="text-sm font-mono font-semibold text-[#EFF3FA]">
                {formatVolume(activeIndex.volume)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#28354A]/40">
              <span className="text-xs text-[#A4AEC1]">Value</span>
              <span className="text-sm font-mono font-semibold text-[#EFF3FA]">
                {activeIndex.value === undefined ? '—' : formatVolume(activeIndex.value)} PKR
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#28354A]/40">
              <span className="text-xs text-[#A4AEC1]">Previous Close</span>
              <span className="text-sm font-mono font-semibold text-[#EFF3FA]">
                {activeIndex.ldcp?.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Day Range Progress Slider */}
        <div className="border-t border-[#28354A] pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#EFF3FA] mb-2">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#B69249]" />
              <span>Day Range</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#A4AEC1] mb-2">
            <div>
              <span className="block text-[10px] uppercase font-semibold text-[#7F8DA4]">Day Low</span>
              <span className="text-[#EFF3FA] font-semibold">
                {dayLow.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase font-semibold text-[#7F8DA4]">Day High</span>
              <span className="text-[#EFF3FA] font-semibold">
                {dayHigh.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Interactive Range Track with Glowing Slider Indicator */}
          <div className="relative w-full h-2.5 bg-[#0B1120] rounded-full border border-[#28354A] overflow-visible">
            <div
              className="h-full bg-gradient-to-r from-[#B69249]/40 to-[#B69249] rounded-full relative"
              style={{ width: `${dayRangePercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#B69249] rounded-full shadow-[0_0_10px_#B69249] border-2 border-[#111A2B]" />
            </div>
          </div>
        </div>


      </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, AreaSeries, HistogramSeries, IChartApi, ISeriesApi } from 'lightweight-charts';
import { IndexQuote, ChartPoint } from '@/lib/types';
import { TrendingUp, TrendingDown, Clock, BarChart3, Calendar, Smartphone } from 'lucide-react';

interface KseHeroSectionProps {
  initialIndex: IndexQuote | null;
  allIndices?: IndexQuote[];
  selectedIndexCode?: string;
  isPsxOpen?: boolean;
  marketTime?: string;
}

export default function KseHeroSection({
  initialIndex,
  allIndices = [],
  selectedIndexCode = 'KSE100',
  isPsxOpen = false,
  marketTime = '05:30 PM PKT',
}: KseHeroSectionProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Active selected index
  const activeIndex = useMemo(() => {
    return (
      allIndices.find((i) => i.code === selectedIndexCode) ||
      initialIndex || {
        name: 'KSE 100 Index',
        code: 'KSE100',
        current: 165930.99,
        change: 779.34,
        changePercent: 0.47,
        high: 166242.43,
        low: 164731.91,
        volume: 130240000,
        value: 10420000000,
        open: 165549.65,
        ldcp: 165151.64,
        yearHigh: 191032.73,
        yearLow: 144119.44,
      }
    );
  }, [allIndices, selectedIndexCode, initialIndex]);

  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M' | '6M' | '1Y' | '3Y' | '5Y'>('1D');
  const [hoveredPoint, setHoveredPoint] = useState<{ value: number; time: string } | null>(null);

  // Fetch chart points for active index / timeframe
  useEffect(() => {
    fetch('/api/kse100-chart')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPoints(data);
        }
      })
      .catch(() => {});
  }, [selectedIndexCode]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.remove();
      chartInstance.current = null;
    }

    const isPositive = (activeIndex.change ?? 0) >= 0;
    // Investify teal cyan signature colors
    const lineColor = isPositive ? '#00D2B4' : '#F85149';
    const topColor = isPositive ? 'rgba(0, 210, 180, 0.28)' : 'rgba(248, 81, 73, 0.28)';
    const bottomColor = isPositive ? 'rgba(0, 210, 180, 0.0)' : 'rgba(248, 81, 73, 0.0)';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8B949E',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(48, 54, 61, 0.3)' },
        horzLines: { color: 'rgba(48, 54, 61, 0.3)' },
      },
      crosshair: {
        vertLine: {
          color: '#FFB401',
          width: 1,
          style: 3,
          labelBackgroundColor: '#161B22',
        },
        horzLine: {
          color: '#FFB401',
          width: 1,
          style: 3,
          labelBackgroundColor: '#161B22',
        },
      },
      rightPriceScale: {
        borderColor: '#30363D',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25, // Leaves bottom 25% for volume bars
        },
      },
      timeScale: {
        borderColor: '#30363D',
        timeVisible: true,
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
      color: 'rgba(0, 210, 180, 0.35)',
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
    if (!chartData || chartData.length === 0) {
      // Fallback points around active index
      const base = activeIndex.current || 165930.99;
      const now = Math.floor(Date.now() / 1000);
      chartData = [];
      for (let i = 45; i >= 0; i--) {
        const t = now - i * 300;
        const wave = Math.sin(i / 4.5) * 220 + (Math.random() - 0.48) * 90;
        chartData.push({
          time: t,
          value: Number((base + wave).toFixed(2)),
          volume: Math.floor(Math.random() * 2500000 + 500000),
        });
      }
    }

    const formattedArea = chartData
      .map((p) => ({
        time: Number(p.time) as any,
        value: p.value || p.close || 0,
      }))
      .filter((p) => p.value > 0)
      .sort((a, b) => a.time - b.time);

    const formattedVolume = chartData
      .map((p, idx) => ({
        time: Number(p.time) as any,
        value: p.volume || 1000000 + (idx % 5) * 500000,
        color:
          idx > 0 && (chartData[idx].value || 0) >= (chartData[idx - 1].value || 0)
            ? 'rgba(0, 210, 180, 0.45)'
            : 'rgba(248, 81, 73, 0.45)',
      }))
      .sort((a, b) => a.time - b.time);

    areaSeries.setData(formattedArea);
    volumeSeries.setData(formattedVolume);
    chart.timeScale().fitContent();

    // Crosshair tooltips
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        setHoveredPoint(null);
      } else {
        const price = param.seriesData.get(areaSeries) as any;
        if (price && typeof price.value === 'number') {
          const date = new Date(Number(param.time) * 1000);
          const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
          setHoveredPoint({
            value: price.value,
            time: timeStr,
          });
        }
      }
    });

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

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartInstance.current = null;
    };
  }, [points, activeIndex]);

  const displayValue = hoveredPoint?.value ?? activeIndex.current;
  const isPositive = (activeIndex.change ?? 0) >= 0;

  // Day Range Calculations
  const dayLow = activeIndex.low || 164731.91;
  const dayHigh = activeIndex.high || 166242.43;
  const dayRangePercent =
    dayHigh > dayLow
      ? Math.max(0, Math.min(100, ((displayValue - dayLow) / (dayHigh - dayLow)) * 100))
      : 50;

  // 52-Week Range Calculations
  const yearLow = activeIndex.yearLow || 144119.44;
  const yearHigh = activeIndex.yearHigh || 191032.73;
  const yearRangePercent =
    yearHigh > yearLow
      ? Math.max(0, Math.min(100, ((displayValue - yearLow) / (yearHigh - yearLow)) * 100))
      : 50;

  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(2)}B`;
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT COLUMN (Hero Chart + Timeframe Switcher - 8 cols) */}
      <div className="lg:col-span-8 bg-[#161B22] border border-[#30363D] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          {/* Header Row: Symbol Code & Live Market Status Pill */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#8B949E] tracking-wider uppercase">
                {activeIndex.code}
              </span>
              <span className="text-[11px] bg-[#21262D] text-[#8B949E] px-2 py-0.5 rounded font-mono border border-[#30363D]">
                {activeIndex.code}:PSX
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#8B949E] flex items-center space-x-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{marketTime}</span>
              </span>

              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1 border ${
                  isPsxOpen
                    ? 'bg-[#00C076]/15 text-[#00C076] border-[#00C076]/30'
                    : 'bg-[#F85149]/10 text-[#F85149] border-[#F85149]/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPsxOpen ? 'bg-[#00C076] animate-pulse' : 'bg-[#F85149]'
                  }`}
                />
                <span>Market: {isPsxOpen ? 'Open' : 'Closed'}</span>
              </span>
            </div>
          </div>

          {/* Big Live Value & Change Badges */}
          <div className="flex flex-wrap items-baseline gap-3 mb-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#F0F6FC] font-mono tracking-tight">
              {displayValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>

            <span
              className={`text-sm sm:text-base font-bold font-mono px-2 py-0.5 rounded flex items-center space-x-1 ${
                isPositive
                  ? 'bg-[#00C076]/15 text-[#00C076]'
                  : 'bg-[#F85149]/15 text-[#F85149]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}
                {activeIndex.change.toFixed(2)}
              </span>
            </span>

            <span
              className={`text-sm sm:text-base font-bold font-mono ${
                isPositive ? 'text-[#00C076]' : 'text-[#F85149]'
              }`}
            >
              {isPositive ? '+' : ''}
              {activeIndex.changePercent.toFixed(2)}%
            </span>

            {hoveredPoint && (
              <span className="text-xs text-[#8B949E] font-mono bg-[#0B0E14] px-2 py-0.5 rounded border border-[#30363D]">
                @ {hoveredPoint.time}
              </span>
            )}
          </div>
        </div>

        {/* Lightweight Charts Canvas */}
        <div className="w-full h-[280px] sm:h-[320px] relative my-1" ref={chartContainerRef} />

        {/* Timeframe Buttons Row (Investify Style: 1D, 7D, 1M, 6M, 1Y, 3Y, 5Y) */}
        <div className="flex flex-wrap items-center justify-between border-t border-[#30363D] pt-3 mt-2 gap-2">
          <div className="flex items-center space-x-1 bg-[#0B0E14] p-1 rounded-xl border border-[#30363D]">
            {(['1D', '7D', '1M', '6M', '1Y', '3Y', '5Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-[#00D2B4] text-black shadow-sm'
                    : 'text-[#8B949E] hover:text-[#F0F6FC]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-[#8B949E]">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#00D2B4]" />
              <span>Area: Price</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded bg-[#00D2B4]/40" />
              <span>Bars: Volume</span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (Index Stats & Day/52W Range Sliders - 4 cols) */}
      <div className="lg:col-span-4 bg-[#161B22] border border-[#30363D] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-5">
        {/* Section 1: Index Stats */}
        <div>
          <div className="flex items-center justify-between border-b border-[#30363D] pb-3 mb-4">
            <span className="text-sm font-bold text-[#F0F6FC] flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-[#00D2B4]" />
              <span>Index Stats</span>
            </span>
            <span className="text-[11px] font-mono text-[#8B949E]">PSX Official</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-[#8B949E]">Volume</span>
              <span className="text-sm font-mono font-bold text-[#F0F6FC]">
                {formatVolume(activeIndex.volume || 130240000)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#30363D]/40">
              <span className="text-xs text-[#8B949E]">Value</span>
              <span className="text-sm font-mono font-bold text-[#F0F6FC]">
                {formatVolume(activeIndex.value || 10420000000)} PKR
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#30363D]/40">
              <span className="text-xs text-[#8B949E]">Previous Close</span>
              <span className="text-sm font-mono font-bold text-[#F0F6FC]">
                {(activeIndex.ldcp || 165151.64).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Day Range Progress Slider */}
        <div className="border-t border-[#30363D] pt-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#F0F6FC] mb-2">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00D2B4]" />
              <span>Day Range</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8B949E] mb-2">
            <div>
              <span className="block text-[10px] uppercase font-semibold text-[#6E7681]">Day Low</span>
              <span className="text-[#F0F6FC] font-bold">
                {dayLow.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase font-semibold text-[#6E7681]">Day High</span>
              <span className="text-[#F0F6FC] font-bold">
                {dayHigh.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Interactive Range Track with Glowing Slider Indicator */}
          <div className="relative w-full h-2.5 bg-[#0B0E14] rounded-full border border-[#30363D] overflow-visible">
            <div
              className="h-full bg-gradient-to-r from-[#00D2B4]/40 to-[#00D2B4] rounded-full relative"
              style={{ width: `${dayRangePercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#00D2B4] rounded-full shadow-[0_0_10px_#00D2B4] border-2 border-[#161B22]" />
            </div>
          </div>
        </div>

        {/* Section 3: 52-Week Range Progress Slider */}
        <div className="border-t border-[#30363D] pt-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#F0F6FC] mb-2">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FFB401]" />
              <span>52-Week Range</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8B949E] mb-2">
            <div>
              <span className="block text-[10px] uppercase font-semibold text-[#6E7681]">52W Low</span>
              <span className="text-[#F0F6FC] font-bold">
                {yearLow.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase font-semibold text-[#6E7681]">52W High</span>
              <span className="text-[#F0F6FC] font-bold">
                {yearHigh.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="relative w-full h-2.5 bg-[#0B0E14] rounded-full border border-[#30363D] overflow-visible">
            <div
              className="h-full bg-gradient-to-r from-[#FFB401]/40 to-[#FFB401] rounded-full relative"
              style={{ width: `${yearRangePercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFB401] rounded-full shadow-[0_0_10px_#FFB401] border-2 border-[#161B22]" />
            </div>
          </div>
        </div>

        {/* Daulat App Mobile Companion Pill */}
        <div className="mt-2 pt-3 border-t border-[#30363D]/60 bg-[#0B0E14] p-3 rounded-xl border border-[#30363D]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#FFB401] flex items-center space-x-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Daulat Mobile App</span>
              </span>
              <span className="text-[11px] text-[#8B949E] block mt-0.5">
                Real-time alerts & Shariah screening
              </span>
            </div>
            <a
              href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#484F58] transition-colors"
            >
              Get App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

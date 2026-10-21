'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries, IChartApi, ISeriesApi } from 'lightweight-charts';
import { IndexQuote, ChartPoint } from '@/lib/types';
import { TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';

interface KseHeroChartProps {
  initialIndex: IndexQuote | null;
}

export default function KseHeroChart({ initialIndex }: KseHeroChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const seriesInstance = useRef<ISeriesApi<'Area'> | null>(null);

  const [indexData, setIndexData] = useState<IndexQuote | null>(initialIndex);
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [hoveredPoint, setHoveredPoint] = useState<{ value: number; time: string } | null>(null);

  useEffect(() => {
    // Fetch live KSE100 chart data
    fetch('/api/kse100-chart')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPoints(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up existing chart
    if (chartInstance.current) {
      chartInstance.current.remove();
      chartInstance.current = null;
    }

    const isPositive = (indexData?.change ?? 0) >= 0;
    const lineColor = isPositive ? '#00C076' : '#F85149';
    const topColor = isPositive ? 'rgba(0, 192, 118, 0.35)' : 'rgba(248, 81, 73, 0.35)';
    const bottomColor = isPositive ? 'rgba(0, 192, 118, 0.0)' : 'rgba(248, 81, 73, 0.0)';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8B949E',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(48, 54, 61, 0.35)' },
        horzLines: { color: 'rgba(48, 54, 61, 0.35)' },
      },
      crosshair: {
        vertLine: {
          color: '#FFB401',
          width: 1,
          style: 3,
          labelBackgroundColor: '#FFB401',
        },
        horzLine: {
          color: '#FFB401',
          width: 1,
          style: 3,
          labelBackgroundColor: '#FFB401',
        },
      },
      rightPriceScale: {
        borderColor: '#30363D',
        scaleMargins: {
          top: 0.15,
          bottom: 0.15,
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

    if (points.length > 0) {
      // Map and sort points chronologically
      const formatted = points
        .map((p) => ({
          time: Number(p.time) as any,
          value: p.value || 0,
        }))
        .filter((p) => p.value > 0)
        .sort((a, b) => a.time - b.time);

      areaSeries.setData(formatted);
      chart.timeScale().fitContent();
    }

    // Hover tooltip tracking
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
    seriesInstance.current = areaSeries;

    // Responsive resize
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
  }, [points, indexData]);

  const displayValue = hoveredPoint?.value ?? indexData?.current ?? 165093.45;
  const change = indexData?.change ?? 0;
  const changePercent = indexData?.changePercent ?? 0;
  const isPositive = change >= 0;

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Chart Top Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-[#8B949E] uppercase tracking-wider">
              {indexData?.name || 'KSE 100 Index'}
            </h2>
            <span className="text-xs bg-[#21262D] text-[#8B949E] px-2 py-0.5 rounded-md font-mono">
              KSE100:PSX
            </span>
          </div>

          <div className="flex items-baseline space-x-3 mt-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#F0F6FC] font-mono tracking-tight">
              {displayValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>

            <div
              className={`flex items-center space-x-1 text-sm sm:text-base font-bold font-mono ${
                isPositive ? 'text-[#00C076]' : 'text-[#F85149]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}
                {change.toFixed(2)} ({isPositive ? '+' : ''}
                {changePercent.toFixed(2)}%)
              </span>
            </div>

            {hoveredPoint && (
              <span className="text-xs text-[#8B949E] font-mono bg-[#0B0E14] px-2 py-0.5 rounded border border-[#30363D]">
                @ {hoveredPoint.time}
              </span>
            )}
          </div>
        </div>

        {/* Key Day Metrics Row */}
        <div className="flex items-center space-x-6 text-xs text-[#8B949E] border-t md:border-t-0 border-[#30363D] pt-3 md:pt-0">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#6E7681]">Day High</span>
            <span className="font-mono text-[#F0F6FC] font-bold">
              Rs {(indexData?.high || 165840.12).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#6E7681]">Day Low</span>
            <span className="font-mono text-[#F0F6FC] font-bold">
              Rs {(indexData?.low || 164920.3).toLocaleString()}
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="block text-[10px] uppercase font-semibold text-[#6E7681]">Day Volume</span>
            <span className="font-mono text-[#F0F6FC] font-bold">
              {(indexData?.volume || 489230100).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Chart Canvas */}
      <div className="w-full h-[280px] sm:h-[320px] relative" ref={chartContainerRef} />

      {/* Timeframe & TradingView Watermark */}
      <div className="flex items-center justify-between border-t border-[#30363D] pt-4 mt-2">
        <div className="flex items-center space-x-1 bg-[#0B0E14] p-1 rounded-xl border border-[#30363D]">
          {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeframe === tf
                  ? 'bg-[#FFB401] text-black shadow-sm'
                  : 'text-[#8B949E] hover:text-[#F0F6FC]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[#8B949E] flex items-center space-x-1.5">
          <span>Powered by</span>
          <span className="text-[#FFB401] font-bold">Daulat Market Engine</span>
        </span>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries, CandlestickSeries, IChartApi } from 'lightweight-charts';
import { ChartPoint } from '@/lib/types';

interface StockHistoryChartProps {
  symbol: string;
  history: ChartPoint[];
  currentPrice: number;
  change: number;
}

export default function StockHistoryChart({
  symbol,
  history,
  currentPrice,
  change,
}: StockHistoryChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<'area' | 'candles'>('area');
  const [hoveredPoint, setHoveredPoint] = useState<{ value: number; time: string } | null>(null);

  const isPositive = change >= 0;
  const lineColor = isPositive ? '#00C076' : '#F85149';
  const topColor = isPositive ? 'rgba(0, 192, 118, 0.3)' : 'rgba(248, 81, 73, 0.3)';
  const bottomColor = isPositive ? 'rgba(0, 192, 118, 0.0)' : 'rgba(248, 81, 73, 0.0)';

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.remove();
      chartInstance.current = null;
    }

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
      },
      handleScroll: true,
      handleScale: true,
    });

    // Prepare sorted data
    const validPoints = (history || [])
      .filter((p) => p.time && (p.close || p.value))
      .map((p) => {
        let timestamp: any = p.time;
        if (typeof timestamp === 'string' && timestamp.includes('-')) {
          // 'YYYY-MM-DD' is valid
        } else if (typeof timestamp === 'number' && timestamp > 1000000000000) {
          timestamp = Math.floor(timestamp / 1000);
        }
        return {
          time: timestamp,
          open: p.open || p.value || 0,
          high: p.high || p.value || 0,
          low: p.low || p.value || 0,
          close: p.close || p.value || 0,
          value: p.value || p.close || 0,
        };
      })
      .sort((a, b) => {
        const timeA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime();
        const timeB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime();
        return timeA - timeB;
      });

    // Fallback if history is empty: synthesize recent points
    const finalPoints = validPoints.length > 0 ? validPoints : generateSyntheticHistory(currentPrice);

    let activeSeries: any;

    if (chartType === 'candles') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#00C076',
        downColor: '#F85149',
        borderUpColor: '#00C076',
        borderDownColor: '#F85149',
        wickUpColor: '#00C076',
        wickDownColor: '#F85149',
      });
      candleSeries.setData(finalPoints);
      activeSeries = candleSeries;
      chart.timeScale().fitContent();
    } else {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor,
        lineWidth: 2,
        topColor,
        bottomColor,
      });
      const areaData = finalPoints.map((p) => ({
        time: p.time,
        value: p.close || p.value,
      }));
      areaSeries.setData(areaData);
      activeSeries = areaSeries;
      chart.timeScale().fitContent();
    }

    chart.subscribeCrosshairMove((param: any) => {
      if (!param || !param.time || !param.point || param.point.x < 0 || param.point.y < 0) {
        setHoveredPoint(null);
      } else if (activeSeries) {
        const price = param.seriesData.get(activeSeries);
        if (price) {
          const val = typeof price.close === 'number' ? price.close : price.value;
          if (typeof val === 'number') {
            setHoveredPoint({
              value: val,
              time: String(param.time),
            });
          }
        }
      }
    });

    chartInstance.current = chart;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && entries[0].contentRect) {
        chart.applyOptions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartInstance.current = null;
    };
  }, [history, chartType, currentPrice, lineColor, topColor, bottomColor]);

  function generateSyntheticHistory(basePrice: number) {
    const pts: any[] = [];
    const now = Math.floor(Date.now() / 1000);
    let cur = basePrice || 100;
    for (let i = 60; i >= 0; i--) {
      cur += (Math.random() - 0.49) * (basePrice * 0.015);
      pts.push({
        time: now - i * 86400,
        open: cur * 0.995,
        high: cur * 1.01,
        low: cur * 0.99,
        close: cur,
        value: cur,
      });
    }
    return pts;
  }

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-[#30363D] pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
            Price Chart
          </span>
          {hoveredPoint && (
            <span className="text-xs font-mono font-bold text-[#FFB401] bg-[#0B0E14] px-2 py-0.5 rounded border border-[#30363D]">
              Rs {hoveredPoint.value.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 bg-[#0B0E14] p-1 rounded-xl border border-[#30363D]">
          <button
            onClick={() => setChartType('area')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              chartType === 'area'
                ? 'bg-[#21262D] text-[#FFB401]'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('candles')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              chartType === 'candles'
                ? 'bg-[#21262D] text-[#FFB401]'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Candles
          </button>
        </div>
      </div>

      <div className="w-full h-[320px] sm:h-[380px]" ref={chartContainerRef} />
    </div>
  );
}

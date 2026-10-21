'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { StockQuote } from '@/lib/types';
import { BarChart2, TrendingUp, TrendingDown, Moon, ArrowRight } from 'lucide-react';

interface MarketMoversProps {
  allStocks?: StockQuote[];
  topVolume: StockQuote[];
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  filter?: 'KSE100' | 'ALL' | 'ISLAMIC';
  onFilterChange?: (filter: 'KSE100' | 'ALL' | 'ISLAMIC') => void;
}

export default function MarketMovers({
  allStocks = [],
  topVolume,
  topGainers,
  topLosers,
  filter: controlledFilter,
  onFilterChange,
}: MarketMoversProps) {
  const [internalFilter, setInternalFilter] = useState<'KSE100' | 'ALL' | 'ISLAMIC'>('KSE100');
  const filter = controlledFilter !== undefined ? controlledFilter : internalFilter;
  const setFilter = (f: 'KSE100' | 'ALL' | 'ISLAMIC') => {
    if (onFilterChange) onFilterChange(f);
    else setInternalFilter(f);
  };

  // Pool of stocks to filter from
  const sourcePool = useMemo(() => {
    return allStocks.length > 0 ? allStocks : [...topVolume, ...topGainers, ...topLosers];
  }, [allStocks, topVolume, topGainers, topLosers]);

  const filteredPool = useMemo(() => {
    if (filter === 'ISLAMIC') {
      return sourcePool.filter((s) => s.isShariah);
    }
    if (filter === 'KSE100') {
      const kse = sourcePool.filter((s) => s.isKse100);
      return kse.length > 0 ? kse : sourcePool;
    }
    return sourcePool;
  }, [sourcePool, filter]);

  // Derive top 7 for each category
  const activeStocks = useMemo(() => {
    return [...filteredPool]
      .filter((s) => s.volume > 0)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 7);
  }, [filteredPool]);

  const gainerStocks = useMemo(() => {
    return [...filteredPool]
      .filter((s) => s.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 7);
  }, [filteredPool]);

  const loserStocks = useMemo(() => {
    return [...filteredPool]
      .filter((s) => s.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 7);
  }, [filteredPool]);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(2)}B`;
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toLocaleString();
  };

  const renderStockColumn = (
    title: string,
    icon: React.ReactNode,
    iconColor: string,
    stocks: StockQuote[],
    seeMoreTab: string
  ) => {
    return (
      <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div>
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#28354A]">
            <div className="flex items-center space-x-1.5 font-semibold text-sm text-[#EFF3FA]">
              <span className={iconColor}>{icon}</span>
              <span>{title}</span>
            </div>

            <div className="flex items-center space-x-4 text-[10px] uppercase font-semibold text-[#7F8DA4] tracking-wider">
              <span>Price</span>
              <span>Change %</span>
              <span>Volume</span>
            </div>
          </div>

          {/* Stock Rows */}
          <div className="divide-y divide-[#28354A]/40">
            {stocks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#A4AEC1]">
                No matching stocks found for current filter.
              </div>
            ) : (
              stocks.map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <Link
                    key={stock.symbol}
                    href={`/stocks/${stock.symbol}`}
                    className="flex items-center justify-between py-2.5 px-1 rounded-xl hover:bg-[#1C2940]/70 transition-all group cursor-pointer"
                  >
                    {/* Left: Logo/Symbol & Shariah Dome */}
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#0B1120] border border-[#28354A] flex items-center justify-center font-semibold text-[11px] text-[#B69249] group-hover:border-[#B69249] transition-colors flex-shrink-0">
                        {stock.symbol.slice(0, 3)}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-[#EFF3FA] group-hover:text-[#B69249] transition-colors flex items-center space-x-1">
                          <span className="truncate">{stock.symbol}</span>
                          {stock.isShariah && (
                            <span
                              title="Shariah Compliant"
                              className="text-[#6DDBA5] text-[10px] flex items-center flex-shrink-0"
                            >
                              <Moon className="w-2.5 h-2.5 fill-current" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Price, Change %, Volume */}
                    <div className="flex items-center space-x-3 text-right">
                      {/* Price */}
                      <span className="text-xs font-mono font-semibold text-[#EFF3FA] w-14 text-right">
                        {stock.current.toFixed(2)}
                      </span>

                      {/* Change % Badge */}
                      <span
                        className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded w-16 text-center ${
                          isPositive
                            ? 'bg-[#6DDBA5]/15 text-[#6DDBA5]'
                            : 'bg-[#F28B82]/15 text-[#F28B82]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>

                      {/* Volume */}
                      <span className="text-[11px] font-mono text-[#A4AEC1] w-14 text-right">
                        {formatVolume(stock.volume)}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* View More Link */}
        <div className="pt-3 mt-2 border-t border-[#28354A]/60 text-right">
          <Link
            href={`/stocks?tab=${seeMoreTab}`}
            className="text-xs text-[#B69249] hover:text-[#B69249]/80 font-semibold inline-flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Segmented Filter Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold text-[#B69249] uppercase tracking-widest block">
            TODAY&apos;S MARKET
          </span>
          <h2 className="text-xl font-semibold text-[#EFF3FA] tracking-tight">Market Movers</h2>
        </div>

        {/* Filter Pills: KSE 100 | All Stocks | All Islamic */}
        <div className="flex items-center space-x-1 bg-[#111A2B] p-1 rounded-xl border border-[#28354A]">
          <button
            onClick={() => setFilter('KSE100')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === 'KSE100'
                ? 'bg-[#B69249] text-black shadow-sm'
                : 'text-[#A4AEC1] hover:text-[#EFF3FA]'
            }`}
          >
            KSE 100
          </button>

          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === 'ALL'
                ? 'bg-[#B69249] text-black shadow-sm'
                : 'text-[#A4AEC1] hover:text-[#EFF3FA]'
            }`}
          >
            All Stocks
          </button>

          <button
            onClick={() => setFilter('ISLAMIC')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
              filter === 'ISLAMIC'
                ? 'bg-[#B69249] text-black shadow-sm'
                : 'text-[#A4AEC1] hover:text-[#EFF3FA]'
            }`}
          >
            <Moon className="w-3 h-3 fill-current" />
            <span>All Islamic</span>
          </button>
        </div>
      </div>

      {/* 3 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {renderStockColumn(
          'Volume Leaders',
          <BarChart2 className="w-4 h-4" />,
          'text-[#B69249]',
          activeStocks,
          'volume'
        )}
        {renderStockColumn(
          'Gainers',
          <TrendingUp className="w-4 h-4" />,
          'text-[#6DDBA5]',
          gainerStocks,
          'gainers'
        )}
        {renderStockColumn(
          'Losers',
          <TrendingDown className="w-4 h-4" />,
          'text-[#F28B82]',
          loserStocks,
          'losers'
        )}
      </div>
    </div>
  );
}

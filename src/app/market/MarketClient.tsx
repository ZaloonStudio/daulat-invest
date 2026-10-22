'use client';
import {useState} from 'react';
import dynamic from 'next/dynamic';
import type {MarketSummary,StockQuote} from '@/lib/types';
import IndicesBar from '@/components/IndicesBar';
import IndexPerformanceTable from '@/components/IndexPerformanceTable';
import MarketMovers from '@/components/MarketMovers';
import SectorsGrid from '@/components/SectorsGrid';
const KseHeroSection=dynamic(()=>import('@/components/KseHeroSection'),{loading:()=> <div className="h-[440px] rounded-xl bg-[#111A2B] animate-pulse" aria-label="Loading market chart"/>});
export default function MarketClient({summary,quotes}:{summary:MarketSummary;quotes:StockQuote[]}){
 const [selected,setSelected]=useState('KSE100'),[filter,setFilter]=useState<'KSE100'|'ALL'|'ISLAMIC'>('KSE100');
 const select=(code:string)=>{setSelected(code);document.getElementById('market-chart')?.scrollIntoView({behavior:'smooth',block:'start'});};
 return <div className="space-y-8"><section id="market-chart" className="space-y-4 scroll-mt-40"><IndicesBar indices={summary.indices} selectedIndex={selected} onSelectIndex={setSelected}/><KseHeroSection initialIndex={summary.kse100} allIndices={summary.indices} selectedIndexCode={selected} isPsxOpen={summary.isOpen} marketTime={summary.marketTime}/></section><section id="movers-section"><MarketMovers allStocks={quotes} topVolume={summary.topVolume} topGainers={summary.topGainers} topLosers={summary.topLosers} filter={filter} onFilterChange={setFilter}/></section><section id="all-indices"><IndexPerformanceTable indices={summary.indices} onSelectIndex={select}/></section><section id="sectors-section"><SectorsGrid quotes={quotes}/></section></div>;
}

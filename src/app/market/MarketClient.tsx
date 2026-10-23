'use client';
import {useEffect,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import dynamic from 'next/dynamic';
import type {MarketSummary,StockQuote} from '@/lib/types';
import {indexCompanies,indexCompaniesPath} from '@/lib/index-members';
import IndexCompanies from '@/components/IndexCompanies';
import IndicesBar from '@/components/IndicesBar';
import IndexPerformanceTable from '@/components/IndexPerformanceTable';
import MarketMovers from '@/components/MarketMovers';
import SectorsGrid from '@/components/SectorsGrid';
const KseHeroSection=dynamic(()=>import('@/components/KseHeroSection'),{loading:()=> <div className="h-[440px] rounded-xl bg-[#111A2B] animate-pulse" aria-label="Loading market chart"/>});
export default function MarketClient({summary,quotes,initialIndex='KSE100',initialView='chart'}:{summary:MarketSummary;quotes:StockQuote[];initialIndex?:string;initialView?:'chart'|'companies'}){
 const [selected,setSelected]=useState(initialIndex),[view,setView]=useState<'chart'|'companies'>(initialView),[filter,setFilter]=useState<'KSE100'|'ALL'|'ISLAMIC'>('KSE100');
 const searchParams=useSearchParams();
 useEffect(()=>{const code=searchParams.get('index');setSelected(summary.indices.some(i=>i.code===code)?code!:initialIndex);setView(searchParams.get('view')==='chart'?'chart':code?'companies':initialView);},[searchParams,summary.indices,initialIndex,initialView]);
 const members=useMemo(()=>indexCompanies(quotes,selected),[quotes,selected]);
 const updateUrl=(code:string,next:'chart'|'companies')=>{window.history.replaceState(null,'',next==='companies'?indexCompaniesPath(code):'/market?index='+encodeURIComponent(code)+'&view=chart');};
 const select=(code:string,scroll=false)=>{setSelected(code);setView('companies');updateUrl(code,'companies');if(scroll)document.getElementById('market-chart')?.scrollIntoView({behavior:'smooth',block:'start'});};
 const changeView=(next:'chart'|'companies')=>{setView(next);updateUrl(selected,next);};
 return <div className="space-y-8"><section id="market-chart" className="space-y-4 scroll-mt-40"><IndicesBar indices={summary.indices} selectedIndex={selected} onSelectIndex={code=>select(code)}/><div role="group" aria-label="Index view" className="inline-flex gap-1 p-1 border border-[#28354A] bg-[#111A2B] rounded-xl">{(['companies','chart'] as const).map(next=><button key={next} aria-pressed={view===next} onClick={()=>changeView(next)} className={'px-4 py-2.5 rounded-lg text-sm font-semibold '+(view===next?'bg-[#B69249] text-black':'text-[#A4AEC1] hover:text-[#EFF3FA]')}>{next==='companies'?'Companies ('+members.length+')':'Chart'}</button>)}</div>{view==='companies'?<IndexCompanies key={selected} code={selected} companies={members} asOf={summary.marketTime}/>:<KseHeroSection initialIndex={summary.kse100} allIndices={summary.indices} selectedIndexCode={selected} isPsxOpen={summary.isOpen} marketTime={summary.marketTime}/>}</section><section id="movers-section"><MarketMovers allStocks={quotes} topVolume={summary.topVolume} topGainers={summary.topGainers} topLosers={summary.topLosers} filter={filter} onFilterChange={setFilter}/></section><section id="all-indices"><IndexPerformanceTable indices={summary.indices} onSelectIndex={code=>select(code,true)}/></section><section id="sectors-section"><SectorsGrid quotes={quotes}/></section></div>;
}

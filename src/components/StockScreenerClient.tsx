'use client';

import React,{useMemo,useState,useEffect} from 'react';
import Link from 'next/link';
import {Search,Download,RotateCcw,TrendingUp,TrendingDown,Moon,Sparkles,ArrowUpDown,ChevronRight,Plus,X} from 'lucide-react';
import type {StockQuote} from '@/lib/types';
import {SCREENER_METRICS,defaultRanges,rangeError,screenQuotes,metricValue,screenerCSV,type MetricKey,type RangeFilter,type ScreenerSort} from '@/lib/screener';
import {RESEARCH_METRICS,SCREENER_RESEARCH_SOURCE,type ScreenerResearch} from '@/lib/screener-research-data';

const inputClass='w-full min-w-0 bg-[#0B1120] border border-[#28354A] rounded-lg px-3 py-2 text-xs text-[#EFF3FA] focus:outline-none focus:border-[#B69249]';
const strategies=[['bluechips','Blue chips · Top 20'],['shariah','KMI members'],['dividend','Dividend yield ≥8%'],['value','P/E ≤7'],['volume','Volume ≥2M'],['gainers','Top gainers']] as const;
const display=(q:import('@/lib/screener').ScreenerQuote,key:MetricKey)=>{const n=metricValue(q,key);return n===undefined?'—':n.toLocaleString('en-US',{minimumFractionDigits:key==='volume'?0:2,maximumFractionDigits:key==='volume'?0:2})+(SCREENER_METRICS.find(m=>m.key===key)?.unit==='×'?'×':SCREENER_METRICS.find(m=>m.key===key)?.unit==='%'?'%':'');};

export default function StockScreenerClient({initialQuotes,sectors}:{initialQuotes:StockQuote[];sectors:string[]}) {
 const [search,setSearch]=useState(''),[sector,setSector]=useState('ALL'),[shariahOnly,setShariahOnly]=useState(false);
 const [ranges,setRanges]=useState<RangeFilter[]>(defaultRanges),[addMetric,setAddMetric]=useState('');
 const [activePreset,setActivePreset]=useState<string|null>(null);
 const [sort,setSort]=useState<ScreenerSort>('volume'),[order,setOrder]=useState<'asc'|'desc'>('desc');
 const [research,setResearch]=useState<ScreenerResearch|null>(null),[researchState,setResearchState]=useState<'idle'|'loading'|'ready'|'error'>('idle'),[retry,setRetry]=useState(0);
 const advanced=ranges.some(r=>RESEARCH_METRICS.some(m=>m.key===r.key))||RESEARCH_METRICS.some(m=>m.key===sort);
 useEffect(()=>{
  if(!advanced||researchState==='ready')return;
  const controller=new AbortController();setResearchState('loading');
  fetch('/api/screener-fundamentals',{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('unavailable');const d=await r.json() as ScreenerResearch;if(!Array.isArray(d.rows)||!d.rows.length)throw new Error('empty');setResearch(d);setResearchState('ready');}).catch(()=>{if(!controller.signal.aborted)setResearchState('error');});
  return()=>controller.abort();
  // Fetch only when advanced criteria are requested, then reuse the same snapshot.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[advanced,retry]);
 const quotes=useMemo(()=>{const map=new Map(research?.rows.map(r=>[r.symbol,r])??[]);return initialQuotes.map(q=>({...q,research:map.get(q.symbol)}));},[initialQuotes,research]);
 const selectedUnavailable=research?.unavailable?.some(key=>ranges.some(r=>r.key===key)||sort===key)??false;
 const loadFailed=researchState==='error'||selectedUnavailable;
 const waiting=advanced&&(researchState!=='ready'||selectedUnavailable);
 const filtered=useMemo(()=>waiting?[]:screenQuotes(quotes,{search,sector,shariahOnly,ranges,bluechips:activePreset==='bluechips',sort,order}),[quotes,search,sector,shariahOnly,ranges,activePreset,sort,order,waiting]);
 const remaining=SCREENER_METRICS.filter(m=>!ranges.some(r=>r.key===m.key));
 const hasErrors=ranges.some(r=>rangeError(r));
 const extraMetrics=ranges.filter(r=>r.key==='changeYear'||RESEARCH_METRICS.some(m=>m.key===r.key)).map(r=>SCREENER_METRICS.find(m=>m.key===r.key)!);
 const custom=()=>{if(activePreset!=='bluechips')setActivePreset(null);};
 const reset=()=>{setSearch('');setSector('ALL');setShariahOnly(false);setRanges(defaultRanges());setActivePreset(null);setAddMetric('');setSort('volume');setOrder('desc');};
 const applyPreset=(preset:string)=>{
  reset();if(activePreset===preset)return;
  setActivePreset(preset);setRanges([]);
  if(preset==='bluechips')setSort('marketCap');
  if(preset==='shariah')setShariahOnly(true);
  if(preset==='dividend'){setRanges([{key:'dividendYield',min:'8',max:''}]);setSort('dividendYield');}
  if(preset==='value'){setRanges([{key:'peRatio',min:'',max:'7'}]);setSort('peRatio');setOrder('asc');}
  if(preset==='volume')setRanges([{key:'volume',min:'2000000',max:''}]);
  if(preset==='gainers'){setRanges([{key:'changePercent',min:'0.01',max:''}]);setSort('changePercent');}
 };
 const updateRange=(key:MetricKey,bound:'min'|'max',value:string)=>{custom();setRanges(rs=>rs.map(r=>r.key===key?{...r,[bound]:value}:r));};
 const exportCSV=()=>{
  const url=URL.createObjectURL(new Blob(['\uFEFF'+screenerCSV(filtered)],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a');a.href=url;a.download='Daulat_PSX_Screener_'+new Date().toISOString().slice(0,10)+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const sortButton=(field:ScreenerSort,label:string)=><button onClick={()=>{setSort(field);setOrder(sort===field&&order==='desc'?'asc':'desc');}} className="inline-flex items-center gap-1 hover:text-[#EFF3FA]" aria-label={'Sort by '+label}><span>{label}</span><ArrowUpDown size={12}/></button>;
 const th=(field:ScreenerSort,label:string,left=false)=><th className={'px-4 py-3 whitespace-nowrap '+(left?'text-left':'text-right')} aria-sort={sort===field?(order==='asc'?'ascending':'descending'):'none'}>{sortButton(field,label)}</th>;
 return <div className="space-y-5">
  <section aria-label="Quick filters" className="bg-[#111A2B] border border-[#28354A] rounded-xl p-4">
   <div className="flex items-center gap-2 text-xs font-semibold mb-3"><Sparkles size={16} className="text-[#B69249]"/>Start with a strategy</div>
   <div className="flex flex-wrap gap-2">{strategies.map(([key,label])=><button key={key} onClick={()=>applyPreset(key)} aria-pressed={activePreset===key} className={'px-3 py-2 rounded-lg text-xs border transition-colors '+(activePreset===key?'bg-[#B69249] text-black border-[#B69249]':'bg-[#0B1120] border-[#28354A] text-[#A4AEC1] hover:text-[#EFF3FA]')}>{label}</button>)}</div>
   {activePreset==='bluechips'&&<p className="mt-3 text-xs text-[#A4AEC1]">20 largest KSE-100 companies by reported market cap. Your filters narrow this shortlist.</p>}
  </section>
  <section aria-label="Custom screener filters" className="bg-[#111A2B] border border-[#28354A] rounded-xl p-4 sm:p-5 space-y-4">
   <div className="flex flex-wrap gap-3 items-center">
    <div className="relative flex-1 min-w-[220px]"><Search size={15} className="absolute left-3 top-2.5 text-[#A4AEC1]"/><input aria-label="Search screener companies" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search symbol or company…" className={inputClass+' pl-9'}/></div>
    <select aria-label="Sector" value={sector} onChange={e=>setSector(e.target.value)} className={inputClass+' sm:!w-56'}><option value="ALL">All sectors ({sectors.length})</option>{sectors.map(s=><option key={s}>{s}</option>)}</select>
    <button aria-pressed={shariahOnly} onClick={()=>{custom();setShariahOnly(!shariahOnly);}} className={'inline-flex items-center gap-2 border rounded-lg px-3 py-2 text-xs '+(shariahOnly?'text-[#6DDBA5] border-[#6DDBA5]':'text-[#A4AEC1] border-[#28354A]')}><Moon size={14}/>KMI members only</button>
    <button onClick={exportCSV} disabled={hasErrors||!filtered.length} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-[#1C2940] disabled:opacity-40"><Download size={14} className="text-[#B69249]"/>CSV</button>
    <button onClick={reset} aria-label="Reset all filters" title="Reset all filters" className="text-[#A4AEC1] p-2 hover:text-[#B69249]"><RotateCcw size={16}/></button>
   </div>
   <div className="border-t border-[#28354A] pt-4">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
     <h2 className="text-sm font-semibold">Your filters <span className="text-[#A4AEC1] font-normal">({ranges.length})</span></h2>
     {remaining.length>0&&<div className="flex items-center gap-2"><Plus size={15} className="text-[#B69249]"/><select aria-label="Add filter" value={addMetric} onChange={e=>{const key=e.target.value as MetricKey;if(!key)return;custom();setRanges(rs=>[...rs,{key,min:'',max:''}]);setAddMetric('');}} className={inputClass+' !w-auto'}><option value="">Add filter…</option><optgroup label="Market data · PSX">{remaining.filter(m=>!RESEARCH_METRICS.some(r=>r.key===m.key)).map(m=><option key={m.key} value={m.key}>{m.label} ({m.unit})</option>)}</optgroup><optgroup label="Fundamentals · SCSTrade">{remaining.filter(m=>RESEARCH_METRICS.some(r=>r.key===m.key)).map(m=><option key={m.key} value={m.key}>{m.label} ({m.unit})</option>)}</optgroup></select></div>}
    </div>
    {ranges.length===0?<p className="text-xs text-[#A4AEC1]">Add a filter and enter your own limits.</p>:<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{ranges.map(r=>{const spec=SCREENER_METRICS.find(m=>m.key===r.key)!;const error=rangeError(r);return <fieldset key={r.key} className="min-w-0 border border-[#28354A] rounded-xl p-3">
     <legend className="sr-only">{spec.label}</legend>
     <div className="flex justify-between items-center mb-2 gap-2"><span className="text-xs font-medium">{spec.label} <span className="text-[#A4AEC1] font-normal">({spec.unit})</span></span><button aria-label={'Remove '+spec.label+' filter'} onClick={()=>{custom();setRanges(rs=>rs.filter(f=>f.key!==r.key));}} className="text-[#A4AEC1] hover:text-[#F28B82] p-1"><X size={14}/></button></div>
     <div className="flex items-center gap-2">{(['min','max'] as const).map(bound=><label key={bound} className="min-w-0 flex-1"><span className="block text-[10px] text-[#A4AEC1] mb-1">{bound==='min'?'Min':'Max'}</span><input aria-label={spec.label+' '+bound} type="number" step={r.key==='volume'?'1':'any'} min={'min' in spec?spec.min:undefined} inputMode="decimal" placeholder="Any" value={r[bound]} onChange={e=>updateRange(r.key,bound,e.target.value)} aria-invalid={!!error} aria-describedby={error?'filter-error-'+r.key:undefined} className={inputClass}/></label>)}</div>
     {error&&<p role="alert" id={'filter-error-'+r.key} className="text-xs text-[#F28B82] mt-2">{error}</p>}
    </fieldset>;})}</div>}
   </div>
   {advanced&&<div className="text-xs text-[#A4AEC1] flex flex-wrap items-center gap-2"><a href={SCREENER_RESEARCH_SOURCE} target="_blank" rel="noopener noreferrer" className="text-[#B69249]">Fundamentals: SCSTrade ↗</a><span>Source ratios; financial periods vary. Expected figures are estimates.</span>{researchState==='ready'&&<span>{research?.rows.filter(r=>initialQuotes.some(q=>q.symbol===r.symbol)).length} companies covered{research?.complete?'':' · Partial source response'}</span>}{loadFailed&&<button onClick={()=>{setResearchState('idle');setRetry(n=>n+1);}} className="text-[#B69249] underline">Retry loading</button>}</div>}
  </section>
  <div className="flex flex-wrap justify-between gap-2 text-xs text-[#A4AEC1]"><p role="status" aria-live="polite">{waiting?(loadFailed?'Detailed fundamentals unavailable. Retry loading or remove these filters.':'Loading detailed fundamentals…'):<>Showing <strong className="text-[#EFF3FA]">{filtered.length}</strong> companies</>}</p><p>Missing values are shown as — and excluded when filtered.</p></div>
  <div className="border border-[#28354A] rounded-xl overflow-hidden bg-[#111A2B]"><div className="overflow-x-auto"><table className="w-full text-xs text-left">
   <thead className="bg-[#0B1120] text-[#A4AEC1] text-[10px] uppercase border-b border-[#28354A]"><tr>{th('symbol','Symbol / Company',true)}<th className="px-4 py-3">Sector</th>{th('current','Price (PKR)')}{extraMetrics.map(m=><React.Fragment key={m.key}>{th(m.key,m.label)}</React.Fragment>)}{th('changePercent','Day change')}{th('volume','Volume')}{th('peRatio','P/E')}{th('dividendYield','Div yield')}{th('marketCap','Mkt cap (B)')}<th className="px-4 py-3">Action</th></tr></thead>
   <tbody className="divide-y divide-[#28354A]">{!filtered.length?<tr><td colSpan={9+extraMetrics.length} className="text-center py-12 text-[#A4AEC1]">{waiting?(loadFailed?'Detailed fundamentals could not be loaded.':'Loading detailed fundamentals…'):hasErrors?'Correct the filter limits above to see results.':'No companies match. Adjust or remove a filter.'}</td></tr>:filtered.map(q=><tr key={q.symbol} className="hover:bg-[#1C2940]/60">
    <td className="px-4 py-3"><div className="flex gap-2 items-center"><Link href={'/stocks/'+q.symbol} className="font-semibold hover:text-[#B69249]">{q.symbol}</Link>{q.isShariah===true&&<span title="Listed in KMI30 or KMIALLSHR by PSX" className="text-[9px] rounded px-1.5 py-0.5 text-[#6DDBA5] bg-[#6DDBA5]/10">KMI</span>}</div><p className="text-[11px] text-[#A4AEC1] truncate max-w-[190px] mt-1">{q.name}</p></td>
    <td className="px-4 py-3 text-[#A4AEC1] max-w-[140px] truncate" title={q.sector}>{q.sector||'—'}</td>
    <td className="px-4 py-3 text-right font-mono whitespace-nowrap">{display(q,'current')}</td>{extraMetrics.map(m=><td key={m.key} title={q.research?.basis} className="px-4 py-3 text-right font-mono whitespace-nowrap">{display(q,m.key)}</td>)}
    <td className={'px-4 py-3 text-right font-mono '+(q.change>=0?'text-[#6DDBA5]':'text-[#F28B82]')}><span className="inline-flex items-center gap-1">{q.change>=0?<TrendingUp size={12}/>:<TrendingDown size={12}/>} {display(q,'changePercent')}</span></td>
    <td className="px-4 py-3 text-right font-mono">{display(q,'volume')}</td>
    <td className="px-4 py-3 text-right font-mono text-[#B69249]">{display(q,'peRatio')}</td>
    <td className="px-4 py-3 text-right font-mono">{display(q,'dividendYield')}</td>
    <td className="px-4 py-3 text-right font-mono text-[#A4AEC1]">{display(q,'marketCap')}</td>
    
    <td className="px-4 py-3"><Link href={'/stocks/'+q.symbol} className="inline-flex items-center text-[#B69249] text-[11px]">Analyze<ChevronRight size={12}/></Link></td>
   </tr>)}</tbody>
  </table></div></div>
 </div>;
}

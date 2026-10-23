'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {Search,ArrowUpRight} from 'lucide-react';
import type {StockQuote} from '@/lib/types';
import {EXPECTED_INDEX_MEMBERS} from '@/lib/index-members';
export default function IndexCompanies({code,companies,asOf}:{code:string;companies:StockQuote[];asOf:string}){
 const [search,setSearch]=useState(''),[sort,setSort]=useState('symbol');
 const visible=useMemo(()=>companies.filter(q=>!search.trim()||[q.symbol,q.name].some(s=>s.toLowerCase().includes(search.trim().toLowerCase()))).sort((a,b)=>{
  if(sort==='symbol')return a.symbol.localeCompare(b.symbol);
  const key=sort==='price'?'current':sort==='volume'?'volume':'changePercent';
  const av=key!=='current'&&a.sessionAvailable===false?undefined:a[key],bv=key!=='current'&&b.sessionAvailable===false?undefined:b[key];
  if(av===undefined)return bv===undefined?a.symbol.localeCompare(b.symbol):1;if(bv===undefined)return -1;
  return (sort==='losers'?av-bv:bv-av)||a.symbol.localeCompare(b.symbol);
 }),[companies,search,sort]);
 const number=(n:number)=>Number.isFinite(n)?n.toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
 const stamp=asOf&&Number.isFinite(Date.parse(asOf))?new Date(asOf).toLocaleString('en-GB',{timeZone:'Asia/Karachi'}):null;
 const expected=EXPECTED_INDEX_MEMBERS[code];
 return <section aria-label={code+' companies'} className="rounded-xl border border-[#28354A] bg-[#111A2B] p-4 sm:p-6 space-y-5">
  <div className="flex flex-wrap justify-between items-start gap-3"><div><h2 className="text-xl sm:text-2xl font-semibold">{code} companies <span className="text-sm text-[#B69249] font-mono ml-2">{companies.length}</span></h2><p className="text-xs text-[#A4AEC1] mt-2">PSX index membership{stamp?' · '+stamp+' PKT':''}</p></div><a href="https://dps.psx.com.pk/screener" target="_blank" rel="noopener noreferrer" className="text-xs text-[#B69249]">PSX source ↗</a></div>
  {expected&&companies.length>0&&companies.length!==expected&&<p role="status" className="text-xs text-[#A4AEC1]">The current feed returned {companies.length} of {expected} expected members.</p>}
  <div className="flex flex-col sm:flex-row gap-3"><label className="relative flex-1"><Search aria-hidden="true" className="absolute left-3 top-3.5 w-4 h-4 text-[#A4AEC1]"/><input aria-label={'Search '+code+' companies'} type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search company or symbol" className="w-full pl-10 pr-3 py-3 rounded-lg border border-[#28354A] bg-[#0B1120] text-sm"/></label><select aria-label="Sort index companies" value={sort} onChange={e=>setSort(e.target.value)} className="bg-[#0B1120] border border-[#28354A] rounded-lg p-3 text-sm"><option value="symbol">Symbol · A–Z</option><option value="price">Price · high to low</option><option value="gainers">Day change · high to low</option><option value="losers">Day change · low to high</option><option value="volume">Volume · high to low</option></select></div>
  <p aria-live="polite" className="text-xs text-[#A4AEC1]">Showing {visible.length} of {companies.length} companies</p>
  {companies.length===0?<p role="status" className="text-sm text-[#A4AEC1] py-8">Company membership is unavailable in the current PSX feed.</p>:visible.length===0?<p role="status" className="text-sm text-[#A4AEC1] py-8">No matching companies.</p>:<div className="overflow-x-auto rounded-lg border border-[#28354A]" role="region" aria-label={code+' constituent prices'} tabIndex={0}><table className="w-full text-left text-sm min-w-[620px]"><caption className="sr-only">{code} constituent companies and latest PSX prices</caption><thead className="text-xs text-[#A4AEC1] bg-[#0B1120]"><tr><th scope="col" className="p-4">Company</th><th scope="col" className="p-4">Sector</th><th scope="col" className="p-4 text-right">Price · PKR</th><th scope="col" className="p-4 text-right">Day change</th><th scope="col" className="p-4 text-right">Volume</th></tr></thead><tbody>{visible.map(q=><tr key={q.symbol} className="border-t border-[#28354A] hover:bg-[#1C2940]/40"><th scope="row" className="p-4 font-normal"><Link href={'/stocks/'+encodeURIComponent(q.symbol)} className="group block"><span className="font-semibold text-[#EFF3FA] group-hover:text-[#B69249] inline-flex items-center gap-2">{q.symbol}<ArrowUpRight aria-hidden="true" className="w-3 h-3 text-[#B69249]"/></span><span className="block text-xs text-[#A4AEC1] mt-1 max-w-60">{q.name}</span></Link></th><td className="p-4 text-xs text-[#A4AEC1]">{q.sector}</td><td className="p-4 text-right font-mono whitespace-nowrap">{q.current>0?number(q.current):'—'}</td><td className={'p-4 text-right font-mono whitespace-nowrap '+(q.changePercent>=0?'text-[#6DDBA5]':'text-[#F28B82]')}>{q.sessionAvailable===false?'—':(q.changePercent>=0?'+':'')+number(q.changePercent)+'%'}</td><td className="p-4 text-right font-mono whitespace-nowrap">{q.sessionAvailable===false?'—':q.volume.toLocaleString('en-PK')}</td></tr>)}</tbody></table></div>}
 </section>;
}

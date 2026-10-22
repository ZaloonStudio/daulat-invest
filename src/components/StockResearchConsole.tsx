 'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {StockQuote} from '@/lib/types';
type Section = 'ratios'|'peers'|'dividends'|'shariah';
export default function StockResearchConsole({stock,peers,section}:{stock:StockQuote;peers:StockQuote[];section?:Section}) {
 const [tab,setTab]=useState<Section>('ratios');const active=section??tab;
 const source='https://dps.psx.com.pk/company/'+encodeURIComponent(stock.symbol);
 const num=(v:number|undefined,suffix='')=>v===undefined?'—':v.toLocaleString('en-US',{maximumFractionDigits:2})+suffix;
 const items=[['P/E (TTM)',num(stock.peRatio,'x')],['Dividend yield',num(stock.dividendYield,'%')],['Market cap (PKR)',num(stock.marketCap)],['Free float (shares)',num(stock.freeFloat)],['1-year price change',num(stock.changeYear,'%')],['30-day average volume',num(stock.averageVolume30D)]];
 return <section className="rounded-2xl border border-[#28354A] bg-[#111A2B] p-6 space-y-5">
  {!section&&<div className="flex flex-wrap gap-3">{(['ratios','peers','dividends','shariah'] as Section[]).map(t=><button key={t} onClick={()=>setTab(t)} className={active===t?'text-[#B69249]':'text-[#A4AEC1]'}>{t}</button>)}</div>}
  {active==='ratios'&&<><h2 className="text-lg font-semibold">Reported market metrics</h2><dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">{items.map(([label,value])=><div key={label} className="rounded-xl bg-[#0B1120] p-4"><dt className="text-xs text-[#A4AEC1]">{label}</dt><dd className="text-lg mt-2 font-mono">{value}</dd></div>)}</dl><p className="text-xs text-[#A4AEC1]">PSX screener metrics. Unreported figures are shown as —.</p></>}
  {active==='peers'&&<><h2 className="text-lg font-semibold">Sector peers</h2><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-[#A4AEC1]"><tr>{['Stock','Price (PKR)','Session %','P/E','Yield'].map(t=><th className="p-3" key={t}>{t}</th>)}</tr></thead><tbody>{[stock,...peers].map(p=><tr key={p.symbol} className="border-t border-[#28354A]"><td className="p-3"><Link href={'/stocks/'+p.symbol} className="text-[#B69249]">{p.symbol}</Link></td><td>{num(p.current)}</td><td>{num(p.changePercent,'%')}</td><td>{num(p.peRatio,'x')}</td><td>{num(p.dividendYield,'%')}</td></tr>)}</tbody></table></div><Link href={'/stocks/compare?base='+stock.symbol} className="text-[#B69249] text-sm">Open comparison →</Link></>}
  {active==='dividends'&&<><h2 className="text-lg font-semibold">Dividends</h2><p className="text-sm">Reported yield: <span className="text-[#B69249]">{num(stock.dividendYield,'%')}</span></p><p className="text-sm text-[#A4AEC1]">Verified payout history is not available in this feed.</p><a href={source+'#payouts'} target="_blank" rel="noopener noreferrer" className="text-[#B69249] text-sm">View PSX payouts and filings ↗</a></>}
  {active==='shariah'&&<><h2 className="text-lg font-semibold">KMI index membership</h2><p className="text-sm text-[#A4AEC1]">{stock.isShariah?'Included in KMI30 or KMI All Share in the PSX feed.':'No KMI30 or KMI All Share membership reported in this feed.'}</p><a href={source} target="_blank" rel="noopener noreferrer" className="text-[#B69249] text-sm">View official PSX company information ↗</a></>}
 </section>;
}

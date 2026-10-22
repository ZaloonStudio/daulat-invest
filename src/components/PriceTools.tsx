'use client';

import { useId, useMemo, useState } from 'react';
import type { GoldHistory } from '@/lib/commodity-feed';
import { formatAsOf, formatPrice, goldPkr, PriceKey, PriceSnapshot, TOLA_GRAMS } from '@/lib/commodity-data';

const RANGES = [{label:'1D',days:1},{label:'1W',days:7},{label:'1M',days:30},{label:'1Y',days:365}] as const;
export default function PriceTools({kind, prices, history}: {kind:PriceKey;prices:PriceSnapshot;history?:GoldHistory}) {
  const id = useId();
  const [quantity,setQuantity] = useState('1');
  const [grams,setGrams] = useState(TOLA_GRAMS);
  const [purity,setPurity] = useState(24);
  const [range,setRange] = useState(history?.intraday.length ? '1D' : '1M');
  const [hover,setHover] = useState<number|null>(null);
  const metal = kind === 'gold' || kind === 'silver';
  const currency = kind === 'brent' ? 'USD' : 'PKR';
  const value = prices[kind].value;
  const perUnit = value === null ? null : value * (metal ? grams : 1) * (kind === 'gold' ? purity/24 : 1);
  const amount = quantity.trim() === '' ? NaN : Number(quantity);
  const total = perUnit !== null && Number.isFinite(amount) && amount >= 0 && Number.isFinite(amount*perUnit) ? amount * perUnit : null;
  const series = useMemo(() => {
    const raw = range === '1D' ? history?.intraday : history?.daily;
    const fx = prices.usd.value;
    if (!raw?.length || !fx) return [];
    const cutoff = raw[raw.length-1].time - (RANGES.find(r=>r.label===range)?.days ?? 30)*86400;
    return raw.filter(p=>p.time>=cutoff).map(p=>({time:p.time,value:goldPkr(p.value,fx,grams,purity)!}));
  },[range,history,prices.usd.value,grams,purity]);
  const values = series.map(p=>p.value);
  const min = values.length ? Math.min(...values) : 0, max = values.length ? Math.max(...values) : 0;
  const span = max-min || Math.max(max*.01,1);
  const first = series[0], last = series[series.length-1];
  const selected = series[hover ?? series.length-1];
  const x = (t:number) => 45 + (t-(first?.time??0))/Math.max(1,(last?.time??1)-(first?.time??0))*850;
  const y = (v:number) => 220-(v-min)/span*170;
  const line = series.map((p,i)=>`${i?'L':'M'}${x(p.time).toFixed(2)},${y(p.value).toFixed(2)}`).join(' ');
  return <div className="space-y-6">
    <section className="bg-[#111A2B] border border-[#28354A] rounded-2xl p-5 sm:p-7" aria-labelledby={`${id}-calculator`}>
      <p className="eyebrow mb-3">PLAN WITH CONTEXT</p>
      <h2 id={`${id}-calculator`} className="text-xl font-semibold mb-5">{metal ? 'Metal value calculator' : kind === 'petrol' ? 'Fuel cost calculator' : kind === 'usd' ? 'Dollar to rupee calculator' : 'Barrel value calculator'}</h2>
      <div className="grid sm:grid-cols-3 gap-4 items-end">
        <label className="text-sm text-[#A4AEC1]">{metal?'Quantity':kind==='petrol'?'Litres':kind==='usd'?'US dollars':'Barrels'}
          <input type="number" min="0" step="any" value={quantity} onChange={e=>setQuantity(e.target.value)} className="block w-full mt-2 p-3 rounded-lg bg-[#0B1120] border border-[#28354A] text-[#EFF3FA]" />
        </label>
        {metal && <label className="text-sm text-[#A4AEC1]">Weight unit<select value={grams} onChange={e=>{setGrams(Number(e.target.value));setHover(null);}} className="block w-full mt-2 p-3 rounded-lg bg-[#0B1120] border border-[#28354A] text-[#EFF3FA]"><option value={TOLA_GRAMS}>Tola (11.6638 g)</option><option value={10}>10 grams</option><option value={1}>Gram</option></select></label>}
        {kind==='gold' && <label className="text-sm text-[#A4AEC1]">Purity<select value={purity} onChange={e=>setPurity(Number(e.target.value))} className="block w-full mt-2 p-3 rounded-lg bg-[#0B1120] border border-[#28354A] text-[#EFF3FA]"><option value={24}>24K</option><option value={22}>22K</option></select></label>}
      </div>
      <output aria-live="polite" className="block text-3xl font-mono font-semibold text-[#B69249] mt-6">{formatPrice(total,currency)}</output>
      <p className="text-xs text-[#A4AEC1] mt-2">{value === null ? 'The price feed is unavailable. Please try again later.' : !Number.isFinite(amount) || amount < 0 ? 'Enter a valid, non-negative quantity.' : metal ? 'Indicative metal value. Excludes making charges, taxes and dealer spreads.' : 'Estimate using the displayed reference rate; check the final quoted price.'}</p>
    </section>
    {kind==='gold' && history && <section className="bg-[#111A2B] border border-[#28354A] rounded-2xl p-5 sm:p-7" aria-labelledby={`${id}-chart`}>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
        <div><p className="eyebrow mb-2">GOLD / PKR ESTIMATE</p><h2 id={`${id}-chart`} className="text-xl font-semibold">Gold price chart</h2></div>
        <div role="group" aria-label="Chart period" className="flex gap-1">{RANGES.map(r=><button key={r.label} aria-pressed={range===r.label} onClick={()=>{setRange(r.label);setHover(null);}} className={`px-3 py-2 rounded-lg text-sm ${range===r.label?'bg-[#B69249] text-black':'text-[#A4AEC1] border border-[#28354A]'}`}>{r.label}</button>)}</div>
      </div>
      <p className="text-sm text-[#A4AEC1]">{range==='1D'?'Recorded spot samples':'Daily gold futures benchmark'} · {purity}K · {grams===TOLA_GRAMS?'per tola':grams===10?'per 10 grams':'per gram'}</p>
      <p className="text-xs text-[#A4AEC1] mt-2">Converted at a fixed {formatPrice(prices.usd.value)} per USD. Historical FX changes and local Sarafa premiums are not included.</p>
      {series.length>=2 ? <>
        <div className="flex flex-wrap justify-between gap-3 mt-6"><div><p className="text-2xl font-mono text-[#B69249]">{formatPrice(selected?.value ?? null)}</p><p className="text-xs text-[#A4AEC1] mt-1">{selected && formatAsOf(new Date(selected.time*1000).toISOString())}</p></div><div className="text-xs text-[#A4AEC1]">Period low {formatPrice(min)}<br/>Period high {formatPrice(max)}</div></div>
        <svg viewBox="0 0 940 260" role="img" aria-label={`${range} gold benchmark chart in Pakistani rupees at a fixed exchange rate`} className="w-full mt-3" onPointerMove={e=>{const rect=e.currentTarget.getBoundingClientRect();const target=(e.clientX-rect.left)/rect.width*940;let nearest=0;series.forEach((p,i)=>{if(Math.abs(x(p.time)-target)<Math.abs(x(series[nearest].time)-target))nearest=i;});setHover(nearest);}} onPointerLeave={()=>setHover(null)}>
          <title>Indicative gold value in PKR</title>
          {[50,135,220].map(v=><line key={v} x1="45" x2="895" y1={v} y2={v} stroke="currentColor" className="text-[#28354A]"/>)}
          <path d={`${line} L895,235 L45,235 Z`} fill="#B69249" fillOpacity=".08" />
          <path d={line} fill="none" stroke="#B69249" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          {selected && <circle cx={x(selected.time)} cy={y(selected.value)} r="4" fill="#B69249"/>}
        </svg>
        <div className="flex justify-between text-xs text-[#A4AEC1]"><span>{formatAsOf(new Date(first.time*1000).toISOString())}</span><span>{formatAsOf(new Date(last.time*1000).toISOString())}</span></div>
        <label className="block text-xs text-[#A4AEC1] mt-4">Explore observations with the slider<input aria-label="Gold chart observation" type="range" min={0} max={series.length-1} value={hover??series.length-1} onChange={e=>setHover(Number(e.target.value))} className="w-full mt-2 accent-[#B69249]" /></label>
        <details className="mt-4 text-sm"><summary className="cursor-pointer text-[#B69249]">View recent chart values</summary><div className="max-h-64 overflow-auto mt-3"><table className="w-full text-left text-xs"><thead><tr><th className="py-2">Observation (PKT)</th><th className="py-2 text-right">PKR estimate</th></tr></thead><tbody>{series.slice(-20).reverse().map(p=><tr key={p.time}><td className="py-2">{formatAsOf(new Date(p.time*1000).toISOString())}</td><td className="text-right">{formatPrice(p.value)}</td></tr>)}</tbody></table></div></details>
      </> : <p role="status" className="py-16 text-sm text-[#A4AEC1]">Historical data or the PKR conversion rate is unavailable for this period. Try another period or check back later.</p>}
      <p className="text-xs text-[#A4AEC1] mt-5">Source: <a href={range!=='1D' && history.dailySource==='Gold futures (GC=F) via Yahoo Finance'?'https://finance.yahoo.com/quote/GC%3DF/':'https://xaus.com/api/'} className="underline">{range==='1D'?history.intradaySource:history.dailySource}</a>. Dates above show the actual available observations; gaps and market closures are not filled with invented prices.</p>
    </section>}
  </div>;
}

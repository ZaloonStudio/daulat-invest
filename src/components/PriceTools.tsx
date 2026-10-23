'use client';

import { useId, useMemo, useState } from 'react';
import PriceHistoryChart from './PriceHistoryChart';
import { metalValue, formatPrice, PriceKey, PriceSnapshot, TOLA_GRAMS } from '@/lib/commodity-data';
import { historyWindow, PRICE_RANGES, type PriceHistory, type PriceRange } from '@/lib/price-history-data';

const NAMES: Record<PriceKey,string> = {gold:'Gold',silver:'Silver',usd:'USD / PKR',petrol:'Petrol',brent:'Brent crude',wti:'WTI crude',gas:'Natural gas'};
export default function PriceTools({kind,prices,history}:{kind:PriceKey;prices:PriceSnapshot;history?:PriceHistory}) {
  const id = useId();
  const [quantity,setQuantity] = useState('1');
  const [grams,setGrams] = useState(TOLA_GRAMS);
  const [purity,setPurity] = useState(24);
  const [range,setRange] = useState<PriceRange>(history?.intraday.length?'1D':'1M');
  const metal = kind==='gold'||kind==='silver';
  const currency = ['brent','wti','gas'].includes(kind)?'USD':'PKR';
  const factor = (metal?grams:1)*(kind==='gold'?purity/24:1);
  const value = prices[kind].value;
  const amount = quantity.trim()===''?NaN:Number(quantity);
  const total = value!==null && Number.isFinite(amount) && amount>=0 && Number.isFinite(amount*value*factor)?amount*(metal?metalValue(prices[kind],grams,kind==='gold'?purity:24)!:value*factor):null;
  const points = useMemo(()=>history?historyWindow(history,range).map(p=>({...p,value:p.value*factor})):[],[history,range,factor]);
  const hasHistory = history && (history.daily.length>=2||history.intraday.length>=2||history.longTerm.length>=2);
  const units = <div className="flex flex-wrap items-center gap-2">
    {metal&&<label className="text-xs text-[#A4AEC1]"><span className="sr-only">Weight unit</span><select aria-label="Weight unit" value={grams} onChange={e=>setGrams(Number(e.target.value))} className="px-3 py-2 bg-[#0B1120] border border-[#28354A] rounded-lg text-[#EFF3FA]"><option value={TOLA_GRAMS}>Per tola</option><option value={10}>Per 10 grams</option><option value={1}>Per gram</option></select></label>}
    {kind==='gold'&&<label className="text-xs text-[#A4AEC1]"><span className="sr-only">Purity</span><select aria-label="Purity" value={purity} onChange={e=>setPurity(Number(e.target.value))} className="px-3 py-2 bg-[#0B1120] border border-[#28354A] rounded-lg text-[#EFF3FA]"><option value={24}>24K</option><option value={22}>22K</option></select></label>}
  </div>;
  return <div className="space-y-5">
    {hasHistory&&<section aria-labelledby={`${id}-chart`} className="border border-[#28354A] bg-[#111A2B] rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 id={`${id}-chart`} className="text-base font-semibold">{metal?'International '+NAMES[kind].toLowerCase():NAMES[kind]} chart</h2>{units}</div>
      <div role="group" aria-label="Chart period" className="flex flex-wrap gap-1 mt-4">{PRICE_RANGES.map(r=><button key={r} aria-pressed={range===r} disabled={r==='1D'&&history.intraday.length<2} title={r==='ALL'?'All available history, up to 25 years':r==='1D'&&history.intraday.length<2?'Intraday data unavailable':r} onClick={()=>setRange(r)} className={`px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed ${range===r?'bg-[#B69249] text-black':'text-[#A4AEC1] hover:bg-[#1C2940]'}`}>{r==='ALL'?'All':r}</button>)}</div>
      <PriceHistoryChart points={points} currency={currency} intraday={range==='1D'} stepped={kind==='petrol'} label={`${NAMES[kind]} ${range==='ALL'?'all available':range} price history in ${currency}`}/>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#A4AEC1] mt-3"><span>{history.basis}{range==='ALL'?' · Monthly + daily · up to 25Y':''}</span><a href={history.sourceUrl} className="underline">{history.source}</a></div>
    </section>}
    {history&&!hasHistory&&<p role="status" className="text-xs text-[#A4AEC1]">Price history is temporarily unavailable.</p>}
    <section aria-labelledby={`${id}-calculator`} className="border border-[#28354A] rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap justify-between gap-3 items-center mb-4"><h2 id={`${id}-calculator`} className="text-base font-semibold">{metal?'Metal value calculator':kind==='petrol'?'Fuel cost calculator':kind==='usd'?'USD to PKR calculator':'Barrel value calculator'}</h2>{!hasHistory&&units}</div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-xs text-[#A4AEC1] flex-1 min-w-40">{metal?'Quantity':kind==='petrol'?'Litres':kind==='usd'?'US dollars':'Barrels'}<input type="number" min="0" step="any" value={quantity} onChange={e=>setQuantity(e.target.value)} className="block w-full mt-2 p-3 rounded-lg bg-[#0B1120] border border-[#28354A] text-[#EFF3FA]"/></label>
        <output aria-live="polite" className="font-mono text-2xl sm:text-3xl text-[#B69249] py-2">{formatPrice(total,currency)}</output>
      </div>
      {(value===null||!Number.isFinite(amount)||amount<0)&&<p className="text-xs text-[#A4AEC1] mt-2">{value===null?'Price feed unavailable.':'Enter a valid quantity.'}</p>}
    </section>
  </div>;
}

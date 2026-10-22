'use client';
import { useState } from 'react';
import Link from 'next/link';
import PriceTools from '@/components/PriceTools';
import { PriceSnapshot, TOLA_GRAMS, formatPrice, formatAsOf } from '@/lib/commodity-data';
import { PRICE_PAGES } from '@/lib/price-pages';

export default function CommoditiesClient({prices}:{prices:PriceSnapshot}) {
  const [activeTab,setActiveTab] = useState('All');
  const metal = (key:'gold'|'silver', grams:number, purity=24) => prices[key].value===null?null:prices[key].value!*grams*purity/24;
  const energy = (key:'brent'|'wti'|'gas') => prices[key].value===null||prices.usd.value===null?null:prices[key].value!*prices.usd.value;
  const rows = [
    {name:'Gold 24K',unit:'Per tola',value:metal('gold',TOLA_GRAMS),category:'Gold',quote:prices.gold,href:'/gold-price-pakistan'},
    {name:'Gold 24K',unit:'Per 10 grams',value:metal('gold',10),category:'Gold',quote:prices.gold,href:'/gold-price-pakistan'},
    {name:'Gold 22K',unit:'Per tola',value:metal('gold',TOLA_GRAMS,22),category:'Gold',quote:prices.gold,href:'/gold-price-pakistan'},
    {name:'Gold 22K',unit:'Per 10 grams',value:metal('gold',10,22),category:'Gold',quote:prices.gold,href:'/gold-price-pakistan'},
    {name:'Pure silver',unit:'Per tola',value:metal('silver',TOLA_GRAMS),category:'Silver',quote:prices.silver,href:'/silver-price-pakistan'},
    {name:'Pure silver',unit:'Per 10 grams',value:metal('silver',10),category:'Silver',quote:prices.silver,href:'/silver-price-pakistan'},
    {name:'Brent futures',unit:'Per barrel',value:energy('brent'),category:'Energy',quote:prices.brent,href:'/brent-crude-oil-price'},
    {name:'WTI futures',unit:'Per barrel',value:energy('wti'),category:'Energy',quote:prices.wti,href:null},
    {name:'Natural gas futures',unit:'Per MMBtu',value:energy('gas'),category:'Energy',quote:prices.gas,href:null},
    {name:'Petrol',unit:'Per litre',value:prices.petrol.value,category:'Energy',quote:prices.petrol,href:'/petrol-price-pakistan'},
  ];
  return <div className="space-y-8">
    <Link href="/" className="text-sm text-[#A4AEC1]">← Market overview</Link>
    <header><p className="eyebrow mb-3">DAULAT / COMMODITIES</p><h1 className="text-3xl sm:text-4xl font-semibold">Gold &amp; commodity prices</h1><p className="text-sm text-[#A4AEC1] leading-7 mt-3 max-w-2xl">International metal and energy benchmarks converted to PKR, alongside Pakistan’s petrol reference. Explore dedicated pages for sources, explanations and calculators.</p></header>
    <nav aria-label="Commodity price pages" className="flex flex-wrap gap-2">{PRICE_PAGES.map(p=><Link key={p.slug} href={`/${p.slug}`} className="border border-[#28354A] rounded-lg px-4 py-3 text-sm text-[#B69249] hover:bg-[#111A2B]">{p.short} ↗</Link>)}</nav>
    <PriceTools kind="gold" prices={prices}/>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter commodities">{['All','Gold','Silver','Energy'].map(cat=><button key={cat} onClick={()=>setActiveTab(cat)} aria-pressed={activeTab===cat} className={`px-4 py-2 rounded-lg text-sm ${cat===activeTab?'bg-[#B69249] text-black':'border border-[#28354A] text-[#A4AEC1]'}`}>{cat}</button>)}</div>
    <div className="overflow-x-auto rounded-xl border border-[#28354A]"><table className="w-full text-sm text-left"><caption className="text-left p-4 text-xs text-[#A4AEC1]">Indicative PKR values. Metals exclude local Sarafa premiums and making charges; energy figures use futures benchmarks. Petrol uses its supplied effective date.</caption><thead className="bg-[#111A2B] text-xs text-[#A4AEC1]"><tr><th className="p-4">Commodity</th><th className="p-4">Unit</th><th className="p-4 text-right">PKR value</th><th className="p-4">Source observation / effective time</th></tr></thead><tbody>{rows.filter(r=>activeTab==='All'||r.category===activeTab).map(r=><tr key={r.name+r.unit} className="border-t border-[#28354A]"><td className="p-4 font-semibold">{r.href?<Link className="hover:text-[#B69249]" href={r.href}>{r.name} ↗</Link>:r.name}</td><td className="p-4 text-[#A4AEC1] whitespace-nowrap">{r.unit}</td><td className="p-4 text-right font-mono whitespace-nowrap">{formatPrice(r.value)}</td><td className="p-4 text-xs text-[#A4AEC1]"><a className="underline" href={r.quote.sourceUrl}>{r.quote.source}</a><p className="mt-1">{formatAsOf(r.quote.asOf)}{r.quote.delayed?' · Earlier observation':''}</p></td></tr>)}</tbody></table></div>
  </div>;
}

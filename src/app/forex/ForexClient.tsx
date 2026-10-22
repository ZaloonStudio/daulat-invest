'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { ForexSnapshot } from '@/lib/forex-data';

export default function ForexClient({snapshot}:{snapshot:ForexSnapshot}) {
  const [amount,setAmount] = useState(100);
  const [currency,setCurrency] = useState('USD');
  const selected = snapshot.rates.find(rate=>rate.code===currency)!;
  const price = (value:number|null) => value===null?'Unavailable':value.toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2});
  const result = selected.rate===null?null:amount*selected.rate;
  const updated = snapshot.asOf ? new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Karachi'}).format(new Date(snapshot.asOf))+' PKT' : 'Rate feed unavailable';
  return <div className="space-y-6">
    <header><p className="eyebrow mb-3">DAULAT / CURRENCY</p><h1 className="text-3xl font-semibold">Currency rates in Pakistan</h1><p className="text-sm text-[#A4AEC1] mt-2">Daily reference rates · PKR per unit</p></header>
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#A4AEC1]">
      <a href="https://www.exchangerate-api.com" className="text-[#B69249] hover:underline" target="_blank" rel="noopener noreferrer">Rates By Exchange Rate API</a>
      <span>{updated}</span>{snapshot.stale&&snapshot.asOf&&<span className="text-[#B69249]">Delayed rates</span>}
    </div>
    <section aria-label="Currency converter" className="rounded-2xl border border-[#28354A] bg-[#111A2B] p-5 sm:p-7 grid gap-4 sm:grid-cols-3 items-end">
      <label className="text-xs text-[#A4AEC1]">Amount<input type="number" min="0" step="any" value={amount} onChange={event=>{const value=Number(event.target.value);setAmount(Number.isFinite(value)?Math.max(0,value):0);}} className="block w-full mt-2 p-3 rounded-xl bg-[#0B1120] border border-[#28354A] text-[#EFF3FA]" /></label>
      <label className="text-xs text-[#A4AEC1]">Currency<select value={currency} onChange={event=>setCurrency(event.target.value)} className="block w-full mt-2 p-3 rounded-xl bg-[#0B1120] border border-[#28354A] text-[#EFF3FA]">{snapshot.rates.map(rate=><option key={rate.code} value={rate.code}>{rate.code} — {rate.name}</option>)}</select></label>
      <div><p className="text-xs text-[#A4AEC1]">Pakistani rupees</p><output className="block mt-2 text-2xl font-mono font-semibold text-[#B69249]">{result===null?'Unavailable':'Rs '+price(result)}</output></div>
    </section>
    <div className="rounded-2xl border border-[#28354A] bg-[#111A2B] overflow-x-auto">
      <table className="w-full text-sm text-left"><caption className="sr-only">Daily reference currency exchange rates against PKR</caption><thead className="text-xs text-[#A4AEC1] border-b border-[#28354A]"><tr><th scope="col" className="p-4">Currency</th><th scope="col" className="p-4 text-right">1 unit in PKR</th></tr></thead><tbody>{snapshot.rates.map(rate=><tr key={rate.code} className="border-b last:border-0 border-[#28354A]"><th scope="row" className="p-4 font-medium">{rate.code}<span className="block font-normal text-xs text-[#A4AEC1] mt-1">{rate.name}</span></th><td className="p-4 text-right font-mono">{rate.code==='USD'?<Link href="/usd-to-pkr" className="text-[#B69249] hover:underline">{price(rate.rate)} →</Link>:price(rate.rate)}</td></tr>)}</tbody></table>
    </div>
    <p className="text-xs text-[#A4AEC1]">Reference conversion rates. Bank and exchange-dealer buy/sell quotes may differ.</p>
  </div>;
}

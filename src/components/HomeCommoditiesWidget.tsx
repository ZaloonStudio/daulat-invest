import Link from 'next/link';
import Image from 'next/image';
import { Coins, DollarSign, Fuel, ArrowRight, Flame } from 'lucide-react';
import { formatAsOf, formatPrice, PriceKey, PriceSnapshot, TOLA_GRAMS } from '@/lib/commodity-data';

const CARDS: {key:PriceKey;name:string;slug:string;factor:number;icon:typeof Coins;subtitle:string}[] = [
  {key:'gold',name:'Gold 24K (Per Tola)',slug:'gold-price-pakistan',factor:TOLA_GRAMS,icon:Coins,subtitle:'Global benchmark'},
  {key:'gold',name:'Gold 24K (10 Grams)',slug:'gold-price-pakistan',factor:10,icon:Coins,subtitle:'Global benchmark'},
  {key:'silver',name:'Silver (Per Tola)',slug:'silver-price-pakistan',factor:TOLA_GRAMS,icon:Coins,subtitle:'Global benchmark'},
  {key:'usd',name:'US Dollar (USD/PKR)',slug:'usd-to-pkr',factor:1,icon:DollarSign,subtitle:'Indicative exchange rate'},
  {key:'petrol',name:'Petrol (Per Litre)',slug:'petrol-price-pakistan',factor:1,icon:Fuel,subtitle:'Notified rate via AutoOnes'},
  {key:'brent',name:'Crude Oil (Brent)',slug:'brent-crude-oil-price',factor:1,icon:Flame,subtitle:'International futures / barrel'},
];
export default function HomeCommoditiesWidget({prices}:{prices:PriceSnapshot}) {
  return <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5 space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28354A] pb-3">
      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-[#B69249] flex items-center justify-center text-black"><Coins className="w-4 h-4"/></div><div><h3 className="text-sm sm:text-base font-semibold">Gold, Forex &amp; Commodities in Pakistan</h3><p className="text-[11px] text-[#A4AEC1] mt-1">Explore prices, sources, charts and calculators</p></div></div>
      <Link href="/commodities" className="inline-flex items-center gap-2 text-xs font-semibold text-[#B69249]">All rates &amp; tools <ArrowRight className="w-3.5 h-3.5"/></Link>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">{CARDS.map(item=>{
      const q=prices[item.key], Icon=item.icon, international=item.key==='brent';
      return <Link key={item.name} href={`/${item.slug}`} className="bg-[#0B1120] border border-[#28354A] hover:border-[#B69249] p-3 rounded-xl transition-colors group" title={`${q.source} · ${formatAsOf(q.asOf)}`}>
        <div className="flex items-center justify-between mb-3"><div className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#B69249]/25 bg-[#B69249]/10"><Icon className="w-3.5 h-3.5 text-[#B69249]"/></div><Image src={international?'/flags/us.svg':'/flags/pk.svg'} alt={international?'International price in USD':'Pakistan price in PKR'} width={24} height={16} className="h-4 w-6 rounded-sm"/></div>
        <p className="font-semibold text-xs group-hover:text-[#B69249]">{item.name}</p><p className="text-[10px] text-[#A4AEC1] mt-1">{item.subtitle}</p>
        <p className="mt-3 pt-3 border-t border-[#28354A] font-mono text-sm font-semibold">{formatPrice(q.value===null?null:q.value*item.factor,international?'USD':'PKR')}</p>
        <p className="text-[10px] text-[#A4AEC1] mt-1">{q.value===null?'Feed unavailable':q.delayed?'Earlier observation':'Latest available'} <span aria-hidden="true">↗</span></p>
      </Link>;
    })}</div>
  </div>;
}

import { pageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PriceTools from '@/components/PriceTools';
import { PRICE_PAGES, getPricePage } from '@/lib/price-pages';
import { getPriceSnapshot } from '@/lib/commodity-feed';
import { getPriceHistory } from '@/lib/price-history';
import { formatAsOf, formatPrice } from '@/lib/commodity-data';

export const revalidate = 300;
export const dynamicParams = false;
const BASE = 'https://www.daulatinvest.com';
export function generateStaticParams() { return PRICE_PAGES.map(p=>({price:p.slug})); }
export function generateMetadata({params}:{params:{price:string}}): Metadata {
  const p = getPricePage(params.price);
  if (!p) return {};
  return pageMetadata(`/${p.slug}`, p.title, p.description);
}
export default async function PriceDetailPage({params}:{params:{price:string}}) {
  const p = getPricePage(params.price);
  if (!p) notFound();
  const [prices,history] = await Promise.all([getPriceSnapshot(),getPriceHistory(p.key)]);
  const q = prices[p.key];
  const value = q.value===null?null:q.value*p.multiplier;
  const structured = {'@context':'https://schema.org','@graph':[
    {'@type':'WebPage','@id':`${BASE}/${p.slug}#page`,url:`${BASE}/${p.slug}`,name:p.title,description:p.description,inLanguage:'en-PK',publisher:{'@type':'Organization',name:'Daulat Invest',url:BASE}},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:BASE},{'@type':'ListItem',position:2,name:'Commodities',item:`${BASE}/commodities`},{'@type':'ListItem',position:3,name:p.short,item:`${BASE}/${p.slug}`}]},
  ]};
  return <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
    <Navbar/>
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,'\\u003c')}}/>
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-[11px] text-[#A4AEC1] mb-5"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/commodities">Commodities</Link><span aria-hidden="true">/</span><span aria-current="page">{p.short}</span></nav>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-5" aria-label="Latest available price">
        <div><div className="flex items-center gap-2 mb-2"><Image src={p.currency==='USD'?'/flags/us.svg':'/flags/pk.svg'} width={24} height={16} alt={p.currency==='USD'?'International USD prices':'Pakistan PKR prices'}/><span className="text-[10px] text-[#A4AEC1] uppercase tracking-wider">{p.unit}</span></div><h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{p.title}</h1></div>
        <div className="sm:text-right"><p className="text-3xl font-mono font-semibold text-[#B69249]">{formatPrice(value,p.currency)}</p><p className="text-[10px] text-[#A4AEC1] mt-1">{q.value===null?'Feed unavailable · ':q.delayed?'Earlier observation · ':''}{p.key==='petrol'?'Effective: ':''}{formatAsOf(q.asOf)} · <a href={q.sourceUrl} className="underline">Source</a></p></div>
      </header>
      <PriceTools kind={p.key} prices={prices} history={history}/>
      <nav aria-label="Related price pages" className="flex flex-wrap gap-x-5 gap-y-3 border-t border-[#28354A] mt-7 pt-5 text-xs text-[#A4AEC1]">{PRICE_PAGES.filter(other=>other.slug!==p.slug).map(other=><Link key={other.slug} href={`/${other.slug}`} className="hover:text-[#B69249]">{other.short} ↗</Link>)}<Link href="/commodities" className="text-[#B69249]">All commodities ↗</Link></nav>
    </main><Footer/>
  </div>;
}

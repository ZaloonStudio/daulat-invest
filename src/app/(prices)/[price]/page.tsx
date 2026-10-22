import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PriceTools from '@/components/PriceTools';
import { PRICE_PAGES, getPricePage } from '@/lib/price-pages';
import { getGoldHistory, getPriceSnapshot } from '@/lib/commodity-feed';
import { formatAsOf, formatPrice, TOLA_GRAMS } from '@/lib/commodity-data';

export const revalidate = 300;
export const dynamicParams = false;
const BASE = 'https://www.daulatinvest.com';
export function generateStaticParams() { return PRICE_PAGES.map(p=>({price:p.slug})); }
export function generateMetadata({params}:{params:{price:string}}): Metadata {
  const p = getPricePage(params.price);
  if (!p) return {};
  return {title:`${p.title} | Daulat Invest`,description:p.description,alternates:{canonical:`${BASE}/${p.slug}`},openGraph:{title:p.title,description:p.description,url:`${BASE}/${p.slug}`,type:'website',siteName:'Daulat Invest'},twitter:{card:'summary',title:p.title,description:p.description}};
}
export default async function PriceDetailPage({params}:{params:{price:string}}) {
  const p = getPricePage(params.price);
  if (!p) notFound();
  const [prices,history] = await Promise.all([getPriceSnapshot(), p.key==='gold'?getGoldHistory():Promise.resolve(undefined)]);
  const q = prices[p.key];
  const value = q.value === null ? null : q.value*p.multiplier;
  const metal = p.key==='gold'||p.key==='silver';
  const structured = {'@context':'https://schema.org','@graph':[
    {'@type':'WebPage','@id':`${BASE}/${p.slug}#page`,url:`${BASE}/${p.slug}`,name:p.title,description:p.description,inLanguage:'en-PK',publisher:{'@type':'Organization',name:'Daulat Invest',url:BASE}},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:BASE},{'@type':'ListItem',position:2,name:'Commodities',item:`${BASE}/commodities`},{'@type':'ListItem',position:3,name:p.short,item:`${BASE}/${p.slug}`}]},
  ]};
  return <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
    <Navbar/>
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,'\\u003c')}} />
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-xs text-[#A4AEC1] mb-8"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/commodities">Commodities</Link><span aria-hidden="true">/</span><span aria-current="page">{p.short}</span></nav>
      <header className="border-b border-[#28354A] pb-8 mb-8">
        <p className="eyebrow mb-4 flex items-center gap-3"><Image src={p.currency==='USD'?'/flags/us.svg':'/flags/pk.svg'} width={27} height={18} alt={p.currency==='USD'?'International USD prices':'Pakistan PKR prices'} /> DAULAT / PRICE MONITOR</p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">{p.title}</h1>
        <p className="text-[#A4AEC1] text-sm sm:text-base leading-relaxed max-w-2xl mt-4">{p.intro}</p>
      </header>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <section className="rounded-2xl border border-[#B69249]/30 bg-[#111A2B] p-6 sm:p-8" aria-label="Latest available price">
            <div className="flex flex-wrap justify-between gap-2 text-xs text-[#A4AEC1]"><span>{p.key==='petrol'?'NOTIFIED PETROL REFERENCE':metal?'INDICATIVE METAL VALUE':p.key==='usd'?'INDICATIVE FX REFERENCE':'FUTURES BENCHMARK'}</span><span>{value===null?'Feed unavailable':q.delayed?'Earlier observation':'Latest available'}</span></div>
            <p className="text-3xl sm:text-5xl text-[#B69249] font-mono font-semibold tracking-tight mt-6">{formatPrice(value,p.currency)}</p>
            <p className="text-sm text-[#A4AEC1] mt-2">{p.unit}</p>
            <p className="text-xs text-[#A4AEC1] mt-6">{p.key==='petrol'?'Effective from:':'Observed:'} {formatAsOf(q.asOf)}</p>
            <p className="text-xs text-[#A4AEC1] mt-2">Source: <a href={q.sourceUrl} className="underline">{q.source}</a></p>
            {metal && <div className="grid grid-cols-2 gap-4 border-t border-[#28354A] mt-6 pt-5">{[{label:'Per gram',grams:1},{label:'Per 10 grams',grams:10}].map(u=><div key={u.label}><p className="text-xs text-[#A4AEC1]">{u.label}</p><p className="font-mono text-lg mt-1">{formatPrice(q.value===null?null:q.value*u.grams)}</p></div>)}</div>}
            {p.key==='gold' && <p className="text-xs text-[#A4AEC1] mt-4">22K metal value per tola: {formatPrice(q.value===null?null:q.value*TOLA_GRAMS*22/24)}. Local Sarafa and jewellery quotes may differ.</p>}
          </section>
          <PriceTools kind={p.key} prices={prices} history={history}/>
          <section className="space-y-7 py-4" aria-label="Price guide">{p.sections.map(s=><div key={s.title}><h2 className="text-xl font-semibold mb-3">{s.title}</h2><p className="text-sm text-[#A4AEC1] leading-7">{s.text}</p></div>)}</section>
          <section className="border-t border-[#28354A] pt-6"><h2 className="text-xl font-semibold mb-5">Common questions</h2>{p.questions.map(f=><details key={f.q} className="border-b border-[#28354A] py-4"><summary className="cursor-pointer font-medium text-sm">{f.q}</summary><p className="text-sm text-[#A4AEC1] leading-7 mt-3">{f.a}</p></details>)}</section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24">
          <nav aria-label="Related price pages" className="rounded-2xl border border-[#28354A] bg-[#111A2B] p-5"><h2 className="text-sm font-semibold mb-4">Explore prices</h2>{PRICE_PAGES.filter(other=>other.slug!==p.slug).map(other=><Link key={other.slug} href={`/${other.slug}`} className="block py-3 border-t border-[#28354A] text-sm text-[#A4AEC1] hover:text-[#B69249]">{other.title} <span aria-hidden="true">↗</span></Link>)}<Link href="/forex" className="block py-3 text-sm text-[#B69249]">All currency tools ↗</Link></nav>
          <section className="rounded-2xl border border-[#28354A] p-5"><h2 className="text-sm font-semibold mb-3">Source & methodology</h2><p className="text-xs text-[#A4AEC1] leading-6">Rates carry their source observation or effective time. Market feeds may be delayed. Missing prices are shown as unavailable; no sample prices are substituted.</p>{metal && <p className="text-xs text-[#A4AEC1] leading-6 mt-3">PKR conversion uses an indicative exchange rate. It excludes local dealer premiums.</p>}{p.key==='petrol' && <div className="text-xs space-y-3 mt-4"><a href="https://psopk.com/en/fuels/fuel-prices" className="block text-[#B69249] underline">PSO published fuel prices</a><a href="https://ogra.org.pk/index.php/notified-petroleum-prices" className="block text-[#B69249] underline">OGRA petroleum notifications</a></div>}</section>
        </aside>
      </div>
    </main><Footer/>
  </div>;
}

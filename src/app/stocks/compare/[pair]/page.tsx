import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound,permanentRedirect} from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CuratedComparisons from '@/components/CuratedComparisons';
import {fetchMarketWatch} from '@/lib/psx';
import {fetchSupplementalFundamentals} from '@/lib/supplemental-fundamentals';
import {STOCK_COMPARISONS,COMPARISON_COMPANIES,COMPARISON_SECTORS,comparisonTitle,comparisonPath,resolveComparison} from '@/lib/stock-comparisons';
import {annualDividend,alignedAnnualYields} from '@/lib/annual-dividend';
import {comparisonRows,formatComparisonValue} from '@/lib/comparison-data';
import {SITE_URL,pageMetadata,jsonLd} from '@/lib/seo';

export const revalidate=300;
export function generateStaticParams(){return STOCK_COMPARISONS.map(p=>({pair:p.slug}));}
export function generateMetadata({params}:{params:{pair:string}}):Metadata {
 const pair=resolveComparison(params.pair);if(!pair)return {title:'Comparison not found',robots:{index:false,follow:true}};
 return pageMetadata(comparisonPath(pair),comparisonTitle(pair)+' Stock Comparison',`Compare ${COMPARISON_COMPANIES[pair.left].name} (${pair.left}) and ${COMPARISON_COMPANIES[pair.right].name} (${pair.right}): PSX share prices, P/E, dividends, book value and dated financial ratios.`);
}
export default async function StockPairPage({params}:{params:{pair:string}}){
 const pair=resolveComparison(params.pair);if(!pair)notFound();
 const path=comparisonPath(pair);if(params.pair!==pair.slug)permanentRedirect(path);
 const symbols=[pair.left,pair.right] as const;
 const [quotes,fundamentals]=await Promise.all([fetchMarketWatch(),Promise.all(symbols.map(fetchSupplementalFundamentals))]);
 const stocks=symbols.map(s=>quotes.find(q=>q.symbol===s));
 const sector=COMPARISON_SECTORS[pair.sector];
 const groups=comparisonRows(stocks,fundamentals,sector.metrics);
 const title=comparisonTitle(pair);
 const annual=alignedAnnualYields(fundamentals.map(f=>annualDividend(f)),stocks.map(q=>q?.current));
 const schema={'@context':'https://schema.org','@graph':[
  {'@type':'WebPage','@id':SITE_URL+path,url:SITE_URL+path,name:title+' Stock Comparison',description:`A side-by-side comparison of ${symbols.join(' and ')} on the Pakistan Stock Exchange.`,isPartOf:{'@id':SITE_URL+'/#website'},about:symbols.map(s=>({'@type':'Corporation',name:COMPARISON_COMPANIES[s].name,tickerSymbol:'PSX:'+s,url:SITE_URL+'/stocks/'+s}))},
  {'@type':'BreadcrumbList',itemListElement:[{name:'Stocks',item:SITE_URL+'/stocks'},{name:'Stock comparisons',item:SITE_URL+'/stocks/compare'},{name:title,item:SITE_URL+path}].map((b,i)=>({'@type':'ListItem',position:i+1,...b}))},
 ]};
 return <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
  <Navbar/>
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
   <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schema)}}/>
   <nav aria-label="Breadcrumb" className="text-xs text-[#A4AEC1] flex flex-wrap gap-2"><Link href="/stocks">Stocks</Link><span>/</span><Link href="/stocks/compare">Compare</Link><span>/</span><span>{pair.left} vs {pair.right}</span></nav>
   <header className="space-y-3"><p className="text-xs uppercase tracking-widest text-[#B69249]">{pair.sector} · PSX stock comparison</p><h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1><p className="text-sm text-[#A4AEC1] max-w-3xl">{COMPARISON_COMPANIES[pair.left].name} and {COMPARISON_COMPANIES[pair.right].name}: compare valuation, dividends and financial performance side by side.</p></header>
   <div className="grid sm:grid-cols-2 gap-4">{symbols.map((symbol,i)=><section key={symbol} className="rounded-xl border border-[#28354A] bg-[#111A2B] p-5"><Link href={'/stocks/'+symbol} className="text-[#B69249] font-semibold">{symbol} ↗</Link><h2 className="text-lg font-semibold mt-1">{COMPARISON_COMPANIES[symbol].name}</h2><p className="font-mono text-3xl mt-4">{formatComparisonValue(stocks[i]?.current??null,'PKR')}</p><p className="text-xs text-[#A4AEC1] mt-2">{stocks[i]?.updatedAt?'PSX snapshot · '+new Date(stocks[i]!.updatedAt!).toLocaleString('en-GB',{timeZone:'Asia/Karachi'})+' PKT':'Quote timestamp unavailable'}</p></section>)}</div>
   {!stocks.every(Boolean)&&<p role="status" className="text-sm text-[#A4AEC1]">Some PSX quotes are temporarily unavailable. Missing values are shown as —.</p>}
   {groups.some(g=>g.rows.some(r=>r.values.some(v=>v.value===null&&v.note)))&&<p role="status" className="text-xs text-[#A4AEC1]">Some annual figures are withheld pending current reporting-year verification.</p>}
   <section aria-label="Comparison focus" className="flex flex-wrap gap-2">{sector.focus.map(f=><span key={f} className="rounded-lg border border-[#28354A] px-3 py-2 text-xs text-[#A4AEC1]">{f}</span>)}</section>
   {annual.mismatchedYears&&<p role="status" className="text-xs text-[#A4AEC1]">Annual yields are unavailable for this comparison because the reported financial years differ.</p>}
   <div className="overflow-x-auto rounded-xl border border-[#28354A] bg-[#111A2B]"><table className="w-full text-sm text-left min-w-[570px]">
    <caption className="sr-only">{title}: share price, valuation and financial ratios</caption>
    <thead className="bg-[#0B1120] border-b border-[#28354A]"><tr><th scope="col" className="p-4 text-[#A4AEC1] w-1/3">Metric</th>{symbols.map(s=><th scope="col" key={s} className="p-4 text-right w-1/3"><Link href={'/stocks/'+s} className="text-[#B69249]">{s}</Link></th>)}</tr></thead>
    {groups.map(group=><tbody key={group.title}><tr className="bg-[#B69249]/10"><th colSpan={3} className="p-4 font-semibold">{group.title}<span className="block text-[11px] text-[#A4AEC1] font-normal mt-1">{group.source}</span></th></tr>{group.rows.map(row=><tr key={row.label} className="border-t border-[#28354A]"><th scope="row" className="p-4 font-normal text-[#A4AEC1]">{row.label}</th>{row.values.map((v,i)=><td key={i} className="p-4 text-right font-mono">{formatComparisonValue(v.value,row.unit)}{v.value!==null&&v.period&&<span className="block text-[10px] text-[#A4AEC1] mt-1 font-sans">{v.period}</span>}{v.value!==null&&v.note&&<span className="block text-[10px] text-[#A4AEC1] mt-1 font-sans max-w-xs ml-auto">{v.note}</span>}</td>)}</tr>)}</tbody>)}
   </table></div>
   <section className="text-xs text-[#A4AEC1] space-y-2"><h2 className="text-sm font-semibold text-[#EFF3FA]">Sources & reporting periods</h2><p>Prices and trailing P/E: PSX DPS. Annual yield = full-year cash dividend divided by displayed PSX price. Annual dividends and financial ratios: reviewed issuer filings and SCSTrade. Financial year and dividend/share are shown for both stocks; unclear feed yields are excluded. Price/book uses reported book value. PSX 1-year price changes exclude payouts; they are not total returns. Reviewed issuer ratios use unconsolidated statements and labelled year-end denominators. Unverified borrowing ratios are omitted.</p><div className="flex flex-wrap gap-x-5 gap-y-2">{symbols.map((s,i)=><div key={s}><a href={'https://dps.psx.com.pk/company/'+s} target="_blank" rel="noopener noreferrer" className="text-[#B69249]">{s} · PSX ↗</a><span className="mx-2">/</span><a href={fundamentals[i].source} target="_blank" rel="noopener noreferrer" className="text-[#B69249]">Financials ↗</a><span className="block mt-1">{fundamentals[i].basis}</span></div>)}</div></section>
   <div className="flex flex-wrap gap-3"><Link href={'/stocks/compare?s1='+pair.left+'&s2='+pair.right} className="bg-[#B69249] text-black rounded-lg px-4 py-2.5 text-sm font-semibold">Customize this comparison →</Link><Link href="/stocks/screener" className="rounded-lg border border-[#28354A] px-4 py-2.5 text-sm text-[#A4AEC1]">Open screener</Link></div>
   <CuratedComparisons sector={pair.sector} exclude={pair.slug}/>
  </main><Footer/>
 </div>;
}

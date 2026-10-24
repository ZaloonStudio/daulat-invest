import Link from 'next/link';
import {STOCK_COMPARISONS,COMPARISON_SECTORS,comparisonPath,comparisonTitle,comparisonDirectoryTitle,comparisonsForStock,type ComparisonSector} from '@/lib/stock-comparisons';
export default function CuratedComparisons({symbol,sector:onlySector,exclude,all=false}:{all?:boolean;symbol?:string;sector?:ComparisonSector;exclude?:string}){
 const matching=(symbol?comparisonsForStock(symbol):STOCK_COMPARISONS).filter(p=>(!onlySector||p.sector===onlySector)&&p.slug!==exclude&&(all||symbol||onlySector||p.featured));
 const pairs=onlySector?matching.slice(0,6):matching;
 if(!pairs.length)return null;
 const sectors=[...new Set(pairs.map(p=>p.sector))] as ComparisonSector[];
 return <section aria-label="Sector stock comparisons" className="space-y-4">
  <div><h2 className="text-xl font-semibold">{onlySector?'More '+onlySector.toLowerCase()+' comparisons':symbol?'Compare '+symbol+' with competitors':all?'All sector comparisons':'Compare within a sector'}</h2>{!symbol&&!onlySector&&<p className="text-sm text-[#A4AEC1] mt-1">{pairs.length} {all?'focused':'selected'} comparisons across {sectors.length} sectors.</p>}</div>
  <div className={'grid gap-3 '+(symbol?'sm:grid-cols-2':'sm:grid-cols-2 lg:grid-cols-3')}>{sectors.map(sector=><div key={sector} className="rounded-xl border border-[#28354A] bg-[#111A2B] p-4"><h3 className="text-xs uppercase tracking-wider text-[#A4AEC1] mb-3">{sector}</h3>{!symbol&&<p className="text-xs text-[#A4AEC1] mb-3">{COMPARISON_SECTORS[sector].summary}</p>}<ul className="space-y-2">{pairs.filter(p=>p.sector===sector).map(p=><li key={p.slug}><Link href={comparisonPath(p)} className="text-sm text-[#B69249] hover:underline">{all?comparisonDirectoryTitle(p):comparisonTitle(p)} →</Link></li>)}</ul></div>)}</div>
  {!symbol&&!onlySector&&!all&&<Link href="/stocks/compare/all" className="inline-flex text-sm text-[#B69249] hover:underline">Browse all {STOCK_COMPARISONS.length} comparisons →</Link>}
 </section>;
}

import Link from 'next/link';
import {STOCK_COMPARISONS,COMPARISON_SECTORS,comparisonPath,comparisonTitle,comparisonsForStock,type ComparisonSector} from '@/lib/stock-comparisons';
export default function CuratedComparisons({symbol,sector:onlySector,exclude}:{symbol?:string;sector?:ComparisonSector;exclude?:string}){
 const pairs=(symbol?comparisonsForStock(symbol):STOCK_COMPARISONS).filter(p=>(!onlySector||p.sector===onlySector)&&p.slug!==exclude);
 if(!pairs.length)return null;
 const sectors=[...new Set(pairs.map(p=>p.sector))] as ComparisonSector[];
 return <section aria-label="Sector stock comparisons" className="space-y-4">
  <div><h2 className="text-xl font-semibold">{onlySector?'More '+onlySector.toLowerCase()+' comparisons':symbol?'Compare '+symbol+' with competitors':'Compare within a sector'}</h2>{!symbol&&!onlySector&&<p className="text-sm text-[#A4AEC1] mt-1">13 focused comparisons across six sectors.</p>}</div>
  <div className={'grid gap-3 '+(symbol?'sm:grid-cols-2':'sm:grid-cols-2 lg:grid-cols-3')}>{sectors.map(sector=><div key={sector} className="rounded-xl border border-[#28354A] bg-[#111A2B] p-4"><h3 className="text-xs uppercase tracking-wider text-[#A4AEC1] mb-3">{sector}</h3>{!symbol&&<p className="text-xs text-[#A4AEC1] mb-3">{COMPARISON_SECTORS[sector].summary}</p>}<ul className="space-y-2">{pairs.filter(p=>p.sector===sector).map(p=><li key={p.slug}><Link href={comparisonPath(p)} className="text-sm text-[#B69249] hover:underline">{comparisonTitle(p)} →</Link></li>)}</ul></div>)}</div>
 </section>;
}

import type {CompanyResearch} from '@/lib/company-research';
import type {StockQuote} from '@/lib/types';
export default function CompanyHealthScore({stock,research}:{stock:StockQuote;research?:CompanyResearch}) {
 const eps=research?.annual.rows.find(r=>r.label==='EPS')?.values[0];
 const quarterEPS=research?.quarterly.rows.find(r=>r.label==='EPS')?.values[0];
 return <section className="rounded-xl border border-[#28354A] bg-[#111A2B] p-5 space-y-4"><h2 className="font-semibold">Fundamentals snapshot</h2><dl className="space-y-3 text-sm">{[['Annual EPS'+(research?.annual.periods[0]?' · FY '+research.annual.periods[0]:''),eps!=null?'Rs '+eps.toFixed(2):'—'],['Quarter EPS'+(research?.quarterly.periods[0]?' · '+research.quarterly.periods[0]:''),quarterEPS!=null?'Rs '+quarterEPS.toFixed(2):'—'],['P/E (TTM)',stock.peRatio===undefined?'—':stock.peRatio.toFixed(2)+'x'],['Dividend yield',stock.dividendYield===undefined?'—':stock.dividendYield.toFixed(2)+'%'],['Market cap',stock.marketCap?'Rs '+(stock.marketCap/1e9).toFixed(2)+'B':'—']].map(([label,value])=><div className="flex justify-between" key={label}><dt className="text-[#A4AEC1]">{label}</dt><dd className="font-mono">{value}</dd></div>)}</dl><a className="text-xs text-[#B69249]" href={'https://dps.psx.com.pk/company/'+stock.symbol} target="_blank" rel="noopener noreferrer">Source: PSX DPS ↗</a></section>;
}

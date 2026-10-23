import type {SupplementalFundamentals,ResearchMetric} from './supplemental-fundamentals';
import {parseCompanyResearch} from './company-research';
// Reviewed issuer statements, PKR thousands. These records expire when PSX publishes a newer FY.
// PPL: FY2026 annual report PDF pages 125-126 and unconsolidated statements.
// OGDC: FY2026 annual report PDF page 40 and statement of financial position.
export const VERIFIED_ANNUALS={
 OGDC:{year:2026,source:'https://dps.psx.com.pk/download/document/283468.pdf',profit:242373646,sales:449190752,equity:1519550164,assets:1852828189,nonCurrentLiabilities:179789127,dividend:17,dividendNote:'Includes final dividend declared after year end; not a paid-cash total.'},
 PPL:{year:2026,source:'https://dps.psx.com.pk/download/document/284662.pdf',profit:98533298,sales:264014554,equity:779535509,assets:1024629695,nonCurrentLiabilities:80602372,dividend:12,dividendNote:'Includes Rs 6 recommended final dividend, subject to AGM approval on 27 October 2026; Rs 6 interim paid.'},
} as const;
export function applyAnnualQuality(data:SupplementalFundamentals,symbol:string,psxHtml:string):SupplementalFundamentals {
 const annual=parseCompanyResearch(psxHtml,'',symbol).annual;
 const latest=Number(annual.periods[0])||undefined;
 const warnings:string[]=[];
 const groups=data.groups.map(g=>({...g,metrics:g.metrics.map(m=>{
  const year=m.period?.match(/^(20\d{2}) Q4$/)?.[1];
  if(latest&&year&&Number(year)<latest&&m.value!==null){warnings.push('Older annual source figures withheld; latest PSX reporting year is FY '+latest+'.');return {...m,value:null,note:'Older FY '+year+' source figure withheld'};}
  return {...m};
 })}));
 const record=VERIFIED_ANNUALS[symbol as keyof typeof VERIFIED_ANNUALS];
 if(record&&latest===record.year){
  const period=record.year+' Q4';
  const values:Record<string,Partial<ResearchMetric>>={
   d:{value:record.dividend,note:record.dividendNote},
   roe:{label:'ROE · year-end equity',value:record.profit/record.equity*100,note:'Annual profit / closing equity; not average-equity ROE.'},
   roa:{label:'ROA · year-end assets',value:record.profit/record.assets*100,note:'Annual profit / closing assets; not average-assets ROA.'},
   npm:{value:record.profit/record.sales*100},
   lde:{label:'Non-current liabilities / equity',value:record.nonCurrentLiabilities/record.equity*100,note:'Includes provisions and deferred tax; not interest-bearing debt.'},
   lda:{label:'Non-current liabilities / assets',value:record.nonCurrentLiabilities/record.assets*100,note:'Includes provisions and deferred tax; not interest-bearing debt.'},
  };
  for(const g of groups)for(const m of g.metrics)if(values[m.id])Object.assign(m,{period,source:record.source,basis:'Unconsolidated',note:undefined},values[m.id]);
  // Other metrics may still be missing or stale; keep their warnings.
  if(!groups.some(g=>g.metrics.some(m=>m.note?.startsWith('Older FY'))))warnings.length=0;
 }
 if(record&&!latest){for(const g of groups)for(const m of g.metrics)if(['d','roe','roa','npm','lde','lda'].includes(m.id))m.value=null;warnings.push('PSX reporting year could not be verified; audited metrics temporarily withheld.');}
 return {...data,groups,latestAnnualYear:latest,warnings:[...new Set(warnings)]};
}

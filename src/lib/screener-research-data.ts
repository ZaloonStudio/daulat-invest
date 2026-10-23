export const RESEARCH_METRICS=[
 {key:'expectedPe',label:'Expected P/E',unit:'×',field:'ExpectedPriceToEarning',id:3,positive:true},
 {key:'priceToBook',label:'Price / book',unit:'×',field:'PriceToBookValue',id:5,positive:true},
 {key:'roa',label:'Return on assets (ROA)',unit:'%',field:'ReturnOnAssets',id:6},
 {key:'roe',label:'Return on equity (ROE)',unit:'%',field:'ReturnOnEquity',id:7},
 {key:'currentRatio',label:'Current ratio',unit:'×',field:'CurrentRatio',id:8,min:0},
 {key:'operatingMargin',label:'Operating margin (EBIT)',unit:'%',field:'EBITMargin',id:9},
 {key:'ebitdaMargin',label:'EBITDA margin',unit:'%',field:'EBITDAMargin',id:10},
 {key:'evEbitda',label:'EV / EBITDA',unit:'×',field:'EnterpriseValueToEBITDA',id:11,positive:true},
 {key:'equityAssets',label:'Equity / assets',unit:'%',field:'EquityToAssetsRatio',id:12},
 {key:'expectedGrowth',label:'Expected earnings growth',unit:'%',field:'ExpectedEarningGowth',id:14},
 {key:'grossMargin',label:'Gross profit margin',unit:'%',field:'GrossProfitMargin',id:19},
 {key:'longDebtAssets',label:'Long-term debt / assets',unit:'%',field:'LongTermDebtToAssets',id:20,min:0},
 {key:'longDebtEquity',label:'Long-term debt / equity',unit:'%',field:'LongTermDebtToEquity',id:21,min:0},
 {key:'netMargin',label:'Net profit margin',unit:'%',field:'NetProfitMargin',id:22},
 {key:'payoutRatio',label:'Payout ratio',unit:'%',field:'PayoutRatio',id:23,min:0},
 {key:'peg',label:'PEG ratio',unit:'×',field:'PriceEarningGrowth',id:24,positive:true},
 {key:'quickRatio',label:'Quick ratio',unit:'×',field:'QuickRatio',id:25,min:0},
 {key:'debtAssets',label:'Total debt / assets',unit:'%',field:'TotalDebtToAssets',id:27,min:0},
 {key:'debtEquity',label:'Total debt / equity',unit:'%',field:'TotalDebtToEquity',id:28,min:0},
] as const;
export type ResearchKey=typeof RESEARCH_METRICS[number]['key'];
export type ScreenerResearchRow={symbol:string;basis:string;values:Partial<Record<ResearchKey,number>>};
export type ScreenerResearch={rows:ScreenerResearchRow[];retrievedAt:string;complete:boolean;unavailable:ResearchKey[];source:string};
export const SCREENER_RESEARCH_SOURCE='https://www.scstrade.com/stocksearch/StockSearch.aspx';
export function parseResearchRows(raw:unknown,metrics:readonly typeof RESEARCH_METRICS[number][]):ScreenerResearchRow[] {
 if(!raw||typeof raw!=='object'||!('d' in raw)||!Array.isArray(raw.d))return [];
 const seen=new Set<string>(),result=new Map<string,ScreenerResearchRow>();
 for(const item of raw.d){
  if(!item||typeof item!=='object'||typeof item.company_symbol!=='string'||typeof item.Company_name!=='string')continue;
  const symbol=item.company_symbol.trim().toUpperCase();if(!/^[A-Z0-9-]{1,20}$/.test(symbol))continue;
  // Ambiguous duplicate symbols are excluded rather than choosing a reporting basis.
  if(seen.has(symbol)){result.delete(symbol);continue;}seen.add(symbol);
  const basis=/\bunconsolidated\b/i.test(item.Company_name)?'Unconsolidated':/\bconsolidated\b/i.test(item.Company_name)?'Consolidated':'Basis not specified';
  const values:Partial<Record<ResearchKey,number>>={};
  for(const spec of metrics){const n=item[spec.field];if(typeof n==='number'&&Number.isFinite(n)&&(!('positive' in spec)||n>0)&&(!('min' in spec)||n>=spec.min))values[spec.key]=n;}
  if(Object.keys(values).length)result.set(symbol,{symbol,basis,values});
 }
 return [...result.values()];
}
export function researchRequest(metrics:readonly typeof RESEARCH_METRICS[number][]) {
 const n=metrics.length;
 // Public screener's own numeric query format. Wide bounds retrieve published values, including losses.
 return {ids:JSON.stringify([n,...metrics.map(m=>[String(m.id)])]),bet:JSON.stringify([n,...metrics.map(()=>['-1000000000','1000000000'])]),gre:JSON.stringify([n,...metrics.map(()=>'Null')]),les:JSON.stringify([n,...metrics.map(()=>'Null')])};
}

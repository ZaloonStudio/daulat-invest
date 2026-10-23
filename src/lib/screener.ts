import type {StockQuote} from './types';

export const SCREENER_METRICS = [
 {key:'current',label:'Price',unit:'PKR',min:0},
 {key:'peRatio',label:'P/E ratio',unit:'×',min:0},
 {key:'dividendYield',label:'Dividend yield',unit:'%',min:0},
 {key:'marketCap',label:'Market cap',unit:'PKR billion',min:0},
 {key:'volume',label:'Trading volume',unit:'shares',min:0},
 {key:'changePercent',label:'Day change',unit:'%'},
 {key:'changeYear',label:'1-year price change',unit:'%'},
] as const;
export type MetricKey=typeof SCREENER_METRICS[number]['key'];
export type RangeFilter={key:MetricKey;min:string;max:string};
export type ScreenerSort=MetricKey|'symbol';
export const defaultRanges=():RangeFilter[]=>['peRatio','dividendYield'].map(key=>({key:key as MetricKey,min:'',max:''}));
export function metricValue(q:StockQuote,key:MetricKey):number|undefined {
 if(key==='volume'&&q.sessionAvailable===false)return undefined;
 const value=q[key];
 if(typeof value!=='number'||!Number.isFinite(value))return undefined;
 if(key==='peRatio'&&value<=0)return undefined;
 if((key==='marketCap'||key==='current')&&value<=0)return undefined;
 if((key==='volume'||key==='dividendYield')&&value<0)return undefined;
 return key==='marketCap'?value/1e9:value;
}
export function rangeError(filter:RangeFilter):string|null {
 const spec=SCREENER_METRICS.find(m=>m.key===filter.key);
 const bounds=[filter.min,filter.max].filter(s=>s.trim()!=='').map(Number);
 if(bounds.some(n=>!Number.isFinite(n)))return 'Enter a valid number.';
 if(spec&&'min' in spec&&bounds.some(n=>n<spec.min))return 'Use zero or a positive value.';
 if(filter.min.trim()!==''&&filter.max.trim()!==''&&Number(filter.min)>Number(filter.max))return 'Min must be less than or equal to max.';
 return null;
}
export function matchesRanges(q:StockQuote,filters:RangeFilter[]):boolean {
 return filters.every(f=>{
  if(rangeError(f))return false;
  if(f.min.trim()===''&&f.max.trim()==='')return true;
  const n=metricValue(q,f.key);
  return n!==undefined&&(f.min.trim()===''||n>=Number(f.min))&&(f.max.trim()===''||n<=Number(f.max));
 });
}
// Transparent large-cap shortlist, not an assessment of investment quality.
// Choose the universe before applying user criteria so lower-ranked stocks never backfill it.
export function blueChipUniverse(quotes:StockQuote[]):Set<string> {
 const unique=new Map<string,StockQuote>();
 for(const q of quotes){
  if(q.isKse100===true&&metricValue(q,'marketCap')!==undefined&&!unique.has(q.symbol))unique.set(q.symbol,q);
 }
 return new Set([...unique.values()].sort((a,b)=>b.marketCap!-a.marketCap!||a.symbol.localeCompare(b.symbol)).slice(0,20).map(q=>q.symbol));
}
export function screenQuotes(quotes:StockQuote[],options:{search:string;sector:string;shariahOnly:boolean;ranges:RangeFilter[];bluechips:boolean;sort:ScreenerSort;order:'asc'|'desc'}):StockQuote[] {
 const universe=options.bluechips?blueChipUniverse(quotes):null;
 const search=options.search.trim().toLowerCase();
 return quotes.filter(q=>(!universe||universe.has(q.symbol))&&(!search||q.symbol.toLowerCase().includes(search)||q.name.toLowerCase().includes(search))&&(options.sector==='ALL'||q.sector===options.sector)&&(!options.shariahOnly||q.isShariah===true)&&matchesRanges(q,options.ranges)).sort((a,b)=>{
  if(options.sort==='symbol')return (options.order==='asc'?1:-1)*a.symbol.localeCompare(b.symbol);
  const av=metricValue(a,options.sort),bv=metricValue(b,options.sort);
  if(av===undefined)return bv===undefined?a.symbol.localeCompare(b.symbol):1;
  if(bv===undefined)return -1;
  return (options.order==='asc'?av-bv:bv-av)||a.symbol.localeCompare(b.symbol);
 });
}
export function screenerCSV(quotes:StockQuote[]):string {
 const cell=(v:string|number|undefined)=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const headings=['Symbol','Company','Sector',...SCREENER_METRICS.map(m=>m.label+' ('+m.unit+')'),'KMI member'];
 return [headings, ...quotes.map(q=>[q.symbol,q.name,q.sector,...SCREENER_METRICS.map(m=>metricValue(q,m.key)),q.isShariah===true?'Yes':'Not listed'])].map(row=>row.map(cell).join(',')).join('\r\n');
}

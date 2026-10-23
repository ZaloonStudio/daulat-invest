import type {StockQuote} from './types';
export function indexCode(value:string){const code=value.trim().toUpperCase();return ({KSEALL:'ALLSHR',KMIALL:'KMIALLSHR'} as Record<string,string>)[code]??code;}
export function indexCompanies(quotes:StockQuote[],code:string):StockQuote[]{
 const requested=indexCode(code),seen=new Set<string>();
 return quotes.filter(q=>{
  const member=(q.listedIndices??'').split(/[,\s]+/).filter(Boolean).map(indexCode).includes(requested);
  if(!member||seen.has(q.symbol))return false;seen.add(q.symbol);return true;
 }).sort((a,b)=>a.symbol.localeCompare(b.symbol));
}
export function indexCompaniesPath(code:string){return '/market?index='+encodeURIComponent(indexCode(code))+'&view=companies';}
export const EXPECTED_INDEX_MEMBERS:Record<string,number>={KSE30:30,KMI30:30,KSE100:100,PSXDIV20:20};

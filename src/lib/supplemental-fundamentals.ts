import {applyAnnualQuality} from './verified-annual';
import {plainText} from './market-source';
export type ResearchMetric={id:string;label:string;value:number|null;unit:'PKR'|'B PKR'|'%'|'x';period:string|null;source?:string;note?:string;basis?:string};
export type SupplementalFundamentals={source:string;retrievedAt:string;basis:'Consolidated'|'Unconsolidated'|'Basis not specified';snapshotPrice:number|null;groups:{title:string;metrics:ResearchMetric[]}[];latestAnnualYear?:number;warnings?:string[]};
export function parseSupplementalFundamentals(html:string,symbol:string,retrievedAt:string):SupplementalFundamentals {
 const spans=new Map([...html.matchAll(/<span\b[^>]*\bid=["']ContentPlaceHolder1_lbl_([a-z0-9]+)["'][^>]*>([\s\S]*?)<\/span>/gi)].map(m=>[m[1].toLowerCase(),plainText(m[2])]));
 const identity=spans.get('companyname')??'';
 const valid=identity.toUpperCase().startsWith(symbol.toUpperCase()+' - ');
 const period=(id:string)=>{const p=spans.get(id+'desc')?.match(/\b(20\d{2})\s+([1-4])Q\b/);return p?`${p[1]} Q${p[2]}`:null;};
 const metric=(id:string,label:string,unit:ResearchMetric['unit']):ResearchMetric=>{
  const source=spans.get(id)??'';
  const raw=source.replace(/^Rs\.?\s*/i,'').replace(/\s*(?:bn|mn|%|x)\s*$/i,'').replace(/,/g,'').trim();
  const n=/^[+-]?\d+(?:\.\d+)?$/.test(raw)?Number(raw):/^\(\d+(?:\.\d+)?\)$/.test(raw)?-Number(raw.slice(1,-1)):NaN;
  // Turnover percentages convert to times; an upstream change to x needs no conversion.
  const scale=id==='at'&&/%\s*$/.test(source)?0.01:unit==='B PKR'&&/mn\s*$/i.test(source)?0.001:1;
  const knownUnits=unit!=='B PKR'||/\b(?:bn|mn)\s*$/i.test(source);
  return {id,label,unit,value:valid&&knownUnits&&Number.isFinite(n)?n*scale:null,period:valid?period(id):null};
 };
 const basis=valid&&/\bunconsolidated\b/i.test(identity)?'Unconsolidated':valid&&/\bconsolidated\b/i.test(identity)?'Consolidated':'Basis not specified';
 return {source:'https://scstrade.com/stockscreening/SS_CompanySnapShot.aspx?symbol='+encodeURIComponent(symbol),retrievedAt,basis,snapshotPrice:metric('price','Source quote','PKR').value,groups:[
  {title:'Annual dividends',metrics:[metric('d','Annual dividend per share','PKR')]},
  {title:'Book value & valuation',metrics:[metric('bv','Book value per share','PKR'),metric('pbv','Price-to-book · source snapshot','x'),metric('ev','Enterprise value · source reported','B PKR'),metric('eve','EV / EBITDA · source reported','x')]},
  {title:'Profitability & returns',metrics:[metric('gpm','Gross profit margin','%'),metric('ebitm','Operating profit margin','%'),metric('npm','Net profit margin','%'),metric('ebitdam','EBITDA margin','%'),metric('roe','Return on equity (ROE)','%'),metric('roa','Return on assets (ROA)','%'),metric('roce','Return on capital employed (ROCE)','%')]},
  {title:'Financial health',metrics:[metric('cr','Current ratio','x'),metric('qr','Quick ratio','x'),metric('it','Inventory turnover','x'),metric('at','Asset turnover','x'),metric('ear','Equity-to-assets','%'),metric('lde','Long-term debt-to-equity','%'),metric('lda','Long-term debt-to-assets','%')]}
 ]};
}
export async function fetchSupplementalFundamentals(symbol:string):Promise<SupplementalFundamentals> {
 const source='https://scstrade.com/stockscreening/SS_CompanySnapShot.aspx?symbol='+encodeURIComponent(symbol);
 const get=async(url:string)=>{try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'},next:{revalidate:3600},signal:AbortSignal.timeout(8000)});return r.ok?await r.text():'';}catch{return '';}};
 const [html,psxHtml]=await Promise.all([get(source),get('https://dps.psx.com.pk/company/'+encodeURIComponent(symbol))]);
 return applyAnnualQuality(parseSupplementalFundamentals(html,symbol,new Date().toISOString()),symbol,psxHtml);
}

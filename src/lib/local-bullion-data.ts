import {plainText} from './market-source';
import {TOLA_GRAMS,type PriceQuote} from './commodity-data';
export type LocalBullionReport={date:string;sourceUrl:string;gold:number;silver:number|null;gold10:number|null;silver10:number|null};
export function bullionArticleLinks(html:string):string[]{
 return [...new Set([...html.matchAll(/href=["']([^"']+)["']/gi)].flatMap(m=>{try{const u=new URL(m[1],'https://mettisglobal.news');return u.origin==='https://mettisglobal.news'&&/^\/Gold-price-in-Pakistan-[a-z0-9-]+-\d+$/i.test(u.pathname)&&!u.username&&!u.password?[u.origin+u.pathname]:[];}catch{return [];}}))].slice(0,3);
}
export function parseLocalBullion(html:string,url:string,now=Date.now()):LocalBullionReport|null {
 if(!bullionArticleLinks('<a href="'+url+'">').includes(url))return null;
 const body=plainText(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,''));
 const dated=body.match(/\b([A-Z][a-z]+ \d{1,2}, 20\d{2})\s*\(MLN\):/);if(!dated)return null;
 const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
 const parts=/([A-Za-z]+) (\d{1,2}), (20\d{2})/.exec(dated[1])!,month=months.indexOf(parts[1]),day=Number(parts[2]),year=Number(parts[3]);
 const utc=Date.UTC(year,month,day),check=new Date(utc);if(month<0||check.getUTCMonth()!==month||check.getUTCDate()!==day)return null;
 const date=check.toISOString().slice(0,10),today=new Date(now+5*3600000).toISOString().slice(0,10);
 if(date>today||now-(utc-5*3600000)>4*86400000)return null;
 // Parse only the dated report, ending before related-news and market-ticker content.
 const text=body.slice(dated.index).split(/Copyright Mettis|Related News/)[0];
 if(!/All-Pakistan Gems and Jewel(?:l)?ers Sarafa Association|APGJSA/i.test(text))return null;
 const number=(pattern:RegExp,min:number,max:number)=>{const raw=text.match(pattern)?.[1],n=raw?Number(raw.replace(/,/g,'')):NaN;return Number.isFinite(n)&&n>=min&&n<=max?n:null;};
 const gold=number(/24-karat gold (?:being|was) sold at Rs\.?\s*([\d,]+) per tola/i,100000,3000000);
 const silver=number(/(?:24-karat )?silver (?:being|was) sold at Rs\.?\s*([\d,]+) per tola/i,1000,200000);
 const gold10=number(/24-karat gold per 10-gram was sold at Rs\.?\s*([\d,]+)/i,50000,3000000);
 const silver10=number(/silver[\s\S]{0,160}?Rs\.?\s*([\d,]+) per 10-gram/i,500,200000);
 if(gold===null)return null;
 if(gold10!==null&&Math.abs(gold10/(gold*10/TOLA_GRAMS)-1)>0.01)return null;
 if(silver!==null&&silver10!==null&&Math.abs(silver10/(silver*10/TOLA_GRAMS)-1)>0.01)return null;
 return {date,sourceUrl:url,gold,silver,gold10,silver10};
}
export function localMetalQuote(report:LocalBullionReport,metal:'gold'|'silver',now=Date.now()):PriceQuote|null {
 const price=report[metal];if(price===null)return null;
 return {value:price/TOLA_GRAMS,per10Grams:metal==='gold'?report.gold10??undefined:report.silver10??undefined,asOf:report.date+'T00:00:00+05:00',dateOnly:true,basis:'local-daily',delayed:report.date<new Date(now+5*3600000).toISOString().slice(0,10),source:'APGJSA · reported by Mettis Global',sourceUrl:report.sourceUrl};
}

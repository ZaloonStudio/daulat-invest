import type {SupplementalFundamentals} from './supplemental-fundamentals';
import {plainText} from './market-source';
export type FinancialTable={periods:string[];rows:{label:string;values:(number|null)[]}[]};
export type CompanyResearch={supplemental?:SupplementalFundamentals;description:string;people:{name:string;role:string}[];contacts:{label:string;value:string;url?:string}[];shares:number|null;freeFloat:number|null;annual:FinancialTable;quarterly:FinancialTable;ratios:FinancialTable;reports:{date:string;title:string;url:string}[];payouts:{date:string;period:string;details:string;bookClosure:string}[];payoutsAvailable:boolean;source:string};
const emptyTable=():FinancialTable=>({periods:[],rows:[]});
export function reportedNumber(s:string):number|null {
 const text=plainText(s).replace(/,/g,'').trim();
 const normalized=/^\([\d.]+\)$/.test(text)?'-'+text.slice(1,-1):text;
 return /^[+-]?\d+(\.\d+)?%?$/.test(normalized)&&Number.isFinite(Number(normalized.replace('%','')))?Number(normalized.replace('%','')):null;
}
const cells=(row:string)=>[...row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c=>c[1]);
export function parseCompanyResearch(html:string,payoutHtml:string,symbol:string):CompanyResearch {
 const section=(id:string)=>{const start=html.indexOf('id="'+id+'"');if(start<0)return '';const next=html.indexOf('<div class="section ',start);return html.slice(start,next<0?undefined:next);};
 const profile=section('profile'),equity=section('equity');
 const tables=[...section('financials').matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)];
 const parseTable=(raw:string):FinancialTable=>{
  const rows=[...raw.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(r=>cells(r[1]));
  const headings=rows.shift()?.map(plainText).slice(1)??[];
  if(!headings.length||!headings.every(h=>/^(?:Q[1-4] )?20\d{2}$/.test(h)))return emptyTable();
  return {periods:headings,rows:rows.filter(r=>r.length===headings.length+1).map(r=>({label:plainText(r[0]),values:r.slice(1).map(reportedNumber)}))};
 };
 const annual=parseTable(tables[0]?.[1]??''),quarterly=parseTable(tables[1]?.[1]??'');
 const ratioTable=section('ratios').match(/<table\b[^>]*>([\s\S]*?)<\/table>/i)?.[1]??'';
 const peopleBlock=profile.match(/profile__item--people">([\s\S]*?)<\/table>/)?.[1]??'';
 const people=[...peopleBlock.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].flatMap(r=>{const c=cells(r[1]).map(plainText);return c.length===2?[{name:c[0],role:c[1]}]:[];});
 const description=plainText(profile.match(/BUSINESS DESCRIPTION<\/div>\s*<p>([\s\S]*?)<\/p>/i)?.[1]??'');
 const contacts=[...profile.matchAll(/class="item__head">([^<]+)<\/div>\s*<p>([\s\S]*?)<\/p>/gi)].flatMap(m=>{
  const label=plainText(m[1]),value=plainText(m[2]);if(label==='BUSINESS DESCRIPTION'||!value)return [];
  let url:string|undefined;try{const u=new URL(m[2].match(/href="([^"]+)"/)?.[1]??'');if(['http:','https:'].includes(u.protocol)&&!u.username&&!u.password)url=u.href;}catch{}
  return [{label,value,url}];
 });
 const equityValues=[...equity.matchAll(/class="stats_label">([\s\S]*?)<\/div><div class="stats_value">([^<]*)/g)];
 const shares=reportedNumber(equityValues.find(m=>plainText(m[1])==='Shares')?.[2]??'');
 const freeFloat=reportedNumber(equityValues.find(m=>plainText(m[1])==='Free Float'&&!m[2].includes('%'))?.[2]??'');
 const reports=[...section('announcements').matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].flatMap(r=>{
  const c=cells(r[1]);if(c.length!==3)return [];const title=plainText(c[1]);
  if(!/financial results|annual report|quarterly report|shariah disclosure/i.test(title))return [];
  const path=c[2].match(/href="(\/download\/(?:document\/\d+|attachment\/[\w-]+)\.pdf)"/)?.[1];
  return path?[{date:plainText(c[0]),title,url:'https://dps.psx.com.pk'+path}]:[];
 });
 const payoutsAvailable=/<th>Financial Results<\/th><th>Details<\/th><th>Book Closure<\/th>/.test(payoutHtml);
 const payouts=payoutsAvailable?[...payoutHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].flatMap(r=>{if(!/<td\b/i.test(r[1]))return [];const c=cells(r[1]).map(plainText);return c.length===4?[{date:c[0],period:c[1],details:c[2],bookClosure:c[3]}]:[];}):[];
 return {description,people,contacts,shares,freeFloat,annual,quarterly,ratios:parseTable(ratioTable),reports,payouts,payoutsAvailable,source:'https://dps.psx.com.pk/company/'+encodeURIComponent(symbol)};
}

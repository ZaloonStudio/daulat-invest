import {fundValuationDate,type FundObservation} from './fund-data';
import {plainText} from './market-source';
export const HBL_FUND_SOURCE='https://hblasset.com/products/';
export const NBP_FUND_SOURCE='https://www.nbpfunds.com/fund-prices/fund-nav-view/';
const navNumber=(raw:unknown):number|null=>{if(typeof raw!=='string'||!/^\d+(?:\.\d+)?$/.test(raw.replace(/,/g,'').trim()))return null;const n=Number(raw.replace(/,/g,''));return Number.isFinite(n)&&n>0?n:null;};
const observation=(name:string,nav:number,date:string):FundObservation=>({name,nav,date,ytd:null,month:null,year:null,threeYears:null,rating:'',returnBasis:'Unspecified'});
export function parseHblFunds(data:unknown,now=Date.now()):FundObservation[] {
 if(!Array.isArray(data))return [];
 return data.flatMap(row=>{
  if(!row||typeof row!=='object'||typeof row.post_title!=='string'||!row.post_title.startsWith('HBL ')||typeof row.nav_updated_date!=='string')return [];
  const nav=navNumber(row.nav_nav),date=fundValuationDate(row.nav_updated_date,now);
  if(nav===null||date===null)return [];
  // Performance fields have a different date and include MTD, not rolling 30D.
  // Do not silently attach them to today's NAV or guess an annualization basis.
  return [{...observation(plainText(row.post_title),nav,date),provider:'HBL' as const,source:HBL_FUND_SOURCE,sourceName:'HBL AMC',navKind:'NAV',rating:typeof row.fund_rating==='string'&&row.fund_rating!=='-'?plainText(row.fund_rating):''}];
 });
}
export function parseNbpFunds(html:string,now=Date.now()):FundObservation[] {
 const output:FundObservation[]=[];
 for(const table of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)){
  let schema=false;
  for(const row of table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
   const cells=[...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c=>plainText(c[1]));
   if(cells.join('|')==='Funds|Offer Price|Redemption Price|Date'){schema=true;continue;}
   if(!schema||cells.length!==4||!cells[0].startsWith('NBP '))continue;
   const nav=navNumber(cells[2]),date=fundValuationDate(cells[3],now);
   if(nav===null||date===null)continue;
   // NBP's own FAQ defines its redemption price as NAV; retain that label.
   output.push({...observation(cells[0],nav,date),provider:'NBP',source:NBP_FUND_SOURCE,sourceName:'NBP Funds',navKind:'NAV / redemption'});
  }
 }
 return output;
}

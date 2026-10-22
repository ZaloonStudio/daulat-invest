import type { MutualFund } from './mutualFundsData';
export type ReportFund = Omit<MutualFund,'nav'|'return1M'|'returnYTD'|'return1Y'|'return3Y'|'aumBillion'> & {
  returnBasis?:'Annualized'|'Absolute'|'Unspecified';
  nav:number|null;return1M:number|null;returnYTD:number|null;return1Y:number|null;return3Y:number|null;aumBillion:number|null;
};
export const FUND_SOURCE = 'https://www.mufap.com.pk/Industry/IndustryStatDaily?tab=1';
const text = (value:string) => value.replace(/<[^>]*>/g,' ').replace(/&amp;/gi,'&').replace(/&nbsp;|&#160;/gi,' ').replace(/&#39;|&apos;/gi,"'").replace(/&quot;/gi,'"').replace(/\s+/g,' ').trim();
const key = (value:string) => value.toLowerCase().replace(/[^a-z0-9]/g,'');
function number(value:string):number|null {
  const clean=value.replace(/,/g,'').replace(/%$/,'').trim();
  if (!/^[+-]?\d+(\.\d+)?$/.test(clean)) return null;
  const n=Number(clean);return Number.isFinite(n)?n:null;
}
export type FundObservation = { returnBasis?:'Annualized'|'Absolute'|'Unspecified'; name:string;nav:number;date:string;ytd:number|null;month:number|null;year:number|null;threeYears:number|null;rating:string };
export function parseFundReport(html:string, now=Date.now()):FundObservation[] {
  const output:FundObservation[]=[];
  for(const table of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    let columns:string[]=[];
    let returnBasis:FundObservation['returnBasis']='Unspecified';
    for(const row of table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells=[...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell=>text(cell[1]));
      const group=cells.join(' ');
      if (/Annualized Return/i.test(group)) {returnBasis='Annualized';continue;}
      if (/Absolute Return/i.test(group)) {returnBasis='Absolute';continue;}
      if(cells.some(cell=>key(cell)==='fundname')&&cells.some(cell=>key(cell)==='nav')) {columns=cells.map(key);continue;}
      const i=(name:string)=>columns.indexOf(name);
      if(i('fundname')<0||i('validitydate')<0||i('nav')<0||cells.length!==columns.length)continue;
      const rawDate=cells[i('validitydate')];
      // MUFAP publishes English month names; reject ambiguous numeric dates.
      if(!/^[A-Za-z]{3,9} \d{1,2},? \d{4}$/.test(rawDate))continue;
      const dateMs=Date.parse(rawDate+' 00:00:00 GMT+0500');
      const nav=number(cells[i('nav')]);
      if(!Number.isFinite(dateMs)||dateMs>now+300000||dateMs<946684800000||nav===null||nav<=0)continue;
      const value=(column:string)=>i(column)<0?null:number(cells[i(column)]);
      output.push({returnBasis,name:cells[i('fundname')],date:rawDate,nav,ytd:value('ytd'),month:value('30days'),year:value('365days'),threeYears:value('3years'),rating:i('rating')<0?'':cells[i('rating')]});
    }
  }
  return output;
}
export function applyFundReport(catalog:MutualFund[], observations:FundObservation[]):ReportFund[] {
  return catalog.map(fund=>{
    const matches=observations.filter(item=>key(item.name)===key(fund.name));
    // Ambiguous funds/plans must not be merged into a different investment.
    const observation=matches.length===1?matches[0]:undefined;
    return {...fund,returnBasis:observation?.returnBasis??'Unspecified',nav:observation?.nav??null,navDate:observation?.date??'Unavailable',return1M:observation?.month??null,returnYTD:observation?.ytd??null,return1Y:observation?.year??null,return3Y:observation?.threeYears??null,aumBillion:null,rating:observation?.rating||undefined,managementFee:'See AMC report',frontendLoad:'See AMC report'};
  });
}
export function fundNumber(value:number|null|undefined,digits=2):string {return typeof value==='number'&&Number.isFinite(value)?value.toFixed(digits):'—';}
export function fundReturn(value:number|null|undefined):string {return typeof value==='number'&&Number.isFinite(value)?(value>0?'+':'')+value.toFixed(2)+'%':'—';}

export function fundIsDelayed(date:string,now=Date.now()):boolean {const time=Date.parse(date+' 00:00:00 GMT+0500');return !Number.isFinite(time)||now-time>72*3600000;}

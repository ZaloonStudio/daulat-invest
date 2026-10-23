import type {NewsArticle,StockQuote} from './types';
export const NEWS_MAX_AGE_MS=14*86400000;
const normalized=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
export function mergeNews(articles:NewsArticle[]):NewsArticle[] {
 const sorted=[...articles].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a.link.localeCompare(b.link));
 const parents=sorted.map((_,i)=>i),urls=new Map<string,number>(),titles=new Map<string,number>();
 const root=(i:number):number=>parents[i]===i?i:(parents[i]=root(parents[i]));
 const join=(a:number,b:number)=>{parents[root(a)]=root(b);};
 sorted.forEach((a,i)=>{
  const u=new URL(a.link),id=u.pathname.match(/^\/(?:news|story)\/(\d+)/)?.[1];
  const urlKey=a.source+':'+(id??a.link),titleKey=a.source+':'+normalized(a.title);
  if(urls.has(urlKey))join(i,urls.get(urlKey)!);
  if(titles.has(titleKey))join(i,titles.get(titleKey)!);
  urls.set(urlKey,i);titles.set(titleKey,i);
 });
 const seen=new Set<number>();
 return sorted.filter((_,i)=>{const group=root(i);if(seen.has(group))return false;seen.add(group);return true;}).slice(0,50);
}
export function newsDateLabel(date:string):string {
 return new Date(date).toLocaleString('en-GB',{timeZone:'Asia/Karachi',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})+' PKT';
}
export function newsIsOlder(date:string,now=Date.now()):boolean {return now-Date.parse(date)>72*3600000;}
const COMPANY_NAMES:Record<string,string[]>={PRL:['Pakistan Refinery'],MEBL:['Meezan Bank'],LUCK:['Lucky Cement'],HUBC:['Hub Power'],KEL:['K Electric'],SYS:['Systems Limited'],PPL:['Pakistan Petroleum'],OGDC:['Oil and Gas Development Company'],HBL:['Habib Bank'],PTC:['PTCL']};
export function companyNews(articles:NewsArticle[],stock:Pick<StockQuote,'symbol'|'name'>):NewsArticle[] {
 const base=normalized(stock.name).replace(/^the /,'').replace(/ (?:limited|ltd|plc)$/,'');
 const full=normalized(stock.name);
 const names=[...(full.split(' ').length>=2?[full]:[]),...(base.split(' ').length>=2?[base]:[]),...(COMPANY_NAMES[stock.symbol]??[]).map(normalized)].filter(Boolean);
 const symbol=stock.symbol.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const ticker=new RegExp('(?:\\bPSX\\s*[:\\-]\\s*'+symbol+'\\b|\\$'+symbol+'\\b)','i');
 const parenthesized=/[A-Z]/.test(stock.symbol)?new RegExp('\\('+symbol+'\\)'):null;
 return articles.filter(a=>{const title=' '+normalized(a.title)+' ';return ticker.test(a.title)||parenthesized?.test(a.title)||names.some(name=>title.includes(' '+name+' '));}).slice(0,5);
}

import {cache} from 'react';
import {bullionArticleLinks,parseLocalBullion,type LocalBullionReport} from './local-bullion-data';
async function read(url:string){try{const r=await fetch(url,{next:{revalidate:1800},signal:AbortSignal.timeout(8000)});return r.ok?await r.text():'';}catch{return '';}}
export const getLocalBullion=cache(async():Promise<LocalBullionReport|null>=>{
 const links=bullionArticleLinks(await read('https://mettisglobal.news/Commodities'));
 const reports=(await Promise.all(links.map(async url=>parseLocalBullion(await read(url),url)))).filter((r):r is LocalBullionReport=>r!==null);
 return reports.sort((a,b)=>b.date.localeCompare(a.date))[0]??null;
});

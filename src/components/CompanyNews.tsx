import type {NewsArticle} from '@/lib/types';
import {newsDateLabel,newsIsOlder} from '@/lib/news-quality';
export default function CompanyNews({articles,available}:{articles:NewsArticle[];available:boolean}) {
 return <section className="rounded-xl border border-[#28354A] bg-[#111A2B] p-5"><h2 className="font-semibold mb-3">Company news</h2>{articles.length?<ul className="divide-y divide-[#28354A]">{articles.map(a=><li key={a.id} className="py-3"><p className="text-[11px] text-[#A4AEC1] mb-1">{a.source} · {newsDateLabel(a.publishedAt)}{newsIsOlder(a.publishedAt)?' · Older headline':''}</p><a className="text-sm hover:text-[#B69249]" href={a.link} target="_blank" rel="noopener noreferrer">{a.title} ↗</a></li>)}</ul>:<p className="text-xs text-[#A4AEC1]">{available?'No company-specific headlines matched in the current 14-day feed.':'Publisher news feed unavailable.'}</p>}</section>;
}

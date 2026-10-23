import type {NewsFeedStatus} from '@/lib/news-feed';
export default function NewsFeedStatusBar({statuses}:{statuses:NewsFeedStatus[]}) {
 return <p role="status" className="text-[11px] text-[#A4AEC1] flex flex-wrap gap-x-4 gap-y-1">{statuses.map(s=><span key={s.source}><a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#B69249]">{s.source} ↗</a> · {s.status==='available'?`${s.count} headlines`:s.status==='unavailable'?'Feed unavailable':'No recent headlines'}</span>)}</p>;
}

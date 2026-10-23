import {parseNewsFeed} from './market-source';
import {mergeNews} from './news-quality';
export type NewsFeedStatus={source:'DAWN'|'TRIBUNE';url:string;status:'available'|'unavailable'|'no-recent-headlines';count:number};
export async function fetchNewsSnapshot() {
 const feeds=[{url:'https://www.dawn.com/feeds/business',page:'https://www.dawn.com/business',source:'DAWN' as const},{url:'https://tribune.com.pk/feed/business',page:'https://tribune.com.pk/business',source:'TRIBUNE' as const}];
 const results=await Promise.all(feeds.map(async feed=>{
  try{
   const response=await fetch(feed.url,{next:{revalidate:300},signal:AbortSignal.timeout(8000)});
   const xml=response.ok?await response.text():'';
   if(!/<rss\b/i.test(xml)||!/<channel\b/i.test(xml))throw new Error('Feed unavailable');
   const articles=parseNewsFeed(xml,feed.source);
   return {articles,state:{source:feed.source,url:feed.page,status:articles.length?'available':'no-recent-headlines',count:articles.length} as NewsFeedStatus};
  }catch{return {articles:[],state:{source:feed.source,url:feed.page,status:'unavailable',count:0} as NewsFeedStatus};}
 }));
 const articles=mergeNews(results.flatMap(r=>r.articles));
 return {articles,statuses:results.map(r=>r.state),available:articles.length>0};
}

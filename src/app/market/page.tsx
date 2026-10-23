import {indexCode} from '@/lib/index-members';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {getMarketSummary,fetchMarketWatch} from '@/lib/psx';
import {pageMetadata} from '@/lib/seo';
import MarketClient from './MarketClient';
export const revalidate=30;
export const metadata=pageMetadata('/market','PSX Market Overview, Indices & Movers','Explore all PSX indices, KSE 100 charts, market movers, top gainers, losers, volume leaders and sector performance.');
export default async function MarketPage({searchParams}:{searchParams?:{index?:string;view?:string}}){
 const [summary,quotes]=await Promise.all([getMarketSummary(),fetchMarketWatch()]);
 const requested=indexCode(typeof searchParams?.index==='string'?searchParams.index:'');
 const selected=summary.indices.some(i=>i.code===requested)?requested:summary.indices.find(i=>i.code==='KSE100')?.code??summary.indices[0]?.code??'KSE100';
 const view=searchParams?.view==='chart'?'chart':requested&&summary.indices.some(i=>i.code===requested)?'companies':'chart';
 return <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]"><Navbar/><main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"><div><p className="eyebrow mb-3">PAKISTAN STOCK EXCHANGE</p><h1 className="text-3xl sm:text-4xl font-semibold">The market, in detail.</h1><p className="text-sm text-[#A4AEC1] mt-3">All indices, market movers and sector performance.</p></div><MarketClient summary={summary} quotes={quotes} initialIndex={selected} initialView={view}/></main><Footer/></div>;
}

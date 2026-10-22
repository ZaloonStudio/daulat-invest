import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {getMarketSummary,fetchMarketWatch} from '@/lib/psx';
import {pageMetadata} from '@/lib/seo';
import MarketClient from './MarketClient';
export const revalidate=30;
export const metadata=pageMetadata('/market','PSX Market Overview, Indices & Movers','Explore all PSX indices, KSE 100 charts, market movers, top gainers, losers, volume leaders and sector performance.');
export default async function MarketPage(){
 const [summary,quotes]=await Promise.all([getMarketSummary(),fetchMarketWatch()]);
 return <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]"><Navbar/><main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"><div><p className="eyebrow mb-3">PAKISTAN STOCK EXCHANGE</p><h1 className="text-3xl sm:text-4xl font-semibold">The market, in detail.</h1><p className="text-sm text-[#A4AEC1] mt-3">All indices, market movers and sector performance.</p></div><MarketClient summary={summary} quotes={quotes}/></main><Footer/></div>;
}

import {fetchNewsSnapshot} from '@/lib/news-feed';
import {companyNews} from '@/lib/news-quality';
import { pageMetadata, SITE_URL, jsonLd as serializeJsonLd } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { fetchMarketWatch, fetchStockHistory, fetchTimeseries, fetchCompanyAnnouncements, fetchCompanyResearch } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StockHistoryChart from '@/components/StockHistoryChart';
import CompanyHealthScore from '@/components/CompanyHealthScore';
import StockDetailTabs from '@/components/StockDetailTabs';
import {CompanyFundamentals,CompanyProfile,CompanyTechnicals} from '@/components/CompanyResearchPanels';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Activity,
} from 'lucide-react';

interface Props {
  params: { symbol: string };
}

export const revalidate = 30; // Revalidate every 30 seconds

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const symbol = params.symbol.toUpperCase();
  const quotes = await fetchMarketWatch();
  const quote = quotes.find((q) => q.symbol.toUpperCase() === symbol);

  if (!quote) {
    return {
      title: `${symbol} Stock Price & Live Chart - Daulat Invest`,
    };
  }

  return pageMetadata('/stocks/' + symbol, symbol + ' Share Price & Chart — ' + quote.name,
    'Explore ' + quote.name + ' (' + symbol + ') on the Pakistan Stock Exchange: share price, historical charts, company fundamentals, dividends and announcements.');
}

export default async function StockDetailPage({ params }: Props) {
  const symbol = params.symbol.toUpperCase();
  if (params.symbol !== symbol) permanentRedirect('/stocks/' + encodeURIComponent(symbol));
  const [quotes, history, kseHistory, announcements, research, news] = await Promise.all([
    fetchMarketWatch(),
    fetchStockHistory(symbol),
    fetchTimeseries('KSE100', false),
    fetchCompanyAnnouncements(symbol),
    fetchCompanyResearch(symbol),
    fetchNewsSnapshot(),
  ]);

  const quote = quotes.find((q) => q.symbol.toUpperCase() === symbol);

  if (!quotes.length) throw new Error('PSX data temporarily unavailable');
  if (!quote) {
    notFound();
  }

  const isPositive = quote.change >= 0;
  const relatedStocks = quotes
    .filter((q) => q.sector === quote.sector && q.symbol !== quote.symbol)
    .sort((a,b)=>(b.marketCap??0)-(a.marketCap??0)).slice(0, 10);

  const jsonLd = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebPage', '@id': SITE_URL + '/stocks/' + symbol, url: SITE_URL + '/stocks/' + symbol,
        name: quote.name + ' (' + symbol + ') Share Price & Chart', isPartOf: { '@id': SITE_URL + '/#website' },
        about: { '@type': 'Corporation', name: quote.name, tickerSymbol: 'PSX:' + symbol } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Markets', item: SITE_URL + '/market' },
        { '@type': 'ListItem', position: 2, name: 'PSX stocks', item: SITE_URL + '/stocks' },
        { '@type': 'ListItem', position: 3, name: symbol, item: SITE_URL + '/stocks/' + symbol }
      ] }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs text-[#A4AEC1]">
          <Link href="/market" className="hover:text-[#EFF3FA] transition-colors flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Markets</span>
          </Link>
          <span>/</span>
          <Link href="/stocks" className="hover:text-[#EFF3FA] transition-colors">
            Stocks
          </Link>
          <span>/</span>
          <span className="text-[#B69249] font-semibold">{quote.symbol}</span>
        </div>

        {/* Stock Hero Header */}
        <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <span className="text-2xl sm:text-3xl font-semibold text-[#EFF3FA] tracking-tight">
                {quote.symbol}
              </span>
              <span className="text-xs bg-[#1C2940] text-[#B69249] font-semibold px-2.5 py-1 rounded-lg border border-[#28354A]">
                PSX: {quote.symbol}
              </span>
              <span className="text-xs text-[#A4AEC1] bg-[#0B1120] px-2.5 py-1 rounded-lg border border-[#28354A]">
                {quote.sector}
              </span>
            </div>
            <h1 className="text-sm sm:text-base text-[#A4AEC1] font-medium">{quote.name}</h1>
          </div>

          {/* Price & Change Box */}
          <div className="text-left md:text-right">
            <div className="text-3xl sm:text-4xl font-mono font-semibold text-[#EFF3FA] tracking-tight">
              Rs {quote.current.toFixed(2)}
            </div>
            <div
              className={`inline-flex items-center space-x-1 text-sm sm:text-base font-mono font-semibold mt-1 ${
                isPositive ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}
                {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
                {quote.changePercent.toFixed(2)}%)
              </span>
              <span className="text-xs text-[#A4AEC1] ml-1.5 font-normal">Session change</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#A4AEC1]">PSX DPS snapshot · {quote.updatedAt ? new Date(quote.updatedAt).toLocaleString('en-GB', {timeZone:'Asia/Karachi'}) + ' PKT' : 'Source timestamp unavailable'}</p>
        <StockDetailTabs companyNews={companyNews(news.articles,quote)} newsAvailable={news.available} stock={quote} peers={relatedStocks} announcements={announcements.filter(a => a.symbol.toUpperCase() === symbol)} fundamentals={<CompanyFundamentals stock={quote} data={research}/>} technicals={<CompanyTechnicals history={history}/>} profile={<CompanyProfile stock={quote} data={research}/>} overview={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <StockHistoryChart
              symbol={quote.symbol}
              history={history}
              kseHistory={kseHistory}
              marketCap={quote.marketCap}
              currentPrice={quote.current}
              change={quote.change}
            />
          </div>

          {/* Right Column: Daulat Health Score (Sarmaaya Score) & Stats */}
          <div className="lg:col-span-4 space-y-4">
            <CompanyHealthScore stock={quote} research={research} />

            <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5 shadow-xl">
              <h2 className="text-sm font-semibold text-[#EFF3FA] uppercase tracking-wider mb-4 border-b border-[#28354A] pb-3 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#B69249]" />
                <span>Trading Statistics</span>
              </h2>

              <div className="divide-y divide-[#28354A]/60 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Day High</span>
                  <span className="font-mono font-semibold text-[#EFF3FA]">
                    Rs {quote.sessionAvailable===false || !quote.high ? '—' : quote.high.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Day Low</span>
                  <span className="font-mono font-semibold text-[#EFF3FA]">
                    Rs {quote.sessionAvailable===false || !quote.low ? '—' : quote.low.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Opening Price</span>
                  <span className="font-mono font-semibold text-[#EFF3FA]">
                    Rs {quote.sessionAvailable===false || !quote.open ? '—' : quote.open.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Previous Close (LDCP)</span>
                  <span className="font-mono font-semibold text-[#EFF3FA]">
                    Rs {quote.ldcp.toFixed(2)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Trading Volume</span>
                  <span className="font-mono font-semibold text-[#B69249]">
                    {quote.sessionAvailable===false?'—':quote.volume.toLocaleString()} shares
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#A4AEC1]">Market</span>
                  <span className="text-[#EFF3FA] font-semibold">PSX Ready Board (REG)</span>
                </div>
              </div>
            </div>


          </div>
        </div>

        } />


      </main>

      <Footer />
    </div>
  );
}

import {fetchMarketWatch} from '@/lib/psx';
import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DividendCalculatorView from './DividendCalculatorView';

export const metadata: Metadata = pageMetadata("/dividend-calculator", "PSX Dividend Yield Calculator", "Estimate dividend income and yield for Pakistan Stock Exchange shares. Compare dividend opportunities and calculate investment income.");

export default async function DividendCalculatorPage() {
  const quotes=await fetchMarketWatch();
  const presets=quotes.filter(q=>q.current>0&&(q.dividendYield??0)>0&&q.isKse100).sort((a,b)=>(b.dividendYield??0)-(a.dividendYield??0)).slice(0,6).map(q=>({symbol:q.symbol,name:q.name,sector:q.sector,price:q.current,yield:q.dividendYield!,dps:q.current*q.dividendYield!/100}));
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DividendCalculatorView presets={presets} />
      </main>

      <Footer />
    </div>
  );
}

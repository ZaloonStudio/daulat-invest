import {fetchMarketWatch} from '@/lib/psx';
import {fetchSupplementalFundamentals} from '@/lib/supplemental-fundamentals';
import {annualDividend,annualYield} from '@/lib/annual-dividend';
import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DividendCalculatorView from './DividendCalculatorView';

export const metadata: Metadata = pageMetadata("/dividend-calculator", "PSX Dividend Yield Calculator", "Estimate dividend income and yield for Pakistan Stock Exchange shares. Compare dividend opportunities and calculate investment income.");

export default async function DividendCalculatorPage() {
  const quotes=await fetchMarketWatch();
  const candidates=['FFC','FATIMA','EFERT','UBL','MCB','MEBL'].flatMap(s=>{const q=quotes.find(q=>q.symbol===s);return q&&q.current>0?[q]:[];});
  const presets=(await Promise.all(candidates.map(async q=>{
    const dividend=annualDividend(await fetchSupplementalFundamentals(q.symbol)),yieldValue=annualYield(dividend,q.current);
    return yieldValue!==null&&dividend.cashPerShare!==null&&dividend.financialYear!==null?[{symbol:q.symbol,name:q.name,sector:q.sector,price:q.current,yield:yieldValue,dps:dividend.cashPerShare,financialYear:dividend.financialYear}]:[];
  }))).flat();
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

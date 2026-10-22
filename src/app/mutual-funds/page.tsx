import { pageMetadata } from '@/lib/seo';
import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MutualFundsClient from '@/components/MutualFundsClient';
import { Layers } from 'lucide-react';

export const revalidate = 300; // 5 minute cache

export const metadata: Metadata = pageMetadata("/mutual-funds", "Pakistan Mutual Funds & NAV Comparison", "Explore Pakistani mutual funds by asset manager, category, NAV, historical returns, risk and Shariah compliance.");

export default function MutualFundsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Pakistan Mutual Funds Directory - Daulat Invest',
    description:
      'Comprehensive catalog of Pakistani mutual funds, including Islamic Money Market, Income, Equity, and Sovereign funds.',
    url: 'https://www.daulatinvest.com/mutual-funds',
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B69249] uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Asset Management Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#EFF3FA] tracking-tight">
            Mutual funds
          </h1>
          <p className="text-xs sm:text-sm text-[#A4AEC1] mt-1 max-w-3xl leading-relaxed">
            Compare daily Net Asset Values (NAVs), multi-period returns, risk rankings, and Shariah compliance
            across Pakistan&apos;s leading Asset Management Companies (AMCs) benchmarked against MUFAP.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-12 text-center text-sm text-[#A4AEC1]">
              Loading Pakistan mutual funds directory...
            </div>
          }
        >
          <MutualFundsClient />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

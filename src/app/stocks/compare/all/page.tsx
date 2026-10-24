import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CuratedComparisons from '@/components/CuratedComparisons';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('/stocks/compare/all','PSX Stock Comparisons by Sector','Browse focused PSX stock comparisons across banking, automobiles, fertilizer, oil and gas, cement, technology, power and more. Compare prices, dividends and dated financial ratios.');
export default function ComparisonDirectory(){return <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]"><Navbar/><main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7"><Link href="/stocks/compare" className="text-sm text-[#B69249]">← Back to stock comparison</Link><header><h1 className="text-3xl sm:text-4xl font-semibold">Stock comparisons by sector</h1><p className="text-sm text-[#A4AEC1] mt-3 max-w-2xl">Find familiar PSX companies and compare their valuation, dividends and financial performance.</p></header><CuratedComparisons all/></main><Footer/></div>;}

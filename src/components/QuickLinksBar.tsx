import Link from 'next/link';
import {GitCompare,Gauge,Calculator,TrendingUp,Moon,Filter,PieChart,ArrowUpRight} from 'lucide-react';

const research=[
 {label:'Stock screener',href:'/stocks/screener',icon:Filter,description:'Find stocks that fit your criteria.'},
 {label:'Stock comparison',href:'/stocks/compare',icon:GitCompare,description:'See companies side by side.'},
 {label:'Mutual funds',href:'/mutual-funds',icon:PieChart,description:'Explore funds and their performance.'},
];
const supporting=[
 {label:'Dividend calculator',href:'/dividend-calculator',icon:Calculator},
 {label:'SIP calculator',href:'/sip-calculator',icon:TrendingUp},
 {label:'Shariah investing',href:'/shariah',icon:Moon},
 {label:'Fear & greed',href:'/fear-greed',icon:Gauge},
];
export default function QuickLinksBar(){
 return <section aria-labelledby="research-tools-heading" className="research-tools">
  <div className="flex flex-wrap items-end justify-between gap-2 mb-5"><div><p className="eyebrow mb-2">RESEARCH & PLAN</p><h2 id="research-tools-heading" className="text-xl sm:text-2xl font-semibold tracking-tight">Your research toolkit</h2></div></div>
  <div className="research-primary-grid">
   {research.map(tool=><Link key={tool.href} href={tool.href} className="research-primary-card"><div className="flex items-start justify-between gap-3"><span className="research-icon"><tool.icon aria-hidden="true" className="w-5 h-5"/></span><ArrowUpRight aria-hidden="true" className="research-arrow w-4 h-4"/></div><div><h3 className="text-base sm:text-lg font-semibold tracking-tight">{tool.label}</h3><p className="research-description text-xs sm:text-sm mt-1.5 leading-relaxed">{tool.description}</p></div></Link>)}
  </div>
  <nav aria-label="More research tools" className="research-supporting-grid">
   {supporting.map(tool=><Link key={tool.href} href={tool.href} className="research-supporting-link"><tool.icon aria-hidden="true" className="w-4 h-4 shrink-0"/><span>{tool.label}</span><ArrowUpRight aria-hidden="true" className="research-arrow w-3.5 h-3.5 ml-auto shrink-0"/></Link>)}
  </nav>
 </section>;
}

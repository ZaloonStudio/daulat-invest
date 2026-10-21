'use client';
import { useEffect, useState, type ReactNode, type KeyboardEvent } from 'react';
import Link from 'next/link';
import StockResearchConsole from './StockResearchConsole';
import CompanyAnnouncementsSection from './CompanyAnnouncementsSection';
import { StockQuote, CompanyAnnouncement } from '@/lib/types';
import { STOCK_TABS, StockTabId, stockTabFromHash } from '@/lib/stock-tabs';

export default function StockDetailTabs({ stock, peers, announcements, overview }: { stock: StockQuote; peers: StockQuote[]; announcements: CompanyAnnouncement[]; overview: ReactNode }) {
  const [active, setActive] = useState<StockTabId>('overview-section');
  useEffect(() => {
    const sync = () => setActive(stockTabFromHash(window.location.hash));
    sync(); window.addEventListener('hashchange', sync); window.addEventListener('popstate', sync);
    return () => { window.removeEventListener('hashchange', sync); window.removeEventListener('popstate', sync); };
  }, [stock.symbol]);
  const select = (id: StockTabId) => {
    setActive(id);
    if (window.location.hash !== '#' + id) window.history.pushState(null, '', '#' + id);
  };
  const keyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % STOCK_TABS.length;
    else if (event.key === 'ArrowLeft') next = (index + STOCK_TABS.length - 1) % STOCK_TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = STOCK_TABS.length - 1;
    else return;
    event.preventDefault(); select(STOCK_TABS[next][0]); document.getElementById('tab-' + STOCK_TABS[next][0])?.focus();
  };
  const researchSections: Partial<Record<StockTabId, 'peers' | 'ratios' | 'dividends' | 'shariah'>> = {'peers-section':'peers', 'ratios-section':'ratios', 'dividends-section':'dividends', 'shariah-section':'shariah'};
  const research = researchSections[active];
  const source = 'https://dps.psx.com.pk/company/' + encodeURIComponent(stock.symbol);
  return <div className="space-y-6">
    <div role="tablist" aria-label="Stock research" className="border-b border-[#28354A] flex gap-6 overflow-x-auto text-xs font-semibold text-[#A4AEC1] px-1">
      {STOCK_TABS.map(([id,label], index) => <button key={id} id={'tab-'+id} role="tab" aria-selected={active === id} aria-controls={id} tabIndex={active === id ? 0 : -1} onClick={() => select(id)} onKeyDown={event => keyboard(event,index)} className={active === id ? 'shrink-0 pb-4 pt-2 text-[#B69249] border-b-2 border-[#B69249]' : 'shrink-0 pb-4 pt-2 hover:text-[#EFF3FA]'}>{label}</button>)}
    </div>
    <div role="tabpanel" id={active} aria-labelledby={'tab-'+active} tabIndex={0} className="stock-tab-panel">
      {active === 'overview-section' && overview}
      {research && <StockResearchConsole stock={stock} peers={peers} section={research} />}
      {active === 'financials-section' && <section className="bg-[#111A2B] border border-[#28354A] rounded-xl p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-semibold">Financial statements</h2>
        <p className="text-sm text-[#A4AEC1] leading-relaxed max-w-2xl">Read {stock.name}’s annual and quarterly reports, income statements, balance sheets, and cash-flow statements on the official PSX company page.</p>
        <p className="text-xs text-[#7F8DA4]">The current quote feed does not include financial statements. Open the source reports for these figures.</p>
        <a href={source + '#financials'} target="_blank" rel="noopener noreferrer" className="inline-flex primary-action px-5 py-3 text-sm">View PSX financial reports ↗</a>
      </section>}
      {active === 'announcements-section' && <section className="space-y-5">
        {announcements.length ? <CompanyAnnouncementsSection announcements={announcements} /> : <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-8 space-y-3"><h2 className="text-xl font-semibold">{stock.symbol} announcements</h2><p className="text-sm text-[#A4AEC1]">No {stock.symbol} announcements are available in the current feed.</p></div>}
        <a href={source + '#announcements'} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm text-[#B69249] hover:underline">Browse {stock.symbol} filings on PSX ↗</a>
        <Link href="/announcements" className="block text-xs text-[#A4AEC1] hover:text-[#B69249]">View all company announcements</Link>
      </section>}
      {active === 'company-info-section' && <section className="bg-[#111A2B] border border-[#28354A] rounded-xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-semibold">About {stock.name}</h2>
        <dl className="grid sm:grid-cols-2 gap-5 text-sm">{[['Company',stock.name],['Symbol',stock.symbol],['Exchange','Pakistan Stock Exchange'],['Sector',stock.sector],['Listed indices',stock.listedIndices || 'Not supplied by the current feed']].map(([label,value]) => <div key={label}><dt className="text-xs text-[#7F8DA4] mb-1">{label}</dt><dd>{value}</dd></div>)}</dl>
        <a href={source} target="_blank" rel="noopener noreferrer" className="inline-flex primary-action px-5 py-3 text-sm">Official company profile ↗</a>
      </section>}
    </div>
  </div>;
}

'use client';
import { useEffect, useState, type ReactNode, type KeyboardEvent } from 'react';
import Link from 'next/link';
import CompanyNews from './CompanyNews';
import StockResearchConsole from './StockResearchConsole';
import CompanyAnnouncementsSection from './CompanyAnnouncementsSection';
import { StockQuote, CompanyAnnouncement, NewsArticle } from '@/lib/types';
import { STOCK_TABS, StockTabId, stockTabFromHash } from '@/lib/stock-tabs';

export default function StockDetailTabs({ companyNews,newsAvailable,stock, peers, announcements, overview, fundamentals, technicals, profile }: { companyNews:NewsArticle[];newsAvailable:boolean;stock: StockQuote; peers: StockQuote[]; announcements: CompanyAnnouncement[]; overview: ReactNode; fundamentals:ReactNode; technicals:ReactNode; profile:ReactNode }) {
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
  const source = 'https://dps.psx.com.pk/company/' + encodeURIComponent(stock.symbol);
  return <div className="space-y-6">
    <div role="tablist" aria-label="Stock research" className="border-b border-[#28354A] flex gap-6 overflow-x-auto text-xs font-semibold text-[#A4AEC1] px-1">
      {STOCK_TABS.map(([id,label], index) => <button key={id} id={'tab-'+id} role="tab" aria-selected={active === id} aria-controls={id} tabIndex={active === id ? 0 : -1} onClick={() => select(id)} onKeyDown={event => keyboard(event,index)} className={active === id ? 'shrink-0 pb-4 pt-2 text-[#B69249] border-b-2 border-[#B69249]' : 'shrink-0 pb-4 pt-2 hover:text-[#EFF3FA]'}>{label}</button>)}
    </div>
    {STOCK_TABS.map(([id])=><section key={id} role="tabpanel" id={id} aria-labelledby={'tab-'+id} hidden={active!==id} tabIndex={0} className="stock-tab-panel">
      {id==='overview-section'&&overview}
      {id==='financials-section'&&fundamentals}
      {id==='technicals-section'&&technicals}
      {id==='company-info-section'&&profile}
      {id==='peers-section'&&<StockResearchConsole stock={stock} peers={peers}/>}
      {id==='announcements-section'&&<div className="space-y-5">
        <CompanyNews articles={companyNews} available={newsAvailable}/>
        {announcements.length?<CompanyAnnouncementsSection announcements={announcements}/>:<p className="text-sm text-[#A4AEC1]">No company announcements returned by the current feed.</p>}
        <a href={source+'#announcements'} target="_blank" rel="noopener noreferrer" className="text-xs text-[#B69249]">Browse official company filings ↗</a>
        <Link href="/announcements" className="block text-xs text-[#A4AEC1]">All company announcements</Link>
      </div>}
    </section>)}
  </div>;
}

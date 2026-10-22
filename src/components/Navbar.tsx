'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Brand from './Brand';
import { useAuth } from './AuthProvider';
import { resolveTheme } from '@/lib/theme';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Activity,
  Newspaper,
  Users,
  Star,
  Briefcase,
  Smartphone,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { StockQuote } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
  const { user, loading: authLoading, openSignIn } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [marketStatus, setMarketStatus] = useState<{ isOpen: boolean; time: string }>({
    isOpen: false,
    time: 'Loading...',
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const searchRequest = useRef(0);

  useEffect(() => {
    // Check initial theme from html class
    if (typeof document !== 'undefined') {
      setIsLightMode(document.documentElement.classList.contains('light'));
    }

    // Fetch market status
    fetch('/api/market')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setMarketStatus({
            isOpen: data.isOpen,
            time: data.marketTime,
          });
        }
      })
      .catch(() => {});

    // Close search dropdown on outside click
    function handleClickOutside(e: MouseEvent) {
      if (!searchRef.current?.contains(e.target as Node) && !mobileSearchRef.current?.contains(e.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      let preference = null;
      try { preference = localStorage.getItem('daulat_theme'); } catch {}
      const theme = resolveTheme(preference, new Date().getHours());
      document.documentElement.classList.toggle('light', theme === 'light');
      setIsLightMode(theme === 'light');
    };
    const timer = window.setInterval(syncTheme, 60000);
    window.addEventListener('storage', syncTheme);
    window.addEventListener('focus', syncTheme);
    return () => { clearInterval(timer); window.removeEventListener('storage', syncTheme); window.removeEventListener('focus', syncTheme); };
  }, []);

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    const isCurrentlyLight = document.documentElement.classList.contains('light');
    const nextTheme = isCurrentlyLight ? 'dark' : 'light';
    document.documentElement.classList.toggle('light', nextTheme === 'light');
    try { localStorage.setItem('daulat_theme', nextTheme); } catch {}
    setIsLightMode(nextTheme === 'light');
  };

  const handleSearch = async (val: string) => {
    const request = ++searchRequest.current;
    setSearchQuery(val);
    setSearchResults([]);
    if (val.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/stocks?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (request === searchRequest.current && Array.isArray(data)) {
        setSearchResults(data.slice(0, 7));
      }
    } catch {
      if (request === searchRequest.current) setSearchResults([]);
    }
  };

  const selectStock = (sym: string) => {
    ++searchRequest.current;
    setIsSearching(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
    router.push(`/stocks/${sym}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        selectStock(searchResults[0].symbol);
      } else if (searchQuery.trim()) {
        const queryTerm = searchQuery.trim();
        setIsSearching(false);
        setMobileMenuOpen(false);
        router.push(`/stocks?q=${encodeURIComponent(queryTerm)}`);
      }
    }
  };

  const navLinks = [
    { label: 'Overview', href: '/', icon: Home },
    { label: 'Market', href: '/market', icon: Activity },
    { label: 'Screener', href: '/stocks/screener', icon: SlidersHorizontal },
    { label: 'Mutual Funds', href: '/mutual-funds', icon: Layers },
    { label: 'News', href: '/news', icon: Newspaper },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Watchlist', href: '/watchlist', icon: Star },
    { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  ];

  const searchField = (mobile = false) => (
    <div className={mobile ? 'relative w-full' : 'relative w-full max-w-md'} ref={mobile ? mobileSearchRef : searchRef}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4AEC1] pointer-events-none" />
      <input aria-label="Search PSX stocks" type="search" value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)} onKeyDown={handleKeyDown}
        onFocus={() => searchQuery && setIsSearching(true)} placeholder="Search companies or symbols…"
        className="w-full bg-[#111A2B] border border-[#28354A] rounded-lg pl-11 pr-4 py-3 text-sm text-[#EFF3FA] placeholder-[#7F8DA4] focus:outline-none focus:border-[#B69249] transition-colors" />
      {isSearching && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#111A2B] border border-[#28354A] rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 text-[10px] tracking-widest uppercase text-[#A4AEC1]">Companies</div>
          {searchResults.map(stock => (
            <button key={stock.symbol} onClick={() => selectStock(stock.symbol)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1C2940] text-left border-t border-[#28354A]">
              <span className="min-w-0"><strong className="text-sm">{stock.symbol}</strong><span className="block text-xs text-[#A4AEC1] truncate max-w-[180px]">{stock.name}</span></span>
              <span className="text-right font-mono text-xs">Rs {stock.current.toFixed(2)}<span className={stock.change >= 0 ? 'block mt-1 text-[#6DDBA5]' : 'block mt-1 text-[#F28B82]'}>{stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <header className="site-header sticky top-0 z-50 border-b border-[#28354A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-20">
          <Brand tagline />
          <div className="hidden md:flex flex-1 justify-center">{searchField()}</div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex items-center gap-2 text-xs text-[#A4AEC1] mr-2"><span className={marketStatus.isOpen ? 'w-1.5 h-1.5 rounded-full bg-[#6DDBA5]' : 'w-1.5 h-1.5 rounded-full bg-[#7F8DA4]'} />PSX {marketStatus.isOpen ? 'open' : 'closed'}</div>
            <button onClick={toggleTheme} aria-label="Toggle Dark and Light Mode" title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'} className="hidden min-[380px]:inline-flex p-2.5 rounded-lg border border-[#28354A] text-[#A4AEC1] hover:text-[#B69249]">{isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</button>
            {user ? <Link href="/portfolio" className="inline-flex primary-action text-xs px-3 sm:px-4 py-2.5">My account</Link> : <button onClick={openSignIn} disabled={authLoading} className="inline-flex primary-action text-xs px-3 sm:px-4 py-2.5">{authLoading ? 'Loading…' : 'Sign in'}</button>}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" className="lg:hidden p-2.5 border border-[#28354A] rounded-lg">{mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-between border-t border-[#28354A]/60">
          <nav aria-label="Main navigation" className="flex items-center gap-7">
            {navLinks.map(item => {
              const active = item.href === '/' ? pathname === '/' : !item.href.includes('#') && pathname.startsWith(item.href);
              return <Link key={item.label} href={item.href} aria-current={active ? 'page' : undefined} className={active ? 'desktop-nav-link is-active' : 'desktop-nav-link'}>{item.label}</Link>;
            })}
          </nav>
          <a href="https://play.google.com/store/apps/details?id=pk.psxtracker.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-[#A4AEC1] hover:text-[#B69249]"><Smartphone className="w-3.5 h-3.5" />Get the app</a>
        </div>
      </div>
      {mobileMenuOpen && <div id="mobile-navigation" className="lg:hidden px-4 py-5 bg-[#111A2B] border-t border-[#28354A] max-h-[calc(100dvh-80px)] overflow-y-auto">
        {searchField(true)}
        <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-2 mt-5">{navLinks.map(item => <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm text-[#A4AEC1] hover:bg-[#1C2940] rounded-lg"><item.icon className="w-4 h-4" />{item.label}</Link>)}</nav>
        <button onClick={toggleTheme} className="mt-4 text-xs text-[#B69249]">{isLightMode ? 'Use dark mode' : 'Use light mode'}</button>
        <div className="mt-5 pt-4 border-t border-[#28354A] text-xs text-[#A4AEC1]">PSX {marketStatus.isOpen ? 'open' : 'closed'} · {marketStatus.time && marketStatus.time!=='Loading...' ? new Date(marketStatus.time).toLocaleString('en-GB',{timeZone:'Asia/Karachi'})+' PKT' : 'Source status unavailable'}</div>
      </div>}
    </header>
  );
}

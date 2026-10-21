'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Clock,
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
} from 'lucide-react';
import { StockQuote } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
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
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    const isCurrentlyLight = document.documentElement.classList.contains('light');
    if (isCurrentlyLight) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('daulat_theme', 'dark');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('daulat_theme', 'light');
      setIsLightMode(true);
    }
  };

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/stocks?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearchResults(data.slice(0, 7));
      }
    } catch {
      setSearchResults([]);
    }
  };

  const selectStock = (sym: string) => {
    setIsSearching(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
    router.push(`/stocks/${sym}`);
  };

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Market', href: pathname === '/' ? '#indices-section' : '/#indices-section', icon: Activity },
    { label: 'News', href: '/news', icon: Newspaper },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Watchlist', href: '/watchlist', icon: Star },
    { label: 'Portfolio Tracker', href: '/portfolio', icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#30363D]">
      {/* Top micro banner: Market Status & Live Clock */}
      <div className="bg-[#161B22] border-b border-[#30363D]/60 px-4 py-1.5 text-xs text-[#8B949E]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  marketStatus.isOpen ? 'bg-[#00C076] animate-pulse' : 'bg-[#F85149]'
                }`}
              />
              <span className="font-medium text-[#F0F6FC]">
                {marketStatus.isOpen ? 'PSX Market Open' : 'PSX Market Closed'}
              </span>
            </span>
            <span className="text-[#30363D] hidden sm:inline">•</span>
            <span className="hidden sm:inline flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{marketStatus.time}</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[#FFB401] font-semibold text-[11px] hidden md:inline">
              Pakistan Stock Exchange (PSX) Live Intelligence
            </span>
            <a
              href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#388BFD] hover:underline flex items-center space-x-1"
            >
              <Smartphone className="w-3 h-3" />
              <span>Get Android App</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFB401] to-[#D99B00] flex items-center justify-center font-black text-black text-xl shadow-lg shadow-[#FFB401]/10 group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center">
                Daulat<span className="text-[#FFB401] ml-0.5 font-light">Invest</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#8B949E] -mt-1 font-semibold">
                PSX Market Terminal
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-4 relative" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setIsSearching(true)}
                placeholder="Search PSX stocks (e.g. MEBL, OGDC)..."
                className="w-full bg-[#161B22] border border-[#30363D] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#FFB401] transition-colors"
              />
            </div>

            {/* Live Autocomplete Search Dropdown */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2 text-[10px] font-bold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D]">
                  Matching Stocks
                </div>
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => selectStock(stock.symbol)}
                    className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#21262D] transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-[#F0F6FC] text-xs">{stock.symbol}</span>
                      <span className="text-[11px] text-[#8B949E] block truncate max-w-[180px]">
                        {stock.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#F0F6FC]">
                        Rs {stock.current.toFixed(2)}
                      </div>
                      <div
                        className={`text-[10px] font-bold ${
                          stock.change >= 0 ? 'text-[#00C076]' : 'text-[#F85149]'
                        }`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs font-semibold">
            {navLinks.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href) && !item.href.includes('#');

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'text-[#FFB401] bg-[#161B22] border border-[#30363D]'
                      : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]/50'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Light / Dark Toggle & App button */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark and Light Mode"
              title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-2 rounded-xl bg-[#161B22] border border-[#30363D] hover:border-[#FFB401] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
            >
              {isLightMode ? (
                <Moon className="w-4 h-4 text-[#FFB401]" />
              ) : (
                <Sun className="w-4 h-4 text-[#FFD33D]" />
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#8B949E] hover:text-[#F0F6FC] rounded-xl bg-[#161B22] border border-[#30363D]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#161B22] border-b border-[#30363D] px-4 py-4 space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search symbol (e.g. MEBL, OGDC)..."
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F0F6FC]"
            />
          </div>

          {/* Mobile search results */}
          {searchResults.length > 0 && (
            <div className="bg-[#0B0E14] border border-[#30363D] rounded-xl overflow-hidden divide-y divide-[#30363D]">
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => selectStock(stock.symbol)}
                  className="w-full p-2.5 flex justify-between items-center text-left"
                >
                  <div>
                    <span className="font-bold text-[#F0F6FC] text-xs">{stock.symbol}</span>
                    <span className="text-[10px] text-[#8B949E] block truncate max-w-[180px]">
                      {stock.name}
                    </span>
                  </div>
                  <span
                    className={`font-bold text-xs ${
                      stock.change >= 0 ? 'text-[#00C076]' : 'text-[#F85149]'
                    }`}
                  >
                    Rs {stock.current.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col space-y-1.5 pt-1 text-xs font-semibold">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#0B0E14]"
              >
                <item.icon className="w-4 h-4 text-[#FFB401]" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-[#30363D] flex items-center justify-between">
            <span className="text-xs text-[#8B949E]">Appearance</span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl bg-[#0B0E14] border border-[#30363D] text-xs font-semibold text-[#F0F6FC] flex items-center space-x-1.5"
            >
              {isLightMode ? <Moon className="w-3.5 h-3.5 text-[#FFB401]" /> : <Sun className="w-3.5 h-3.5 text-[#FFD33D]" />}
              <span>{isLightMode ? 'Dark Theme' : 'Light Theme'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { readHolding, readSoldTrade } from '@/lib/portfolio-data';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { StockQuote } from '@/lib/types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  LogIn,
  LogOut,
  ExternalLink,
  Shield,
  Smartphone,
  PieChart,
} from 'lucide-react';

interface Holding {
  id: string;
  symbol: string;
  companyName: string;
  shares: number;
  buyPrice: number;
  buyDate: number;
}

interface SoldTrade {
  id: string;
  symbol: string;
  companyName: string;
  shares: number;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  soldDate: number;
}

export default function PortfolioPage() {
  const { user, loading, openSignIn, logout } = useAuth();
  const [syncError, setSyncError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [dataUid, setDataUid] = useState<string | null>(null);
  const [storedHoldings, setHoldings] = useState<Holding[]>([]);
  const [storedTrades, setTrades] = useState<SoldTrade[]>([]);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const uid = user?.uid ?? null;
  const holdings = uid && dataUid === uid ? storedHoldings : [];
  const trades = uid && dataUid === uid ? storedTrades : [];
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [activeTab, setActiveTab] = useState<'holdings' | 'trades'>('holdings');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live quotes for accurate enrichment
  useEffect(() => {
    fetch('/api/stocks')
      .then((res) => res.json())
      .then((data: StockQuote[]) => {
        if (Array.isArray(data)) {
          const map: Record<string, StockQuote> = {};
          data.forEach((q) => {
            map[q.symbol.toUpperCase()] = q;
          });
          setQuotes(map);
        }
      })
      .catch((err) => console.error('Failed to fetch quotes:', err));
  }, []);

  // Both collections belong to the verified Firebase UID used by Android.
  useEffect(() => {
    setHoldings([]); setTrades([]); setDataUid(uid); setSyncError('');
    if (!uid) { setIsSyncing(false); return; }
    setIsSyncing(true);
    let active = true;
    const loaded = new Set<string>();
    const complete = (name: string) => { loaded.add(name); if (loaded.size === 2) setIsSyncing(false); };
    const onSyncError = (error: { code?: string }) => {
      if (!active) return;
      setSyncError(error.code === 'permission-denied'
        ? 'Signed in, but your account cannot access its cloud portfolio. Please contact Daulat support to check account permissions.'
        : 'Unable to load your cloud data. Check your connection and retry.');
      setIsSyncing(false);
    };
    const unsubscribeHoldings = onSnapshot(collection(db, 'users', uid, 'portfolio'), snapshot => {
      if (!active) return;
      setHoldings(snapshot.docs.map(d => readHolding(d.id, d.data()))); complete('holdings');
    }, onSyncError);
    const unsubscribeTrades = onSnapshot(collection(db, 'users', uid, 'trades'), snapshot => {
      if (!active) return;
      setTrades(snapshot.docs.map(d => readSoldTrade(d.id, d.data()))); complete('trades');
    }, onSyncError);
    return () => { active = false; unsubscribeHoldings(); unsubscribeTrades(); };
  }, [uid, syncAttempt]);

  const handleSignOut = async () => {
    try { await logout(); } catch { setSyncError('Unable to sign out. Please try again.'); }
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const sym = newSymbol.trim().toUpperCase();
    const sharesNum = parseInt(newShares, 10);
    const priceNum = parseFloat(newPrice);

    if (!quotes[sym]) { alert("Choose a valid PSX stock symbol."); return; }
    if (!sym || isNaN(sharesNum) || sharesNum <= 0 || isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter valid symbol, shares, and purchase price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const holdingId = `${sym}_${Date.now()}`;
      const docRef = doc(db, 'users', user.uid, 'portfolio', holdingId);
      const company = quotes[sym]?.name || sym;

      await setDoc(docRef, {
        id: holdingId,
        symbol: sym,
        companyName: company,
        shares: sharesNum,
        buyPrice: priceNum,
        buyDate: Date.now(),
      });

      setNewSymbol('');
      setNewShares('');
      setNewPrice('');
      setShowAddModal(false);
    } catch (err: any) {
      console.error('Error adding holding:', err);
      alert('Failed to save holding: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHolding = async (id: string, symbol: string) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'portfolio', id));
    } catch (err: any) {
      console.error('Error deleting holding:', err);
      alert('Failed to remove: ' + err.message);
    }
  };

  // Portfolio calculations
  let totalInvested = 0;
  let totalCurrentValue = 0;

  const enrichedHoldings = holdings.map((h) => {
    const q = quotes[h.symbol.toUpperCase()];
    const currentPrice = q?.current && q.current > 0 ? q.current : h.buyPrice;
    const invested = h.shares * h.buyPrice;
    const marketValue = h.shares * currentPrice;
    const gain = marketValue - invested;
    const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;

    totalInvested += invested;
    totalCurrentValue += marketValue;

    return {
      ...h,
      currentPrice,
      invested,
      marketValue,
      gain,
      gainPercent,
      changeToday: q?.changePercent || 0,
    };
  });

  const totalGain = totalCurrentValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const totalRealizedGain = trades.reduce((acc, t) => acc + (t.profit || 0), 0);

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {syncError && user && <div className="mb-6 text-sm text-[#F28B82]" role="alert">{syncError} <button onClick={() => setSyncAttempt(attempt => attempt + 1)} className="ml-2 text-[#B69249] underline">Retry sync</button></div>}
        {user && isSyncing && <p role="status" className="mb-6 text-sm text-[#A4AEC1]">Loading your app portfolio…</p>}
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-[#B69249]/10 rounded-xl text-[#B69249]">
                <Wallet className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#EFF3FA]">
                Daulat Portfolio Tracker
              </h1>
            </div>
            <p className="text-sm text-[#A4AEC1] mt-1">
              Real-time PSX stock portfolio tracker synced seamlessly with your Daulat mobile app.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-semibold text-[#EFF3FA]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="block text-[11px] text-[#A4AEC1] truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-[#111A2B] hover:bg-[#1C2940] text-[#A4AEC1] hover:text-[#F28B82] rounded-xl text-xs font-semibold border border-[#28354A] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-[#B69249] hover:bg-[#E5A200] text-black rounded-xl text-xs font-semibold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Holding</span>
                </button>
              </div>
            ) : (
              <button
                onClick={openSignIn}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#B69249] hover:bg-[#E5A200] text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-yellow-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>

        {/* User Not Signed In Banner */}
        {!user && !loading && (
          <div className="mb-8 bg-gradient-to-r from-[#111A2B] via-[#172237] to-[#111A2B] border border-[#B69249]/30 rounded-xl p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#B69249]/10 text-[#B69249] border border-[#B69249]/20">
                <Shield className="w-3.5 h-3.5" />
                <span>Cloud Synced & 100% Free</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#EFF3FA]">
                Sync Your Portfolio Across Web & Android
              </h2>
              <p className="text-sm text-[#A4AEC1]">
                Sign in with the Google account you use on the <strong>Daulat Android App</strong> to automatically view your stock holdings, real-time unrealized gains, and transaction history.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={openSignIn}
                  className="w-full sm:w-auto px-6 py-3 bg-[#B69249] hover:bg-[#E5A200] text-black font-semibold rounded-xl text-sm transition-all shadow-lg"
                >
                  Sign in to your account
                </button>
                <a
                  href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-[#1C2940] hover:bg-[#28354A] text-[#EFF3FA] font-semibold rounded-xl text-sm transition-all border border-[#28354A] flex items-center justify-center space-x-2"
                >
                  <Smartphone className="w-4 h-4 text-[#B69249]" />
                  <span>Get Android App</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5">
            <span className="text-xs uppercase font-semibold text-[#A4AEC1]">
              Portfolio Value
            </span>
            <div className="text-2xl font-semibold text-[#EFF3FA] font-mono mt-1">
              Rs {totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-[#A4AEC1] mt-1">
              Live market value
            </div>
          </div>

          <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5">
            <span className="text-xs uppercase font-semibold text-[#A4AEC1]">
              Total Invested
            </span>
            <div className="text-2xl font-semibold text-[#EFF3FA] font-mono mt-1">
              Rs {totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-[#A4AEC1] mt-1">
              Cost basis across holdings
            </div>
          </div>

          <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5">
            <span className="text-xs uppercase font-semibold text-[#A4AEC1]">
              Unrealized Profit / Loss
            </span>
            <div
              className={`text-2xl font-semibold font-mono mt-1 flex items-baseline space-x-1.5 ${
                totalGain >= 0 ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
              }`}
            >
              <span>
                {totalGain >= 0 ? '+' : ''}
                Rs {totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div
              className={`text-xs font-semibold font-mono mt-1 ${
                totalGain >= 0 ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
              }`}
            >
              {totalGain >= 0 ? '+' : ''}
              {totalGainPercent.toFixed(2)}%
            </div>
          </div>

          <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5">
            <span className="text-xs uppercase font-semibold text-[#A4AEC1]">
              Realized Gains (History)
            </span>
            <div
              className={`text-2xl font-semibold font-mono mt-1 ${
                totalRealizedGain >= 0 ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
              }`}
            >
              {totalRealizedGain >= 0 ? '+' : ''}
              Rs {totalRealizedGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-[#A4AEC1] mt-1">
              {trades.length} closed trade{trades.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-[#28354A] pb-3 mb-6">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'holdings'
                ? 'bg-[#B69249] text-black shadow-md'
                : 'text-[#A4AEC1] hover:text-[#EFF3FA] bg-[#111A2B]'
            }`}
          >
            My Holdings ({holdings.length})
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'trades'
                ? 'bg-[#B69249] text-black shadow-md'
                : 'text-[#A4AEC1] hover:text-[#EFF3FA] bg-[#111A2B]'
            }`}
          >
            Realized Trades ({trades.length})
          </button>
        </div>

        {/* Holdings Table */}
        {activeTab === 'holdings' && (
          <div className="bg-[#111A2B] border border-[#28354A] rounded-xl overflow-hidden shadow-lg">
            {enrichedHoldings.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <PieChart className="w-12 h-12 text-[#7F8DA4] mx-auto" />
                <h3 className="text-base font-semibold text-[#EFF3FA]">
                  {user ? 'No stock holdings added yet' : 'Sign in to view your holdings'}
                </h3>
                <p className="text-xs text-[#A4AEC1] max-w-md mx-auto">
                  {user
                    ? 'Click "Add Holding" to log your first Pakistan Stock Exchange investment.'
                    : 'Log in with your Google account or the Daulat mobile app to sync your portfolio.'}
                </p>
                {user && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-2 inline-flex items-center space-x-2 px-4 py-2 bg-[#B69249] text-black rounded-xl text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Holding</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0B1120] text-[#A4AEC1] border-b border-[#28354A] uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 font-semibold">Stock</th>
                      <th className="py-3 px-4 font-semibold text-right">Shares</th>
                      <th className="py-3 px-4 font-semibold text-right">Avg Price</th>
                      <th className="py-3 px-4 font-semibold text-right">Current</th>
                      <th className="py-3 px-4 font-semibold text-right">Market Value</th>
                      <th className="py-3 px-4 font-semibold text-right">Profit / Loss</th>
                      <th className="py-3 px-4 font-semibold text-right">Weight</th>
                      <th className="py-3 px-4 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#28354A]">
                    {enrichedHoldings.map((h) => {
                      const weight = totalCurrentValue > 0 ? (h.marketValue / totalCurrentValue) * 100 : 0;
                      const isGain = h.gain >= 0;

                      return (
                        <tr key={h.id} className="hover:bg-[#1C2940]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/stocks/${h.symbol.toLowerCase()}`}
                              className="group block"
                            >
                              <div className="font-semibold text-[#EFF3FA] font-mono group-hover:text-[#B69249] transition-colors flex items-center space-x-1">
                                <span>{h.symbol}</span>
                                <ExternalLink className="w-3 h-3 text-[#7F8DA4] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-[11px] text-[#A4AEC1] truncate max-w-[160px]">
                                {h.companyName}
                              </div>
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#EFF3FA]">
                            {h.shares.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#A4AEC1]">
                            Rs {h.buyPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#EFF3FA] font-semibold">
                            Rs {h.currentPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#EFF3FA] font-semibold">
                            Rs {h.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div
                              className={`font-mono font-semibold flex items-center justify-end space-x-1 ${
                                isGain ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
                              }`}
                            >
                              {isGain ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              <span>
                                {isGain ? '+' : ''}
                                Rs {h.gain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div
                              className={`text-[10px] font-mono ${
                                isGain ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
                              }`}
                            >
                              {isGain ? '+' : ''}
                              {h.gainPercent.toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#B69249] font-semibold">
                            {weight.toFixed(1)}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteHolding(h.id, h.symbol)}
                              title="Delete Holding"
                              className="p-1.5 text-[#A4AEC1] hover:text-[#F28B82] rounded-lg hover:bg-[#28354A] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Realized Trades Tab */}
        {activeTab === 'trades' && (
          <div className="bg-[#111A2B] border border-[#28354A] rounded-xl overflow-hidden shadow-lg">
            {trades.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-2">
                <Wallet className="w-10 h-10 text-[#7F8DA4] mx-auto" />
                <h3 className="text-base font-semibold text-[#EFF3FA]">No closed trades recorded</h3>
                <p className="text-xs text-[#A4AEC1] max-w-md mx-auto">
                  When you record sales in the Daulat mobile app, your realized profit/loss and trade history will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0B1120] text-[#A4AEC1] border-b border-[#28354A] uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 font-semibold">Stock</th>
                      <th className="py-3 px-4 font-semibold text-right">Shares</th>
                      <th className="py-3 px-4 font-semibold text-right">Buy Price</th>
                      <th className="py-3 px-4 font-semibold text-right">Sell Price</th>
                      <th className="py-3 px-4 font-semibold text-right">Realized Profit</th>
                      <th className="py-3 px-4 font-semibold text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#28354A]">
                    {trades.map((t) => {
                      const isProfit = (t.profit || 0) >= 0;
                      const dateStr = t.soldDate
                        ? new Date(t.soldDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '-';

                      return (
                        <tr key={t.id} className="hover:bg-[#1C2940]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#EFF3FA] font-mono">
                              {t.symbol}
                            </span>
                            <div className="text-[11px] text-[#A4AEC1]">{t.companyName}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#EFF3FA]">
                            {t.shares.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#A4AEC1]">
                            Rs {t.buyPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#EFF3FA]">
                            Rs {t.sellPrice.toFixed(2)}
                          </td>
                          <td
                            className={`py-3.5 px-4 text-right font-mono font-semibold ${
                              isProfit ? 'text-[#6DDBA5]' : 'text-[#F28B82]'
                            }`}
                          >
                            {isProfit ? '+' : ''}
                            Rs {(t.profit || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right text-[#A4AEC1] text-[11px]">
                            {dateStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111A2B] border border-[#28354A] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-semibold text-[#EFF3FA] mb-1">Add Stock Holding</h3>
            <p className="text-xs text-[#A4AEC1] mb-5">
              Enter your purchase details. This will sync immediately to your Daulat account.
            </p>

            <form onSubmit={handleAddHolding} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A4AEC1] mb-1 uppercase">
                  Symbol (e.g. MEBL, OGDC, SYS)
                </label>
                <input
                  type="text"
                  required
                  placeholder="MEBL"
                  value={newSymbol}
                  onChange={(e) => {
                    const s = e.target.value.toUpperCase();
                    setNewSymbol(s);
                    if (quotes[s]?.current) {
                      setNewPrice(String(quotes[s].current));
                    }
                  }}
                  className="w-full bg-[#0B1120] border border-[#28354A] rounded-xl px-3 py-2 text-sm text-[#EFF3FA] font-mono uppercase focus:outline-none focus:border-[#B69249]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A4AEC1] mb-1 uppercase">
                    Quantity (Shares)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="100"
                    value={newShares}
                    onChange={(e) => setNewShares(e.target.value)}
                    className="w-full bg-[#0B1120] border border-[#28354A] rounded-xl px-3 py-2 text-sm text-[#EFF3FA] font-mono focus:outline-none focus:border-[#B69249]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A4AEC1] mb-1 uppercase">
                    Buy Price (Rs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    placeholder="546.95"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#0B1120] border border-[#28354A] rounded-xl px-3 py-2 text-sm text-[#EFF3FA] font-mono focus:outline-none focus:border-[#B69249]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#28354A]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#1C2940] hover:bg-[#28354A] text-[#A4AEC1] rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#B69249] hover:bg-[#E5A200] text-black rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Holding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

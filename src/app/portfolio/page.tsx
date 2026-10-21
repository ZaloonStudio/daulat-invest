'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { auth, db, googleProvider } from '@/lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<SoldTrade[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [activeTab, setActiveTab] = useState<'holdings' | 'trades'>('holdings');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Monitor Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  // Sync holdings from Firestore
  useEffect(() => {
    if (!user) {
      setHoldings([]);
      setTrades([]);
      return;
    }

    const holdingsRef = collection(db, 'users', user.uid, 'portfolio');
    const unsubscribeHoldings = onSnapshot(query(holdingsRef), (snapshot) => {
      const items: Holding[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          symbol: d.symbol || '',
          companyName: d.companyName || d.symbol || '',
          shares: Number(d.shares) || 0,
          buyPrice: Number(d.buyPrice) || 0,
          buyDate: Number(d.buyDate) || Date.now(),
        });
      });
      setHoldings(items);
    });

    const tradesRef = collection(db, 'users', user.uid, 'trades');
    const unsubscribeTrades = onSnapshot(query(tradesRef), (snapshot) => {
      const items: SoldTrade[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          symbol: d.symbol || '',
          companyName: d.companyName || d.symbol || '',
          shares: Number(d.shares) || 0,
          buyPrice: Number(d.buyPrice) || 0,
          sellPrice: Number(d.sellPrice) || 0,
          profit: Number(d.profit) || 0,
          soldDate: Number(d.soldDate) || Date.now(),
        });
      });
      setTrades(items);
    });

    return () => {
      unsubscribeHoldings();
      unsubscribeTrades();
    };
  }, [user]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      alert('Sign in failed: ' + (err.message || 'Please try again.'));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const sym = newSymbol.trim().toUpperCase();
    const sharesNum = parseInt(newShares, 10);
    const priceNum = parseFloat(newPrice);

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
    <div className="min-h-screen bg-[#0C1411] text-[#F1F5EE] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-[#D5F478]/10 rounded-xl text-[#D5F478]">
                <Wallet className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#F1F5EE]">
                Daulat Portfolio Tracker
              </h1>
            </div>
            <p className="text-sm text-[#A4B3A7] mt-1">
              Real-time PSX stock portfolio tracker synced seamlessly with your Daulat mobile app.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-semibold text-[#F1F5EE]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="block text-[11px] text-[#A4B3A7] truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-[#121E18] hover:bg-[#1E3026] text-[#A4B3A7] hover:text-[#F28B82] rounded-xl text-xs font-semibold border border-[#2A3C31] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-[#D5F478] hover:bg-[#E5A200] text-black rounded-xl text-xs font-semibold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Holding</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#D5F478] hover:bg-[#E5A200] text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-yellow-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* User Not Signed In Banner */}
        {!user && !loading && (
          <div className="mb-8 bg-gradient-to-r from-[#121E18] via-[#18271F] to-[#121E18] border border-[#D5F478]/30 rounded-xl p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D5F478]/10 text-[#D5F478] border border-[#D5F478]/20">
                <Shield className="w-3.5 h-3.5" />
                <span>Cloud Synced & 100% Free</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#F1F5EE]">
                Sync Your Portfolio Across Web & Android
              </h2>
              <p className="text-sm text-[#A4B3A7]">
                Sign in with the Google account you use on the <strong>Daulat Android App</strong> to automatically view your stock holdings, real-time unrealized gains, and transaction history.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full sm:w-auto px-6 py-3 bg-[#D5F478] hover:bg-[#E5A200] text-black font-semibold rounded-xl text-sm transition-all shadow-lg"
                >
                  Continue with Google
                </button>
                <a
                  href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-[#1E3026] hover:bg-[#2A3C31] text-[#F1F5EE] font-semibold rounded-xl text-sm transition-all border border-[#2A3C31] flex items-center justify-center space-x-2"
                >
                  <Smartphone className="w-4 h-4 text-[#D5F478]" />
                  <span>Get Android App</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-5">
            <span className="text-xs uppercase font-semibold text-[#A4B3A7]">
              Portfolio Value
            </span>
            <div className="text-2xl font-semibold text-[#F1F5EE] font-mono mt-1">
              Rs {totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-[#A4B3A7] mt-1">
              Live market value
            </div>
          </div>

          <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-5">
            <span className="text-xs uppercase font-semibold text-[#A4B3A7]">
              Total Invested
            </span>
            <div className="text-2xl font-semibold text-[#F1F5EE] font-mono mt-1">
              Rs {totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-[#A4B3A7] mt-1">
              Cost basis across holdings
            </div>
          </div>

          <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-5">
            <span className="text-xs uppercase font-semibold text-[#A4B3A7]">
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

          <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl p-5">
            <span className="text-xs uppercase font-semibold text-[#A4B3A7]">
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
            <div className="text-xs text-[#A4B3A7] mt-1">
              {trades.length} closed trade{trades.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-[#2A3C31] pb-3 mb-6">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'holdings'
                ? 'bg-[#D5F478] text-black shadow-md'
                : 'text-[#A4B3A7] hover:text-[#F1F5EE] bg-[#121E18]'
            }`}
          >
            My Holdings ({holdings.length})
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'trades'
                ? 'bg-[#D5F478] text-black shadow-md'
                : 'text-[#A4B3A7] hover:text-[#F1F5EE] bg-[#121E18]'
            }`}
          >
            Realized Trades ({trades.length})
          </button>
        </div>

        {/* Holdings Table */}
        {activeTab === 'holdings' && (
          <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl overflow-hidden shadow-lg">
            {enrichedHoldings.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <PieChart className="w-12 h-12 text-[#84988B] mx-auto" />
                <h3 className="text-base font-semibold text-[#F1F5EE]">
                  {user ? 'No stock holdings added yet' : 'Sign in to view your holdings'}
                </h3>
                <p className="text-xs text-[#A4B3A7] max-w-md mx-auto">
                  {user
                    ? 'Click "Add Holding" to log your first Pakistan Stock Exchange investment.'
                    : 'Log in with your Google account or the Daulat mobile app to sync your portfolio.'}
                </p>
                {user && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-2 inline-flex items-center space-x-2 px-4 py-2 bg-[#D5F478] text-black rounded-xl text-xs font-semibold"
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
                    <tr className="bg-[#0C1411] text-[#A4B3A7] border-b border-[#2A3C31] uppercase text-[10px] tracking-wider">
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
                  <tbody className="divide-y divide-[#2A3C31]">
                    {enrichedHoldings.map((h) => {
                      const weight = totalCurrentValue > 0 ? (h.marketValue / totalCurrentValue) * 100 : 0;
                      const isGain = h.gain >= 0;

                      return (
                        <tr key={h.id} className="hover:bg-[#1E3026]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/stocks/${h.symbol.toLowerCase()}`}
                              className="group block"
                            >
                              <div className="font-semibold text-[#F1F5EE] font-mono group-hover:text-[#D5F478] transition-colors flex items-center space-x-1">
                                <span>{h.symbol}</span>
                                <ExternalLink className="w-3 h-3 text-[#84988B] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-[11px] text-[#A4B3A7] truncate max-w-[160px]">
                                {h.companyName}
                              </div>
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#F1F5EE]">
                            {h.shares.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#A4B3A7]">
                            Rs {h.buyPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#F1F5EE] font-semibold">
                            Rs {h.currentPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#F1F5EE] font-semibold">
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
                          <td className="py-3.5 px-4 text-right font-mono text-[#D5F478] font-semibold">
                            {weight.toFixed(1)}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteHolding(h.id, h.symbol)}
                              title="Delete Holding"
                              className="p-1.5 text-[#A4B3A7] hover:text-[#F28B82] rounded-lg hover:bg-[#2A3C31] transition-colors"
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
          <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl overflow-hidden shadow-lg">
            {trades.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-2">
                <Wallet className="w-10 h-10 text-[#84988B] mx-auto" />
                <h3 className="text-base font-semibold text-[#F1F5EE]">No closed trades recorded</h3>
                <p className="text-xs text-[#A4B3A7] max-w-md mx-auto">
                  When you record sales in the Daulat mobile app or website, your realized profit/loss and trade history will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0C1411] text-[#A4B3A7] border-b border-[#2A3C31] uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 font-semibold">Stock</th>
                      <th className="py-3 px-4 font-semibold text-right">Shares</th>
                      <th className="py-3 px-4 font-semibold text-right">Buy Price</th>
                      <th className="py-3 px-4 font-semibold text-right">Sell Price</th>
                      <th className="py-3 px-4 font-semibold text-right">Realized Profit</th>
                      <th className="py-3 px-4 font-semibold text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3C31]">
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
                        <tr key={t.id} className="hover:bg-[#1E3026]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#F1F5EE] font-mono">
                              {t.symbol}
                            </span>
                            <div className="text-[11px] text-[#A4B3A7]">{t.companyName}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#F1F5EE]">
                            {t.shares.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#A4B3A7]">
                            Rs {t.buyPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#F1F5EE]">
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
                          <td className="py-3.5 px-4 text-right text-[#A4B3A7] text-[11px]">
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
          <div className="bg-[#121E18] border border-[#2A3C31] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-semibold text-[#F1F5EE] mb-1">Add Stock Holding</h3>
            <p className="text-xs text-[#A4B3A7] mb-5">
              Enter your purchase details. This will sync immediately to your Daulat account.
            </p>

            <form onSubmit={handleAddHolding} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A4B3A7] mb-1 uppercase">
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
                  className="w-full bg-[#0C1411] border border-[#2A3C31] rounded-xl px-3 py-2 text-sm text-[#F1F5EE] font-mono uppercase focus:outline-none focus:border-[#D5F478]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A4B3A7] mb-1 uppercase">
                    Quantity (Shares)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="100"
                    value={newShares}
                    onChange={(e) => setNewShares(e.target.value)}
                    className="w-full bg-[#0C1411] border border-[#2A3C31] rounded-xl px-3 py-2 text-sm text-[#F1F5EE] font-mono focus:outline-none focus:border-[#D5F478]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A4B3A7] mb-1 uppercase">
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
                    className="w-full bg-[#0C1411] border border-[#2A3C31] rounded-xl px-3 py-2 text-sm text-[#F1F5EE] font-mono focus:outline-none focus:border-[#D5F478]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#2A3C31]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#1E3026] hover:bg-[#2A3C31] text-[#A4B3A7] rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#D5F478] hover:bg-[#E5A200] text-black rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
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

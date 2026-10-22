'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  PlusCircle,
  Flag,
  Search,
  ShieldAlert,
  Send,
  X,
  LogIn,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { CommunityPost, CommunityComment } from '@/lib/types';
import { db } from '@/lib/firestore';
import { useAuth } from '@/components/AuthProvider';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

const SEED_POSTS: CommunityPost[] = [
  {
    id: 'seed-1',
    author: 'Asad_EquityAnalyst',
    authorBadge: 'Chartered Analyst',
    symbolTag: 'HUBC',
    title: 'Hub Power (HUBC) dividend safety post-PPA revisions: Full breakdown',
    content:
      'After recent capacity payment renegotiations, many investors feared severe cash-flow cuts. However, looking at the receivables trajectory and upcoming dividend announcements, HUBC yield remains near 16–18% annualized. The company retains healthy cash conversion from Thar Energy and CPHGC ventures.',
    sentiment: 'Bullish',
    upvotes: 56,
    commentsCount: 12,
    timestamp: '3 hours ago',
    comments: [
      {
        id: 'c-1',
        author: 'Kashif_Trader',
        content: 'Agreed. Thar coal mine dividend stream is dollar-indexed which cushions local currency depreciation.',
        timestamp: '2 hours ago',
      },
      {
        id: 'c-2',
        author: 'Zubair_PSX',
        content: 'Watch out for circular debt settlement timelines though. Still prudent to keep it below 15% of portfolio.',
        timestamp: '1 hour ago',
      },
    ],
  },
  {
    id: 'seed-2',
    author: 'Saman_Fintech',
    authorBadge: 'Verified Investor',
    symbolTag: 'MEBL',
    title: 'Meezan Bank branch expansion: 1,000+ branches and Islamic banking dominance',
    content:
      'Meezan Bank continues to report industry-leading Return on Equity (>40%). While policy rate cuts will gradually compress Net Interest Margins across conventional banks, MEBL has a higher share of low-cost current accounts (CASA ratio >52%) which shields earnings.',
    sentiment: 'Bullish',
    upvotes: 48,
    commentsCount: 8,
    timestamp: '5 hours ago',
    comments: [
      {
        id: 'c-3',
        author: 'Bilal_KHI',
        content: 'MEBL is the bedrock of Shariah compliant investing in Pakistan. Great long-term compounder.',
        timestamp: '4 hours ago',
      },
    ],
  },
  {
    id: 'seed-3',
    author: 'Hamza_Macro',
    symbolTag: 'OGDC',
    title: 'OGDC exploration update & circular debt resolution roadmap',
    content:
      'Exploration drilling in Bettani and regional wells showing steady production. If the government announces another sovereign energy bond for circular debt clearing, OGDC and PPL will see rapid multiple expansion.',
    sentiment: 'Neutral',
    upvotes: 34,
    commentsCount: 5,
    timestamp: '8 hours ago',
    comments: [],
  },
  {
    id: 'seed-4',
    author: 'TechBull_Lahore',
    symbolTag: 'SYS',
    title: 'Systems Limited IT export demand outlook for FY2026',
    content:
      'With interest rates dropping in the US and Europe, enterprise digital transformation budgets are thawing. SYS trading near favorable valuations compared to historical 5-year averages.',
    sentiment: 'Bullish',
    upvotes: 29,
    commentsCount: 4,
    timestamp: '12 hours ago',
    comments: [],
  },
];

export default function CommunityClient() {
  const [posts, setPosts] = useState<CommunityPost[]>(SEED_POSTS);
  const { user, openSignIn, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<'All' | 'Bullish' | 'Bearish'>('All');
  const [upvotedPostIds, setUpvotedPostIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Market Manipulation / Spam');
  const [reportSuccess, setReportSuccess] = useState(false);

  // New Post Form State
  const [newAuthor, setNewAuthor] = useState('');
  const [newSymbol, setNewSymbol] = useState('HUBC');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSentiment, setNewSentiment] = useState<'Bullish' | 'Bearish' | 'Neutral'>('Bullish');

  // Expanded Comment Thread State
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => { if (user?.displayName) setNewAuthor(user.displayName); }, [user]);

  // 2. Load cached or Firestore posts
  useEffect(() => {
    async function loadPosts() {
      // Check localStorage first
      const cached = localStorage.getItem('daulat_community_posts');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
          }
        } catch {}
      }

      const upvotes = localStorage.getItem('daulat_community_upvotes');
      if (upvotes) {
        try {
          setUpvotedPostIds(new Set(JSON.parse(upvotes)));
        } catch {}
      }

      // Try fetching from Firestore
      try {
        const q = query(collection(db, 'community_posts'), orderBy('timestamp', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const remotePosts: CommunityPost[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remotePosts.push({
              id: docSnap.id,
              author: data.author || 'PSX_Investor',
              authorBadge: data.authorBadge,
              symbolTag: data.symbolTag || 'PSX',
              title: data.title || '',
              content: data.content || '',
              sentiment: data.sentiment || 'Bullish',
              upvotes: data.upvotes || 0,
              commentsCount: data.commentsCount || 0,
              timestamp: data.timestamp || 'Recently',
              comments: data.comments || [],
            });
          });
          setPosts(remotePosts);
          localStorage.setItem('daulat_community_posts', JSON.stringify(remotePosts));
        }
      } catch {
        // Firestore rules or offline: keep seeded / local
      }
    }

    loadPosts();
  }, []);

  // Sync to localStorage on update
  const savePosts = (updated: CommunityPost[]) => {
    setPosts(updated);
    try {
      localStorage.setItem('daulat_community_posts', JSON.stringify(updated));
    } catch {}
  };

  const handleGoogleLogin = openSignIn;
  const handleLogout = async () => { try { await logout(); } catch { openSignIn(); } };

  // Upvote Handler
  const handleUpvote = async (postId: string) => {
    const hasUpvoted = upvotedPostIds.has(postId);
    const newUpvoted = new Set(upvotedPostIds);

    const updated = posts.map((p) => {
      if (p.id === postId) {
        const newCount = hasUpvoted ? p.upvotes - 1 : p.upvotes + 1;
        return { ...p, upvotes: Math.max(0, newCount) };
      }
      return p;
    });

    if (hasUpvoted) {
      newUpvoted.delete(postId);
    } else {
      newUpvoted.add(postId);
    }

    setUpvotedPostIds(newUpvoted);
    localStorage.setItem('daulat_community_upvotes', JSON.stringify(Array.from(newUpvoted)));
    savePosts(updated);

    // Sync Firestore in background
    try {
      const postRef = doc(db, 'community_posts', postId);
      const targetPost = updated.find((p) => p.id === postId);
      if (targetPost) {
        await updateDoc(postRef, { upvotes: targetPost.upvotes });
      }
    } catch {}
  };

  // Create New Post Handler
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const authorName = user?.displayName || newAuthor.trim() || 'PakInvestor';
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: authorName,
      authorBadge: user ? 'Registered Member' : 'Guest Trader',
      symbolTag: newSymbol.trim().toUpperCase() || 'PSX',
      title: newTitle.trim(),
      content: newContent.trim(),
      sentiment: newSentiment,
      upvotes: 1,
      commentsCount: 0,
      timestamp: 'Just now',
      comments: [],
    };

    const updated = [newPost, ...posts];
    savePosts(updated);

    // Reset Form
    setNewTitle('');
    setNewContent('');
    setIsNewPostOpen(false);

    // Save to Firestore
    try {
      await addDoc(collection(db, 'community_posts'), {
        author: newPost.author,
        authorBadge: newPost.authorBadge,
        symbolTag: newPost.symbolTag,
        title: newPost.title,
        content: newPost.content,
        sentiment: newPost.sentiment,
        upvotes: 1,
        commentsCount: 0,
        timestamp: new Date().toISOString(),
        comments: [],
      });
    } catch {}
  };

  // Add Comment Handler
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const commentAuthor = user?.displayName || newAuthor.trim() || 'PSX_Member';
    const newComment: CommunityComment = {
      id: `comment-${Date.now()}`,
      author: commentAuthor,
      content: text.trim(),
      timestamp: 'Just now',
    };

    const updated = posts.map((p) => {
      if (p.id === postId) {
        const existing = p.comments || [];
        return {
          ...p,
          comments: [...existing, newComment],
          commentsCount: (p.commentsCount || 0) + 1,
        };
      }
      return p;
    });

    savePosts(updated);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  // Reporting Handler
  const handleReportPost = () => {
    if (!reportingPostId) return;
    setReportSuccess(true);
    setTimeout(() => {
      // Filter out reported post or flag it
      const updated = posts.filter((p) => p.id !== reportingPostId);
      savePosts(updated);
      setReportingPostId(null);
      setReportSuccess(false);
    }, 1200);
  };

  // Filtered Posts
  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      (p.symbolTag && p.symbolTag.toLowerCase().includes(search.toLowerCase()));

    const matchSentiment = selectedSentiment === 'All' || p.sentiment === selectedSentiment;

    return matchSearch && matchSentiment;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#28354A] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B9ADDA] uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" />
            <span>Pakistan Stock Exchange Discussion Hub</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#EFF3FA] tracking-tight">
            Investor Community &amp; Forum
          </h1>
          <p className="text-sm text-[#A4AEC1] mt-1 max-w-2xl">
            Debate company valuations, dissect quarterly earnings, post charts, and connect with fellow PSX market participants.
          </p>
        </div>

        {/* Action Controls: Auth & New Post */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2 bg-[#111A2B] border border-[#28354A] px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-[#6DDBA5]" />
              <span className="font-semibold text-[#EFF3FA]">{user.displayName || 'Member'}</span>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="text-[#A4AEC1] hover:text-[#F28B82] ml-1 p-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="bg-[#111A2B] hover:bg-[#1C2940] border border-[#28354A] text-[#EFF3FA] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-[#9BBCE3]" />
              <span>Sign in</span>
            </button>
          )}

          <button
            onClick={() => setIsNewPostOpen(true)}
            className="bg-gradient-to-r from-[#B9ADDA] to-[#8250df] hover:brightness-110 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-[#B9ADDA]/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Discussion</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Sentiment Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          {(['All', 'Bullish', 'Bearish'] as const).map((sent) => (
            <button
              key={sent}
              onClick={() => setSelectedSentiment(sent)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedSentiment === sent
                  ? sent === 'Bullish'
                    ? 'bg-[#6DDBA5] text-black font-semibold'
                    : sent === 'Bearish'
                    ? 'bg-[#F28B82] text-white font-semibold'
                    : 'bg-[#B69249] text-black font-semibold'
                  : 'bg-[#111A2B] text-[#A4AEC1] hover:text-[#EFF3FA] border border-[#28354A]'
              }`}
            >
              {sent === 'All' ? 'All Sentiments' : `${sent} Theses`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4AEC1]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticker ($HUBC) or title..."
            className="w-full bg-[#111A2B] border border-[#28354A] rounded-xl pl-9 pr-4 py-2 text-xs text-[#EFF3FA] placeholder-[#A4AEC1] focus:outline-none focus:border-[#B9ADDA] transition-colors"
          />
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isUpvoted = upvotedPostIds.has(post.id);
          const isCommentsOpen = expandedComments[post.id];

          return (
            <div
              key={post.id}
              className="bg-[#111A2B] border border-[#28354A] hover:border-[#9BBCE3]/50 rounded-xl p-5 md:p-6 transition-all duration-200 shadow-lg space-y-4"
            >
              {/* Post Header: Ticker, Author, Timestamp, Sentiment */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="font-semibold text-xs text-[#B69249] bg-[#B69249]/10 px-2.5 py-1 rounded-lg border border-[#B69249]/20">
                    ${post.symbolTag || 'PSX'}
                  </span>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-xs text-[#EFF3FA]">@{post.author}</span>
                      {post.authorBadge && (
                        <span className="text-[9px] bg-[#1C2940] text-[#A4AEC1] px-1.5 py-0.2 rounded font-semibold">
                          {post.authorBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#7F8DA4]">{post.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                      post.sentiment === 'Bullish'
                        ? 'bg-[#6DDBA5]/15 text-[#6DDBA5] border-[#6DDBA5]/30'
                        : post.sentiment === 'Bearish'
                        ? 'bg-[#F28B82]/15 text-[#F28B82] border-[#F28B82]/30'
                        : 'bg-[#B69249]/15 text-[#B69249] border-[#B69249]/30'
                    }`}
                  >
                    {post.sentiment}
                  </span>

                  <button
                    onClick={() => setReportingPostId(post.id)}
                    title="Report post"
                    className="p-1 text-[#7F8DA4] hover:text-[#F28B82] hover:bg-[#1C2940] rounded transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="text-base font-semibold text-[#EFF3FA] leading-snug mb-2">
                  {post.title}
                </h3>
                <p className="text-xs text-[#A4AEC1] leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-[#28354A]/60 text-xs">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleUpvote(post.id)}
                    className={`flex items-center space-x-1.5 font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      isUpvoted
                        ? 'bg-[#6DDBA5] text-black shadow-md shadow-[#6DDBA5]/20'
                        : 'bg-[#0B1120] text-[#A4AEC1] hover:text-[#6DDBA5] border border-[#28354A]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.upvotes}</span>
                  </button>

                  <button
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className="flex items-center space-x-1.5 font-semibold px-3 py-1.5 rounded-xl bg-[#0B1120] text-[#A4AEC1] hover:text-[#EFF3FA] border border-[#28354A] transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>
                      {post.commentsCount || (post.comments ? post.comments.length : 0)} Comments
                    </span>
                  </button>
                </div>

                <span className="text-[11px] text-[#7F8DA4]">Moderated Community Feed</span>
              </div>

              {/* Expandable Comment Thread */}
              {isCommentsOpen && (
                <div className="pt-3 border-t border-[#28354A] space-y-3 animate-fadeIn">
                  {/* List Existing Comments */}
                  {post.comments && post.comments.length > 0 ? (
                    <div className="space-y-2">
                      {post.comments.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 bg-[#0B1120] border border-[#28354A]/60 rounded-xl text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-semibold text-[#EFF3FA]">@{c.author}</span>
                            <span className="text-[#7F8DA4]">{c.timestamp}</span>
                          </div>
                          <p className="text-[#A4AEC1] leading-relaxed">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#7F8DA4] italic">
                      No comments yet. Be the first to share your perspective!
                    </p>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      placeholder="Write a comment or counter-analysis..."
                      className="flex-1 bg-[#0B1120] border border-[#28354A] rounded-xl px-3.5 py-2 text-xs text-[#EFF3FA] placeholder-[#A4AEC1] focus:outline-none focus:border-[#B9ADDA]"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-3.5 py-2 bg-[#B9ADDA] hover:bg-[#8250df] text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-[#111A2B] border border-[#28354A] rounded-xl">
            <Users className="w-10 h-10 text-[#7F8DA4] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#EFF3FA]">No discussions found</h3>
            <p className="text-xs text-[#A4AEC1] mt-1">
              Be the first to share research or analysis for this ticker.
            </p>
            <button
              onClick={() => setIsNewPostOpen(true)}
              className="mt-4 px-4 py-2 bg-[#B9ADDA] text-white font-semibold rounded-xl text-xs"
            >
              Start New Topic
            </button>
          </div>
        )}
      </div>

      {/* CREATE NEW POST MODAL */}
      {isNewPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-[#0e1424] border border-[#28354A] rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#28354A] bg-[#111A2B]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#B9ADDA]/20 text-[#B9ADDA] flex items-center justify-center font-semibold">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-[#EFF3FA]">Create PSX Discussion</h3>
              </div>
              <button
                aria-label="Close discussion form"
                onClick={() => setIsNewPostOpen(false)}
                className="p-1.5 text-[#A4AEC1] hover:text-[#EFF3FA] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#A4AEC1] uppercase block mb-1">
                  Your Display Handle
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Tariq_Investor"
                  className="w-full bg-[#111A2B] border border-[#28354A] rounded-xl px-3.5 py-2 text-xs text-[#EFF3FA] focus:outline-none focus:border-[#B9ADDA]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#A4AEC1] uppercase block mb-1">
                    PSX Stock Ticker
                  </label>
                  <input
                    type="text"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g. HUBC, MEBL, SYS"
                    className="w-full bg-[#111A2B] border border-[#28354A] rounded-xl px-3.5 py-2 text-xs text-[#EFF3FA] focus:outline-none focus:border-[#B9ADDA] font-semibold uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#A4AEC1] uppercase block mb-1">
                    Your Market Outlook
                  </label>
                  <select
                    value={newSentiment}
                    onChange={(e) => setNewSentiment(e.target.value as any)}
                    className="w-full bg-[#111A2B] border border-[#28354A] rounded-xl px-3 py-2 text-xs text-[#EFF3FA] focus:outline-none focus:border-[#B9ADDA] font-semibold"
                  >
                    <option value="Bullish">Bullish ↗</option>
                    <option value="Bearish">Bearish ↘</option>
                    <option value="Neutral">Neutral ↔</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#A4AEC1] uppercase block mb-1">
                  Discussion Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Hub Power Q2 Dividend & Capacity Payments thesis"
                  className="w-full bg-[#111A2B] border border-[#28354A] rounded-xl px-3.5 py-2 text-xs text-[#EFF3FA] focus:outline-none focus:border-[#B9ADDA]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#A4AEC1] uppercase block mb-1">
                  Analysis / Discussion Content
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share facts, financial ratios, or key catalysts with fellow investors..."
                  className="w-full bg-[#111A2B] border border-[#28354A] rounded-xl p-3 text-xs text-[#EFF3FA] focus:outline-none focus:border-[#B9ADDA] leading-relaxed"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#28354A] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewPostOpen(false)}
                  className="px-4 py-2 bg-[#1C2940] hover:bg-[#28354A] text-[#A4AEC1] rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B9ADDA] hover:bg-[#8250df] text-white font-semibold rounded-xl shadow-md transition-colors"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT POST MODAL */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0e1424] border border-[#28354A] rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-[#F28B82]">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-semibold text-[#EFF3FA]">Report Content</h3>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#6DDBA5] mx-auto" />
                <p className="text-xs font-semibold text-[#EFF3FA]">Report submitted to moderators.</p>
                <p className="text-[11px] text-[#A4AEC1]">
                  Thank you for keeping Daulat Invest community clean and compliant.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#A4AEC1]">
                  Select the violation category to submit this post for review:
                </p>

                <div className="space-y-2">
                  {[
                    'Market Manipulation / Pump & Dump',
                    'Spam / Promotional Links',
                    'Harassment / Hate Speech',
                    'False Financial Information',
                  ].map((r) => (
                    <button
                      key={r}
                      onClick={() => setReportReason(r)}
                      className={`w-full p-2.5 rounded-xl text-xs text-left border transition-all ${
                        reportReason === r
                          ? 'bg-[#F28B82]/20 border-[#F28B82] text-[#EFF3FA] font-semibold'
                          : 'bg-[#111A2B] border-[#28354A] text-[#A4AEC1] hover:text-[#EFF3FA]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-[#28354A]">
                  <button
                    onClick={() => setReportingPostId(null)}
                    className="px-3 py-1.5 text-xs text-[#A4AEC1] hover:text-[#EFF3FA]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportPost}
                    className="px-4 py-1.5 bg-[#F28B82] text-white font-semibold text-xs rounded-xl hover:bg-[#da3633] transition-colors"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

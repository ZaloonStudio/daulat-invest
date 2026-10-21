'use client';

import React from 'react';
import Link from 'next/link';
import { Users, MessageSquare, ThumbsUp, ArrowRight } from 'lucide-react';
import { CommunityPost } from '@/lib/types';

interface CommunityPreviewProps {
  posts?: CommunityPost[];
}

const DEFAULT_POSTS: CommunityPost[] = [
  {
    id: 'sample-1',
    author: 'Tariq_Investor',
    symbolTag: 'HUBC',
    title: 'HUBC FY26 Dividend Yield Outlook & Capacity Payments',
    content: 'HUBC remaining fundamentally strong post-restructuring. With recent payout declarations and high cash flow generation, yield remains unmatched in KSE-100.',
    sentiment: 'Bullish',
    upvotes: 42,
    commentsCount: 14,
    timestamp: '2 hours ago',
  },
  {
    id: 'sample-2',
    author: 'Farhan_Alpha',
    symbolTag: 'MEBL',
    title: 'Meezan Bank Shariah Expansion & Net Interest Margin resilience',
    content: 'Branch network cross-selling and Islamic deposits growth continuing at double digits. Any dip towards 200-day moving average is strong accumulation zone.',
    sentiment: 'Bullish',
    upvotes: 31,
    commentsCount: 9,
    timestamp: '4 hours ago',
  },
  {
    id: 'sample-3',
    author: 'EquityTrader_Khi',
    symbolTag: 'SYS',
    title: 'Systems Limited tech export billing and currency dynamics',
    content: 'Global enterprise IT contracts starting to show revenue recognition. Consolidation range holding nicely above support levels.',
    sentiment: 'Bullish',
    upvotes: 27,
    commentsCount: 7,
    timestamp: '6 hours ago',
  },
];

export default function CommunityPreview({ posts = DEFAULT_POSTS }: CommunityPreviewProps) {
  const displayPosts = posts.slice(0, 3);

  return (
    <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5 md:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#28354A] gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#B9ADDA] to-[#794dd3] flex items-center justify-center text-white font-semibold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#EFF3FA] flex items-center space-x-2">
              <span>PSX Investor Community</span>
              <span className="text-[10px] bg-[#B9ADDA]/20 text-[#B9ADDA] px-2 py-0.5 rounded-full font-semibold">
                Live Discussions
              </span>
            </h3>
            <p className="text-xs text-[#A4AEC1]">
              Share stock theses, earnings analysis, and trading setups with fellow Pakistani investors
            </p>
          </div>
        </div>

        <Link
          href="/community"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#B9ADDA] hover:text-white bg-[#B9ADDA]/10 hover:bg-[#B9ADDA] px-3.5 py-1.5 rounded-xl transition-all w-fit"
        >
          <span>Join Community &amp; Post</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
        {displayPosts.map((post) => (
          <Link
            key={post.id}
            href="/community"
            className="group flex flex-col justify-between p-4 bg-[#0B1120] border border-[#28354A] hover:border-[#B9ADDA] rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#B69249] bg-[#B69249]/10 px-2 py-0.5 rounded-md">
                  ${post.symbolTag || 'PSX'}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    post.sentiment === 'Bullish'
                      ? 'bg-[#6DDBA5]/15 text-[#6DDBA5]'
                      : post.sentiment === 'Bearish'
                      ? 'bg-[#F28B82]/15 text-[#F28B82]'
                      : 'bg-[#A4AEC1]/15 text-[#A4AEC1]'
                  }`}
                >
                  {post.sentiment}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-[#EFF3FA] group-hover:text-[#B9ADDA] transition-colors line-clamp-2 mb-1.5 leading-snug">
                {post.title}
              </h4>

              <p className="text-[11px] text-[#A4AEC1] line-clamp-2 leading-relaxed">
                {post.content}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#7F8DA4] pt-3 mt-3 border-t border-[#28354A]/60">
              <span className="font-semibold text-[#A4AEC1]">@{post.author}</span>
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1 text-[#6DDBA5]">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{post.upvotes}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{post.commentsCount}</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, {useEffect,useState} from 'react';
import Link from 'next/link';
import { Users, MessageSquare, ThumbsUp, ArrowRight } from 'lucide-react';
import { CommunityPost } from '@/lib/types';

export default function CommunityPreview() {
  const [posts,setPosts]=useState<CommunityPost[]>([]);
  useEffect(()=>{
    let active=true;
    Promise.all([import('firebase/firestore'),import('@/lib/firestore')]).then(([{collection,getDocs,query,orderBy,limit},{db}])=>getDocs(query(collection(db,'community_posts'),orderBy('timestamp','desc'),limit(3)))).then(snapshot=>{
      const rows=snapshot.docs.flatMap(document=>{
        const data=document.data();
        if(!data.title||!data.content||/^(seed|sample)-/.test(document.id))return [];
        return [{id:document.id,author:typeof data.author==='string'?data.author:'PSX investor',title:String(data.title),content:String(data.content),symbolTag:typeof data.symbolTag==='string'?data.symbolTag:'PSX',sentiment:['Bullish','Bearish','Neutral'].includes(data.sentiment)?data.sentiment:'Neutral',upvotes:Number.isFinite(data.upvotes)?Math.max(0,data.upvotes):0,commentsCount:Number.isFinite(data.commentsCount)?Math.max(0,data.commentsCount):0,timestamp:typeof data.timestamp==='string'?data.timestamp:''} as CommunityPost];
      });
      if(active)setPosts(rows);
    }).catch(()=>{if(active)setPosts([]);});
    return ()=>{active=false;};
  },[]);
  const displayPosts=posts;

  return (
    <div className="bg-[#111A2B] border border-[#28354A] rounded-xl p-5 md:p-6 shadow-xl">
      <div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-3 "+(displayPosts.length?"pb-4 border-b border-[#28354A]":"")}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#B9ADDA] to-[#794dd3] flex items-center justify-center text-white font-semibold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#EFF3FA] flex items-center space-x-2">
              <span>PSX Investor Community</span>
            </h2>
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

      {displayPosts.length>0&&<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
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
      </div>}
    </div>
  );
}

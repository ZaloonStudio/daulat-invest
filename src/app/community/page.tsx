import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommunityClient from './CommunityClient';

export const metadata: Metadata = pageMetadata("/community", "PSX Investor Community", "Explore discussions about Pakistan Stock Exchange shares, market developments and investing with the Daulat community.");

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CommunityClient />
      </main>

      <Footer />
    </div>
  );
}

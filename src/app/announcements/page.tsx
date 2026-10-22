import { pageMetadata } from '@/lib/seo';
import React from 'react';
import { Metadata } from 'next';
import { fetchCompanyAnnouncements } from '@/lib/psx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementsClient from './AnnouncementsClient';

export const revalidate = 60; // Refresh filings every minute

export const metadata: Metadata = pageMetadata("/announcements", "PSX Company Announcements & Disclosures", "Browse Pakistan Stock Exchange company announcements, financial results, board meetings and corporate disclosures.");

export default async function AnnouncementsPage() {
  const announcements = await fetchCompanyAnnouncements();

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#EFF3FA]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnnouncementsClient initialAnnouncements={announcements} />
      </main>

      <Footer />
    </div>
  );
}

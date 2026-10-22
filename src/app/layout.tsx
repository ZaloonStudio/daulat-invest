import { SITE_URL, jsonLd } from '@/lib/seo';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { themeBootstrap } from "@/lib/theme";
import AuthProvider from "@/components/AuthProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  title: "Daulat Invest - Pakistan Stock Exchange (PSX) Live Market Terminal",
  description: "Live KSE 100 quotes, real-time charts, market breadth, Fear & Greed index, community discussions, and portfolio tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootstrap,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@graph': [
          { '@type': 'Organization', '@id': SITE_URL + '/#organization', name: 'Daulat Invest', url: SITE_URL, logo: SITE_URL + '/brand/daulat-logo.png', sameAs: ['https://play.google.com/store/apps/details?id=pk.psxtracker.app'] },
          { '@type': 'WebSite', '@id': SITE_URL + '/#website', name: 'Daulat Invest', url: SITE_URL, inLanguage: 'en-PK', publisher: { '@id': SITE_URL + '/#organization' } }
        ] }) }} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
export const SITE_URL = 'https://www.daulatinvest.com';
export function pageMetadata(path: string, title: string, description: string, index = true): Metadata {
  const url = SITE_URL + path;
  const fullTitle = title + ' | Daulat Invest';
  return {
    title: fullTitle, description, alternates: { canonical: url },
    robots: { index, follow: true, googleBot: { index, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { title: fullTitle, description, url, siteName: 'Daulat Invest', locale: 'en_PK', type: 'website', images: [{ url: SITE_URL + '/opengraph-image', width: 1200, height: 630, alt: 'Daulat Invest — Pakistan markets' }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [SITE_URL + '/opengraph-image'] },
  };
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, '\u003c'); }

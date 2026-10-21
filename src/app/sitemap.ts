import { MetadataRoute } from 'next';
import { fetchMarketWatch } from '@/lib/psx';

export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.daulatinvest.com';
  const now = new Date();

  // Core static & financial tool routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'always', priority: 1.0 },
    { url: `${baseUrl}/stocks`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/stocks/screener`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/mutual-funds`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/fear-greed`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/commodities`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/forex`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/shariah`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/stocks/compare`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/announcements`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/dividend-calculator`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/sip-calculator`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/community`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/watchlist`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/portfolio`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ];

  try {
    const quotes = await fetchMarketWatch();
    const stockRoutes: MetadataRoute.Sitemap = quotes.map((q) => ({
      url: `${baseUrl}/stocks/${q.symbol}`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    }));
    return [...staticRoutes, ...stockRoutes];
  } catch {
    return staticRoutes;
  }
}

import { MetadataRoute } from 'next';
import { fetchMarketWatch } from '@/lib/psx';
import { PRICE_PAGES } from '@/lib/price-pages';

export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.daulatinvest.com';

  // Core static & financial tool routes
  const staticRoutes: MetadataRoute.Sitemap = [
    ...PRICE_PAGES.map(page => ({url: `${baseUrl}/${page.slug}`, changeFrequency: 'daily' as const, priority: 0.8})),
    { url: baseUrl, changeFrequency: 'always', priority: 1.0 },
    { url: `${baseUrl}/stocks`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/stocks/screener`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/mutual-funds`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/fear-greed`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/commodities`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/forex`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/shariah`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/stocks/compare`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/announcements`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/dividend-calculator`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/sip-calculator`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/news`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/community`, changeFrequency: 'daily', priority: 0.7 },
  ];

  try {
    const quotes = await fetchMarketWatch();
    const stockRoutes: MetadataRoute.Sitemap = quotes.filter((q, i, all) => /^[A-Z0-9][A-Z0-9.-]*$/.test(q.symbol) && all.findIndex(other => other.symbol === q.symbol) === i).map((q) => ({
      url: `${baseUrl}/stocks/${q.symbol}`,

      changeFrequency: 'hourly',
      priority: 0.8,
    }));
    return [...staticRoutes, ...stockRoutes];
  } catch {
    return staticRoutes;
  }
}

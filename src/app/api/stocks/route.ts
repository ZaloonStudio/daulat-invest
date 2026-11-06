import { NextRequest, NextResponse } from 'next/server';
import { fetchMarketWatch } from '@/lib/psx';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase()?.trim() || '';
    const sector = searchParams.get('sector')?.trim() || '';

    let quotes = await fetchMarketWatch();
    if (!quotes.length) return NextResponse.json([], { status: 503, headers: { 'Cache-Control': 'no-store' } });

    if (q) {
      quotes = quotes.filter(
        (item) => item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
      );
    }

    if (sector) {
      quotes = quotes.filter((item) => item.sector.toLowerCase() === sector.toLowerCase());
    }

    return NextResponse.json(quotes, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30' } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch stocks' }, { status: 500 });
  }
}

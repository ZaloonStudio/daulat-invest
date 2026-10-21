import { NextRequest, NextResponse } from 'next/server';
import { fetchMarketWatch } from '@/lib/psx';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase()?.trim() || '';
    const sector = searchParams.get('sector')?.trim() || '';

    let quotes = await fetchMarketWatch();

    if (q) {
      quotes = quotes.filter(
        (item) => item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
      );
    }

    if (sector) {
      quotes = quotes.filter((item) => item.sector.toLowerCase() === sector.toLowerCase());
    }

    return NextResponse.json(quotes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch stocks' }, { status: 500 });
  }
}

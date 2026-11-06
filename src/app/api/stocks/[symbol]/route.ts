import { NextRequest, NextResponse } from 'next/server';
import { fetchMarketWatch, fetchStockHistory } from '@/lib/psx';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();
    const [quotes, history] = await Promise.all([
      fetchMarketWatch(),
      fetchStockHistory(symbol),
    ]);

    if (!quotes.length) {
      return NextResponse.json({ error: 'Market data temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }

    const quote = quotes.find((q) => q.symbol.toUpperCase() === symbol);

    if (!quote) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    return NextResponse.json({
      quote,
      history,
    }, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30' } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch stock detail' }, { status: 500 });
  }
}

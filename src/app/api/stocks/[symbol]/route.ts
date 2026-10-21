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

    const quote = quotes.find((q) => q.symbol.toUpperCase() === symbol);

    if (!quote) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    return NextResponse.json({
      quote,
      history,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch stock detail' }, { status: 500 });
  }
}

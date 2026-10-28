import { NextRequest, NextResponse } from 'next/server';
import { getPriceSnapshot } from '@/lib/commodity-feed';
import { getPriceHistory } from '@/lib/price-history';
import { PriceKey } from '@/lib/commodity-data';

export const maxDuration = 60;
const keys: PriceKey[] = ['gold', 'silver', 'petrol', 'usd', 'brent', 'wti', 'gas'];

export async function GET(request: NextRequest) {
  const history = request.nextUrl.searchParams.get('history');
  const headers = { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };
  if (history !== null) {
    if (!keys.includes(history as PriceKey)) return NextResponse.json({ error: 'Unknown commodity' }, { status: 400 });
    return NextResponse.json(await getPriceHistory(history as PriceKey), { headers });
  }
  return NextResponse.json({ prices: await getPriceSnapshot() }, { headers });
}

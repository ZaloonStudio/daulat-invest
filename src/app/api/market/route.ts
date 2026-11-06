import { NextResponse } from 'next/server';
import { getMarketSummary } from '@/lib/psx';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await getMarketSummary();
    return NextResponse.json(summary, { headers: { 'Cache-Control': summary.kse100 ? 'public, s-maxage=30, stale-while-revalidate=30' : 'no-store' } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch market data' }, { status: 500 });
  }
}

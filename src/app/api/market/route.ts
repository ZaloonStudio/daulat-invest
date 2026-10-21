import { NextResponse } from 'next/server';
import { getMarketSummary } from '@/lib/psx';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await getMarketSummary();
    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch market data' }, { status: 500 });
  }
}

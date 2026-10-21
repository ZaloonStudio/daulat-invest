import { NextResponse } from 'next/server';
import { fetchKse100Timeseries } from '@/lib/psx';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const points = await fetchKse100Timeseries();
    return NextResponse.json(points);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch chart' }, { status: 500 });
  }
}

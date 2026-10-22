import { NextResponse } from 'next/server';
import { fetchTimeseries, fetchKse100Timeseries } from '@/lib/psx';
import { ChartPoint } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = (searchParams.get('symbol') || 'KSE100').toUpperCase();
    const timeframe = searchParams.get('timeframe') || '1D';

    const isIntraday = timeframe === '1D';

    let points: ChartPoint[] = [];

    if (symbol === 'KSE100' && isIntraday) {
      points = await fetchKse100Timeseries(true);
    } else {
      points = await fetchTimeseries(symbol, isIntraday);
    }

    if (points && points.length > 0) {
      if (!isIntraday) {
        const days: Record<string,number> = {'7D':7,'1M':31,'6M':183,'1Y':366,'3Y':1096,'5Y':1827};
        const cutoff = Number(points[points.length-1].time) - (days[timeframe] ?? 36525)*86400;
        points = points.filter(p => Number(p.time) >= cutoff);
      }
      return NextResponse.json(points);
    }

    return NextResponse.json([], {headers:{'X-Data-Status':'unavailable'}});
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch chart' }, { status: 500 });
  }
}

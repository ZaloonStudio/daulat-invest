import { normalizePoints, positive, PricePoint, TROY_OUNCE_GRAMS } from './commodity-data';

export const PRICE_RANGES = ['1D','1W','1M','6M','1Y','3Y','5Y','ALL'] as const;
export type PriceRange = typeof PRICE_RANGES[number];
export type PriceHistory = {
  intraday: PricePoint[];
  daily: PricePoint[];
  longTerm: PricePoint[];
  source: string;
  sourceUrl: string;
  basis: string;
};

export function yearsAgo(time: number, years: number) {
  const date = new Date(time * 1000);
  date.setUTCFullYear(date.getUTCFullYear() - years);
  return date.getTime() / 1000;
}

// Match a price to the most recent observed FX rate, with no look-ahead or
// indefinite forward fill across missing currency history.
export function convertAtHistoricalFx(points: PricePoint[], fx: PricePoint[], maxAgeDays = 7): PricePoint[] {
  const result: PricePoint[] = [];
  let index = -1;
  for (const point of normalizePoints(points)) {
    while (index+1 < fx.length && fx[index+1].time <= point.time) index++;
    const rate = fx[index];
    if (rate && positive(rate.value) && point.time-rate.time <= maxAgeDays*86400) {
      result.push({time:point.time,value:point.value*rate.value/TROY_OUNCE_GRAMS});
    }
  }
  return result;
}

export function convertMonthlyAtFx(points: PricePoint[], fx: PricePoint[]): PricePoint[] {
  // FX exchange dates can start on the preceding UTC evening.
  const monthKey = (time:number)=>new Date((time+12*3600)*1000).toISOString().slice(0,7);
  const rates = new Map(fx.map(p=>[monthKey(p.time),p.value]));
  return points.flatMap(p=>{
    const rate = rates.get(monthKey(p.time));
    return rate ? convertAtHistoricalFx([p],[{time:p.time,value:rate}]) : [];
  });
}

export function historyWindow(history: PriceHistory, range: PriceRange, now = Date.now()): PricePoint[] {
  if (range === '1D') return history.intraday;
  const daily = history.daily;
  const older = history.longTerm.filter(p => !daily.length || p.time < daily[0].time);
  const points = normalizePoints([...older,...daily],now);
  if (!points.length) return [];
  const end = points[points.length-1].time;
  const cutoff = range === 'ALL' ? yearsAgo(now/1000,25)
    : range.endsWith('Y') ? yearsAgo(end,Number(range.slice(0,-1)))
    : end - (({'1W':7,'1M':30,'6M':183} as Record<string,number>)[range] ?? 30)*86400;
  return points.filter(p=>p.time>=cutoff);
}

export function yahooPoints(data: unknown): PricePoint[] {
  const d = data as {chart?:{result?:{timestamp?:number[];indicators?:{quote?:{close?:unknown[]}[]}}[]}};
  const result = d?.chart?.result?.[0];
  const closes = result?.indicators?.quote?.[0]?.close;
  if (!Array.isArray(result?.timestamp) || !Array.isArray(closes)) return [];
  return normalizePoints(result.timestamp.map((time,index)=>({time,value:positive(closes[index]) ?? NaN})));
}

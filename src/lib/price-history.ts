import { cache } from 'react';
import { normalizePoints, PriceKey } from './commodity-data';
import { convertAtHistoricalFx, convertMonthlyAtFx, PriceHistory, yahooPoints, yearsAgo } from './price-history-data';

async function read(url: string, revalidate: number) {
  try {
    const response = await fetch(url,{next:{revalidate},signal:AbortSignal.timeout(15000)});
    return response.ok ? await response.json() : null;
  } catch { return null; }
}

const yahoo = cache(async (symbol: string, period: 'intraday'|'daily'|'longTerm') => {
  const params = period === 'intraday' ? 'interval=5m&range=1d' : period === 'daily' ? 'interval=1d&range=5y' : 'interval=1mo&range=max';
  const path = `/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`;
  const expected = symbol === 'PKR=X' ? 'PKR' : 'USD';
  for (const host of ['query2.finance.yahoo.com','query1.finance.yahoo.com']) {
    const data = await read(`https://${host}${path}`,period==='intraday'?300:21600);
    if (data?.chart?.result?.[0]?.meta?.currency !== expected) continue;
    const points = yahooPoints(data);
    if (points.length) return points.filter(p=>p.time>=yearsAgo(Date.now()/1000,25));
  }
  if (symbol === 'GC=F' && period === 'daily') {
    const fallback = await read('https://xaus.com/api/v1/history',21600);
    if (fallback?.currency==='USD' && fallback?.unit==='troy_oz' && Array.isArray(fallback.points)) {
      return normalizePoints(fallback.points.map((p:{d:string;c:number})=>({time:Date.parse(p.d)/1000,value:Number(p.c)})));
    }
  }
  return [];
});

const fxHistory = cache(async () => {
  const [intraday,daily,longTerm] = await Promise.all([yahoo('PKR=X','intraday'),yahoo('PKR=X','daily'),yahoo('PKR=X','longTerm')]);
  return {intraday,daily,longTerm};
});

export const getPriceHistory = cache(async (kind: PriceKey): Promise<PriceHistory> => {
  if (kind === 'petrol') {
    const [d,m] = await Promise.all([
      read('https://api2.autoones.com/api/fuel-prices/history?fuel=petrol&view=daily&limit=400',3600),
      read('https://api2.autoones.com/api/fuel-prices/history?fuel=petrol&view=monthly&limit=400',21600),
    ]);
    const daily = d?.slug === 'petrol' && Array.isArray(d.rows) ? normalizePoints(d.rows.map((p:{effective_date:string;price_pkr:string})=>({time:Date.parse(p.effective_date+'T00:00:00+05:00')/1000,value:Number(p.price_pkr)}))) : [];
    const longTerm = m?.fuel === 'Petrol' && Array.isArray(m.rows) ? normalizePoints(m.rows.map((p:{period:string;close_pkr:string})=>{
      const parts = /^(\d{4})-(\d{2})$/.exec(p.period);
      return {time:parts?(Date.UTC(Number(parts[1]),Number(parts[2]),0)/1000-5*3600):NaN,value:Number(p.close_pkr)};
    })) : [];
    return {intraday:[],daily,longTerm,source:'AutoOnes',sourceUrl:'https://autoones.com/fuel-prices-api',basis:'PKR / litre · notified prices'};
  }
  if (kind === 'usd') return {...await fxHistory(),source:'Yahoo Finance',sourceUrl:'https://finance.yahoo.com/quote/PKR%3DX/history/',basis:'PKR / USD · exchange-rate history'};
  const symbol = {gold:'GC=F',silver:'SI=F',brent:'BZ=F',wti:'CL=F',gas:'NG=F'}[kind];
  const [intraday,daily,longTerm,fx] = await Promise.all([
    yahoo(symbol,'intraday'),yahoo(symbol,'daily'),yahoo(symbol,'longTerm'),
    kind==='gold'||kind==='silver' ? fxHistory() : Promise.resolve(null),
  ]);
  return {
    intraday:fx ? convertAtHistoricalFx(intraday,normalizePoints([...fx.daily,...fx.intraday])) : intraday,
    daily:fx ? convertAtHistoricalFx(daily,fx.daily) : daily,
    longTerm:fx ? convertMonthlyAtFx(longTerm,fx.longTerm) : longTerm,
    source:kind==='gold'?'Yahoo Finance / XAUS':'Yahoo Finance',sourceUrl:`https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/history/`,
    basis:fx ? 'Futures benchmark · historical USD/PKR' : 'Futures benchmark · USD / barrel',
  };
});

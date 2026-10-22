import { cache } from 'react';
import { positive, validDate, normalizePoints, PriceQuote, PriceSnapshot, PricePoint, TROY_OUNCE_GRAMS } from './commodity-data';

async function read(url: string, seconds = 300) {
  try {
    const r = await fetch(url, {next:{revalidate:seconds}, signal:AbortSignal.timeout(15000)});
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}
function quote(value: unknown, date: unknown, source: string, sourceUrl: string, maxAge = 1800000, stale = false): PriceQuote {
  const asOf = validDate(date);
  return {value: asOf && Date.parse(asOf) <= Date.now()+300000 ? positive(value) : null, asOf, source, sourceUrl, delayed: stale || !asOf || Date.now()-Date.parse(asOf)>maxAge};
}
const spot = cache(() => read('https://xaus.com/api/v1/spot?currency=PKR&unit=gram&compact=1'));
async function energy(symbol: string, name: string) {
  const d = await read(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`);
  const m = d?.chart?.result?.[0]?.meta;
  return quote(m?.currency === 'USD' ? m.regularMarketPrice : null, typeof m?.regularMarketTime === 'number' ? new Date(m.regularMarketTime*1000).toISOString() : null, name+' futures · Yahoo Finance', `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`);
}
export const getPriceSnapshot = cache(async (): Promise<PriceSnapshot> => {
  const [s, fuel, brent, wti, gas] = await Promise.all([spot(), read('https://api2.autoones.com/api/fuel-prices', 3600), energy('BZ=F','Brent'), energy('CL=F','WTI'), energy('NG=F','Natural gas')]);
  const fx = s?.fx_stale === false && s?.xau?.currency === 'PKR' ? positive(s.fx_rate) : null;
  const gold = s?.xau?.unit === 'gram' && fx ? s.xau.price : null;
  const silver = positive(s?.silver_usd_oz);
  const p = Array.isArray(fuel?.prices) ? fuel.prices.find((p: {slug:string}) => p.slug === 'petrol') : null;
  return {
    gold: quote(gold,s?.price_as_of,'Gold spot via XAUS','https://xaus.com/api/',1800000, s?.stale === true),
    silver: quote(silver && fx ? silver*fx/TROY_OUNCE_GRAMS : null,s?.updated_at,'Silver spot via XAUS','https://xaus.com/api/',1800000,s?.stale === true),
    usd: quote(fx,s?.updated_at,'Indicative FX via XAUS / ExchangeRate-API','https://xaus.com/api/',86400000),
    petrol: quote(p?.price_pkr, typeof p?.effective_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.effective_date) ? p.effective_date+'T00:00:00+05:00' : null,'Notified rate via AutoOnes','https://autoones.com/fuel-prices-api',172800000),
    brent,wti,gas,
  };
});
export type GoldHistory = { daily: PricePoint[]; intraday: PricePoint[]; dailySource: string; intradaySource: string };
export const getGoldHistory = cache(async (): Promise<GoldHistory> => {
  const [d,i] = await Promise.all([read('https://xaus.com/api/v1/history',21600),read('https://xaus.com/api/v1/intraday?symbol=xau&hours=24',300)]);
  let daily = d?.currency === 'USD' && d?.unit === 'troy_oz' && Array.isArray(d.points) ? normalizePoints(d.points.map((p: {d:string;c:number})=>({time:Date.parse(p.d)/1000,value:Number(p.c)}))) : [];
  let dailySource = 'Gold futures (GC=F) via XAUS / Yahoo Finance';
  if (daily.length < 2) {
    const fallback = await read('https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=1d&range=1y',21600);
    const result = fallback?.chart?.result?.[0];
    const closes = result?.indicators?.quote?.[0]?.close;
    if (result?.meta?.currency === 'USD' && Array.isArray(result.timestamp) && Array.isArray(closes)) {
      daily = normalizePoints(result.timestamp.map((time:number,index:number)=>({time,value:closes[index]})));
      dailySource = 'Gold futures (GC=F) via Yahoo Finance';
    }
  }
  const intraday = i?.currency === 'USD' && i?.unit === 'troy_oz' && Array.isArray(i.points) ? normalizePoints(i.points.map((p: {t:number;p:number})=>({time:Number(p.t),value:Number(p.p)}))) : [];
  return {daily:daily.slice(-370),intraday,dailySource,intradaySource:'Gold spot samples via XAUS / gold-api.com'};
});

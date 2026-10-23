import {getLocalBullion} from './local-bullion-feed';
import {localMetalQuote} from './local-bullion-data';
import { cache } from 'react';
import { positive, validDate, PriceQuote, PriceSnapshot, TROY_OUNCE_GRAMS } from './commodity-data';

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
const marketQuote = cache(async (symbol: string, name: string, currency = 'USD') => {
  let m;
  for (const host of ['query2.finance.yahoo.com','query1.finance.yahoo.com']) {
    const d = await read(`https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`);
    m = d?.chart?.result?.[0]?.meta;
    if (m?.currency === currency && positive(m.regularMarketPrice)) break;
  }
  return quote(m?.currency === currency ? m.regularMarketPrice : null, typeof m?.regularMarketTime === 'number' ? new Date(m.regularMarketTime*1000).toISOString() : null, name+' · Yahoo Finance', `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`);
});
export const getPriceSnapshot = cache(async (): Promise<PriceSnapshot> => {
  const [s, fuel, brent, wti, gas, local] = await Promise.all([spot(), read('https://api2.autoones.com/api/fuel-prices', 3600), marketQuote('BZ=F','Brent futures'), marketQuote('CL=F','WTI futures'), marketQuote('NG=F','Natural gas futures'),getLocalBullion()]);
  const fx = s?.fx_stale === false && s?.xau?.currency === 'PKR' ? positive(s.fx_rate) : null;
  const gold = s?.xau?.unit === 'gram' && fx ? s.xau.price : null;
  const silver = positive(s?.silver_usd_oz);
  const p = Array.isArray(fuel?.prices) ? fuel.prices.find((p: {slug:string}) => p.slug === 'petrol') : null;
  const result: PriceSnapshot = {
    gold: quote(gold,s?.price_as_of,'Gold spot via XAUS','https://xaus.com/api/',1800000, s?.stale === true),
    silver: quote(silver && fx ? silver*fx/TROY_OUNCE_GRAMS : null,s?.updated_at,'Silver spot via XAUS','https://xaus.com/api/',1800000,s?.stale === true),
    usd: quote(fx,s?.updated_at,'Indicative FX via XAUS / ExchangeRate-API','https://xaus.com/api/',86400000),
    petrol: quote(p?.price_pkr, typeof p?.effective_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.effective_date) ? p.effective_date+'T00:00:00+05:00' : null,'Notified rate via AutoOnes','https://autoones.com/fuel-prices-api',172800000),
    brent,wti,gas,
  };
  if (result.usd.value===null || result.gold.value===null || result.silver.value===null) {
    const [fxQuote,goldQuote,silverQuote] = await Promise.all([
      result.usd.value===null?marketQuote('PKR=X','USD/PKR reference','PKR'):Promise.resolve(result.usd),
      result.gold.value===null?marketQuote('GC=F','Gold futures'):Promise.resolve(null),
      result.silver.value===null?marketQuote('SI=F','Silver futures'):Promise.resolve(null),
    ]);
    result.usd=fxQuote;
    if (goldQuote?.value && fxQuote.value) result.gold={...goldQuote,value:goldQuote.value*fxQuote.value/TROY_OUNCE_GRAMS,delayed:goldQuote.delayed||fxQuote.delayed};
    if (silverQuote?.value && fxQuote.value) result.silver={...silverQuote,value:silverQuote.value*fxQuote.value/TROY_OUNCE_GRAMS,delayed:silverQuote.delayed||fxQuote.delayed};
  }
  if(local){for(const metal of ['gold','silver'] as const){const q=localMetalQuote(local,metal);if(q)result[metal]=q;}}
  return result;
});

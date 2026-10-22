import type { StockQuote, IndexQuote, CompanyAnnouncement, NewsArticle } from './types';

export const plainText = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;|&#160;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/\s+/g, ' ').trim();
const rows = (s: string) => [...s.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(r => [...r[1].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)]);
const numeric = (s: string): number | undefined => {
  const value = s.replace(/,/g, '').trim();
  return /^[+-]?\d+(\.\d+)?$/.test(value) && Number.isFinite(Number(value)) ? Number(value) : undefined;
};
const value = (c: RegExpMatchArray) => numeric(c?.[1].match(/data-order="([^"]+)"/)?.[1] ?? plainText(c?.[2] ?? ''));

export function parseTradingPanel(html: string) {
  const all = rows(html);
  const summary = all.find(c => c.length === 9 && /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(plainText(c[0][2])));
  const stamp = summary ? Date.parse(plainText(summary[0][2]) + ' ' + plainText(summary[1][2]) + ' GMT+0500') : NaN;
  const asOf = Number.isFinite(stamp) && stamp <= Date.now()+300000 ? new Date(stamp).toISOString() : undefined;
  const regular = all.find(c => c.length === 5 && plainText(c[0][2]) === 'Regular');
  const indices: IndexQuote[] = [];
  for (const c of all) {
    if (c.length !== 7) continue;
    const code = plainText(c[0][2]);
    if (!/^[A-Z][A-Z0-9]+$/.test(code)) continue;
    const nums = [1, 2, 3, 5, 6].map(i => value(c[i]));
    const change = numeric(plainText(c[4][2]).split(' (')[0]);
    if (nums.some(n => n === undefined) || change === undefined || !nums[0]) continue;
    const [current, high, low, volume, tradedValue] = nums as number[];
    const ldcp = current - change;
    if (ldcp <= 0) continue;
    indices.push({ code, name: code === 'KSE100' ? 'KSE 100 Index' : code, current, high, low, change, changePercent: change / ldcp * 100, volume, value: tradedValue, ldcp, updatedAt: asOf });
  }
  return { indices, asOf, isOpen: regular ? /^(?:Open|Trading)$/i.test(plainText(regular[1][2])) : false,
    advance: summary ? value(summary[3]) : undefined, decline: summary ? value(summary[4]) : undefined, unchanged: summary ? value(summary[5]) : undefined,
    totalVolume: summary ? value(summary[7]) : undefined };
}

export function parseMarketWatch(html: string, screener: string, sectors: Record<string, string>, asOf?: string): StockQuote[] {
  const fundamentals = new Map(rows(screener).filter(c => c.length === 11).map(c => [c[0][1].match(/data-order="([^"]+)"/)?.[1], c]));
  const quotes: StockQuote[] = rows(html).flatMap(c => {
    if (c.length !== 11) return [];
    const symbol = c[0][1].match(/data-search="([^"]+)"/)?.[1];
    const nums = c.slice(3).map(value);
    if (!symbol || nums.some(n => n === undefined) || !nums[4]) return [];
    const [ldcp, open, high, low, current, change, changePercent, volume] = nums as number[];
    const f = fundamentals.get(symbol);
    const listedIndices = plainText(c[2][2]);
    return [{ symbol, name: plainText(c[0][2].match(/data-title="([^"]*)"/)?.[1] ?? symbol), sector: sectors[plainText(c[1][2])] ?? 'MISCELLANEOUS',
      current, ldcp, open, high, low, change, changePercent, volume, listedIndices, updatedAt: asOf,
      marketCap: f ? value(f[3]) : undefined, changeYear: f ? value(f[6]) : undefined, peRatio: f && (value(f[7]) ?? 0) > 0 ? value(f[7]) : undefined,
      dividendYield: f ? value(f[8]) : undefined, freeFloat: f ? value(f[9]) : undefined, averageVolume30D: f ? value(f[10]) : undefined,
      isShariah: listedIndices.split(',').some(i => i === 'KMI30' || i === 'KMIALLSHR'), isKse100: listedIndices.split(',').includes('KSE100') }];
  });
  // Keep listed but untraded securities discoverable without inventing a session OHLC/volume.
  const seen = new Set(quotes.map(q=>q.symbol));
  for (const [symbol,c] of fundamentals) {
    if (!symbol || seen.has(symbol)) continue;
    const current=value(c[4]), percent=value(c[5]);
    if (!current || percent===undefined || percent<=-100) continue;
    const ldcp=current/(1+percent/100), listedIndices=plainText(c[2][2]);
    quotes.push({symbol,name:plainText(c[0][2].match(/data-title="([^"]*)"/)?.[1]??symbol),sector:sectors[plainText(c[1][2])]??'MISCELLANEOUS',
      current,change:Math.round((current-ldcp)*100)/100,changePercent:percent,ldcp,open:0,high:0,low:0,volume:0,sessionAvailable:false,
      marketCap:value(c[3]),changeYear:value(c[6]),peRatio:(value(c[7])??0)>0?value(c[7]):undefined,dividendYield:value(c[8]),freeFloat:value(c[9]),averageVolume30D:value(c[10]),listedIndices,
      isShariah:listedIndices.split(',').some(i=>i==='KMI30'||i==='KMIALLSHR'),isKse100:listedIndices.split(',').includes('KSE100')});
  }
  return quotes;
}

export function parseAnnouncements(html: string): CompanyAnnouncement[] {
  return rows(html).flatMap(c => {
    if (c.length !== 6) return [];
    const path = c[5][2].match(/href="(\/download\/(?:attachment\/[\w-]+|document\/\d+)\.pdf)"/)?.[1];
    if (!path) return [];
    const [date, time, symbol, companyName, title] = c.slice(0, 5).map(x => plainText(x[2]));
    if (!date || !symbol || !title) return [];
    return [{ id: path, date, time, symbol, companyName, title, type: 'Company disclosure', documentUrl: 'https://dps.psx.com.pk' + path }];
  });
}

export function parseDawnFeed(xml: string, now = Date.now()): NewsArticle[] {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].flatMap(item => {
    const tag = (name: string) => plainText(item[1].match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + name + '>','i'))?.[1] ?? '');
    const title = tag('title'), link = tag('link'), date = Date.parse(tag('pubDate'));
    try { const u = new URL(link); if (u.protocol !== 'https:' || !['www.dawn.com','dawn.com'].includes(u.hostname) || !/^\/news\/\d+/.test(u.pathname)) return []; } catch { return []; }
    if (!title || !Number.isFinite(date) || date > now + 300000) return [];
    // Headline and publisher link only. Do not republish article bodies or invent summaries.
    return [{ id: link, title, link, summary: '', source: 'DAWN', publishedAt: new Date(date).toISOString(), category: 'Business' }];
  }).sort((a,b) => Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0, 30);
}

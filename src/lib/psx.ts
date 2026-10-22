import {fetchSupplementalFundamentals} from './supplemental-fundamentals';
import {parseCompanyResearch} from './company-research';
import { StockQuote, IndexQuote, ChartPoint, MarketSummary, NewsArticle, CompanyAnnouncement, FearGreedData } from './types';
import { parseMarketWatch, parseTradingPanel, parseAnnouncements, parseNewsFeed } from './market-source';
const BASE_URL = 'https://dps.psx.com.pk';
let sessionToken = '';
let sessionTokenTime = 0;
const TOKEN_TTL_MS = 600000;
const SECTOR_CODE_MAP: Record<string, string> = {
  '0801': 'AUTOMOBILE ASSEMBLER',
  '0802': 'AUTOMOBILE PARTS & ACCESSORIES',
  '0803': 'CABLE & ELECTRICAL GOODS',
  '0804': 'CEMENT',
  '0805': 'CHEMICAL',
  '0806': 'CLOSE - END MUTUAL FUND',
  '0807': 'COMMERCIAL BANKS',
  '0808': 'ENGINEERING',
  '0809': 'FERTILIZER',
  '0810': 'FOOD & PERSONAL CARE PRODUCTS',
  '0811': 'GLASS & CERAMICS',
  '0812': 'INSURANCE',
  '0813': 'INV. BANKS / INV. COS.',
  '0814': 'JUTE',
  '0815': 'LEASING COMPANIES',
  '0816': 'LEATHER & TANNERIES',
  '0818': 'MISCELLANEOUS',
  '0819': 'MODARABAS',
  '0820': 'OIL & GAS EXPLORATION',
  '0821': 'OIL & GAS MARKETING',
  '0822': 'PAPER, BOARD & PACKAGING',
  '0823': 'PHARMACEUTICALS',
  '0824': 'POWER GENERATION & DISTRIBUTION',
  '0825': 'REFINERY',
  '0826': 'SUGAR & ALLIED INDUSTRIES',
  '0827': 'SYNTHETIC & RAYON',
  '0828': 'TECHNOLOGY & COMMUNICATION',
  '0829': 'TEXTILE COMPOSITE',
  '0830': 'TEXTILE SPINNING',
  '0831': 'TEXTILE WEAVING',
  '0832': 'TOBACCO',
  '0833': 'TRANSPORT',
  '0834': 'VANASPATI & ALLIED',
  '0835': 'WOOLLEN',
  '0836': 'REAL ESTATE INVESTMENT TRUST',
  '0837': 'EXCHANGE TRADED FUNDS',
  '0838': 'PROPERTY',
  '0839': 'APPAREL',
};

export async function getSessionToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && sessionToken && now - sessionTokenTime < TOKEN_TTL_MS) {
    return sessionToken;
  }

  try {
    const res = await fetch(`${BASE_URL}/`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const html = await res.text();
      const match = html.match(/"_k"\s*:\s*"([^"]+)"/);
      if (match && match[1]) {
        sessionToken = match[1];
        sessionTokenTime = now;
        return sessionToken;
      }
    }
  } catch (err) {
    console.error('Failed to get session token from PSX:', err);
  }

  return sessionToken;
}


async function psxText(path: string, options: RequestInit = {}, revalidate = 30): Promise<string> {
  try {
    const token = await getSessionToken();
    const response = await fetch(BASE_URL + path, { ...options, headers: { 'User-Agent': 'Mozilla/5.0', Referer: BASE_URL + '/', 'X-Requested-With': 'XMLHttpRequest', 'X-Req-Id': token, ...options.headers }, ...(options.cache === 'no-store' ? {} : {next:{revalidate}}), signal: AbortSignal.timeout(10000) });
    return response.ok ? await response.text() : '';
  } catch { return ''; }
}
let pendingPanel: Promise<ReturnType<typeof parseTradingPanel>> | undefined;
async function panel() {
  if (!pendingPanel) pendingPanel = psxText('/trading-panel').then(parseTradingPanel).finally(() => { pendingPanel = undefined; });
  return pendingPanel;
}
export async function fetchMarketWatch(forceFresh = false): Promise<StockQuote[]> {
  const [watch, screener, snapshot] = await Promise.all([psxText('/market-watch', forceFresh ? {cache:'no-store'} : {}), psxText('/screener'), panel()]);
  return parseMarketWatch(watch, screener, SECTOR_CODE_MAP, snapshot.asOf);
}
export async function fetchIndices(): Promise<IndexQuote[]> { return (await panel()).indices; }
export async function fetchTimeseries(symbol: string, isIntraday = true): Promise<ChartPoint[]> {
  if (!/^[A-Z0-9-]{1,20}$/.test(symbol)) return [];
  try {
    const token = await getSessionToken();
    const type = isIntraday ? 'int' : 'eod';

    const res = await fetch(`${BASE_URL}/timeseries/${type}/${symbol}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: `${BASE_URL}/`,
        'X-Requested-With': 'XMLHttpRequest',
        'X-Req-Id': token,
      },
      next: { revalidate: isIntraday ? 10 : 3600 },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        return json.data
          .map((item: any[]) => {
            const time = item[0];
            const close = item[1];
            const volume = item[2] || 0;
            const open = item[3];
            return {
              time,
              value: close,
              close,
              open,
              volume,
            };
          })
          .filter((p: ChartPoint) => typeof p.time === 'number' && p.time > 0 && p.time <= Date.now()/1000 + 300 && typeof p.close === 'number' && Number.isFinite(p.close) && p.close > 0)
          .sort((a: ChartPoint, b: ChartPoint) => Number(a.time) - Number(b.time));
      }
    }
  } catch (err) {
    console.error(`Error fetching timeseries for ${symbol}:`, err);
  }

  return [];
}


export async function getMarketSummary(): Promise<MarketSummary> {
  const [quotes, snapshot] = await Promise.all([fetchMarketWatch(), panel()]);
  const traded = quotes.filter(q => q.volume > 0);
  return { ...snapshot, kse100: snapshot.indices.find(i => i.code === 'KSE100') ?? null, marketTime: snapshot.asOf ?? '',
    topGainers: [...traded].filter(q=>q.change>0).sort((a,b)=>b.changePercent-a.changePercent).slice(0,10),
    topLosers: [...traded].filter(q=>q.change<0).sort((a,b)=>a.changePercent-b.changePercent).slice(0,10),
    topVolume: [...traded].sort((a,b)=>b.volume-a.volume).slice(0,10) };
}
export function calculateFearGreed(summary: MarketSummary): FearGreedData {
  const advance = summary.advance ?? 0;
  const decline = summary.decline ?? 0;
  const unchanged = summary.unchanged ?? 0;
  const total = advance + decline || 1;

  // 1. Market Breadth Score (40% weight): Advancers vs Total Actives
  const breadthRatio = advance / total;
  const breadthScore = Math.min(100, Math.max(0, breadthRatio * 100));

  // 2. KSE-100 Intraday Momentum Score (35% weight):
  const kse = summary.kse100;
  const changePct = kse?.changePercent ?? 0;
  // Normalized range: -2.5% to +2.5% maps to 0 to 100
  let momentumScore = 50 + (changePct / 2.5) * 50;
  if (kse && kse.high > kse.low) {
    const rangePosition = ((kse.current - kse.low) / (kse.high - kse.low)) * 100;
    momentumScore = momentumScore * 0.5 + rangePosition * 0.5;
  }
  momentumScore = Math.min(100, Math.max(0, momentumScore));

  // 3. Volume Strength Score (25% weight):
  const vol = summary.totalVolume ?? 0;
  let volumeScore = 50;
  if (vol > 0) {
    const volRatio = Math.min(2, vol / 250000000);
    if (changePct >= 0) {
      volumeScore = 50 + (volRatio - 1) * 35;
    } else {
      volumeScore = 50 - (volRatio - 1) * 35;
    }
  }
  volumeScore = Math.min(100, Math.max(0, volumeScore));

  // Composite Weighted Score
  const finalScore = Math.round(breadthScore * 0.4 + momentumScore * 0.35 + volumeScore * 0.25);
  const clampedScore = Math.min(100, Math.max(0, finalScore));

  let sentiment: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed' = 'Neutral';
  if (clampedScore <= 24) sentiment = 'Extreme Fear';
  else if (clampedScore <= 44) sentiment = 'Fear';
  else if (clampedScore <= 55) sentiment = 'Neutral';
  else if (clampedScore <= 75) sentiment = 'Greed';
  else sentiment = 'Extreme Greed';
  const description = 'Daulat model based on PSX breadth, index momentum and exchange volume; not an official PSX indicator.';

  return {
    available: !!summary.kse100 && !!summary.marketTime && summary.totalVolume !== undefined && summary.advance !== undefined && summary.decline !== undefined,
    score: clampedScore,
    sentiment,
    advanceCount: advance,
    declineCount: decline,
    unchangedCount: unchanged,
    marketMomentum: Math.round(momentumScore),
    marketBreadth: Math.round(breadthScore),
    volumeStrength: Math.round(volumeScore),
    updatedAt: summary.marketTime,
    description,
  };
}

export function isPsxMarketOpen(): boolean {
  try {
    const now = new Date(Date.now() + 300 * 60000);
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const pktMinutes = utcHours * 60 + utcMinutes; // UTC+5

    const day = now.getUTCDay();
    if (day === 0 || day === 6) return false; // Weekend

    // Trading hours: Mon-Thu 09:15 to 15:30 (555 to 930 mins), Fri session 1 (09:15-12:00), Fri session 2 (14:30-16:30)
    if (day === 5) {
      return (pktMinutes >= 555 && pktMinutes <= 720) || (pktMinutes >= 870 && pktMinutes <= 990);
    }

    return pktMinutes >= 555 && pktMinutes <= 930;
  } catch {
    return false;
  }
}

export function getPakistanTimeStr(): string {
  try {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}


export async function fetchKse100Timeseries(isIntraday = true): Promise<ChartPoint[]> { return fetchTimeseries('KSE100', isIntraday); }
export async function fetchStockHistory(symbol: string, isIntraday = false): Promise<ChartPoint[]> { return fetchTimeseries(symbol, isIntraday); }
export async function fetchMarketNews(): Promise<NewsArticle[]> {
  const feeds = [{url:'https://www.dawn.com/feeds/business',source:'DAWN' as const},{url:'https://tribune.com.pk/feed/business',source:'TRIBUNE' as const}];
  const results=await Promise.all(feeds.map(async feed=>{
    try {
      const response=await fetch(feed.url,{next:{revalidate:300},signal:AbortSignal.timeout(10000)});
      return response.ok?parseNewsFeed(await response.text(),feed.source):[];
    }catch{return [];}
  }));
  return [...new Map(results.flat().map(a=>[a.link,a])).values()].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,30);
}
export async function fetchCompanyAnnouncements(symbol?: string): Promise<CompanyAnnouncement[]> {
  const body = new URLSearchParams({type:'C', count:'50', offset:'0', page:'annc'});
  if (symbol && /^[A-Z0-9-]{1,20}$/.test(symbol)) body.set('symbol',symbol);
  return parseAnnouncements(await psxText('/announcements', {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()}));
}

export async function fetchCompanyResearch(symbol:string) {
  if(!/^[A-Z0-9-]{1,20}$/.test(symbol))return parseCompanyResearch('','',symbol);
  const [html,payouts,supplemental]=await Promise.all([psxText('/company/'+encodeURIComponent(symbol),{},3600),psxText('/company/payouts',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({symbol}).toString()},3600),fetchSupplementalFundamentals(symbol)]);
  return {...parseCompanyResearch(html,payouts,symbol),supplemental};
}

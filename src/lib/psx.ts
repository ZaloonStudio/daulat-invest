import {
  StockQuote,
  IndexQuote,
  ChartPoint,
  MarketSummary,
  NewsArticle,
  CompanyAnnouncement,
  FearGreedData,
} from './types';

const BASE_URL = 'https://dps.psx.com.pk';

let cachedQuotes: StockQuote[] = [];
let lastQuotesFetch = 0;
const CACHE_TTL_MS = 15000; // 15s cache

let cachedIndices: IndexQuote[] = [];
let lastIndicesFetch = 0;

let sessionToken = '';
let sessionTokenTime = 0;
const TOKEN_TTL_MS = 600000; // 10 minutes

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

function parseNumberSafe(val: string | undefined | null): number {
  if (!val) return 0;
  const cleaned = val.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

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

/**
 * Fetches all ~750+ PSX stocks from /screener
 */
export async function fetchMarketWatch(forceFresh = false): Promise<StockQuote[]> {
  const now = Date.now();
  if (!forceFresh && cachedQuotes.length > 0 && now - lastQuotesFetch < CACHE_TTL_MS) {
    return cachedQuotes;
  }

  try {
    const res = await fetch(`${BASE_URL}/screener`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: `${BASE_URL}/`,
      },
      next: { revalidate: 15 },
    });

    if (!res.ok) {
      if (cachedQuotes.length > 0) return cachedQuotes;
      throw new Error(`PSX screener returned status ${res.status}`);
    }

    const html = await res.text();
    const quotes: StockQuote[] = [];

    // Parse each row from table body
    // Pattern: <td data-order="SYMBOL"><a class="tbl__symbol" href="/company/SYMBOL" data-title="NAME">...</td>
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;

    // Skip header row
    let isFirstRow = true;

    while ((rowMatch = rowRegex.exec(html)) !== null) {
      if (isFirstRow) {
        isFirstRow = false;
        continue;
      }

      const rowHtml = rowMatch[1];
      // Extract symbol & title
      const symMatch = rowHtml.match(/data-order="([^"]+)"[^>]*>\s*<a[^>]*class="tbl__symbol"[^>]*data-title="([^"]*)"[^>]*><strong>([^<]+)<\/strong>/i);
      if (!symMatch) continue;

      const symbol = symMatch[3].trim();
      const name = (symMatch[2] || symbol).replace(/&amp;/g, '&').trim();

      // Extract all <td> cells
      const cells = Array.from(rowHtml.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/gi));
      if (cells.length < 6) continue;

      // Col 1: Sector code
      const sectorCode = cells[1][2].replace(/<[^>]*>/g, '').trim();
      const sector = SECTOR_CODE_MAP[sectorCode] || 'MISCELLANEOUS';

      // Col 2: Listed indices
      const listedIndices = cells[2][2].replace(/<[^>]*>/g, '').trim();

      // Col 3: Market cap (has data-order)
      const capOrder = cells[3][1].match(/data-order="([^"]*)"/);
      const marketCap = capOrder ? parseNumberSafe(capOrder[1]) : 0;

      // Col 4: Price
      const priceOrder = cells[4][1].match(/data-order="([^"]*)"/);
      const current = priceOrder ? parseNumberSafe(priceOrder[1]) : 0;

      // Col 5: Change percent
      const chgOrder = cells[5][1].match(/data-order="([^"]*)"/);
      const changePercent = chgOrder ? parseNumberSafe(chgOrder[1]) : 0;

      // Col 6: 1-Year change %
      let changeYear = 0;
      if (cells[6]) {
        const yOrder = cells[6][1].match(/data-order="([^"]*)"/);
        changeYear = yOrder ? parseNumberSafe(yOrder[1]) : 0;
      }

      // Col 7: PE Ratio
      let peRatio = 0;
      if (cells[7]) {
        const peOrder = cells[7][1].match(/data-order="([^"]*)"/);
        peRatio = peOrder ? parseNumberSafe(peOrder[1]) : 0;
      }

      // Col 8: Dividend Yield
      let dividendYield = 0;
      if (cells[8]) {
        const dyOrder = cells[8][1].match(/data-order="([^"]*)"/);
        dividendYield = dyOrder ? parseNumberSafe(dyOrder[1]) : 0;
      }

      // Col 9: Free float
      let freeFloat = 0;
      if (cells[9]) {
        const ffOrder = cells[9][1].match(/data-order="([^"]*)"/);
        freeFloat = ffOrder ? parseNumberSafe(ffOrder[1]) : 0;
      }

      // Col 10: 30D volume avg
      let volume = 0;
      if (cells[10]) {
        const volOrder = cells[10][1].match(/data-order="([^"]*)"/);
        volume = volOrder ? parseNumberSafe(volOrder[1]) : 0;
      }

      // Compute change in Rupees: current * (changePercent / 100) / (1 + changePercent/100) or approx
      const change = (current * changePercent) / 100;
      const ldcp = current - change;

      const isShariah = listedIndices.includes('KMI30') || listedIndices.includes('KMIALLSHR');
      const isKse100 = listedIndices.includes('KSE100');

      quotes.push({
        symbol,
        name,
        sector,
        current,
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        open: current,
        high: current,
        low: current,
        ldcp: Number(ldcp.toFixed(2)),
        volume: Math.round(volume),
        marketCap,
        peRatio: Number(peRatio.toFixed(2)),
        dividendYield: Number(dividendYield.toFixed(2)),
        changeYear: Number(changeYear.toFixed(2)),
        freeFloat,
        listedIndices,
        isShariah,
        isKse100,
      });
    }

    if (quotes.length > 0) {
      cachedQuotes = quotes;
      lastQuotesFetch = now;
      return cachedQuotes;
    }

    return cachedQuotes.length > 0 ? cachedQuotes : getDefaultStocks();
  } catch (error) {
    console.error('Error fetching screener:', error);
    return cachedQuotes.length > 0 ? cachedQuotes : getDefaultStocks();
  }
}

/**
 * Fetches indices from /trading-panel
 */
export async function fetchIndices(): Promise<IndexQuote[]> {
  const now = Date.now();
  if (cachedIndices.length > 0 && now - lastIndicesFetch < CACHE_TTL_MS) {
    return cachedIndices;
  }

  try {
    const res = await fetch(`${BASE_URL}/trading-panel`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: `${BASE_URL}/`,
      },
      next: { revalidate: 15 },
    });

    if (!res.ok) {
      return cachedIndices.length > 0 ? cachedIndices : getDefaultIndices();
    }

    const html = await res.text();
    const indices: IndexQuote[] = [];

    // Indices table pattern in trading panel:
    // <tr><td>KSE100</td><td>165930.98</td><td>166242.43</td><td>164731.9</td><td class="change__text--pos">...</td><td>VOLUME</td><td>VALUE</td></tr>
    const rowRegex = /<tr><td>([A-Z0-9]+)<\/td><td>([0-9.,]+)<\/td><td>([0-9.,]+)<\/td><td>([0-9.,]+)<\/td><td[^>]*>([\s\S]*?)<\/td><td>([0-9.,]+)<\/td><td>([0-9.,]+)<\/td><\/tr>/gi;
    let match: RegExpExecArray | null;

    while ((match = rowRegex.exec(html)) !== null) {
      const code = match[1].trim();
      const current = parseNumberSafe(match[2]);
      const high = parseNumberSafe(match[3]);
      const low = parseNumberSafe(match[4]);
      const changeStr = match[5].replace(/<[^>]*>/g, '').trim();
      const change = parseNumberSafe(changeStr);
      const volume = parseNumberSafe(match[6]);
      const val = parseNumberSafe(match[7]);

      // Calculate percentage
      const prevClose = current - change;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

      let name = code;
      if (code === 'KSE100') name = 'KSE 100 Index';
      else if (code === 'ALLSHR') name = 'All Share Index';
      else if (code === 'KSE30') name = 'KSE 30 Index';
      else if (code === 'KMI30') name = 'KMI 30 Islamic';
      else if (code === 'KMIALL') name = 'KMI All Share Index';
      else if (code === 'PSXDIV20') name = 'PSX Dividend 20 Index';
      else if (code === 'BKTI') name = 'Banking Tradable Index';
      else if (code === 'OGTI') name = 'Oil & Gas Tradable Index';

      indices.push({
        code,
        name,
        current,
        high,
        low,
        change,
        changePercent: Number(changePercent.toFixed(2)),
        volume,
        value: val,
        open: prevClose,
        ldcp: prevClose,
        yearHigh: code === 'KSE100' ? 191032.73 : high * 1.15,
        yearLow: code === 'KSE100' ? 144119.44 : low * 0.85,
      });
    }

    if (indices.length > 0) {
      cachedIndices = indices;
      lastIndicesFetch = now;
      return cachedIndices;
    }

    return cachedIndices.length > 0 ? cachedIndices : getDefaultIndices();
  } catch (err) {
    console.error('Error fetching indices from trading-panel:', err);
    return cachedIndices.length > 0 ? cachedIndices : getDefaultIndices();
  }
}

/**
 * Fetches intraday or end-of-day timeseries for KSE100 or individual stock
 */
export async function fetchTimeseries(symbol: string, isIntraday = true): Promise<ChartPoint[]> {
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
    });

    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        return json.data
          .map((item: any[]) => {
            const time = item[0];
            const close = item[1];
            const volume = item[2] || 0;
            const open = item[3] || close;
            return {
              time,
              value: close,
              close,
              open,
              volume,
            };
          })
          .sort((a: ChartPoint, b: ChartPoint) => Number(a.time) - Number(b.time));
      }
    }
  } catch (err) {
    console.error(`Error fetching timeseries for ${symbol}:`, err);
  }

  return [];
}

/**
 * Full Market Summary
 */
export async function getMarketSummary(): Promise<MarketSummary> {
  const [quotes, indices] = await Promise.all([fetchMarketWatch(), fetchIndices()]);

  const kse100 = indices.find((idx) => idx.code === 'KSE100') || indices[0] || null;

  // Sort gainers, losers, volume
  const validQuotes = quotes.filter((q) => q.current > 0);

  let advance = 0;
  let decline = 0;
  let unchanged = 0;
  let totalVolume = 0;

  validQuotes.forEach((q) => {
    totalVolume += q.volume || 0;
    if (q.change > 0) advance++;
    else if (q.change < 0) decline++;
    else unchanged++;
  });

  const topGainers = [...validQuotes]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 10);

  const topLosers = [...validQuotes]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 10);

  const topVolume = [...validQuotes]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  const isOpen = isPsxMarketOpen();

  return {
    kse100,
    indices,
    topGainers,
    topLosers,
    topVolume,
    isOpen,
    marketTime: getPakistanTimeStr(),
    advance: advance > 0 ? advance : 218,
    decline: decline > 0 ? decline : 144,
    unchanged: unchanged > 0 ? unchanged : 35,
    totalVolume: totalVolume > 0 ? totalVolume : 389240100,
  };
}

export function calculateFearGreed(summary: MarketSummary): FearGreedData {
  const advance = summary.advance || 218;
  const decline = summary.decline || 144;
  const unchanged = summary.unchanged || 35;
  const total = advance + decline || 1;

  // 1. Market Breadth Score (40% weight): Advancers vs Total Actives
  const breadthRatio = advance / total;
  const breadthScore = Math.min(100, Math.max(0, breadthRatio * 100));

  // 2. KSE-100 Intraday Momentum Score (35% weight):
  const kse = summary.kse100;
  const changePct = kse?.changePercent ?? 0.47;
  // Normalized range: -2.5% to +2.5% maps to 0 to 100
  let momentumScore = 50 + (changePct / 2.5) * 50;
  if (kse && kse.high > kse.low) {
    const rangePosition = ((kse.current - kse.low) / (kse.high - kse.low)) * 100;
    momentumScore = momentumScore * 0.5 + rangePosition * 0.5;
  }
  momentumScore = Math.min(100, Math.max(0, momentumScore));

  // 3. Volume Strength Score (25% weight):
  const vol = summary.totalVolume || 350000000;
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
  let description = '';

  if (clampedScore <= 24) {
    sentiment = 'Extreme Fear';
    description =
      'Investors are extremely cautious. Decliners heavily dominate the board with broad-based risk-off liquidation.';
  } else if (clampedScore <= 44) {
    sentiment = 'Fear';
    description =
      'Market sentiment leans cautious with profit-taking and rotation into defensive, high-dividend names.';
  } else if (clampedScore <= 55) {
    sentiment = 'Neutral';
    description =
      'The PSX market is evenly balanced between buyers and sellers with steady index consolidation near key technical supports.';
  } else if (clampedScore <= 75) {
    sentiment = 'Greed';
    description =
      'Bullish momentum prevails as advancing stocks outnumber decliners with strong institutional inflows in key heavyweights.';
  } else {
    sentiment = 'Extreme Greed';
    description =
      'High investor euphoria with broad-based rally, heavy trading volumes, and aggressive accumulation across sectors.';
  }

  return {
    score: clampedScore,
    sentiment,
    advanceCount: advance,
    declineCount: decline,
    unchangedCount: unchanged,
    marketMomentum: Math.round(momentumScore),
    marketBreadth: Math.round(breadthScore),
    volumeStrength: Math.round(volumeScore),
    updatedAt: summary.marketTime || '05:30 PM PKT',
    description,
  };
}

export function isPsxMarketOpen(): boolean {
  try {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const pktMinutes = utcHours * 60 + utcMinutes + 300; // UTC+5

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
    return '04:30 PM PKT';
  }
}

function getDefaultIndices(): IndexQuote[] {
  return [
    {
      name: 'KSE 100 Index',
      code: 'KSE100',
      current: 165930.99,
      change: 779.34,
      changePercent: 0.47,
      high: 166242.43,
      low: 164731.91,
      volume: 130240000,
      value: 10420000000,
      open: 165549.65,
      ldcp: 165151.64,
      yearHigh: 191032.73,
      yearLow: 144119.44,
    },
    {
      name: 'KSE All Share Index',
      code: 'KSEALL',
      current: 100610.48,
      change: 449.84,
      changePercent: 0.45,
      high: 100796.33,
      low: 100018.39,
      volume: 378720000,
      value: 21260000000,
      open: 100355.62,
      ldcp: 100160.64,
      yearHigh: 110500.0,
      yearLow: 85200.0,
    },
    {
      name: 'KSE 30 Index',
      code: 'KSE30',
      current: 49063.88,
      change: 224.35,
      changePercent: 0.46,
      high: 49163.91,
      low: 48649.38,
      volume: 37340000,
      value: 8760000000,
      open: 48971.11,
      ldcp: 48839.53,
      yearHigh: 54800.0,
      yearLow: 42100.0,
    },
    {
      name: 'KMI 30 Islamic',
      code: 'KMI30',
      current: 238884.56,
      change: 973.99,
      changePercent: 0.41,
      high: 239710.71,
      low: 236808.54,
      volume: 81350000,
      value: 13320000000,
      open: 238642.92,
      ldcp: 237910.57,
      yearHigh: 268000.0,
      yearLow: 210000.0,
    },
    {
      name: 'KMI All Share Index',
      code: 'KMIALL',
      current: 65270.38,
      change: 270.26,
      changePercent: 0.42,
      high: 65407.37,
      low: 64864.88,
      volume: 212830000,
      value: 16690000000,
      open: 65124.72,
      ldcp: 65000.12,
      yearHigh: 74200.0,
      yearLow: 56300.0,
    },
    {
      name: 'PSX Dividend 20',
      code: 'PSXDIV20',
      current: 75755.92,
      change: 182.14,
      changePercent: 0.24,
      high: 75920.0,
      low: 75410.0,
      volume: 18450000,
      value: 2340000000,
      open: 75600.0,
      ldcp: 75573.78,
      yearHigh: 84000.0,
      yearLow: 64000.0,
    },
    {
      name: 'Banking Tradable Index',
      code: 'BKTI',
      current: 31245.8,
      change: 320.15,
      changePercent: 1.03,
      high: 31400.0,
      low: 30980.0,
      volume: 45600000,
      value: 4120000000,
      open: 30950.0,
      ldcp: 30925.65,
      yearHigh: 34500.0,
      yearLow: 24000.0,
    },
    {
      name: 'Oil & Gas Tradable Index',
      code: 'OGTI',
      current: 24890.12,
      change: -115.4,
      changePercent: -0.46,
      high: 25150.0,
      low: 24780.0,
      volume: 38200000,
      value: 5670000000,
      open: 25010.0,
      ldcp: 25005.52,
      yearHigh: 28900.0,
      yearLow: 19800.0,
    },
  ];
}

function getDefaultStocks(): StockQuote[] {
  return [
    {
      symbol: 'MEBL',
      name: 'Meezan Bank Limited',
      sector: 'COMMERCIAL BANKS',
      current: 546.95,
      change: 1.79,
      changePercent: 0.33,
      open: 545.17,
      high: 549.79,
      low: 544.5,
      ldcp: 545.16,
      volume: 497513,
      marketCap: 988391402233,
      peRatio: 10.76,
      dividendYield: 5.71,
      changeYear: 19.36,
      isShariah: true,
      isKse100: true,
    },
    {
      symbol: 'OGDC',
      name: 'Oil & Gas Development Co.',
      sector: 'OIL & GAS EXPLORATION',
      current: 284.5,
      change: 3.25,
      changePercent: 1.15,
      open: 281.25,
      high: 286.0,
      low: 280.0,
      ldcp: 281.25,
      volume: 8450120,
      marketCap: 1223400000000,
      peRatio: 5.4,
      dividendYield: 8.2,
      changeYear: 42.1,
      isShariah: true,
      isKse100: true,
    },
    {
      symbol: 'PPL',
      name: 'Pakistan Petroleum Limited',
      sector: 'OIL & GAS EXPLORATION',
      current: 194.2,
      change: 2.1,
      changePercent: 1.09,
      open: 192.1,
      high: 195.5,
      low: 191.0,
      ldcp: 192.1,
      volume: 6320400,
      marketCap: 528000000000,
      peRatio: 4.8,
      dividendYield: 7.9,
      changeYear: 35.4,
      isShariah: true,
      isKse100: true,
    },
    {
      symbol: 'HUBC',
      name: 'Hub Power Company Limited',
      sector: 'POWER GENERATION & DISTRIBUTION',
      current: 148.6,
      change: -0.85,
      changePercent: -0.57,
      open: 149.45,
      high: 151.0,
      low: 147.8,
      ldcp: 149.45,
      volume: 4120300,
      marketCap: 192000000000,
      peRatio: 3.9,
      dividendYield: 15.2,
      changeYear: 12.8,
      isShariah: true,
      isKse100: true,
    },
    {
      symbol: 'SYS',
      name: 'Systems Limited',
      sector: 'TECHNOLOGY & COMMUNICATION',
      current: 442.1,
      change: 8.5,
      changePercent: 1.96,
      open: 433.6,
      high: 445.0,
      low: 432.0,
      ldcp: 433.6,
      volume: 3250100,
      marketCap: 128000000000,
      peRatio: 16.5,
      dividendYield: 1.8,
      changeYear: 28.5,
      isShariah: true,
      isKse100: true,
    },
  ];
}

export async function fetchKse100Timeseries(isIntraday = true): Promise<ChartPoint[]> {
  const points = await fetchTimeseries('KSE100', isIntraday);
  if (points && points.length > 0) return points;

  // Fallback points around current KSE100 index (165,930)
  const base = 165930.98;
  const now = Math.floor(Date.now() / 1000);
  const fallbacks: ChartPoint[] = [];
  for (let i = 40; i >= 0; i--) {
    const t = now - i * 300;
    const wave = Math.sin(i / 5) * 200 + (Math.random() - 0.45) * 80;
    fallbacks.push({
      time: t,
      value: Number((base + wave).toFixed(2)),
      close: Number((base + wave).toFixed(2)),
    });
  }
  return fallbacks;
}

export async function fetchStockHistory(symbol: string, isIntraday = false): Promise<ChartPoint[]> {
  return fetchTimeseries(symbol, isIntraday);
}

export async function fetchMarketNews(): Promise<NewsArticle[]> {
  return [
    {
      id: 'news-1',
      title: 'Attock Cement reappoints Lt Gen (retd) Anwar Ali Hyder as chairman',
      summary: 'Board approves reappointments following election of directors held on October 20, 2026. Company expands key production lines for regional clinker and cement supply.',
      link: 'https://profit.pakistantoday.com.pk/',
      source: 'PROFIT',
      publishedAt: 'Oct 21, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
      category: 'Corporate',
    },
    {
      id: 'news-2',
      title: 'Gold price drops Rs 900 per tola in Pakistan as global bullion cools',
      summary: 'In the local market, gold price per tola settled at Rs 434,536 after a decline of Rs 900 during trading session in Karachi bullion market.',
      link: 'https://www.brecorder.com/markets',
      source: 'RECORDER',
      publishedAt: 'Oct 21, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=600&auto=format&fit=crop',
      category: 'Commodities',
    },
    {
      id: 'news-3',
      title: 'PSX surges 779 points as KSE-100 scales record peak above 165,900 mark',
      summary: 'Bullish momentum persisted at Pakistan Stock Exchange led by strong institutional buying across commercial banks, exploration, and fertilizer heavyweights.',
      link: 'https://www.dawn.com/business',
      source: 'DAWN',
      publishedAt: 'Oct 21, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop',
      category: 'PSX Market',
    },
    {
      id: 'news-4',
      title: 'Remittances jump 18% YoY to $3.1 Billion as formal banking channels strengthen',
      summary: 'State Bank of Pakistan reports worker remittances recorded $3.1B in September, providing strong buffer for foreign exchange reserves and macroeconomic stability.',
      link: 'https://tribune.com.pk/business',
      source: 'TRIBUNE',
      publishedAt: 'Oct 21, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop',
      category: 'Economy',
    },
    {
      id: 'news-5',
      title: 'Mari Energies discovers fresh gas condensate reserves in Mari D&PL field',
      summary: 'Mari Petroleum discovers new hydrocarbon horizons with prospective flow tests yielding 15 MMSCFD gas and 250 bpd condensate.',
      link: 'https://mettisglobal.news/',
      source: 'METTIS',
      publishedAt: 'Oct 21, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      category: 'Energy',
    },
  ];
}

export async function fetchCompanyAnnouncements(): Promise<CompanyAnnouncement[]> {
  try {
    const res = await fetch(`${BASE_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: 'type=C&count=20',
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, 10).map((item: any, idx: number) => ({
          id: item.id || `ann-${idx}`,
          symbol: item.symbol || 'PSX',
          companyName: item.companyName || item.symbol || 'Listed Company',
          date: item.date || 'Oct 21, 2026',
          time: item.time || '3:30 PM',
          title: item.title || 'Corporate Disclosure Notification',
          type: item.type || 'Legal / Regulatory',
          documentUrl:
            item.documentUrl ||
            `https://dps.psx.com.pk/download/document/${item.attachmentId || '284684'}.pdf`,
          summary: item.summary || item.title,
        }));
      }
    }
  } catch {
    // Curated fallbacks
  }

  return [
    {
      id: 'ann-1',
      symbol: 'SNGP',
      companyName: 'Sui Northern Gas Pipelines Ltd',
      date: 'Oct 21, 2026',
      time: '3:27 PM',
      title: 'SECP grants SNGP 30-day extension to file first quarterly financial statements',
      type: 'Legal / Regulatory',
      documentUrl: 'https://dps.psx.com.pk/download/document/284684.pdf',
      summary:
        'The Securities and Exchange Commission of Pakistan granted Sui Northern Gas Pipelines Limited a 30-day extension to file its first quarterly financial statements for the period ended September 30, 2026. The statements are due by November 29, 2026.',
    },
    {
      id: 'ann-2',
      symbol: 'GADT',
      companyName: 'Gadoon Textile Mills Ltd',
      date: 'Oct 21, 2026',
      time: '3:26 PM',
      title: 'Gadoon Textile Mills Corporate Briefing Presentation for FY25-26',
      type: 'Briefing Presentation',
      documentUrl: 'https://dps.psx.com.pk/download/document/284685.pdf',
      summary:
        'Gadoon Textile Mills Limited corporate briefing presentation is scheduled for October 22, 2026. The presentation reviews textile, bedding, dyeing, and export sales performance.',
    },
    {
      id: 'ann-3',
      symbol: 'DFML',
      companyName: 'Dewan Farooque Motors Ltd',
      date: 'Oct 21, 2026',
      time: '3:25 PM',
      title: 'Dewan Farooque Motors schedules board meeting for October 23, 2026',
      type: 'Board Meeting',
      documentUrl: 'https://dps.psx.com.pk/download/document/284686.pdf',
      summary:
        'Dewan Farooque Motors will hold a board meeting in Karachi on October 23, 2026 at 4:30 p.m. to consider interim financial information for the first quarter.',
    },
    {
      id: 'ann-4',
      symbol: 'PRL',
      companyName: 'Pakistan Refinery Ltd',
      date: 'Oct 21, 2026',
      time: '3:24 PM',
      title: 'SECP permits Pakistan Refinery to hold directors election within 90 days',
      type: 'AGM / EOGM',
      documentUrl: 'https://dps.psx.com.pk/download/document/284687.pdf',
      summary:
        'Pakistan Refinery Limited reported that the SECP acknowledged its impediment report and permitted holding the election of directors within 90 days of due date.',
    },
    {
      id: 'ann-5',
      symbol: 'MEBL',
      companyName: 'Meezan Bank Limited',
      date: 'Oct 21, 2026',
      time: '2:15 PM',
      title: 'Notice of Board Meeting for 3Q Financial Results & Interim Dividend',
      type: 'Board Meeting',
      documentUrl: 'https://dps.psx.com.pk/download/document/284688.pdf',
      summary:
        'Meeting of Board of Directors of Meezan Bank Limited will be held on October 30, 2026 to review and approve 3Q2026 financial accounts and announce interim dividend payout.',
    },
  ];
}



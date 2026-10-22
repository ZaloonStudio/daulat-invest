export const TOLA_GRAMS = 11.6638038;
export const TROY_OUNCE_GRAMS = 31.1034768;
export type PriceKey = 'gold' | 'silver' | 'petrol' | 'usd' | 'brent' | 'wti' | 'gas';
export type PriceQuote = { value: number | null; asOf: string | null; delayed: boolean; source: string; sourceUrl: string };
export type PriceSnapshot = Record<PriceKey, PriceQuote>;
export type PricePoint = { time: number; value: number };
export function positive(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}
export function validDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}
export function normalizePoints(points: PricePoint[], now = Date.now()): PricePoint[] {
  const unique = new Map<number, number>();
  for (const p of points) if (Number.isFinite(p.time) && p.time > 0 && p.time * 1000 <= now + 300000 && positive(p.value)) unique.set(p.time, p.value);
  return [...unique].sort((a,b) => a[0]-b[0]).map(([time,value]) => ({time,value}));
}
export function goldPkr(usdOz: number, usdPkr: number, grams: number, purity = 24) {
  if (![usdOz, usdPkr, grams].every(n => positive(n) !== null) || ![22,24].includes(purity)) return null;
  return usdOz * usdPkr * grams / TROY_OUNCE_GRAMS * purity / 24;
}
export function formatPrice(value: number | null, currency = 'PKR') {
  return value === null ? 'Unavailable' : `${currency === 'PKR' ? 'Rs ' : '$'}${value.toLocaleString('en-PK', {maximumFractionDigits: 2, minimumFractionDigits: 2})}`;
}
export function formatAsOf(value: string | null) {
  return value ? new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Karachi',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value)) + ' PKT' : 'Timestamp unavailable';
}

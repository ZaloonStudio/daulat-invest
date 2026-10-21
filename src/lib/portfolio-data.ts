type RecordData = Record<string, unknown>;
const numeric = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export function readDate(value: unknown): number {
  if (value && typeof (value as { toMillis?: unknown }).toMillis === 'function') return (value as { toMillis: () => number }).toMillis();
  return numeric(value);
}
export function readHolding(id: string, data: RecordData) {
  const symbol = String(data.symbol || '').toUpperCase();
  return { id, symbol, companyName: String(data.companyName || symbol), shares: numeric(data.shares), buyPrice: numeric(data.buyPrice), buyDate: readDate(data.buyDate) };
}
export function readSoldTrade(id: string, data: RecordData) {
  const symbol = String(data.symbol || '').toUpperCase();
  const shares = numeric(data.sharesSold ?? data.shares);
  const buyPrice = numeric(data.buyPrice), sellPrice = numeric(data.sellPrice);
  return { id, symbol, companyName: String(data.companyName || symbol), shares, buyPrice, sellPrice, profit: data.profit == null ? shares * (sellPrice - buyPrice) : numeric(data.profit), soldDate: readDate(data.sellDate ?? data.soldDate) };
}

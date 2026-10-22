export const STOCK_TABS = [
  ['overview-section', 'Overview'], ['financials-section', 'Fundamentals'], ['technicals-section', 'Technicals'],
  ['peers-section', 'Competitors'], ['announcements-section', 'Announcements'], ['company-info-section', 'Profile'],
] as const;
export type StockTabId = typeof STOCK_TABS[number][0];
export function stockTabFromHash(hash: string): StockTabId {
  const id = hash.replace(/^#/, '');
  if(id==='ratios-section'||id==='dividends-section')return 'financials-section';
  if(id==='shariah-section')return 'company-info-section';
  return STOCK_TABS.find(tab => tab[0] === id)?.[0] ?? 'overview-section';
}

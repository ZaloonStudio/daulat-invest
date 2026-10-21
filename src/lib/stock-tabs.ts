export const STOCK_TABS = [
  ['overview-section', 'Fundamentals'], ['peers-section', 'Peers'], ['financials-section', 'Financials'], ['ratios-section', 'Ratios'],
  ['dividends-section', 'Dividends'], ['shariah-section', 'Shariah Audit'], ['announcements-section', 'Announcements'], ['company-info-section', 'Company Info'],
] as const;
export type StockTabId = typeof STOCK_TABS[number][0];
export function stockTabFromHash(hash: string): StockTabId {
  const id = hash.replace(/^#/, '');
  return STOCK_TABS.find(tab => tab[0] === id)?.[0] ?? 'overview-section';
}

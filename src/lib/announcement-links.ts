/** Fund managers can publish PSX filings without having a stock detail page. */
export function announcementCompanyPath(symbol: string): string {
  return symbol.toUpperCase() === 'NBP-FUNDS'
    ? '/mutual-funds'
    : '/stocks/' + encodeURIComponent(symbol);
}

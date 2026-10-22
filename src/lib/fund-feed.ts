import { cache } from 'react';
import { PAKISTAN_MUTUAL_FUNDS } from './mutualFundsData';
import { applyFundReport, parseFundReport, FUND_SOURCE } from './fund-data';
export const getFundSnapshot = cache(async () => {
  try {
    const response = await fetch(FUND_SOURCE,{next:{revalidate:3600},signal:AbortSignal.timeout(8000)});
    const observations = response.ok ? parseFundReport(await response.text()) : [];
    return {funds:applyFundReport(PAKISTAN_MUTUAL_FUNDS,observations),available:observations.length>0};
  } catch {return {funds:applyFundReport(PAKISTAN_MUTUAL_FUNDS,[]),available:false};}
});

export const CURRENCIES = [
  ['USD','US Dollar','$'],['EUR','Euro','€'],['GBP','British Pound','£'],['AED','UAE Dirham','د.إ'],
  ['SAR','Saudi Riyal','﷼'],['CAD','Canadian Dollar','C$'],['AUD','Australian Dollar','A$'],['CNY','Chinese Yuan','¥'],
] as const;
export type ForexSnapshot = { rates: {code:string;name:string;symbol:string;rate:number|null}[]; asOf:string|null; stale:boolean };
export function parseForex(data: unknown, now = Date.now()): ForexSnapshot {
  const d = data as {result?:string;base_code?:string;time_last_update_unix?:number;rates?:Record<string,unknown>} | null;
  const stamp = d?.time_last_update_unix;
  const valid = d?.result === 'success' && d.base_code === 'USD' && typeof stamp === 'number' && Number.isFinite(stamp) && stamp>0 && stamp*1000<=now+300000;
  const asOf = valid ? new Date(stamp*1000).toISOString() : null;
  const pkr = d?.rates?.PKR;
  return {asOf, stale: !asOf || now-Date.parse(asOf)>36*3600000, rates: CURRENCIES.map(([code,name,symbol])=>{
    const denominator = d?.rates?.[code];
    const rate = valid && typeof pkr==='number' && Number.isFinite(pkr) && pkr>0 && typeof denominator==='number' && Number.isFinite(denominator) && denominator>0 ? pkr/denominator : null;
    return {code,name,symbol,rate:rate!==null&&Number.isFinite(rate)?rate:null};
  })};
}

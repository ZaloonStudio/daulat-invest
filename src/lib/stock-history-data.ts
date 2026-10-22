import type { ChartPoint } from './types';
import { normalizeChartPoints } from './chart-data';
export type PriceObservation = {time:number;value:number;volume?:number};
export function priceObservations(points: ChartPoint[]): PriceObservation[] {
  return normalizeChartPoints(points).flatMap(p => {
    const time = Number(p.time), value = p.close ?? p.value;
    return Number.isFinite(time) && typeof value === 'number' && Number.isFinite(value) && value > 0 ? [{time,value,volume:p.volume}] : [];
  });
}
export function periodPoints(points: PriceObservation[], period: string): PriceObservation[] {
  if (!points.length || period === 'ALL' || period === '1D') return points;
  const months: Record<string,number> = {'1M':1,'6M':6,'1Y':12,'3Y':36,'5Y':60};
  const cutoff = new Date(points[points.length-1].time*1000);
  if (period === '1W') cutoff.setUTCDate(cutoff.getUTCDate()-7);
  else cutoff.setUTCMonth(cutoff.getUTCMonth()-(months[period] ?? 1));
  return points.filter(p=>p.time>=cutoff.getTime()/1000);
}
export function comparePrices(stock: PriceObservation[], index: PriceObservation[]) {
  const date = (t:number) => new Date(t*1000+5*3600000).toISOString().slice(0,10);
  const benchmark = new Map(index.map(p=>[date(p.time),p.value]));
  const common = stock.flatMap(p => {const b=benchmark.get(date(p.time));return b ? [{...p,benchmark:b}] : [];});
  if (common.length<2) return {stock:[],index:[]};
  return {stock:common.map(p=>({time:p.time,value:p.value/common[0].value*100})),index:common.map(p=>({time:p.time,value:p.benchmark/common[0].benchmark*100}))};
}
export function simulateMonthlyPurchases(points: PriceObservation[], amount:number) {
  let shares=0,invested=0,lastMonth='';
  return points.map(p=>{
    const month=new Date(p.time*1000+5*3600000).toISOString().slice(0,7);
    if (month!==lastMonth) {shares+=amount/p.value;invested+=amount;lastMonth=month;}
    return {time:p.time,value:shares*p.value,invested};
  });
}

import type {ChartPoint} from './types';
import {priceObservations} from './stock-history-data';
export function sma(values:number[],period:number):number|null {return values.length<period?null:values.slice(-period).reduce((a,b)=>a+b,0)/period;}
export function emaSeries(values:number[],period:number):number[] {
 if(values.length<period)return [];
 let current=values.slice(0,period).reduce((a,b)=>a+b,0)/period;const result=[current],alpha=2/(period+1);
 for(const value of values.slice(period)){current=value*alpha+current*(1-alpha);result.push(current);}return result;
}
export function rsi(values:number[],period=14):number|null {
 if(values.length<=period)return null;
 let gain=0,loss=0;
 for(let i=1;i<=period;i++){const d=values[i]-values[i-1];gain+=Math.max(0,d)/period;loss+=Math.max(0,-d)/period;}
 for(let i=period+1;i<values.length;i++){const d=values[i]-values[i-1];gain=(gain*(period-1)+Math.max(0,d))/period;loss=(loss*(period-1)+Math.max(0,-d))/period;}
 return gain===0&&loss===0?50:loss===0?100:100-100/(1+gain/loss);
}
export function stockTechnicals(history:ChartPoint[]) {
 const points=priceObservations(history),values=points.map(p=>p.value),last=points[points.length-1];
 const fast=emaSeries(values,12),slow=emaSeries(values,26);
 const macd=slow.map((n,i)=>fast[i+14]-n),signal=emaSeries(macd,9);
 const latest=(a:number[])=>a.length?a[a.length-1]:null;
 const year=last?points.filter(p=>p.time>=last.time-365*86400):[];
 const volumes=points.slice(-20).map(p=>p.volume);
 const avgVolume=volumes.length===20&&volumes.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0)?volumes.reduce<number>((a,b)=>a+(b??0),0)/20:null;
 return {asOf:last?.time,close:last?.value??null,sma20:sma(values,20),sma50:sma(values,50),sma200:sma(values,200),ema20:latest(emaSeries(values,20)),ema50:latest(emaSeries(values,50)),rsi14:rsi(values),macd:latest(macd),signal:latest(signal),
  averageVolume20:avgVolume,relativeVolume20:avgVolume&&typeof last?.volume==='number'?last.volume/avgVolume:null,
  yearLow:year.length&&last.time-points[0].time>=350*86400?Math.min(...year.map(p=>p.value)):null,yearHigh:year.length&&last.time-points[0].time>=350*86400?Math.max(...year.map(p=>p.value)):null};
}

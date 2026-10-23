 'use client';
import {useState,useMemo,useEffect,useRef} from 'react';
import {createChart,LineSeries,ColorType,type ISeriesApi,type SeriesType} from 'lightweight-charts';
import {attachChartTooltip} from '@/lib/chart-tooltip';
import {tooltipAxisTime,tooltipDate,tooltipNumber} from '@/lib/chart-tooltip-data';
import type {ChartPoint} from '@/lib/types';
import {priceObservations,periodPoints,comparePrices,simulateMonthlyPurchases} from '@/lib/stock-history-data';
export type ChartMode='price'|'comparison'|'mktcap'|'sip'|'tradingview';
export type TimeframeMode='1D'|'1W'|'1M'|'6M'|'1Y'|'3Y'|'5Y'|'ALL';
export default function StockHistoryChart({symbol,history,kseHistory=[],currentPrice,marketCap}: {symbol:string;history:ChartPoint[];kseHistory?:ChartPoint[];currentPrice:number;change:number;marketCap?:number}) {
 const [mode,setMode]=useState<ChartMode>('price'),[period,setPeriod]=useState<TimeframeMode>('1M'),[monthly,setMonthly]=useState(10000);
 const [intraday,setIntraday]=useState<ChartPoint[]>([]),[loading,setLoading]=useState(false);const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(period!=='1D')return;const c=new AbortController();setIntraday([]);setLoading(true);fetch('/api/kse100-chart?symbol='+encodeURIComponent(symbol)+'&timeframe=1D',{signal:c.signal}).then(r=>r.json()).then(d=>setIntraday(Array.isArray(d)?d:[])).catch(()=>{}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();},[symbol,period]);
 const points=useMemo(()=>periodPoints(priceObservations(period==='1D'?intraday:history),period),[period,intraday,history]);
 const compared=useMemo(()=>comparePrices(points,priceObservations(kseHistory)),[points,kseHistory]);
 const purchases=useMemo(()=>simulateMonthlyPurchases(points,monthly),[points,monthly]);const canCompare=period!=='1D'&&compared.index.length>1;
 useEffect(()=>{
  if(!ref.current||mode==='tradingview')return;
  const chart=createChart(ref.current,{autoSize:true,height:340,layout:{background:{type:ColorType.Solid,color:'transparent'},textColor:getComputedStyle(document.documentElement).getPropertyValue('--chart-label').trim()||'#A4AEC1'},grid:{vertLines:{color:'rgba(127,141,164,.12)'},horzLines:{color:'rgba(127,141,164,.12)'}},localization:{timeFormatter:(time:import('lightweight-charts').Time)=>tooltipDate(time,period==='1D')},timeScale:{timeVisible:period==='1D',tickMarkFormatter:(time:import('lightweight-charts').Time)=>tooltipAxisTime(time,period==='1D')}});
  const entries:{series:ISeriesApi<SeriesType>;label:string;format:(n:number)=>string}[]=[];
  const format=(n:number)=>tooltipNumber(n,mode==='comparison'?'index':mode==='mktcap'?'billions':'price');
  const add=(data:{time:number;value:number}[],color:string,title:string)=>{const series=chart.addSeries(LineSeries,{color,lineWidth:2,title});series.setData(data as any);entries.push({series,label:mode==='price'?'Price':mode==='comparison'?title+' · base 100':title,format});return series;};
  if(mode==='comparison'&&canCompare){add(compared.stock,'#B69249',symbol);add(compared.index,'#789FE0','KSE100');}
  else if(mode==='sip'){add(purchases,'#B69249','Simulated value');add(purchases.map(p=>({time:p.time,value:p.invested})),'#789FE0','Contributions');}
  else if(mode==='mktcap'&&marketCap&&currentPrice>0){add(points.map(p=>({time:p.time,value:p.value/currentPrice*marketCap/1e9})),'#B69249','Estimated cap (PKR B)');}
  else if(mode==='price')add(points,'#B69249','PKR');
  chart.timeScale().fitContent();
  const byTime=new Map(points.map(p=>[p.time,p]));
  const cleanup=attachChartTooltip(chart,ref.current,entries,period==='1D',mode==='price'?time=>[{label:'Volume',value:tooltipNumber(byTime.get(Number(time))?.volume,'volume')}]:undefined);
  return()=>{cleanup();chart.remove();};
 },[points,compared,purchases,mode,period,canCompare,marketCap,currentPrice,symbol]);
 const empty=mode==='comparison'?!canCompare:mode==='mktcap'?!marketCap:points.length===0;const last=purchases[purchases.length-1];
 return <section className="rounded-xl border border-[#28354A] bg-[#111A2B] p-5 space-y-4">
  <div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold">{symbol} chart</h2><div className="flex flex-wrap gap-2">{([['price','Price'],['comparison','vs KSE100'],['mktcap','Market cap'],['sip','SIP'],['tradingview','TradingView']] as const).map(([key,label])=><button key={key} onClick={()=>setMode(key)} className={'text-xs px-3 py-2 rounded-lg '+(mode===key?'bg-[#B69249] text-black':'bg-[#0B1120] text-[#A4AEC1]')}>{label}</button>)}</div></div>
  <div className="flex flex-wrap gap-2">{(['1D','1W','1M','6M','1Y','3Y','5Y','ALL'] as TimeframeMode[]).map(t=><button key={t} onClick={()=>{setPeriod(t);}} className={'text-xs px-3 py-1.5 rounded '+(period===t?'text-[#B69249] bg-[#B69249]/10':'text-[#A4AEC1]')}>{t==='ALL'?'All':t}</button>)}</div>
  {mode==='tradingview'?<a href={'https://www.tradingview.com/chart/?symbol=PSX%3A'+encodeURIComponent(symbol)} target="_blank" rel="noopener noreferrer" className="inline-block text-[#B69249] py-12">Open {symbol} on TradingView ↗</a>:<>
   {mode==='sip'&&<label className="block text-xs text-[#A4AEC1]">Monthly investment (PKR) <input type="number" min="1" value={monthly} onChange={e=>setMonthly(Math.max(1,Number(e.target.value)||1))} className="ml-2 p-2 rounded bg-[#0B1120] border border-[#28354A]"/></label>}
   {empty&&<p role="status" className="text-sm text-[#A4AEC1]">{loading&&period==='1D'?'Loading PSX chart…':mode==='comparison'?'Comparable dated observations unavailable for this period.':mode==='mktcap'?'Reported share count unavailable.':'Chart data unavailable for this period.'}</p>}
   <div ref={ref} className="relative h-[340px]"/>
   {mode==='sip'&&last&&<p className="text-sm">Contributed: Rs {last.invested.toLocaleString()} · Simulated value: Rs {last.value.toLocaleString('en-US',{maximumFractionDigits:0})}</p>}
   <p className="text-xs text-[#A4AEC1]">{mode==='comparison'?'Matched trading dates; both series start at 100. Price return only.':mode==='mktcap'?'Estimate using current reported share count; historical share changes excluded.':mode==='sip'?'Simulation: buy at the first available close each month; fractional shares allowed. Dividends, costs and taxes excluded.':'PSX source prices; historical corporate-action adjustments are not verified.'} {points.length>0&&new Date(points[0].time*1000).toLocaleDateString('en-GB',{timeZone:'Asia/Karachi'})+' – '+new Date(points[points.length-1].time*1000).toLocaleDateString('en-GB',{timeZone:'Asia/Karachi'})}</p>
  </>}
 </section>;
}

'use client';

import {attachChartTooltip} from '@/lib/chart-tooltip';
import {tooltipDate} from '@/lib/chart-tooltip-data';
import { useEffect, useRef, useState } from 'react';
import { AreaSeries, ColorType, createChart, LineType, type UTCTimestamp } from 'lightweight-charts';
import { formatAsOf, formatPrice, type PricePoint } from '@/lib/commodity-data';

export default function PriceHistoryChart({points,currency,intraday,stepped,label}:{points:PricePoint[];currency:string;intraday:boolean;stepped:boolean;label:string}) {
  const container = useRef<HTMLDivElement>(null);
  const [selected,setSelected] = useState<PricePoint|null>(null);
  const [ready,setReady] = useState(false);
  const last = points[points.length-1];
  const current = selected ?? last;
  const first = points[0];
  const change = first && last ? last.value-first.value : 0;
  const pct = first?.value ? change/first.value*100 : 0;
  useEffect(()=>{
    if (!container.current || points.length<2) return;
    setSelected(null);
    setReady(false);
    const chart = createChart(container.current,{
      height:360,width:container.current.clientWidth,
      layout:{background:{type:ColorType.Solid,color:'transparent'},textColor:'#7F8DA4',fontSize:11},
      grid:{vertLines:{visible:false},horzLines:{color:'rgba(127,141,164,0.14)'}},
      rightPriceScale:{borderVisible:false,scaleMargins:{top:.12,bottom:.12}},
      timeScale:{borderVisible:false,timeVisible:intraday,secondsVisible:false},
      crosshair:{vertLine:{color:'#B69249',labelBackgroundColor:'#886521'},horzLine:{color:'#B69249',labelBackgroundColor:'#886521'}},
      handleScroll:{mouseWheel:false,pressedMouseMove:true,horzTouchDrag:true,vertTouchDrag:false},
      handleScale:{mouseWheel:true,pinch:true,axisPressedMouseMove:true},
      localization:{timeFormatter:(time:import('lightweight-charts').Time)=>tooltipDate(time,intraday),priceFormatter:(price:number)=>formatPrice(price,currency)},
    });
    const series = chart.addSeries(AreaSeries,{lineColor:'#B69249',topColor:'rgba(182,146,73,.22)',bottomColor:'rgba(182,146,73,.01)',lineWidth:2,lineType:stepped?LineType.WithSteps:LineType.Simple,priceLineVisible:false,lastValueVisible:true});
    series.setData(points.map(p=>({time:p.time as UTCTimestamp,value:p.value})));
    chart.timeScale().fitContent();
    chart.subscribeCrosshairMove(param=>{
      const p = param.seriesData.get(series);
      setSelected(p && 'value' in p && typeof param.time==='number' ? {time:param.time,value:p.value} : null);
    });
    const cleanupTooltip=attachChartTooltip(chart,container.current,[{series,label:'Price',format:n=>formatPrice(n,currency)}],intraday);
    const resize = new ResizeObserver(()=>{if(container.current)chart.applyOptions({width:container.current.clientWidth});});
    resize.observe(container.current);
    const recolor = ()=>chart.applyOptions({layout:{textColor:getComputedStyle(document.documentElement).getPropertyValue('--chart-label').trim()||'#7F8DA4'}});
    recolor();
    const theme = new MutationObserver(recolor);
    theme.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    setReady(true);
    return ()=>{cleanupTooltip();resize.disconnect();theme.disconnect();chart.remove();};
  },[points,currency,intraday,stepped]);
  const low = points.length?Math.min(...points.map(p=>p.value)):0;
  const high = points.length?Math.max(...points.map(p=>p.value)):0;
  const spread = high-low||1;
  const line = points.map((p,i)=>`${i?'L':'M'}${(20+(p.time-(first?.time??0))/Math.max(1,(last?.time??1)-(first?.time??0))*860).toFixed(2)},${(220-(p.value-low)/spread*190).toFixed(2)}`).join(' ');
  return <>
    <div className="flex flex-wrap justify-between items-end gap-3 mt-4 mb-2">
      <div><p className="text-2xl sm:text-3xl text-[#B69249] font-mono font-semibold">{formatPrice(current?.value??null,currency)}</p><p className="text-[11px] text-[#A4AEC1] mt-1">{current?formatAsOf(new Date(current.time*1000).toISOString()):'No observations'}</p></div>
      <p className={`font-mono text-sm ${change>=0?'text-[#6DDBA5]':'text-[#F28B82]'}`}>{change>=0?'+':''}{pct.toFixed(2)}% <span className="text-[#A4AEC1] text-[10px]">period</span></p>
    </div>
    {points.length>=2 ? <div className="relative h-[360px]" role="img" aria-label={label}>
      {!ready && <svg viewBox="0 0 920 260" className="absolute inset-0 w-full h-full" aria-hidden="true"><path d={line} fill="none" stroke="#B69249" strokeWidth="2"/></svg>}
      <div ref={container} className="absolute inset-0"/>
    </div> : <p role="status" className="h-64 flex items-center justify-center text-sm text-[#A4AEC1]">Not enough observations for this period. Select a longer range.</p>}
    <div className="flex flex-wrap justify-between gap-2 text-[10px] text-[#A4AEC1] border-t border-[#28354A] pt-3 mt-2"><span>{first&&new Date(first.time*1000).toLocaleDateString('en-GB',{timeZone:'Asia/Karachi',day:'numeric',month:'short',year:'numeric'})} — {last&&new Date(last.time*1000).toLocaleDateString('en-GB',{timeZone:'Asia/Karachi',day:'numeric',month:'short',year:'numeric'})}</span><span>Low {formatPrice(low,currency)} · High {formatPrice(high,currency)}</span></div>
  </>;
}

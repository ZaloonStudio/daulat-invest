import type {IChartApi,ISeriesApi,SeriesType,MouseEventParams,Time} from 'lightweight-charts';
import {tooltipDate,tooltipPosition,type TooltipRow} from './chart-tooltip-data';
type Entry={series:ISeriesApi<SeriesType>;label:string;format:(value:number)=>string};
// A separate HTML overlay keeps pointer updates out of React's render loop.
export function attachChartTooltip(chart:IChartApi,container:HTMLElement,entries:Entry[],intraday:boolean,extra?:(time:Time)=>TooltipRow[]) {
 const tip=document.createElement('div');tip.className='chart-detail-tooltip';tip.setAttribute('role','tooltip');tip.style.display='none';container.appendChild(tip);
 const hide=()=>{tip.style.display='none';};
 const show=(param:MouseEventParams)=>{
  const point=param.point;
  if(param.time===undefined||!point||point.x<0||point.y<0||point.x>container.clientWidth||point.y>container.clientHeight){hide();return;}
  const rows=entries.flatMap(e=>{const data=param.seriesData.get(e.series);const value=data&&('value' in data?data.value:'close' in data?data.close:undefined);return typeof value==='number'&&Number.isFinite(value)?[{label:e.label,value:e.format(value)}]:[];});
  if(!rows.length){hide();return;}
  const date=tooltipDate(param.time,intraday);if(!date){hide();return;}
  tip.replaceChildren();
  const heading=document.createElement('div');heading.className='chart-detail-tooltip-date';heading.textContent=date;tip.appendChild(heading);
  for(const row of [...rows,...(extra?.(param.time)??[])]){
   const line=document.createElement('div');line.className='chart-detail-tooltip-row';
   const label=document.createElement('span'),value=document.createElement('strong');label.textContent=row.label;value.textContent=row.value;line.append(label,value);tip.appendChild(line);
  }
  tip.style.display='block';
  const position=tooltipPosition(point.x,point.y,container.clientWidth,container.clientHeight,tip.offsetWidth,tip.offsetHeight);
  tip.style.left=position.left+'px';tip.style.top=position.top+'px';
 };
 const outside=(e:PointerEvent)=>{if(e.target instanceof Node&&!container.contains(e.target))hide();};
 chart.subscribeCrosshairMove(show);chart.subscribeClick(show);
 container.addEventListener('pointerleave',hide);document.addEventListener('pointerdown',outside,{passive:true});
 return ()=>{chart.unsubscribeCrosshairMove(show);chart.unsubscribeClick(show);container.removeEventListener('pointerleave',hide);document.removeEventListener('pointerdown',outside);tip.remove();};
}

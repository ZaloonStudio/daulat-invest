import type {Time} from 'lightweight-charts';
export type TooltipRow={label:string;value:string};
export function tooltipAxisTime(time:Time,intraday:boolean):string|null {
 return intraday&&typeof time==='number'?new Date(time*1000).toLocaleTimeString('en-GB',{timeZone:'Asia/Karachi',hour:'2-digit',minute:'2-digit'}):null;
}
export function tooltipDate(time:Time,intraday:boolean):string {
 const date=typeof time==='number'?new Date(time*1000):typeof time==='string'?new Date(time+'T00:00:00Z'):new Date(Date.UTC(time.year,time.month-1,time.day));
 if(!Number.isFinite(date.getTime()))return '';
 return date.toLocaleString('en-GB',{timeZone:'Asia/Karachi',day:'2-digit',month:'short',year:'numeric',...(intraday?{hour:'2-digit',minute:'2-digit'}:{})})+(intraday?' PKT':'');
}
export function tooltipNumber(value:number|null|undefined,unit:'price'|'volume'|'index'|'billions'='price'):string {
 if(typeof value!=='number'||!Number.isFinite(value))return '—';
 return (unit==='price'||unit==='billions'?'Rs ':'')+value.toLocaleString('en-US',{minimumFractionDigits:unit==='volume'?0:2,maximumFractionDigits:unit==='volume'?0:2})+(unit==='billions'?'B':'');
}
export function tooltipPosition(x:number,y:number,width:number,height:number,tipWidth:number,tipHeight:number) {
 const left=x+16+tipWidth>width-8?x-tipWidth-16:x+16;
 const top=y+16+tipHeight>height-8?y-tipHeight-16:y+16;
 return {left:Math.max(8,Math.min(left,Math.max(8,width-tipWidth-8))),top:Math.max(8,Math.min(top,Math.max(8,height-tipHeight-8)))};
}

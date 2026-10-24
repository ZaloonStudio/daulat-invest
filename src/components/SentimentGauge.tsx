import {useId} from 'react';
const bands=[{from:0,to:24.5,color:'#F28B82'},{from:24.5,to:44.5,color:'#E7AD66'},{from:44.5,to:55.5,color:'#9AA6B8'},{from:55.5,to:75.5,color:'#6DDBA5'},{from:75.5,to:100,color:'#26AD84'}];
const point=(value:number,radius:number)=>{const radians=Math.PI-value/100*Math.PI;return {x:180+radius*Math.cos(radians),y:180-radius*Math.sin(radians)};};
export default function SentimentGauge({score,sentiment}:{score:number;sentiment:string}){
 const id=useId(),value=Math.max(0,Math.min(100,Number.isFinite(score)?score:50));
 const tip=point(value,112),dx=(tip.x-180)/112,dy=(tip.y-180)/112;
 return <svg viewBox="0 0 360 218" role="img" aria-labelledby={id} className="sentiment-gauge w-full max-w-[460px] mx-auto block">
  <title id={id}>{sentiment}: {value} out of 100</title>
  {bands.map(band=>{const a=point(band.from+.7,140),b=point(band.to-.7,140);return <path key={band.from} d={`M ${a.x} ${a.y} A 140 140 0 0 1 ${b.x} ${b.y}`} fill="none" stroke={band.color} strokeWidth="25"/>;})}
  {[0,25,50,75,100].map(tick=>{const p=point(tick,102);return <text key={tick} x={p.x} y={p.y+5} textAnchor="middle" className="gauge-label" fontSize="12">{tick}</text>;})}
  <path d={`M ${180-dy*4} ${180+dx*4} L ${tip.x} ${tip.y} L ${180+dy*4} ${180-dx*4} Z`} className="gauge-needle"/>
  <circle cx="180" cy="180" r="12" className="gauge-hub" strokeWidth="2"/>
  <circle cx="180" cy="180" r="5" fill="#B69249"/>
 </svg>;
}

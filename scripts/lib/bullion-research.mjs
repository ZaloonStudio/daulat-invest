export function visibleText(html){return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&#x27;|&#39;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();}
export function parseSarafa(html,metal){
 const text=visibleText(html),date=text.match(/\((\d{1,2} [A-Za-z]+ 20\d{2})\)/)?.[1]??null;
 const section=metal==='gold'?text.slice(text.indexOf("Today's Gold Rates")):text.slice(text.indexOf("Today's Silver Rates"));
 const raw=section.match(metal==='gold'?/24K Gold Rs\.\s*([\d,]+)\s+Rs\.\s*([\d,]+)\s+Rs\.\s*([\d,.]+)/:/Silver \(Chandi\) Rs\.\s*([\d,]+)\s+Rs\.\s*([\d,]+)\s+Rs\.\s*([\d,.]+)/);
 return {metal,perTola:raw?Number(raw[1].replaceAll(',','')):null,date,displayedClock:section.match(/Updated\s*:\s*(\d{1,2}:\d{2}\s*[ap]m)/i)?.[1]??null,asOf:null,timeZone:null};
}
export function compareSample(local,global,now=Date.now()){
 const time=local.asOf?Date.parse(local.asOf):NaN,benchmark=global.asOf?Date.parse(global.asOf):NaN;
 const aligned=Number.isFinite(time)&&Number.isFinite(benchmark)&&Math.abs(time-benchmark)<=60000&&Math.abs(now-time)<=300000;
 const valid=[local.perTola,global.perTola].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0);
 return {aligned,reason:!local.asOf?'Local source does not publish a timezone-qualified observation timestamp':!aligned?'Observation timestamps are not within 60 seconds':null,observedDifference:valid?local.perTola-global.perTola:null,observedPercent:valid?(local.perTola/global.perTola-1)*100:null,impliedFx:valid&&global.usdOz>0?local.perTola/(global.usdOz*0.375):null};
}
export function fitAdjustments(samples){
 const rows=samples.filter(s=>s.comparison.aligned&&s.global.perTola>0&&s.local.perTola>0).sort((a,b)=>Date.parse(a.local.asOf)-Date.parse(b.local.asOf));
 const days=new Set(rows.map(s=>s.local.asOf.slice(0,10)));
 if(rows.length<20||days.size<5)return {status:'insufficient-aligned-observations',alignedCount:rows.length,days:days.size,models:null};
 const split=Math.floor(rows.length*0.7),train=rows.slice(0,split),holdout=rows.slice(split);
 const mean=a=>a.reduce((s,n)=>s+n,0)/a.length,offset=mean(train.map(r=>r.local.perTola-r.global.perTola)),factor=mean(train.map(r=>r.local.perTola/r.global.perTola));
 const rmse=fn=>Math.sqrt(mean(holdout.map(r=>(fn(r.global.perTola)-r.local.perTola)**2)));
 return {status:'research-only',alignedCount:rows.length,days:days.size,models:{fixedRupees:{offset,holdoutRmse:rmse(x=>x+offset)},percentage:{factor,holdoutRmse:rmse(x=>x*factor)}}};
}

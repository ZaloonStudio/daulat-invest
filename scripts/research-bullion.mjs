import fs from 'node:fs/promises';
import {parseSarafa,compareSample,fitAdjustments} from './lib/bullion-research.mjs';
const args=process.argv.slice(2),arg=(k,f)=>{const i=args.indexOf(k);return i<0?f:args[i+1];};
const count=Number(arg('--samples','1')),interval=Number(arg('--interval-seconds','60'));
if(!Number.isInteger(count)||count<1||count>24||!Number.isFinite(interval)||interval<60)throw new Error('Use 1–24 samples and an interval of at least 60 seconds.');
const folder='research/bullion',file=folder+'/observations.jsonl';await fs.mkdir(folder,{recursive:true});
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'DaulatInvest public-rate research'}});if(!r.ok)throw new Error('HTTP '+r.status);return r.text();}
for(let i=0;i<count;i++){
 const takenAt=new Date().toISOString(),out=await Promise.allSettled([get('https://xaus.com/api/v1/spot?currency=PKR&unit=gram&compact=1'),get('https://www.sarafa.pk/en/gold-rate/karachi'),get('https://www.sarafa.pk/en/silver-rate/karachi')]);
 const spot=out[0].status==='fulfilled'?JSON.parse(out[0].value):null;
 for(const [metal,index]of [['gold',1],['silver',2]]){
  if(out[index].status!=='fulfilled'||!spot){console.log(JSON.stringify({takenAt,metal,status:'source-unavailable'}));continue;}
  const local=parseSarafa(out[index].value,metal),fx=spot.fx_stale===false?Number(spot.fx_rate):NaN,usdOz=Number(metal==='gold'?spot.spot_usd_oz:spot.silver_usd_oz),global={perTola:usdOz*fx*0.375,usdOz,fx,asOf:metal==='gold'?spot.price_as_of:spot.updated_at};
  const observation={takenAt,metal,local,global,comparison:compareSample(local,global),sourceUrl:'https://www.sarafa.pk/en/'+(metal==='gold'?'gold':'silver')+'-rate/karachi'};
  await fs.appendFile(file,JSON.stringify(observation)+'\n');console.log(JSON.stringify(observation));
 }
 if(i<count-1)await new Promise(resolve=>setTimeout(resolve,interval*1000));
}
const all=(await fs.readFile(file,'utf8')).trim().split('\n').map(s=>JSON.parse(s));
const report={createdAt:new Date().toISOString(),observations:all.length,gold:fitAdjustments(all.filter(s=>s.metal==='gold')),silver:fitAdjustments(all.filter(s=>s.metal==='silver'))};
await fs.writeFile(folder+'/summary.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));

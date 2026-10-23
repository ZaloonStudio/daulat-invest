import {RESEARCH_METRICS,parseResearchRows,researchRequest,SCREENER_RESEARCH_SOURCE,type ScreenerResearch,type ScreenerResearchRow} from './screener-research-data';
export async function fetchScreenerResearch():Promise<ScreenerResearch> {
 // Expected figures have less coverage. Fetch separately so they cannot exclude other companies' ratios.
 const groups=[RESEARCH_METRICS.filter(m=>m.key!=='expectedPe'&&m.key!=='expectedGrowth'),RESEARCH_METRICS.filter(m=>m.key==='expectedPe'),RESEARCH_METRICS.filter(m=>m.key==='expectedGrowth')];
 const results=await Promise.all(groups.map(async metrics=>{
  try{
   const r=await fetch(SCREENER_RESEARCH_SOURCE+'/com',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8','User-Agent':'Mozilla/5.0'},body:JSON.stringify(researchRequest(metrics)),next:{revalidate:3600},signal:AbortSignal.timeout(12000)});
   if(!r.ok)return null;const rows=parseResearchRows(await r.json(),metrics);return rows.length?rows:null;
  }catch{return null;}
 }));
 const merged=new Map<string,ScreenerResearchRow>();
 for(const group of results)for(const row of group??[]){const previous=merged.get(row.symbol);if(!previous)merged.set(row.symbol,row);else if(previous.basis===row.basis)previous.values={...previous.values,...row.values};}
 return {rows:[...merged.values()],retrievedAt:new Date().toISOString(),complete:results.every(r=>r!==null),unavailable:groups.flatMap((g,i)=>results[i]===null?g.map(m=>m.key):[]),source:SCREENER_RESEARCH_SOURCE};
}

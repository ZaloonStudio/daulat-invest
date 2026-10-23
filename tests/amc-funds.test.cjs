const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(name){const f=path.resolve(__dirname,'../src/lib/'+name+'.ts'),m=new Module(f,module);m.paths=module.paths;m.require=id=>id==='react'?{cache:fn=>fn}:id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);return m.exports;}
const {parseHblFunds,parseNbpFunds}=load('amc-funds'),{applyFundReport,fundValuationDate}=load('fund-data'),{PAKISTAN_MUTUAL_FUNDS:catalog}=load('mutualFundsData');
const fixture=n=>fs.readFileSync(path.join(__dirname,'fixtures',n),'utf8'),now=Date.parse('2026-10-23T09:00:00Z');
test('HBL retains dated four-decimal NAV without turning month-end performance into current returns',()=>{
 const raw=JSON.parse(fixture('hbl-nav.json')),rows=parseHblFunds(raw,now),cash=rows.find(r=>r.name==='HBL Cash Fund');assert.equal(cash.nav,107.0762);assert.equal(cash.date,'Oct 23, 2026');assert.equal(cash.month,null);assert.equal(cash.ytd,null);assert.equal(cash.year,null);assert.equal(cash.returnBasis,'Unspecified');
 assert.deepEqual(parseHblFunds({data:raw},now),[]);assert.deepEqual(parseHblFunds(raw.map(r=>({...r,nav_nav:'0'})),now),[]);assert.deepEqual(parseHblFunds(raw.map(r=>({...r,nav_updated_date:'Oct 24, 2026'})),now),[]);
});
test('NBP uses documented NAV/redemption column, never the higher offer price',()=>{
 const rows=parseNbpFunds(fixture('nbp-nav.html'),now),cash=rows.find(r=>r.name==='NBP ISLAMIC MONEY MARKET FUND');assert.equal(rows.length,4);assert.equal(cash.nav,10.5485);assert.equal(cash.navKind,'NAV / redemption');assert.equal(cash.date,'Oct 23, 2026');assert.equal(cash.year,null);
 assert.deepEqual(parseNbpFunds(fixture('nbp-nav.html').replace('Redemption Price','Wrong Column'),now),[]);
});
test('official fallback matches seven exact catalog funds and exposes per-fund provenance',()=>{
 const observations=[...parseHblFunds(JSON.parse(fixture('hbl-nav.json')),now),...parseNbpFunds(fixture('nbp-nav.html'),now)];
 const funds=applyFundReport(catalog,observations),matched=funds.filter(f=>f.nav!==null);assert.equal(matched.length,7);assert.ok(matched.every(f=>f.navSource&&f.navSourceName&&f.return1Y===null));assert.equal(funds.find(f=>f.name==='Meezan Cash Fund').nav,null);
 assert.equal(applyFundReport(catalog,observations.map(o=>({...o,name:o.name+' Plan II'}))).filter(f=>f.nav!==null).length,0);
 assert.equal(applyFundReport(catalog,observations.map(o=>({...o,provider:'HBL'}))).filter(f=>f.nav!==null).length,3);
 const cash=observations.find(o=>o.name==='HBL Cash Fund');assert.equal(applyFundReport(catalog,[cash,{...cash,nav:9,sourceName:'MUFAP'}]).find(f=>f.name===cash.name).nav,null);
 const newest=applyFundReport(catalog,[cash,{...cash,date:'Oct 22, 2026',nav:1,sourceName:'MUFAP'}]).find(f=>f.name===cash.name);assert.equal(newest.nav,cash.nav);assert.equal(newest.return1Y,null);
});
test('valuation dates reject ambiguous, invalid and future dates without rolling into another month',()=>{
 for(const s of ['23/10/2026','Feb 30, 2026','Oct 24, 2026','Bad 1, 2026'])assert.equal(fundValuationDate(s,now),null);assert.equal(fundValuationDate('Oct 23 2026',now),'Oct 23, 2026');
});
test('MUFAP outage still allows independent official sources; total outages never resurrect catalog demo numbers',async()=>{
 const original=global.fetch;try{global.fetch=async url=>String(url).includes('hblasset')?new Response(fixture('hbl-nav.json')):String(url).includes('nbpfunds')?new Response(fixture('nbp-nav.html')):new Response('Blocked',{status:403});const snapshot=await load('fund-feed').getFundSnapshot();assert.equal(snapshot.available,true);assert.equal(snapshot.count,7);assert.equal(snapshot.partial,true);
 global.fetch=async()=>new Response('Unavailable',{status:503});const failed=await load('fund-feed').getFundSnapshot();assert.equal(failed.available,false);assert.ok(failed.funds.every(f=>f.nav===null&&f.return1Y===null));
 }finally{global.fetch=original;}
});

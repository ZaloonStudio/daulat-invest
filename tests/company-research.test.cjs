const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(name){const file=path.resolve(__dirname,'../src/lib/'+name+'.ts'),m=new Module(file,module);m.filename=file;m.paths=module.paths;m.require=id=>id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
const {parseCompanyResearch,reportedNumber}=load('company-research'),technical=load('stock-technicals');
const fixture=n=>fs.readFileSync(path.join(__dirname,'fixtures',n),'utf8');
test('PSX company parser keeps reported losses, fiscal periods and original statement units',()=>{
 const p=parseCompanyResearch(fixture('company-PRL.html'),fixture('payouts-PRL.html'),'PRL');
 assert.deepEqual(p.annual.periods,['2026','2025','2024','2023']);assert.equal(p.annual.rows.find(r=>r.label==='EPS').values[0],25.05);assert.equal(p.annual.rows.find(r=>r.label==='EPS').values[1],-7.4);assert.equal(p.annual.rows.find(r=>r.label==='Sales').values[0],350838916);
 assert.equal(p.quarterly.periods[0],'Q1 2027');assert.equal(p.quarterly.rows.find(r=>r.label==='EPS').values[0],22.17);assert.equal(p.ratios.rows.find(r=>r.label==='Net Profit Margin (%)').values[1],-1.5);
 assert.equal(p.payouts.length,0);assert.equal(p.payoutsAvailable,true);assert.equal(p.reports.length,5);assert.ok(p.reports.every(r=>/^https:\/\/dps.psx.com.pk\/download\//.test(r.url)));
});
test('official profile supplies real management, contacts and equity without inferring share counts',()=>{
 const p=parseCompanyResearch(fixture('company-PRL.html'),'','PRL');assert.equal(p.shares,630000000);assert.equal(p.freeFloat,252000000);assert.equal(p.people.find(n=>n.role==='Chairperson').name,'Aftab Hussain');assert.equal(p.contacts.find(c=>c.label==='ADDRESS').value,'Korangi Creek Road, Karachi.');assert.match(p.description,/subsidiary of Pakistan State Oil/);
 const unsafe=parseCompanyResearch(fixture('company-PRL.html').replace('http://www.prl.com.pk','javascript:alert(1)'),'','PRL');assert.equal(unsafe.contacts.find(c=>c.label==='WEBSITE').url,undefined);
});
test('bank financial rows remain bank-specific and cash payouts are not confused with yield',()=>{
 const p=parseCompanyResearch(fixture('company-MEBL.html'),fixture('payouts-MEBL.html'),'MEBL');assert.ok(p.annual.rows.some(r=>r.label==='Mark-up Earned'));assert.equal(p.annual.rows.find(r=>r.label==='EPS').values[0],49.54);assert.equal(p.payouts.length,8);assert.equal(p.payouts[0].period,'30/09/2026(IIIQ)');assert.equal(p.payouts[0].details,'80%(iii) (D)');
});
test('missing research is unavailable, not an empty dividend record or a fabricated annual result',()=>{
 const p=parseCompanyResearch('<html>Unavailable</html>','Access denied','PRL');assert.equal(p.payoutsAvailable,false);assert.deepEqual(p.annual.rows,[]);assert.equal(p.shares,null);assert.deepEqual(p.people,[]);
 for(const s of ['N/A','-','','1,23x','NaN'])assert.equal(reportedNumber(s),null);assert.equal(reportedNumber('(1,234.50)'),-1234.5);
});
test('Wilder RSI handles rising, falling, flat and insufficient histories',()=>{
 assert.equal(technical.rsi(Array.from({length:20},(_,i)=>i+1)),100);assert.equal(technical.rsi(Array.from({length:20},(_,i)=>20-i)),0);assert.equal(technical.rsi(Array(20).fill(10)),50);assert.equal(technical.rsi(Array(14).fill(10)),null);
});
test('moving averages and MACD use correctly aligned windows, preserving real zero readings',()=>{
 const points=Array.from({length:220},(_,i)=>({time:1700000000+i*86400,value:i+1,volume:100}));const t=technical.stockTechnicals(points);assert.equal(t.sma20,210.5);assert.equal(t.sma200,120.5);assert.ok(Math.abs(t.macd-7)<1e-8);assert.ok(Math.abs(t.signal-7)<1e-8);assert.equal(t.relativeVolume20,1);assert.equal(t.yearLow,null);
 const flat=technical.stockTechnicals(points.map(p=>({...p,value:50})));assert.equal(flat.macd,0);assert.equal(flat.signal,0);assert.equal(flat.rsi14,50);
 const sparse=technical.stockTechnicals([{time:1700000000,value:50}]);assert.equal(sparse.macd,null);assert.equal(sparse.sma20,null);assert.equal(sparse.relativeVolume20,null);
});

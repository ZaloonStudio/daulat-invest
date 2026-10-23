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

const {parseSupplementalFundamentals}=load('supplemental-fundamentals');
test('supplemental ratios preserve source periods, units and unavailable values',()=>{
 const p=parseSupplementalFundamentals(fixture('supplemental-PRL.html'),'PRL','2026-10-23T00:00:00Z');
 const metrics=p.groups.flatMap(g=>g.metrics),m=id=>metrics.find(m=>m.id===id);
 assert.equal(m('bv').value,90.06);assert.equal(m('bv').period,'2027 Q1');assert.equal(m('pbv').value,1.06);assert.equal(m('ev').value,53.65);assert.equal(m('ev').unit,'B PKR');
 assert.equal(m('roe').value,36.89);assert.equal(m('roe').period,'2026 Q4');assert.equal(m('qr').value,0.8);assert.equal(m('at').value,2.6833);assert.equal(m('it').value,10.96);assert.equal(m('lde').period,null);
 const missing=parseSupplementalFundamentals('Access denied','PRL','').groups.flatMap(g=>g.metrics);assert.ok(missing.every(m=>m.value===null&&m.period===null));
 const wrong=parseSupplementalFundamentals(fixture('supplemental-PRL.html'),'MEBL','').groups.flatMap(g=>g.metrics);assert.ok(wrong.every(m=>m.value===null));
 const changed=fixture('supplemental-PRL.html').replace('Rs. 90.06','Rs. N/A').replace('36.89 %','0.00 %').replace('17.53 %','(17.53) %');
 const edge=parseSupplementalFundamentals(changed,'PRL','').groups.flatMap(g=>g.metrics);assert.equal(edge.find(m=>m.id==='bv').value,null);assert.equal(edge.find(m=>m.id==='roe').value,0);assert.equal(edge.find(m=>m.id==='lde').value,-17.53);
});

test('source account basis and price remain distinct from PSX unconsolidated statements',()=>{
 const p=parseSupplementalFundamentals(fixture('supplemental-LUCK.html'),'LUCK','');assert.equal(p.basis,'Consolidated');assert.ok(p.snapshotPrice>0);
 const unknown=parseSupplementalFundamentals(fixture('supplemental-PRL.html'),'PRL','');assert.equal(unknown.basis,'Basis not specified');
 const unconsolidated=parseSupplementalFundamentals(fixture('supplemental-LUCK.html').replace('Ltd. Consolidated','Ltd. Unconsolidated'),'LUCK','');assert.equal(unconsolidated.basis,'Unconsolidated');
});
test('source unit changes cannot multiply asset turnover or enterprise value incorrectly',()=>{
 const raw=fixture('supplemental-PRL.html');
 const revised=raw.replace('268.33 %','2.6833 x').replace('Rs. 53.65 bn','Rs. 53,650 mn');
 const metrics=parseSupplementalFundamentals(revised,'PRL','').groups.flatMap(g=>g.metrics);assert.equal(metrics.find(m=>m.id==='at').value,2.6833);assert.equal(metrics.find(m=>m.id==='ev').value,53.65);
 const missingUnit=parseSupplementalFundamentals(raw.replace('Rs. 53.65 bn','Rs. 53.65'),'PRL','').groups.flatMap(g=>g.metrics);assert.equal(missingUnit.find(m=>m.id==='ev').value,null);
});
test('annual valuation rejects loss or zero EPS; YoY growth needs consecutive reporting years',()=>{
 const {researchSummary}=load('research-summary'),p=parseCompanyResearch(fixture('company-PRL.html'),'','PRL');
 const summary=researchSummary(p,95.12,new Date('2026-10-23'));assert.equal(summary.annualPE,95.12/25.05);assert.equal(summary.olderReport,false);assert.ok(Math.abs(summary.growth-13.0457)<0.001);
 const gap=structuredClone(p);gap.annual.periods=['2024','2022'];assert.equal(researchSummary(gap,95.12,new Date('2026-10-23')).growth,null);assert.equal(researchSummary(gap,95.12,new Date('2026-10-23')).olderReport,true);
 for(const eps of [-1,0,null]){const loss=structuredClone(p);loss.annual.rows.find(r=>r.label==='EPS').values[0]=eps;assert.equal(researchSummary(loss,95.12).annualPE,null);}
 assert.equal(researchSummary(p,NaN).annualPE,null);
});

test('price-to-book uses the PSX quote and reported book value, not a stale provider multiple',()=>{
 const {priceToBook}=load('research-summary');assert.ok(Math.abs(priceToBook(389.45,323.48)-1.203938419686)<1e-10);
 for(const book of [null,undefined,0,-10,NaN,Infinity])assert.equal(priceToBook(389.45,book),null);
 assert.equal(priceToBook(0,323.48),null);
});

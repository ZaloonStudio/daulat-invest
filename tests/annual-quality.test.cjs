const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(name){const file=path.resolve(__dirname,'../src/lib/'+name+'.ts'),m=new Module(file,module);m.require=id=>id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
const {parseSupplementalFundamentals}=load('supplemental-fundamentals'),{applyAnnualQuality}=load('verified-annual'),{annualDividend,annualYield}=load('annual-dividend');
const fixture=n=>fs.readFileSync(path.join(__dirname,'fixtures/'+n),'utf8');
const source=s=>parseSupplementalFundamentals(fixture('annual-audit-sc-'+s+'.html'),s,'2026-10-23');
const metric=(d,id)=>d.groups.flatMap(g=>g.metrics).find(m=>m.id===id);
test('issuer FY2026 replaces stale PPL annual figures and identifies recommended cash separately',()=>{
 const old=source('PPL');assert.equal(metric(old,'d').value,7.5);assert.equal(metric(old,'roe').period,'2025 Q4');
 const d=applyAnnualQuality(old,'PPL',fixture('annual-audit-PPL.html')),div=annualDividend(d);
 assert.equal(div.cashPerShare,12);assert.equal(div.financialYear,2026);assert.match(div.note,/recommended.*approval/);assert.match(div.source,/284662/);
 assert.equal(annualYield(div,210.17).toFixed(2),'5.71');
 assert.equal(metric(d,'roe').value.toFixed(2),'12.64');assert.equal(metric(d,'roa').value.toFixed(2),'9.62');assert.equal(metric(d,'npm').value.toFixed(2),'37.32');
 assert.equal(metric(d,'lde').label,'Non-current liabilities / equity');assert.equal(metric(d,'lde').value.toFixed(2),'10.34');assert.match(metric(d,'lde').note,/not interest-bearing debt/);
});
test('OGDC closing-equity ROE is distinct from the annual report average-equity method',()=>{
 const d=applyAnnualQuality(source('OGDC'),'OGDC',fixture('annual-audit-OGDC.html'));
 assert.equal(annualDividend(d).cashPerShare,17);assert.equal(metric(d,'roe').value.toFixed(2),'15.95');assert.match(metric(d,'roe').label,/year-end equity/);assert.equal(metric(d,'lde').value.toFixed(2),'11.83');assert.match(metric(d,'lde').source,/283468/);
});
test('reviewed records expire at a newer PSX FY and do not silently fall back on a source outage',()=>{
 const newer=fixture('annual-audit-PPL.html').replaceAll('2026','2027');
 const d=applyAnnualQuality(source('PPL'),'PPL',newer);
 assert.equal(metric(d,'d').value,null);assert.equal(metric(d,'roe').value,null);assert.equal(annualDividend(d).cashPerShare,null);assert.ok(d.warnings.length);
 const outage=applyAnnualQuality(source('PPL'),'PPL','Access denied');assert.equal(metric(outage,'d').value,null);assert.equal(metric(outage,'roe').value,null);
 const unrelated=applyAnnualQuality(source('PPL'),'UNLISTED',fixture('annual-audit-PPL.html'));assert.equal(metric(unrelated,'d').value,null);
});

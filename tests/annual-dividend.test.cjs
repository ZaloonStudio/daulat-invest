const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(name){const file=path.resolve(__dirname,'../src/lib/'+name+'.ts'),m=new Module(file,module);m.require=id=>id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
const {annualDividend,annualYield,alignedAnnualYields}=load('annual-dividend'),{parseSupplementalFundamentals}=load('supplemental-fundamentals'),{comparisonRows}=load('comparison-data');
const now=new Date('2026-10-23T12:00:00Z');
const fixture=s=>parseSupplementalFundamentals(fs.readFileSync(path.join(__dirname,'fixtures/annual-dividend-'+s+'.html'),'utf8'),s,now.toISOString());
test('FATIMA and FFC compare FY2025 total DPS using the same formula, never their inconsistent feed yields',()=>{
 const fundamentals=[fixture('FATIMA'),fixture('FFC')],prices=[132.15,534.73];
 const annual=fundamentals.map(f=>annualDividend(f,now));
 assert.deepEqual(annual.map(d=>d.cashPerShare),[6,37]);assert.deepEqual(annual.map(d=>d.financialYear),[2025,2025]);
 const aligned=alignedAnnualYields(annual,prices);assert.equal(aligned.mismatchedYears,false);
 assert.equal(aligned.yields[0].toFixed(2),'4.54');assert.equal(aligned.yields[1].toFixed(2),'6.92');
 const rows=comparisonRows([{current:prices[0],dividendYield:1.51},{current:prices[1],dividendYield:7.28}],fundamentals,[])[0].rows;
 assert.deepEqual(rows.find(r=>r.label==='Annual dividend yield').values.map(v=>v.period),['FY 2025','FY 2025']);
 assert.deepEqual(rows.find(r=>r.label==='Annual dividend per share').values.map(v=>v.value),[6,37]);
 assert.equal(rows.some(r=>r.label==='Dividend yield'),false);
 assert.equal(annualYield(annual[0],150),4);
});
test('unknown, interim-only, negative and future annual dividends never fall back to a feed yield',()=>{
 for(const [value,period] of [[2,'2026 Q2'],[null,'2025 Q4'],[-2,'2025 Q4'],[6,null],[6,'2027 Q4']]){
  const data={source:'test',groups:[{metrics:[{id:'d',value,period}]}]};assert.equal(annualDividend(data,now).cashPerShare,null);
 }
 const wrong=parseSupplementalFundamentals(fs.readFileSync(path.join(__dirname,'fixtures/annual-dividend-FATIMA.html'),'utf8'),'FFC','');
 assert.equal(annualDividend(wrong,now).cashPerShare,null);
 assert.equal(annualDividend(undefined,now).cashPerShare,null);
 assert.equal(annualYield(undefined,132.15),null);
 assert.equal(annualYield(annualDividend(fixture('FATIMA'),now),0),null);
});
test('a reported zero annual payout remains zero; mismatched fiscal years withhold yields',()=>{
 const zero=annualDividend({source:'test',groups:[{metrics:[{id:'d',value:0,period:'2025 Q4'}]}]},now);
 assert.equal(annualYield(zero,100),0);
 const mismatch=alignedAnnualYields([zero,{cashPerShare:6,financialYear:2024,source:'test'}],[100,132.15]);
 assert.equal(mismatch.mismatchedYears,true);assert.deepEqual(mismatch.yields,[null,null]);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
function load(name) {
  const filename=path.resolve(__dirname,'../src/lib/'+name+'.ts');
  const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const m=new Module(filename,module);m.filename=filename;m.paths=module.paths;m._compile(code,filename);return m.exports;
}
const {parseForex}=load('forex-data');
const {parseFundReport,applyFundReport,fundReturn,fundIsDelayed}=load('fund-data');
const now=Date.parse('2026-10-22T12:00:00Z');
const stamp=now/1000-3600;
test('FX cross rates use a single observed USD snapshot and do not invent spreads',()=>{
  const data=parseForex({result:'success',base_code:'USD',time_last_update_unix:stamp,rates:{USD:1,PKR:280,EUR:0.8,GBP:0}},now);
  assert.equal(data.rates.find(r=>r.code==='EUR').rate,350);
  assert.equal(data.rates.find(r=>r.code==='GBP').rate,null);
  assert.equal(data.stale,false);
  assert.equal(data.asOf,new Date(stamp*1000).toISOString());
});
test('FX failures, future timestamps and wrong base fail closed; old observations remain labeled delayed',()=>{
  for(const data of [null,{result:'error'},{result:'success',base_code:'EUR',time_last_update_unix:stamp,rates:{USD:1,PKR:280}},{result:'success',base_code:'USD',time_last_update_unix:now/1000+86400,rates:{USD:1,PKR:280}}]) {
    assert.ok(parseForex(data,now).rates.every(r=>r.rate===null));
  }
  assert.equal(parseForex({result:'success',base_code:'USD',time_last_update_unix:stamp-172800,rates:{USD:1,PKR:280}},now).stale,true);
});
// Synthetic report exercises the provider's published column contract, not a downloaded report.
const report=(date='Oct 21, 2026',nav='1,234.50')=>`<table><tr><th>Fund Name</th><th>Rating</th><th>Validity Date</th><th>NAV</th><th>YTD</th><th>30 Days</th><th>365 Days</th><th>3 Years</th></tr><tr><td><a>Example &amp; Fund</a></td><td>AA(f)</td><td>${date}</td><td>${nav}</td><td>-2.50</td><td>N/A</td><td>10.1</td><td>20</td></tr></table>`;
test('fund report validates column headings, valuation dates and NAV; missing returns stay null',()=>{
  const rows=parseFundReport(report(),now);
  assert.equal(rows.length,1);assert.equal(rows[0].name,'Example & Fund');assert.equal(rows[0].nav,1234.5);assert.equal(rows[0].month,null);assert.equal(rows[0].ytd,-2.5);
  for(const html of [report('Oct 23, 2026'),report('21/10/2026'),report('Oct 21, 2026','0'),'<html>Access denied</html>',report().replace('Validity Date','Unknown')])assert.deepEqual(parseFundReport(html,now),[]);
});
test('fund matching never substitutes a different plan or retains old demo performance',()=>{
  const catalog=[{name:'Example & Fund',id:'one',nav:999,return1M:99,returnYTD:99,return1Y:99,return3Y:99,aumBillion:99,managementFee:'9%',frontendLoad:'9%'}];
  const rows=parseFundReport(report(),now);
  const fund=applyFundReport(catalog,rows)[0];assert.equal(fund.nav,1234.5);assert.equal(fund.aumBillion,null);assert.equal(fund.return1M,null);
  assert.equal(applyFundReport(catalog,[])[0].return1Y,null);
  assert.equal(applyFundReport(catalog,[...rows,...rows])[0].nav,null);
  assert.equal(applyFundReport(catalog,[{...rows[0],name:'Example & Fund Plan II'}])[0].nav,null);
  assert.equal(fundReturn(-2.5),'-2.50%');assert.equal(fundReturn(null),'—');assert.equal(fundIsDelayed('Oct 15, 2026',now),true);
});

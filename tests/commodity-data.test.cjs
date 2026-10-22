const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
function load(name) {
  const filename = path.resolve(__dirname, '../src/lib/' + name + '.ts');
  const code = ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const instance = new Module(filename,module); instance.filename=filename;instance.paths=module.paths;
  instance.require = id => id==='./commodity-data'?load('commodity-data'):Module.prototype.require.call(instance,id);
  instance._compile(code,filename);return instance.exports;
}
const {positive,normalizePoints,goldPkr,TOLA_GRAMS,TROY_OUNCE_GRAMS,formatPrice,validDate} = load('commodity-data');
test('gold conversion uses troy ounces, tola mass, and purity without rounding early',()=>{
  assert.equal(goldPkr(2000,280,TROY_OUNCE_GRAMS),560000);
  assert.ok(Math.abs(goldPkr(2000,280,TOLA_GRAMS)-210000)<0.01);
  assert.equal(goldPkr(2000,280,10,22),2000*280*10/TROY_OUNCE_GRAMS*22/24);
  assert.equal(goldPkr(2000,0,10),null);
  assert.equal(goldPkr(2000,280,10,30),null);
});
test('missing or non-finite feed prices never become zero-price quotes',()=>{
  for(const v of [null,undefined,'',NaN,Infinity,-1,0,{},true]) assert.equal(positive(v),null);
  assert.equal(positive('379.31'),379.31);
  assert.equal(formatPrice(null),'Unavailable');
  assert.equal(validDate('bad date'),null);
});
test('history normalization drops invalid/future values and sorts/deduplicates timestamps',()=>{
  const now=1800000000000;
  assert.deepEqual(normalizePoints([{time:100,value:2},{time:50,value:1},{time:100,value:3},{time:101,value:NaN},{time:102,value:0},{time:now/1000+1000,value:10}],now),[{time:50,value:1},{time:100,value:3}]);
});
test('price routes have unique slugs and do not create duplicate gold weight pages',()=>{
  const {PRICE_PAGES,getPricePage}=load('price-pages');
  assert.equal(new Set(PRICE_PAGES.map(p=>p.slug)).size,5);
  assert.equal(PRICE_PAGES.filter(p=>p.key==='gold').length,1);
  assert.equal(getPricePage('unknown'),undefined);
});

const {convertAtHistoricalFx,convertMonthlyAtFx,historyWindow,yahooPoints}=load('price-history-data');
test('historical PKR conversion uses observed FX, never a future or excessively old rate',()=>{
  const t=Date.parse('2025-01-10T00:00:00Z')/1000;
  const metal=[{time:t,value:TROY_OUNCE_GRAMS},{time:t+86400,value:TROY_OUNCE_GRAMS},{time:t+12*86400,value:TROY_OUNCE_GRAMS}];
  const fx=[{time:t-86400,value:100},{time:t+86400,value:200}];
  assert.deepEqual(convertAtHistoricalFx(metal,fx),[{time:t,value:100},{time:t+86400,value:200}]);
  assert.deepEqual(convertAtHistoricalFx([{time:t-2*86400,value:10}],fx),[]);
});
test('All includes old monthly and new daily points, capped at 25 calendar years',()=>{
  const time=s=>Date.parse(s)/1000;
  const now=Date.parse('2026-10-22T12:00:00Z');
  const h={intraday:[],daily:[{time:time('2025-01-01'),value:4},{time:time('2026-10-22'),value:5}],longTerm:[{time:time('1999-01-01'),value:1},{time:time('2002-01-01'),value:2},{time:time('2025-02-01'),value:3}]};
  assert.deepEqual(historyWindow(h,'ALL',now).map(p=>p.value),[2,4,5]);
  assert.deepEqual(historyWindow(h,'1Y',now).map(p=>p.value),[5]);
  assert.deepEqual(historyWindow(h,'1D',now),[]);
});
test('Yahoo missing closes are excluded instead of being converted to zero',()=>{
  assert.deepEqual(yahooPoints({chart:{result:[{timestamp:[100,200,300,400],indicators:{quote:[{close:[10,null,-1,12]}]}}]}}),[{time:100,value:10},{time:400,value:12}]);
});
test('monthly metal and FX closes align by exchange month across UTC midnight',()=>{
  const time=s=>Date.parse(s)/1000;
  const points=[{time:time('2002-04-01T04:00:00Z'),value:TROY_OUNCE_GRAMS}];
  const fx=[{time:time('2002-03-31T23:00:00Z'),value:60},{time:time('2002-04-30T23:00:00Z'),value:61}];
  assert.deepEqual(convertMonthlyAtFx(points,fx),[{time:points[0].time,value:60}]);
});

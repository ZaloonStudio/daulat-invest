const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
function load(name) {
  const filename = path.resolve(__dirname, '../src/lib/' + name + '.ts');
  const code = ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const instance = new Module(filename,module); instance.filename=filename;instance.paths=module.paths;instance._compile(code,filename);return instance.exports;
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

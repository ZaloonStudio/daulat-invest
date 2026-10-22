const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
function load(name) {
  const filename = path.resolve(__dirname, '../src/lib/' + name + '.ts');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;
  const instance = new Module(filename, module); instance.filename = filename; instance.paths = module.paths; instance._compile(code, filename); return instance.exports;
}
const {resolveTheme, themeBootstrap} = load('theme');
const {readHolding, readSoldTrade, readDate} = load('portfolio-data');
const {stockTabFromHash, STOCK_TABS} = load('stock-tabs');
const {authErrorMessage} = load('auth-errors');

test('daylight default switches at 07:00 and 19:00 in the visitor local clock', () => {
  for (let hour=0; hour<24; hour++) assert.equal(resolveTheme(null,hour),hour>=7&&hour<19?'light':'dark');
});
test('explicit theme preference always wins over the clock', () => {
  for (let hour=0; hour<24; hour++) { assert.equal(resolveTheme('light',hour),'light'); assert.equal(resolveTheme('dark',hour),'dark'); }
  assert.equal(resolveTheme('unknown',12),'light');
});
test('pre-paint bootstrap matches theme rules and survives blocked storage', () => {
  for (const hour of [0,6,7,12,18,19,23]) for (const preference of [null,'light','dark','invalid','blocked']) {
    let light;
    vm.runInNewContext(themeBootstrap,{localStorage:{getItem(){if(preference==='blocked')throw new Error('blocked');return preference;}},Date:class { getHours(){return hour;} },document:{documentElement:{classList:{toggle(name,value){assert.equal(name,'light');light=value;}}}}});
    assert.equal(light,resolveTheme(preference==='blocked'?null:preference,hour)==='light');
  }
});
test('Android holding fields retain UID-scoped document identity and cost data', () => {
  assert.deepEqual(readHolding('holding-1',{symbol:'kel',shares:100,buyPrice:5.5,buyDate:1720000000000}),{id:'holding-1',symbol:'KEL',companyName:'KEL',shares:100,buyPrice:5.5,buyDate:1720000000000});
});
test('Android sharesSold and sellDate produce the correct realized gain', () => {
  const t=readSoldTrade('trade-1',{symbol:'HUBC',sharesSold:50,buyPrice:100,sellPrice:125,sellDate:1720000000000});
  assert.equal(t.shares,50);assert.equal(t.soldDate,1720000000000);assert.equal(t.profit,1250);
  assert.equal(readSoldTrade('loss',{sharesSold:20,buyPrice:100,sellPrice:80}).profit,-400);
});
test('older web trade fields and recorded zero profits remain compatible', () => {
  const t=readSoldTrade('old',{shares:20,buyPrice:50,sellPrice:70,profit:0,soldDate:1700000000000});
  assert.equal(t.shares,20);assert.equal(t.profit,0);assert.equal(t.soldDate,1700000000000);
  assert.equal(readDate({toMillis:()=>1234}),1234);
});
test('invalid cloud numbers do not poison portfolio totals', () => {
  assert.equal(readHolding('bad',{shares:'invalid',buyPrice:Infinity}).shares,0);
  assert.equal(readHolding('bad',{buyPrice:Infinity}).buyPrice,0);
});
test('research tabs and legacy deep links resolve after consolidation', () => {
  assert.equal(STOCK_TABS.length,6);
  assert.equal(stockTabFromHash('#ratios-section'),'financials-section');
  assert.equal(stockTabFromHash('#dividends-section'),'financials-section');
  assert.equal(stockTabFromHash('#shariah-section'),'company-info-section');
  for(const [id] of STOCK_TABS) assert.equal(stockTabFromHash('#'+id),id);
  assert.equal(stockTabFromHash('#unknown'),'overview-section');
});
test('auth configuration and provider errors are actionable without exposing credentials', () => {
  assert.match(authErrorMessage({code:'auth/configuration-not-found'}),/Firebase setup/);
  assert.match(authErrorMessage({code:'auth/unauthorized-domain'}),/website address/);
  assert.match(authErrorMessage({code:'auth/account-exists-with-different-credential'}),/app password/);
  assert.match(authErrorMessage({code:'auth/popup-blocked'}),/pop-ups/);
  assert.equal(authErrorMessage(new Error('secret')), 'Unable to sign in right now. Please try again.');
});

const {normalizeChartPoints} = load('chart-data');
test('duplicate history timestamps cannot crash chart timeframes', () => {
 const original=[{time:1705922103,value:100},{time:1705922000,value:90},{time:1705922103,value:105,volume:22},{time:NaN,value:1}];
 const normalized=normalizeChartPoints(original);
 assert.deepEqual(normalized.map(p=>p.time),[1705922000,1705922103]);
 assert.equal(normalized[1].value,105);assert.equal(normalized[1].volume,22);assert.equal(original.length,4);
});
test('chart time normalization handles Unix seconds, milliseconds, strings and ISO dates', () => {
 const result=normalizeChartPoints([{time:'2024-01-22',value:1},{time:1705881600000,value:2},{time:'1705968000',value:3},{time:'invalid',value:4}]);
 assert.deepEqual(result.map(p=>p.time),[1705881600,1705968000]); assert.equal(result[0].value,2);
});

const {accountDataOwner}=load('account-data-owner');
test('confirmed legacy account resolves only for the exact verified Google UID in the production project',()=>{
  const user={uid:'o1LCsgPhCwSWPONPUT2AQzOl20H2',emailVerified:true,providerData:[{providerId:'google.com'}]};
  assert.equal(accountDataOwner(user,'zaloon-aecb6'),'google_2094052383');
  assert.equal(accountDataOwner({...user,emailVerified:false},'zaloon-aecb6'),user.uid);
  assert.equal(accountDataOwner({...user,providerData:[{providerId:'password'}]},'zaloon-aecb6'),user.uid);
  assert.equal(accountDataOwner(user,'different-project'),user.uid);
});
test('other accounts and sign-out never inherit a legacy folder or use email hashes',()=>{
  assert.equal(accountDataOwner(null,'zaloon-aecb6'),null);
  for(const uid of ['another-uid','google_2094052383','__proto__','constructor']) {
    assert.equal(accountDataOwner({uid,emailVerified:true,providerData:[{providerId:'google.com'}]},'zaloon-aecb6'),uid);
  }
});

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(name){const file=path.resolve(__dirname,'../src/lib/'+name+'.ts'),m=new Module(file,module);m.require=id=>id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
const {metricValue,matchesRanges,rangeError,screenQuotes,blueChipUniverse,screenerCSV}=load('screener');
const base={symbol:'ABC',name:'Example company',sector:'ENERGY',current:10,change:0,changePercent:0,volume:0};
const options={search:'',sector:'ALL',shariahOnly:false,ranges:[],bluechips:false,sort:'marketCap',order:'desc'};
const {RESEARCH_METRICS,parseResearchRows,researchRequest}=load('screener-research-data');

test('captured public fundamentals map exact fields, preserve negative returns and never substitute ROE for ROIC',()=>{
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/screener-research.json'),'utf8'));
 const rows=parseResearchRows(fixture,RESEARCH_METRICS),prl=rows.find(r=>r.symbol==='PRL');
 assert.equal(prl.values.roe,36.89);assert.equal(prl.values.priceToBook,1.06);assert.equal(prl.values.expectedPe,1.07);assert.equal(prl.values.evEbitda,2.28);
 assert.equal(RESEARCH_METRICS.some(m=>m.key==='roic'),false);
 const negative=parseResearchRows({d:[{company_symbol:'LOSS',Company_name:'Example Consolidated',ReturnOnEquity:-12.5,ExpectedPriceToEarning:0,PriceToBookValue:null}]},RESEARCH_METRICS)[0];
 assert.equal(negative.values.roe,-12.5);assert.equal(negative.values.expectedPe,undefined);assert.equal(negative.values.priceToBook,undefined);assert.equal(negative.basis,'Consolidated');
 assert.deepEqual(parseResearchRows('<html>Error</html>',RESEARCH_METRICS),[]);
 assert.deepEqual(parseResearchRows({d:[{company_symbol:'ABC',Company_name:'A',ReturnOnEquity:10},{company_symbol:'ABC',Company_name:'A Consolidated',ReturnOnEquity:20}]},RESEARCH_METRICS),[]);
 const q={...base,research:negative};assert.equal(matchesRanges(q,[{key:'roe',min:'-15',max:'-10'}]),true);
});

test('bulk fundamentals query includes wide negative bounds and exact metric identifiers',()=>{
 const request=researchRequest(RESEARCH_METRICS.filter(m=>m.key==='roe'));
 assert.deepEqual(JSON.parse(request.ids),[1,['7']]);assert.deepEqual(JSON.parse(request.bet),[1,['-1000000000','1000000000']]);
});

test('advanced screens use only each company source values; missing expected P/E does not hide available ROE',()=>{
 const quotes=[{...base,symbol:'A',research:{symbol:'A',basis:'Consolidated',values:{roe:25,priceToBook:1.25}}},{...base,symbol:'B',research:{symbol:'B',basis:'Basis not specified',values:{roe:12,expectedPe:4}}}];
 assert.deepEqual(screenQuotes(quotes,{...options,ranges:[{key:'roe',min:'20',max:''}]}).map(q=>q.symbol),['A']);
 assert.deepEqual(screenQuotes(quotes,{...options,ranges:[{key:'expectedPe',min:'',max:'5'}]}).map(q=>q.symbol),['B']);
 assert.ok(screenerCSV(quotes).includes('Return on equity (ROE) (%)'));
});

test('independent bulk groups preserve healthy metrics during source failure and never merge conflicting bases',async()=>{
 const {fetchScreenerResearch}=load('screener-research');const before=global.fetch;
 try{
  global.fetch=async(_,opts)=>{
   const ids=JSON.parse(JSON.parse(opts.body).ids).slice(1).flat();
   if(ids.includes('3'))return {ok:false};
   if(ids.includes('14'))return {ok:true,json:async()=>({d:[{company_symbol:'ABC',Company_name:'A Unconsolidated',ExpectedEarningGowth:20}]})};
   return {ok:true,json:async()=>({d:[{company_symbol:'ABC',Company_name:'A Consolidated',ReturnOnEquity:25}]})};
  };
  const data=await fetchScreenerResearch();assert.equal(data.complete,false);assert.deepEqual(data.unavailable,['expectedPe']);assert.equal(data.rows[0].values.roe,25);assert.equal(data.rows[0].values.expectedGrowth,undefined);
  global.fetch=async()=>{throw new Error('offline');};const missing=await fetchScreenerResearch();assert.deepEqual(missing.rows,[]);assert.equal(missing.complete,false);
 }finally{global.fetch=before;}
});

test('custom fractional bounds are inclusive, combine with AND, and removing a filter broadens results',()=>{
 const quotes=[{...base,symbol:'A',peRatio:6.25,dividendYield:8.75},{...base,symbol:'B',peRatio:7.5,dividendYield:8.75},{...base,symbol:'C',peRatio:6.25,dividendYield:0}];
 const ranges=[{key:'peRatio',min:'6.25',max:'6.25'},{key:'dividendYield',min:'8.5',max:'9'}];
 assert.deepEqual(screenQuotes(quotes,{...options,ranges}).map(q=>q.symbol),['A']);
 assert.deepEqual(screenQuotes(quotes,{...options,ranges:ranges.slice(0,1)}).map(q=>q.symbol),['A','C']);
 assert.equal(matchesRanges({...base,marketCap:125000000000},[{key:'marketCap',min:'125',max:'125'}]),true);
 assert.equal(matchesRanges({...base,changeYear:-15.25},[{key:'changeYear',min:'-20',max:'-10'}]),true);
});
test('unknown fundamentals never get generated values; genuine zero yield and volume remain filterable',()=>{
 for(const key of ['peRatio','dividendYield','marketCap'])assert.equal(metricValue(base,key),undefined);
 assert.equal(matchesRanges(base,[{key:'dividendYield',min:'0',max:''}]),false);
 assert.equal(matchesRanges({...base,dividendYield:0},[{key:'dividendYield',min:'0',max:'0'}]),true);
 assert.equal(matchesRanges({...base,sessionAvailable:false},[{key:'volume',min:'0',max:''}]),false);
 assert.equal(matchesRanges(base,[{key:'volume',min:'0',max:'0'}]),true);
 assert.equal(metricValue({...base,peRatio:-3},'peRatio'),undefined);
 assert.equal(metricValue({...base,marketCap:NaN},'marketCap'),undefined);
});
test('invalid and reversed ranges report a clear error instead of silently ignoring constraints',()=>{
 for(const f of [{key:'peRatio',min:'8',max:'7'},{key:'current',min:'-1',max:''},{key:'volume',min:'NaN',max:''}]){
  assert.ok(rangeError(f));assert.equal(matchesRanges(base,[f]),false);
 }
 assert.equal(rangeError({key:'changePercent',min:'-5',max:'0'}),null);
 assert.equal(rangeError({key:'dividendYield',min:'0',max:'0'}),null);
});
test('blue chips selects exactly 20 largest KSE100 companies without price or liquidity exclusions',()=>{
 const quotes=Array.from({length:25},(_,i)=>({...base,symbol:'K'+String(i).padStart(2,'0'),isKse100:true,marketCap:(25-i)*1e9,current:2,volume:0,sessionAvailable:false}));
 quotes.push({...base,symbol:'OUT',isKse100:false,marketCap:1e15},{...base,symbol:'NO_CAP',isKse100:true});
 assert.equal(blueChipUniverse([...quotes,quotes[0]]).size,20);
 assert.equal(blueChipUniverse(quotes).has('OUT'),false);
 assert.equal(blueChipUniverse(quotes).has('K20'),false);
 assert.equal(screenQuotes(quotes,{...options,bluechips:true}).length,20);
 assert.equal(screenQuotes(quotes,{...options,bluechips:true,search:'K24'}).length,0);
 assert.equal(blueChipUniverse([]).size,0);
});
test('sorting keeps missing values last in both directions, and KMI filter uses source membership only',()=>{
 const quotes=[{...base,symbol:'Z',sector:'TECHNOLOGY'},{...base,symbol:'A',peRatio:5,isShariah:true},{...base,symbol:'B',peRatio:10,isShariah:false}];
 assert.deepEqual(screenQuotes(quotes,{...options,sort:'peRatio',order:'asc'}).map(q=>q.symbol),['A','B','Z']);
 assert.deepEqual(screenQuotes(quotes,{...options,sort:'peRatio'}).map(q=>q.symbol),['B','A','Z']);
 assert.deepEqual(screenQuotes(quotes,{...options,shariahOnly:true}).map(q=>q.symbol),['A']);
 const csv=screenerCSV([{...base,name:'Example, "quoted" company',dividendYield:0}]);
 assert.ok(csv.includes('"Example, ""quoted"" company"'));assert.ok(csv.includes('"","0",""'));
});

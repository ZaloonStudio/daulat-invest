const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const file=path.resolve(__dirname,'../src/lib/screener.ts'),m=new Module(file,module);
m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const {metricValue,matchesRanges,rangeError,screenQuotes,blueChipUniverse,screenerCSV}=m.exports;
const base={symbol:'ABC',name:'Example company',sector:'ENERGY',current:10,change:0,changePercent:0,volume:0};
const options={search:'',sector:'ALL',shariahOnly:false,ranges:[],bluechips:false,sort:'marketCap',order:'desc'};

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

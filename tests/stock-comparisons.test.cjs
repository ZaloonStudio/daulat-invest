const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(name){const file=path.resolve(__dirname,'../src/lib/'+name+'.ts'),m=new Module(file,module);m.require=id=>id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
const catalog=load('stock-comparisons'),data=load('comparison-data'),supp=load('supplemental-fundamentals');
test('curated catalog has 13 unique pairs with complete three-company fertilizer coverage',()=>{
 const pairs=catalog.STOCK_COMPARISONS;assert.equal(pairs.length,13);assert.equal(new Set(pairs.map(p=>[p.left,p.right].sort().join('|'))).size,13);
 const fert=pairs.filter(p=>p.sector==='Fertilizer');assert.equal(fert.length,3);
 for(const [a,b] of [['FATIMA','FFC'],['FATIMA','EFERT'],['FFC','EFERT']])assert.ok(fert.some(p=>[p.left,p.right].includes(a)&&[p.left,p.right].includes(b)));
 for(const p of pairs){assert.notEqual(p.left,p.right);assert.ok(catalog.COMPARISON_COMPANIES[p.left]);assert.ok(catalog.COMPARISON_COMPANIES[p.right]);assert.equal(catalog.comparisonPath(p),'/stocks/compare/'+p.slug);}
});
test('reverse and named pair variants resolve to one canonical URL; uncurated pairs never create pages',()=>{
 assert.equal(catalog.resolveComparison('mebl-vs-ubl').slug,'ubl-vs-mebl');assert.equal(catalog.resolveComparison('ubl-vs-meezan-bank').slug,'ubl-vs-mebl');
 assert.equal(catalog.resolveComparison('fauji-fertilizer-vs-fatima').slug,'fatima-vs-ffc');
 assert.equal(catalog.resolveComparison('ubl-vs-ffc'),undefined);assert.equal(catalog.resolveComparison('ubl-vs-ubl'),undefined);assert.equal(catalog.resolveComparison('ubl-vs-mebl-vs-hbl'),undefined);
 assert.equal(catalog.comparisonsForStock('EFERT').length,2);
});
test('comparison values preserve each reporting period and use PSX price for price/book',()=>{
 const f=supp.parseSupplementalFundamentals(fs.readFileSync(path.join(__dirname,'fixtures/supplemental-PRL.html'),'utf8'),'PRL','2026-10-23');
 Object.assign(f.groups.flatMap(g=>g.metrics).find(m=>m.id==='d'),{value:0,period:'2026 Q4'});
 const q={symbol:'PRL',current:100,dividendYield:0};
 const groups=data.comparisonRows([q,undefined],[f,supp.parseSupplementalFundamentals('','ATRL','')],['roe','npm']);
 const pb=groups[0].rows.find(r=>r.label==='Price / book (calculated)'),bv=f.groups.flatMap(g=>g.metrics).find(m=>m.id==='bv');
 assert.equal(pb.values[0].value,100/bv.value);assert.equal(pb.values[0].period,bv.period);assert.equal(pb.values[1].value,null);
 assert.equal(groups[0].rows.find(r=>r.label==='Annual dividend yield').values[0].value,0);
 assert.equal(groups[0].rows.find(r=>r.label==='1-year price change').values[0].value,null);
 assert.equal(groups[1].rows.find(r=>r.label==='Return on equity (ROE)').values[0].value,36.89);
 assert.equal(data.formatComparisonValue(null,'%'),'—');assert.equal(data.formatComparisonValue(0,'%'),'0.00%');assert.equal(data.formatComparisonValue(-7.2,'%'),'-7.20%');
 assert.equal(data.formatComparisonValue(125e9,'PKR'),'Rs 125B');
});

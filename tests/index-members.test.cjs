const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const file=path.resolve(__dirname,'../src/lib/index-members.ts'),m=new Module(file,module);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const {indexCompanies,indexCode,indexCompaniesPath}=m.exports;
test('captured PSX membership returns all 30 KSE30 symbols with no price or trading-volume cutoff',()=>{
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/kse30-members.json'),'utf8'));
 data[0].sessionAvailable=false;data[0].volume=0;data[0].current=0;
 const rows=indexCompanies(data,'KSE30');assert.equal(rows.length,30);assert.ok(rows.some(q=>q.symbol===data[0].symbol));assert.ok(rows.some(q=>q.symbol==='ENGROH'));assert.ok(rows.some(q=>q.symbol==='UBL'));assert.deepEqual(rows.map(q=>q.symbol),[...rows.map(q=>q.symbol)].sort());
});
test('exact normalized membership tokens keep KSE30 separate from KSE100, KMI30 and synthetic substring matches',()=>{
 const rows=[{symbol:'A',listedIndices:' KSE30, KMI30 '},{symbol:'B',listedIndices:'KSE100,KSE100PR'},{symbol:'C',listedIndices:'KSE300'},{symbol:'D',listedIndices:'kse30'},{symbol:'E',isKse100:true},{symbol:'A',listedIndices:'KSE30'}];
 assert.deepEqual(indexCompanies(rows,'kse30').map(q=>q.symbol),['A','D']);assert.deepEqual(indexCompanies(rows,'KSE100').map(q=>q.symbol),['B']);assert.deepEqual(indexCompanies(rows,'KMI30').map(q=>q.symbol),['A']);assert.deepEqual(indexCompanies(rows,'missing'),[]);assert.deepEqual(indexCompanies([],'KSE30'),[]);
});
test('all-share aliases normalize to source codes and constituent links remain shareable',()=>{
 assert.equal(indexCode(' kseall '),'ALLSHR');assert.equal(indexCode('kmiall'),'KMIALLSHR');assert.equal(indexCompaniesPath('kse30'),'/market?index=KSE30&view=companies');
 assert.equal(indexCompanies([{symbol:'A',listedIndices:'ALLSHR'},{symbol:'B',listedIndices:'KMIALLSHR'}],'KSEALL').length,1);
});

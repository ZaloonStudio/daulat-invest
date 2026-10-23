const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const filename=path.resolve(__dirname,'../src/lib/chart-tooltip-data.ts');
const instance=new Module(filename,module);
instance._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,filename);
const {tooltipDate,tooltipNumber,tooltipPosition}=instance.exports;

test('intraday tooltip uses Pakistan time across UTC midnight boundaries',()=>{
 const text=tooltipDate(Date.parse('2026-10-22T21:30:00Z')/1000,true);
 assert.match(text,/23 Oct 2026/);assert.match(text,/02:30 PKT/);
 assert.equal(tooltipDate('2026-10-22',false),tooltipDate({year:2026,month:10,day:22},false));
});
test('tooltip distinguishes missing volume from a real zero and price from index units',()=>{
 assert.equal(tooltipNumber(undefined,'volume'),'—');
 assert.equal(tooltipNumber(0,'volume'),'0');
 assert.equal(tooltipNumber(11646497,'volume'),'11,646,497');
 assert.equal(tooltipNumber(NaN),'—');
 assert.equal(tooltipNumber(28.58),'Rs 28.58');
 assert.equal(tooltipNumber(163298.57,'index'),'163,298.57');
});
test('tooltip flips at chart edges and stays inside narrow chart containers',()=>{
 for(const [x,y,width,height] of [[490,330,500,340],[0,0,320,340],[150,200,280,340]]){
  const p=tooltipPosition(x,y,width,height,236,100);
  assert.ok(p.left>=8&&p.left+236<=width-8);
  assert.ok(p.top>=8&&p.top+100<=height-8);
 }
});

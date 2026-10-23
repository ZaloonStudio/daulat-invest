const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(name){const file=path.resolve(__dirname,'../src/lib/'+name+'.ts'),m=new Module(file,module);m.require=id=>id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
const {parseLocalBullion,bullionArticleLinks,localMetalQuote}=load('local-bullion-data'),{metalValue,formatQuoteAsOf,TOLA_GRAMS}=load('commodity-data');
const html=fs.readFileSync(path.join(__dirname,'fixtures/local-bullion-mettis.txt'),'utf8'),url='https://mettisglobal.news/Gold-price-in-Pakistan-falls-Rs7000-per-tola-64471',now=Date.parse('2026-10-23T16:00:00Z');
test('dated association-attributed report preserves current tola and reported 10g quotes, not yesterday prices or USD spot',()=>{
 const d=parseLocalBullion(html,url,now);assert.equal(d.gold,424536);assert.equal(d.silver,5865);assert.equal(d.gold10,363971);assert.equal(d.silver10,5028);assert.equal(d.date,'2026-10-23');
 const q=localMetalQuote(d,'gold',now);assert.equal(q.basis,'local-daily');assert.equal(q.value*TOLA_GRAMS,424536);assert.equal(metalValue(q,10),363971);assert.equal(metalValue(q,10,22),363971*22/24);assert.equal(q.delayed,false);assert.equal(formatQuoteAsOf(q),'23 Oct 2026');assert.ok(!formatQuoteAsOf(q).includes('00:00'));
});
test('unattributed, future, stale, malformed dates and inconsistent units are rejected',()=>{
 assert.equal(parseLocalBullion(html.replace('All-Pakistan Gems and Jewelers Sarafa Association (APGJSA)','an unnamed vendor'),url,now),null);
 assert.equal(parseLocalBullion(html.replaceAll('October 23, 2026','October 24, 2026'),url,now),null);
 assert.equal(parseLocalBullion(html,url,now+5*86400000),null);
 assert.equal(parseLocalBullion(html.replaceAll('October 23, 2026','February 30, 2026'),url,now),null);
 assert.equal(parseLocalBullion(html.replace('363,971','463,971'),url,now),null);
 assert.equal(parseLocalBullion(html,'https://untrusted.example/report',now),null);
});
test('discovery stays on the public publisher and never follows injected external links or non-bullion news',()=>{
 const links=bullionArticleLinks(`<a href="${url}">x</a><a href="${url}">duplicate</a><a href="https://bad.example/Gold-price-in-Pakistan-falls-1">bad</a><a href="/Gold-price-in-Pakistan-gains-Rs100-64472">good</a><a href="https://mettisglobal.news@bad.example/Gold-price-in-Pakistan-falls-1">bad</a>`);
 assert.equal(links.length,2);assert.ok(links.every(u=>new URL(u).origin==='https://mettisglobal.news'));
});
test('research never fits unmatched clocks, insufficient dates or observations; fits only a separate holdout',async()=>{
 const {compareSample,fitAdjustments}=await import('../scripts/lib/bullion-research.mjs');
 const local={perTola:413200,asOf:null},global={perTola:415900,usdOz:4000,asOf:'2026-10-23T16:00:00Z'};assert.equal(compareSample(local,global,now).aligned,false);assert.equal(fitAdjustments([]).models,null);
 const samples=Array.from({length:25},(_,i)=>{const asOf=new Date(Date.parse('2026-10-01T12:00:00Z')+Math.floor(i/5)*86400000+(i%5)*60000).toISOString(),x=400000+i*1000;return {local:{perTola:x+5000,asOf},global:{perTola:x,asOf},comparison:{aligned:true}};});
 const result=fitAdjustments(samples);assert.equal(result.status,'research-only');assert.equal(result.models.fixedRupees.offset,5000);assert.equal(result.models.fixedRupees.holdoutRmse,0);
});

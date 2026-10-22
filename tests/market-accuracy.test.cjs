const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(name){const file=path.resolve(__dirname,'../src/lib/'+name+'.ts');const m=new Module(file,module);m.filename=file;m.paths=module.paths;m.require=id=>id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
const source=load('market-source'),history=load('stock-history-data'),funds=load('fund-data');
const fixture=n=>fs.readFileSync(path.join(__dirname,'fixtures',n),'utf8');
test('captured PSX report supplies dated exchange totals; zero breadth is preserved',()=>{
 const panel=source.parseTradingPanel(fixture('psx-panel.html'));
 assert.equal(panel.indices[0].current,163924.31);assert.equal(panel.totalVolume,465190166);assert.equal(panel.advance,100);assert.equal(panel.decline,355);assert.equal(panel.isOpen,false);assert.equal(panel.asOf,'2026-10-22T13:13:00.000Z');
 assert.equal(panel.indices[0].yearHigh,undefined);assert.equal(panel.indices[0].open,undefined);
 assert.equal(source.parseTradingPanel(fixture('psx-panel.html').replace('>100</td>','>0</td>')).advance,0);
 assert.deepEqual(source.parseTradingPanel('<html>Unavailable</html>').indices,[]);
});
test('daily trading prices and volume come from market watch, never 30D averages',()=>{
 const [p]=source.parseMarketWatch(fixture('psx-quotes.html'),fixture('psx-screener.html'),{'0825':'REFINERY'},'2026-10-22T13:13:00Z');
 assert.equal(p.symbol,'PRL');assert.equal(p.name,'Pakistan Refinery Limited');assert.equal(p.open,100.89);assert.equal(p.high,101.21);assert.equal(p.low,93.01);assert.equal(p.current,95.12);assert.equal(p.ldcp,99.88);assert.equal(p.change,-4.76);assert.equal(p.volume,25877567);assert.equal(p.averageVolume30D,30207958.4);assert.equal(p.freeFloat,252000000);assert.equal(p.isShariah,true);
 const [untraded]=source.parseMarketWatch('',fixture('psx-screener.html'),{});
 assert.equal(untraded.sessionAvailable,false);assert.equal(untraded.updatedAt,undefined);assert.ok(Math.abs(untraded.current/untraded.ldcp-1-untraded.changePercent/100)<1e-10);
 assert.deepEqual(source.parseMarketWatch('','',{}),[]);
});
test('announcements use actual document links and never manufacture attachment identifiers',()=>{
 const [a]=source.parseAnnouncements(fixture('psx-announcement.html'));assert.equal(a.symbol,'BAPL');assert.equal(a.documentUrl,'https://dps.psx.com.pk/download/attachment/286599-1.pdf');assert.equal(a.date,'Oct 22, 2026');assert.equal(a.summary,undefined);
 assert.deepEqual(source.parseAnnouncements(fixture('psx-announcement.html').replace('/download/attachment/286599-1.pdf','javascript:alert(1)')),[]);
});
test('publisher RSS supplies real article links and dates with no invented summaries',()=>{
 const xml=fixture('dawn.xml');const [a]=source.parseDawnFeed(xml,Date.parse('2030-01-01'));assert.ok(a);assert.match(a.link,/^https:\/\/www\.dawn.com\/news\/\d+/);assert.equal(a.summary,'');assert.ok(Number.isFinite(Date.parse(a.publishedAt)));
 assert.deepEqual(source.parseDawnFeed(xml.replace('https://www.dawn.com','https://example.com'),Date.parse('2030-01-01')),[]);assert.deepEqual(source.parseDawnFeed(xml,0),[]);
 const tribune=fixture('tribune.xml');const [b]=source.parseNewsFeed(tribune,'TRIBUNE',Date.parse('2030-01-01'));assert.equal(b.source,'TRIBUNE');assert.match(b.link,/^https:\/\/tribune.com.pk\/story\//);assert.deepEqual(source.parseNewsFeed(tribune,'DAWN',Date.parse('2030-01-01')),[]);
 assert.match(a.imageUrl,/^https:\/\/i\.dawn\.com\//);assert.match(b.imageUrl,/^https:\/\/i\.tribune\.com\.pk\//);
 assert.equal(source.parseNewsFeed(tribune.replace('https://i.tribune.com.pk','https://example.com'),'TRIBUNE',Date.parse('2030-01-01'))[0].imageUrl,undefined);
 assert.equal(source.parseNewsFeed(tribune.replace('https://i.tribune.com.pk','http://i.tribune.com.pk'),'TRIBUNE',Date.parse('2030-01-01'))[0].imageUrl,undefined);
});
test('homepage index shortlist is stable, limited to five, and keeps specialist indices for Market',()=>{
 const {homeIndices}=load('market-layout');const indices=['BKTI','PSXDIV20','OGTI','KMI30','KSE30','ALLSHR','KSE100'].map(code=>({code}));
 assert.deepEqual(homeIndices(indices).map(i=>i.code),['KSE100','ALLSHR','KSE30','KMI30','PSXDIV20']);assert.equal(homeIndices([]).length,0);assert.deepEqual(homeIndices([{code:'KSE100'}]).map(i=>i.code),['KSE100']);
});
test('comparisons match actual dates and never invent benchmark returns',()=>{
 const t=Date.parse('2026-10-01')/1000;
 const stock=[{time:t,value:100},{time:t+86400,value:120},{time:t+172800,value:110}];
 assert.deepEqual(history.comparePrices(stock,[]),{stock:[],index:[]});
 const comparison=history.comparePrices(stock,[{time:t,value:200},{time:t+172800,value:220}]);assert.equal(comparison.stock.length,2);assert.ok(Math.abs(comparison.stock[1].value-110)<1e-8);assert.ok(Math.abs(comparison.index[1].value-110)<1e-8);
});
test('monthly simulation buys shares at actual prices, calendar range does not count trading rows as days',()=>{
 const points=[{time:Date.parse('2026-08-01')/1000,value:100},{time:Date.parse('2026-09-01')/1000,value:200},{time:Date.parse('2026-09-20')/1000,value:150},{time:Date.parse('2026-10-01')/1000,value:100}];
 const result=history.simulateMonthlyPurchases(points,1000);assert.equal(result[3].invested,3000);assert.equal(result[3].value,2500);assert.equal(history.periodPoints(points,'1W').length,1);assert.equal(history.periodPoints(points,'1M').length,3);assert.equal(history.priceObservations([{time:1,value:NaN}]).length,0);
 const monthEnd=['2026-02-27','2026-02-28','2026-03-31'].map(d=>({time:Date.parse(d)/1000,value:100}));assert.equal(history.periodPoints(monthEnd,'1M').length,2);
});
test('mutual fund reporting basis is retained and ambiguous dates do not become fresh NAVs',()=>{
 const html='<table><tr><th>Fund Name</th><th>Validity Date</th><th>NAV</th><th>YTD</th></tr><tr><td colspan="4">Money Market (Annualized Return)</td></tr><tr><td>Example Fund</td><td>Oct 22, 2026</td><td>10</td><td>9.5</td></tr></table>';
 const rows=funds.parseFundReport(html,Date.parse('2026-10-23'));assert.equal(rows[0].returnBasis,'Annualized');assert.equal(rows[0].ytd,9.5);assert.equal(rows[0].month,null);
});
test('fund category and Islamic filter cannot contradict each other',()=>{
 const {PAKISTAN_MUTUAL_FUNDS:catalog}=load('mutualFundsData');
 for(const f of catalog){if(f.category.startsWith('Islamic'))assert.equal(f.isIslamic,true,f.name);if(f.category.startsWith('Conventional'))assert.equal(f.isIslamic,false,f.name);}
 const reported=funds.applyFundReport(catalog,[]);assert.ok(reported.every(f=>f.nav===null&&f.benchmark==='See AMC report'&&f.trustee==='See AMC report'));
});
test('upstream outages return unavailable data, never stock quotes, charts, news or a sentiment score disguised as live',async()=>{
 const original=global.fetch;global.fetch=async()=>new Response('Unavailable',{status:503});
 try {
  const psx=load('psx');assert.deepEqual(await psx.fetchMarketWatch(),[]);assert.deepEqual(await psx.fetchIndices(),[]);assert.deepEqual(await psx.fetchKse100Timeseries(),[]);assert.deepEqual(await psx.fetchMarketNews(),[]);assert.deepEqual(await psx.fetchCompanyAnnouncements(),[]);
  const summary=await psx.getMarketSummary();assert.equal(summary.kse100,null);assert.equal(summary.totalVolume,undefined);assert.equal(summary.marketTime,'');assert.equal(psx.calculateFearGreed(summary).available,false);
 }finally{global.fetch=original;}
});

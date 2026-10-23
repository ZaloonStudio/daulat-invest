// Read-only live audit. Values from different endpoints may move between requests.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(name){const file=path.resolve(__dirname,'../src/lib/'+name+'.ts'),m=new Module(file,module);m.filename=file;m.paths=module.paths;m.require=id=>id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
const {fetchMarketWatch,fetchCompanyResearch,getSessionToken}=load('psx');
const {researchSummary}=load('research-summary');
const text=s=>s.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const numeric=s=>{const n=s.replace(/^Rs\.?\s*/,'').replace(/,/g,'').trim();return /^[+-]?\d+(\.\d+)?$/.test(n)?Number(n):null;};
(async()=>{
 const quotes=await fetchMarketWatch(true),results=[];
 const token=await getSessionToken();
 const screenerResponse=await fetch('https://dps.psx.com.pk/screener',{headers:{'X-Req-Id':token,'X-Requested-With':'XMLHttpRequest',Referer:'https://dps.psx.com.pk/'},signal:AbortSignal.timeout(15000)});
 const screener=screenerResponse.ok?await screenerResponse.text():'';
 for(const symbol of ['PRL','MEBL','LUCK','HUBC','KEL','UNITY','EPCL']){
  const [data,response]=await Promise.all([fetchCompanyResearch(symbol),fetch('https://dps.psx.com.pk/company/'+symbol,{signal:AbortSignal.timeout(15000)})]);
  const html=response.ok?await response.text():'',quote=quotes.find(q=>q.symbol===symbol);
  const officialClose=numeric(text(html.match(/class="quote__close"[^>]*>([\s\S]*?)<\/div>/)?.[1]??''));
  const officialPE=numeric(text(html.match(/class="stats_label">P\/E Ratio \(TTM\)[\s\S]*?<div class="stats_value">([\s\S]*?)<\/div>/)?.[1]??''));
  const financials=html.slice(html.indexOf('id="financials"'),html.indexOf('id="ratios"'));
  const firstAnnualTable=financials.match(/<table\b[\s\S]*?<\/table>/)?.[0]??'';
  const epsRaw=text(firstAnnualTable.match(/<tr><td>EPS<\/td>\s*<td\b[^>]*>([\s\S]*?)<\/td>/)?.[1]??'');
  const officialAnnualEPS=/^\([\d,.]+\)$/.test(epsRaw)?-numeric(epsRaw.slice(1,-1)):numeric(epsRaw);
  const screenRow=[...screener.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].find(m=>new RegExp('data-order="'+symbol+'"').test(m[1]));
  const screenCells=[...(screenRow?.[1]??'').matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)];
  const sourceYield=numeric(screenCells[8]?.[1].match(/data-order="([^"]+)"/)?.[1]??'');
  const summary=researchSummary(data,quote?.current??NaN),supplemental=data.supplemental;
  const delta=quote&&officialClose!==null?Math.abs(quote.current-officialClose):null;
  results.push({symbol,source:'https://dps.psx.com.pk/company/'+symbol,quote:quote?{price:quote.current,asOf:quote.updatedAt,change:quote.change,ldcp:quote.ldcp,peTTM:quote.peRatio??null,dividendYield:quote.dividendYield??null}:null,
   officialClose,officialPE,peMatchesSource:(quote?.peRatio??null)===null&&officialPE===null||quote?.peRatio!==undefined&&officialPE!==null&&Math.abs(quote.peRatio-officialPE)<=Math.max(0.02,officialPE*0.005),sourceYield,yieldMatchesSource:quote?.dividendYield!==undefined&&sourceYield!==null?Math.abs(quote.dividendYield-sourceYield)<0.02:false,officialAnnualEPS,annualEPSMatchesSource:summary.eps===officialAnnualEPS,priceDifference:delta,changeConsistent:quote?Math.abs(quote.current-quote.ldcp-quote.change)<0.011:false,
   // 0.5% allows normal quote movement across sequential requests, not a certified price match.
   quoteWithinTolerance:quote&&officialClose!==null?delta<=Math.max(0.01,officialClose*0.005):false,
   annualPeriod:summary.annualPeriod,annualEPS:summary.eps,quarterPeriod:data.quarterly.periods[0]??null,quarterEPS:summary.quarterEps,annualPE:summary.annualPE,olderReport:summary.olderReport,
   marketCapConsistent:quote?.marketCap&&data.shares?Math.abs(quote.marketCap/(quote.current*data.shares)-1)<0.005:null,
   supplementalBasis:supplemental?.basis,sourceSnapshotPrice:supplemental?.snapshotPrice,bookValue:supplemental?.groups.flatMap(g=>g.metrics).find(m=>m.id==='bv'),
   payoutRows:data.payouts.length,payoutFeedAvailable:data.payoutsAvailable});
 }
 const report={checkedAt:new Date().toISOString(),scope:'Seven-stock source and calculation sample; not a certification of every issuer report',results};
 fs.writeFileSync(path.resolve(__dirname,'../docs/stock-audit-latest.json'),JSON.stringify(report,null,2)+'\n');
 console.table(results.map(r=>({symbol:r.symbol,quote:r.quote?.price,source:r.officialClose,change:r.changeConsistent,cap:r.marketCapConsistent,annualEPS:r.annualEPS,period:r.annualPeriod,basis:r.supplementalBasis,old:r.olderReport})));
 if(results.some(r=>!r.changeConsistent||!r.annualEPSMatchesSource||!r.peMatchesSource||!r.yieldMatchesSource||!r.quoteWithinTolerance||r.marketCapConsistent===false)){process.exitCode=1;console.error('Audit requires review: unavailable source, changed quote or inconsistent arithmetic. See docs/stock-audit-latest.json.');}
})().catch(e=>{console.error(e.message);process.exitCode=1;});

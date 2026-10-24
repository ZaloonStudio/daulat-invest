const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(n){const f=path.resolve(__dirname,'../src/lib/'+n+'.ts'),m=new Module(f,module);m.paths=module.paths;m.require=id=>id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);return m.exports;}
const {parseNewsFeed}=load('market-source'),{mergeNews,companyNews,newsDateLabel,newsIsOlder}=load('news-quality');
const now=Date.parse('2026-10-23T12:00:00Z');
const item=(title='Pakistan Refinery announces results',link='https://tribune.com.pk/story/123/results',date='Fri, 23 Oct 26 10:00:00 +0500')=>`<item><title>${title}</title><link>${link}</link><pubDate>${date}</pubDate></item>`;
const rss=items=>`<rss><channel>${items}</channel></rss>`;
test('publisher URLs strip tracking and fragments, reject credential URLs and malformed article routes',()=>{
 const a=parseNewsFeed(rss(item('Results','https://www.tribune.com.pk/story/123/results?utm_source=share#comments')),'TRIBUNE',now)[0];assert.equal(a.link,'https://tribune.com.pk/story/123/results');
 for(const link of ['https://user:password@tribune.com.pk/story/123/results','https://tribune.com.pk/story/123evil','https://tribune.com.pk:444/story/123/results','https://example.com/story/123/results','javascript:alert(1)'])assert.deepEqual(parseNewsFeed(rss(item('Results',link)),'TRIBUNE',now),[]);
});
test('recent feed rejects old, future and timezone-less dates; older headline labels use publisher time',()=>{
 for(const date of ['Thu, 01 Oct 26 10:00:00 +0500','Sat, 24 Oct 26 10:00:00 +0500','Fri, 23 Oct 26 10:00:00'])assert.deepEqual(parseNewsFeed(rss(item('Results',undefined,date)),'TRIBUNE',now),[]);
 const a=parseNewsFeed(rss(item('Results',undefined,'Mon, 19 Oct 26 10:00:00 +0500')),'TRIBUNE',now)[0];assert.equal(newsIsOlder(a.publishedAt,now),true);assert.match(newsDateLabel('2026-10-22T21:00:00Z'),/23 Oct 2026.*02:00 PKT/);
});
test('article identity and same-publisher repeated titles deduplicate without merging independent publisher coverage',()=>{
 const rows=parseNewsFeed(rss(item()+item('New slug','https://tribune.com.pk/story/123/new-slug')+item('Pakistan Refinery announces results!','https://tribune.com.pk/story/456/results')),'TRIBUNE',now);assert.equal(rows.length,1);
 const a=parseNewsFeed(rss(item()),'TRIBUNE',now)[0];assert.equal(mergeNews([a,{...a,id:'dawn',link:'https://www.dawn.com/news/456/results',source:'DAWN'}]).length,2);
});
test('stock relevance requires company names or explicit ticker notation, never generic words or symbol substrings',()=>{
 const articles=['Power shortages hit Pakistan (power)','Hub Power announces results','Lucky Cementation starts work','Lucky Cement expands plant','Investors get lucky today','PSX:LUCK results','(PRL) payout notice','Pakistan Refinery schedules meeting'].map((title,i)=>({title,id:String(i),link:'https://tribune.com.pk/story/'+i,publishedAt:new Date(now).toISOString(),summary:'',source:'TRIBUNE'}));
 assert.deepEqual(companyNews(articles,{symbol:'HUBC',name:'The Hub Power Company Limited'}).map(a=>a.title),['Hub Power announces results']);
 assert.deepEqual(companyNews(articles,{symbol:'LUCK',name:'Lucky Cement Limited'}).map(a=>a.title),['Lucky Cement expands plant','PSX:LUCK results']);
 assert.deepEqual(companyNews(articles,{symbol:'PRL',name:'Pakistan Refinery Limited'}).map(a=>a.title),['(PRL) payout notice','Pakistan Refinery schedules meeting']);
 assert.equal(companyNews(articles,{symbol:'POWER',name:'POWER'}).length,0);
 assert.equal(companyNews([{...articles[0],title:'PTCL Group posts profit'}],{symbol:'PTC',name:'Pakistan Telecommunication Company Limited'}).length,1);
});
test('feed failures and malformed HTML remain visible while a healthy publisher continues to supply headlines',async()=>{
 const original=global.fetch;try{global.fetch=async url=>String(url).includes('dawn')?new Response('Blocked',{status:403}):new Response(rss(item('Results',undefined,new Date().toUTCString())));let s=await load('news-feed').fetchNewsSnapshot();assert.equal(s.available,true);assert.equal(s.statuses[0].status,'unavailable');assert.equal(s.statuses[1].status,'available');
 global.fetch=async()=>new Response('<html>Just a moment</html>');s=await load('news-feed').fetchNewsSnapshot();assert.deepEqual(s.articles,[]);assert.ok(s.statuses.every(p=>p.status==='unavailable'));
 global.fetch=async()=>new Response(rss(''));s=await load('news-feed').fetchNewsSnapshot();assert.ok(s.statuses.every(p=>p.status==='no-recent-headlines'));
 }finally{global.fetch=original;}
});


test('publisher RSS descriptions become clean plain-text previews without executable markup',()=>{
 const entry=item().replace('</item>','<description><![CDATA[<p>Regulator approves <b>new rules</b> &amp; relief for Pakistan&#39;s exporters.</p><script>bad()</script>]]></description></item>');
 const [article]=parseNewsFeed(rss(entry),'TRIBUNE',now);
 assert.equal(article.summary,"Regulator approves new rules & relief for Pakistan's exporters.");assert.ok(!article.summary.includes('<'));
});
test('missing or repeated descriptions use only the publisher opening paragraph, with a 45-word cap',()=>{
 const {newsPreview}=load('news-summary');
 assert.equal(newsPreview('Headline','<p>Company earnings increased following higher sales this quarter.</p><p>Do not republish this body.</p>','Headline'),'Company earnings increased following higher sales this quarter.');
 const long=Array.from({length:90},(_,i)=>'word'+i).join(' ');const preview=newsPreview('',long+'\n\nOther paragraphs','Headline');assert.equal(preview.split(' ').length,45);assert.ok(preview.endsWith('…'));assert.ok(!preview.includes('word45'));
 assert.equal(newsPreview('','','Headline'),'');assert.equal(newsPreview('Headline','Headline','Headline'),'');
});
test('content encoded fallback is attached to its own article and does not alter publisher identity or date',()=>{
 const entry=item().replace('</item>','<content:encoded><![CDATA[<p>Refinery earnings improved following an increase in production.</p><p>More body text.</p>]]></content:encoded></item>');
 const [article]=parseNewsFeed(rss(entry),'TRIBUNE',now);assert.equal(article.summary,'Refinery earnings improved following an increase in production.');assert.equal(article.source,'TRIBUNE');assert.equal(article.publishedAt,'2026-10-23T05:00:00.000Z');
});

test('escaped publisher widgets, captions and CSS never appear in previews',()=>{
 const {newsPreview}=load('news-summary');
 const html='<div><script type="text/plain"><div>Chart widget</div><style>.fpw-root { color: red; }</style></script></div><figure>Photo caption</figure><p>Government revised fuel prices following the latest review of international oil markets.</p>';
 const escaped=html.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 assert.equal(newsPreview(escaped,'','Fuel prices'),'Government revised fuel prices following the latest review of international oil markets.');
});

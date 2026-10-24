const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const file=path.resolve(__dirname,'../src/components/SentimentGauge.tsx'),m=new Module(file,module);m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);const Gauge=m.exports.default;
test('gauge pointer stays within its viewBox and retains visible width at both endpoints',()=>{
 for(const score of [0,23,50,75,100]){
  const html=renderToStaticMarkup(React.createElement(Gauge,{score,sentiment:'Test'}));
  assert.ok(!html.includes('rotate('));assert.match(html,new RegExp('Test: '+score+' out of 100'));
  const d=html.match(/d="([^"]+)" class="gauge-needle"/)[1],n=d.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number);assert.equal(n.length,6);
  for(let i=0;i<n.length;i+=2){assert.ok(n[i]>=0&&n[i]<=360);assert.ok(n[i+1]>=0&&n[i+1]<=218);}
  const area=Math.abs((n[2]-n[0])*(n[5]-n[1])-(n[4]-n[0])*(n[3]-n[1]))/2;assert.ok(area>400);
  if(score===0)assert.ok(n[2]<180&&Math.abs(n[3]-180)<.001);if(score===50)assert.ok(Math.abs(n[2]-180)<.001&&n[3]<180);if(score===100)assert.ok(n[2]>180&&Math.abs(n[3]-180)<.001);
 }
});

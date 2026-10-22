const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
function load(file) {
  const name=path.resolve(__dirname,'../src/'+file+'.ts');
  const m=new Module(name,module);m.filename=name;m.paths=module.paths;
  m.require=id=>id==='@/lib/account-data-owner'?load('lib/account-data-owner'):Module.prototype.require.call(m,id);
  m._compile(ts.transpileModule(fs.readFileSync(name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,name);return m.exports;
}
const {POST}=load('app/api/account-link/route');
const owner='o1LCsgPhCwSWPONPUT2AQzOl20H2';
function token(uid,overrides={}) {return 'header.'+Buffer.from(JSON.stringify({aud:'zaloon-aecb6',iss:'https://securetoken.google.com/zaloon-aecb6',sub:uid,iat:Math.floor(Date.now()/1000)-10,exp:Math.floor(Date.now()/1000)+3600,...overrides})).toString('base64url')+'.signature';}
function request(value,body={}) {return new Request('https://www.daulatinvest.com/api/account-link',{method:'POST',headers:value?{Authorization:'Bearer '+value}:{},body:JSON.stringify(body)});}
function mock(t,handler){const original=global.fetch;global.fetch=handler;t.after(()=>{global.fetch=original;});}
const account=uid=>({localId:uid,emailVerified:true,providerUserInfo:[{providerId:'google.com'}]});
test('account endpoint rejects missing, expired, malformed and other-project tokens before lookup',async t=>{
  mock(t,()=>{throw new Error('Lookup must not occur');});
  for(const value of [null,'invalid',token(owner,{aud:'foreign-project'}),token(owner,{exp:1}),token(owner,{iss:'foreign-issuer'}),token(owner,{iat:Date.now()/1000+1000})])assert.equal((await POST(request(value))).status,401);
});
test('decoded claims alone never authorize an account: Firebase must accept the token',async t=>{
  mock(t,async()=>Response.json({error:{message:'INVALID_ID_TOKEN'}},{status:400}));
  assert.equal((await POST(request(token(owner)))).status,401);
});
test('both clients receive the approved owner after Firebase verification; caller cannot choose a UID',async t=>{
  mock(t,async(url,options)=>{assert.match(url,/^https:\/\/identitytoolkit.googleapis.com\/v1\/accounts:lookup/);assert.equal(JSON.parse(options.body).idToken,token(owner));return Response.json({users:[account(owner)]});});
  const response=await POST(request(token(owner),{dataOwnerUid:'someone-else',uid:'someone-else'}));
  assert.deepEqual(await response.json(),{uid:owner,dataOwnerUid:'google_2094052383',legacyLinked:true});
  assert.equal(response.headers.get('cache-control'),'private, no-store');
});
test('new verified users stay in their own namespace; unavailable service does not silently change owner',async t=>{
  mock(t,async()=>Response.json({users:[account('new-user')]}));
  assert.deepEqual(await (await POST(request(token('new-user')))).json(),{uid:'new-user',dataOwnerUid:'new-user',legacyLinked:false});
  global.fetch=async()=>{throw new Error('network failure with private diagnostic');};
  const response=await POST(request(token(owner)));assert.equal(response.status,503);assert.ok(!(await response.text()).includes('private diagnostic'));
});
test('disabled accounts and mismatched Firebase identity cannot use a link',async t=>{
  mock(t,async()=>Response.json({users:[{...account(owner),disabled:true}]}));
  assert.equal((await POST(request(token(owner)))).status,401);
  global.fetch=async()=>Response.json({users:[account('another-user')]});
  assert.equal((await POST(request(token(owner)))).status,401);
});

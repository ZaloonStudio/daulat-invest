const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function harness() {
  const counts = { parses: 0, watchRequests: 0 };
  let unavailable = false;
  const modules = new Map();
  function load(name) {
    if (modules.has(name)) return modules.get(name).exports;
    const file = path.resolve(__dirname, '../src/lib/' + name + '.ts');
    const m = new Module(file, module);
    m.filename = file;
    m.paths = module.paths;
    modules.set(name, m);
    m.require = id => {
      if (id === 'react') return { cache: fn => fn };
      // Model successful-result caching. Rejections must never replace a successful value.
      if (id === 'next/cache') return { unstable_cache: fn => {
        let saved;
        return async () => {
          if (saved !== undefined) return saved;
          saved = await fn();
          return saved;
        };
      } };
      if (id === './market-source') {
        const parser = load('market-source');
        return { ...parser, parseMarketWatch: (...args) => {
          counts.parses++;
          return parser.parseMarketWatch(...args);
        } };
      }
      return id.startsWith('./') ? load(id.slice(2)) : require(id);
    };
    m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText, file);
    return m.exports;
  }
  const fixture = file => fs.readFileSync(path.join(__dirname, 'fixtures', file), 'utf8');
  const fetch = async url => {
    const pathname = new URL(url).pathname;
    if (pathname === '/market-watch') counts.watchRequests++;
    const files = { '/market-watch': 'psx-quotes.html', '/screener': 'psx-screener.html', '/trading-panel': 'psx-panel.html' };
    return { ok: !unavailable, text: async () => pathname === '/' ? '"_k":"test-session"' : fixture(files[pathname]) };
  };
  return { api: load('psx'), fetch, counts, fail: value => { unavailable = value; } };
}

test('market snapshots reuse parsed results across callers and retain source prices', async () => {
  const h = harness();
  const original = global.fetch;
  global.fetch = h.fetch;
  try {
    const first = await h.api.fetchMarketWatch();
    const second = await h.api.fetchMarketWatch();
    assert.equal(first[0].current, 95.12);
    assert.deepEqual(second, first);
    assert.equal(h.counts.parses, 1);
    assert.equal(h.counts.watchRequests, 1);
    await h.api.fetchMarketWatch(true);
    assert.equal(h.counts.watchRequests, 2);
    assert.equal(h.counts.parses, 2);
  } finally { global.fetch = original; }
});

test('a failed cold snapshot can recover instead of caching an empty market', async () => {
  const h = harness();
  const original = global.fetch;
  global.fetch = h.fetch;
  try {
    h.fail(true);
    assert.deepEqual(await h.api.fetchMarketWatch(), []);
    h.fail(false);
    assert.equal((await h.api.fetchMarketWatch())[0].symbol, 'PRL');
    assert.equal(h.counts.watchRequests, 2);
  } finally { global.fetch = original; }
});

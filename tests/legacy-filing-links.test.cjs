const test = require('node:test');
const assert = require('node:assert/strict');
const {match, compile} = require('next/dist/compiled/path-to-regexp');

test('legacy filing URLs preserve the PSX document and attachment identity', async () => {
  const config = (await import('../next.config.mjs')).default;
  const redirects = await config.redirects();
  const destination = path => {
    for (const rule of redirects) {
      const result = match(rule.source)(path);
      if (result) {
        const external = rule.destination.startsWith('https://') ? new URL(rule.destination) : null;
        const path = compile(external ? external.pathname : rule.destination)(result.params);
        return {url: (external ? external.origin : '') + path, permanent: rule.permanent};
      }
    }
  };
  assert.deepEqual(destination('/download/document/229387.pdf'), {url:'https://dps.psx.com.pk/download/document/229387.pdf',permanent:true});
  assert.deepEqual(destination('/download/attachment/252681-1.pdf'), {url:'https://dps.psx.com.pk/download/attachment/252681-1.pdf',permanent:true});
  assert.deepEqual(destination('/stocks/NBP-FUNDS'), {url:'/mutual-funds',permanent:true});
  for (const invalid of ['/download/document/evil.com.pdf','/download/attachment/example.pdf','/download/document/123.html']) assert.equal(destination(invalid), undefined);
});

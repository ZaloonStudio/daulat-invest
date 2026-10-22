import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = '.next/server/app';
const files = fs.readdirSync(root, { recursive: true }).filter(p => p.endsWith('.html') && !p.includes('_not-found'));
const titles = new Set();
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if (file === '404.html' || file === '500.html') continue;
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title, file + ': missing title');
  assert.ok(!titles.has(title), file + ': duplicate title'); titles.add(title);
  assert.match(html, /name="description" content="[^"]+"/, file + ': description');
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(new URL(canonical).origin, 'https://www.daulatinvest.com', file + ': canonical domain');
  const route = file === 'index.html' ? '/' : '/' + file.replace(/\\/g, '/').replace(/\.html$/, '');
  assert.equal(new URL(canonical).pathname, route, file + ': canonical path');
  const privatePage = ['portfolio.html', 'watchlist.html'].includes(file);
  assert.equal(/name="robots" content="noindex, follow"/.test(html), privatePage, file + ': indexing');
  assert.match(html, /name="twitter:card" content="summary_large_image"/, file + ': social preview');
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
}
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml.body'), 'utf8');
assert.ok(!/\/(portfolio|watchlist)<\/loc>/.test(sitemap));
assert.ok(!sitemap.includes('<lastmod>'));
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
assert.equal(new Set(urls).size, urls.length);
assert.ok(urls.some(url => url.endsWith('/stocks/KEL')), 'Stock URLs missing');
console.log('SEO HTML checks passed for ' + titles.size + ' pages and ' + urls.length + ' sitemap URLs.');

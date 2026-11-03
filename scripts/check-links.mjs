#!/usr/bin/env node
// Post-build check: every internal link/image in dist/ resolves, and every
// historical URL in scripts/legacy-urls.txt still exists (as a page or redirect).
//
// Usage: npm run build && npm run check
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
if (!fs.existsSync(DIST)) { console.error('dist/ not found: run `npm run build` first'); process.exit(1); }

const exists = (url) => {
  const p = decodeURIComponent(url.split('#')[0].split('?')[0]);
  const f = path.join(DIST, p);
  return (fs.existsSync(f) && fs.statSync(f).isFile()) || fs.existsSync(path.join(f, 'index.html'));
};

const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const broken = new Map();
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  for (const [, url] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    if (!exists(url)) broken.set(url, [...(broken.get(url) || []), '/' + path.relative(DIST, f)]);
  }
}

const legacy = fs.readFileSync(path.join(ROOT, 'scripts/legacy-urls.txt'), 'utf8').split('\n').filter(Boolean);
const missingLegacy = legacy.filter((u) => !exists(u));

let failed = false;
for (const [url, from] of broken) {
  failed = true;
  console.log(`BROKEN  ${url}  <- ${from.slice(0, 3).join(', ')}`);
}
for (const u of missingLegacy) { failed = true; console.log(`LEGACY URL GONE  ${u}`); }
console.log(`${htmlFiles.length} pages checked, ${legacy.length} legacy URLs checked.`);
process.exit(failed ? 1 : 0);

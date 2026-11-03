#!/usr/bin/env node
// Import the pages of the static WordPress archive (docs/) into Astro content.
// Each page's .entry-content is converted to Markdown; URLs stay the same.
//
// Usage: node scripts/import-wp-pages.mjs
import fs from 'node:fs';
import path from 'node:path';
import { cleanHtml, htmlToMarkdown, plainText, yq } from './lib/html-to-md.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DOCS = path.join(ROOT, 'docs');

const PAGES = [
  // The home page ('/') is hand-maintained in src/content/pages/home.md since 2026-11-03.
  { url: '/bureau-of-magical-mischief/', collection: 'pages' },
  { url: '/chosen-family-tree/', collection: 'pages' },
  { url: '/dna-visualization/', collection: 'pages' },
  { url: '/generative-art-1-fractal-plant-landscape/', collection: 'pages' },
  { url: '/flat-flip-friends/', collection: 'pages' },
  {
    url: '/2022/04/21/committing-code-best-practices/', collection: 'blog', slug: 'committing-code-best-practices',
    extra: ['pubDate: 2022-04-21', 'tags: ["howto", "programming", "tips"]',
      'legacy:', '  drupalNid: 35', '  originalDrupalDate: 2015-04-09', '  source: "wordpress"'],
  },
];

const decode = (s) => cleanHtml(s).body.textContent;

for (const p of PAGES) {
  const file = path.join(DOCS, p.url, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const m = /<div class="entry-content">([\s\S]*?)<\/div><!-- \.entry-content -->/.exec(html);
  if (!m) throw new Error(`no entry-content in ${file}`);
  const title = p.title || decode(/<h1 class="entry-title">([\s\S]*?)<\/h1>/.exec(html)[1]).trim();
  const base = new URL(p.url, 'https://wegeekout.com');
  const rewriteUrl = (u) => {
    if (/^(mailto:|#)/.test(u)) return u;
    const abs = new URL(u, base);
    if (abs.host !== 'wegeekout.com') return u;
    // WordPress resized copies (-1024x767.jpg) are what the page showed; keep them.
    return abs.pathname + abs.search + abs.hash;
  };
  const { body } = cleanHtml(m[1], { rewriteUrl });
  let md = htmlToMarkdown(body);
  for (const [find, repl] of p.edits || []) {
    if (md.split(find).length !== 2) throw new Error(`${p.url}: edit target not found exactly once: ${find}`);
    md = md.replace(find, () => repl);
  }
  const slug = p.slug || p.url.replace(/^\/|\/$/g, '');
  const fm = ['---', `title: ${yq(title)}`, `path: ${yq(p.url)}`, `description: ${yq(plainText(body))}`,
    ...(p.extra || []), ...(p.collection === 'blog' ? ['draft: false'] : []), '---', ''].join('\n');
  const out = path.join(ROOT, 'src/content', p.collection, `${slug}.md`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, fm + md);
  console.log(`${p.url} -> ${path.relative(ROOT, out)}`);
}

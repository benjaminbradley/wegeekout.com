#!/usr/bin/env node
// Import Drupal 6 nodes into Astro content collections.
//
// Reads the SQLite copy of the dump (made by scripts/load_mysql_dump.py) and writes:
//   src/content/blog/<slug>.md     blog posts (unpublished ones get draft: true)
//   src/content/pages/<slug>.md    Drupal pages (all draft: true, pending review)
//   src/data/drupal.json           tag URLs and legacy redirects
//
// Usage: node scripts/migrate-drupal.mjs [.work/d6.sqlite]
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { drupalAutop, drupalFilterHtml, cleanHtml, htmlToMarkdown, plainText, yq } from './lib/html-to-md.mjs';

const DB = process.argv[2] || '.work/d6.sqlite';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TZ = 'America/Chicago';

// Decisions from planning/01-intake-review.md
const SKIP = {
  21: 'Availability page: removed (exposed personal calendars). Old URL redirects to /contact-me/.',
  35: 'Committing code: the 2022 WordPress version is newer and is imported from docs/ instead.',
};
// Drafts reviewed 2026-11-03 (planning/02-build-and-review.md).
const PURGE = {
  31: 'Next Economy Conference: incomplete draft, purged.',
  37: 'freedom and responsibility: incomplete draft, purged.',
  36: 'Website TODO page: dropped (2026-11-03).',
  38: 'Personal Dashboard mockup page: dropped (2026-11-03).',
  1: 'Welcome page: its text now opens the home page, src/content/pages/home.md (2026-11-03).',
};
// Unpublished on Drupal, published now. Original dates kept. These were never
// shown publicly, so Drupal's "Filtered HTML" stripping (which removed the
// author's blockquotes/line structure) is skipped to keep the intended formatting.
const PUBLISH_DRAFTS = new Set([4, 10, 17, 25, 30]);
const DRAFT_NOTE = '\n---\n\n*This post was originally left as an unpublished draft. Published as work-in-progress in November 2026 for historical reference.*\n';
// Join one-<div>-per-line drafts into flowing paragraphs instead of line breaks.
const DIV_JOIN_SPACE = new Set([25]);

// Per-post Markdown edits after conversion: [find, replace] pairs, each must match once.
const MD_EDITS = {
  25: [
    ['biomimicry \\[TODO: link TED\\]', '[biomimicry](https://www.ted.com/talks/janine_benyus_biomimicry_s_surprising_lessons_from_nature_s_engineers)'],
    ['mirror neurons \\[TODO: link\\]', '[mirror neurons](https://www.ted.com/talks/vilayanur_ramachandran_the_neurons_that_shaped_civilization)'],
  ],
  30: [
    // Unfinished sentences completed 2026-11 (review before commit).
    ['Using public key encryption, we\n',
     'Using public key encryption, we lock the whole list with a single key that only we hold, protected by one strong passphrase.\n'],
    ['You probably will not remember your passwords after a few\n',
     'You probably will not remember your passwords after a few minutes, but after typing them a handful of times they stick, because a silly pair like "logical feta" is much easier to recall than a string of random characters.\n'],
  ],
};

const REDIRECT_OVERRIDES = {
  '/content/benjamins-availability': '/contact-me/',
  '/content/welcome-we-geek-out': '/',
  '/node/1': '/',
  '/content/committing-code-best-practices': '/2022/04/21/committing-code-best-practices/',
};

// Per-post HTML fixes applied before conversion (keyed by nid).
const FIXUPS = {
  // Pasted Gmail header table -> a simple quoted e-mail block. Hidden Gmail
  // attributes (which leaked the real mail server name) are dropped too.
  // The spammer's domain is replaced with example.com and the IP redacted
  // (user decision 2026-11-03); the username stays because the post discusses it.
  11: (html) => html.replace(/<div style="background-color: #cacaca;">[\s\S]*?<\/p>\s*<\/div>/,
    `<blockquote class="email"><p><strong>from</strong> mailer-daemon@my-server<br><strong>to</strong> benjamin@benjamins-computer<br><strong>date</strong> Fri, Jun 10, 2011 at 11:59 PM<br><strong>subject</strong> WARNING: delayed mail.</p>
<pre>Diagnostic information is provided below for each recipient.  If copies of
this message were sent to additional recipients, deliveries to those
addresses are not included in this notice.  This is an advisory notice for
the following addresses only:

&lt;judyoco7y@example.com&gt;:
   mail.example.com [IP redacted]:
&gt;&gt;&gt; STARTTLS
&lt;&lt;&lt; 454 TLS currently unavailable

---------------------------------------------------------------------------</pre></blockquote>`),
};

const db = new DatabaseSync(path.resolve(DB), { readOnly: true });
const all = (sql, ...a) => db.prepare(sql).all(...a);
const get = (sql, ...a) => db.prepare(sql).get(...a);

const allowed = (() => {
  const v = get(`select value from variable where name='allowed_html_1'`).value;
  return [...v.matchAll(/<(\w+)>/g)].map((m) => m[1].toLowerCase());
})();

// Path for every node, so internal links and redirects resolve.
// Drupal 6 used the newest alias (highest pid) as a node's URL; older aliases still resolved.
const nodePath = {};
const oldAliases = [];
for (const r of all(`select src, dst from url_alias where src like 'node/%' order by pid`)) {
  const nid = r.src.slice(5);
  if (nodePath[nid] && nodePath[nid] !== `/${r.dst}/`) oldAliases.push([nid, nodePath[nid]]);
  nodePath[nid] = `/${r.dst}/`;
}

// Dead external links -> closest Wayback Machine copy (from scripts/wayback-fetch.sh,
// reviewed 2026-11-03). Links still live, or never archived, are left alone.
const ARCHIVED = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/archived-links.json'), 'utf8'));

// Hotlinked images from dead sites -> local copies, once wayback-fetch.sh has recovered them.
const LOCAL_COPIES = {
  'http://www.reactiongifs.com/r/lkrwtf.gif': '/images/blog/how-merge-traffic-right-way/lkrwtf.gif',
};

function rewriteUrl(u) {
  if (LOCAL_COPIES[u] && fs.existsSync(path.join(ROOT, 'public', LOCAL_COPIES[u]))) return LOCAL_COPIES[u];
  if (ARCHIVED[u]) return ARCHIVED[u];
  let m = /^(?:https?:\/\/(?:www\.)?wegeekout\.com)?\/(content\/[^?#]+?)\/?$/.exec(u);
  if (m) return REDIRECT_OVERRIDES[`/${m[1]}`] || `/${m[1]}/`;
  m = /^(?:https?:\/\/(?:www\.)?wegeekout\.com)?\/node\/(\d+)$/.exec(u);
  if (m && nodePath[m[1]]) return nodePath[m[1]];
  m = /^(?:https?:\/\/(?:www\.)?wegeekout\.com)?(\/sites\/wegeekout\.com\/files\/.+)$/.exec(u);
  if (m) return encodeURI(decodeURI(m[1]));
  return u;
}

function isoLocal(ts) {
  // e.g. 2011-02-07T20:19:01-06:00 in America/Chicago
  const d = new Date(ts * 1000);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZoneName: 'longOffset',
  }).formatToParts(d).map((p) => [p.type, p.value]));
  const off = parts.timeZoneName.replace('GMT', '') || '+00:00';
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${off}`;
}

function convert(html, format, { filter = true, divJoin = 'br' } = {}) {
  if (format === 1 && filter) html = drupalFilterHtml(html, allowed);
  html = html.replace(/\r\n?/g, '\n');
  html = drupalAutop(html);
  return cleanHtml(html, { linkify: true, rewriteUrl, divJoin });
}

const tagPath = {};
for (const r of all(`select t.name, a.dst from term_data t join url_alias a on a.src = 'taxonomy/term/' || t.tid where t.vid = 1`)) tagPath[r.name] = `/${r.dst}/`;

const outDirs = { blog: path.join(ROOT, 'src/content/blog'), page: path.join(ROOT, 'src/content/pages') };
for (const d of Object.values(outDirs)) fs.mkdirSync(d, { recursive: true });

const report = [];
const redirects = { ...REDIRECT_OVERRIDES, '/blogs/benjamin': '/blog/', '/blogs/geeks': '/blog/', '/blog': '/blog/' };
const usedTags = new Set();

for (const n of all(`select n.nid, n.type, n.status, n.title, n.created, n.changed, r.body, r.format
                     from node n join node_revisions r on r.vid = n.vid order by n.created`)) {
  const p = nodePath[n.nid];
  const slug = p.replace(/^\/content\//, '').replace(/\/$/, '');
  if (PURGE[n.nid]) fs.rmSync(path.join(outDirs[n.type === 'blog' ? 'blog' : 'page'], `${slug}.md`), { force: true });
  const skip = SKIP[n.nid] || PURGE[n.nid];
  if (skip) { report.push({ nid: n.nid, title: n.title, skipped: skip }); continue; }
  const publishNow = PUBLISH_DRAFTS.has(n.nid);
  const published = !!n.status || publishNow;
  let html = n.body;
  if (FIXUPS[n.nid]) {
    const before = html;
    html = FIXUPS[n.nid](html);
    if (html === before) throw new Error(`fixup for node ${n.nid} did not apply`);
  }
  const { body, notes } = convert(html, n.format, { filter: !publishNow, divJoin: DIV_JOIN_SPACE.has(n.nid) ? 'space' : 'br' });
  let md = htmlToMarkdown(body);
  for (const [find, repl] of MD_EDITS[n.nid] || []) {
    if (md.split(find).length !== 2) throw new Error(`node ${n.nid}: edit target not found exactly once: ${find}`);
    md = md.replace(find, () => repl);
  }

  // CCK "References" field (image credits), shown with the post on the old site.
  const ref = get(`select field_references_value v, field_references_format f from content_type_blog where nid = ? and vid = (select vid from node where nid = ?)`, n.nid, n.nid);
  if (ref?.v) md += `\n### References\n\n${htmlToMarkdown(convert(ref.v, ref.f).body)}`;
  if (publishNow) md += DRAFT_NOTE;

  const terms = all(`select t.name, t.vid from term_node tn join term_data t on t.tid = tn.tid
                     where tn.vid = (select vid from node where nid = ?) order by t.name`, n.nid);
  const tags = terms.filter((t) => t.vid === 1).map((t) => t.name);
  const stage = terms.find((t) => t.vid === 2)?.name;
  if (published) tags.forEach((t) => usedTags.add(t));

  const missingImages = [...md.matchAll(/(\/sites\/wegeekout\.com\/files\/[^")\s]+)/g)]
    .map((m) => m[1]).filter((src) => !fs.existsSync(path.join(ROOT, 'public', decodeURI(src))));

  const fm = [
    '---',
    `title: ${yq(n.title)}`,
    `pubDate: ${isoLocal(n.created)}`,
    ...(n.changed - n.created > 86400 ? [`updatedDate: ${isoLocal(n.changed)}`] : []),
    `path: ${yq(p)}`,
    `description: ${yq(plainText(body))}`,
    ...(n.type === 'blog' ? [`tags: [${tags.map(yq).join(', ')}]`] : []),
    `draft: ${n.type === 'page' || !published}`,
    'legacy:',
    `  drupalNid: ${n.nid}`,
    `  publishedOnDrupal: ${!!n.status}`,
    ...(publishNow ? ['  publishedFromDraft: 2026-11-03'] : []),
    ...(stage ? [`  draftStage: ${yq(stage)}`] : []),
    '---',
    '',
  ].join('\n');
  const file = path.join(outDirs[n.type === 'blog' ? 'blog' : 'page'], `${slug}.md`);
  fs.writeFileSync(file, fm + md);
  const built = n.type === 'blog' && published; // pages are drafts pending review
  if (built) {
    redirects[`/node/${n.nid}`] = p;
    for (const [nid, old] of oldAliases) if (+nid === n.nid && old !== p) redirects[old.replace(/\/$/, '')] = p;
  }
  report.push({ nid: n.nid, title: n.title, file: path.relative(ROOT, file), published, notes, missingImages });
}

const tags = Object.fromEntries([...usedTags].sort().map((t) => [t, tagPath[t] || `/category/tags/${t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`]));
fs.mkdirSync(path.join(ROOT, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/data/drupal.json'), JSON.stringify({ tags, redirects }, null, 2) + '\n');
fs.mkdirSync(path.join(ROOT, '.work'), { recursive: true });
fs.writeFileSync(path.join(ROOT, '.work/drupal-import-report.json'), JSON.stringify(report, null, 2));
for (const r of report) {
  const flags = [r.skipped && 'SKIPPED', r.published === false && 'draft', r.missingImages?.length && `${r.missingImages.length} missing img`, r.notes?.length && `${r.notes.length} notes`].filter(Boolean);
  console.log(`${String(r.nid).padStart(3)}  ${r.title.slice(0, 60).padEnd(60)} ${flags.join(', ')}`);
}

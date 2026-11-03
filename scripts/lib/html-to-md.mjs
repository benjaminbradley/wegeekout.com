// Shared HTML -> Markdown conversion for the Drupal and WordPress imports.
//
// Goal: keep each post looking the way it did (paragraphs, line breaks, floated
// images, tables, code), but as clean Markdown. Anything Markdown can't express
// (floats, image sizes, tables, iframes, small print) is kept as minimal raw HTML
// that the site CSS styles.
import domino from '@mixmark-io/domino';
import TurndownService from 'turndown';

// ---------------------------------------------------------------------------
// Drupal 6 filters, ported from filter.module so old posts render the same.

const BLOCK = '(?:table|thead|tfoot|caption|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre|select|form|blockquote|address|p|h[1-6]|hr)';

// Port of Drupal 6 _filter_autop (the "Line break converter").
export function drupalAutop(text) {
  const chunks = text.split(/(<\/?(?:pre|script|style|object)[^>]*>)/i);
  let ignore = false;
  let ignoretag = '';
  let out = '';
  chunks.forEach((chunk, i) => {
    if (i % 2) {
      const open = chunk[1] !== '/';
      const tag = chunk.slice(open ? 1 : 2).split(/[ >]/)[0].toLowerCase();
      if (!ignore) {
        if (open) { ignore = true; ignoretag = tag; }
      } else if (!open && ignoretag === tag) {
        ignore = false; ignoretag = '';
      }
    } else if (!ignore) {
      chunk = chunk.replace(/\n*$/, '') + '\n\n';
      chunk = chunk.replace(/<br \/>\s*<br \/>/g, '\n\n');
      chunk = chunk.replace(new RegExp(`(<${BLOCK}[^>]*>)`, 'g'), '\n$1');
      chunk = chunk.replace(new RegExp(`(</${BLOCK}>)`, 'g'), '$1\n\n');
      chunk = chunk.replace(/\n\n+/g, '\n\n');
      chunk = chunk.replace(/\n?([\s\S]+?)(?:\n\s*\n|$(?![\s\S]))/g, '<p>$1</p>\n');
      chunk = chunk.replace(/<p>\s*<\/p>\n/g, '');
      chunk = chunk.replace(/<p>(<li[\s\S]+?)<\/p>/g, '$1');
      chunk = chunk.replace(/<p><blockquote([^>]*)>/gi, '<blockquote$1><p>');
      chunk = chunk.split('</blockquote></p>').join('</p></blockquote>');
      chunk = chunk.replace(new RegExp(`<p>\\s*(</?${BLOCK}[^>]*>)`, 'g'), '$1');
      chunk = chunk.replace(new RegExp(`(</?${BLOCK}[^>]*>)\\s*</p>`, 'g'), '$1');
      chunk = chunk.replace(/(?<!<br \/>)\s*\n/g, '<br />\n');
      chunk = chunk.replace(new RegExp(`(</?${BLOCK}[^>]*>)\\s*<br />`, 'g'), '$1');
      chunk = chunk.replace(/<br \/>(\s*<\/?(?:p|li|div|th|pre|td|ul|ol)>)/g, '$1');
    }
    out += chunk;
  });
  return out;
}

// Drupal "Filtered HTML": tags outside the allow-list were stripped (content kept).
export function drupalFilterHtml(text, allowed) {
  return text.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (tag, name) =>
    allowed.includes(name.toLowerCase()) ? tag : '');
}

// ---------------------------------------------------------------------------
// DOM cleanup

const INLINE = new Set(['A', 'ABBR', 'B', 'BR', 'CITE', 'CODE', 'EM', 'I', 'IMG', 'KBD', 'MARK',
  'S', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TT', 'U', 'WBR', 'FONT', 'STRIKE', 'DEL', 'INS']);
const KEEP_ATTRS = {
  A: ['href', 'title'],
  IMG: ['src', 'alt', 'width', 'height', 'title', 'class'],
  TD: ['colspan', 'rowspan'], TH: ['colspan', 'rowspan'],
  IFRAME: ['src', 'width', 'height', 'title', 'allowfullscreen'],
  ABBR: ['title'],
  SPAN: ['class'], P: ['class'], PRE: ['class'], DIV: ['class'], TABLE: ['class'],
};

const $$ = (root, sel) => Array.from(root.querySelectorAll(sel));

const isBlank = (n) =>
  n.nodeType === 3 ? !n.data.replace(/[\s\u00a0]/g, '') :
  n.nodeType === 8 ? true :
  n.nodeName === 'BR' ? true :
  n.nodeType === 1 && n.nodeName !== 'IMG' && n.nodeName !== 'IFRAME' &&
    !n.querySelector('img,iframe') && !n.textContent.replace(/[\s\u00a0]/g, '');

const hasBlockChild = (el) => Array.from(el.childNodes).some((c) => c.nodeType === 1 && !INLINE.has(c.nodeName));

function unwrap(el) {
  while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
  el.remove();
}

function rename(el, name) {
  const doc = el.ownerDocument;
  const n = doc.createElement(name);
  for (const a of Array.from(el.attributes)) n.setAttribute(a.name, a.value);
  while (el.firstChild) n.appendChild(el.firstChild);
  el.replaceWith(n);
  return n;
}

function parseStyle(s) {
  const o = {};
  for (const part of (s || '').split(';')) {
    const i = part.indexOf(':');
    if (i > 0) o[part.slice(0, i).trim().toLowerCase()] = part.slice(i + 1).trim();
  }
  return o;
}

// Collapse "one <div> per line" layouts into paragraphs. An empty div is a
// paragraph gap; consecutive non-empty divs are lines joined by <br>.
function divLinesToParagraphs(container, doc, join = 'br') {
  let changed = true;
  while (changed) { // unwrap divs that only wrap block content
    changed = false;
    for (const d of Array.from($$(container, 'div'))) {
      if (hasBlockChild(d) && !d.className) { unwrap(d); changed = true; }
    }
  }
  const parents = new Set(Array.from($$(container, 'div')).map((d) => d.parentNode));
  for (const parent of parents) {
    let p = null;
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === 1 && child.nodeName === 'DIV' && !child.className) {
        if (isBlank(child)) { child.remove(); p = null; continue; }
        if (!p) { p = doc.createElement('p'); parent.insertBefore(p, child); } else p.appendChild(join === 'br' ? doc.createElement('br') : doc.createTextNode(' '));
        while (child.firstChild) p.appendChild(child.firstChild);
        child.remove();
      } else if (child.nodeType === 3 && !child.data.trim()) {
        // whitespace between divs: ignore
      } else if (child.nodeType === 3 || (child.nodeType === 1 && INLINE.has(child.nodeName))) {
        if (!p) { p = doc.createElement('p'); parent.insertBefore(p, child); }
        p.appendChild(child);
      } else {
        p = null;
      }
    }
  }
}

// Turn bare URLs in text into links (Drupal's URL filter did this on display).
function linkifyBareUrls(root, doc) {
  const walker = [];
  (function collect(n) {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) walker.push(c);
      else if (c.nodeType === 1 && !['A', 'CODE', 'PRE', 'TT', 'SCRIPT', 'STYLE'].includes(c.nodeName)) collect(c);
    }
  })(root);
  const re = /\b((?:https?|ftp):\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]|www\.[a-z0-9-]+\.[^\s<>"']+[^\s<>"'.,;:!?)\]])/gi;
  for (const t of walker) {
    if (!re.test(t.data)) continue;
    re.lastIndex = 0;
    const frag = doc.createDocumentFragment();
    let last = 0;
    for (const m of t.data.matchAll(re)) {
      frag.appendChild(doc.createTextNode(t.data.slice(last, m.index)));
      const a = doc.createElement('a');
      a.setAttribute('href', m[0].startsWith('www.') ? `http://${m[0]}` : m[0]);
      a.textContent = m[0];
      frag.appendChild(a);
      last = m.index + m[0].length;
    }
    frag.appendChild(doc.createTextNode(t.data.slice(last)));
    t.replaceWith(frag);
  }
}

/**
 * Clean a fragment of legacy HTML. Returns { body, notes } where body is the
 * cleaned DOM element and notes lists things a human should look at.
 */
export function cleanHtml(html, { linkify = false, rewriteUrl = (u) => u, divJoin = 'br' } = {}) {
  const doc = domino.createDocument(`<!doctype html><html><body>${html}</body></html>`);
  const body = doc.body;
  const notes = [];

  // Remove junk: comments, meta, wbr, scripts, Gmail spacer images.
  const killComments = (n) => Array.from(n.childNodes).forEach((c) => (c.nodeType === 8 ? c.remove() : c.nodeType === 1 && killComments(c)));
  killComments(body);
  $$(body, 'meta,wbr,script,style,link').forEach((e) => e.remove());
  $$(body, 'img').forEach((img) => {
    if (/cleardot\.gif/.test(img.getAttribute('src') || '')) img.remove();
  });
  $$(body, 'font').forEach(unwrap);
  $$(body, 'tt').forEach((e) => rename(e, 'code'));

  // Styles: translate the meaningful ones into classes/attributes, drop the rest.
  for (const el of [...$$(body, '[style]')]) {
    const st = parseStyle(el.getAttribute('style'));
    el.removeAttribute('style');
    const classes = [];
    if (el.nodeName === 'IMG') {
      if (st.float === 'right' || st.float === 'left') classes.push(`float-${st.float}`);
      for (const dim of ['width', 'height']) {
        const v = /^(\d+)px$/.exec(st[dim] || '');
        if (v && !el.getAttribute(dim)) el.setAttribute(dim, v[1]);
      }
    } else {
      const size = /^(\d+)px$/.exec(st['font-size'] || '');
      if (size && +size[1] <= 11) classes.push('text-small');
      else if (size && +size[1] >= 17) classes.push('text-large');
      if (st['text-align'] === 'center' || st['text-align'] === 'right') classes.push(`text-${st['text-align']}`);
      // Floated blocks (e.g. the old theme's .popquote pull quotes) keep their side.
      if (el.nodeName === 'DIV' && (st.float === 'left' || st.float === 'right')) classes.push(`float-${st.float}`);
      const bg = st['background-color'] || st.background;
      if (bg && el.nodeName !== 'TABLE') notes.push(`dropped background ${bg} on <${el.nodeName.toLowerCase()}>: "${el.textContent.trim().slice(0, 50)}"`);
    }
    if (classes.length) el.setAttribute('class', [el.getAttribute('class'), ...classes].filter(Boolean).join(' '));
  }

  // Attributes: keep only what's meaningful.
  for (const el of Array.from($$(body, '*'))) {
    const keep = KEEP_ATTRS[el.nodeName] || [];
    for (const a of Array.from(el.attributes)) {
      if (!keep.includes(a.name)) el.removeAttribute(a.name);
      else if (a.name === 'class') {
        const ok = a.value.split(/\s+/).filter((c) => /^(float-(left|right)|text-(small|large|center|right)|ascii-art|email|popquote)$/.test(c));
        ok.length ? el.setAttribute('class', ok.join(' ')) : el.removeAttribute('class');
      }
    }
    if (el.nodeName === 'A' && el.getAttribute('href')) el.setAttribute('href', rewriteUrl(el.getAttribute('href')));
    if (el.nodeName === 'IMG' && el.getAttribute('src')) el.setAttribute('src', rewriteUrl(el.getAttribute('src')));
    if (el.nodeName === 'IFRAME') notes.push(`iframe: ${el.getAttribute('src')}`);
  }
  $$(body, 'span:not([class])').forEach(unwrap);
  $$(body, 'span.text-small').forEach((e) => rename(e, 'small').removeAttribute('class'));
  $$(body, 'b').forEach((e) => rename(e, 'strong'));
  $$(body, 'i').forEach((e) => rename(e, 'em'));

  // Code: a block holding only <code> lines, or a <code> with line breaks, is a code block.
  for (const code of Array.from($$(body, 'code'))) {
    if (code.parentNode.nodeName === 'PRE') continue;
    if (!code.querySelector('br') && !code.textContent.includes('\n')) continue;
    $$(code, 'br').forEach((br) => br.replaceWith(doc.createTextNode('\n')));
    $$(code, 'span').forEach(unwrap);
    const pre = doc.createElement('pre');
    const holder = code.parentNode;
    const onlyChild = Array.from(holder.childNodes).every((c) => c === code || isBlank(c));
    if (onlyChild && holder !== body && ['DIV', 'P'].includes(holder.nodeName)) holder.replaceWith(pre);
    else code.replaceWith(pre);
    pre.appendChild(code);
  }
  $$(body, 'pre').forEach((pre) => { if (!pre.textContent.trim()) pre.remove(); });
  // ASCII art: a group of div lines that are each a single <code> -> one <pre>.
  for (const td of Array.from($$(body, 'td,div'))) {
    const els = Array.from(td.children);
    if (els.length > 2 && els.every((d) => d.nodeName === 'DIV' && d.children.length === 1 && d.firstElementChild.nodeName === 'CODE')) {
      const pre = doc.createElement('pre');
      pre.setAttribute('class', 'ascii-art');
      els.forEach((d, i) => {
        if (i) pre.appendChild(doc.createTextNode('\n'));
        const code = d.firstElementChild;
        while (code.firstChild) pre.appendChild(code.firstChild);
      });
      td.innerHTML = '';
      td.appendChild(pre);
      const table = td.closest('table');
      if (table && $$(table, 'td').length === 1) table.replaceWith(pre);
    }
  }

  divLinesToParagraphs(body, doc, divJoin);
  if (linkify) linkifyBareUrls(body, doc);

  // Empty paragraphs were only extra spacing.
  for (const p of Array.from($$(body, 'p'))) if (isBlank(p)) p.remove();
  // Trailing/leading <br> inside paragraphs and list items.
  for (const el of $$(body, 'p,li,td,a')) {
    while (el.lastChild && (el.lastChild.nodeName === 'BR' || (el.lastChild.nodeType === 3 && !el.lastChild.data.replace(/[\s\u00a0]/g, '')))) el.lastChild.remove();
    while (el.firstChild && (el.firstChild.nodeName === 'BR' || (el.firstChild.nodeType === 3 && !el.firstChild.data.replace(/[\s\u00a0]/g, '')))) el.firstChild.remove();
  }
  return { body, doc, notes };
}

// ---------------------------------------------------------------------------
// Markdown

export function makeTurndown() {
  const td = new TurndownService({
    headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-',
    emDelimiter: '*', strongDelimiter: '**', hr: '---', br: '\\',
  });
  // Raw HTML where Markdown would lose layout.
  // (addRule, not keep(): built-in rules for img/pre/p win over keep().)
  const raw = (n) => (n.isBlock ? `\n\n${n.outerHTML}\n\n` : n.outerHTML);
  td.addRule('sizedImage', {
    filter: (n) => n.nodeName === 'IMG' && !!(n.getAttribute('class') || n.getAttribute('width')),
    replacement: (_c, n) => n.outerHTML,
  });
  td.addRule('classedBlock', {
    filter: (n) => ['PRE', 'P', 'SPAN', 'DIV'].includes(n.nodeName) && !!n.getAttribute('class') && n.getAttribute('class') !== 'email',
    replacement: (_c, n) => raw(n).replace(/&nbsp;/g, " "),
  });
  td.keep(['table', 'iframe', 'small', 'abbr', 'u', 'sup', 'sub']);
  // Bare <pre> without <code>: still a fenced block.
  td.addRule('barePre', {
    filter: (n) => n.nodeName === 'PRE' && n.firstChild?.nodeName !== 'CODE' && !n.getAttribute('class'),
    replacement: (_c, n) => `\n\n\`\`\`\n${n.textContent.replace(/\n$/, '')}\n\`\`\`\n\n`,
  });
  return td;
}

export function htmlToMarkdown(body) {
  // Non-breaking spaces outside code are just spaces in Markdown.
  (function walk(n) {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) c.data = c.data.replace(/\u00a0/g, ' ');
      else if (c.nodeType === 1 && !['PRE', 'CODE'].includes(c.nodeName)) walk(c);
    }
  })(body);
  let md = makeTurndown().turndown(body);
  md = md.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  return md + '\n';
}

export function plainText(body, max = 160) {
  const parts = [];
  (function walk(n) {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) parts.push(c.data);
      else if (c.nodeType === 1) { walk(c); if (c.nodeName === 'BR' || !INLINE.has(c.nodeName)) parts.push(' '); }
    }
  })(body);
  const t = parts.join('').replace(/[\s\u00a0]+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

// YAML string, always double-quoted.
export const yq = (s) => JSON.stringify(String(s));

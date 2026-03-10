#!/usr/bin/env node
/**
 * Migrates old Allgemeinpraxis markdown content into the Strapi REST API.
 *
 * Usage:
 *   STRAPI_URL=https://your-strapi STRAPI_TOKEN=xxx node scripts/import-alpra-content.mjs
 *
 * Sprechzeiten are skipped — their nested component structure (days → slots → doctors)
 * must be set up manually in the Strapi admin.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const CONTENT_DIR = join(__dirname, '../../geko-allgemeinarzt/collections/_blocks');

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN env var is required.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Markdown → Strapi Blocks converter
// ---------------------------------------------------------------------------

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: m[2].trim() };
}

/** Parse inline markdown (bold, links) into Strapi block children. */
function parseInline(text) {
  if (!text) return [{ type: 'text', text: '' }];
  const children = [];
  // Matches **bold** or [label](url)
  const re = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) children.push({ type: 'text', text: text.slice(last, m.index) });
    if (m[1]) {
      // Bold — might contain a link
      const inner = m[2];
      const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
      let bLast = 0, lm;
      while ((lm = linkRe.exec(inner)) !== null) {
        if (lm.index > bLast) children.push({ type: 'text', text: inner.slice(bLast, lm.index), bold: true });
        children.push({ type: 'link', url: lm[2], children: [{ type: 'text', text: lm[1], bold: true }] });
        bLast = lm.index + lm[0].length;
      }
      if (bLast < inner.length) children.push({ type: 'text', text: inner.slice(bLast), bold: true });
    } else if (m[3]) {
      children.push({ type: 'link', url: m[5], children: [{ type: 'text', text: m[4] }] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) children.push({ type: 'text', text: text.slice(last) });
  return children.length ? children : [{ type: 'text', text: '' }];
}

/** Convert a markdown string to Strapi blocks JSON. */
function mdToBlocks(md) {
  if (!md?.trim()) return [];
  const blocks = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim() || line.trim().match(/^\\?\*\\?\*\\?\*$/) || line.trim().startsWith('<')) {
      i++; continue;
    }

    // Heading
    const hm = line.match(/^(#{1,6})\s+(.+)$/);
    if (hm) {
      blocks.push({ type: 'heading', level: hm[1].length, children: parseInline(hm[2].trim()) });
      i++; continue;
    }

    // List (handles one level of nesting by flattening)
    if (line.match(/^\*\s/)) {
      const items = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.match(/^\*\s/)) {
          const txt = l.replace(/^\*\s+/, '').replace(/^#{1,6}\s+/, '');
          items.push({ type: 'list-item', children: parseInline(txt) });
        } else if (l.match(/^\s{2,}\*/)) {
          const txt = l.replace(/^\s+\*\s+/, '');
          items.push({ type: 'list-item', children: parseInline(txt) });
        } else if (l.trim() === '') {
          // blank line — peek ahead to see if list continues
          if (i + 1 < lines.length && (lines[i + 1]?.match(/^\s*\*\s/) || false)) { i++; continue; }
          break;
        } else { break; }
        i++;
      }
      blocks.push({ type: 'list', format: 'unordered', children: items });
      continue;
    }

    // Paragraph (collect consecutive non-special lines)
    const pLines = [];
    while (i < lines.length && lines[i].trim() && !lines[i].match(/^#{1,6}\s/) && !lines[i].match(/^\*\s/) && !lines[i].trim().startsWith('<')) {
      let l = lines[i];
      if (l.endsWith('\\')) l = l.slice(0, -1);
      pLines.push(l);
      i++;
    }
    blocks.push({ type: 'paragraph', children: parseInline(pLines.join(' ')) });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Build dynamic zone content from markdown files
// ---------------------------------------------------------------------------

const COLOR_MAP = { white: 'white', red: 'red', yellow: 'yellow', blue: 'blue', green: 'green', lilac: 'white', turqoise: 'blue' };
const mapColor = (c) => COLOR_MAP[c] || 'white';

function readBlock(locale, file) {
  try { return parseFrontmatter(readFileSync(join(CONTENT_DIR, locale, file), 'utf-8')); }
  catch { return null; }
}

function buildComponent(componentName, block, extraAttrs = {}) {
  if (!block) return null;
  return {
    __component: `alpra-page-blocks.${componentName}`,
    title: block.meta.title || '',
    navbar_link: block.meta['navbar-entry'] === 'true',
    navbar_link_title: block.meta['navbar-entry-title'] || undefined,
    background_color: mapColor(block.meta['background-color']),
    content: mdToBlocks(block.body),
    ...extraAttrs,
  };
}

function buildLandingContent(locale) {
  return [
    buildComponent('welcome', readBlock(locale, 'willkommen-in-der-stadtteilpraxis.md')),
    // sprechzeiten skipped — needs manual setup via admin
    buildComponent('contact', readBlock(locale, 'kontakt.md')),
    buildComponent('services', readBlock(locale, 'unsere-leistungen.md')),
    buildComponent('about', readBlock(locale, 'über-uns.md')),
    { __component: 'alpra-page-blocks.footer', background_color: 'white' },
  ].filter(Boolean);
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function api(method, path, body, locale) {
  const url = new URL(path, STRAPI_URL);
  if (locale) url.searchParams.set('locale', locale);
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${STRAPI_TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}: ${text}`);
  return JSON.parse(text);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Target: ${STRAPI_URL}\n`);

  // DE (default locale)
  const de = buildLandingContent('de');
  console.log(`DE: ${de.length} blocks`);
  await api('PUT', '/api/alpra-page-landing', { data: { content: de } });
  console.log('  ✓ Landing (DE)\n');

  // EN
  const en = buildLandingContent('en');
  console.log(`EN: ${en.length} blocks`);
  try {
    await api('PUT', '/api/alpra-page-landing', { data: { content: en } }, 'en');
    console.log('  ✓ Landing (EN)\n');
  } catch (err) {
    console.log(`  ✗ Landing (EN) — is i18n enabled on [ALPRA - PAGE] Landing?\n    ${err.message}\n`);
  }

  // Meta
  await api('PUT', '/api/alpra-meta', {
    data: {
      company: 'Stadtteil-Praxis Neukölln',
      street: 'Rollbergstr. 30',
      postal: '12053',
      city: 'Berlin',
      phone: '+4930-439720630',
      fax: '+4930-7001434528',
      email: 'info@stadtteilpraxis.de',
    },
  });
  console.log('✓ Meta\n');

  console.log('Done! Sprechzeiten must be entered manually via Strapi admin.');
}

main().catch((e) => { console.error(e); process.exit(1); });

#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://seeaifirst.com';
const DATA_PATH = path.join(__dirname, '..', 'data.json');
const VI_DATA_PATH = path.join(__dirname, '..', 'data.vi.json');
const PRICING_PATH = path.join(__dirname, '..', 'data', 'ai-pricing.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'sitemap.xml');

// Static pages outside the SPA route system (EN-only)
const STATIC_PAGES = ['/ai-cost-calculator/'];

// Expected counts
const EXPECTED_CARDS = 66;
const EXPECTED_SECTIONS = 13;
const EXPECTED_PRESETS = 4;
const EXPECTED_TOTAL = 169; // (1 + 66 + 4 + 13) * 2 langs + static pages

// Read data.json
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const viData = JSON.parse(fs.readFileSync(VI_DATA_PATH, 'utf8'));
const pricing = JSON.parse(fs.readFileSync(PRICING_PATH, 'utf8'));

// <lastmod> is derived from data only (verified_at / last_verified), never from the build date,
// so regenerating in CI (CIP-0 drift check) is deterministic.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Bump when the prerender page format in scripts/generate-shells.js changes (content of every route shell changes).
const SHELL_TEMPLATE_DATE = '2026-10-20';
const maxDate = (dates) => dates.filter((d) => typeof d === 'string' && DATE_RE.test(d)).sort().pop() || null;
function lastmodIndex(d) {
  const tool = new Map();
  const section = new Map();
  for (const s of d.sections) {
    for (const c of s.cards) tool.set(c.slug, DATE_RE.test(c.verified_at || '') ? c.verified_at : null);
    section.set(s.id, maxDate(s.cards.map((c) => c.verified_at)));
  }
  const preset = new Map(d.comparison_presets.map((p) => [p.id, maxDate(p.tools.map((t) => tool.get(t.cardId)))]));
  const home = maxDate([...tool.values()]);
  return { tool, section, preset, home };
}
const withTemplate = (idx) => {
  const bump = (d) => maxDate([d, SHELL_TEMPLATE_DATE]);
  return {
    tool: new Map([...idx.tool].map(([k, v]) => [k, bump(v)])),
    section: new Map([...idx.section].map(([k, v]) => [k, bump(v)])),
    preset: new Map([...idx.preset].map(([k, v]) => [k, bump(v)])),
    home: bump(idx.home)
  };
};
const lmEn = withTemplate(lastmodIndex(data));
const lmVi = withTemplate(lastmodIndex(viData));
const lastmod = new Map();

// Extract slugs
const cardSlugs = [];
for (const section of data.sections) {
  for (const card of section.cards) {
    if (!card.slug) {
      console.error(`ERROR: card "${card.name}" in section "${section.id}" has no slug`);
      process.exit(1);
    }
    cardSlugs.push(card.slug);
  }
}
cardSlugs.sort();

const sectionSlugs = data.sections.map(s => s.id).sort();
const presetSlugs = data.comparison_presets.map(p => p.id).sort();

// Validate counts
let fail = false;
if (cardSlugs.length !== EXPECTED_CARDS) {
  console.error(`ERROR: expected ${EXPECTED_CARDS} cards, got ${cardSlugs.length}`);
  fail = true;
}
if (sectionSlugs.length !== EXPECTED_SECTIONS) {
  console.error(`ERROR: expected ${EXPECTED_SECTIONS} sections, got ${sectionSlugs.length}`);
  fail = true;
}
if (presetSlugs.length !== EXPECTED_PRESETS) {
  console.error(`ERROR: expected ${EXPECTED_PRESETS} presets, got ${presetSlugs.length}`);
  fail = true;
}
if (fail) process.exit(1);

// Build URL list in deterministic order
const urls = [];

// 1. Home
urls.push(`${BASE_URL}/`); lastmod.set(`${BASE_URL}/`, lmEn.home);
urls.push(`${BASE_URL}/vi/`); lastmod.set(`${BASE_URL}/vi/`, lmVi.home);

// 2. Tools (alphabetical by slug)
for (const slug of cardSlugs) {
  urls.push(`${BASE_URL}/tool/${slug}`); lastmod.set(`${BASE_URL}/tool/${slug}`, lmEn.tool.get(slug));
}
for (const slug of cardSlugs) {
  urls.push(`${BASE_URL}/vi/tool/${slug}`); lastmod.set(`${BASE_URL}/vi/tool/${slug}`, lmVi.tool.get(slug));
}

// 3. Compare (alphabetical by preset id)
for (const slug of presetSlugs) {
  urls.push(`${BASE_URL}/compare/${slug}`); lastmod.set(`${BASE_URL}/compare/${slug}`, lmEn.preset.get(slug));
}
for (const slug of presetSlugs) {
  urls.push(`${BASE_URL}/vi/compare/${slug}`); lastmod.set(`${BASE_URL}/vi/compare/${slug}`, lmVi.preset.get(slug));
}

// 4. Sections (alphabetical by section id)
for (const slug of sectionSlugs) {
  urls.push(`${BASE_URL}/section/${slug}`); lastmod.set(`${BASE_URL}/section/${slug}`, lmEn.section.get(slug));
}
for (const slug of sectionSlugs) {
  urls.push(`${BASE_URL}/vi/section/${slug}`); lastmod.set(`${BASE_URL}/vi/section/${slug}`, lmVi.section.get(slug));
}

// 5. Static pages (EN-only)
for (const page of STATIC_PAGES) {
  urls.push(`${BASE_URL}${page}`);
}
lastmod.set(`${BASE_URL}/ai-cost-calculator/`, DATE_RE.test(pricing.last_verified || '') ? pricing.last_verified : null);

// Final count validation
if (urls.length !== EXPECTED_TOTAL) {
  console.error(`ERROR: expected ${EXPECTED_TOTAL} URLs, got ${urls.length}`);
  process.exit(1);
}

// Generate XML
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(u => (lastmod.get(u) ? `  <url><loc>${u}</loc><lastmod>${lastmod.get(u)}</lastmod></url>` : `  <url><loc>${u}</loc></url>`)),
  '</urlset>',
  '' // trailing newline
].join('\n');

fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');

// Summary
const homeCount = 2;
const toolsCount = cardSlugs.length * 2;
const compareCount = presetSlugs.length * 2;
const sectionsCount = sectionSlugs.length * 2;
const staticCount = STATIC_PAGES.length;

console.log('Sitemap generated:');
console.log(`  home     = ${homeCount}`);
console.log(`  tools    = ${toolsCount}`);
console.log(`  compare  = ${compareCount}`);
console.log(`  sections = ${sectionsCount}`);
console.log(`  static   = ${staticCount}`);
console.log(`  total    = ${urls.length}`);

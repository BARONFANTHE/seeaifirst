#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ── Config ──────────────────────────────────────────────────────────
const dataFile = process.argv[2] || 'data.json';
const DATA_PATH = path.join(__dirname, '..', dataFile);

const REQUIRED_NON_NULL = [
  'pricing', 'deployment', 'difficulty',
  'whenToUse', 'whenNotToUse', 'compatibleWith',
  'useCases', 'languages', 'verified_at', 'verification_source'
];

const OPTIONAL_BY_VALUE = ['github_stars', 'license'];

const ALL_ENRICHMENT_KEYS = [...REQUIRED_NON_NULL, ...OPTIONAL_BY_VALUE];

const ENUMS = {
  pricing:             ['free', 'freemium', 'paid', 'open-core'],
  deployment:          ['cloud', 'self-hosted', 'local', 'hybrid'],
  difficulty:          ['beginner', 'intermediate', 'advanced'],
  verification_source: ['docs', 'tested', 'inferred'],
};

const ARRAY_FIELDS = ['whenToUse', 'whenNotToUse', 'compatibleWith', 'useCases', 'languages'];

// ── Helpers ─────────────────────────────────────────────────────────
let failCount = 0;
let warnCount = 0;

function fail(check, msg) {
  failCount++;
  console.log(`[FAIL] Check ${check}: ${msg}`);
}

function warn(check, msg) {
  warnCount++;
  console.log(`[WARN] Check ${check}: ${msg}`);
}

function passLine(check, label, detail) {
  console.log(`Check ${check}: ${label} ${'.'.repeat(Math.max(1, 40 - label.length))} PASS (${detail})`);
}

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────────
const raw = fs.readFileSync(DATA_PATH, 'utf8');
const data = JSON.parse(raw);

const sections = data.sections || [];
const meta = data.meta || {};

// Gather all cards with section context
const allCards = [];
for (const section of sections) {
  const cards = section.cards || [];
  for (const card of cards) {
    allCards.push({ card, sectionTitle: section.title, sectionId: section.id });
  }
}

const totalCards = allCards.length;
const totalSections = sections.length;

// ── Header ──────────────────────────────────────────────────────────
console.log('=== See AI First Validator ===');
console.log(`Data: ${dataFile}`);
console.log(`Date: ${new Date().toISOString().slice(0, 10)}`);
console.log('');
console.log('--- Sanity ---');
console.log(`Top-level keys: ${Object.keys(data).join(', ')}`);
console.log(`Sections found: ${totalSections}`);
console.log(`Cards counted: ${totalCards}`);
console.log('');
console.log('--- Checks ---');

// ── Check 1: Required enrichment fields (12 keys) ──────────────────
let check1Pass = true;
for (const { card, sectionTitle } of allCards) {
  for (const key of ALL_ENRICHMENT_KEYS) {
    if (!(key in card)) {
      fail(1, `Card "${card.name}" (section "${sectionTitle}") missing key: ${key}`);
      check1Pass = false;
      continue;
    }

    // Required non-null check
    if (REQUIRED_NON_NULL.includes(key) && card[key] === null) {
      fail(1, `Card "${card.name}" (section "${sectionTitle}") field "${key}" is null (required non-null)`);
      check1Pass = false;
    }

    // Type checks for optional-by-value
    if (key === 'github_stars' && card[key] !== null && typeof card[key] !== 'number') {
      fail(1, `Card "${card.name}" (section "${sectionTitle}") field "github_stars" has wrong type: ${typeof card[key]} (expected number or null)`);
      check1Pass = false;
    }
    if (key === 'license' && card[key] !== null && typeof card[key] !== 'string') {
      fail(1, `Card "${card.name}" (section "${sectionTitle}") field "license" has wrong type: ${typeof card[key]} (expected string or null)`);
      check1Pass = false;
    }
  }
}
if (check1Pass) passLine(1, 'Required fields (12 keys)', `${totalCards}/${totalCards} cards`);

// ── Check 2: Enum values ────────────────────────────────────────────
let check2Pass = true;
for (const { card, sectionTitle } of allCards) {
  for (const [field, allowed] of Object.entries(ENUMS)) {
    if (field in card && card[field] !== null && !allowed.includes(card[field])) {
      fail(2, `Card "${card.name}" field "${field}" has invalid value "${card[field]}" (allowed: ${allowed.join(', ')})`);
      check2Pass = false;
    }
  }
}
if (check2Pass) passLine(2, 'Enum values', `${totalCards}/${totalCards} cards`);

// ── Check 3: Non-empty arrays ───────────────────────────────────────
let check3Pass = true;
for (const { card, sectionTitle } of allCards) {
  for (const field of ARRAY_FIELDS) {
    if (field in card) {
      if (!Array.isArray(card[field]) || card[field].length === 0) {
        fail(3, `Card "${card.name}" field "${field}" is empty or not an array`);
        check3Pass = false;
      }
    }
  }
}
if (check3Pass) passLine(3, 'Non-empty arrays', `${totalCards}/${totalCards} cards`);

// ── Check 4: URL format ─────────────────────────────────────────────
let check4Pass = true;
let urlCount = 0;
for (const { card } of allCards) {
  const sources = card.sources || [];
  for (const src of sources) {
    if (src.url) {
      urlCount++;
      if (!isValidUrl(src.url)) {
        warn(4, `Card "${card.name}" has invalid URL: "${src.url}" (missing scheme?)`);
        check4Pass = false;
      }
    }
  }
}
if (check4Pass) {
  passLine(4, 'URL format', `${urlCount} URLs checked`);
} else {
  console.log(`Check 4: URL format — ${urlCount} URLs checked, see WARNs above`);
}

// ── Check 5: No duplicate card names ────────────────────────────────
let check5Pass = true;
// Within-section duplicates (FAIL)
for (const section of sections) {
  const seen = new Map();
  for (const card of (section.cards || [])) {
    if (seen.has(card.name)) {
      fail(5, `Duplicate card name "${card.name}" in section "${section.title}"`);
      check5Pass = false;
    }
    seen.set(card.name, true);
  }
}
// Cross-section duplicates (WARN)
const globalNames = new Map();
for (const { card, sectionTitle } of allCards) {
  if (globalNames.has(card.name)) {
    warn(5, `Card name "${card.name}" appears in both "${globalNames.get(card.name)}" and "${sectionTitle}"`);
  } else {
    globalNames.set(card.name, sectionTitle);
  }
}
if (check5Pass) passLine(5, 'No duplicates', `${totalCards} cards, ${totalSections} sections`);

// ── Check 6: Meta contract ──────────────────────────────────────────
let check6Pass = true;
if (meta.tools_count !== totalCards) {
  fail(6, `meta.tools_count is ${meta.tools_count} but actual card count is ${totalCards}`);
  check6Pass = false;
}
if (meta.sections_count !== totalSections) {
  fail(6, `meta.sections_count is ${meta.sections_count} but actual section count is ${totalSections}`);
  check6Pass = false;
}
if (check6Pass) passLine(6, 'Meta contract', `tools: ${totalCards}, sections: ${totalSections}`);

// ── Check 7: Slug unique ────────────────────────────────────────────
let check7Pass = true;
const slugMap = new Map(); // slug → [cardName, ...]
for (const { card } of allCards) {
  if (!card.slug || typeof card.slug !== 'string') {
    fail(7, `Card "${card.name}" missing slug field`);
    check7Pass = false;
    continue;
  }
  if (!slugMap.has(card.slug)) {
    slugMap.set(card.slug, []);
  }
  slugMap.get(card.slug).push(card.name);
}
for (const [slug, names] of slugMap) {
  if (names.length > 1) {
    fail(7, `Duplicate slug "${slug}" found in cards: "${names.join('", "')}"`);
    check7Pass = false;
  }
}
if (check7Pass) passLine(7, 'Slug unique', `${slugMap.size} unique slugs`);

// ── Check 8: compatibleWith orphan check ────────────────────────────
let check8Pass = true;
const slugSet = new Set(slugMap.keys());
let orphanCount = 0;
for (const { card } of allCards) {
  if (Array.isArray(card.compatibleWith)) {
    for (const ref of card.compatibleWith) {
      if (!slugSet.has(ref)) {
        fail(8, `Card "${card.name}" has orphan compatibleWith: "${ref}" (not in slug_set)`);
        check8Pass = false;
        orphanCount++;
      }
    }
  }
}
if (check8Pass) passLine(8, 'compatibleWith orphans', `0 orphans`);

// ── Summary ─────────────────────────────────────────────────────────
console.log('');
if (failCount === 0 && warnCount === 0) {
  console.log('=== RESULT: ALL CHECKS PASSED ===');
} else {
  const parts = [];
  if (failCount > 0) parts.push(`${failCount} FAIL`);
  if (warnCount > 0) parts.push(`${warnCount} WARN`);
  console.log(`=== RESULT: ${parts.join(', ')} — see details above ===`);
}

process.exit(failCount > 0 ? 1 : 0);

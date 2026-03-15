#!/usr/bin/env node
'use strict';

// Crawler-Visible Route Shells Generator (PR16)
// Usage: node scripts/generate-shells.js
// Reads: index.html (template), data.json, data.vi.json
// Writes: 167 new HTML files + updates root index.html (home EN)

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://seeaifirst.com';
const ROOT = path.join(__dirname, '..');

// ── Helpers ──────────────────────────────────────────────────────────

function assert(condition, msg) {
  if (!condition) {
    console.error('❌ ASSERTION FAILED:', msg);
    process.exit(1);
  }
}

function stripHtml(text) {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim();
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncate(text, max) {
  if (!text || text.length <= max) return text || '';
  return text.substring(0, max - 3).trimEnd() + '...';
}

function nullSafe(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
}

/**
 * sanitizeForShell(text) — strip HTML, volatile metrics, and escape for home prerender only.
 * Pipeline: null-guard → stripHtml → normalize whitespace → remove volatile metrics → clean artifacts → escapeHtml
 */
function sanitizeForShell(text) {
  if (!text) return '';

  // 1. Strip HTML tags
  let s = stripHtml(text);

  // 2. Normalize whitespace
  s = s.replace(/\s+/g, ' ').trim();

  // 3. Remove volatile external metrics (narrow patterns only)
  // GitHub star counts: 135k⭐, 42.7K⭐, 73K+ stars, 96K+ stars, 129K⭐
  s = s.replace(/\d+[\.,]?\d*[kKmM]?\s*⭐/g, '');
  s = s.replace(/\d+[\.,]?\d*[kK]\+?\s*stars?\b/gi, '');
  // Token/context limits: 200K tokens, 1M token, 100K context
  s = s.replace(/\d+[\.,]?\d*[kKmM]\s*tokens?\b/gi, '');
  s = s.replace(/\d+[\.,]?\d*[kKmM]\s*context\b/gi, '');
  // Dollar amounts: $5B, $276B, $7.6B to $52B
  s = s.replace(/\$\d+[\.,]?\d*[kKmMbBtT]?\b(\s*to\s*\$\d+[\.,]?\d*[kKmMbBtT]?\b)?/gi, '');
  // Power metrics: 1GW+
  s = s.replace(/\d+[\.,]?\d*\s*[GTKM]W\+?/g, '');
  // Percentage claims: 1,445% surge, 40% apps, 30% code, 25%+
  s = s.replace(/\d+[\.,]?\d*%\+?/g, '');
  // Ranking claims: #1 on ...
  s = s.replace(/#\d+\s+on\b/gi, '');

  // 4. Clean boundary artifacts left by metric removal
  // Collapse multiple spaces
  s = s.replace(/\s+/g, ' ');
  // Remove orphan separators at start/end
  s = s.replace(/^\s*[·—,\-]\s*/, '');
  s = s.replace(/\s*[·—,\-]\s*$/, '');
  // Collapse repeated separators (e.g., "— —" or ", ,")
  s = s.replace(/([·—,])\s*\1/g, '$1');
  // Remove empty parentheses
  s = s.replace(/\(\s*\)/g, '');
  // Clean "— " at start after removal or trailing " —"
  s = s.replace(/^\s*[·—,\-]\s*/, '');
  s = s.replace(/\s*[·—,\-]\s*$/, '');
  // Final whitespace cleanup
  s = s.trim();

  // 5. Return empty if result is too short
  if (s.length < 10) return '';

  // 6. Escape HTML entities as final step
  return escapeHtml(s);
}

/**
 * hasBadArtifacts(sanitizedText, originalStrippedText) — detect obvious sanitizer damage.
 * Returns true if summary has broken artifacts that harm readability.
 * Detector only — does not modify text.
 */
function hasBadArtifacts(sanitizedText, originalStrippedText) {
  if (!sanitizedText) return true;
  const s = sanitizedText;
  // 1. Orphan separator: " , " in text
  if (/\s,\s/.test(s)) return true;
  // 2. Broken sentence join: ". of", ". on", ". at", etc.
  if (/\.\s(?:of|on|at|for|with|to)\b/.test(s)) return true;
  // 3. Orphan price/unit fragment: "at /month", "for /year"
  if (/\b(?:at|for|up to)\s+\/(?:month|year)\b/.test(s)) return true;
  // 4. Text empty or mostly punctuation
  if (/^\W*$/.test(s.trim())) return true;
  // 5. Severe length drop (only when original is substantial)
  if (originalStrippedText && originalStrippedText.length >= 60 && s.length < 0.4 * originalStrippedText.length) return true;
  // 6. Orphan quantifier fragment: "up to context", "up to tokens"
  if (/\bup to\s+(?:context|tokens?)\b/.test(s)) return true;
  // 7. Broken metric-removal fragment
  if (/\bwrites of code\b/.test(s)) return true;
  // 8. Broken sentence join Vietnamese: ". trên", ". về", etc.
  if (/\.\s(?:trên|về|của|cho|với|từ)\b/.test(s)) return true;
  // 9. Orphan price/unit Vietnamese: "giá /tháng"
  if (/\bgiá\s+\/(?:tháng|năm)\b/.test(s)) return true;
  // 10. Broken app fragment: ". app"
  if (/\.\s*app\b/.test(s)) return true;
  // 11. Orphan plus-comma: "+,"
  if (/\+\s*,/.test(s)) return true;
  // 12. Broken "from by" fragment
  if (/\bfrom by\b/.test(s)) return true;
  return false;
}

// ── Read inputs ─────────────────────────────────────────────────────

console.log('Reading template and data files...');
const templateHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const enData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data.json'), 'utf8'));
const viData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data.vi.json'), 'utf8'));

// Build slug → card+section lookup for compare preset resolution
function buildSlugMap(data) {
  const map = new Map();
  for (const section of data.sections) {
    for (const card of section.cards) {
      map.set(card.slug, { card, section });
    }
  }
  return map;
}

const enSlugMap = buildSlugMap(enData);
const viSlugMap = buildSlugMap(viData);

// ── Build route manifest ────────────────────────────────────────────

function buildManifest(data, lang) {
  const prefix = lang === 'vi' ? 'vi/' : '';
  const urlPrefix = lang === 'vi' ? '/vi' : '';
  const routes = [];

  // Home
  routes.push({
    type: 'home',
    lang,
    outputPath: lang === 'vi' ? 'vi/index.html' : null, // null = modify root
    url: urlPrefix + '/',
    data: { meta: data.meta, sections: data.sections }
  });

  // Tools
  for (const section of data.sections) {
    for (const card of section.cards) {
      routes.push({
        type: 'tool',
        lang,
        outputPath: `${prefix}tool/${card.slug}/index.html`,
        url: `${urlPrefix}/tool/${card.slug}`,
        data: { card, section }
      });
    }
  }

  // Sections
  for (const section of data.sections) {
    routes.push({
      type: 'section',
      lang,
      outputPath: `${prefix}section/${section.id}/index.html`,
      url: `${urlPrefix}/section/${section.id}`,
      data: { section }
    });
  }

  // Compare presets (uses preset.id, NOT slug)
  for (const preset of data.comparison_presets) {
    routes.push({
      type: 'compare',
      lang,
      outputPath: `${prefix}compare/${preset.id}/index.html`,
      url: `${urlPrefix}/compare/${preset.id}`,
      data: { preset }
    });
  }

  return routes;
}

const enRoutes = buildManifest(enData, 'en');
const viRoutes = buildManifest(viData, 'vi');
const allRoutes = [...enRoutes, ...viRoutes];

// ── Fail-fast assertions ────────────────────────────────────────────

console.log('Running assertions...');

const totalRoutes = allRoutes.length;
const newFiles = allRoutes.filter(r => r.outputPath !== null).length;

assert(totalRoutes === 168, `Route manifest total: expected 168, got ${totalRoutes}`);
assert(newFiles === 167, `New files: expected 167, got ${newFiles}`);

// Unique output paths
const paths = allRoutes.filter(r => r.outputPath).map(r => r.outputPath);
const uniquePaths = new Set(paths);
assert(paths.length === uniquePaths.size, `Duplicate output paths: ${paths.length} paths, ${uniquePaths.size} unique`);

// All cards have slugs
for (const section of enData.sections) {
  for (const card of section.cards) {
    assert(card.slug, `EN card "${card.name}" has no slug`);
  }
}
for (const section of viData.sections) {
  for (const card of section.cards) {
    assert(card.slug, `VI card "${card.name}" has no slug`);
  }
}

// Card count parity
const enCardCount = enData.sections.reduce((a, s) => a + s.cards.length, 0);
const viCardCount = viData.sections.reduce((a, s) => a + s.cards.length, 0);
assert(enCardCount === viCardCount, `Card count mismatch: EN=${enCardCount} VI=${viCardCount}`);

// Compare preset tools resolve to valid cards
for (const preset of enData.comparison_presets) {
  for (const tool of preset.tools) {
    assert(enSlugMap.has(tool.cardId),
      `EN preset "${preset.id}" references unknown cardId "${tool.cardId}"`);
  }
}
for (const preset of viData.comparison_presets) {
  for (const tool of preset.tools) {
    assert(viSlugMap.has(tool.cardId),
      `VI preset "${preset.id}" references unknown cardId "${tool.cardId}"`);
  }
}

console.log(`✓ All assertions passed (${totalRoutes} routes, ${newFiles} new files)`);

// ── Head content generator ──────────────────────────────────────────

function generateHeadContent(route) {
  const { type, lang, url, data } = route;
  const fullUrl = BASE_URL + url;
  const locale = lang === 'vi' ? 'vi_VN' : 'en_US';
  const altLocale = lang === 'vi' ? 'en_US' : 'vi_VN';
  const slugMap = lang === 'vi' ? viSlugMap : enSlugMap;

  let title, description;

  switch (type) {
    case 'home':
      if (lang === 'en') {
        title = 'See AI First \u2014 The Opinionated AI Stack Guide';
        description = 'Curated directory of 66 AI developer tools across 13 categories, with evidence-first sourcing.';
      } else {
        title = 'See AI First \u2014 B\u1EA3n \u0110\u1ED3 C\u00F4ng C\u1EE5 AI C\u00F3 Ch\u1ECDn L\u1ECDc';
        description = 'Kh\u00E1m ph\u00E1 66 c\u00F4ng c\u1EE5 AI \u0111\u01B0\u1EE3c tuy\u1EC3n ch\u1ECDn trong 13 danh m\u1EE5c. H\u01B0\u1EDBng d\u1EABn c\u00F3 ch\u1ECDn l\u1ECDc d\u00E0nh cho developers.';
      }
      break;
    case 'tool': {
      const { card } = data;
      title = `${card.name} \u2014 See AI First`;
      description = truncate(stripHtml(nullSafe(card.desc, '')), 160);
      break;
    }
    case 'section': {
      const { section } = data;
      const cardCount = section.cards.length;
      title = `${section.title} \u2014 See AI First`;
      if (lang === 'en') {
        description = `Explore ${cardCount} curated AI tools in ${section.title}.`;
      } else {
        description = `Kh\u00E1m ph\u00E1 ${cardCount} c\u00F4ng c\u1EE5 AI \u0111\u01B0\u1EE3c tuy\u1EC3n ch\u1ECDn trong ${section.title}.`;
      }
      break;
    }
    case 'compare': {
      const { preset } = data;
      // Resolve tool names from cards via cardId → slug lookup
      const toolNames = preset.tools.map(t => {
        const entry = slugMap.get(t.cardId);
        return entry ? entry.card.name : t.cardId;
      }).join(', ');
      const toolCount = preset.tools.length;
      if (lang === 'en') {
        title = `${preset.title} \u2014 Compare \u2014 See AI First`;
        description = truncate(`Compare ${toolCount} AI tools side by side: ${toolNames}.`, 160);
      } else {
        title = `${preset.title} \u2014 So s\u00E1nh \u2014 See AI First`;
        description = truncate(`So s\u00E1nh ${toolCount} c\u00F4ng c\u1EE5 AI: ${toolNames}.`, 160);
      }
      break;
    }
  }

  const metaTags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(fullUrl)}">`,
    `<meta property="og:locale" content="${locale}">`,
    `<meta property="og:locale:alternate" content="${altLocale}">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${escapeHtml(fullUrl)}">`
  ].join('\n');

  return metaTags + '\n' + generateRouteJsonLd(route);
}

// ── JSON-LD generator (PR-AEO1) ─────────────────────────────────────

function buildSoftwareApp(card, toolUrl) {
  const item = {
    '@type': 'SoftwareApplication',
    name: card.name,
    url: toolUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform'
  };
  const desc = stripHtml(nullSafe(card.desc, ''));
  if (desc) item.description = desc;
  if (card.languages && card.languages.length) item.keywords = [...card.languages];
  if (card.pricing === 'free') {
    item.offers = { '@type': 'Offer', price: '0', priceCurrency: 'USD' };
  } else if (card.pricing === 'freemium' || card.pricing === 'open-core') {
    item.isAccessibleForFree = true;
  }
  if (card.license) item.license = card.license;
  if (card.sources && card.sources.length) {
    const urls = card.sources.filter(s => s.url).map(s => s.url);
    if (urls.length) item.sameAs = urls;
  }
  if (card.added_date) item.datePublished = card.added_date;
  if (card.verified_at) item.dateModified = card.verified_at;
  return item;
}

function generateRouteJsonLd(route) {
  const { type, lang, url, data } = route;
  const fullUrl = BASE_URL + url;
  const linkPrefix = lang === 'vi' ? '/vi' : '';

  let jsonLdObj;

  switch (type) {
    case 'home': {
      const { sections } = data;
      const items = [];
      let position = 0;
      for (const section of sections) {
        for (const card of section.cards) {
          position++;
          const toolUrl = BASE_URL + linkPrefix + '/tool/' + card.slug;
          const app = buildSoftwareApp(card, toolUrl);
          if (section.title) {
            app.keywords = app.keywords || [];
            app.keywords.unshift(section.title.trim());
          }
          items.push({ '@type': 'ListItem', position: position, item: app });
        }
      }
      jsonLdObj = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': BASE_URL + '/#website',
            name: 'See AI First',
            alternateName: 'AI Mindmap',
            url: BASE_URL,
            description: 'Curated directory of 66 AI developer tools across 13 categories, with evidence-first sourcing.',
            inLanguage: lang
          },
          {
            '@type': 'CollectionPage',
            '@id': fullUrl + '#directory',
            name: lang === 'en'
              ? 'See AI First \u2014 AI Tools Directory 2026'
              : 'See AI First \u2014 B\u1EA3n \u0110\u1ED3 C\u00F4ng C\u1EE5 AI 2026',
            url: fullUrl,
            isPartOf: { '@id': BASE_URL + '/#website' },
            inLanguage: lang,
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: items.length,
              itemListElement: items
            }
          }
        ]
      };
      break;
    }
    case 'tool': {
      const { card, section } = data;
      const app = buildSoftwareApp(card, fullUrl);
      if (section.title) {
        app.keywords = app.keywords || [];
        app.keywords.unshift(section.title.trim());
      }
      app['@context'] = 'https://schema.org';
      app.inLanguage = lang;
      jsonLdObj = app;
      break;
    }
    case 'section': {
      const { section } = data;
      const items = section.cards.map((card, idx) => {
        const toolUrl = BASE_URL + linkPrefix + '/tool/' + card.slug;
        return {
          '@type': 'ListItem',
          position: idx + 1,
          item: { '@type': 'SoftwareApplication', name: card.name, url: toolUrl }
        };
      });
      jsonLdObj = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: section.title,
        url: fullUrl,
        isPartOf: { '@id': BASE_URL + '/#website' },
        inLanguage: lang,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: items.length,
          itemListElement: items
        }
      };
      break;
    }
    case 'compare': {
      const { preset } = data;
      const slugMap = lang === 'vi' ? viSlugMap : enSlugMap;
      const items = preset.tools.map((tool, idx) => {
        const entry = slugMap.get(tool.cardId);
        const name = entry ? entry.card.name : tool.cardId;
        const toolUrl = BASE_URL + linkPrefix + '/tool/' + tool.cardId;
        return {
          '@type': 'ListItem',
          position: idx + 1,
          item: { '@type': 'SoftwareApplication', name: name, url: toolUrl }
        };
      });
      jsonLdObj = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: preset.title,
        url: fullUrl,
        inLanguage: lang,
        numberOfItems: items.length,
        itemListElement: items
      };
      break;
    }
  }

  const jsonStr = JSON.stringify(jsonLdObj).replace(/<\//g, '<\\/');
  return `<script type="application/ld+json" id="seeaifirst-jsonld">${jsonStr}</script>`;
}

// ── Body content generator ──────────────────────────────────────────

function generateBodyContent(route) {
  const { type, lang, data } = route;
  const linkPrefix = lang === 'vi' ? '/vi' : '';
  const slugMap = lang === 'vi' ? viSlugMap : enSlugMap;

  switch (type) {
    case 'home': {
      const { sections } = data;
      const totalTools = sections.reduce((a, s) => a + s.cards.length, 0);
      const heading = lang === 'en'
        ? 'See AI First \u2014 The Opinionated AI Stack Guide'
        : 'See AI First \u2014 B\u1EA3n \u0110\u1ED3 C\u00F4ng C\u1EE5 AI C\u00F3 Ch\u1ECDn L\u1ECDc';
      const intro = lang === 'en'
        ? `Curated directory of ${totalTools} AI developer tools across ${sections.length} categories.`
        : `Th\u01B0 m\u1EE5c tuy\u1EC3n ch\u1ECDn ${totalTools} c\u00F4ng c\u1EE5 AI d\u00E0nh cho developer trong ${sections.length} danh m\u1EE5c.`;

      const sectionBlocks = sections.map(s => {
        const cardItems = s.cards.map(c => {
          const name = escapeHtml(c.name);
          const normalizedDesc = stripHtml(nullSafe(c.desc, '')).replace(/\s+/g, ' ').trim();
          let summary = sanitizeForShell(c.desc);

          // Fallback to first sentence of detail if desc sanitizes to empty or has bad artifacts
          if (!summary || hasBadArtifacts(summary, normalizedDesc)) {
            summary = '';
            const rawDetail = stripHtml(nullSafe(c.detail, '')).replace(/\s+/g, ' ').trim();
            if (rawDetail) {
              const dotIndex = rawDetail.indexOf('.');
              const firstSentence = dotIndex !== -1 ? rawDetail.substring(0, dotIndex + 1) : rawDetail;
              const normalizedFallback = firstSentence.replace(/\s+/g, ' ').trim();
              summary = sanitizeForShell(firstSentence);
              if (summary && hasBadArtifacts(summary, normalizedFallback)) {
                summary = '';
              }
            }
          }

          if (summary) {
            return `      <li><a href="${linkPrefix}/tool/${c.slug}">${name}</a> \u2014 ${summary}</li>`;
          }
          return `      <li><a href="${linkPrefix}/tool/${c.slug}">${name}</a></li>`;
        }).join('\n');

        return `  <section>\n    <h2>${escapeHtml(s.title)}</h2>\n    <ul>\n${cardItems}\n    </ul>\n  </section>`;
      }).join('\n\n');

      return `<main id="prerender-content">\n  <h1>${escapeHtml(heading)}</h1>\n  <p>${escapeHtml(intro)}</p>\n\n${sectionBlocks}\n</main>`;
    }
    case 'tool': {
      const { card, section } = data;
      const desc = escapeHtml(stripHtml(nullSafe(card.desc, '')));
      let detailLine = '';
      const strippedDetail = stripHtml(nullSafe(card.detail, ''));
      const strippedDesc = stripHtml(nullSafe(card.desc, ''));
      if (strippedDetail && strippedDetail !== strippedDesc) {
        detailLine = `\n      <p>${escapeHtml(truncate(strippedDetail, 200))}</p>`;
      }
      const footerText = lang === 'en'
        ? `Part of <a href="${linkPrefix}/section/${section.id}">${escapeHtml(section.title)}</a> on See AI First.`
        : `Thu\u1ED9c danh m\u1EE5c <a href="${linkPrefix}/section/${section.id}">${escapeHtml(section.title)}</a> tr\u00EAn See AI First.`;

      return `<div id="prerender-content">
  <main>
    <article>
      <h1>${escapeHtml(card.name)}</h1>
      <p>${desc}</p>${detailLine}
      <footer>
        <p>${footerText}</p>
      </footer>
    </article>
  </main>
</div>`;
    }
    case 'section': {
      const { section } = data;
      const badge = nullSafe(section.badge, '');
      const heading = badge ? `${escapeHtml(badge)} ${escapeHtml(section.title)}` : escapeHtml(section.title);
      const intro = lang === 'en'
        ? `Explore ${section.cards.length} curated AI tools in this category.`
        : `Kh\u00E1m ph\u00E1 ${section.cards.length} c\u00F4ng c\u1EE5 AI \u0111\u01B0\u1EE3c tuy\u1EC3n ch\u1ECDn trong danh m\u1EE5c n\u00E0y.`;
      const cardItems = section.cards.map(c =>
        `        <li><a href="${linkPrefix}/tool/${c.slug}">${escapeHtml(c.name)}</a></li>`
      ).join('\n');

      return `<div id="prerender-content">
  <main>
    <article>
      <h1>${heading}</h1>
      <p>${escapeHtml(intro)}</p>
      <ul>
${cardItems}
      </ul>
    </article>
  </main>
</div>`;
    }
    case 'compare': {
      const { preset } = data;
      const toolCount = preset.tools.length;
      const heading = lang === 'en'
        ? `${escapeHtml(preset.title)} \u2014 Comparison`
        : `${escapeHtml(preset.title)} \u2014 So s\u00E1nh`;
      const intro = lang === 'en'
        ? `Side-by-side comparison of ${toolCount} AI tools.`
        : `So s\u00E1nh ${toolCount} c\u00F4ng c\u1EE5 AI.`;
      const toolItems = preset.tools.map(t => {
        const entry = slugMap.get(t.cardId);
        const name = entry ? entry.card.name : t.cardId;
        return `        <li>${escapeHtml(name)}</li>`;
      }).join('\n');

      return `<div id="prerender-content">
  <main>
    <article>
      <h1>${heading}</h1>
      <p>${escapeHtml(intro)}</p>
      <ul>
${toolItems}
      </ul>
    </article>
  </main>
</div>`;
    }
  }
}

// ── Template processing ─────────────────────────────────────────────

const HEAD_RE = /<!-- PRERENDER:HEAD:START -->[\s\S]*?<!-- PRERENDER:HEAD:END -->/;
const BODY_RE = /<!-- PRERENDER:BODY:START -->[\s\S]*?<!-- PRERENDER:BODY:END -->/;
const LANG_RE = /<html lang="[^"]*">/;

// Verify markers exist in template
assert(HEAD_RE.test(templateHtml), 'Template missing <!-- PRERENDER:HEAD:START/END --> markers');
assert(BODY_RE.test(templateHtml), 'Template missing <!-- PRERENDER:BODY:START/END --> markers');

// ── Generate files ──────────────────────────────────────────────────

let generatedCount = 0;

// Generate child route files (167 new files)
for (const route of allRoutes) {
  if (route.outputPath === null) continue; // Skip home EN (in-place update)

  let html = templateHtml;

  // Replace head marker region with route-specific content (no markers for children)
  html = html.replace(HEAD_RE, generateHeadContent(route));

  // Replace body marker region with route-specific content (no markers for children)
  html = html.replace(BODY_RE, generateBodyContent(route));

  // Replace html lang attribute
  html = html.replace(LANG_RE, `<html lang="${route.lang}">`);

  // Write file
  const outputPath = path.join(ROOT, route.outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');
  generatedCount++;
}

// LAST: modify root index.html (home EN) — markers preserved
const homeRoute = allRoutes.find(r => r.outputPath === null);
let rootHtml = templateHtml;

// Replace head with markers preserved
rootHtml = rootHtml.replace(HEAD_RE,
  `<!-- PRERENDER:HEAD:START -->\n${generateHeadContent(homeRoute)}\n<!-- PRERENDER:HEAD:END -->`);

// Replace body with markers preserved
rootHtml = rootHtml.replace(BODY_RE,
  `<!-- PRERENDER:BODY:START -->\n${generateBodyContent(homeRoute)}\n<!-- PRERENDER:BODY:END -->`);

// html lang stays "en" for home EN (no change needed)

fs.writeFileSync(path.join(ROOT, 'index.html'), rootHtml, 'utf8');

console.log(`✅ Generated ${generatedCount} route shell files`);
console.log(`✅ Updated root index.html with home EN content`);
console.log(`✅ Total routes: ${totalRoutes}`);

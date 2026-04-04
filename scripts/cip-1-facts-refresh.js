#!/usr/bin/env node
'use strict';

// =============================================================================
// CIP-1 Structured Facts Refresh
// Report-only scan — does NOT modify data.json or data.vi.json
// =============================================================================

const fs = require('fs');
const path = require('path');

// --- Section 1: Constants ---------------------------------------------------

const DATA_PATH = path.join(__dirname, '..', 'data.json');
const OVERRIDES_PATH = path.join(__dirname, 'cip-1-repo-overrides.json');

const GITHUB_API_BASE = 'https://api.github.com';
const INTER_CALL_DELAY_MS = 100;
const RETRY_DELAY_MS = 2000;
const MAX_REDIRECTS = 5;
const STALENESS_THRESHOLD_DAYS = 90;
const PARITY_ANCHOR = '2026-04-13';
const OUTPUT_DIR = process.env.RUNNER_TEMP
  ? path.join(process.env.RUNNER_TEMP, 'cip-1-output')
  : path.join(require('os').tmpdir(), 'cip-1-output');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_EVENT_NAME = process.env.GITHUB_EVENT_NAME || '';
const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT || '';

// --- Section 2: Helpers -----------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatStarTag(count) {
  const k = count / 1000;
  const rounded = Math.floor(k * 2) / 2; // round down to nearest 0.5K
  if (rounded % 1 === 0) return `${rounded}K⭐`;
  return `${rounded}K⭐`;
}

function deriveRepoFromUrl(url) {
  if (!url || !url.includes('github.com')) return null;
  const m = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/, '');
  return { owner, repo, full: `${owner}/${repo}` };
}

function isRepoLevelStarTag(tag) {
  return /^\d[\d.]*K⭐$/.test(tag);
}

function daysSince(isoDate) {
  if (!isoDate) return Infinity;
  const then = new Date(isoDate);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / 86400000);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function utcDateStr() {
  return new Date().toISOString().split('T')[0];
}

function utcTimestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// --- Section 3: API functions -----------------------------------------------

async function fetchGitHubRepo(owner, repo) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CIP-1-facts-refresh'
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });

      if (res.status === 200) {
        const body = await res.json();
        return {
          ok: true,
          status: res.status,
          stargazers_count: body.stargazers_count,
          license: body.license ? body.license.spdx_id : null,
          archived: body.archived || false,
          html_url: body.html_url,
          default_branch: body.default_branch
        };
      }

      if (res.status === 403) {
        const remaining = res.headers.get('X-RateLimit-Remaining');
        if (remaining === '0') {
          return { ok: false, status: 403, rate_limited: true, transient: true };
        }
      }

      if ((res.status === 429 || res.status >= 500) && attempt === 0) {
        console.log(`  ⚠ ${owner}/${repo}: ${res.status}, retrying in ${RETRY_DELAY_MS}ms...`);
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      return { ok: false, status: res.status, rate_limited: false, transient: false };
    } catch (err) {
      if (attempt === 0) {
        console.log(`  ⚠ ${owner}/${repo}: ${err.message}, retrying...`);
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      return { ok: false, status: 0, error: err.message, transient: true };
    }
  }
}

async function fetchLatestRelease(owner, repo) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases/latest`;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CIP-1-facts-refresh'
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    if (res.status === 200) {
      const body = await res.json();
      return {
        has_releases: true,
        tag_name: body.tag_name,
        published_at: body.published_at
      };
    }
    // 404 = no releases, not an error
    return { has_releases: false, tag_name: null, published_at: null };
  } catch (err) {
    return { has_releases: false, tag_name: null, published_at: null, error: err.message };
  }
}

async function checkSourceUrl(url) {
  const result = { url, ok: false, status: 0, redirects: 0, final_url: url };

  for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
    try {
      const res = await fetch(result.final_url, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(10000),
        headers: { 'User-Agent': 'CIP-1-facts-refresh' }
      });

      // HEAD returned 405 or 403 → fallback to GET
      if (res.status === 405 || res.status === 403) {
        const getRes = await fetch(result.final_url, {
          method: 'GET',
          redirect: 'manual',
          signal: AbortSignal.timeout(10000),
          headers: {
            'User-Agent': 'CIP-1-facts-refresh',
            'Range': 'bytes=0-0'
          }
        });
        result.status = getRes.status;
        if (getRes.status >= 300 && getRes.status < 400) {
          const loc = getRes.headers.get('location');
          if (loc) {
            result.final_url = new URL(loc, result.final_url).href;
            result.redirects++;
            continue;
          }
        }
        result.ok = getRes.status >= 200 && getRes.status < 400;
        return result;
      }

      // Follow redirects
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (loc) {
          result.final_url = new URL(loc, result.final_url).href;
          result.redirects++;
          result.status = res.status;
          continue;
        }
      }

      result.status = res.status;
      result.ok = res.status >= 200 && res.status < 400;
      return result;
    } catch (err) {
      result.status = 0;
      result.error = err.message;
      return result;
    }
  }

  // Exceeded max redirects
  result.error = `Exceeded ${MAX_REDIRECTS} redirects`;
  return result;
}

// --- Section 4: Parity gate ------------------------------------------------

function checkParityGate() {
  // Manual dispatch always runs
  if (GITHUB_EVENT_NAME === 'workflow_dispatch') {
    console.log('ℹ Manual dispatch — parity gate bypassed');
    return true;
  }

  const anchor = new Date(PARITY_ANCHOR + 'T00:00:00Z');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const deltaDays = Math.floor((today.getTime() - anchor.getTime()) / 86400000);

  if (deltaDays < 0) {
    console.log(`ℹ Before anchor date (${PARITY_ANCHOR}), skipping`);
    return false;
  }

  const isParityWeek = deltaDays % 14 < 7;
  if (!isParityWeek) {
    console.log(`ℹ Off-parity week (day delta: ${deltaDays}), skipping`);
    return false;
  }

  console.log(`ℹ Parity week (day delta: ${deltaDays}), proceeding`);
  return true;
}

// --- Section 5: Data loading + eligibility ----------------------------------

function loadData() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);
  const allCards = data.sections.flatMap(s => s.cards);
  console.log(`ℹ Loaded ${allCards.length} cards from data.json`);
  return { data, allCards };
}

function loadOverrides() {
  const raw = fs.readFileSync(OVERRIDES_PATH, 'utf8');
  return JSON.parse(raw);
}

function buildEligibleCards(allCards, overrides) {
  const eligible = [];
  const overridden = [];
  const skipped = [];

  for (const card of allCards) {
    const slug = card.slug;
    const override = overrides[slug];

    if (override) {
      overridden.push({ slug, mode: override.mode, reason: override.reason });
      continue;
    }

    if (card.github_stars == null) {
      skipped.push({ slug, reason: 'no github_stars' });
      continue;
    }

    // Derive repo from sources
    const ghUrls = (card.sources || [])
      .map(s => s.url)
      .filter(u => u && u.includes('github.com'))
      .map(deriveRepoFromUrl)
      .filter(Boolean);

    if (ghUrls.length !== 1) {
      skipped.push({ slug, reason: `${ghUrls.length} derivable repo URLs` });
      continue;
    }

    eligible.push({
      slug,
      name: card.name,
      github_stars: card.github_stars,
      verified_at: card.verified_at,
      license: card.license,
      tags: card.tags || [],
      sources: card.sources || [],
      repo: ghUrls[0]
    });
  }

  console.log(`ℹ Eligible: ${eligible.length} | Overridden: ${overridden.length} | Skipped: ${skipped.length}`);
  return { eligible, overridden, skipped };
}

// --- Section 6: Main scan loop ----------------------------------------------

async function scanCards(eligible) {
  const results = [];
  console.log(`\n🔍 Scanning ${eligible.length} cards...\n`);

  for (let i = 0; i < eligible.length; i++) {
    const card = eligible[i];
    const { owner, repo } = card.repo;
    console.log(`[${i + 1}/${eligible.length}] ${card.slug} → ${owner}/${repo}`);

    // GitHub API: repo info
    const repoResult = await fetchGitHubRepo(owner, repo);
    await sleep(INTER_CALL_DELAY_MS);

    // GitHub API: latest release
    const releaseResult = await fetchLatestRelease(owner, repo);
    await sleep(INTER_CALL_DELAY_MS);

    // Non-GitHub source URL checks
    const nonGhSources = (card.sources || [])
      .filter(s => s.url && !s.url.includes('github.com'));
    const urlResults = [];
    for (const src of nonGhSources) {
      const urlResult = await checkSourceUrl(src.url);
      urlResults.push({ title: src.title, ...urlResult });
      await sleep(INTER_CALL_DELAY_MS);
    }

    results.push({
      slug: card.slug,
      name: card.name,
      card,
      repoResult,
      releaseResult,
      urlResults,
      scanned_at: utcTimestamp()
    });
  }

  console.log(`\n✅ Scan complete: ${results.length} cards processed\n`);
  return results;
}

// --- Section 7: Finding computation -----------------------------------------

function computeFindings(scanResults, allCards, overridden) {
  const changes = [];
  const healthIssues = [];
  const staleCards = [];
  const releaseSignals = [];
  const blockedCards = [];

  // --- A. Star drift + B. Tag drift ---
  for (const r of scanResults) {
    if (!r.repoResult || !r.repoResult.ok) continue;

    const liveStars = r.repoResult.stargazers_count;
    const currentStars = r.card.github_stars;
    const absDelta = Math.abs(liveStars - currentStars);
    const pctDelta = currentStars > 0 ? (absDelta / currentStars) * 100 : 100;

    // Star drift: flag if >500 absolute OR >5% relative
    if (absDelta > 500 || pctDelta > 5) {
      changes.push({
        card_slug: r.slug,
        dataset_targets: ['en', 'vi'],
        change_type: 'stars_update',
        field: 'github_stars',
        current: currentStars,
        proposed: liveStars,
        reason: `Delta: ${liveStars > currentStars ? '+' : ''}${liveStars - currentStars} (${pctDelta.toFixed(1)}%)`,
        evidence: {
          type: 'github_api',
          source: `${GITHUB_API_BASE}/repos/${r.card.repo.full}`,
          observed_at: r.scanned_at
        },
        severity: absDelta > 5000 ? 'high' : absDelta > 1000 ? 'medium' : 'low',
        confidence: 'high'
      });

      // B. Tag drift — only if star drift found AND card has repo-level star tag
      const starTags = r.card.tags.filter(isRepoLevelStarTag);
      if (starTags.length > 0) {
        const candidateTag = formatStarTag(liveStars);
        for (const currentTag of starTags) {
          if (candidateTag !== currentTag) {
            changes.push({
              card_slug: r.slug,
              dataset_targets: ['en', 'vi'],
              change_type: 'tag_sync',
              field: 'tags',
              current: currentTag,
              proposed: candidateTag,
              reason: `Star count changed: ${currentStars} → ${liveStars}`,
              evidence: {
                type: 'github_api',
                source: `${GITHUB_API_BASE}/repos/${r.card.repo.full}`,
                observed_at: r.scanned_at
              },
              severity: 'low',
              confidence: 'high'
            });
          }
        }
      }
    }
  }

  // --- C. Repo health ---
  for (const r of scanResults) {
    // GitHub API health
    if (r.repoResult && !r.repoResult.ok) {
      if (r.repoResult.rate_limited) {
        // Transient — not a health finding, just log
        continue;
      }
      healthIssues.push({
        card_slug: r.slug,
        source: `github.com/${r.card.repo.full}`,
        status: r.repoResult.status,
        severity: r.repoResult.status === 404 ? 'high' : 'medium',
        notes: r.repoResult.status === 404
          ? 'Repo not found after retry'
          : `HTTP ${r.repoResult.status}`,
        evidence: {
          type: 'github_api',
          source: `${GITHUB_API_BASE}/repos/${r.card.repo.full}`,
          observed_at: r.scanned_at
        }
      });
    }

    // Archived check
    if (r.repoResult && r.repoResult.ok && r.repoResult.archived) {
      healthIssues.push({
        card_slug: r.slug,
        source: `github.com/${r.card.repo.full}`,
        status: 'archived',
        severity: 'medium',
        notes: 'Repository is archived',
        evidence: {
          type: 'github_api',
          source: `${GITHUB_API_BASE}/repos/${r.card.repo.full}`,
          observed_at: r.scanned_at
        }
      });
    }

    // Redirect check (html_url differs from expected)
    if (r.repoResult && r.repoResult.ok && r.repoResult.html_url) {
      const expected = `https://github.com/${r.card.repo.full}`;
      if (r.repoResult.html_url.toLowerCase() !== expected.toLowerCase()) {
        healthIssues.push({
          card_slug: r.slug,
          source: expected,
          status: 'redirect',
          severity: 'medium',
          notes: `Repo moved to ${r.repoResult.html_url}`,
          evidence: {
            type: 'github_api',
            source: `${GITHUB_API_BASE}/repos/${r.card.repo.full}`,
            observed_at: r.scanned_at
          }
        });
      }
    }

    // Non-GitHub URL health
    for (const u of r.urlResults) {
      if (u.status === 404 || u.status === 410) {
        healthIssues.push({
          card_slug: r.slug,
          source: u.url,
          status: u.status,
          severity: 'high',
          notes: `HTTP ${u.status}` + (u.error ? `: ${u.error}` : ''),
          evidence: {
            type: 'http_check',
            source: u.url,
            observed_at: r.scanned_at
          }
        });
      } else if (u.status === 0 && u.error) {
        healthIssues.push({
          card_slug: r.slug,
          source: u.url,
          status: 'timeout',
          severity: 'low',
          notes: u.error,
          evidence: {
            type: 'http_check',
            source: u.url,
            observed_at: r.scanned_at
          }
        });
      } else if (u.redirects >= 3) {
        healthIssues.push({
          card_slug: r.slug,
          source: u.url,
          status: `${u.redirects} redirects`,
          severity: 'medium',
          notes: `Final URL: ${u.final_url}`,
          evidence: {
            type: 'http_check',
            source: u.url,
            observed_at: r.scanned_at
          }
        });
      }
    }
  }

  // --- D. Stale verified_at (all 66 cards) ---
  for (const card of allCards) {
    const days = daysSince(card.verified_at);
    if (days >= STALENESS_THRESHOLD_DAYS) {
      staleCards.push({
        card_slug: card.slug,
        verified_at: card.verified_at || null,
        days_stale: days === Infinity ? 'never verified' : days
      });
    }
  }

  // --- E. Blocked/manual ---
  for (const o of overridden) {
    blockedCards.push({
      card_slug: o.slug,
      mode: o.mode,
      reason: o.reason
    });
  }

  // --- F. Release signals (appendix) ---
  for (const r of scanResults) {
    releaseSignals.push({
      card_slug: r.slug,
      has_releases: r.releaseResult.has_releases,
      latest_tag: r.releaseResult.tag_name,
      date: r.releaseResult.published_at
        ? r.releaseResult.published_at.split('T')[0]
        : null
    });
  }

  return { changes, healthIssues, staleCards, releaseSignals, blockedCards };
}

// --- Section 8: Output generation -------------------------------------------

function generateCandidateJson(findings, scanResults, runType) {
  return {
    run_date: utcDateStr(),
    run_type: runType,
    pipeline: 'CIP-1',
    anchor_date: PARITY_ANCHOR,
    cards_scanned: scanResults.length,
    changes: findings.changes,
    health_issues: findings.healthIssues,
    stale_cards: findings.staleCards,
    release_signals: findings.releaseSignals,
    blocked_cards: findings.blockedCards
  };
}

function generatePrBody(findings, scanResults, runType) {
  const date = utcDateStr();
  const hasAnyFinding = findings.changes.length > 0
    || findings.healthIssues.length > 0
    || findings.staleCards.length > 0;
  const hasPartial = scanResults.some(r => r.repoResult && r.repoResult.rate_limited);

  let status = 'PASS';
  if (hasPartial) status = 'PARTIAL';
  if (hasAnyFinding) status = 'PASS with findings';

  const lines = [];
  lines.push(`## Content Integrity Report — ${date}`);
  lines.push('');
  lines.push(`**Run type:** ${runType === 'manual' ? 'manual dispatch' : 'scheduled bi-weekly'}`);
  lines.push(`**Scope:** CIP-1 (Structured Facts Refresh)`);
  lines.push(`**Status:** ${status}`);
  lines.push('');

  // Summary
  const starDrift = findings.changes.filter(c => c.change_type === 'stars_update');
  const tagSync = findings.changes.filter(c => c.change_type === 'tag_sync');
  lines.push('### Summary');
  lines.push(`- Eligible cards scanned: ${scanResults.length}`);
  lines.push(`- **Primary findings:**`);
  lines.push(`  - Star drift: ${starDrift.length}`);
  lines.push(`  - Tag sync candidates: ${tagSync.length}`);
  lines.push(`  - Repo health issues: ${findings.healthIssues.length}`);
  lines.push(`  - Stale verified_at: ${findings.staleCards.length}`);
  lines.push(`  - Blocked by mapping/manual: ${findings.blockedCards.length}`);
  lines.push(`- **Appendix signal:**`);
  lines.push(`  - Release existence: ${findings.releaseSignals.filter(r => r.has_releases).length}`);
  lines.push('');

  // Star Drift table
  lines.push('### Star Drift');
  if (starDrift.length === 0) {
    lines.push('No star drift detected.');
  } else {
    lines.push('| Card | Current | Live | Delta | Repo |');
    lines.push('|------|---------|------|-------|------|');
    for (const c of starDrift) {
      const delta = c.proposed - c.current;
      const sign = delta > 0 ? '+' : '';
      lines.push(`| ${c.card_slug} | ${c.current.toLocaleString()} | ${c.proposed.toLocaleString()} | ${sign}${delta.toLocaleString()} | ${c.evidence.source.replace(GITHUB_API_BASE + '/repos/', '')} |`);
    }
  }
  lines.push('');

  // Tag Sync table
  lines.push('### Tag Sync Candidates');
  if (tagSync.length === 0) {
    lines.push('No tag sync needed.');
  } else {
    lines.push('| Card | Current Tag | Recommended Tag | Reason |');
    lines.push('|------|-------------|-----------------|--------|');
    for (const c of tagSync) {
      lines.push(`| ${c.card_slug} | ${c.current} | ${c.proposed} | ${c.reason} |`);
    }
  }
  lines.push('');

  // Repo Health table
  lines.push('### Repo Health Issues');
  if (findings.healthIssues.length === 0) {
    lines.push('No repo health issues detected.');
  } else {
    lines.push('| Card | Source | Status | Severity | Notes |');
    lines.push('|------|--------|--------|----------|-------|');
    for (const h of findings.healthIssues) {
      lines.push(`| ${h.card_slug} | ${h.source} | ${h.status} | ${h.severity} | ${h.notes} |`);
    }
  }
  lines.push('');

  // Stale verified_at table
  lines.push('### Stale verified_at');
  if (findings.staleCards.length === 0) {
    lines.push('All cards verified within threshold.');
  } else {
    lines.push('| Card | verified_at | Days Stale |');
    lines.push('|------|-------------|------------|');
    for (const s of findings.staleCards) {
      lines.push(`| ${s.card_slug} | ${s.verified_at || '(missing)'} | ${s.days_stale} |`);
    }
  }
  lines.push('');

  // Release Signals table
  lines.push('### Release Signals (appendix)');
  const withReleases = findings.releaseSignals.filter(r => r.has_releases);
  if (withReleases.length === 0) {
    lines.push('No release signals detected.');
  } else {
    lines.push('| Card | Has Releases | Latest Tag | Date |');
    lines.push('|------|-------------|------------|------|');
    for (const r of withReleases) {
      lines.push(`| ${r.card_slug} | ✅ | ${r.latest_tag || '—'} | ${r.date || '—'} |`);
    }
  }
  lines.push('');

  // Blocked / Manual table
  lines.push('### Blocked / Manual Review');
  if (findings.blockedCards.length === 0) {
    lines.push('No blocked cards.');
  } else {
    lines.push('| Card | Mode | Reason |');
    lines.push('|------|------|--------|');
    for (const b of findings.blockedCards) {
      lines.push(`| ${b.card_slug} | ${b.mode} | ${b.reason} |`);
    }
  }
  lines.push('');

  // Recommended Next Steps
  lines.push('### Recommended Next Steps');
  if (starDrift.length > 0 || tagSync.length > 0) {
    lines.push(`- PR-A: Star/tag refresh for ${starDrift.length} cards (metadata-only, Baron approve)`);
  }
  if (findings.healthIssues.length > 0) {
    lines.push(`- PR-B: Source mapping cleanup for ${findings.healthIssues.length} issues (G review needed)`);
  }
  if (findings.staleCards.length > 0) {
    lines.push(`- PR-C: Manual re-verify for ${findings.staleCards.length} stale cards`);
  }
  if (starDrift.length === 0 && findings.healthIssues.length === 0 && findings.staleCards.length === 0) {
    lines.push('- No action items this cycle.');
  }
  lines.push('');

  // Footer
  lines.push('### Footer');
  lines.push('- No canonical data changed automatically');
  lines.push('- One open CIP-1 PR policy active');
  lines.push('- Artifact: see Actions run for raw diagnostics');
  lines.push('- Awaiting Baron decision');
  lines.push('');

  return lines.join('\n');
}

function generateDiagnostics(scanResults, eligible, overridden, skipped) {
  return {
    generated_at: utcTimestamp(),
    eligible_count: eligible.length,
    overridden_count: overridden.length,
    skipped_count: skipped.length,
    scan_results: scanResults.map(r => ({
      slug: r.slug,
      scanned_at: r.scanned_at,
      repo: r.card.repo.full,
      github_api: r.repoResult,
      release: r.releaseResult,
      url_checks: r.urlResults
    }))
  };
}

function writeOutputs(candidateJson, prBody, diagnostics) {
  ensureDir(OUTPUT_DIR);

  const jsonPath = path.join(OUTPUT_DIR, 'cip-1-candidate-updates.json');
  const prBodyPath = path.join(OUTPUT_DIR, 'cip-1-pr-body.md');
  const diagPath = path.join(OUTPUT_DIR, 'cip-1-diagnostics.json');

  fs.writeFileSync(jsonPath, JSON.stringify(candidateJson, null, 2), 'utf8');
  fs.writeFileSync(prBodyPath, prBody, 'utf8');
  fs.writeFileSync(diagPath, JSON.stringify(diagnostics, null, 2), 'utf8');

  console.log(`📄 candidate-updates.json → ${jsonPath}`);
  console.log(`📄 pr-body.md → ${prBodyPath}`);
  console.log(`📄 diagnostics.json → ${diagPath}`);

  return { jsonPath, prBodyPath, diagPath };
}

// --- Section 9: GITHUB_OUTPUT writing ---------------------------------------

function writeGithubOutput(resultStatus, prBodyPath, jsonPath) {
  if (!GITHUB_OUTPUT) {
    console.log('ℹ GITHUB_OUTPUT not set (local run), skipping output writing');
    console.log(`  result_status=${resultStatus}`);
    return;
  }

  const lines = [
    `result_status=${resultStatus}`,
    `pr_body_path=${prBodyPath}`,
    `json_path=${jsonPath}`
  ];
  fs.appendFileSync(GITHUB_OUTPUT, lines.join('\n') + '\n', 'utf8');
  console.log(`📤 GITHUB_OUTPUT: result_status=${resultStatus}`);
}

// --- Section 10: Main entry point -------------------------------------------

async function main() {
  console.log('=== CIP-1 Structured Facts Refresh ===\n');

  const runType = GITHUB_EVENT_NAME === 'workflow_dispatch' ? 'manual' : 'scheduled';

  // Parity gate
  if (!checkParityGate()) {
    writeGithubOutput('no_findings', '', '');
    console.log('\n✅ Parity gate: not this week. Exiting cleanly.');
    return;
  }

  // Load data
  const { allCards } = loadData();
  const overrides = loadOverrides();
  const { eligible, overridden, skipped } = buildEligibleCards(allCards, overrides);

  if (eligible.length === 0) {
    console.log('⚠ No eligible cards to scan');
    writeGithubOutput('no_findings', '', '');
    return;
  }

  // Scan
  const scanResults = await scanCards(eligible);

  // Compute findings
  const findings = computeFindings(scanResults, allCards, overridden);

  // Generate outputs
  const candidateJson = generateCandidateJson(findings, scanResults, runType);
  const prBody = generatePrBody(findings, scanResults, runType);
  const diagnostics = generateDiagnostics(scanResults, eligible, overridden, skipped);
  const { jsonPath, prBodyPath } = writeOutputs(candidateJson, prBody, diagnostics);

  // Determine result
  const hasFindings = findings.changes.length > 0
    || findings.healthIssues.length > 0
    || findings.staleCards.length > 0;
  const resultStatus = hasFindings ? 'has_findings' : 'no_findings';

  writeGithubOutput(resultStatus, prBodyPath, jsonPath);

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Star drift: ${findings.changes.filter(c => c.change_type === 'stars_update').length}`);
  console.log(`Tag sync: ${findings.changes.filter(c => c.change_type === 'tag_sync').length}`);
  console.log(`Health issues: ${findings.healthIssues.length}`);
  console.log(`Stale cards: ${findings.staleCards.length}`);
  console.log(`Blocked: ${findings.blockedCards.length}`);
  console.log(`Release signals: ${findings.releaseSignals.filter(r => r.has_releases).length}`);
  console.log(`\nResult: ${resultStatus}`);
}

main().catch(err => {
  console.error('❌ Unrecoverable error:', err.message);
  if (GITHUB_OUTPUT) {
    fs.appendFileSync(GITHUB_OUTPUT, 'result_status=error\n', 'utf8');
  }
  process.exit(1);
});

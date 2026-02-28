# Contributing to See AI First

Thank you for your interest in contributing! See AI First is a curated directory of AI developer tools, and community input helps keep it accurate and comprehensive.

## Ways to Contribute

### 1. Suggest a Tool

The easiest way to contribute — no coding required.

→ [Open a "Suggest a Tool" issue](https://github.com/BARONFANTHE/seeaifirst/issues/new?template=suggest-tool.yml)

We'll review your suggestion against our evaluation criteria and add it if it qualifies.

### 2. Report a Bug

Found a broken link, incorrect data, or UI issue?

→ [Open a bug report](https://github.com/BARONFANTHE/seeaifirst/issues/new)

Please include: what you expected, what happened, and browser/device info if relevant.

### 3. Improve Data via Pull Request

For experienced contributors who want to directly update tool data.

**Before submitting a PR:**

1. Fork the repo and create a branch from `main`
2. Edit `data.json` only — do not modify `index.html` or other files
3. One tool per PR — keep changes small and reviewable
4. Run the validator: `npm install && node scripts/validate.js` (must show 8/8 PASS)
5. Test locally: `python -m http.server 8000` then open `http://localhost:8000`
6. Submit your PR with a clear description of what changed and why

## Tool Evaluation Criteria

Not every tool belongs here. We evaluate suggestions against 5 criteria:

| Criteria | Minimum Threshold |
|----------|-------------------|
| **GitHub Stars** | Usually >5K ⭐ — exceptions allowed for innovative tools with strong rationale + evidence |
| **Relevance** | Must be part of the AI developer ecosystem |
| **Maturity** | Has documentation, active development, community |
| **Uniqueness** | Does not duplicate an existing card's functionality |
| **Category Fit** | Fits within existing 13 sections (new sections require strong justification) |

## Data Format

Each tool is a card in `data.json`. Here's an example:

```json
{
  "name": "Tool Name",
  "slug": "tool-name",
  "desc": "Short description (1 line)",
  "added_date": "2026-03-01",
  "detail": "Detailed description (2-7 lines)",
  "sources": [
    { "title": "GitHub", "url": "https://github.com/org/repo" },
    { "title": "Website", "url": "https://example.com" }
  ],
  "pricing": "free",
  "deployment": "self-hosted",
  "difficulty": "intermediate",
  "whenToUse": ["phrase 1", "phrase 2"],
  "whenNotToUse": ["phrase 1", "phrase 2"],
  "compatibleWith": ["slug-1", "slug-2"],
  "useCases": ["use-case-tag"],
  "languages": ["python", "js"],
  "github_stars": 15000,
  "license": "MIT",
  "verified_at": "2026-03-01",
  "verification_source": "docs"
}
```

**Key rules:**

- `slug`: lowercase, kebab-case, immutable once assigned. If you think a slug is wrong, open an issue — do not rename existing slugs in a PR.
- `pricing`: one of `free`, `freemium`, `paid`, `open-core`
- `deployment`: one of `cloud`, `self-hosted`, `local`, `hybrid`
- `difficulty`: one of `beginner`, `intermediate`, `advanced`
- `sources`: use key `"title"` (not `"label"`)
- `compatibleWith`: use canonical slugs from existing cards
- `github_stars` / `license`: only set when there is a clearly primary official GitHub repo. If unsure, omit (set `null` or leave out).

## What We Don't Accept

- Tools with no GitHub presence or documentation
- Duplicate functionality with an existing card
- Spam or self-promotional submissions without substance
- Changes to `index.html` or project configuration files

## Response Time

This is a solo-maintained project. Please allow a few days for responses. All submissions are appreciated, even if they don't result in an addition.

## Code of Conduct

Be respectful. No spam, harassment, or discriminatory content. Contributions should be constructive and made in good faith.

---

*Questions? Open an issue and we'll help you out.*

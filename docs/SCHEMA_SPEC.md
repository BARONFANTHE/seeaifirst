# AI Mindmap — Card Schema Specification v1.0.0-draft

> **Status:** DRAFT — will become v1.0.0 after A3 freeze
> **Date:** 2026-02-10
> **Purpose:** Defines all card fields, types, enums, and validation rules for AI Mindmap data.json

---

## 1. Existing Fields

Fields currently present in `data.json` cards.

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `name` | string | Yes | Tool name |
| `desc` | string (HTML OK) | Yes | Short description, 1 line |
| `detail` | string (HTML OK) | Yes | Detailed description, 2-7 lines. New cards end with `\n\nKết hợp tốt với: [tool1] · [tool2]` |
| `added_date` | string (YYYY-MM-DD) | Yes | Date card was added |
| `sources` | array of `{title, url}` | Yes | Key = `"title"` (NOT `"label"`) |
| `icon` | string | No | Icon path or emoji |
| `mono` | boolean | No | Monochrome icon flag |
| `hot` | boolean | No | Hot/trending badge |
| `tags` | array of string | No | Display tags (e.g., "Python SDK 21K⭐") |
| `tagColors` | object | No | Per-tag color overrides |
| `tagColor` | string | No | Default tag color |
| `note` | string | No | Extra note displayed on card |
| `subItems` | array | No | Sub-items list |
| `levels` | array | No | Skill levels |
| `extraBadges` | array | No | Additional badges |

---

## 2. New Enrichment Fields

12 fields (10 required + 2 optional) to be added during A2 batch enrichment.

| Field | Type | Required | Valid Values | Example |
|-------|------|:--------:|-------------|---------|
| `pricing` | enum string | Yes | `"free"` \| `"freemium"` \| `"paid"` \| `"open-core"` | `"free"` |
| `deployment` | enum string | Yes | `"cloud"` \| `"self-hosted"` \| `"local"` \| `"hybrid"` | `"local"` |
| `difficulty` | enum string | Yes | `"beginner"` \| `"intermediate"` \| `"advanced"` | `"beginner"` |
| `whenToUse` | array of string | Yes (min 1) | Free-form short phrases | `["local inference", "prototyping", "privacy-sensitive"]` |
| `whenNotToUse` | array of string | Yes (min 1) | Free-form short phrases | `["high-throughput production", "multi-GPU cluster"]` |
| `compatibleWith` | array of string | Yes (min 1) | Card slugs (lowercase, kebab-case) | `["dify", "langfuse", "pgvector"]` |
| `useCases` | array of string | Yes (min 1) | Kebab-case use case tags | `["local-llm", "dev-testing", "rag-pipeline"]` |
| `languages` | array of string | Yes (min 1) | Lowercase language/runtime names | `["python", "js", "go", "rust"]` |
| `verified_at` | string (YYYY-MM-DD) | Yes | ISO date | `"2026-02-10"` |
| `verification_source` | enum string | Yes | `"docs"` \| `"tested"` \| `"inferred"` | `"docs"` |
| `github_stars` | number \| null | No | Integer or null if not on GitHub | `162000` |
| `license` | string \| null | No | SPDX identifier or null | `"MIT"` |

---

## 3. Enum Definitions

### pricing

| Value | Meaning |
|-------|---------|
| `free` | Completely free, no paid tier |
| `freemium` | Free tier + paid features |
| `paid` | Requires payment to use |
| `open-core` | Open-source core + commercial add-ons |

### deployment

| Value | Meaning |
|-------|---------|
| `cloud` | SaaS / hosted service |
| `self-hosted` | Deploy on own server |
| `local` | Run on local machine |
| `hybrid` | Multiple deployment options |

### difficulty

| Value | Meaning |
|-------|---------|
| `beginner` | Quick start, minimal config, good docs |
| `intermediate` | Requires some technical knowledge |
| `advanced` | Complex setup, deep expertise needed |

### verification_source

| Value | Meaning |
|-------|---------|
| `docs` | Verified from official documentation/GitHub |
| `tested` | Baron personally installed and used |
| `inferred` | Logical deduction from verified facts |

---

## 4. Null/Missing Value Rules

- **Required enrichment fields:** MUST be present, MUST NOT be null
- **Optional fields** (`github_stars`, `license`): use `null` if unknown (NOT empty string, NOT `"unknown"`)
- **Array fields:** MUST have at least 1 item (empty arrays `[]` not allowed for required array fields)
- **Existing optional fields** (`icon`, `tags`, etc.): may be absent — no change to existing behavior

---

## 5. `compatibleWith` Slug Convention

Slugs reference other cards by lowercase, kebab-case transformation of card name.

### Examples

| Card Name | Slug |
|-----------|------|
| Claude Code | `claude-code` |
| Pydantic AI | `pydantic-ai` |
| RAGFlow | `ragflow` |
| Claude.ai | `claude-ai` |
| AutoGen/AG2 | `autogen` |
| Cline/RooCode | `cline-roocode` |

### Normalization Rule

1. Remove punctuation (`. / + ( )`)
2. Replace spaces with hyphens
3. Collapse consecutive hyphens to single hyphen
4. Strip leading/trailing hyphens
5. Lowercase

Slugs MUST match actual card names in `data.json` — validated by A3 script.

---

## 6. Versioning Rules

Schema follows semver after A3 freeze.

| Change Type | Version Bump | Example |
|-------------|:------------:|---------|
| Typo fix in spec, no data change | Patch (1.0.x) | 1.0.0 -> 1.0.1 |
| Add new optional field (backwards compatible) | Minor (1.x.0) | 1.0.0 -> 1.1.0 |
| Change/remove existing field (breaking) | Major (x.0.0) | 1.0.0 -> 2.0.0 |

**Breaking changes** require 1-week deprecation notice in CHANGELOG + GitHub release.

---

## 7. Example: Complete Enriched Card

```json
{
  "name": "Ollama",
  "desc": "Chạy LLM cục bộ dễ dàng, hỗ trợ GGUF/safetensors, API tương thích OpenAI",
  "detail": "...(existing detail)...",
  "added_date": "2026-02-08",
  "sources": [
    { "title": "GitHub", "url": "https://github.com/ollama/ollama" },
    { "title": "Website", "url": "https://ollama.com" }
  ],
  "hot": true,
  "pricing": "free",
  "deployment": "local",
  "difficulty": "beginner",
  "whenToUse": ["local inference", "prototyping", "privacy-sensitive", "offline development"],
  "whenNotToUse": ["high-throughput production", "multi-GPU cluster"],
  "compatibleWith": ["dify", "ragflow", "langfuse", "pgvector", "litellm"],
  "useCases": ["local-llm", "dev-testing", "rag-pipeline", "model-experimentation"],
  "languages": ["python", "js", "go", "rust", "curl"],
  "verified_at": "2026-02-10",
  "verification_source": "tested",
  "github_stars": 162000,
  "license": "MIT"
}
```

---

## 8. Meta Object Contract

The top-level `meta` object in `data.json` includes:

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Mindmap title |
| `subtitle` | string | Mindmap subtitle |
| `lastUpdated` | string (YYYY-MM-DD) | Last content update date |
| `updatedBy` | string | Who last updated |
| `version` | string | App/content version |
| `schema_version` | string (semver) | Schema version (tracks this spec) |
| `updated_at` | string (ISO 8601) | Last update timestamp |
| `tools_count` | number | Total card count across all sections |
| `sections_count` | number | Total section count |

**Note:** `meta.schema_version` reflects the current state of data.json; the spec header version reflects the target. Both will align after A3 freeze at `1.0.0`.

---

*Track A1 of 3-track execution plan (Strategic Analysis Report v3.2)*

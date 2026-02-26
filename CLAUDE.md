# AI Mindmap - Claude Code Instructions

> **⚠️ File này dành cho Claude Code. Nếu bạn là Claude.ai, xem `docs/CLAUDE_AI.md`.**

## Project Overview

Website tương tác mapping hệ sinh thái AI 2026 — protocols, frameworks, tools, trends — dành cho developers Việt Nam.

| Item | Value |
|------|-------|
| Tech | Static HTML + CSS + Vanilla JS + data.json |
| PROD | https://ai-mindmap-ochre.vercel.app |
| Repo | https://github.com/BARONFANTHE/ai-mindmap |
| Local | C:\Projects\ai-mindmap |
| Deploy | Vercel auto-deploy from `main` branch |

## Current State

| Item | Value |
|------|-------|
| **Version** | v6.3 (deployed, SECTIONS FROZEN) |
| **meta.version** | "6.3" |
| **meta.schema_version** | "0.1.0-draft" |
| **Cards** | 66 cards, 13 sections, 5 layers |
| **Compare** | 4 presets (vector-databases, rag-systems, coding-agents, frameworks) |
| **SEO** | sitemap.xml + robots.txt + canonical + English meta — live |
| **OG Image** | og-image.png generated via script (66 Tools, 13 Sections, v6.2) |
| **Last Deploy** | 2026-02-25 |
| **Enriched** | 48/66 (73%) (Batch 01-05B: protocols, platforms, orchestration, memory, infrastructure, security, observability, vector-databases, rag-systems, frameworks 10/10, coding-agents 7/11) |
| **Latest Commit** | 636d9a7 |

## Architecture

```
/ai-mindmap
├── index.html                    # Main page (UI + CSS + JS inline)
├── data.json                     # Content data (66 cards, 13 sections)
├── og-image.png                  # Social preview image (1200×630, generated)
├── sitemap.xml                   # SEO — 5 URLs for crawlers + AI agents
├── robots.txt                    # SEO — allow all + sitemap reference
├── package.json                  # npm deps (canvas as devDependency)
├── package-lock.json             # npm lock file
├── CLAUDE.md                     # Instructions cho Claude Code (file này)
├── README.md                     # Project README
├── CHANGELOG.md                  # Version history
├── .gitignore                    # Git ignore rules (docs/* except SCHEMA_SPEC.md)
├── scripts/
│   └── generate-og-image.js      # OG image generator (node-canvas, run manually)
├── docs/
│   ├── SCHEMA_SPEC.md            # Card schema spec v0.1.0-draft (TRACKED)
│   ├── CLAUDE_AI.md              # Instructions cho Claude.ai (NOT tracked)
│   ├── SESSION_HANDOFF.md        # Session state handoff (NOT tracked)
│   ├── DECISIONS_LOG.md          # Decision history (NOT tracked)
│   └── ...                       # Other internal docs (NOT tracked)
├── .github/
│   └── ISSUE_TEMPLATE/
│       └── suggest-tool.yml      # "Suggest a Tool" issue template
└── skills/
    └── MINDMAP_UPDATE.md         # Guide for updating mindmap content
```

**Data Flow:**
1. Browser loads `index.html`
2. JS `fetch('data.json')` → parse JSON
3. Render tree sidebar (sections grouped by layers)
4. Click section → show cards in newspaper grid layout
5. Click card → expand detail + sources
6. Compare mode: overlay with table/flip layout

## Data Structure — data.json

### Root-level keys

```json
{
  "meta": {
    "title": "...",
    "subtitle": "...",
    "lastUpdated": "...",
    "updatedBy": "...",
    "version": "6.3",
    "schema_version": "0.1.0-draft",
    "updated_at": "2026-02-11T00:00:00Z",
    "tools_count": 66,
    "sections_count": 13
  },
  "layers": [
    {
      "id": "foundation",
      "title": "Layer Title",
      "sectionIds": ["protocols", "frameworks", "vector-databases"]
    }
  ],
  "sections": [
    {
      "id": "protocols",
      "title": "Protocols — Nền tảng giao tiếp chuẩn",
      "color": "#...",
      "badge": "🔌",
      "cards": [...]
    }
  ],
  "workflow": { ... },
  "relations": [ ... ],
  "comparison_presets": [ ... ]
}
```

### ⚠️ CRITICAL — Schema Key Facts

> **Đọc kỹ trước khi sửa data.json. Dùng sai key = data corruption.**

| Đúng ✅ | Sai ❌ | Ghi chú |
|---------|--------|---------|
| `"cards"` | ~~`"items"`~~ | Array chứa cards trong section |
| `"badge"` | ~~`"emoji"`~~ | Section icon |
| `"title"` | ~~`"label"`~~ | Key trong sources array |
| `"color"` | | Section color, không có field `"emoji"` |

**Other key facts:**
- Sections ở root level (KHÔNG nested trong layers)
- Layers reference sections bằng `sectionIds`
- workflow và relations tồn tại nhưng chưa render trên UI
- `comparison_presets[]` chứa data cho Compare Mode overlay (v6.0+)

### Card Schema

**Required fields:**
```json
{
  "name": "Tool Name",
  "desc": "Short description (1 line, có thể chứa HTML)",
  "added_date": "2026-02-03",
  "detail": "Detailed description (2-7 lines, new cards end with 'Kết hợp tốt với:')",
  "sources": [
    { "title": "GitHub", "url": "https://github.com/..." },
    { "title": "Website", "url": "https://..." }
  ]
}
```

**Optional fields (có trên một số cards):**
```json
{
  "icon": "",
  "mono": true,
  "hot": true,
  "tags": ["Python SDK 21K⭐", "TS SDK 11K⭐"],
  "tagColors": { "tag_name": "#hex" },
  "tagColor": "#hex",
  "note": "Extra note",
  "subItems": [],
  "levels": [],
  "extraBadges": []
}
```

**New enrichment fields (defined in SCHEMA_SPEC.md, đang rollout trong A2 (44/66 done)):**
```json
{
  "pricing": "free|freemium|paid|open-core",
  "deployment": "cloud|self-hosted|local|hybrid",
  "difficulty": "beginner|intermediate|advanced",
  "whenToUse": ["phrase1", "phrase2"],
  "whenNotToUse": ["phrase1", "phrase2"],
  "compatibleWith": ["slug1", "slug2"],
  "useCases": ["use-case-1", "use-case-2"],
  "languages": ["python", "js"],
  "verified_at": "2026-02-10",
  "verification_source": "docs|tested|inferred",
  "github_stars": 162000,
  "license": "MIT"
}
```

> **Full spec:** See `docs/SCHEMA_SPEC.md` for complete field definitions, enums, validation rules, and slug convention.

### 13 Sections (FROZEN — do not add/remove sections)

| # | Section ID | Badge | Color | Cards | Card Names |
|:-:|------------|:-----:|-------|:-----:|------------|
| 1 | protocols | 🔌 | | 2 | MCP, A2A |
| 2 | frameworks | 🤖 | | 10 | LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, Google ADK, LlamaIndex, Rasa, Browser-Use*, Pydantic AI*, Mastra* |
| 3 | platforms | 💬 | | 2 | Claude.ai (Web), ChatGPT (Web) |
| 4 | memory | 🧩 | | 3 | Claude-Mem, Hệ thống Memory khác, MemOS* |
| 5 | skills | 📚 | | 5 | Universal Agent Skills, Skill Categories đáng chú ý, Superpowers*, Agents (wshobson)*, Planning with Files* |
| 6 | orchestration | 🌊 | | 3 | Claude-Flow, OpenClaw, Claude Squad |
| 7 | coding-agents | 🟣 | | 11 | Claude Code, Cursor, Codex CLI, Windsurf, GitHub Copilot, Gemini CLI, Cline/RooCode, Kiro (AWS), Replit Agent, OpenCode*, Goose* |
| 8 | trends | 🐝 | | 9 | Multi-Agent Systems, Mechanistic Interpretability, World Models, Generative Coding, Chinese Open-Source AI, Post-Training > Pre-Training, AI Drug Discovery, AI Infrastructure, AI Governance |
| 9 | observability | 📊 | | 5 | Langfuse🔥, DeepEval, Promptfoo, LangSmith, Arize Phoenix |
| 10 | infrastructure | ⚙️ | | 4 | Ollama🔥, vLLM, LocalAI, LiteLLM |
| 11 | rag-systems | 🔍 | #06b6d4 | 4 | Dify🔥, RAGFlow🔥, Flowise, LightRAG |
| 12 | vector-databases | 🗄️ | #d97706 | 4 | Milvus, Qdrant, Chroma, pgvector |
| 13 | security | 🛡️ | #ef4444 | 4 | garak🔥, NeMo Guardrails, Presidio, Guardrails AI |
| | | | | **66** | |

### Compare Mode (v6.0 → v6.3)

- `comparison_presets[]` in data.json root — preset-contained data model
- 4 presets: `vector-databases` (4 tools), `rag-systems` (4 tools), `coding-agents` (11 tools), `frameworks` (10 tools)
- Criteria with `highlight[]` for key differentiators
- Integrations array uses card slugs for cross-linking
- Deep-link: `#compare=<presetId>`
- **Tool Picker (v6.3):** `#compare=<presetId>&pick=slug1,slug2,...` cho focused comparison (2-6 tools)
- Two modes: All Mode (default, backward-compat) / Focused Mode (2-6 tools selected)
- Picker bar: toggle chips + count + Reset button above compare table
- `pick=` chỉ xuất hiện khi selection ≤6 VÀ < total tools (>6 = All Mode, no pick)
- Hash priority: compare hash checked before card hash
- **Flip layout (v6.1):** `preset.layout: "flip"` → tools=rows, criteria=columns
- **Scale indicators:** Agentic/Strong (green), Semi-agent/Good (blue), Assist/Basic (gray)
- **Mobile flip:** Stacked cards thay vì table khi ≤768px
- `preset.tools[]` array cho explicit row order (flip layout)

### Detail Format (v5.2+)

Cards mới (từ session 18+) dùng format dài hơn:
- Main paragraph: what it is + how it works + real applications (3-7 dòng tùy complexity)
- Kết thúc bằng: `\n\nKết hợp tốt với: [tool1] · [tool2] · ...`
- 54 cards cũ vẫn giữ format ngắn (2-4 dòng) — sẽ update trong A2 batch enrichment

## UI/UX Conventions

| Convention | Chi tiết |
|-----------|---------|
| Font | Be Vietnam Pro (Google Fonts) |
| Theme | Dark theme |
| Layout | **Tree sidebar + Newspaper grid** (v5.0+) |
| Sidebar | Layer groups → click section → show cards |
| Cards | Newspaper grid layout, click to expand detail + sources |
| Search | Ctrl+K / Cmd+K → fuzzy search overlay |
| Compare | Compare button → overlay with table/flip layout |
| Deep Linking | `#card-slug` → auto-scroll + expand, `#compare=presetId` → open compare |
| NEW Badge | Tự động hiện cho cards có `added_date` ≤ 14 ngày |
| Responsive | Desktop multi-column, mobile single column + stacked cards for flip |
| Icons | Emoji-based (không dùng icon library) |
| Language | Tiếng Việt (nội dung), English (code/commits) |

## Content Update Workflow

> ⚠️ **Khi cập nhật nội dung mindmap (thêm/sửa cards trong data.json), LUÔN đọc `skills/MINDMAP_UPDATE.md` trước.**
> ⚠️ **Mọi thay đổi data.json phải tuân theo `docs/SCHEMA_SPEC.md`.**

**Quy trình tóm tắt:**
1. Đọc `skills/MINDMAP_UPDATE.md` + `docs/SCHEMA_SPEC.md`
2. Research bằng web search → tìm thông tin chính xác (stars, last commit, features)
3. Cập nhật `data.json` — **KHÔNG sửa `index.html` khi chỉ update content**
4. Validate JSON: `node -e "JSON.parse(require('fs').readFileSync('data.json','utf8'));console.log('✅ Valid')"`
5. Append CHANGELOG.md
6. Baron review → commit & push

## Git Workflow

| Rule | Value |
|------|-------|
| Branch | `main` for small fixes. **Feature branch + PR** for UI changes (Week 2+) |
| Deploy | Vercel auto-deploy khi push main |
| Commit format | `type(scope): message` |

**Commit types:** feat, fix, docs, style, refactor, chore

**Examples:**
```
feat(b1): SEO baseline — meta tags, sitemap, robots.txt, English meta
feat(docs): add SCHEMA_SPEC.md + meta contract fields (A1)
docs(a1.1): add slug immutability rules to SCHEMA_SPEC
chore(b1.2): cache bust og-image, canvas to devDep, script docs
```

**PR Discipline (bắt buộc từ Week 2):**
- Feature branch cho UI changes (e.g., Tool Picker)
- Evidence Pack đính PR description (screenshots, smoke test, diff summary)
- Merge xong mới bắt đầu task tiếp theo

## CC Implementation Rules

> **CRITICAL — đọc trước MỌI task.**

### CC PHẢI làm
| ✅ PHẢI | Lý do |
|---------|-------|
| Báo `git diff` trước commit | Baron review changes |
| Chờ Baron confirm | Kiểm soát scope |
| Self-test nếu yêu cầu | Catch bugs sớm |
| Hỏi nếu unclear | Tránh làm sai |
| Báo nếu thấy issue khác | Nhưng KHÔNG tự fix |

### CC KHÔNG được làm
| ❌ KHÔNG | Ví dụ |
|----------|-------|
| Tự thêm code "bonus" | Thêm validation khi chỉ yêu cầu UI |
| Tự "tối ưu" | Bỏ code mà CC nghĩ là "redundant" |
| Tự thay đổi flow | Đổi cách gọi API |
| Tự refactor | Rename variables, restructure code |
| Commit không hỏi | Phải chờ confirm |

### Thứ tự thực hiện
```
1. Đọc yêu cầu
   ↓
2. Chỉ sửa những gì được yêu cầu
   ↓
3. Chạy `git diff` → báo lại
   ↓
4. Chờ Baron confirm
   ↓
5. Self-test (nếu có)
   ↓
6. Báo self-test results
   ↓
7. Chờ confirm lần 2
   ↓
8. Commit + Push
```

## Tool Selection

| Task | Tool | Lý do |
|------|------|-------|
| Create new file | `create_file` | Clean, atomic |
| Edit existing file | `str_replace` | Precise, traceable |
| Read file | `view` | Efficient |
| Run commands | `bash` | Full control |

## Important Rules

### ❌ KHÔNG làm
- Thay đổi structure data.json mà không có lý do rõ ràng
- Xóa cards hiện tại mà không được Baron approve
- Thêm frameworks/libraries bên ngoài (giữ vanilla JS)
- Viết desc quá dài (1 dòng cho desc, 2-7 dòng cho detail)
- Dùng icon libraries (giữ emoji-based)
- Break responsive layout (luôn test cả desktop + mobile)
- Dùng sai schema keys (`"items"` thay `"cards"`, `"label"` thay `"title"`, `"emoji"` thay `"badge"`)

### ✅ LUÔN làm
- Encoding UTF-8, tiếng Việt có dấu đầy đủ
- Giữ nguyên cards hiện tại khi thêm mới
- Test local trước khi push (`npx serve .`)
- CSS/JS inline trong index.html (không tách file riêng)
- Smooth animation transitions
- Commit message rõ ràng theo convention
- Verify data.json keys match schema before editing

## Quick Commands

```bash
# Navigate to project
cd C:\Projects\ai-mindmap

# Test local
npx serve .
# Open http://localhost:3000

# Validate JSON
node -e "JSON.parse(require('fs').readFileSync('data.json','utf8'));console.log('✅ Valid')"

# Regenerate OG image (when stats change)
node scripts/generate-og-image.js

# Git workflow
git add .
git commit -m "type(scope): message"
git push origin main
# Vercel auto-deploys
```

## Research Keywords (per section)

> Dùng khi cần research cập nhật nội dung cho từng section.

| Section | Research Keywords |
|---------|-------------------|
| protocols | "MCP protocol update", "A2A protocol news", "agent protocol standard" |
| frameworks | "AI agent framework 2026", "LangGraph update", "CrewAI update", "multi-agent framework" |
| platforms | "Claude.ai update", "ChatGPT update", "AI platform features" |
| memory | "AI agent memory", "MemGPT update", "Mem0 update", "LLM memory system" |
| skills | "awesome-agent-skills", "MCP servers", "AI agent tools plugins", "Claude Code skills" |
| orchestration | "multi-agent orchestration", "Claude-Flow", "agent swarm" |
| coding-agents | "AI coding tools 2026", "Cursor update", "Claude Code update", "AI IDE" |
| trends | "AI trends 2026", "AI agent trends", "AI breakthroughs 2026" |
| observability | "LLM observability", "AI evaluation", "LangSmith update", "Langfuse", "AI tracing" |
| infrastructure | "LLM inference", "Ollama update", "vLLM", "local LLM", "AI gateway" |
| rag-systems | "RAG framework", "Dify update", "RAGFlow", "LightRAG", "retrieval augmented generation" |
| vector-databases | "vector database comparison", "Milvus update", "Qdrant", "pgvector", "Chroma" |
| security | "AI security tools", "LLM guardrails", "garak", "NeMo Guardrails", "AI red team" |

## Roadmap

| Phase | Version | Focus | Status |
|:-----:|:-------:|-------|:------:|
| 1 | v3.5 | Quick Wins: Search, deep links, badges | ✅ **Completed** |
| 2 | v4.0 | Data: 6 new cards + duplicate cleanup (42 total) | ✅ **Completed** |
| 3 | v5.0 | UI Redesign: Tree sidebar + Newspaper grid | ✅ **Completed** |
| 3b | v5.1→5.2 | Data Enrichment: +4 sections, 54→62 cards | ✅ **Completed** |
| 3c | v5.3 | Security & Guardrails + FREEZE 13 sections | ✅ **Completed** |
| 4 | v6.0 | Compare Mode: overlay + table + deep-link | ✅ **Completed** |
| 4b | v6.0.1 | Entry points + micro-UX + sticky header | ✅ **Completed** |
| 5 | v6.1 | Large-preset: Coding Agents flip layout | ✅ **Completed** |
| 5b | v6.2 | Schema Spec + SEO Baseline + OG image | ✅ **Completed** |
| 6 | v6.3 | Tool Picker UX | ✅ **Completed** |
| 7 | v7.0 | Community: Auto-fetch, graph, i18n | Planned |

## Known Issues

Không có known issues hiện tại.

**Security notes (từ G review):**
- XSS rules documented trong PROJECT_CONTEXT.md → Security Rules section
- Mọi field mới mặc định `escapeHtml()`, chỉ `desc/detail` được `innerHTML`
- Deep-link smoke test: verify hash navigation + browser back/forward mỗi lần deploy

**Pending actions:**
- Bật repo public → "Suggest a Tool" link tự hoạt động (hiện 404 vì repo private)
- CSP meta tag → cần tách inline JS ra file riêng (deferred, security hardening backlog)
- ✅ Tool Picker UX shipped (v6.3) — feature branch `feature/tool-picker`, `--no-ff` merge
- P1: A2 enrichment — 48/66 done (Batch 01-05B, coding-agents 7/11). Next: Batch 05C — coding-agents (4 remaining)

## JS Functions Reference

| Function | Chức năng |
|----------|-----------|
| `toSlug(name)` | Convert name → URL slug (remove non-alphanumeric, lowercase) |
| `navigateToCard(hash)` | Open layer + expand card + scroll to card |
| `openSearch()` / `closeSearch()` | Mở/đóng search overlay |
| `doSearch(q)` | Filter allCards, render max 10 results |

⚠️ DEC-029: compatibleWith dùng canonical short slugs, có thể khác toSlug() output. Xem docs/DECISIONS_LOG.md

---

*Version: 2.1*
*Created: 2026-02-04*
*Updated: 2026-02-26 — post A2 Batch 05B (48/66 enriched, 66 cards, 13 sections, coding-agents 7/11)*
*File này được Claude Code tự động đọc khi bắt đầu session.*

# 🧠 AI Ecosystem Mindmap 2026

> Interactive mindmap tổng hợp AI ecosystem: Protocols, Frameworks, Agents, Memory, Skills, Coding Tools & Trends.

**Live site:** https://seeaifirst.com

## Quick Start

### Xem local
```bash
npx serve .
# Mở http://localhost:3000
```

### Update mindmap bằng Claude Code
```bash
cd ai-mindmap
claude

# Nói 1 trong các lệnh:
> update mindmap                           # Update tất cả
> update section trends                    # Update 1 section  
> thêm tool X vào coding-agents            # Thêm item cụ thể
> có gì mới trong AI tuần này?             # Research + update
```

Claude Code sẽ tự động: research → update `data.json` → tóm tắt changes → chờ Baron confirm → commit.

### Deploy
```bash
# Lần đầu
npx vercel

# Sau đó mỗi lần push = auto-deploy
git push
```

## Architecture
```
index.html    ← Renderer (đọc data.json, render UI)
data.json     ← Content (8 sections, 39 cards)
CLAUDE.md     ← Context cho Claude Code
skills/       ← Skills cho Claude Code
.github/      ← Issue templates
CHANGELOG.md  ← Lịch sử updates
```

**Muốn update?** Chỉ cần sửa `data.json` → website tự render lại.

## Tech Stack
- Pure HTML/CSS/JS — zero dependencies
- Data-driven: JSON → DOM rendering
- Dark theme, glassmorphic design
- Responsive, scroll animations
- SEO: Open Graph, Twitter Card meta tags

## v3.5 Features
- Search overlay (Ctrl+K / Cmd+K) — fuzzy search toàn bộ cards
- Hash-based deep linking — chia sẻ link trực tiếp đến từng card
- NEW badge tự động cho cards mới (≤14 ngày)
- "Suggest a Tool" GitHub Issue template

## Sections
1. **Protocols** — MCP, A2A
2. **Agent Frameworks** — LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, Google ADK, LlamaIndex, Pydantic AI, Rasa
3. **Platforms** — Claude.ai, Claude Code, ChatGPT, Codex CLI
4. **Memory** — Claude-Mem, MemGPT/Letta, Mem0, Zep
5. **Skills** — Universal agent skills (626+)
6. **Orchestration** — Claude-Flow, OpenClaw, Claude Squad
7. **AI Coding Agents** — Claude Code, Cursor, Codex CLI, Windsurf, Copilot, Gemini CLI, Cline, Kiro, Replit
8. **2026 Trends** — Multi-Agent Systems, Interpretability, World Models, Generative Coding, and more

## Schema Documentation

Card data follows a structured schema defined in [`docs/SCHEMA_SPEC.md`](docs/SCHEMA_SPEC.md).

### Schema Versioning

The schema follows [Semantic Versioning](https://semver.org/):

| Change Type | Version Bump | Example |
|-------------|:------------:|---------|
| Typo fix in spec, no data change | **Patch** (1.0.x) | 1.0.0 → 1.0.1 |
| Add new optional field | **Minor** (1.x.0) | 1.0.0 → 1.1.0 |
| Change/remove existing field | **Major** (x.0.0) | 1.0.0 → 2.0.0 |

### Backwards Compatibility Policy

- **Card slugs** are immutable after assignment. Existing deep-links will always resolve.
- **Enum values** are frozen at v1.0.0 for all enum fields defined in SCHEMA_SPEC (`pricing`, `deployment`, `difficulty`, `verification_source`). No new values without a major version bump.
- **New optional fields** may be added via minor version bump — existing consumers are unaffected.
- **Breaking changes** (field removal, enum changes, required field additions) require a major version bump with 1-week deprecation notice in release notes (and CHANGELOG if present).

Current schema version: **1.0.0** (see `meta.schema_version` in `data.json`).

## License
MIT

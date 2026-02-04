# AI Mindmap - Claude Code Instructions

## Project Overview

Website tương tác mapping hệ sinh thái AI 2026 — protocols, frameworks, tools, trends — dành cho developers Việt Nam.

| Item | Value |
|------|-------|
| Tech | Static HTML + CSS + Vanilla JS + data.json |
| PROD | https://ai-mindmap-ochre.vercel.app |
| Repo | https://github.com/BARONFANTHE/ai-mindmap |
| Local | C:\Projects\ai-mindmap |
| Deploy | Vercel auto-deploy from `main` branch |

## Architecture

```
/ai-mindmap
├── index.html              # Main page (UI + CSS + JS inline)
├── data.json               # Content data (39 cards, 8 sections)
├── CLAUDE.md               # Instructions cho Claude Code (file này)
├── README.md               # Project README
├── CHANGELOG.md            # Version history
├── .gitignore              # Git ignore rules
├── .github/
│   └── ISSUE_TEMPLATE/
│       └── suggest-tool.yml  # "Suggest a Tool" issue template
└── skills/
    └── MINDMAP_UPDATE.md   # Guide for updating mindmap content
```

**Data Flow:**
1. Browser loads `index.html`
2. JS `fetch('data.json')` → parse JSON
3. Render sections as accordion (collapsed mặc định)
4. Click section → expand → show cards
5. Click card → expand detail + sources

## Content Update Workflow

> ⚠️ **Khi cập nhật nội dung mindmap (thêm/sửa cards trong data.json), LUÔN đọc `skills/MINDMAP_UPDATE.md` trước.** File này chứa quy trình chi tiết, schema validation, và checklist cho content updates.

**Quy trình tóm tắt:**
1. Đọc `skills/MINDMAP_UPDATE.md`
2. Research bằng web search → tìm thông tin chính xác (stars, last commit, features)
3. Cập nhật `data.json` — **KHÔNG sửa `index.html` khi chỉ update content**
4. Validate JSON: `node -e "JSON.parse(require('fs').readFileSync('data.json','utf8'));console.log('✅ Valid')"`
5. Append CHANGELOG.md
6. Baron review → commit & push

## Current State

| Item | Value |
|------|-------|
| **Version** | v3.5 (deployed) |
| **Cards** | 39 cards, 8 sections |
| **Last Deploy** | 2026-02-04 |
| **Next Version** | v4.0 (Phase 2) |

## Data Structure — data.json

### Current Schema (v3.5)

```json
{
  "sections": [
    {
      "title": "Tên Section",
      "emoji": "🔌",
      "items": [
        {
          "name": "Tên Tool",
          "desc": "Mô tả ngắn (1 dòng)",
          "detail": "Mô tả chi tiết (2-4 dòng)",
          "added_date": "2026-02-03",
          "sources": [
            { "label": "GitHub", "url": "https://..." },
            { "label": "Website", "url": "https://..." }
          ]
        }
      ]
    }
  ]
}
```

> **Lưu ý:** Tất cả 39 cards hiện tại đặt `added_date: "2026-02-03"` (ngày deploy v3.3). Cards mới thêm sau dùng ngày thực tế.

### 8 Sections hiện tại

| # | Section | Emoji | Cards |
|:-:|---------|:-----:|:-----:|
| 1 | Giao Thức & Tiêu Chuẩn | 🔌 | 5 |
| 2 | Agent Frameworks | 🤖 | 8 |
| 3 | Công Cụ Coding AI | 💻 | 5 |
| 4 | Hệ Thống Memory | 🧠 | 4 |
| 5 | Agent Skills & Plugins | 🛠️ | 4 |
| 6 | Low-Code / No-Code | ⚡ | 4 |
| 7 | Observability & Testing | 🔍 | 4 |
| 8 | Xu Hướng 2026 | 🔮 | 5 |

### Research Keywords (per section)

> Dùng khi cần research cập nhật nội dung cho từng section.

| Section | Research Keywords |
|---------|-------------------|
| Giao Thức & Tiêu Chuẩn | "MCP protocol update", "A2A protocol news", "agent protocol standard" |
| Agent Frameworks | "AI agent framework 2026", "LangGraph update", "CrewAI update", "multi-agent framework" |
| Công Cụ Coding AI | "AI coding tools 2026", "Cursor update", "Claude Code update", "AI IDE" |
| Hệ Thống Memory | "AI agent memory", "MemGPT update", "Mem0 update", "LLM memory system" |
| Agent Skills & Plugins | "awesome-agent-skills", "MCP servers", "AI agent tools plugins" |
| Low-Code / No-Code | "AI low-code platform", "Dify update", "n8n AI", "AI workflow builder" |
| Observability & Testing | "LLM observability", "AI agent testing", "LangSmith update", "AI tracing" |
| Xu Hướng 2026 | "AI trends 2026", "AI agent trends", "AI breakthroughs 2026" |

## UI/UX Conventions

| Convention | Chi tiết |
|-----------|---------|
| Font | Be Vietnam Pro (Google Fonts) |
| Theme | Dark theme |
| Layout | Accordion — sections collapsed mặc định |
| Cards | Click to expand detail + sources |
| Search | Ctrl+K / Cmd+K → fuzzy search overlay |
| Deep Linking | `#card-slug` trong URL → auto-scroll + expand |
| NEW Badge | Tự động hiện cho cards có `added_date` ≤ 14 ngày |
| Responsive | Desktop multi-column, mobile single column |
| Icons | Emoji-based (không dùng icon library) |
| Language | Tiếng Việt (nội dung), English (code/commits) |

## Git Workflow

| Rule | Value |
|------|-------|
| Branch | `main` (push trực tiếp — solo project) |
| Deploy | Vercel auto-deploy khi push main |
| Commit format | `type(scope): message` |

**Commit types:** feat, fix, docs, style, refactor, chore

**Examples:**
```
feat(ui): add search bar with Ctrl+K shortcut
feat(data): add added_date field to all cards
feat(ui): add NEW badge for recent cards
feat(ui): add hash-based deep linking
fix(ui): fix mobile card overflow
docs: update CHANGELOG for v3.5
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
- Viết desc quá dài (1 dòng cho desc, 2-4 dòng cho detail)
- Dùng icon libraries (giữ emoji-based)
- Break responsive layout (luôn test cả desktop + mobile)

### ✅ LUÔN làm
- Encoding UTF-8, tiếng Việt có dấu đầy đủ
- Giữ nguyên cards hiện tại khi thêm mới
- Test local trước khi push (`npx serve .`)
- CSS/JS inline trong index.html (không tách file riêng)
- Smooth animation transitions cho accordion
- Commit message rõ ràng theo convention

## Quick Commands

```bash
# Navigate to project
cd C:\Projects\ai-mindmap

# Test local
npx serve .
# Open http://localhost:3000

# Git workflow
git add .
git commit -m "type(scope): message"
git push origin main
# Vercel auto-deploys
```

---

## Completed: Phase 1 — Quick Wins (v3.5)

> ✅ Completed 2026-02-04 · 7 commits · Deployed to Vercel

| # | Feature | Status |
|:-:|---------|:------:|
| 1 | Search overlay (Ctrl+K / Cmd+K fuzzy search) | ✅ |
| 2 | NEW badge tự động (≤14 ngày từ added_date) | ✅ |
| 3 | Hash-based deep linking (#card-slug) | ✅ |
| 4 | Open Graph + Twitter Card meta tags | ✅ |
| 5 | GitHub Issue template "Suggest a Tool" | ✅ |
| 6 | added_date field cho tất cả 39 cards | ✅ |

### JS Functions thêm trong v3.5

| Function | Chức năng |
|----------|-----------|
| `slugify(s)` | Convert name → URL slug (remove dấu tiếng Việt) |
| `navigateToCard(hash)` | Open layer + expand card + scroll to card |
| `openSearch()` / `closeSearch()` | Mở/đóng search overlay |
| `doSearch(q)` | Filter allCards, render max 10 results |

---

## Known Issues

| Issue | Description | Fix |
|-------|-------------|-----|
| Duplicate ID | 2 cards "Codex CLI" → duplicate HTML `id` → deep link chỉ target card đầu tiên | Rename 1 card trong data.json |
| No og:image | OG meta tags không có image | Tạo `og-image.png` (1200x630) |
| No "Suggest" link | Issue template tồn tại nhưng chưa có link trên website | Thêm link vào footer |

---

## NEXT: Phase 2 (v4.0)

> Chưa có plan chi tiết. Sẽ cập nhật khi Baron quyết định scope.

---

*Version: 1.2*
*Created: 2026-02-04*
*Updated: 2026-02-04 — Phase 1 (v3.5) completed*
*File này được Claude Code tự động đọc khi bắt đầu session.*

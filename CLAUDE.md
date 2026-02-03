# AI Ecosystem Mindmap 2026

## Project Overview
Website tĩnh hiển thị mindmap AI ecosystem. Data-driven: `index.html` đọc `data.json` → render mindmap.

## Architecture
```
index.html  ← Template/renderer (ít khi sửa)
data.json   ← Toàn bộ nội dung mindmap (file chính để update)
```

## Update Workflow (Level 2 — Semi-Auto)
1. Đọc skill `skills/MINDMAP_UPDATE.md` trước khi làm bất cứ gì
2. Research bằng web search → tìm thông tin mới
3. Cập nhật `data.json` — KHÔNG sửa `index.html`
4. Tăng `meta.version` (minor +1), cập nhật `meta.lastUpdated`
5. Append CHANGELOG.md
6. Baron review diff → commit & push → Vercel auto-deploy

## Quy tắc quan trọng
- **CHỈ sửa data.json** — index.html là renderer, không chứa content
- **KHÔNG xóa** items cũ trừ khi sai fact — chỉ thêm hoặc cập nhật
- **Tiếng Việt** cho descriptions, giữ ngắn gọn (<100 chars)
- **Validate JSON** sau khi sửa — `node -e "JSON.parse(require('fs').readFileSync('data.json','utf8'));console.log('✅ Valid')"`
- Schema card: `{ "icon", "name", "mono", "desc", "tags": [] }` — xem skill để biết chi tiết

## Sections trong data.json
| ID | Nội dung | Research keywords |
|----|----------|-------------------|
| protocols | MCP, A2A | "MCP protocol update", "A2A protocol news" |
| orchestration | Claude-Flow, OpenClaw | "Claude-Flow github", "OpenClaw update" |
| memory | claude-mem, MemGPT | "AI agent memory", "claude-mem update" |
| platforms | Claude.ai, Claude Code | "Claude Code update", "ChatGPT new features" |
| coding-agents | 9 AI coding tools | "AI coding tools 2026", "Cursor update" |
| skills | Agent skills ecosystem | "awesome-agent-skills", "AI skills" |
| frameworks | LangGraph, CrewAI... | "AI agent framework", "LangGraph update" |
| trends | AI trends 2026 | "AI trends 2026", "AI breakthroughs" |

## Commands hay dùng
```bash
# Preview local
npx serve .                    # hoặc python3 -m http.server

# Validate JSON
node -e "JSON.parse(require('fs').readFileSync('data.json','utf8'));console.log('✅ Valid')"

# Check diff trước khi commit
git diff data.json

# Deploy
git add data.json CHANGELOG.md
git commit -m "🧠 Update mindmap vX.Y"
git push
```

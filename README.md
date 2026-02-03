# 🧠 AI Ecosystem Mindmap 2026

> Interactive mindmap tổng hợp AI ecosystem: Protocols, Frameworks, Agents, Memory, Skills, Coding Tools & Trends.

**Live site:** [your-domain.vercel.app]

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
data.json     ← Content (9 sections, ~40 cards)
CLAUDE.md     ← Context cho Claude Code
skills/       ← Skills cho Claude Code
CHANGELOG.md  ← Lịch sử updates
```

**Muốn update?** Chỉ cần sửa `data.json` → website tự render lại.

## Tech Stack
- Pure HTML/CSS/JS — zero dependencies
- Data-driven: JSON → DOM rendering
- Dark theme, glassmorphic design
- Responsive, scroll animations
- SEO: Open Graph, Twitter Cards, JSON-LD

## Sections
1. **Protocols** — MCP, A2A
2. **Orchestration** — Claude-Flow, OpenClaw, Claude Squad
3. **Memory** — claude-mem, CLAUDE.md, ByteRover, MemGPT
4. **Platforms** — Claude.ai, Claude Code, ChatGPT, Codex CLI
5. **AI Coding Agents** — 9 tools comparison
6. **Skills** — Universal agent skills (626+)
7. **Agent Frameworks** — LangGraph, CrewAI, AutoGen...
8. **Workflow** — 4-step app creation process
9. **2026 Trends** — 9 major AI trends

## License
MIT

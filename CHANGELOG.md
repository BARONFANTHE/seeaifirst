# AI Mindmap Changelog

## v6.0 — Phase 4: Compare Mode (2026-02-09)

### Added
- **Compare Mode**: Side-by-side tool comparison with overlay UI
  - 2 comparison presets: Vector Databases (4 tools) + RAG Systems (4 tools)
  - Desktop: table view (criteria rows × tool columns)
  - Mobile ≤768px: stacked cards per tool
  - Highlighted key criteria (Scale, Filtering / No-code vs Code, Doc Understanding)
  - Integrations displayed as chips
  - Deep-link support: `#compare=vector-databases`, `#compare=rag-systems`
  - Keyboard: ESC to close, Ctrl+K disabled with toast hint when overlay open
  - Accessibility: focus trap in overlay
  - Dark/light theme support

## v4.0 — Phase 2: New Cards (2026-02-04)

- **Agent Frameworks** (8 → 11 cards):
  - Browser-Use — framework tự động hóa trình duyệt cho AI agents (73K+ ⭐)
  - Pydantic AI — agent framework type-safe kiểu FastAPI (14.6K ⭐)
  - Mastra — TypeScript-first agent framework từ team Gatsby (20.7K ⭐)
- **Công Cụ Coding AI** (5 → 7 cards):
  - OpenCode — open-source coding agent trên terminal (96K+ ⭐)
  - Goose — coding agent từ Block/Square, viết bằng Rust (29.7K ⭐)
- **Hệ Thống Memory** (4 → 5 cards):
  - MemOS — hệ điều hành bộ nhớ thống nhất cho LLM (~4.9K ⭐)
- **Agent Skills** (update):
  - Universal Agent Skills — cập nhật thông tin Antigravity Awesome Skills V4.0 (631+ skills) + VoltAgent
- Tổng: 39 → 45 cards

## v3.5 — Phase 1: Quick Wins (2026-02-04)

- Search bar với Ctrl+K / Cmd+K fuzzy search
- "NEW" badge tự động cho cards mới (≤14 ngày)
- Hash-based deep linking (chia sẻ link đến từng card)
- Open Graph + Twitter Card meta tags
- GitHub Issue template "Suggest a Tool"
- Thêm added_date field cho tất cả 39 cards

## v3.3 — Detail Descriptions + Sources (2026-02-03)

- Thêm `detail` field cho tất cả 39 cards (mô tả chi tiết 2-4 dòng)
- Thêm `sources` array cho tất cả 39 cards (GitHub, Docs, Website links)
- Card click hiển thị detail panel + clickable source links

## v3.2 — Section Cleanup (2026-02-03)

- Dọn dẹp nội dung sections, chuẩn hóa card descriptions
- D3.js interactive mindmap experiment → abandoned (DEC-010)

## v3.1 — Font & Readability (2026-02-03)

- Chuyển sang font Be Vietnam Pro (Google Fonts) — tối ưu cho tiếng Việt có dấu
- Cải thiện readability: line-height, spacing, contrast

## v3.0 — Hierarchical Accordion Redesign (2026-02-03)

- Chuyển từ flat layout sang hierarchical accordion UI
- 5 layers (L1-L5) → 8 sections → 39 cards
- Sections collapsed mặc định, click to expand
- Dark theme, responsive (desktop + mobile)
- 8 sections: Giao Thức, Frameworks, Coding AI, Memory, Skills, Low-Code, Observability, Xu Hướng

## v2.0 — Data-driven Architecture (2026-02-03)

- Tách nội dung ra `data.json`, UI logic trong `index.html`
- Deploy lên Vercel (auto-deploy from GitHub `main`)
- 39 cards ban đầu, 8 sections

## v1.0 — Initial Release (2026-02-03)

- Mindmap layout ban đầu (flat, single HTML file)
- Nội dung hardcoded trong HTML

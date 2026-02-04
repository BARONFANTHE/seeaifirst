# 🧠 Mindmap Update Skill — Data Reference

> Quick reference cho Claude Code khi sửa data.json. Research & evaluation do Claude.ai thực hiện.

## Data Structure (actual)

```
data.json
├── layers[]                    # 5 layers (L1-L5)
│   ├── id: "L1"
│   ├── title: "Layer Title"
│   └── sections[]              # 8 sections total
│       ├── title: "Section Title"
│       ├── emoji: "🔌"
│       └── items[]             # Cards
│           ├── name            # Tool/framework name
│           ├── desc            # 1-line description (tiếng Việt)
│           ├── added_date      # "YYYY-MM-DD" (for NEW badge, ≤14 days)
│           ├── detail          # 2-4 lines (tiếng Việt)
│           └── sources[]       # Links
│               ├── label       # "GitHub", "Docs", "Website"
│               └── url         # Full URL
├── workflow[]                  # 4 steps (not rendered in UI)
└── relations[]                 # 8 entries (not rendered in UI)
```

**Không có `meta` object.** Version tracking nằm trong CHANGELOG.md.

## Card Schema

```json
{
  "name": "Tool Name",
  "desc": "Mô tả ngắn 1 dòng bằng tiếng Việt",
  "added_date": "2026-02-04",
  "detail": "Chi tiết 2-4 dòng tiếng Việt. Giải thích tại sao tool này quan trọng, stars, license, đặc điểm nổi bật.",
  "sources": [
    { "label": "GitHub", "url": "https://github.com/org/repo" },
    { "label": "Docs", "url": "https://docs.example.com" }
  ]
}
```

**Rules:**
- `desc`: Max 1 dòng, tiếng Việt có dấu
- `detail`: 2-4 dòng, tiếng Việt có dấu, include stars + license nếu có
- `added_date`: Format YYYY-MM-DD, dùng ngày thêm card
- `sources`: Ít nhất 1 link (GitHub preferred), max 3-4 links
- **Thêm card mới vào cuối `items[]`** của section tương ứng

## Sections hiện tại

| # | Section title (match by) | Emoji | Layer |
|:-:|--------------------------|:-----:|:-----:|
| 1 | Giao Thức & Tiêu Chuẩn | 🔌 | L5 |
| 2 | Agent Frameworks | 🤖 | L4 |
| 3 | Công Cụ Coding AI | 💻 | L4 |
| 4 | Hệ Thống Memory | 🧠 | L3 |
| 5 | Agent Skills & Plugins | 🛠️ | L3 |
| 6 | Low-Code / No-Code | ⚡ | L2 |
| 7 | Observability & Testing | 🔍 | L2 |
| 8 | Xu Hướng 2026 | 🔮 | L1 |

**Tìm section bằng `title` field**, không dùng index.

## Validation

Sau khi sửa data.json:

```bash
# 1. Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('data.json','utf8'));console.log('✅ JSON valid')"

# 2. Count cards
node -e "const d=JSON.parse(require('fs').readFileSync('data.json','utf8'));let t=0;d.layers.forEach(l=>l.sections.forEach(s=>{console.log(s.emoji,s.title,':',s.items.length,'cards');t+=s.items.length}));console.log('Total:',t,'cards')"

# 3. Check new cards have required fields
node -e "const d=JSON.parse(require('fs').readFileSync('data.json','utf8'));const req=['name','desc','added_date','detail','sources'];let ok=true;d.layers.forEach(l=>l.sections.forEach(s=>s.items.forEach(i=>{const m=req.filter(f=>!i[f]);if(m.length){console.log('❌',i.name||'UNNAMED','missing:',m.join(', '));ok=false}})));if(ok)console.log('✅ All cards have required fields')"
```

## Commit Convention

```
feat(data): add [tool name] card to [section]
feat(data): add N new cards for vX.Y
fix(data): fix [description] in data.json
```

## ⚠️ Constraints

- **CHỈ sửa `data.json`** — KHÔNG sửa index.html
- **KHÔNG xóa** cards/sections — chỉ thêm hoặc update
- **KHÔNG thay đổi** existing card order
- **KHÔNG thêm fields** ngoài schema (name, desc, added_date, detail, sources)
- **UTF-8 encoding** — tiếng Việt có dấu đầy đủ
- **Report git diff** trước khi commit, chờ Baron confirm

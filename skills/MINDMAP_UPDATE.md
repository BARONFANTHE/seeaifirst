# 🧠 Mindmap Updater Skill

## Mục đích
Research thông tin AI mới nhất bằng web search → cập nhật `data.json` → Baron review → deploy.

## Trigger phrases
- "update mindmap", "cập nhật mindmap"
- "research AI trends", "có gì mới trong AI"
- "thêm [tool] vào mindmap"
- "update section [name]"

## Quy trình bắt buộc

### Bước 1: Check trạng thái hiện tại
```bash
node -e "const d=JSON.parse(require('fs').readFileSync('data.json','utf8'));console.log('Version:',d.meta.version,'| Updated:',d.meta.lastUpdated,'| Sections:',d.sections.length,'| Total cards:',d.sections.reduce((a,s)=>a+s.cards.length,0))"
```

### Bước 2: Xác định scope
Hỏi Baron nếu chưa rõ:
- Update **tất cả sections** hay **section cụ thể**?
- Focus vào **30 ngày gần nhất** hay **topic cụ thể**?

### Bước 3: Research bằng web search
Cho mỗi section cần update, search các keywords:

| Section | Search queries gợi ý |
|---------|----------------------|
| protocols | `MCP protocol 2026 update`, `A2A protocol latest`, `AI agent protocol new` |
| orchestration | `Claude-Flow github release`, `OpenClaw update 2026`, `AI orchestration tool` |
| memory | `claude-mem update`, `AI agent memory system 2026`, `MemGPT Letta release` |
| platforms | `Claude Code new features 2026`, `ChatGPT update`, `Codex CLI release` |
| coding-agents | `AI coding agent 2026`, `Cursor AI update`, `new AI coding tool`, `Windsurf update` |
| skills | `awesome-agent-skills github`, `AI agent skills ecosystem`, `claude code skills` |
| frameworks | `LangGraph release 2026`, `CrewAI update`, `new AI agent framework`, `AutoGen update` |
| trends | `AI trends February 2026`, `AI breakthrough 2026`, `AI industry news` |

**Mỗi section search ít nhất 2-3 queries.** Ghi chú source URL cho mỗi finding.

### Bước 4: Phân tích findings
Với mỗi finding, đánh giá:
- **Significance**: HIGH (thêm card mới / thay đổi lớn) | MEDIUM (update mô tả/tags) | LOW (skip)
- **Confidence**: Có từ 2+ sources confirm không?
- **Relevance**: Thuộc section nào?

### Bước 5: Cập nhật data.json

#### Thêm card mới (khi có tool/framework/protocol mới đáng chú ý):
```json
{
  "icon": "🔵",
  "name": "Tool Name",
  "mono": true,
  "hot": true,
  "desc": "Mô tả ngắn tiếng Việt · Đặc điểm nổi bật",
  "detail": "Chi tiết hơn nếu cần. Dùng <strong> cho emphasis, <br> cho line break.",
  "tags": ["tag1", "tag2", "tag3"],
  "note": "💡 Ghi chú quan trọng (optional)"
}
```

#### Update card cũ (khi thông tin thay đổi):
- Cập nhật `desc` nếu có tính năng mới quan trọng
- Cập nhật `tags` nếu stars/version thay đổi đáng kể (>20% change)
- Thêm `"hot": true` nếu tool vừa có release lớn
- Bỏ `"hot": true` nếu đã lâu không có update

#### Thêm section mới (hiếm khi):
```json
{
  "id": "new-section",
  "num": 10,
  "title": "Section Title — Subtitle",
  "color": "lime",
  "badge": "🆕 New",
  "gridCols": 3,
  "cards": [...]
}
```
Nhớ thêm vào `legend` array nữa.

### Bước 6: Update metadata
```bash
node -e "const d=JSON.parse(require('fs').readFileSync('data.json','utf8'));const [a,b]=d.meta.version.split('.').map(Number);d.meta.version=a+'.'+(b+1);d.meta.lastUpdated=new Date().toISOString().split('T')[0];require('fs').writeFileSync('data.json',JSON.stringify(d,null,2));console.log('✅ Updated to v'+d.meta.version)"
```

### Bước 7: Validate
```bash
node -e "JSON.parse(require('fs').readFileSync('data.json','utf8'));console.log('✅ JSON valid')"
```

### Bước 8: Tóm tắt cho Baron
Format:
```
📊 Mindmap Update Summary (vX.Y → vX.Z)

✅ Updated:
- [section]: Mô tả ngắn thay đổi

➕ Added:
- [card name] vào [section]: Lý do

📝 Sources:
- URL 1 (finding)
- URL 2 (finding)

❓ Cần Baron quyết định:
- [Gì đó chưa chắc chắn]
```

Chờ Baron confirm "ok" hoặc "commit" trước khi:
```bash
git add data.json CHANGELOG.md
git commit -m "🧠 Update mindmap vX.Y — [tóm tắt ngắn]"
git push
```

## Quy tắc vàng
1. **KHÔNG bao giờ sửa index.html** — chỉ sửa data.json
2. **KHÔNG xóa** card/section cũ trừ khi sai fact (thêm = OK, xóa = hỏi Baron)
3. **Tiếng Việt** cho desc/detail, English cho tags/names
4. **Validate JSON** sau mỗi lần sửa
5. **Tóm tắt changes** cho Baron review trước khi commit
6. **Ghi CHANGELOG.md** cho mỗi update

## Available colors
`blue`, `cyan`, `purple`, `orange`, `green`, `rose`, `indigo`, `teal`, `sky`, `lime`, `amber`, `pink`

## Tag colors (optional override)
Mặc định tag dùng màu section. Override cho card cụ thể:
```json
{ "tagColors": { "+ claude-mem": "green" } }
```
Hoặc override toàn card: `"tagColor": "rose"`

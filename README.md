# 🧠 See AI First

**The Opinionated AI Stack Guide — with receipts.**

Curated directory of 66 AI developer tools across 13 categories, with evidence-first sourcing.

🌐 **Live:** [seeaifirst.com](https://seeaifirst.com)

---

## Why This Exists

There are hundreds of "awesome AI" lists. Most are link dumps with no opinion.

See AI First is different:

- **Curated, not scraped.** Every tool is manually evaluated against 5 criteria before inclusion. 100+ tools evaluated, 66 selected.
- **Evidence-first.** Each card includes sources, verified dates, and verification methods.
- **Opinionated trade-offs.** Every tool has `whenToUse` and `whenNotToUse` — we tell you when a tool is *not* the right choice.
- **Structured for machines.** Schema-frozen data with stable IDs, JSON-LD structured data — built to be referenced by AI agents, not just humans.

## Features

- 🗂️ **13 categories** across 5 layers: Foundation → Coordination → Capability → Application → Trends
- 🔍 **Search** across names, descriptions, and details (Ctrl+K)
- 🔗 **Deep linking** — every tool has a permanent URL via hash routing
- ⚖️ **Compare Mode** — side-by-side tool comparisons with preset and custom selections
- 🎯 **Tool Picker** — interactive selection for building your AI stack
- 📊 **Enriched metadata** — pricing, deployment, difficulty, compatibility, use cases
- 🌗 **Dark/Light theme**
- 📱 **Mobile responsive**
- ⚡ **Zero backend** — static HTML + JSON on CDN, loads instantly

## Quick Start

```bash
git clone https://github.com/BARONFANTHE/seeaifirst.git
cd seeaifirst
python -m http.server 8000
# Open http://localhost:8000
```

> The site uses `fetch()` to load data, so a local server is required (opening `index.html` directly will fail due to CORS).

Alternative: `npx serve .`

## Project Structure

```
seeaifirst/
├── index.html          # UI + CSS + JS (single file)
├── data.json           # 66 tools, 13 sections, 5 layers
├── og-image.png        # Social preview image
├── sitemap.xml         # SEO sitemap
├── robots.txt          # SEO robots
├── package.json        # npm config (for validator)
├── scripts/
│   └── validate.js     # Data validation (8 checks)
└── .github/
    └── ISSUE_TEMPLATE/
        └── suggest-tool.yml  # Community tool suggestions
```

## Data

All tool data lives in `data.json`. Each tool card includes:

- Basic info: name, description, sources
- Enrichment: pricing, deployment model, difficulty level
- Opinions: when to use, when not to use, compatible tools
- Verification: verified date, verification method

Schema is frozen at v1.0.0. See [CONTRIBUTING.md](CONTRIBUTING.md) for data format details.

## Contributing

We welcome contributions! The main ways to help:

- **Suggest a tool** → [Open an issue](https://github.com/BARONFANTHE/seeaifirst/issues/new?template=suggest-tool.yml)
- **Report a bug** → [Open an issue](https://github.com/BARONFANTHE/seeaifirst/issues/new)
- **Improve data** → Submit a PR (see [CONTRIBUTING.md](CONTRIBUTING.md))

## Roadmap

| Phase | Status |
|-------|--------|
| Interactive visualization | ✅ Complete |
| 66 tools across 13 categories | ✅ Complete |
| Compare Mode + Tool Picker | ✅ Complete |
| Schema enrichment (12 fields per tool) | ✅ Complete |
| SEO + JSON-LD structured data | ✅ Complete |
| Custom domain (seeaifirst.com) | ✅ Complete |
| Community: public repo + contributing guide | 🔄 In Progress |
| Path-based routing for SEO | 📋 Planned |
| Internationalization | 📋 Planned |

## Tech Stack

- **Frontend:** Vanilla HTML + CSS + JS (single file, no framework)
- **Data:** JSON (schema v1.0.0 frozen)
- **Hosting:** Vercel (auto-deploy from `main`)
- **SEO:** JSON-LD structured data, canonical domain, sitemap + robots.txt

## License

[MIT](LICENSE)

---

*Vietnamese descriptions available on the live site.*

*Data verified as of February 2026. Found something outdated? [Open an issue](https://github.com/BARONFANTHE/seeaifirst/issues/new).*

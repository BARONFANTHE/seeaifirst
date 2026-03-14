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
- 🔗 **Deep linking** — every tool has a permanent URL via path-based routing
- ⚖️ **Compare Mode** — side-by-side tool comparisons with preset and custom selections
- 🎯 **Tool Picker** — interactive selection for building your AI stack
- 📊 **Enriched metadata** — pricing, deployment, difficulty, compatibility, use cases
- 🌗 **Dark/Light theme**
- 📱 **Mobile responsive**
- ⚡ **Zero backend** — static HTML + JSON on CDN, loads instantly

## Usage

One effective way to use See AI First is to **ask your AI agent to look things up for you.**

Instead of browsing manually, you can ask your AI assistant (Claude, ChatGPT, Gemini, Grok, or any agent with web access) something like:

**Locate a tool in the AI ecosystem:**
- *"Where does MCP fit in the AI stack? Check seeaifirst.com"*
- *"I found github.com/langchain-ai/langchain — where does this sit in the AI ecosystem? Look it up on seeaifirst.com"*
- *"Someone recommended Qdrant. What category is it in and what are the alternatives? Check seeaifirst.com"*

**Build your stack:**
- *"I'm building a RAG pipeline. What tools does seeaifirst.com recommend?"*
- *"Compare LangGraph vs CrewAI on seeaifirst.com"*

**Evaluate before adopting:**
- *"I'm considering pgvector for vector search. What does seeaifirst.com say about when to use it and when not to?"*
- *"What's the trade-off between LangSmith and Langfuse for observability? Check seeaifirst.com"*

**Validate social media recommendations:**
- *"I saw a post claiming FastCode is cheaper than Claude Code and Cursor. Is it on seeaifirst.com? Where does it fit in the coding agents category?"*
- *"Someone shared a new AI framework on Twitter. Check if seeaifirst.com covers it and what the trade-offs are"*

The site is structured so web-enabled AI agents can read and summarize it more effectively — 66 tools mapped across 13 categories with opinionated trade-offs, so your agent gets context, not just links.

You can also browse directly at [seeaifirst.com](https://seeaifirst.com) — use Search (Ctrl+K), Compare Mode, or Tool Picker to explore.

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

All tool data lives in `data.json` (English) and `data.vi.json` (Vietnamese). Each tool card includes:

- Basic info: name, description, sources
- Enrichment: pricing, deployment model, difficulty level
- Opinions: when to use, when not to use, compatible tools
- Verification: verified date, verification method

Schema is frozen at v1.0.0. See [CONTRIBUTING.md](CONTRIBUTING.md) for data format details.

## Selection Criteria

Not every tool belongs here. Each suggestion is evaluated against 5 criteria:

| Criteria | Minimum Threshold |
|----------|-------------------|
| **GitHub Stars** | Usually >5K ⭐ — exceptions allowed for innovative tools with strong rationale + evidence |
| **Relevance** | Must be part of the AI developer ecosystem |
| **Maturity** | Has documentation, active development, community |
| **Uniqueness** | Does not duplicate an existing card's functionality |
| **Category Fit** | Fits within existing 13 sections (new sections require strong justification) |

100+ tools evaluated. 66 selected. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to suggest a tool.

## Contributing

We welcome contributions! The main ways to help:

- **Suggest a tool** → [Open an issue](https://github.com/BARONFANTHE/seeaifirst/issues/new?template=suggest-tool.yml)
- **Report a bug** → [Open an issue](https://github.com/BARONFANTHE/seeaifirst/issues/new)
- **Improve data** → Submit a PR (see [CONTRIBUTING.md](CONTRIBUTING.md))

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

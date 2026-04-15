# HUSTLE-AI-PLATFORMS

Executive-grade AI product suite for African businesses, deployed with a Cloudflare-first architecture and structured as a production-ready monorepo.

## Hustle AI Overview

Hustle AI is a portfolio of decision-support applications built for African SMEs, operators, distributors, retailers, subscription businesses, advisory firms, and risk teams that need commercially credible AI systems rather than demo dashboards. The suite combines Next.js frontends, FastAPI analytics services, reusable design primitives, shared reporting utilities, and Cloudflare deployment patterns so each product can ship independently without drifting away from the portfolio standard.

The portfolio is anchored by **Hustle Workforce**, the flagship product for executive decision support across finance, operations, sales, growth, strategy, and SME institutional memory.

The suite now defaults to an open-source-first model strategy built around `Qwen 2.5 Instruct` for reasoning, `Mistral Small Instruct` for lower-cost operational AI tasks, and `bge-m3` for embeddings and retrieval.

## Product Suite

| Product | Focus | Positioning |
| --- | --- | --- |
| Hustle Workforce | Workforce, finance, operations, strategy, SME Knowledge Brain | Flagship modular AI workforce platform for African SMEs |
| Hustle CX Intelligence | Support, transcripts, churn, product insights | Customer intelligence platform for high-volume support environments |
| Hustle Revenue Intelligence | Pricing, revenue drivers, churn impact, expansion | Revenue optimization platform for commercial decision support |
| Hustle Inventory Intelligence | Stock visibility, replenishment, dead stock, suppliers | Inventory visibility and decision support for growth-stage businesses |
| Hustle Risk Intelligence | Financial, operational, supplier, customer risk | Risk monitoring and scenario planning platform |
| Hustle Fraud Intelligence | Anomalies, supplier fraud, expense abuse, governance | Fraud detection and governance decision support for African SMEs |

## Why African Businesses

African businesses often operate through fragmented workflows, WhatsApp-led customer journeys, distributor-heavy channels, cashflow constraints, volatile supplier conditions, and rapid informal growth. This suite is designed around those operating realities:

- executive clarity over fragmented data
- lightweight uploads with synthetic demos for fast trials
- boardroom-ready reporting instead of notebook-style output
- practical AI copilots that support judgment without overstating certainty
- Cloudflare-first delivery that keeps deployment lean and globally reachable

## Architecture Overview

- `Next.js + TypeScript` frontends for executive dashboards, uploads, and interactive copilots
- `FastAPI + pandas + duckdb/sqlite + pydantic` backends for analytics, scoring, and report generation
- `shared/frontend` for layout, footer, card, chart, and upload primitives
- `shared/backend` for schemas, model routing, analytics helpers, utilities, and reporting helpers
- `shared/cloudflare` for Pages, Tunnel, Docker, and environment templates
- synthetic datasets in each product plus shared sample-data guidance

Architecture diagrams for executive, platform, product, deployment, and data/AI reviews are available in [docs/diagrams/README.md](/C:/Users/bright.sikazwe/Downloads/Hustle%20AI%20Platforms/docs/diagrams/README.md).

## Deployment Overview

- Frontends target `Cloudflare Pages`
- Backends are containerized FastAPI services designed for Cloudflare-compatible origin routing
- `cloudflared` examples are included for secure private origin exposure
- Cloudflare API credentials are expected through environment variables, with `CLOUDFLARE_API_TOKEN` documented in [docs/cloudflare_token_requirements.md](/C:/Users/bright.sikazwe/Downloads/Hustle%20AI%20Platforms/docs/cloudflare_token_requirements.md)
- optional future extensions for Workers AI, D1, KV, or R2 are documented without making them mandatory

## Monetization Overview

The portfolio is positioned as a commercially viable product family for:

- African SMEs and operator-led businesses
- retail and distribution businesses
- subscription and support-heavy businesses
- advisory firms running client diagnostics
- finance, risk, audit, and governance teams

Suggested revenue models:

- per-company SaaS subscription
- implementation and onboarding fees
- premium reporting and executive briefing packages
- advisor and channel-partner licensing
- industry bundles for telco, retail, logistics, and multi-branch SMEs

## Development Notes

1. Install Node dependencies from the monorepo root with `pnpm install`.
2. Install backend dependencies per product with `python -m pip install -r backend/requirements.txt`.
3. Run a frontend from its `frontend` directory and a backend from its `backend` directory.
4. Use `.env` files derived from `shared/cloudflare/env/.env.cloudflare.example`.
5. Do not commit live Cloudflare secrets.

## Product Links

- [Hustle Workforce](/C:/Users/bright.sikazwe/Downloads/Hustle%20AI%20Platforms/hustle-workforce/README.md)
- [Hustle CX Intelligence](/C:/Users/bright.sikazwe/Downloads/Hustle%20AI%20Platforms/hustle-cx-intelligence/README.md)
- [Hustle Revenue Intelligence](/C:/Users/bright.sikazwe/Downloads/Hustle%20AI%20Platforms/hustle-revenue-intelligence/README.md)
- [Hustle Inventory Intelligence](/C:/Users/bright.sikazwe/Downloads/Hustle%20AI%20Platforms/hustle-inventory-intelligence/README.md)
- [Hustle Risk Intelligence](/C:/Users/bright.sikazwe/Downloads/Hustle%20AI%20Platforms/hustle-risk-intelligence/README.md)
- [Hustle Fraud Intelligence](/C:/Users/bright.sikazwe/Downloads/Hustle%20AI%20Platforms/hustle-fraud-intelligence/README.md)

## Repository Map

```text
hustle-ai-platforms/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── docs/
├── shared/
├── hustle-workforce/
├── hustle-cx-intelligence/
├── hustle-revenue-intelligence/
├── hustle-inventory-intelligence/
├── hustle-risk-intelligence/
└── hustle-fraud-intelligence/
```

@BryteSikaStrategyAI

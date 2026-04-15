# Hustle Revenue Intelligence Prompt Specification

## Cloudflare-First Requirement

Keep the product Cloudflare-first:

- Next.js frontend for Cloudflare Pages
- Python backend for analytics, workflow handling, and model routing
- Dockerized backend where appropriate
- Cloudflare Tunnel or equivalent Cloudflare-compatible backend access

Do not use Streamlit.

## Product Identity

Build **Hustle Revenue Intelligence** as a premium revenue optimization product for pricing discipline, recurring revenue analysis, churn impact evaluation, and commercial decision support for African businesses.

## Core Positioning

The product should feel like a commercial decision platform with persistent pricing context and stored decision outputs, not just a static revenue dashboard.

## Architecture Language To Use

Assume:

- persistent revenue agents with memory of prior analyses
- pricing simulations and multi-step decision workflows
- stored pricing decision briefs and recurring commercial summaries
- shared model routing across the monorepo
- future batch-oriented scenario simulation support

## Product Sections

1. Executive Revenue Overview
2. Pricing Intelligence
3. Revenue Driver Analysis
4. Churn Revenue Impact
5. Upsell & Cross-sell Opportunities
6. Revenue Decision Copilot
7. About

## Agents

- Pricing Optimization Agent
- Revenue Driver Agent
- Churn Impact Agent
- Upsell & Cross-sell Agent
- Revenue Decision Copilot

## Artifact Expectations

The product should generate and store:

- pricing decision briefs
- recurring revenue summaries
- churn exposure notes
- expansion opportunity reports
- simulation outputs where relevant

## Async And Background Expectations

Leave room for:

- weekly revenue review summaries
- recurring pricing checks
- churn exposure refresh jobs
- background scenario simulation runs

## File Input

- CSV files
- text notes where relevant
- synthetic fallback data

## Model Strategy

- Use `Qwen 2.5 Instruct` for pricing copilots, executive summaries, forecast reasoning, and growth decision support
- Use `Mistral Small Instruct` for funnel parsing, routine summaries, issue extraction, and lower-cost operational tasks
- Use `bge-m3` for retrieval, semantic search, note clustering, and knowledge-backed revenue workflows

## Tone

Keep the language commercially persuasive, executive, technically credible, and relevant to operator-led African businesses.

## Output Requirements

1. revised product prompt/spec text
2. improved architecture language
3. artifact expectations
4. recurring-job expectations

@BryteSikaStrategyAI

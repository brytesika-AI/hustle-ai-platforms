# Hustle Risk Intelligence Prompt Specification

## Cloudflare-First Requirement

Build the product as a Cloudflare-first application with:

- Next.js frontend for Cloudflare Pages
- Python backend for analytics, workflow state, and reporting
- Dockerized backend where appropriate
- Cloudflare Tunnel or equivalent Cloudflare-compatible routing

Do not use Streamlit.

## Product Identity

Build **Hustle Risk Intelligence** as a persistent risk-monitoring platform for African SMEs and growth businesses across finance, operations, supplier dependency, customer concentration, compliance exposure, and market instability.

## Core Positioning

The product should feel like an ongoing exposure-monitoring and executive-digest system, not just a static risk dashboard.

## Architecture Language To Use

Assume:

- persistent risk agents with history awareness
- ongoing exposure monitoring
- stored risk history and recurring executive digests
- long-running scenario workflows
- shared model routing at the monorepo level
- future sandbox-ready heavy analysis for broader scenario packs

## Product Sections

1. Executive Risk Overview
2. Financial Risk Monitoring
3. Operational Risk Monitoring
4. Supplier & Dependency Risk
5. Customer Concentration Risk
6. Risk Scenario Copilot
7. About

## Agents

1. Financial Risk Agent
2. Operational Risk Agent
3. Supplier Risk Agent
4. Customer Risk Agent
5. Risk Scenario Copilot

These should be described as capable of continuing from prior risk state, recurring review cycles, and stored mitigation context.

## Artifact Expectations

The product should generate and store:

- risk digests
- scenario briefs
- monitoring logs
- mitigation follow-up notes
- executive exposure summaries

## Async And Background Expectations

Leave room for:

- weekly risk digests
- recurring supplier and customer concentration checks
- ongoing exposure snapshots
- scheduled executive risk summaries

## File Input

- CSV files
- text risk notes
- synthetic sample data fallback

## Model Strategy

- Use `Qwen 2.5 Instruct` for risk copilots, executive summaries, scenario analysis, and risk explanations
- Use `Mistral Small Instruct` for routine monitoring summaries, first-pass parsing, and issue extraction
- Use `bge-m3` for risk note retrieval, semantic search, clustering, and knowledge-backed risk workflows

## Tone

Use architect-grade, executive, commercially credible language with clear African-business relevance.

## Output Requirements

1. revised product prompt/spec text
2. improved architecture language
3. artifact expectations
4. recurring-job expectations

@BryteSikaStrategyAI

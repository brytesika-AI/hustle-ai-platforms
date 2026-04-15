# Hustle Workforce Prompt Specification

## Cloudflare-First Requirement

All implementations must remain Cloudflare-first.

- Next.js frontend deployed to Cloudflare Pages
- Python backend for analytics, orchestration, and agent runtime
- Dockerized backend where appropriate
- Cloudflare Tunnel or equivalent Cloudflare-compatible routing for backend access
- shared Cloudflare deployment docs and config examples

Do not use Streamlit as the application framework, local UI, or deployment target.

## Product Identity

Build **Hustle Workforce** as the flagship agent operating environment in `hustle-workforce/` under `hustle-ai-platforms`.

It is an executive-grade, modular AI workforce platform for African SMEs covering finance, operations, sales, growth, strategy, and the SME Knowledge Brain.

## Core Positioning

The product should feel like a boardroom-ready operating system for business decisions, not just a reporting dashboard. It must support continuing agent workflows, persistent departmental context, artifact generation, and future asynchronous review cycles.

## Architecture Language To Use

Treat the product as a persistent agent platform with:

- department agents that can retain prior state
- multi-step decision workflows that continue across time
- SME Knowledge Brain artifact generation and storage
- structured reporting and decision-brief persistence
- background-ready workflows for recurring operating summaries
- shared monorepo model routing rather than product-specific routing logic

## Product Sections

1. Executive Overview
2. Finance Department
3. Operations Department
4. Sales Department
5. Strategy Department
6. Growth Department
7. SME Knowledge Brain
8. About

## Agents

1. Cashflow Intelligence Agent
2. Inventory Forecast Agent
3. WhatsApp CRM Intelligence Agent
4. SME Decision Copilot with:
   - Socratic Agent
   - Analyst Agent
   - Devil's Advocate Agent
   - Strategist Agent
5. Marketing Campaign Agent

These agents should be described as persistent departmental agents where relevant, with the ability to resume from prior outputs and contribute to longer-running operating workflows.

## Knowledge Brain Expectations

The SME Knowledge Brain must support:

- `knowledge/raw/`
- `knowledge/wiki/`
- rule schema files
- ingest and batch ingest
- query and explore
- lint and contradiction detection
- executive brief generation
- durable wiki-page and summary artifacts

## Artifact Expectations

The product should generate and store business artifacts such as:

- executive briefs
- departmental summaries
- decision briefs
- wiki pages
- campaign drafts
- management follow-up notes

## Async And Background Expectations

Leave room for future recurring workflows such as:

- weekly management digests
- recurring knowledge-brain health checks
- periodic department review summaries
- scheduled decision-brief refreshes

## File Input

Users must be able to:

- upload CSV files
- upload text files
- use synthetic sample data when no upload is provided

## Business Health Engine

Combine:

- financial risk
- inventory risk
- sales pipeline health
- growth activity
- knowledge maturity

## Model Strategy

- Use `Qwen 2.5 Instruct` for the SME Decision Copilot, executive briefs, multi-step business analysis, and higher-value decision support
- Use `Mistral Small Instruct` for routine summaries, departmental intake parsing, issue extraction, and lower-cost operational tasks
- Use `bge-m3` for SME Knowledge Brain retrieval, semantic search, clustering, and document similarity

## Tone

Use executive, commercially credible, African-market-aware language. Keep outputs recruiter-friendly, investor-friendly, and enterprise-grade without becoming vague.

## Output Requirements

1. file tree for `hustle-workforce`
2. all files with full content
3. local development instructions
4. Cloudflare deployment steps
5. product checklist

@BryteSikaStrategyAI

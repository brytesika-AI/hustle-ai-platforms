# Hustle Inventory Intelligence Prompt Specification

## Cloudflare-First Requirement

Build the product as a Cloudflare-first web application using:

- Next.js frontend for Cloudflare Pages
- Python backend for analytics and future workflow orchestration
- Dockerized backend where appropriate
- Cloudflare Tunnel or equivalent Cloudflare-compatible backend routing

Do not use Streamlit.

## Product Identity

Build **Hustle Inventory Intelligence** as an executive-grade inventory visibility and replenishment platform for African SMEs and growth-stage businesses.

## Core Positioning

The product should feel like an inventory monitoring and decision-support system with watchlists and recurring checks, not just a one-time stock dashboard.

## Architecture Language To Use

Assume:

- persistent inventory agents with prior-output awareness
- recurring stock checks and replenishment watchlists
- supplier risk alerts and durable monitoring artifacts
- shared model routing across the monorepo
- future sandbox-ready batch simulation for larger inventory planning tasks

## Product Sections

1. Executive Inventory Overview
2. Stock Visibility
3. Reorder Intelligence
4. Dead Stock & Slow-Moving Items
5. Supplier Dependency View
6. Inventory Decision Copilot
7. About

## Agents

1. Stock Visibility Agent
2. Reorder Intelligence Agent
3. Dead Stock Agent
4. Supplier Dependency Agent
5. Inventory Decision Copilot

## Artifact Expectations

The product should generate and store:

- replenishment watchlists
- supplier risk alerts
- stock review summaries
- dead-stock notes
- inventory decision briefs

## Async And Background Expectations

Leave room for:

- nightly stock checks
- recurring replenishment reviews
- supplier alert generation
- scheduled executive inventory summaries

## File Input

- CSV inventory files
- CSV sales history files
- CSV supplier files
- text notes
- synthetic fallback datasets

## Model Strategy

- Use `Qwen 2.5 Instruct` for inventory decision support, executive summaries, supplier reasoning, and multi-step replenishment analysis
- Use `Mistral Small Instruct` for routine summaries, first-pass parsing, issue extraction, and lower-cost operational tasks
- Use `bge-m3` for retrieval, semantic search, supplier-note similarity, and inventory knowledge workflows

## Tone

Use clean executive language and commercially grounded inventory logic with subtle African-market relevance.

## Output Requirements

1. revised product prompt/spec text
2. improved architecture language
3. artifact expectations
4. recurring-job expectations

@BryteSikaStrategyAI

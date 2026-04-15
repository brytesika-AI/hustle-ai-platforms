# Hustle Workforce

Flagship modular AI workforce platform for African SMEs covering finance, operations, sales, growth, strategy, and an SME Knowledge Brain.

## Product Vision

Hustle Workforce gives leadership teams one operating surface for business health, departmental visibility, decision support, and institutional memory. It is designed for SMEs that want executive-grade clarity without enterprise software overhead.

## Problem Statement

African SMEs often make important decisions across spreadsheets, chat threads, memory, and fragmented reports. That slows response time and weakens operating discipline. Hustle Workforce brings those signals into one Cloudflare-first web application.

## Market Relevance

- founder-led and operator-led SMEs
- multi-branch businesses
- distributors and retailers
- advisory firms supporting SME transformation

## Modules

- Executive Overview
- Finance Department
- Operations Department
- Sales Department
- Strategy Department
- Growth Department
- SME Knowledge Brain
- About

## Core Capabilities

- Cashflow Intelligence Agent
- Inventory Forecast Agent
- WhatsApp CRM Intelligence Agent
- SME Decision Copilot with Socratic, Analyst, Devil's Advocate, and Strategist modes
- Marketing Campaign Agent
- SME Knowledge Brain for ingestion, wiki generation, query, contradictions, summaries, and brief generation

## Model Strategy

- `Qwen 2.5 Instruct` for the SME Decision Copilot, executive summaries, Knowledge Brain summaries, and strategic recommendations
- `Mistral Small Instruct` for WhatsApp parsing, first-pass extraction, and lower-cost routine text operations
- `bge-m3` for Knowledge Brain retrieval and semantic search

## Architecture

- `frontend/`: Next.js executive dashboard for Pages deployment
- `backend/`: FastAPI analytics and knowledge engine
- `knowledge/`: synthetic raw and wiki notes
- `cloudflare/`: Pages and Tunnel examples

## Upload Options

- CSV uploads
- text uploads
- fallback synthetic demo data

## Local Setup

1. Install frontend dependencies with `pnpm install` from the monorepo root.
2. Install backend dependencies with `python -m pip install -r hustle-workforce/backend/requirements.txt`.
3. Run the backend from `hustle-workforce/backend` with `uvicorn backend.app.main:app --reload`.
4. Run the frontend from `hustle-workforce/frontend` with `pnpm dev`.

## Cloudflare Deployment

1. Deploy `frontend/` to Cloudflare Pages.
2. Build the FastAPI backend Docker image.
3. Route the backend through Cloudflare Tunnel using the product config pattern.
4. Set `NEXT_PUBLIC_API_BASE_URL` and Cloudflare environment variables in deployment secrets.

## Monetization Strategy

- SME subscription tiers
- onboarding and advisory bundles
- premium knowledge-brain setup packages
- executive reporting upsells

## Footer Rule

All customer-facing pages, briefings, and exported markdown must retain the portfolio footer below.

@BryteSikaStrategyAI

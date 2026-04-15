# Hustle Revenue Intelligence

AI product for pricing, revenue optimization, churn impact analysis, and commercial decision support for African businesses.

## Product Vision

Hustle Revenue Intelligence helps commercial leaders defend price, protect recurring revenue, and prioritize the best expansion moves with clearer evidence.

## Problem Statement

Revenue growth can hide discount leakage, churn exposure, and weak upsell quality. This platform makes those tradeoffs visible before they become expensive.

## Market Relevance

- subscription and SaaS businesses
- distributors and retailers
- operator-led SMEs
- advisory firms running commercial diagnostics

## Modules

- Executive Revenue Overview
- Pricing Intelligence
- Revenue Driver Analysis
- Churn Revenue Impact
- Upsell & Cross-sell Opportunities
- Revenue Decision Copilot
- About

## Core Capabilities

- Pricing Optimization Agent
- Revenue Driver Agent
- Churn Impact Agent
- Upsell & Cross-sell Agent
- Revenue Decision Copilot

## Model Strategy

- `Qwen 2.5 Instruct` for pricing and revenue decision support plus higher-value strategic recommendations
- `Mistral Small Instruct` for first-pass narrative generation and lower-cost routine summaries
- `bge-m3` for retrieval if revenue knowledge workflows are added

## Architecture

- `frontend/`: Next.js Cloudflare Pages application
- `backend/`: FastAPI analytics service
- `datasets/`: synthetic commercial data
- `cloudflare/`: deployment examples

## Upload Options

- CSV files
- text notes
- fallback synthetic demo data

## Local Setup

1. Install frontend dependencies with `pnpm install`.
2. Install backend dependencies with `python -m pip install -r hustle-revenue-intelligence/backend/requirements.txt`.
3. Start the backend from `hustle-revenue-intelligence/backend`.
4. Start the frontend from `hustle-revenue-intelligence/frontend`.

## Cloudflare Deployment

1. Ship the frontend to Cloudflare Pages.
2. Build and deploy the FastAPI backend container.
3. Put the backend behind Cloudflare Tunnel.
4. Configure `NEXT_PUBLIC_API_BASE_URL` and Cloudflare secrets.

## Monetization Strategy

- commercial intelligence SaaS tiers
- pricing advisory bundles
- revenue review add-ons for finance and sales leaders
- channel packages for advisors and operators

@BryteSikaStrategyAI

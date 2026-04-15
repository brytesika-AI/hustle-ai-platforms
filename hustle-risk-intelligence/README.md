# Hustle Risk Intelligence

AI risk monitoring and scenario planning platform for African SMEs and growth businesses covering financial, operational, supplier, customer, and exposure risks.

## Product Vision

Hustle Risk Intelligence brings enterprise-style risk visibility to businesses that need a practical way to track emerging pressure before it becomes a board-level surprise.

## Problem Statement

Many growth businesses manage risk informally until financial, supplier, or customer concentration issues become painful. This product gives leadership a structured risk monitoring surface earlier.

## Market Relevance

- founder-led and operator-led businesses
- advisory firms
- finance and governance teams
- multi-branch businesses with growing exposure complexity

## Modules

- Executive Risk Overview
- Financial Risk Monitoring
- Operational Risk Monitoring
- Supplier & Dependency Risk
- Customer Concentration Risk
- Risk Scenario Copilot
- About

## Core Capabilities

- Financial Risk Agent
- Operational Risk Agent
- Supplier Risk Agent
- Customer Risk Agent
- Risk Scenario Copilot

## Model Strategy

- `Qwen 2.5 Instruct` for risk interpretation, scenario copilot flows, and executive risk explanations
- `Mistral Small Instruct` for first-pass classification and lower-cost triage
- `bge-m3` for risk history retrieval

## Architecture

- `frontend/`: Next.js Cloudflare Pages application
- `backend/`: FastAPI risk service
- `datasets/`: synthetic risk and note data
- `cloudflare/`: Cloudflare deployment examples

## Upload Options

- CSV files
- text risk notes
- fallback synthetic data

## Local Setup

1. Install frontend dependencies with `pnpm install`.
2. Install backend dependencies with `python -m pip install -r hustle-risk-intelligence/backend/requirements.txt`.
3. Run the backend from `hustle-risk-intelligence/backend`.
4. Run the frontend from `hustle-risk-intelligence/frontend`.

## Cloudflare Deployment

1. Deploy the frontend to Cloudflare Pages.
2. Build and run the backend container.
3. Route the backend securely with Cloudflare Tunnel.
4. Set environment variables for Cloudflare and the public API base URL.

## Monetization Strategy

- governance subscriptions
- advisory and diagnostic engagements
- scenario planning workshops
- premium exposure monitoring for finance teams

@BryteSikaStrategyAI

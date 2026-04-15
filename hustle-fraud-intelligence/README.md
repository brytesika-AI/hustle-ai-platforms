# Hustle Fraud Intelligence

Risk Management and Fraud Detection using Generative AI in African SMEs.

## Product Vision

Hustle Fraud Intelligence helps African SMEs and growth businesses review suspicious patterns, prioritize investigations, and strengthen governance without overstating what AI can conclude.

## Problem Statement

Fraud and abuse signals often hide inside transactions, supplier behaviour, claims, and refund activity. Teams need a practical way to flag anomalies early and turn them into review workflows.

## Market Relevance

- SMEs with growing transaction volume
- finance and governance teams
- subscription and refund-heavy businesses
- advisory firms supporting internal controls

## Modules

- Executive Fraud & Risk Overview
- Transaction Anomaly Detection
- Procurement & Supplier Fraud Signals
- Expense & Claims Review
- Refund & Customer Abuse Monitoring
- Fraud Investigation Copilot
- Governance Briefing
- About

## Core Capabilities

- Transaction Risk Agent
- Procurement Fraud Agent
- Expense Review Agent
- Refund Abuse Agent
- Fraud Investigation Copilot
- Governance Briefing Agent

## Model Strategy

- `Qwen 2.5 Instruct` for fraud investigation, anomaly explanation, and governance briefings
- `Mistral Small Instruct` for routine extraction tasks and lower-cost operational review
- `bge-m3` for case memory and retrieval

## Architecture

- `frontend/`: Next.js Cloudflare Pages dashboard
- `backend/`: FastAPI anomaly and governance analytics service
- `datasets/`: synthetic transactions, suppliers, expenses, and notes
- `cloudflare/`: Cloudflare deployment examples

## Upload Options

- CSV files
- text investigation notes
- transaction files
- supplier files
- expense files
- fallback synthetic data

## Safety Position

Outputs are framed as anomalies, red flags, review priorities, and risk indicators. They are not legal conclusions and do not accuse individuals.

## Local Setup

1. Install frontend dependencies with `pnpm install`.
2. Install backend dependencies with `python -m pip install -r hustle-fraud-intelligence/backend/requirements.txt`.
3. Start the backend from `hustle-fraud-intelligence/backend`.
4. Start the frontend from `hustle-fraud-intelligence/frontend`.

## Cloudflare Deployment

1. Deploy the frontend to Cloudflare Pages.
2. Build and deploy the backend Docker image.
3. Expose the backend through Cloudflare Tunnel.
4. Configure Cloudflare API credentials and the public API base URL.

## Monetization Strategy

- governance and fraud subscriptions
- investigation workflow tiers
- board reporting and briefing packages
- advisory bundles for internal-control reviews

@BryteSikaStrategyAI

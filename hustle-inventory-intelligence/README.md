# Hustle Inventory Intelligence

AI product for stock visibility, replenishment optimization, supplier dependency detection, and inventory decision support for African SMEs and growth-stage businesses.

## Product Vision

Hustle Inventory Intelligence gives leadership teams clearer stock visibility, smarter reorder timing, and practical supplier-risk awareness without relying on heavyweight ERP tooling.

## Problem Statement

Inventory problems usually show up as tied-up cash, delayed service, dead stock, or overdependence on a few suppliers. This product surfaces those patterns early.

## Market Relevance

- retail and wholesale businesses
- multi-branch operators
- distributors
- growth-stage companies managing working capital tightly

## Modules

- Executive Inventory Overview
- Stock Visibility
- Reorder Intelligence
- Dead Stock & Slow-Moving Items
- Supplier Dependency View
- Inventory Decision Copilot
- About

## Core Capabilities

- Stock Visibility Agent
- Reorder Intelligence Agent
- Dead Stock Agent
- Supplier Dependency Agent
- Inventory Decision Copilot

## Model Strategy

- `Mistral Small Instruct` for routine explanations and lower-cost operational summaries
- `Qwen 2.5 Instruct` for the Inventory Decision Copilot and higher-value interpretation
- `bge-m3` for supplier or note retrieval if retrieval workflows are added

## Architecture

- `frontend/`: Next.js Cloudflare Pages dashboard
- `backend/`: FastAPI inventory analytics engine
- `datasets/`: synthetic inventory, supplier, and sales history files
- `cloudflare/`: Pages and Tunnel examples

## Upload Options

- CSV inventory files
- CSV sales history files
- CSV supplier files
- text notes
- fallback synthetic data

## Local Setup

1. Install frontend dependencies with `pnpm install`.
2. Install backend dependencies with `python -m pip install -r hustle-inventory-intelligence/backend/requirements.txt`.
3. Start the backend from `hustle-inventory-intelligence/backend`.
4. Start the frontend from `hustle-inventory-intelligence/frontend`.

## Cloudflare Deployment

1. Deploy the frontend to Cloudflare Pages.
2. Deploy the backend container to your preferred runtime.
3. Publish the backend through Cloudflare Tunnel.
4. Set public API and Cloudflare credentials in environment variables.

## Monetization Strategy

- inventory optimization subscriptions
- branch-based pricing
- supplier dependency review packages
- distributor analytics bundles

@BryteSikaStrategyAI

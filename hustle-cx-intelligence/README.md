# Hustle CX Intelligence

AI-powered customer support and customer intelligence platform for African businesses, especially telco, pay TV, subscription, and high-volume support environments.

## Product Vision

Hustle CX Intelligence helps leadership teams turn transcript volume into management action. It surfaces root causes, churn pressure, severity trends, and product improvement signals in a boardroom-ready format.

## Problem Statement

Support teams often know there is friction before leadership knows why it is happening. This product closes that gap by structuring transcript data into executive decisions.

## Market Relevance

- telco and pay TV operators
- subscription businesses
- service-heavy support organizations
- outsourced support and customer-care teams

## Modules

- Executive Overview
- Transcript Intelligence
- Root Cause Engine
- Churn Risk Engine
- Product Improvement Insights
- Knowledge & Trends
- About

## Core Capabilities

- Transcript Classification Agent
- Sentiment & Severity Agent
- Root Cause Agent
- Churn Risk Agent
- Product Improvement Agent
- Executive CX Copilot

## Model Strategy

- `Mistral Small Instruct` for transcript classification, transcript parsing, first-pass summaries, and issue extraction
- `Qwen 2.5 Instruct` for the Executive CX Copilot and root-cause narratives
- `bge-m3` for similar case retrieval and transcript similarity

## Architecture

- `frontend/`: Next.js dashboard for Cloudflare Pages
- `backend/`: FastAPI transcript analytics service
- `datasets/`: synthetic support transcripts and trend notes
- `cloudflare/`: deployment examples

## Upload Options

- CSV transcript files
- text files
- fallback synthetic datasets

## Local Setup

1. Install frontend dependencies with `pnpm install`.
2. Install backend dependencies with `python -m pip install -r hustle-cx-intelligence/backend/requirements.txt`.
3. Run the backend with `uvicorn backend.app.main:app --reload` from `hustle-cx-intelligence/backend`.
4. Run the frontend with `pnpm dev` from `hustle-cx-intelligence/frontend`.

## Cloudflare Deployment

1. Deploy the Next.js frontend to Cloudflare Pages.
2. Containerize the FastAPI backend with the included Dockerfile.
3. Expose the backend via Cloudflare Tunnel or a Cloudflare-protected origin.
4. Inject `NEXT_PUBLIC_API_BASE_URL` and Cloudflare credentials as secrets.

## Monetization Strategy

- support analytics subscriptions
- multi-queue enterprise tiers
- premium churn-risk monitoring
- consulting bundles for root-cause improvement programs

@BryteSikaStrategyAI

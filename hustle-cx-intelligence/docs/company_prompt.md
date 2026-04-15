# Hustle CX Intelligence Prompt Specification

## Cloudflare-First Requirement

Build the product as a Cloudflare-first application with:

- Next.js frontend for Cloudflare Pages
- Python backend for analytics, workflows, and agent runtime
- Dockerized backend where appropriate
- Cloudflare Tunnel or equivalent Cloudflare-compatible routing

Do not use Streamlit.

## Product Identity

Build **Hustle CX Intelligence** as a premium customer intelligence platform for African businesses, especially telco, pay TV, subscription, and high-volume support environments.

## Core Positioning

The product must feel like a persistent CX monitoring and follow-up system, not only a transcript dashboard. It should support complaint history, churn watchlists, recurring summaries, issue continuity, and executive review artifacts.

## Architecture Language To Use

Assume:

- persistent CX agents with prior-output awareness
- recurring complaint monitoring workflows
- stored trend summaries and churn watchlists
- shared model routing at the monorepo level
- background-ready digest generation
- future sandbox-ready analysis for large transcript batches

## Product Sections

1. Executive Overview
2. Transcript Intelligence
3. Root Cause Engine
4. Churn Risk Engine
5. Product Improvement Insights
6. Knowledge & Trends
7. About

## Agents

- Transcript Classification Agent
- Sentiment & Severity Agent
- Root Cause Agent
- Churn Risk Agent
- Product Improvement Agent
- Executive CX Copilot

These should be described as capable of continuing from prior complaint history and issue-state context where relevant.

## Artifact Expectations

The product should produce and store:

- support trend summaries
- root-cause follow-up notes
- churn watchlists
- executive CX briefs
- issue history summaries
- product-improvement recommendations

## Async And Background Expectations

Leave room for:

- daily complaint trend snapshots
- weekly support digests
- recurring churn watchlist refreshes
- background transcript classification runs

## File Input

- CSV transcript files
- text files
- synthetic fallback datasets

## Model Strategy

- Use `Qwen 2.5 Instruct` for the executive CX copilot, escalation reasoning, churn-risk explanation, and executive summaries
- Use `Mistral Small Instruct` for transcript classification, first-pass chat parsing, routine summaries, and issue extraction
- Use `bge-m3` for transcript similarity, semantic retrieval, clustering, and trend-backed CX search

## Tone

Use executive, service-operations-aware, commercially grounded language with subtle African-market relevance.

## Output Requirements

1. revised product prompt/spec text
2. refined architecture language
3. Cloudflare-first deployment assumptions
4. artifact and recurring-job expectations

@BryteSikaStrategyAI

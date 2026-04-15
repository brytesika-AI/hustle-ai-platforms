# Hustle Fraud Intelligence Prompt Specification

## Cloudflare-First Requirement

Build the product as a Cloudflare-first application using:

- Next.js frontend for Cloudflare Pages
- Python backend for analytics, investigation workflows, and future sandbox execution
- Dockerized backend where appropriate
- Cloudflare Tunnel or equivalent Cloudflare-compatible backend routing

Do not use Streamlit.

## Product Identity

Build **Hustle Fraud Intelligence** as a fraud and governance decision platform for African SMEs and growth businesses.

Subtitle:
Risk Management and Fraud Detection using Generative AI in African SMEs

## Core Positioning

The product should feel like an investigation-aware operating surface with recurring scans, durable anomaly logs, governance briefing artifacts, and safe multi-step follow-up, not just an anomaly dashboard.

## Architecture Language To Use

Assume:

- persistent fraud agents with investigation memory
- recurring anomaly scans and governance refresh workflows
- durable anomaly logs and investigation artifacts
- shared model routing across the monorepo
- sandbox-ready heavy tasks for large fraud scans or complex reviews

## Product Sections

1. Executive Fraud & Risk Overview
2. Transaction Anomaly Detection
3. Procurement & Supplier Fraud Signals
4. Expense & Claims Review
5. Refund & Customer Abuse Monitoring
6. Fraud Investigation Copilot
7. Governance Briefing
8. About

## Agents

1. Transaction Risk Agent
2. Procurement Fraud Agent
3. Expense Review Agent
4. Refund Abuse Agent
5. Fraud Investigation Copilot
6. Governance Briefing Agent

These should be framed as persistent review agents that support ongoing investigation context without making legal conclusions.

## Safety Requirement

Do not present outputs as legal conclusions.
Do not accuse individuals.
Frame outputs as:

- anomalies
- red flags
- review priorities
- governance signals
- risk indicators

## Artifact Expectations

The product should generate and store:

- anomaly logs
- investigation notes
- governance briefings
- review-priority summaries
- follow-up artifacts for recurring scans

## Async And Background Expectations

Leave room for:

- nightly fraud scans
- recurring supplier anomaly reviews
- scheduled governance brief refreshes
- ongoing refund-abuse monitoring

## Sandbox-Ready Task Expectations

Acknowledge that some future tasks may require isolated or batch-oriented execution, especially:

- large transaction scans
- multi-file investigation workflows
- heavier anomaly clustering

## File Input

- CSV files
- text investigation notes
- transaction files
- supplier files
- expense files
- synthetic fallback datasets

## Model Strategy

- Use `Qwen 2.5 Instruct` for investigation copilots, executive summaries, fraud and risk explanations, and governance decision support
- Use `Mistral Small Instruct` for transaction intake parsing, routine summaries, issue extraction, and lower-cost operational reviews
- Use `bge-m3` for fraud note retrieval, semantic search, clustering, and investigation knowledge workflows

## Tone

Keep the product enterprise-grade, commercially persuasive, safe in its claims, and relevant to African SME governance realities.

## Output Requirements

1. revised product prompt/spec text
2. improved architecture language
3. investigation artifact expectations
4. recurring-job and sandbox expectations

@BryteSikaStrategyAI

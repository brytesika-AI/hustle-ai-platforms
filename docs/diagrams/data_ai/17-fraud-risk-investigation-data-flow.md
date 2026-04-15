# Fraud and Risk Investigation Data Flow

## Purpose

Show how sensitive control-oriented data flows from ingestion to anomaly review, explanation, and governance output.

## Intended Audience

Risk, fraud, audit, and governance stakeholders.

## Why It Matters

This diagram makes the high-stakes side of the portfolio legible and commercially credible.

## Mermaid Diagram

```mermaid
flowchart TD
    A[Transactions, supplier logs, expenses, risk notes] --> B[Validation and preprocessing]
    B --> C[Analytics and anomaly scoring]
    B --> D[Operational extraction]
    B --> E[Embedding and case memory]
    C --> F[Review queues and flagged patterns]
    D --> G[Mistral Small Instruct outputs]
    E --> H[bge-m3 retrieval context]
    F --> I[Qwen 2.5 Instruct explanation layer]
    G --> I
    H --> I
    I --> J[Investigation guidance]
    I --> K[Governance briefings]
    I --> L[Risk and fraud dashboards]
```

## Interpretation Notes

- The flow separates scoring, extraction, retrieval, and explanation to support auditability.
- It is useful for interviews because it shows controlled AI use in sensitive workflows.
- The diagram supports both risk and fraud product narratives.

@BryteSikaStrategyAI

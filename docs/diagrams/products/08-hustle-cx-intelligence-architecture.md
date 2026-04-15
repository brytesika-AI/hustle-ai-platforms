# Hustle CX Intelligence Architecture

## Purpose

Show how transcript inputs become classification, root-cause analysis, churn signals, and executive CX insight.

## Intended Audience

Hiring managers, AI product leaders, and customer-operations stakeholders.

## Why It Matters

This product demonstrates how operational text flows can be transformed into leadership-grade customer insight.

## Mermaid Diagram

```mermaid
flowchart TD
    A[Support transcripts and notes] --> B[Hustle CX Intelligence frontend]
    B --> C[Transcript Intelligence]
    B --> D[Root Cause Engine]
    B --> E[Churn Risk Engine]
    B --> F[Product Improvement Insights]
    B --> G[Knowledge and Trends]
    A --> H[Backend ingestion and parsing]
    H --> I[Mistral Small Instruct]
    H --> J[bge-m3]
    H --> K[Shared analytics]
    K --> L[Issue extraction and sentiment patterns]
    J --> M[Similar case retrieval]
    L --> N[Qwen 2.5 Instruct]
    M --> N
    N --> O[Executive CX narratives and recommendations]
```

## Interpretation Notes

- Operational transcript handling starts with lighter models and retrieval, then escalates to reasoning for narrative insight.
- The product-level flow is easy to explain in interviews because each stage has a clear business outcome.
- This is especially useful for Director of Data or AI product conversations.

@BryteSikaStrategyAI

# AI and Model Routing Architecture

## Purpose

Document the open-source-first model routing design across reasoning, operational, and embedding workloads.

## Intended Audience

AI architects, platform leaders, and technically curious executives.

## Why It Matters

This diagram shows cost control, portability, and task-based model discipline without tying the suite to one provider.

## Mermaid Diagram

```mermaid
flowchart LR
    A[Task Declaration] --> B{Task-based Router}
    B --> C[Qwen 2.5 Instruct<br/>reasoning and copilots]
    B --> D[Mistral Small Instruct<br/>operational tasks]
    B --> E[bge-m3<br/>embeddings and retrieval]
    C --> F[Executive summaries]
    C --> G[Decision support]
    C --> H[Fraud and risk explanations]
    D --> I[Classification]
    D --> J[Transcript parsing]
    D --> K[Routine summaries]
    E --> L[Semantic search]
    E --> M[Knowledge Brain]
    E --> N[Case memory and retrieval]
    B -. overrides .-> O[Per-product model policy]
    B -. portability .-> P[Future provider adapters]
```

## Interpretation Notes

- Routing is based on workload type, not hard-coded provider coupling.
- Qwen handles higher-value reasoning, Mistral handles cheaper operational work, and bge-m3 supports retrieval.
- The diagram is strong evidence of practical AI platform judgment.

@BryteSikaStrategyAI

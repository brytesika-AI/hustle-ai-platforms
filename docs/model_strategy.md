# Model Strategy

## Open-Source-First Default

Hustle AI now uses an open-source-first model strategy across the full product suite. The goal is to keep reasoning quality high, operational workloads affordable, and the portfolio portable across infrastructure choices instead of binding the platform to one proprietary model vendor.

This strategy is being used because it improves:

- cost control for routine and always-on workflows
- deployment portability across Cloudflare, self-hosted inference, and future managed providers
- model governance by making routing explicit at the task layer
- product consistency across the six-product suite
- future negotiation leverage if a hosted provider later becomes attractive for a subset of workloads

## Default Model Roles

### Primary Reasoning Model

`Qwen 2.5 Instruct` is the default reasoning model for:

- copilots
- executive summaries
- multi-step business analysis
- fraud and risk explanations
- decision support

### Fast Lower-Cost Operational Model

`Mistral Small Instruct` is the default lower-cost operational model for:

- transcript classification
- first-pass chat parsing
- routine summaries
- issue extraction
- low-cost operational tasks

### Embedding Model

`bge-m3` is the default embedding model for:

- semantic search
- clustering
- retrieval
- SME Knowledge Brain
- transcript similarity
- fraud and risk note retrieval

## How Routing Works

The shared router resolves models in this order:

1. explicit per-call preferred model
2. product-level override for a task class
3. shared task-based default from the open-source catalog

The router separates task class from provider path. That means the product code can ask for `executive_summary`, `issue_extraction`, or `knowledge_brain` without hard-coding a vendor-specific model string.

Current default provider path:

- Cloudflare-compatible gateway routing for inference access

Current default model families:

- reasoning: `Qwen 2.5 Instruct`
- operational: `Mistral Small Instruct`
- embedding: `bge-m3`

The router also keeps canonical model names separate from provider model IDs. That allows the suite to keep its task contracts stable while mapping to Cloudflare today and self-hosted or other providers later.

Provider path examples:

- `Qwen 2.5 Instruct` -> Cloudflare route today, self-hosted Qwen later if needed
- `Mistral Small Instruct` -> Cloudflare route today, smaller self-hosted instruct stack later if needed
- `bge-m3` -> Cloudflare or self-hosted embedding path without changing product task names

## Product Model Matrix

| Product | Qwen 2.5 Instruct | Mistral Small Instruct | bge-m3 |
| --- | --- | --- | --- |
| Hustle Workforce | SME Decision Copilot, executive summaries, Knowledge Brain summaries, strategic recommendations | WhatsApp parsing, first-pass extraction, routine operational parsing | Knowledge Brain retrieval, semantic search |
| Hustle CX Intelligence | Executive CX copilot, root-cause narratives, higher-value management interpretation | Transcript classification, transcript parsing, first-pass summaries, issue extraction | Similar case retrieval, transcript similarity |
| Hustle Revenue Intelligence | Pricing decision support, revenue reasoning, strategic recommendations | First-pass narrative generation, lower-cost routine summaries | Retrieval if revenue knowledge workflows are added |
| Hustle Inventory Intelligence | Inventory Decision Copilot, higher-value inventory interpretation | Routine explanations, first-pass operational summaries | Supplier or note retrieval if retrieval workflows are added |
| Hustle Risk Intelligence | Risk interpretation, scenario copilot, executive risk explanations | First-pass classification and lower-cost triage | Risk history retrieval |
| Hustle Fraud Intelligence | Fraud investigation, anomaly explanation, governance briefings | Routine extraction tasks, first-pass operational review | Case memory and retrieval |

## Shared Routing Rules

The shared routing rules are:

- use `Qwen 2.5 Instruct` when the task requires reasoning depth, multi-step synthesis, recommendation quality, or board-facing explanation
- use `Mistral Small Instruct` when the task is high-volume, operational, classification-heavy, or a first-pass reduction of raw text
- use `bge-m3` when the task is about finding, comparing, clustering, or retrieving prior business context rather than generating prose

In code, the router supports:

- task-based defaults
- per-product overrides
- explicit preferred-model overrides at call time
- provider abstraction so the model catalog can survive provider swaps later

## Swapping Models Later

The suite is intentionally set up so models can be swapped without changing every product.

To swap later:

1. update the shared model catalog in `shared/backend/model_router/router.py`
2. keep task classes stable so product code still asks for capabilities, not vendor names
3. change provider-specific route resolution in `shared/backend/model_router/cloudflare_router.py` or add another provider adapter
4. add product-level overrides only where a product genuinely needs a different default

This preserves future flexibility for:

- self-hosted open-source inference
- managed open-source endpoints
- a mixed provider strategy for selected premium workloads

## Cost Control And Portability

This approach supports cost control by keeping expensive reasoning capacity focused on high-value tasks while moving high-volume parsing and classification onto a smaller instruct model. It supports portability because the products depend on shared task labels and routing contracts rather than on a single vendor model name.

## Portfolio Task Map

| Task Type | Default Model | Reason |
| --- | --- | --- |
| Copilots and decision support | Qwen 2.5 Instruct | Better multi-step reasoning and explanation quality |
| Executive summaries and board briefs | Qwen 2.5 Instruct | Stronger synthesis for leadership-facing outputs |
| Transcript classification and issue extraction | Mistral Small Instruct | Lower-cost operational throughput |
| Routine summaries and first-pass parsing | Mistral Small Instruct | Good enough quality with tighter cost discipline |
| Semantic search and retrieval | bge-m3 | Strong multilingual open-source embeddings |
| Knowledge Brain and transcript similarity | bge-m3 | Consistent retrieval layer across products |

## Product Defaults

- **Hustle Workforce**: Qwen 2.5 Instruct for decision copilot and executive briefs, Mistral Small Instruct for routine departmental parsing, `bge-m3` for the SME Knowledge Brain
- **Hustle CX Intelligence**: Qwen 2.5 Instruct for churn and escalation reasoning, Mistral Small Instruct for transcript classification and issue extraction, `bge-m3` for transcript similarity and retrieval
- **Hustle Revenue Intelligence**: Qwen 2.5 Instruct for pricing and forecast decision support, Mistral Small Instruct for funnel parsing and routine summaries, `bge-m3` for retrieval
- **Hustle Inventory Intelligence**: Qwen 2.5 Instruct for reorder and supplier decision support, Mistral Small Instruct for first-pass stock summaries, `bge-m3` for retrieval
- **Hustle Risk Intelligence**: Qwen 2.5 Instruct for scenario analysis and risk explanations, Mistral Small Instruct for lower-cost monitoring summaries, `bge-m3` for risk note retrieval
- **Hustle Fraud Intelligence**: Qwen 2.5 Instruct for investigation copilots and governance explanations, Mistral Small Instruct for issue extraction and intake parsing, `bge-m3` for fraud note retrieval

@BryteSikaStrategyAI

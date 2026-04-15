# Model Routing Foundation

The shared model layer should provide a single place for:

- Provider routing rules
- Task-based model selection
- Open-source-first default model assignments
- Fallback policies
- Prompt and response normalization
- Product-safe inference interfaces
- Shared telemetry conventions for AI workflows

Default model families for the portfolio:

- `Qwen 2.5 Instruct` for high-value reasoning and decision support
- `Mistral Small Instruct` for lower-cost operational tasks
- `bge-m3` for embeddings, retrieval, and semantic search

Routing expectations:

- task classes should resolve to reasoning, operational, or embedding profiles
- canonical model names should remain provider-agnostic
- provider adapters can map canonical names to Cloudflare or future providers
- product-level overrides should refine defaults without forking the shared router

Product-specific prompting and domain workflows should stay inside each product unless they are clearly reusable across the portfolio.

@BryteSikaStrategyAI

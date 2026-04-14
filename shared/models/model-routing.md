# Model Routing Foundation

The shared model layer should provide a single place for:

- Provider routing rules
- Fallback policies
- Prompt and response normalization
- Product-safe inference interfaces
- Shared telemetry conventions for AI workflows

Product-specific prompting and domain workflows should stay inside each product unless they are clearly reusable across the portfolio.

@BryteSikaStrategyAI

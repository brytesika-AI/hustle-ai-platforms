# Monorepo Architecture

The Hustle AI monorepo is organized to support a multi-product AI portfolio with clear product boundaries and a disciplined shared platform layer.

## Architectural Principles

### Product Isolation
Each product lives in its own top-level folder so that it can evolve independently in roadmap, interface, and domain logic.

### Shared Leverage
Reusable concerns are consolidated into `shared/` so common UI patterns, utility functions, model routing logic, styling foundations, and Cloudflare deployment templates can be maintained once and applied consistently.

### Executive Consistency
The portfolio should feel like one company with multiple products, not multiple disconnected projects. Architecture supports that consistency by centralizing patterns that affect user trust, brand quality, and operational reliability.

## Repository Layout

```text
hustle-ai-platforms/
|-- docs/
|-- shared/
|   |-- components/
|   |-- utils/
|   |-- models/
|   |-- styles/
|   `-- cloudflare/
|-- hustle-workforce/
|-- hustle-cx-intelligence/
|-- hustle-revenue-intelligence/
|-- hustle-inventory-intelligence/
|-- hustle-risk-intelligence/
`-- hustle-fraud-intelligence/
```

## Shared Layer Responsibilities

### `shared/components/`
Reusable interface patterns, layout primitives, executive dashboard elements, KPI blocks, tables, and reporting surfaces.

### `shared/utils/`
Cross-product helpers for formatting, validation, metrics handling, date logic, feature flags, and integration-safe abstractions.

### `shared/models/`
Model routing and inference-adjacent logic, including provider selection, prompt orchestration, response normalization, and shared AI service contracts.

### `shared/styles/`
Common design tokens, typography foundations, spacing rules, color systems, and reusable presentation standards.

### `shared/cloudflare/`
Cloudflare-first deployment templates, environment conventions, Worker patterns, Pages configuration, and reusable edge deployment guidance.

## Product Folder Expectations

Each top-level product folder should remain self-contained. At minimum, each product should be able to own:

- Product-specific application code
- Local documentation
- Product-level configuration
- Domain workflows and data contracts
- Product-specific prompts, evaluators, or routing extensions

Products may consume shared modules, but shared modules should not erase product ownership. Domain-specific logic belongs inside the relevant product boundary unless it is genuinely reusable across the portfolio.

## Recommended Development Pattern

1. Build product-specific business logic inside the relevant `hustle-*` folder.
2. Promote repeated patterns into `shared/` only after they are proven reusable.
3. Keep Cloudflare deployment standards uniform across products.
4. Preserve a premium and coherent product experience through shared style and component systems.

## Scale Benefits

This architecture improves:

- Delivery speed across multiple product lines
- Brand consistency across the suite
- Engineering maintainability
- Investor and recruiter readability
- Future enterprise integration readiness

@BryteSikaStrategyAI

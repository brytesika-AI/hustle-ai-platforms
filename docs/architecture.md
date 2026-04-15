# Architecture

## Platform Upgrade

Hustle AI now follows an agent-platform architecture rather than a dashboard-only pattern. Each product still presents an executive web interface, but the backend design now assumes persistent agents, structured artifacts, resumable workflows, background jobs, and model-routing discipline across the suite.

## Architecture-Relevant Structure

```text
hustle-ai-platforms/
├── docs/
├── shared/
│   └── backend/
│       ├── agents/
│       ├── artifacts/
│       ├── jobs/
│       ├── memory/
│       ├── workflows/
│       ├── model_router/
│       ├── reporting/
│       ├── analytics/
│       └── schemas/
├── hustle-workforce/
│   ├── artifacts/
│   └── state/
├── hustle-cx-intelligence/
│   ├── artifacts/
│   └── state/
├── hustle-risk-intelligence/
│   ├── artifacts/
│   └── state/
└── hustle-fraud-intelligence/
    ├── artifacts/
    └── state/
```

## Persistent Agents

The platform now treats agents as durable operating components rather than one-shot text generators.

- agent identity is explicit through a shared registry model
- agent memory has a defined storage root per product
- checkpoints and continuation state are first-class concepts
- copilots can evolve into monitoring agents, investigation agents, and recurring decision assistants

This matters most in:

- **Hustle Workforce** for recurring executive decision support and knowledge-brain continuation
- **Hustle CX Intelligence** for transcript follow-up loops and churn-monitoring continuity
- **Hustle Risk Intelligence** for ongoing exposure review and scenario continuation
- **Hustle Fraud Intelligence** for investigation trails and anomaly follow-up workflows

## Artifact Layer

Every major product now has an explicit artifact root plus structured subfolders for durable outputs such as:

- reports
- executive briefs
- decision briefs
- wiki pages
- trend snapshots
- anomaly logs
- investigation notes
- governance briefings

The artifact layer is important because agent platforms create durable business outputs, not just ephemeral responses. The shared artifact-store abstraction gives the suite a consistent path to future R2-backed or object-store-backed persistence.

## Workflow Orchestration

The shared workflow layer introduces a standard shape for long-running work:

- workflow definitions
- orchestration runs
- multi-step execution context
- continuation across time

This supports flows like:

- multi-document research briefing in Hustle Workforce
- root-cause review chains in CX Intelligence
- recurring mitigation follow-up in Risk Intelligence
- multi-day investigation sequences in Fraud Intelligence

## Async And Background Jobs

The suite now has a shared job-definition and scheduler-plan layer so recurring work is part of the architecture rather than an afterthought.

Target recurring jobs include:

- nightly stock checks
- complaint trend snapshots
- weekly risk digests
- fraud anomaly scans
- executive summary generation

At the product layer, backend payloads now expose planned recurring jobs so the runtime model is visible to both frontend and deployment layers.

## Sandbox-Ready Task Model

Some future tasks should run in isolated execution environments rather than inline request/response handlers. The architecture now leaves room for that through workflow and job abstractions.

Examples:

- batch fraud scans
- large support transcript analysis
- pricing scenario simulations
- multi-document strategy brief generation

This is especially important for fraud, risk, and research-heavy workloads where execution time, auditability, or package isolation may eventually justify a dedicated worker tier.

## Unified Model Routing

The shared model-router layer now separates task class from provider choice and now defaults to an open-source-first model catalog.

- model resolution is now a shared concern
- task-based routing decides whether a workload is reasoning, operational, or embedding-heavy
- canonical model aliases are separate from provider model IDs
- provider routing can be changed without rewriting product logic
- Cloudflare remains the default edge-friendly path
- provider failover is represented in the architecture
- per-product overrides can be applied without forking the router

Default shared model strategy:

- `Qwen 2.5 Instruct` for copilots, executive summaries, multi-step business analysis, fraud and risk explanations, and decision support
- `Mistral Small Instruct` for transcript classification, first-pass parsing, routine summaries, issue extraction, and lower-cost operational tasks
- `bge-m3` for semantic search, clustering, retrieval, SME Knowledge Brain workloads, transcript similarity, and fraud or risk note retrieval

This makes it easier to distinguish between:

- lightweight UI copilots
- medium-depth analytic summarizers
- heavier long-form report generators
- future sandboxed or batched agent tasks
- retrieval and embedding-heavy knowledge workflows

The architecture therefore treats model policy as a shared platform concern:

1. product code declares the task class
2. the router resolves the open-source default profile
3. the provider adapter maps the canonical model to a provider-specific identifier
4. product overrides can refine the choice without breaking the shared policy

## Reporting Pipeline

The reporting layer is now explicitly treated as a pipeline:

1. analytics or agent output is produced
2. workflow context selects the reporting format
3. artifact storage persists the output
4. the product frontend or downstream job can retrieve or display it

That creates a clean path to future delivery channels like email digests, governance packs, and scheduled exports.

## Cloudflare-First Implications

The Cloudflare-first stance still holds, but the implications are now more platform-oriented:

- `Cloudflare Pages` serves the frontends
- `Cloudflare Tunnel` protects backend origins
- `Workers`, `Queues`, or scheduled triggers can later become execution points for background workflows
- `R2`, `D1`, or `KV` can become managed persistence targets for artifacts, job state, and agent memory when the platform moves beyond local file-backed state

The current repository keeps persistence file-backed and product-local for simplicity, while making the future Cloudflare-native evolution obvious and low-friction.

## Shared Backend Modules

- `shared/backend/agents`: persistent agent identity and registry patterns
- `shared/backend/memory`: state-store and history primitives
- `shared/backend/artifacts`: artifact manifest and durable output handling
- `shared/backend/workflows`: long-running workflow definitions and orchestration
- `shared/backend/jobs`: recurring job definitions and scheduler planning
- `shared/backend/model_router`: provider-aware route selection
- `shared/backend/reporting`: report-pipeline outputs and markdown rendering
- `shared/backend/schemas`: typed contracts for agents, jobs, workflows, artifacts, and model-routing decisions

## Product Impact

- **Hustle Workforce** now has explicit decision-brief, wiki-page, and agent-memory architecture paths
- **Hustle CX Intelligence** now has trend-snapshot, root-cause follow-up, and persistent CX copilot paths
- **Hustle Risk Intelligence** now has monitoring-log, scenario-brief, and recurring risk-digest paths
- **Hustle Fraud Intelligence** now has anomaly-log, investigation-note, governance-briefing, and sandbox-ready task paths

@BryteSikaStrategyAI

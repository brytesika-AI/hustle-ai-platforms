# Deployment

## Deployment Model

Every product still follows a Cloudflare-first pattern, but the suite now assumes more than request/response delivery. Deployment should be thought of in three layers:

1. frontend delivery
2. synchronous API delivery
3. persistent agent and background-workload support

## Frontend Layer

- deploy each Next.js frontend to `Cloudflare Pages`
- configure `NEXT_PUBLIC_API_BASE_URL` per product
- preserve per-product release cadence while keeping one monorepo

## Backend API Layer

- run each FastAPI backend as a containerized service
- expose backend origins through `Cloudflare Tunnel`
- keep direct origin access private where possible

## Persistent State Layer

The architecture now expects each core product to maintain:

- artifact storage
- agent-memory storage
- workflow-state storage
- job-history storage

The repository currently models these as product-local directories so the suite remains runnable with minimal infrastructure. In production, these can evolve toward:

- `R2` for artifacts and generated files
- `D1` for workflow state and queryable job history
- `KV` for lightweight agent checkpoints or routing hints

## Async And Background Execution

The shared job and workflow layers are designed so the suite can later support:

- scheduled daily or weekly runs
- long-running analysis outside direct user requests
- resumable investigations or decision flows
- isolated sandbox execution for heavier tasks

Recommended future Cloudflare-native execution points:

- `Workers` for lightweight orchestration
- `Queues` for asynchronous work handoff
- scheduled Workers triggers for recurring digests and scans

## Model Routing In Deployment

Model routing is now a platform concern rather than a per-product detail.

- Cloudflare remains the default provider path
- routing decisions can vary by task class
- failover and provider substitution can be layered in without changing frontend contracts

## Required Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ZONE_ID`
- `CLOUDFLARE_AI_GATEWAY_BASE_URL` where model gatewaying is used

## Recommended Runtime Split

- `Pages`: frontend hosting
- container host: FastAPI services
- `Tunnel`: private origin exposure
- future `R2/D1/KV/Workers`: agent persistence, job orchestration, and artifact durability

## Operational Guidance

- keep local file-backed state for demos and early deployments
- move artifacts first when scaling beyond single-instance backends
- move workflow and job history next when recurring automation becomes a product requirement
- reserve sandboxed heavy execution for fraud, risk, large transcript, and research-heavy workloads

@BryteSikaStrategyAI

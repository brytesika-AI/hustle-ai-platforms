# Cloudflare Token Requirements

## Minimum Recommended Token Scope

For this monorepo, the minimum Cloudflare API token scope for deployment and routing is:

- `Pages: Edit`
- `Tunnel: Edit`
- `DNS: Edit`
- `Zone: Read`

These permissions are enough to create or update Pages projects, manage tunnel routes, and attach DNS records while reading basic zone metadata.

## When Additional Permissions Are Needed

- `Workers Scripts: Edit` or broader Workers permissions:
  needed only if you add Cloudflare Workers middleware, API proxies, scheduled jobs, or Workers AI orchestration.
- `D1: Edit`:
  needed only if you move persistence into Cloudflare D1.
- `KV Storage: Edit`:
  needed only if you store cache keys, feature flags, or lightweight app state in KV.
- `R2: Edit`:
  needed only if you store uploaded files, report exports, or dataset archives in R2.
- `Account Settings: Read`:
  useful for broader automation or multi-project account inspection, but not mandatory for the current baseline.

## Suggested Environment Variables

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ZONE_ID`
- `CLOUDFLARE_TUNNEL_ID`
- `CLOUDFLARE_AI_GATEWAY_BASE_URL` when using Cloudflare AI Gateway

## Usage Notes

- keep one deployment token per environment where possible
- avoid reusing highly privileged owner tokens
- rotate tokens if they appear in logs, screenshots, or shell history
- store tokens in Cloudflare Pages and deployment secrets, not in source files

## This Repository And Your Token

The codebase is wired to expect `CLOUDFLARE_API_TOKEN`, but the token itself should only be added after you share it. Once you provide it, the deployment environment can be updated without changing the committed source.

@BryteSikaStrategyAI

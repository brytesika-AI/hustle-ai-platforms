# Cloudflare Deployment Pattern

Hustle Fraud Intelligence is designed as a Cloudflare-first application with a Next.js frontend on Cloudflare Pages and a Python backend exposed through a Cloudflare-compatible route.

The backend is configured to use Cloudflare-only model settings, read credentials from environment variables, and apply request limits for investigation flows.

Recommended production shape:
- Next.js frontend deployed on Cloudflare Pages
- Python backend container for anomaly analytics and governance logic
- Cloudflare Tunnel or equivalent secure backend exposure
- Optional Workers later for auth, routing, or proxy controls

@BryteSikaStrategyAI

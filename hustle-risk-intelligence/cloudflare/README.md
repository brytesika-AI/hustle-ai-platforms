# Cloudflare Deployment Pattern

Hustle Risk Intelligence is designed as a Cloudflare-first application with a Next.js frontend on Cloudflare Pages and a Python backend exposed through a Cloudflare-compatible route.

Recommended production shape:
- Next.js frontend deployed on Cloudflare Pages
- Python backend container for analytics and scenario logic
- Cloudflare Tunnel or equivalent secure backend exposure
- Optional Workers later for auth, routing, or proxy controls

@BryteSikaStrategyAI

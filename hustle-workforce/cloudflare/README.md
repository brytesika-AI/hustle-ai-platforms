# Cloudflare Deployment Pattern

Hustle Workforce is designed as a Cloudflare-first application with a Next.js frontend on Cloudflare Pages and a Python backend exposed through a Cloudflare-compatible route.

Recommended production shape:
- Next.js frontend deployed on Cloudflare Pages
- Python backend container for analytics and AI logic
- Cloudflare Tunnel or equivalent secure backend exposure
- Optional reverse proxy for internal routing discipline
- Optional Workers later for lightweight auth, proxying, or request shaping

Reference files in this folder provide baseline deployment examples for that operating model.

@BryteSikaStrategyAI

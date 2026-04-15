CLOUDFLARE APP PLATFORM REQUIREMENT — MANDATORY

All apps must be built as Cloudflare-first applications.

Do NOT use Streamlit as the application framework.
Do NOT use Streamlit as a local UI.
Do NOT provide Streamlit deployment instructions.

Use a Cloudflare-first architecture such as:
- Next.js frontend deployed to Cloudflare Pages
- Python backend service for analytics/AI logic
- Dockerized backend where appropriate
- Cloudflare Tunnel or equivalent Cloudflare-compatible routing for backend access
- shared cloudflare/ deployment docs and config examples

The final product must behave like a proper web application running on Cloudflare, not a notebook-style dashboard.

All deployment documentation, Docker setup, architecture notes, and environment configuration must assume Cloudflare-first app delivery.

BRANDING FOOTER REQUIREMENT — MANDATORY

At the bottom of every customer-facing page, dashboard page, README, documentation page, generated report, executive briefing, exported markdown page, and About page, include this exact footer line:

@BryteSikaStrategyAI

Rules:
- keep it visible but professional
- place it at the bottom, not in the middle
- do not alter the spelling
- do not replace it with a link unless explicitly asked
- apply it consistently across all companies and all major outputs

---

Company Prompt Template

Product Name:

Product Positioning:

Primary User:

Core Workflows:

Data and AI Expectations:

Local Development Assumptions:

Cloudflare-First Production Pattern:

Shared Modules To Reuse:

Success Standard:

@BryteSikaStrategyAI

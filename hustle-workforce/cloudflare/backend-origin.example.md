# Backend Origin Notes

Run the Python backend in a private environment and expose it through Cloudflare Tunnel to an API hostname such as `api.workforce.example.com`.

Recommended pattern:
- containerized backend on a private VM or container service
- internal binding on port `8000`
- Cloudflare Tunnel for ingress
- Cloudflare Access and WAF policies where appropriate

@BryteSikaStrategyAI

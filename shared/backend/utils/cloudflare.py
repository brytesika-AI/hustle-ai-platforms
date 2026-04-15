from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class CloudflareSettings:
    api_token: str
    account_id: str
    zone_id: str
    ai_gateway_base_url: str

    @property
    def token_present(self) -> bool:
        return bool(self.api_token.strip())


def load_cloudflare_settings() -> CloudflareSettings:
    return CloudflareSettings(
        api_token=os.getenv("CLOUDFLARE_API_TOKEN", ""),
        account_id=os.getenv("CLOUDFLARE_ACCOUNT_ID", ""),
        zone_id=os.getenv("CLOUDFLARE_ZONE_ID", ""),
        ai_gateway_base_url=os.getenv("CLOUDFLARE_AI_GATEWAY_BASE_URL", ""),
    )

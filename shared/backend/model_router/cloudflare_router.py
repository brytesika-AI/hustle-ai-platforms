from __future__ import annotations

from dataclasses import dataclass

from shared.backend.schemas.model_routing import ModelProfile
from shared.backend.utils.cloudflare import load_cloudflare_settings


@dataclass(frozen=True)
class CloudflareModelRoute:
    provider: str
    model_key: str
    canonical_model: str
    provider_model: str
    family: str
    gateway_base_url: str
    token_present: bool


def resolve_cloudflare_route(model_profile: ModelProfile) -> CloudflareModelRoute:
    settings = load_cloudflare_settings()
    return CloudflareModelRoute(
        provider="cloudflare",
        model_key=model_profile.key,
        canonical_model=model_profile.canonical_model,
        provider_model=model_profile.provider_models.get("cloudflare", model_profile.canonical_model),
        family=model_profile.family,
        gateway_base_url=settings.ai_gateway_base_url,
        token_present=settings.token_present,
    )

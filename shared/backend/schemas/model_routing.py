from __future__ import annotations

from enum import Enum

from pydantic import BaseModel


class RoutingStrategy(str, Enum):
    OPEN_SOURCE_FIRST = "open_source_first"


class ModelProfile(BaseModel):
    key: str
    canonical_model: str
    family: str
    capabilities: list[str]
    provider_models: dict[str, str]
    reasoning_depth: str
    default_for: list[str]


class ModelRouteResolution(BaseModel):
    task_class: str
    product: str | None = None
    strategy: RoutingStrategy
    provider_preference: str
    provider: str
    model_key: str
    canonical_model: str
    provider_model: str
    family: str
    capabilities: list[str]
    reasoning_depth: str
    gateway_base_url: str
    token_present: bool
    supports_failover: bool
    supports_product_override: bool
    supports_embedding_selection: bool
    open_source_first: bool

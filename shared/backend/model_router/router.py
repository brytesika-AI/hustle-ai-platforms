from __future__ import annotations

from shared.backend.model_router.cloudflare_router import resolve_cloudflare_route
from shared.backend.schemas.model_routing import (
    ModelProfile,
    ModelRouteResolution,
    RoutingStrategy,
)

PRIMARY_REASONING_MODEL = ModelProfile(
    key="qwen-2.5-instruct",
    canonical_model="Qwen 2.5 Instruct",
    family="reasoning",
    capabilities=[
        "copilots",
        "executive_summaries",
        "multi_step_business_analysis",
        "fraud_risk_explanations",
        "decision_support",
    ],
    provider_models={
        "cloudflare": "@cf/qwen/qwen2.5-72b-instruct",
        "self_hosted": "Qwen/Qwen2.5-72B-Instruct",
        "generic_openai": "qwen2.5-instruct",
    },
    reasoning_depth="high",
    default_for=[
        "copilot",
        "executive_summary",
        "multi_step_analysis",
        "fraud_risk_explanation",
        "decision_support",
    ],
)

FAST_OPERATIONAL_MODEL = ModelProfile(
    key="mistral-small-instruct",
    canonical_model="Mistral Small Instruct",
    family="operational",
    capabilities=[
        "transcript_classification",
        "first_pass_chat_parsing",
        "routine_summaries",
        "issue_extraction",
        "low_cost_operational_tasks",
    ],
    provider_models={
        "cloudflare": "@cf/mistral/mistral-small-3.1-24b-instruct",
        "self_hosted": "mistralai/Mistral-Small-3.1-24B-Instruct-2503",
        "generic_openai": "mistral-small-instruct",
    },
    reasoning_depth="medium",
    default_for=[
        "transcript_classification",
        "chat_parsing",
        "routine_summary",
        "issue_extraction",
        "operational_task",
    ],
)

EMBEDDING_MODEL = ModelProfile(
    key="bge-m3",
    canonical_model="bge-m3",
    family="embedding",
    capabilities=[
        "semantic_search",
        "clustering",
        "retrieval",
        "knowledge_brain",
        "transcript_similarity",
        "fraud_risk_note_retrieval",
    ],
    provider_models={
        "cloudflare": "@cf/baai/bge-m3",
        "self_hosted": "BAAI/bge-m3",
        "generic_openai": "bge-m3",
    },
    reasoning_depth="retrieval",
    default_for=[
        "semantic_search",
        "clustering",
        "retrieval",
        "knowledge_brain",
        "transcript_similarity",
        "risk_note_retrieval",
        "fraud_note_retrieval",
    ],
)

TASK_MODEL_PROFILES: dict[str, ModelProfile] = {
    "copilot": PRIMARY_REASONING_MODEL,
    "executive_summary": PRIMARY_REASONING_MODEL,
    "multi_step_analysis": PRIMARY_REASONING_MODEL,
    "strategic_recommendation": PRIMARY_REASONING_MODEL,
    "decision_support": PRIMARY_REASONING_MODEL,
    "fraud_risk_explanation": PRIMARY_REASONING_MODEL,
    "knowledge_brain_summary": PRIMARY_REASONING_MODEL,
    "root_cause_narrative": PRIMARY_REASONING_MODEL,
    "transcript_classification": FAST_OPERATIONAL_MODEL,
    "classification": FAST_OPERATIONAL_MODEL,
    "chat_parsing": FAST_OPERATIONAL_MODEL,
    "transcript_parsing": FAST_OPERATIONAL_MODEL,
    "first_pass_summary": FAST_OPERATIONAL_MODEL,
    "routine_summary": FAST_OPERATIONAL_MODEL,
    "issue_extraction": FAST_OPERATIONAL_MODEL,
    "operational_task": FAST_OPERATIONAL_MODEL,
    "semantic_search": EMBEDDING_MODEL,
    "clustering": EMBEDDING_MODEL,
    "retrieval": EMBEDDING_MODEL,
    "knowledge_brain": EMBEDDING_MODEL,
    "case_memory": EMBEDDING_MODEL,
    "transcript_similarity": EMBEDDING_MODEL,
    "risk_note_retrieval": EMBEDDING_MODEL,
    "fraud_note_retrieval": EMBEDDING_MODEL,
}

PRODUCT_ROUTE_OVERRIDES: dict[str, dict[str, str]] = {
    "hustle-workforce": {
        "decision_support": "qwen-2.5-instruct",
        "executive_summary": "qwen-2.5-instruct",
        "knowledge_brain_summary": "qwen-2.5-instruct",
        "chat_parsing": "mistral-small-instruct",
        "issue_extraction": "mistral-small-instruct",
        "knowledge_brain": "bge-m3",
        "semantic_search": "bge-m3",
    },
    "hustle-cx-intelligence": {
        "transcript_classification": "mistral-small-instruct",
        "first_pass_summary": "mistral-small-instruct",
        "copilot": "qwen-2.5-instruct",
        "root_cause_narrative": "qwen-2.5-instruct",
        "transcript_similarity": "bge-m3",
        "case_memory": "bge-m3",
    },
    "hustle-revenue-intelligence": {
        "decision_support": "qwen-2.5-instruct",
        "strategic_recommendation": "qwen-2.5-instruct",
        "first_pass_summary": "mistral-small-instruct",
        "retrieval": "bge-m3",
    },
    "hustle-inventory-intelligence": {
        "routine_summary": "mistral-small-instruct",
        "operational_task": "mistral-small-instruct",
        "decision_support": "qwen-2.5-instruct",
        "retrieval": "bge-m3",
    },
    "hustle-risk-intelligence": {
        "copilot": "qwen-2.5-instruct",
        "fraud_risk_explanation": "qwen-2.5-instruct",
        "classification": "mistral-small-instruct",
        "risk_note_retrieval": "bge-m3",
    },
    "hustle-fraud-intelligence": {
        "copilot": "qwen-2.5-instruct",
        "fraud_risk_explanation": "qwen-2.5-instruct",
        "fraud_note_retrieval": "bge-m3",
        "issue_extraction": "mistral-small-instruct",
        "case_memory": "bge-m3",
    },
}

MODEL_KEY_TO_PROFILE: dict[str, ModelProfile] = {
    PRIMARY_REASONING_MODEL.key: PRIMARY_REASONING_MODEL,
    FAST_OPERATIONAL_MODEL.key: FAST_OPERATIONAL_MODEL,
    EMBEDDING_MODEL.key: EMBEDDING_MODEL,
}


def _default_profile_for_task(task_class: str) -> ModelProfile:
    return TASK_MODEL_PROFILES.get(task_class, PRIMARY_REASONING_MODEL)


def _profile_from_key(model_key: str) -> ModelProfile:
    return MODEL_KEY_TO_PROFILE.get(model_key, PRIMARY_REASONING_MODEL)


def resolve_model_route(
    task_class: str,
    product: str | None = None,
    preferred_model: str | None = None,
    provider: str = "cloudflare",
    product_overrides: dict[str, dict[str, str]] | None = None,
) -> dict:
    default_profile = _default_profile_for_task(task_class)
    merged_overrides = {
        **PRODUCT_ROUTE_OVERRIDES,
        **(product_overrides or {}),
    }
    task_overrides = merged_overrides.get(product or "", {})
    selected_key = preferred_model or task_overrides.get(task_class) or default_profile.key
    selected_profile = _profile_from_key(selected_key)

    if provider == "cloudflare":
        provider_route = resolve_cloudflare_route(selected_profile)
        resolved_provider = provider_route.provider
        gateway_base_url = provider_route.gateway_base_url
        token_present = provider_route.token_present
        provider_model = provider_route.provider_model
    else:
        resolved_provider = provider
        gateway_base_url = ""
        token_present = False
        provider_model = selected_profile.provider_models.get(provider, selected_profile.canonical_model)

    resolution = ModelRouteResolution(
        task_class=task_class,
        product=product,
        strategy=RoutingStrategy.OPEN_SOURCE_FIRST,
        provider_preference=provider,
        provider=resolved_provider,
        model_key=selected_profile.key,
        canonical_model=selected_profile.canonical_model,
        provider_model=provider_model,
        family=selected_profile.family,
        capabilities=selected_profile.capabilities,
        reasoning_depth=selected_profile.reasoning_depth,
        gateway_base_url=gateway_base_url,
        token_present=token_present,
        supports_failover=True,
        supports_product_override=True,
        supports_embedding_selection=selected_profile.family == "embedding",
        open_source_first=True,
    )
    return resolution.model_dump()


def resolve_embedding_route(
    use_case: str,
    product: str | None = None,
    provider: str = "cloudflare",
    product_overrides: dict[str, dict[str, str]] | None = None,
) -> dict:
    return resolve_model_route(
        task_class=use_case,
        product=product,
        preferred_model=EMBEDDING_MODEL.key,
        provider=provider,
        product_overrides=product_overrides,
    )


def route_snapshot(
    task_classes: dict[str, str],
    product: str | None = None,
    provider: str = "cloudflare",
    product_overrides: dict[str, dict[str, str]] | None = None,
) -> list[dict]:
    return [
        resolve_model_route(
            task_class=task_class,
            product=product,
            preferred_model=preferred_model,
            provider=provider,
            product_overrides=product_overrides,
        )
        for task_class, preferred_model in task_classes.items()
    ]

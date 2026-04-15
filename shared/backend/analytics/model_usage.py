from __future__ import annotations

from shared.backend.model_router.router import route_snapshot


def model_strategy_snapshot(product: str, task_classes: dict[str, str]) -> dict:
    routes = route_snapshot(task_classes=task_classes, product=product)
    return {
        "product": product,
        "strategy": "open_source_first",
        "routes": routes,
        "reasoning_model": "Qwen 2.5 Instruct",
        "operational_model": "Mistral Small Instruct",
        "embedding_model": "bge-m3",
        "routing_order": [
            "preferred_model",
            "product_override",
            "task_based_default",
        ],
    }

from __future__ import annotations

from shared.backend.model_router.router import TASK_MODEL_PROFILES


def bounded_score(value: float, floor: float = 0.0, ceiling: float = 100.0) -> float:
    return round(max(floor, min(ceiling, value)), 1)


def route_intensity(task_class: str) -> str:
    profile = TASK_MODEL_PROFILES.get(task_class)
    if profile is None:
        return "high"
    return profile.reasoning_depth

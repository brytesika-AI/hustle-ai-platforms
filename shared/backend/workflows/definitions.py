from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WorkflowDefinition:
    workflow_id: str
    product: str
    name: str
    trigger: str
    steps: list[str]
    long_running: bool = True

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class JobDefinition:
    job_id: str
    product: str
    name: str
    cadence: str
    purpose: str
    execution_mode: str = "background"

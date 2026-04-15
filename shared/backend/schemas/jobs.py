from __future__ import annotations

from pydantic import BaseModel


class JobPlan(BaseModel):
    job_id: str
    product: str
    name: str
    cadence: str
    purpose: str
    execution_mode: str

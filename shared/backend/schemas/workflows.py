from __future__ import annotations

from pydantic import BaseModel


class WorkflowRun(BaseModel):
    workflow_id: str
    product: str
    name: str
    trigger: str
    status: str

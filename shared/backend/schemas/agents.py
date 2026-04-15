from __future__ import annotations

from pydantic import BaseModel


class AgentState(BaseModel):
    agent_id: str
    product: str
    role: str
    status: str
    memory_key: str | None = None

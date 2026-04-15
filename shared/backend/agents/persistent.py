from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class PersistentAgent:
    agent_id: str
    product: str
    role: str
    status: str = "idle"
    memory_key: str | None = None
    last_checkpoint_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def checkpoint(self, status: str) -> "PersistentAgent":
        self.status = status
        self.last_checkpoint_at = datetime.now(timezone.utc).isoformat()
        return self

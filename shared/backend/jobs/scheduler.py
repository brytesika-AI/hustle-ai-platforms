from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timezone

from shared.backend.jobs.definitions import JobDefinition


class JobSchedulerPlan:
    def __init__(self) -> None:
        self._planned_runs: list[dict] = []

    def register(self, definition: JobDefinition) -> None:
        self._planned_runs.append(
            {
                **asdict(definition),
                "last_scheduled_at": datetime.now(timezone.utc).isoformat(),
                "status": "planned",
            }
        )

    def snapshot(self) -> list[dict]:
        return list(self._planned_runs)

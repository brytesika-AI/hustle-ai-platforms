from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timezone

from shared.backend.workflows.definitions import WorkflowDefinition


class WorkflowOrchestrator:
    def __init__(self) -> None:
        self._runs: list[dict] = []

    def start(self, definition: WorkflowDefinition, context: dict | None = None) -> dict:
        run = {
            "workflow_id": definition.workflow_id,
            "product": definition.product,
            "name": definition.name,
            "trigger": definition.trigger,
            "steps": definition.steps,
            "long_running": definition.long_running,
            "context": context or {},
            "started_at": datetime.now(timezone.utc).isoformat(),
            "status": "running",
        }
        self._runs.append(run)
        return run

    def snapshot(self) -> list[dict]:
        return list(self._runs)

    def definitions_snapshot(self, definitions: list[WorkflowDefinition]) -> list[dict]:
        return [asdict(definition) for definition in definitions]

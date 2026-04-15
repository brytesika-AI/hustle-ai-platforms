from __future__ import annotations

from datetime import datetime, timezone


def append_history(history: list[dict], event_type: str, summary: str) -> list[dict]:
    history.append(
        {
            "event_type": event_type,
            "summary": summary,
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    return history

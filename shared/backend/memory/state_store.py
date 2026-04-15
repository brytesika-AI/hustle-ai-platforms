from __future__ import annotations

import json
from pathlib import Path


class JsonStateStore:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def write(self, key: str, payload: dict) -> Path:
        path = self.root / f"{key}.json"
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return path

    def read(self, key: str) -> dict:
        path = self.root / f"{key}.json"
        if not path.exists():
            return {}
        return json.loads(path.read_text(encoding="utf-8"))

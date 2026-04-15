from __future__ import annotations

from pathlib import Path


class ArtifactStore:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def ensure_path(self, category: str) -> Path:
        path = self.root / category
        path.mkdir(parents=True, exist_ok=True)
        return path

    def manifest(self, categories: list[str]) -> dict:
        return {
            "root": str(self.root),
            "categories": {category: str(self.ensure_path(category)) for category in categories},
        }

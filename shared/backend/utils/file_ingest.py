from __future__ import annotations

from pathlib import Path


TEXT_EXTENSIONS = {".txt", ".md", ".csv"}


def classify_upload(filename: str) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".csv":
        return "csv"
    if suffix in {".txt", ".md"}:
        return "text"
    return "binary"

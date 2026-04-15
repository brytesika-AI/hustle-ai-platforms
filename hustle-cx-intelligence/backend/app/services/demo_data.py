from __future__ import annotations

from dataclasses import dataclass
from io import StringIO
from pathlib import Path

import pandas as pd

from backend.app.core.settings import DATASETS_DIR


@dataclass
class CXDataBundle:
    transcripts: pd.DataFrame
    text_sources: list[dict]
    source_summary: dict[str, str]


def load_sample_bundle() -> CXDataBundle:
    transcripts = pd.read_csv(DATASETS_DIR / "sample_transcripts.csv")
    text_sources = [
        {
            "title": "Trend notes",
            "content": (DATASETS_DIR / "trend_notes.txt").read_text(encoding="utf-8"),
        }
    ]
    return CXDataBundle(
        transcripts=transcripts,
        text_sources=text_sources,
        source_summary={"transcripts": "sample_transcripts.csv", "text": "trend_notes.txt"},
    )


def apply_upload(bundle: CXDataBundle, filename: str, content: bytes) -> None:
    lower_name = filename.lower()
    if lower_name.endswith(".csv"):
        bundle.transcripts = pd.read_csv(StringIO(content.decode("utf-8", errors="ignore")))
        bundle.source_summary["transcripts"] = filename
    elif lower_name.endswith(".txt") or lower_name.endswith(".md"):
        bundle.text_sources.append({"title": filename, "content": content.decode("utf-8", errors="ignore")})
        bundle.source_summary["text"] = filename


def records(df: pd.DataFrame) -> list[dict]:
    return df.fillna("").to_dict(orient="records")

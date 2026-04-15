from __future__ import annotations

from dataclasses import dataclass
from io import StringIO

import pandas as pd

from backend.app.core.settings import DATASETS_DIR


@dataclass
class RevenueBundle:
    revenue: pd.DataFrame
    text_sources: list[dict]
    source_summary: dict[str, str]


def load_sample_bundle() -> RevenueBundle:
    revenue = pd.read_csv(DATASETS_DIR / "sample_revenue_data.csv")
    text_sources = [
        {"title": "Revenue notes", "content": (DATASETS_DIR / "revenue_notes.txt").read_text(encoding="utf-8")}
    ]
    return RevenueBundle(
        revenue=revenue,
        text_sources=text_sources,
        source_summary={"revenue": "sample_revenue_data.csv", "text": "revenue_notes.txt"},
    )


def apply_upload(bundle: RevenueBundle, filename: str, content: bytes) -> None:
    lower_name = filename.lower()
    if lower_name.endswith(".csv"):
        bundle.revenue = pd.read_csv(StringIO(content.decode("utf-8", errors="ignore")))
        bundle.source_summary["revenue"] = filename
    elif lower_name.endswith(".txt") or lower_name.endswith(".md"):
        bundle.text_sources.append({"title": filename, "content": content.decode("utf-8", errors="ignore")})
        bundle.source_summary["text"] = filename


def records(df: pd.DataFrame) -> list[dict]:
    return df.fillna("").to_dict(orient="records")

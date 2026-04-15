from __future__ import annotations

from dataclasses import dataclass
from io import StringIO

import pandas as pd

from backend.app.core.settings import DATASETS_DIR


@dataclass
class RiskBundle:
    risks: pd.DataFrame
    text_sources: list[dict]
    source_summary: dict[str, str]


def load_sample_bundle() -> RiskBundle:
    risks = pd.read_csv(DATASETS_DIR / "sample_risk_data.csv")
    text_sources = [
        {"title": "Risk notes", "content": (DATASETS_DIR / "risk_notes.txt").read_text(encoding="utf-8")}
    ]
    return RiskBundle(
        risks=risks,
        text_sources=text_sources,
        source_summary={"risks": "sample_risk_data.csv", "text": "risk_notes.txt"},
    )


def apply_upload(bundle: RiskBundle, filename: str, content: bytes) -> None:
    lower_name = filename.lower()
    if lower_name.endswith(".csv"):
        bundle.risks = pd.read_csv(StringIO(content.decode("utf-8", errors="ignore")))
        bundle.source_summary["risks"] = filename
    elif lower_name.endswith(".txt") or lower_name.endswith(".md"):
        bundle.text_sources.append({"title": filename, "content": content.decode("utf-8", errors="ignore")})
        bundle.source_summary["text"] = filename


def records(df: pd.DataFrame) -> list[dict]:
    return df.fillna("").to_dict(orient="records")

from __future__ import annotations

from dataclasses import dataclass
from io import StringIO

import pandas as pd

from backend.app.core.settings import DATASETS_DIR, FRAUD_APP_MAX_ROWS


@dataclass
class FraudBundle:
    transactions: pd.DataFrame
    suppliers: pd.DataFrame
    expenses: pd.DataFrame
    text_sources: list[dict]
    source_summary: dict[str, str]


def _bounded(df: pd.DataFrame) -> pd.DataFrame:
    return df.head(FRAUD_APP_MAX_ROWS).copy()


def load_sample_bundle() -> FraudBundle:
    transactions = _bounded(pd.read_csv(DATASETS_DIR / "sample_transactions.csv"))
    suppliers = _bounded(pd.read_csv(DATASETS_DIR / "sample_suppliers.csv"))
    expenses = _bounded(pd.read_csv(DATASETS_DIR / "sample_expenses.csv"))
    text_sources = [
        {"title": "Investigation notes", "content": (DATASETS_DIR / "investigation_notes.txt").read_text(encoding="utf-8")}
    ]
    return FraudBundle(
        transactions=transactions,
        suppliers=suppliers,
        expenses=expenses,
        text_sources=text_sources,
        source_summary={
            "transactions": "sample_transactions.csv",
            "suppliers": "sample_suppliers.csv",
            "expenses": "sample_expenses.csv",
            "text": "investigation_notes.txt",
        },
    )


def apply_upload(bundle: FraudBundle, filename: str, content: bytes) -> None:
    lower = filename.lower()
    if lower.endswith(".csv"):
        df = _bounded(pd.read_csv(StringIO(content.decode("utf-8", errors="ignore"))))
        if "supplier" in lower or {"dependency_pct", "anomaly_score"} <= set(df.columns):
            bundle.suppliers = df
            bundle.source_summary["suppliers"] = filename
        elif "expense" in lower or {"duplicate_signal", "claim_count_30d"} <= set(df.columns):
            bundle.expenses = df
            bundle.source_summary["expenses"] = filename
        else:
            bundle.transactions = df
            bundle.source_summary["transactions"] = filename
    elif lower.endswith(".txt") or lower.endswith(".md"):
        bundle.text_sources.append({"title": filename, "content": content.decode("utf-8", errors="ignore")})
        bundle.source_summary["text"] = filename


def records(df: pd.DataFrame) -> list[dict]:
    return df.fillna("").to_dict(orient="records")

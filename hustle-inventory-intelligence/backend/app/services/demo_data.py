from __future__ import annotations

from dataclasses import dataclass
from io import StringIO

import pandas as pd

from backend.app.core.settings import DATASETS_DIR


@dataclass
class InventoryBundle:
    inventory: pd.DataFrame
    sales_history: pd.DataFrame
    suppliers: pd.DataFrame
    text_sources: list[dict]
    source_summary: dict[str, str]


def load_sample_bundle() -> InventoryBundle:
    inventory = pd.read_csv(DATASETS_DIR / "sample_inventory.csv")
    sales_history = pd.read_csv(DATASETS_DIR / "sample_sales_history.csv")
    suppliers = pd.read_csv(DATASETS_DIR / "sample_suppliers.csv")
    text_sources = [
        {"title": "Inventory notes", "content": (DATASETS_DIR / "inventory_notes.txt").read_text(encoding="utf-8")}
    ]
    return InventoryBundle(
        inventory=inventory,
        sales_history=sales_history,
        suppliers=suppliers,
        text_sources=text_sources,
        source_summary={
            "inventory": "sample_inventory.csv",
            "sales_history": "sample_sales_history.csv",
            "suppliers": "sample_suppliers.csv",
            "text": "inventory_notes.txt",
        },
    )


def apply_upload(bundle: InventoryBundle, filename: str, content: bytes) -> None:
    lower_name = filename.lower()
    df = None
    if lower_name.endswith(".csv"):
        df = pd.read_csv(StringIO(content.decode("utf-8", errors="ignore")))
        if "supplier" in lower_name or {"supplier_id", "dependency_pct"} <= set(df.columns):
            bundle.suppliers = df
            bundle.source_summary["suppliers"] = filename
        elif "sales" in lower_name or {"dead_stock_days", "stockout_events"} <= set(df.columns):
            bundle.sales_history = df
            bundle.source_summary["sales_history"] = filename
        else:
            bundle.inventory = df
            bundle.source_summary["inventory"] = filename
    elif lower_name.endswith(".txt") or lower_name.endswith(".md"):
        bundle.text_sources.append({"title": filename, "content": content.decode("utf-8", errors="ignore")})
        bundle.source_summary["text"] = filename


def records(df: pd.DataFrame) -> list[dict]:
    return df.fillna("").to_dict(orient="records")

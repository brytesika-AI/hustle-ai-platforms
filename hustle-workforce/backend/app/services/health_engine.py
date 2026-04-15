from __future__ import annotations

from typing import Dict

import pandas as pd


def _bounded_score(value: float) -> float:
    return max(0.0, min(100.0, value))


def compute_health_scores(bundle) -> Dict[str, float]:
    finance_df = bundle.finance.copy()
    inventory_df = bundle.inventory.copy()
    sales_df = bundle.sales.copy()
    growth_df = bundle.growth.copy()

    finance_gap_ratio = (finance_df["cash_in"].iloc[-1] - finance_df["cash_out"].iloc[-1]) / max(finance_df["cash_out"].iloc[-1], 1)
    financial_risk = _bounded_score(100 - max(0, 40 - finance_gap_ratio * 180))

    inventory_df["days_of_cover"] = inventory_df["stock_on_hand"] / inventory_df["daily_demand"]
    inventory_risk = _bounded_score((inventory_df["days_of_cover"] / inventory_df["lead_time_days"]).clip(upper=1.5).mean() * 60)
    sales_pipeline_health = _bounded_score((sales_df["pipeline_value"] * sales_df["win_probability"]).sum() / max(sales_df["pipeline_value"].sum(), 1) * 100)
    growth_activity = _bounded_score(growth_df["activation_rate"].mean() * 180 + (30 - min(growth_df["cac"].mean(), 30)) * 1.5)
    knowledge_maturity = _bounded_score(55 + min(len(bundle.text_sources) * 6, 25))
    overall = round((financial_risk + inventory_risk + sales_pipeline_health + growth_activity + knowledge_maturity) / 5, 1)

    return {
        "financial_risk": round(financial_risk, 1),
        "inventory_risk": round(inventory_risk, 1),
        "sales_pipeline_health": round(sales_pipeline_health, 1),
        "growth_activity": round(growth_activity, 1),
        "knowledge_maturity": round(knowledge_maturity, 1),
        "overall_health_score": overall,
    }


def build_health_table(scores: Dict[str, float]) -> list[dict]:
    return [
        {"dimension": "Financial Risk", "score": scores["financial_risk"]},
        {"dimension": "Inventory Risk", "score": scores["inventory_risk"]},
        {"dimension": "Sales Pipeline Health", "score": scores["sales_pipeline_health"]},
        {"dimension": "Growth Activity", "score": scores["growth_activity"]},
        {"dimension": "Knowledge Maturity", "score": scores["knowledge_maturity"]},
        {"dimension": "Overall Health Score", "score": scores["overall_health_score"]},
    ]

from __future__ import annotations

from dataclasses import dataclass
from io import StringIO
from typing import Dict

import pandas as pd


@dataclass
class WorkforceDataBundle:
    finance: pd.DataFrame
    operations: pd.DataFrame
    sales: pd.DataFrame
    strategy: pd.DataFrame
    growth: pd.DataFrame
    inventory: pd.DataFrame
    crm: pd.DataFrame
    text_sources: list[dict]
    source_summary: Dict[str, str]


def _sample_finance() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"month": "Jan", "revenue": 118000, "cash_in": 96000, "cash_out": 88000, "opex": 42000},
            {"month": "Feb", "revenue": 126500, "cash_in": 101000, "cash_out": 90500, "opex": 43800},
            {"month": "Mar", "revenue": 133200, "cash_in": 109500, "cash_out": 94800, "opex": 45100},
            {"month": "Apr", "revenue": 141800, "cash_in": 115700, "cash_out": 100900, "opex": 46800},
            {"month": "May", "revenue": 149300, "cash_in": 123200, "cash_out": 104200, "opex": 48200},
            {"month": "Jun", "revenue": 156400, "cash_in": 128900, "cash_out": 108600, "opex": 49700},
        ]
    )


def _sample_operations() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"team": "Warehouse", "headcount": 16, "utilization_pct": 81, "cycle_time_hours": 14, "absenteeism_pct": 5.4},
            {"team": "Field Sales Ops", "headcount": 11, "utilization_pct": 76, "cycle_time_hours": 10, "absenteeism_pct": 3.8},
            {"team": "Customer Support", "headcount": 9, "utilization_pct": 73, "cycle_time_hours": 8, "absenteeism_pct": 2.9},
            {"team": "Finance", "headcount": 5, "utilization_pct": 69, "cycle_time_hours": 6, "absenteeism_pct": 1.7},
        ]
    )


def _sample_sales() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"deal": "Retail Expansion", "stage": "Proposal", "pipeline_value": 32000, "win_probability": 0.55, "owner": "A. Ndlovu"},
            {"deal": "Distributor Renewal", "stage": "Negotiation", "pipeline_value": 27000, "win_probability": 0.70, "owner": "K. Banda"},
            {"deal": "Enterprise Pilot", "stage": "Discovery", "pipeline_value": 52000, "win_probability": 0.35, "owner": "R. Dube"},
            {"deal": "Regional Upsell", "stage": "Qualified", "pipeline_value": 21000, "win_probability": 0.60, "owner": "T. Moyo"},
        ]
    )


def _sample_strategy() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"initiative": "Improve receivables discipline", "priority": "High", "confidence": 0.82, "owner": "CEO"},
            {"initiative": "Reduce stock imbalance by product cluster", "priority": "High", "confidence": 0.75, "owner": "COO"},
            {"initiative": "Expand WhatsApp lead conversion", "priority": "Medium", "confidence": 0.68, "owner": "Commercial Director"},
            {"initiative": "Launch management review pack", "priority": "Medium", "confidence": 0.79, "owner": "Head of Strategy"},
        ]
    )


def _sample_growth() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"channel": "WhatsApp", "campaigns": 4, "mqls": 145, "cac": 12.5, "activation_rate": 0.24},
            {"channel": "Field Activation", "campaigns": 2, "mqls": 88, "cac": 18.3, "activation_rate": 0.31},
            {"channel": "Email", "campaigns": 5, "mqls": 104, "cac": 8.1, "activation_rate": 0.18},
            {"channel": "Partner Referrals", "campaigns": 3, "mqls": 62, "cac": 6.4, "activation_rate": 0.39},
        ]
    )


def _sample_inventory() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"sku": "Starter Pack", "stock_on_hand": 260, "daily_demand": 11, "lead_time_days": 18, "unit_margin": 19.0},
            {"sku": "SME Bundle", "stock_on_hand": 120, "daily_demand": 9, "lead_time_days": 21, "unit_margin": 31.0},
            {"sku": "Service Kit", "stock_on_hand": 75, "daily_demand": 6, "lead_time_days": 14, "unit_margin": 24.0},
            {"sku": "Growth Add-On", "stock_on_hand": 45, "daily_demand": 5, "lead_time_days": 25, "unit_margin": 44.0},
        ]
    )


def _sample_crm() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"segment": "Retail", "threads": 92, "avg_response_minutes": 11, "qualified_leads": 28, "deal_conversion_rate": 0.21},
            {"segment": "Wholesale", "threads": 51, "avg_response_minutes": 16, "qualified_leads": 17, "deal_conversion_rate": 0.27},
            {"segment": "Services", "threads": 39, "avg_response_minutes": 13, "qualified_leads": 14, "deal_conversion_rate": 0.24},
        ]
    )


def _sample_text_sources() -> list[dict]:
    return [
        {"title": "Board prep note", "content": "Management wants a single executive view of cash resilience, labor efficiency, pipeline quality, and campaign productivity before approving the next growth cycle."},
        {"title": "Operations memo", "content": "Warehouse labor is stable, but stock planning and sales commitments need tighter coordination to protect customer delivery confidence."},
    ]


def build_sample_bundle() -> WorkforceDataBundle:
    return WorkforceDataBundle(
        finance=_sample_finance(),
        operations=_sample_operations(),
        sales=_sample_sales(),
        strategy=_sample_strategy(),
        growth=_sample_growth(),
        inventory=_sample_inventory(),
        crm=_sample_crm(),
        text_sources=_sample_text_sources(),
        source_summary={
            "finance": "synthetic demo",
            "operations": "synthetic demo",
            "sales": "synthetic demo",
            "strategy": "synthetic demo",
            "growth": "synthetic demo",
            "inventory": "synthetic demo",
            "crm": "synthetic demo",
            "text": "synthetic demo",
        },
    )


def coerce_dataframe(file_bytes: bytes) -> pd.DataFrame:
    return pd.read_csv(StringIO(file_bytes.decode("utf-8", errors="ignore")))


def classify_and_apply(bundle: WorkforceDataBundle, filename: str, content: bytes) -> None:
    lower_name = filename.lower()
    if lower_name.endswith(".csv"):
        df = coerce_dataframe(content)
        if "finance" in lower_name or {"cash_in", "cash_out"} <= set(df.columns):
            bundle.finance = df
            bundle.source_summary["finance"] = filename
        elif "operations" in lower_name or "utilization_pct" in df.columns:
            bundle.operations = df
            bundle.source_summary["operations"] = filename
        elif "sales" in lower_name or "pipeline_value" in df.columns:
            bundle.sales = df
            bundle.source_summary["sales"] = filename
        elif "strategy" in lower_name or "initiative" in df.columns:
            bundle.strategy = df
            bundle.source_summary["strategy"] = filename
        elif "growth" in lower_name or "activation_rate" in df.columns:
            bundle.growth = df
            bundle.source_summary["growth"] = filename
        elif "inventory" in lower_name or "stock_on_hand" in df.columns:
            bundle.inventory = df
            bundle.source_summary["inventory"] = filename
        elif "crm" in lower_name or "qualified_leads" in df.columns:
            bundle.crm = df
            bundle.source_summary["crm"] = filename
    elif lower_name.endswith(".txt") or lower_name.endswith(".md"):
        text = content.decode("utf-8", errors="ignore")
        bundle.text_sources.append({"title": filename, "content": text})
        bundle.source_summary["text"] = filename


def dataframe_to_records(df: pd.DataFrame) -> list[dict]:
    return df.to_dict(orient="records")

from __future__ import annotations

import pandas as pd


def build_joined_inventory(inventory: pd.DataFrame, sales_history: pd.DataFrame, suppliers: pd.DataFrame) -> pd.DataFrame:
    joined = inventory.merge(sales_history, on="sku", how="left").merge(suppliers, on="supplier_id", how="left")
    joined["days_of_cover"] = (joined["stock_on_hand"] / joined["avg_daily_sales"]).round(1)
    joined["reorder_gap"] = joined["reorder_point"] - joined["stock_on_hand"]
    joined["gross_margin"] = ((joined["unit_price"] - joined["unit_cost"]) * joined["stock_on_hand"]).round(1)
    return joined


def stock_visibility_agent(df: pd.DataFrame) -> str:
    lowest_cover = df.sort_values("days_of_cover").iloc[0]
    return (
        f"{lowest_cover['sku']} has the weakest stock position with only {lowest_cover['days_of_cover']:.1f} days of cover. Leadership should review stock visibility and service risk before the next demand cycle."
    )


def reorder_intelligence_agent(df: pd.DataFrame) -> str:
    reorder_needed = df[df["stock_on_hand"] < df["reorder_point"]]
    if reorder_needed.empty:
        return "Current reorder thresholds are broadly covered. Continue monitoring demand shifts and supplier delay risk."
    top = reorder_needed.sort_values("reorder_gap", ascending=False).iloc[0]
    return (
        f"{top['sku']} is the clearest reorder priority with a gap of {top['reorder_gap']:.0f} units below the target threshold."
    )


def dead_stock_agent(df: pd.DataFrame) -> str:
    slowest = df.sort_values("dead_stock_days", ascending=False).iloc[0]
    return (
        f"{slowest['sku']} is the strongest dead-stock signal with {slowest['dead_stock_days']:.0f} low-movement days. Working-capital discipline should focus on reducing that drag."
    )


def supplier_dependency_agent(df: pd.DataFrame) -> str:
    top = df.sort_values("dependency_pct", ascending=False).iloc[0]
    return (
        f"Supplier dependence is highest with {top['supplier_name']}, which carries {top['dependency_pct']:.0f}% of supply concentration. Second-source planning should be accelerated."
    )


def inventory_decision_copilot(question: str, metrics: dict[str, float]) -> dict[str, str]:
    posture = "inventory stabilization" if metrics["inventory_health_score"] < 70 else "disciplined scaling"
    return {
        "Inventory Decision Copilot": (
            f"For '{question}', the current posture supports {posture}. Prioritize stock availability, slower-moving inventory reduction, and supplier resilience before adding more working-capital pressure."
        )
    }


def summary_metrics(df: pd.DataFrame) -> dict[str, float]:
    stockout_risk_score = round((df["stockout_events"].mean() * 18) + 35, 1)
    reorder_coverage_score = round((df["days_of_cover"] / df["lead_time_days"]).clip(upper=2).mean() * 40, 1)
    dead_stock_score = round(100 - min(df["dead_stock_days"].mean() * 2, 60), 1)
    supplier_dependency_score = round(df["dependency_pct"].mean() + df["avg_delay_days"].mean() * 4, 1)
    inventory_health_score = round((reorder_coverage_score + dead_stock_score + (100 - stockout_risk_score) + (100 - supplier_dependency_score)) / 4, 1)
    return {
        "stockout_risk_score": stockout_risk_score,
        "reorder_coverage_score": reorder_coverage_score,
        "dead_stock_score": dead_stock_score,
        "supplier_dependency_score": supplier_dependency_score,
        "inventory_health_score": inventory_health_score,
    }


def metric_table(metrics: dict[str, float]) -> list[dict]:
    return [
        {"dimension": "Stockout Risk", "score": metrics["stockout_risk_score"]},
        {"dimension": "Reorder Coverage", "score": metrics["reorder_coverage_score"]},
        {"dimension": "Dead Stock Efficiency", "score": metrics["dead_stock_score"]},
        {"dimension": "Supplier Dependency Risk", "score": metrics["supplier_dependency_score"]},
        {"dimension": "Inventory Health", "score": metrics["inventory_health_score"]},
    ]

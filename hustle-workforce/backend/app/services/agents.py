from __future__ import annotations

from typing import Dict

import pandas as pd


def cashflow_intelligence_agent(finance_df: pd.DataFrame) -> str:
    recent = finance_df.iloc[-1]
    operating_gap = recent["cash_in"] - recent["cash_out"]
    status = "positive" if operating_gap >= 0 else "negative"
    return (
        f"The cashflow intelligence view shows a {status} monthly operating gap of "
        f"{operating_gap:,.0f}. Management attention should focus on cash conversion, "
        "expense pacing, and the balance between growth spend and liquidity resilience."
    )


def inventory_forecast_agent(inventory_df: pd.DataFrame) -> str:
    inventory_df = inventory_df.copy()
    inventory_df["days_of_cover"] = inventory_df["stock_on_hand"] / inventory_df["daily_demand"]
    risk_items = inventory_df[inventory_df["days_of_cover"] < inventory_df["lead_time_days"]]
    if risk_items.empty:
        return "Current inventory cover is broadly aligned with lead times. Continue monitoring demand concentration and supplier reliability."
    top_item = risk_items.sort_values("days_of_cover").iloc[0]
    return (
        f"{top_item['sku']} is the clearest replenishment priority with only "
        f"{top_item['days_of_cover']:.1f} days of cover against a {top_item['lead_time_days']:.0f}-day lead time. "
        "Procurement should act before growth activity increases demand pressure."
    )


def whatsapp_crm_intelligence_agent(crm_df: pd.DataFrame) -> str:
    best_segment = crm_df.sort_values("deal_conversion_rate", ascending=False).iloc[0]
    slowest_segment = crm_df.sort_values("avg_response_minutes", ascending=False).iloc[0]
    return (
        f"WhatsApp CRM performance is strongest in {best_segment['segment']} with a conversion rate of "
        f"{best_segment['deal_conversion_rate']:.0%}. The service bottleneck is {slowest_segment['segment']}, "
        f"where response time averages {slowest_segment['avg_response_minutes']:.0f} minutes."
    )


def marketing_campaign_agent(growth_df: pd.DataFrame) -> str:
    most_efficient = growth_df.sort_values("cac").iloc[0]
    highest_activation = growth_df.sort_values("activation_rate", ascending=False).iloc[0]
    return (
        f"The growth picture favors {most_efficient['channel']} for cost efficiency and "
        f"{highest_activation['channel']} for activation quality. The next campaign plan should protect "
        "acquisition cost discipline while shifting budget toward channels with stronger activation economics."
    )


def decision_copilot(question: str, bundle_metrics: Dict[str, float]) -> Dict[str, str]:
    overall = bundle_metrics["overall_health_score"]
    tone = "measured expansion" if overall >= 70 else "disciplined stabilization"
    return {
        "Socratic Agent": f"What assumptions inside '{question}' deserve stronger evidence before management commits capital or operating attention?",
        "Analyst Agent": (
            f"The current business health score is {overall:.0f}, which supports a posture of {tone}. "
            "The best near-term moves are the ones that improve cash resilience and execution discipline together."
        ),
        "Devil's Advocate Agent": "The main risk is chasing growth signals that look encouraging while inventory, cash timing, or delivery readiness remain fragile.",
        "Strategist Agent": "Sequence decisions around liquidity, service reliability, and high-confidence revenue capture before pursuing lower-conviction expansion bets.",
    }

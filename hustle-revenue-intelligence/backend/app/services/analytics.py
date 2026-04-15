from __future__ import annotations

import pandas as pd


def pricing_optimization_agent(df: pd.DataFrame) -> str:
    discount_rich = df.sort_values("discount_pct", ascending=False).iloc[0]
    return (
        f"The clearest pricing discipline issue is in {discount_rich['product_line']}, where discounting has reached "
        f"{discount_rich['discount_pct']:.0f}%. Revenue protection should come from tighter packaging and value-based price defense, not automatic discounting."
    )


def revenue_driver_agent(df: pd.DataFrame) -> str:
    top_driver = df.groupby("driver")["revenue"].sum().sort_values(ascending=False).index[0]
    return (
        f"The strongest current revenue driver is {top_driver}. Leadership should invest in that driver where margin quality and repeatability remain intact."
    )


def churn_impact_agent(df: pd.DataFrame) -> str:
    high_risk = df[df["churn_risk"].str.lower() == "high"]
    exposure = high_risk["revenue"].sum()
    return (
        f"High churn-risk accounts currently represent revenue exposure of {exposure:,.0f}. Commercial intervention should focus on protecting that book before pursuing lower-confidence new revenue."
    )


def upsell_cross_sell_agent(df: pd.DataFrame) -> str:
    df = df.copy()
    df["expansion_index"] = df["upsell_score"] + df["cross_sell_score"]
    top = df.sort_values("expansion_index", ascending=False).iloc[0]
    return (
        f"{top['product_line']} shows the strongest expansion profile with upsell and cross-sell potential concentrated in the {top['segment']} segment."
    )


def revenue_decision_copilot(question: str, metrics: dict[str, float]) -> dict[str, str]:
    posture = "margin-aware expansion" if metrics["expansion_readiness_score"] >= 70 else "revenue stabilization"
    return {
        "Revenue Decision Copilot": (
            f"For '{question}', the current posture supports {posture}. Prioritize price discipline, churn protection, and the highest-confidence expansion opportunities in that order."
        )
    }


def summary_metrics(df: pd.DataFrame) -> dict[str, float]:
    total_revenue = round(df["revenue"].sum(), 1)
    avg_discount = round(df["discount_pct"].mean(), 1)
    churn_exposure = round(df.loc[df["churn_risk"].str.lower() == "high", "revenue"].sum(), 1)
    pricing_power_score = round(100 - min(avg_discount * 3.2, 55), 1)
    expansion_readiness_score = round(((df["upsell_score"].mean() + df["cross_sell_score"].mean()) / 2), 1)
    driver_clarity_score = round(df.groupby("driver")["revenue"].sum().max() / max(total_revenue, 1) * 100 + 30, 1)
    return {
        "total_revenue": total_revenue,
        "avg_discount_pct": avg_discount,
        "churn_revenue_exposure": churn_exposure,
        "pricing_power_score": pricing_power_score,
        "expansion_readiness_score": expansion_readiness_score,
        "driver_clarity_score": driver_clarity_score,
        "revenue_health_score": round((pricing_power_score + expansion_readiness_score + driver_clarity_score) / 3, 1),
    }


def pricing_table(df: pd.DataFrame) -> list[dict]:
    output = df[["product_line", "base_price", "discount_pct", "revenue", "segment"]].copy()
    return output.sort_values("discount_pct", ascending=False).to_dict(orient="records")


def driver_table(df: pd.DataFrame) -> list[dict]:
    grouped = df.groupby("driver", as_index=False)["revenue"].sum().sort_values("revenue", ascending=False)
    return grouped.to_dict(orient="records")


def churn_table(df: pd.DataFrame) -> list[dict]:
    return df[["account_id", "product_line", "revenue", "churn_risk", "segment"]].sort_values("revenue", ascending=False).to_dict(orient="records")


def expansion_table(df: pd.DataFrame) -> list[dict]:
    output = df[["account_id", "product_line", "upsell_score", "cross_sell_score", "segment"]].copy()
    output["expansion_index"] = output["upsell_score"] + output["cross_sell_score"]
    return output.sort_values("expansion_index", ascending=False).to_dict(orient="records")

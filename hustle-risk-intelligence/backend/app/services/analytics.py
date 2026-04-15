from __future__ import annotations

import pandas as pd


def financial_risk_agent(df: pd.DataFrame) -> str:
    weak_cash = df.sort_values("days_cash_cover").iloc[0]
    return (
        f"The clearest financial-risk pressure is in {weak_cash['segment']}, where cash cover has fallen to "
        f"{weak_cash['days_cash_cover']:.0f} days. Leadership should tighten collections, spending pace, and exposure review immediately."
    )


def operational_risk_agent(df: pd.DataFrame) -> str:
    ops = df[df["category"].str.lower() == "operations"]
    top = ops.sort_values("impact_score", ascending=False).iloc[0] if not ops.empty else df.sort_values("impact_score", ascending=False).iloc[0]
    return f"Operational risk is most visible in {top['segment']} through {top['exposure_area'].lower()}. Process discipline and escalation ownership should be reviewed before the risk compounds."


def supplier_risk_agent(df: pd.DataFrame) -> str:
    supplier = df.sort_values("supplier_dependency_pct", ascending=False).iloc[0]
    return (
        f"Supplier dependency is most concentrated in {supplier['segment']}, with {supplier['supplier_dependency_pct']:.0f}% reliance on a narrow supply base. Diversification and contingency planning should be accelerated."
    )


def customer_risk_agent(df: pd.DataFrame) -> str:
    customer = df.sort_values("customer_concentration_pct", ascending=False).iloc[0]
    return (
        f"Customer concentration risk is highest in {customer['segment']}, where {customer['customer_concentration_pct']:.0f}% of revenue influence sits in a narrow customer set."
    )


def risk_scenario_copilot(question: str, metrics: dict[str, float]) -> dict[str, str]:
    stance = "defensive resilience" if metrics["overall_risk_score"] >= 70 else "targeted mitigation"
    return {
        "Risk Scenario Copilot": (
            f"For '{question}', the current risk posture favors {stance}. Leadership should respond first where cash cover, supplier concentration, and customer dependence overlap."
        )
    }


def summary_metrics(df: pd.DataFrame) -> dict[str, float]:
    financial_score = round((100 - df["days_cash_cover"].mean()) + df["impact_score"].mean() * 0.35, 1)
    operational_score = round(df.loc[df["category"].str.lower() == "operations", "impact_score"].mean() if (df["category"].str.lower() == "operations").any() else df["impact_score"].mean(), 1)
    supplier_score = round(df["supplier_dependency_pct"].mean() + 25, 1)
    customer_score = round(df["customer_concentration_pct"].mean() + 20, 1)
    compliance_score = round((df["compliance_gap"].str.lower() == "high").mean() * 100 * 0.7 + 32, 1)
    overall = round((financial_score + operational_score + supplier_score + customer_score + compliance_score) / 5, 1)
    return {
        "financial_risk_score": financial_score,
        "operational_risk_score": operational_score,
        "supplier_risk_score": supplier_score,
        "customer_risk_score": customer_score,
        "compliance_risk_score": compliance_score,
        "overall_risk_score": overall,
    }


def risk_table(metrics: dict[str, float]) -> list[dict]:
    return [
        {"dimension": "Financial Risk", "score": metrics["financial_risk_score"]},
        {"dimension": "Operational Risk", "score": metrics["operational_risk_score"]},
        {"dimension": "Supplier Risk", "score": metrics["supplier_risk_score"]},
        {"dimension": "Customer Concentration Risk", "score": metrics["customer_risk_score"]},
        {"dimension": "Compliance Risk", "score": metrics["compliance_risk_score"]},
        {"dimension": "Overall Risk Score", "score": metrics["overall_risk_score"]},
    ]


def supplier_rows(df: pd.DataFrame) -> list[dict]:
    return df[["risk_id", "segment", "supplier_dependency_pct", "impact_score", "market_volatility"]].sort_values("supplier_dependency_pct", ascending=False).to_dict(orient="records")


def customer_rows(df: pd.DataFrame) -> list[dict]:
    return df[["risk_id", "segment", "customer_concentration_pct", "impact_score", "days_cash_cover"]].sort_values("customer_concentration_pct", ascending=False).to_dict(orient="records")

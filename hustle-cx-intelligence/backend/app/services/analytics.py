from __future__ import annotations

import pandas as pd


NEGATIVE_WORDS = {"wrong", "slow", "drop", "delay", "failed", "opaque", "cancellation", "threatening", "reversal"}
PRODUCT_HINTS = {"simpler", "clearer", "ux", "journey", "error", "app"}


def transcript_classification_agent(df: pd.DataFrame) -> str:
    top_issue = df["issue_category"].mode().iat[0]
    top_channel = df["channel"].mode().iat[0]
    return (
        f"Transcript traffic is currently concentrated around {top_issue.lower()} cases, with {top_channel} emerging as the dominant service channel. "
        "Management should use that concentration to focus staffing, escalation rules, and workflow redesign."
    )


def sentiment_severity_agent(df: pd.DataFrame) -> str:
    negative_share = (df["sentiment"].str.lower() == "negative").mean()
    high_severity_share = (df["severity"].str.lower() == "high").mean()
    return (
        f"Negative sentiment accounts for {negative_share:.0%} of the current queue, while high-severity cases represent {high_severity_share:.0%}. "
        "This indicates that customer trust pressure is not isolated and deserves executive visibility."
    )


def root_cause_agent(df: pd.DataFrame) -> str:
    causes = df.groupby("issue_category").size().sort_values(ascending=False).head(3).index.tolist()
    return f"The leading root-cause themes are {', '.join(causes)}. Operational ownership should be assigned by cause rather than by channel alone."


def churn_risk_agent(df: pd.DataFrame) -> str:
    high_risk = (df["churn_signal"].str.lower() == "high").mean()
    worst_segment = (
        df.groupby("customer_segment")["churn_signal"]
        .apply(lambda s: (s.str.lower() == "high").mean())
        .sort_values(ascending=False)
        .index[0]
    )
    return (
        f"High churn-risk signals appear in {high_risk:.0%} of transcripts, with the sharpest concentration in the {worst_segment} segment. "
        "Retention intervention should prioritize that segment immediately."
    )


def product_improvement_agent(df: pd.DataFrame) -> str:
    product_rows = df[df["transcript"].str.lower().apply(lambda text: any(word in text for word in PRODUCT_HINTS))]
    focus = product_rows["product"].mode().iat[0] if not product_rows.empty else df["product"].mode().iat[0]
    return (
        f"Product improvement demand is clearest around {focus}. The most valuable changes are likely to be clarity, reliability, and self-service improvements that reduce repeated contact."
    )


def executive_cx_copilot(question: str, summary: dict[str, float]) -> dict[str, str]:
    churn = summary["churn_risk_score"]
    trust = "defensive recovery" if churn >= 60 else "measured service improvement"
    return {
        "Executive CX Copilot": (
            f"For '{question}', the current CX posture supports {trust}. Prioritize customer trust repair, root-cause closure, and visible service responsiveness before scaling new promises."
        )
    }


def summary_metrics(df: pd.DataFrame) -> dict[str, float]:
    negative_pct = round((df["sentiment"].str.lower() == "negative").mean() * 100, 1)
    high_severity_pct = round((df["severity"].str.lower() == "high").mean() * 100, 1)
    avg_resolution = round(df["resolution_hours"].mean(), 1)
    churn_risk_score = round((df["churn_signal"].str.lower() == "high").mean() * 100, 1)
    product_signal_score = round(
        df["transcript"].str.lower().apply(lambda text: sum(word in text for word in PRODUCT_HINTS)).mean() * 40 + 45,
        1,
    )
    return {
        "negative_sentiment_pct": negative_pct,
        "high_severity_pct": high_severity_pct,
        "avg_resolution_hours": avg_resolution,
        "churn_risk_score": churn_risk_score,
        "product_signal_score": product_signal_score,
        "root_cause_coverage_score": round(100 - min(avg_resolution * 2, 55), 1),
        "executive_visibility_score": round((negative_pct + churn_risk_score + product_signal_score) / 3, 1),
    }


def root_cause_table(df: pd.DataFrame) -> list[dict]:
    return (
        df.groupby(["issue_category", "product"])
        .size()
        .reset_index(name="volume")
        .sort_values("volume", ascending=False)
        .head(8)
        .to_dict(orient="records")
    )


def product_signal_table(df: pd.DataFrame) -> list[dict]:
    grouped = (
        df.groupby("product")
        .agg(
            mentions=("ticket_id", "count"),
            avg_response_hours=("response_hours", "mean"),
            high_severity_cases=("severity", lambda s: (s.str.lower() == "high").sum()),
        )
        .reset_index()
    )
    grouped["avg_response_hours"] = grouped["avg_response_hours"].round(1)
    return grouped.sort_values("mentions", ascending=False).to_dict(orient="records")

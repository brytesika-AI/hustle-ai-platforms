from __future__ import annotations

import pandas as pd


SAFE_NOTE = "These outputs highlight anomalies, red flags, review priorities, and risk indicators only. They do not make legal conclusions or accuse individuals."


def transaction_risk_agent(transactions: pd.DataFrame) -> str:
    top = transactions.sort_values("risk_score", ascending=False).iloc[0]
    return (
        f"The strongest transaction review priority is {top['transaction_id']} with a risk score of {top['risk_score']:.0f}. "
        "This should be treated as an anomaly requiring investigation, not as proof of misconduct."
    )


def procurement_fraud_agent(suppliers: pd.DataFrame) -> str:
    top = suppliers.sort_values("anomaly_score", ascending=False).iloc[0]
    return (
        f"Supplier-side red flags are strongest around {top['supplier_name']}, driven by dependency concentration and invoice-edit behavior. "
        "This is a governance review priority, not a conclusion."
    )


def expense_review_agent(expenses: pd.DataFrame) -> str:
    top = expenses.sort_values("anomaly_score", ascending=False).iloc[0]
    return (
        f"Expense review risk is highest in the {top['category']} category, where anomaly indicators suggest tighter claims controls may be needed."
    )


def refund_abuse_agent(transactions: pd.DataFrame) -> str:
    refunds = transactions[transactions["refund_flag"] == 1]
    if refunds.empty:
        return "No material refund-abuse red flags are visible in the current sample."
    top = refunds.sort_values("risk_score", ascending=False).iloc[0]
    return (
        f"Refund-abuse monitoring should focus first on {top['transaction_id']}, where refund behavior sits outside normal pattern expectations."
    )


def governance_briefing_agent(metrics: dict[str, float]) -> str:
    posture = "tightened governance response" if metrics["overall_fraud_risk_score"] >= 70 else "targeted controls review"
    return (
        f"The current fraud and risk posture supports a {posture}. Management attention should focus on repeated anomalies, concentrated supplier exposure, and weak review controls."
    )


def fraud_investigation_copilot(question: str, metrics: dict[str, float]) -> dict[str, str]:
    return {
        "Fraud Investigation Copilot": (
            f"For '{question}', prioritize anomalies with the highest transaction risk, supplier concentration signals, and duplicate-claim patterns. "
            "Use this as a review sequence, not as a legal or disciplinary conclusion."
        )
    }


def summary_metrics(transactions: pd.DataFrame, suppliers: pd.DataFrame, expenses: pd.DataFrame) -> dict[str, float]:
    transaction_anomaly_score = round(transactions["risk_score"].mean(), 1)
    procurement_signal_score = round(suppliers["anomaly_score"].mean(), 1)
    expense_signal_score = round(expenses["anomaly_score"].mean(), 1)
    refund_abuse_score = round(transactions.loc[transactions["refund_flag"] == 1, "risk_score"].mean() if (transactions["refund_flag"] == 1).any() else 40.0, 1)
    governance_score = round((transaction_anomaly_score + procurement_signal_score + expense_signal_score + refund_abuse_score) / 4, 1)
    return {
        "transaction_anomaly_score": transaction_anomaly_score,
        "procurement_signal_score": procurement_signal_score,
        "expense_signal_score": expense_signal_score,
        "refund_abuse_score": refund_abuse_score,
        "overall_fraud_risk_score": governance_score,
    }


def metric_table(metrics: dict[str, float]) -> list[dict]:
    return [
        {"dimension": "Transaction Anomaly Score", "score": metrics["transaction_anomaly_score"]},
        {"dimension": "Procurement Signal Score", "score": metrics["procurement_signal_score"]},
        {"dimension": "Expense Signal Score", "score": metrics["expense_signal_score"]},
        {"dimension": "Refund Abuse Score", "score": metrics["refund_abuse_score"]},
        {"dimension": "Overall Fraud Risk Score", "score": metrics["overall_fraud_risk_score"]},
    ]

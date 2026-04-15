from __future__ import annotations

import json
from collections import deque
from time import time

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.app.core.settings import (
    AGENT_MEMORY_DIR,
    ARTIFACTS_DIR,
    CLOUDFLARE_AI_GATEWAY_BASE_URL,
    CLOUDFLARE_ALLOWED_MODELS,
    CLOUDFLARE_API_TOKEN,
    FRAUD_APP_MAX_INVESTIGATION_REQUESTS_PER_MINUTE,
    FRAUD_APP_MAX_UPLOAD_FILES,
    JOB_HISTORY_DIR,
    WORKFLOW_STATE_DIR,
)
from backend.app.services.analytics import (
    SAFE_NOTE,
    expense_review_agent,
    fraud_investigation_copilot,
    governance_briefing_agent,
    metric_table,
    procurement_fraud_agent,
    refund_abuse_agent,
    summary_metrics,
    transaction_risk_agent,
)
from backend.app.services.demo_data import apply_upload, load_sample_bundle, records
from backend.app.services.knowledge import generate_brief, query_knowledge, seed_knowledge

router = APIRouter()
INVESTIGATION_WINDOW = deque()


def _rate_limit_check() -> None:
    now = time()
    while INVESTIGATION_WINDOW and now - INVESTIGATION_WINDOW[0] > 60:
        INVESTIGATION_WINDOW.popleft()
    if len(INVESTIGATION_WINDOW) >= FRAUD_APP_MAX_INVESTIGATION_REQUESTS_PER_MINUTE:
        raise HTTPException(status_code=429, detail="Investigation copilot limit reached. Please wait before sending more requests.")
    INVESTIGATION_WINDOW.append(now)


def payload(bundle) -> dict:
    transactions = bundle.transactions.copy()
    suppliers = bundle.suppliers.copy()
    expenses = bundle.expenses.copy()
    metrics = summary_metrics(transactions, suppliers, expenses)
    seed_knowledge(bundle.text_sources)
    brief = generate_brief(
        "Fraud And Governance Priorities",
        [
            transaction_risk_agent(transactions),
            procurement_fraud_agent(suppliers),
            expense_review_agent(expenses),
            refund_abuse_agent(transactions),
            governance_briefing_agent(metrics),
        ],
    )
    return {
        "sources": bundle.source_summary,
        "limits": {
            "max_upload_files": FRAUD_APP_MAX_UPLOAD_FILES,
            "max_rows_per_dataset": 5000,
            "max_investigation_requests_per_minute": FRAUD_APP_MAX_INVESTIGATION_REQUESTS_PER_MINUTE,
        },
        "cloudflare_model_policy": {
            "provider": "cloudflare",
            "allowed_models": CLOUDFLARE_ALLOWED_MODELS,
            "gateway_configured": bool(CLOUDFLARE_AI_GATEWAY_BASE_URL),
            "token_present": bool(CLOUDFLARE_API_TOKEN),
        },
        "metrics": metrics,
        "metric_table": metric_table(metrics),
        "transactions": records(transactions),
        "suppliers": records(suppliers),
        "expenses": records(expenses),
        "agents": {
            "transaction_risk": transaction_risk_agent(transactions),
            "procurement_fraud": procurement_fraud_agent(suppliers),
            "expense_review": expense_review_agent(expenses),
            "refund_abuse": refund_abuse_agent(transactions),
            "fraud_investigation_copilot": fraud_investigation_copilot("Which anomalies deserve review first?", metrics),
            "governance_briefing": governance_briefing_agent(metrics),
        },
        "safe_use_note": SAFE_NOTE,
        "governance_brief": brief,
        "knowledge_results": query_knowledge("anomalies supplier claims refunds governance"),
        "platform_runtime": {
            "persistent_agents": True,
            "multi_step_copilot": True,
            "artifact_root": str(ARTIFACTS_DIR),
            "agent_memory_root": str(AGENT_MEMORY_DIR),
            "workflow_state_root": str(WORKFLOW_STATE_DIR),
            "job_history_root": str(JOB_HISTORY_DIR),
            "scheduled_jobs": [
                "nightly-fraud-anomaly-scan",
                "governance-brief-refresh",
                "investigation-follow-up-run",
            ],
            "sandbox_ready_tasks": [
                "batch-fraud-scan",
                "multi-day-investigation-workflow",
                "supplier-pattern-review",
            ],
        },
    }


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "hustle-fraud-intelligence-backend"}


@router.get("/api/workspace")
def workspace() -> dict:
    return payload(load_sample_bundle())


@router.post("/api/workspace/analyze")
async def analyze(files: list[UploadFile] = File(default=[])) -> dict:
    if len(files) > FRAUD_APP_MAX_UPLOAD_FILES:
        raise HTTPException(status_code=400, detail=f"Too many files uploaded. Limit is {FRAUD_APP_MAX_UPLOAD_FILES}.")
    bundle = load_sample_bundle()
    for upload in files:
        content = await upload.read()
        apply_upload(bundle, upload.filename or "upload.bin", content)
    return payload(bundle)


@router.post("/api/copilot")
async def copilot(question: str = Form(...), metrics_json: str = Form(...)) -> dict:
    _rate_limit_check()
    return {"responses": fraud_investigation_copilot(question, json.loads(metrics_json))}


@router.get("/api/knowledge/query")
def knowledge_query(q: str, top_k: int = 5) -> dict:
    return {"rows": query_knowledge(q, top_k)}


@router.post("/api/knowledge/brief")
async def knowledge_brief(topic: str = Form(...)) -> dict:
    points = [
        "High-risk transactions and repeated refund behavior should be reviewed first.",
        "Supplier concentration and invoice-edit anomalies are governance signals, not conclusions.",
        "Expense and claims reviews should focus on clustering, duplication, and override behavior.",
    ]
    return {"brief": generate_brief(topic, points)}

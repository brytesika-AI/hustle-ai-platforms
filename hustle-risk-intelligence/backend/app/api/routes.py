from __future__ import annotations

import json

from fastapi import APIRouter, File, Form, UploadFile

from backend.app.core.settings import AGENT_MEMORY_DIR, ARTIFACTS_DIR, JOB_HISTORY_DIR, WORKFLOW_STATE_DIR
from backend.app.services.analytics import (
    customer_risk_agent,
    customer_rows,
    financial_risk_agent,
    operational_risk_agent,
    risk_scenario_copilot,
    risk_table,
    supplier_risk_agent,
    supplier_rows,
    summary_metrics,
)
from backend.app.services.demo_data import apply_upload, load_sample_bundle, records
from backend.app.services.knowledge import generate_brief, query_knowledge, seed_knowledge

router = APIRouter()


def payload(bundle) -> dict:
    df = bundle.risks.copy()
    metrics = summary_metrics(df)
    seed_knowledge(bundle.text_sources)
    brief = generate_brief(
        "Risk Operating Priorities",
        [
            financial_risk_agent(df),
            operational_risk_agent(df),
            supplier_risk_agent(df),
            customer_risk_agent(df),
        ],
    )
    return {
        "sources": bundle.source_summary,
        "metrics": metrics,
        "risk_rows": records(df),
        "risk_table": risk_table(metrics),
        "supplier_rows": supplier_rows(df),
        "customer_rows": customer_rows(df),
        "agents": {
            "financial_risk": financial_risk_agent(df),
            "operational_risk": operational_risk_agent(df),
            "supplier_risk": supplier_risk_agent(df),
            "customer_risk": customer_risk_agent(df),
            "risk_copilot": risk_scenario_copilot("What should leadership mitigate first?", metrics),
        },
        "executive_brief": brief,
        "knowledge_results": query_knowledge("cash dependency concentration compliance"),
        "platform_runtime": {
            "persistent_agents": True,
            "multi_step_copilot": True,
            "artifact_root": str(ARTIFACTS_DIR),
            "agent_memory_root": str(AGENT_MEMORY_DIR),
            "workflow_state_root": str(WORKFLOW_STATE_DIR),
            "job_history_root": str(JOB_HISTORY_DIR),
            "scheduled_jobs": [
                "weekly-risk-digest",
                "supplier-dependency-monitor",
                "scenario-follow-up-review",
            ],
        },
    }


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "hustle-risk-intelligence-backend"}


@router.get("/api/workspace")
def workspace() -> dict:
    return payload(load_sample_bundle())


@router.post("/api/workspace/analyze")
async def analyze(files: list[UploadFile] = File(default=[])) -> dict:
    bundle = load_sample_bundle()
    for upload in files:
        content = await upload.read()
        apply_upload(bundle, upload.filename or "upload.bin", content)
    return payload(bundle)


@router.post("/api/copilot")
async def copilot(question: str = Form(...), metrics_json: str = Form(...)) -> dict:
    return {"responses": risk_scenario_copilot(question, json.loads(metrics_json))}


@router.get("/api/knowledge/query")
def knowledge_query(q: str, top_k: int = 5) -> dict:
    return {"rows": query_knowledge(q, top_k)}


@router.post("/api/knowledge/brief")
async def knowledge_brief(topic: str = Form(...)) -> dict:
    points = [
        "Cash cover strain is intensifying financial fragility in parts of the portfolio.",
        "Supplier and customer concentration are increasing downside exposure.",
        "Compliance slippage should be treated as an operating risk, not a documentation task.",
    ]
    return {"brief": generate_brief(topic, points)}

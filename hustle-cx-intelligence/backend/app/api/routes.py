from __future__ import annotations

import json

from fastapi import APIRouter, File, Form, UploadFile

from backend.app.core.settings import AGENT_MEMORY_DIR, ARTIFACTS_DIR, JOB_HISTORY_DIR, WORKFLOW_STATE_DIR
from backend.app.services.analytics import (
    executive_cx_copilot,
    product_improvement_agent,
    product_signal_table,
    root_cause_agent,
    root_cause_table,
    sentiment_severity_agent,
    summary_metrics,
    transcript_classification_agent,
    churn_risk_agent,
)
from backend.app.services.demo_data import apply_upload, load_sample_bundle, records
from backend.app.services.knowledge import explore_knowledge, generate_brief, lint_knowledge, query_knowledge, seed_knowledge

router = APIRouter()


def payload(bundle) -> dict:
    df = bundle.transcripts.copy()
    metrics = summary_metrics(df)
    seed_knowledge(bundle.text_sources)
    brief = generate_brief(
        "CX Operating Priorities",
        [
            transcript_classification_agent(df),
            sentiment_severity_agent(df),
            churn_risk_agent(df),
            product_improvement_agent(df),
        ],
    )
    return {
        "sources": bundle.source_summary,
        "metrics": metrics,
        "transcripts": records(df),
        "root_causes": root_cause_table(df),
        "product_signals": product_signal_table(df),
        "agents": {
            "transcript_classification": transcript_classification_agent(df),
            "sentiment_severity": sentiment_severity_agent(df),
            "root_cause": root_cause_agent(df),
            "churn_risk": churn_risk_agent(df),
            "product_improvement": product_improvement_agent(df),
            "executive_copilot": executive_cx_copilot("Where should leadership intervene first?", metrics),
        },
        "knowledge": {
            "explore": explore_knowledge(),
            "query_results": query_knowledge("billing trust churn product"),
            "lint": lint_knowledge(),
        },
        "executive_brief": brief,
        "platform_runtime": {
            "persistent_agents": True,
            "multi_step_copilot": True,
            "artifact_root": str(ARTIFACTS_DIR),
            "agent_memory_root": str(AGENT_MEMORY_DIR),
            "workflow_state_root": str(WORKFLOW_STATE_DIR),
            "job_history_root": str(JOB_HISTORY_DIR),
            "scheduled_jobs": [
                "daily-complaint-trend-snapshot",
                "weekly-cx-digest",
                "root-cause-follow-up-run",
            ],
        },
    }


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "hustle-cx-intelligence-backend"}


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
    return {"responses": executive_cx_copilot(question, json.loads(metrics_json))}


@router.get("/api/knowledge/query")
def knowledge_query(q: str, top_k: int = 5) -> dict:
    return {"rows": query_knowledge(q, top_k)}


@router.post("/api/knowledge/brief")
async def knowledge_brief(topic: str = Form(...)) -> dict:
    points = [
        "Billing and reliability issues are the strongest drivers of trust erosion in the current dataset.",
        "High-severity queues are concentrated in support environments where resolution time remains extended.",
        "Product simplification requests point to UX clarity as a retention lever.",
    ]
    return {"brief": generate_brief(topic, points)}

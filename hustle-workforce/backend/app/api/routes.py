from __future__ import annotations

import json

from fastapi import APIRouter, File, Form, UploadFile

from backend.app.core.settings import AGENT_MEMORY_DIR, ARTIFACTS_DIR, JOB_HISTORY_DIR, WORKFLOW_STATE_DIR
from backend.app.services.agents import (
    cashflow_intelligence_agent,
    decision_copilot,
    inventory_forecast_agent,
    marketing_campaign_agent,
    whatsapp_crm_intelligence_agent,
)
from backend.app.services.demo_data import build_sample_bundle, classify_and_apply, dataframe_to_records
from backend.app.services.health_engine import build_health_table, compute_health_scores
from backend.app.services.knowledge_brain import add_uploaded_texts, batch_ingest, explore_knowledge, generate_brief, lint_knowledge, query_documents
from backend.app.services.reporting import build_executive_brief

router = APIRouter()


def _bundle_payload(bundle) -> dict:
    scores = compute_health_scores(bundle)
    decision_question = "Should the business accelerate regional growth next quarter?"
    return {
        "sources": bundle.source_summary,
        "sections": {
            "finance": dataframe_to_records(bundle.finance),
            "operations": dataframe_to_records(bundle.operations),
            "sales": dataframe_to_records(bundle.sales),
            "strategy": dataframe_to_records(bundle.strategy),
            "growth": dataframe_to_records(bundle.growth),
            "inventory": dataframe_to_records(bundle.inventory),
            "crm": dataframe_to_records(bundle.crm),
        },
        "health_scores": scores,
        "health_table": build_health_table(scores),
        "agents": {
            "cashflow": cashflow_intelligence_agent(bundle.finance),
            "inventory": inventory_forecast_agent(bundle.inventory),
            "whatsapp_crm": whatsapp_crm_intelligence_agent(bundle.crm),
            "marketing_campaign": marketing_campaign_agent(bundle.growth),
            "decision_copilot": decision_copilot(decision_question, scores),
        },
        "executive_brief": build_executive_brief(
            scores,
            cashflow_intelligence_agent(bundle.finance),
            inventory_forecast_agent(bundle.inventory),
            whatsapp_crm_intelligence_agent(bundle.crm),
        ),
        "knowledge": {
            "explore": explore_knowledge(),
            "default_query_results": query_documents("cash discipline working capital").fillna("").to_dict(orient="records"),
        },
        "platform_runtime": {
            "persistent_agents": True,
            "multi_step_copilot": True,
            "artifact_root": str(ARTIFACTS_DIR),
            "agent_memory_root": str(AGENT_MEMORY_DIR),
            "workflow_state_root": str(WORKFLOW_STATE_DIR),
            "job_history_root": str(JOB_HISTORY_DIR),
            "scheduled_jobs": [
                "nightly-workforce-health-check",
                "weekly-decision-brief",
                "knowledge-brain-lint-cycle",
            ],
        },
    }


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "hustle-workforce-backend"}


@router.get("/api/workspace")
def workspace() -> dict:
    batch_ingest()
    bundle = build_sample_bundle()
    add_uploaded_texts(bundle.text_sources)
    return _bundle_payload(bundle)


@router.post("/api/workspace/analyze")
async def analyze(files: list[UploadFile] = File(default=[])) -> dict:
    batch_ingest()
    bundle = build_sample_bundle()
    for upload in files:
        content = await upload.read()
        classify_and_apply(bundle, upload.filename or "upload.bin", content)
    add_uploaded_texts(bundle.text_sources)
    return _bundle_payload(bundle)


@router.post("/api/decision-copilot")
async def decision_copilot_route(question: str = Form(...), scores_json: str = Form(...)) -> dict:
    scores = json.loads(scores_json)
    return {"responses": decision_copilot(question, scores)}


@router.get("/api/knowledge/explore")
def knowledge_explore() -> dict:
    batch_ingest()
    return explore_knowledge()


@router.get("/api/knowledge/lint")
def knowledge_lint() -> dict:
    return {"rows": lint_knowledge().fillna("").to_dict(orient="records")}


@router.get("/api/knowledge/query")
def knowledge_query(q: str, top_k: int = 5) -> dict:
    batch_ingest()
    return {"rows": query_documents(q, top_k).fillna("").to_dict(orient="records")}


@router.post("/api/knowledge/brief")
async def knowledge_brief(topic: str = Form(...)) -> dict:
    context = [
        "Cash resilience should remain the first management constraint.",
        "Inventory replenishment must follow realistic demand and lead-time exposure.",
        "WhatsApp lead conversion is strongest where response times remain disciplined.",
        "Knowledge maturity is improving as structured notes and playbooks accumulate.",
    ]
    return {"brief": generate_brief(topic, context)}

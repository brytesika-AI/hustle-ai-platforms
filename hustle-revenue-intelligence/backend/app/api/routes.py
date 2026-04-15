from __future__ import annotations

import json

from fastapi import APIRouter, File, Form, UploadFile

from backend.app.services.analytics import (
    churn_impact_agent,
    churn_table,
    driver_table,
    expansion_table,
    pricing_optimization_agent,
    pricing_table,
    revenue_decision_copilot,
    revenue_driver_agent,
    summary_metrics,
    upsell_cross_sell_agent,
)
from backend.app.services.demo_data import apply_upload, load_sample_bundle, records
from backend.app.services.knowledge import generate_brief, query_knowledge, seed_knowledge

router = APIRouter()


def payload(bundle) -> dict:
    df = bundle.revenue.copy()
    metrics = summary_metrics(df)
    seed_knowledge(bundle.text_sources)
    brief = generate_brief(
        "Revenue Operating Priorities",
        [
          pricing_optimization_agent(df),
          revenue_driver_agent(df),
          churn_impact_agent(df),
          upsell_cross_sell_agent(df),
        ],
    )
    return {
        "sources": bundle.source_summary,
        "metrics": metrics,
        "revenue_rows": records(df),
        "pricing_rows": pricing_table(df),
        "driver_rows": driver_table(df),
        "churn_rows": churn_table(df),
        "expansion_rows": expansion_table(df),
        "agents": {
            "pricing_optimization": pricing_optimization_agent(df),
            "revenue_driver": revenue_driver_agent(df),
            "churn_impact": churn_impact_agent(df),
            "upsell_cross_sell": upsell_cross_sell_agent(df),
            "revenue_copilot": revenue_decision_copilot("Where should leadership intervene first?", metrics),
        },
        "executive_brief": brief,
        "knowledge_results": query_knowledge("pricing churn expansion revenue"),
    }


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "hustle-revenue-intelligence-backend"}


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
    return {"responses": revenue_decision_copilot(question, json.loads(metrics_json))}


@router.get("/api/knowledge/query")
def knowledge_query(q: str, top_k: int = 5) -> dict:
    return {"rows": query_knowledge(q, top_k)}


@router.post("/api/knowledge/brief")
async def knowledge_brief(topic: str = Form(...)) -> dict:
    points = [
        "Discount leakage is most visible where commercial confidence is already fragile.",
        "High churn-risk accounts represent avoidable revenue drag.",
        "Expansion potential is strongest in workflow-heavy and multi-module accounts.",
    ]
    return {"brief": generate_brief(topic, points)}

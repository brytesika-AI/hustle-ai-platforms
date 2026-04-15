from __future__ import annotations

import json

from fastapi import APIRouter, File, Form, UploadFile

from backend.app.services.analytics import (
    build_joined_inventory,
    dead_stock_agent,
    inventory_decision_copilot,
    metric_table,
    reorder_intelligence_agent,
    stock_visibility_agent,
    supplier_dependency_agent,
    summary_metrics,
)
from backend.app.services.demo_data import apply_upload, load_sample_bundle, records
from backend.app.services.knowledge import generate_brief, query_knowledge, seed_knowledge

router = APIRouter()


def payload(bundle) -> dict:
    joined = build_joined_inventory(bundle.inventory, bundle.sales_history, bundle.suppliers)
    metrics = summary_metrics(joined)
    seed_knowledge(bundle.text_sources)
    brief = generate_brief(
        "Inventory Operating Priorities",
        [
            stock_visibility_agent(joined),
            reorder_intelligence_agent(joined),
            dead_stock_agent(joined),
            supplier_dependency_agent(joined),
        ],
    )
    return {
        "sources": bundle.source_summary,
        "metrics": metrics,
        "inventory_rows": records(joined),
        "metric_table": metric_table(metrics),
        "agents": {
            "stock_visibility": stock_visibility_agent(joined),
            "reorder_intelligence": reorder_intelligence_agent(joined),
            "dead_stock": dead_stock_agent(joined),
            "supplier_dependency": supplier_dependency_agent(joined),
            "inventory_copilot": inventory_decision_copilot("What should leadership act on first this month?", metrics),
        },
        "executive_brief": brief,
        "knowledge_results": query_knowledge("stock reorder supplier dead stock"),
    }


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "hustle-inventory-intelligence-backend"}


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
    return {"responses": inventory_decision_copilot(question, json.loads(metrics_json))}


@router.get("/api/knowledge/query")
def knowledge_query(q: str, top_k: int = 5) -> dict:
    return {"rows": query_knowledge(q, top_k)}


@router.post("/api/knowledge/brief")
async def knowledge_brief(topic: str = Form(...)) -> dict:
    points = [
        "Stock availability remains strongest in high-turn packaging and grocery lines.",
        "Slow-moving specialty items are creating avoidable working-capital drag.",
        "Supplier dependence remains a decision constraint for critical categories.",
    ]
    return {"brief": generate_brief(topic, points)}

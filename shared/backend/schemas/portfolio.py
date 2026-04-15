from __future__ import annotations

from pydantic import BaseModel


class MetricRow(BaseModel):
    dimension: str
    score: float


class SourceMap(BaseModel):
    sources: dict[str, str]


class ProductModelPolicy(BaseModel):
    product: str
    reasoning_model: str
    operational_model: str
    embedding_model: str
    task_defaults: dict[str, str]

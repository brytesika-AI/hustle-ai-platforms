from __future__ import annotations

from datetime import datetime, timezone

import duckdb
import pandas as pd

from backend.app.core.settings import DATASETS_DIR, DATA_DB_PATH, FOOTER, REPORTS_DIR


def ensure_db() -> duckdb.DuckDBPyConnection:
    DATA_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = duckdb.connect(str(DATA_DB_PATH))
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge_documents (
            id VARCHAR PRIMARY KEY,
            title VARCHAR,
            content VARCHAR,
            word_count INTEGER,
            created_at TIMESTAMP
        )
        """
    )
    return conn


def seed_knowledge(text_sources: list[dict]) -> None:
    conn = ensure_db()
    for idx, item in enumerate(text_sources, start=1):
        conn.execute(
            """
            INSERT OR REPLACE INTO knowledge_documents (id, title, content, word_count, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            [f"text:{idx}:{item['title']}", item["title"], item["content"], len(item["content"].split()), datetime.now(timezone.utc)],
        )
    conn.close()


def query_knowledge(query: str, top_k: int = 5) -> list[dict]:
    conn = ensure_db()
    docs = conn.execute("SELECT title, content, word_count FROM knowledge_documents").fetchdf()
    conn.close()
    if docs.empty:
        return []
    terms = [term.lower() for term in query.split() if len(term) > 2]
    if not terms:
        return docs.head(top_k).to_dict(orient="records")
    docs["score"] = docs["content"].str.lower().apply(lambda text: sum(text.count(term) for term in terms))
    return docs.sort_values(["score", "word_count"], ascending=[False, False]).head(top_k).fillna("").to_dict(orient="records")


def explore_knowledge() -> dict:
    trend_note = (DATASETS_DIR / "trend_notes.txt").read_text(encoding="utf-8")
    return {
        "documents": 1,
        "average_word_count": len(trend_note.split()),
        "trend_focus": "billing trust, network quality, delayed fulfillment, product usability",
    }


def lint_knowledge() -> list[dict]:
    content = (DATASETS_DIR / "trend_notes.txt").read_text(encoding="utf-8")
    return [
        {
            "file": "trend_notes.txt",
            "has_footer": FOOTER in content.splitlines()[-1],
            "word_count": len(content.split()),
        }
    ]


def generate_brief(topic: str, points: list[str]) -> str:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    bullet_block = "\n".join(f"- {point}" for point in points)
    brief = (
        f"# Executive Briefing: {topic}\n\n"
        "## CX Management View\n\n"
        f"{bullet_block}\n\n"
        "## Executive Direction\n\n"
        "Use support intelligence to reduce churn pressure, prioritize root-cause resolution, and accelerate product fixes with the clearest customer payoff.\n\n"
        f"{FOOTER}\n"
    )
    (REPORTS_DIR / "cx_executive_brief.md").write_text(brief, encoding="utf-8")
    return brief

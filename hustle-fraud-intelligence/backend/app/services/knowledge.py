from __future__ import annotations

from datetime import datetime, timezone

import duckdb

from backend.app.core.settings import DATASETS_DIR, DATA_DB_PATH, FOOTER, REPORTS_DIR


def ensure_db() -> duckdb.DuckDBPyConnection:
    DATA_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = duckdb.connect(str(DATA_DB_PATH))
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS notes (
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
            INSERT OR REPLACE INTO notes (id, title, content, word_count, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            [f"note:{idx}:{item['title']}", item["title"], item["content"], len(item["content"].split()), datetime.now(timezone.utc)],
        )
    conn.close()


def query_knowledge(query: str, top_k: int = 5) -> list[dict]:
    conn = ensure_db()
    docs = conn.execute("SELECT title, content, word_count FROM notes").fetchdf()
    conn.close()
    if docs.empty:
        return []
    terms = [term.lower() for term in query.split() if len(term) > 2]
    if not terms:
        return docs.head(top_k).to_dict(orient="records")
    docs["score"] = docs["content"].str.lower().apply(lambda text: sum(text.count(term) for term in terms))
    return docs.sort_values(["score", "word_count"], ascending=[False, False]).head(top_k).fillna("").to_dict(orient="records")


def generate_brief(topic: str, points: list[str]) -> str:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    bullet_block = "\n".join(f"- {point}" for point in points)
    brief = (
        f"# Governance Briefing: {topic}\n\n"
        "## Fraud And Risk Review View\n\n"
        f"{bullet_block}\n\n"
        "## Safe Use Note\n\n"
        "These outputs represent anomalies, red flags, review priorities, and risk indicators only. They do not make legal conclusions or accuse individuals.\n\n"
        f"{FOOTER}\n"
    )
    (REPORTS_DIR / "fraud_governance_brief.md").write_text(brief, encoding="utf-8")
    return brief

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

import duckdb
import pandas as pd

from backend.app.core.settings import FOOTER, KNOWLEDGE_DB_PATH, RAW_KNOWLEDGE_DIR, REPORTS_DIR, WIKI_KNOWLEDGE_DIR


def ensure_db() -> duckdb.DuckDBPyConnection:
    KNOWLEDGE_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = duckdb.connect(str(KNOWLEDGE_DB_PATH))
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS documents (
            id VARCHAR PRIMARY KEY,
            source_type VARCHAR,
            title VARCHAR,
            content VARCHAR,
            word_count INTEGER,
            created_at TIMESTAMP
        )
        """
    )
    return conn


def _load_file(path: Path, source_type: str) -> dict:
    content = path.read_text(encoding="utf-8")
    title_line = content.splitlines()[0].strip() if content.splitlines() else path.stem
    title = title_line.lstrip("# ").strip() or path.stem
    return {
        "id": f"{source_type}:{path.name}",
        "source_type": source_type,
        "title": title,
        "content": content,
        "word_count": len(content.split()),
        "created_at": datetime.now(timezone.utc),
    }


def ingest_path(path: Path, source_type: str) -> dict:
    conn = ensure_db()
    doc = _load_file(path, source_type)
    conn.execute(
        """
        INSERT OR REPLACE INTO documents (id, source_type, title, content, word_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        [doc["id"], doc["source_type"], doc["title"], doc["content"], doc["word_count"], doc["created_at"]],
    )
    conn.close()
    return doc


def batch_ingest() -> list[dict]:
    docs: list[dict] = []
    for path in sorted(RAW_KNOWLEDGE_DIR.glob("*")):
        if path.is_file():
            docs.append(ingest_path(path, "raw"))
    for path in sorted(WIKI_KNOWLEDGE_DIR.glob("*")):
        if path.is_file():
            docs.append(ingest_path(path, "wiki"))
    return docs


def add_uploaded_texts(text_sources: Iterable[dict]) -> None:
    conn = ensure_db()
    for idx, item in enumerate(text_sources, start=1):
        conn.execute(
            """
            INSERT OR REPLACE INTO documents (id, source_type, title, content, word_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            [f"upload:{idx}:{item['title']}", "upload", item["title"], item["content"], len(item["content"].split()), datetime.now(timezone.utc)],
        )
    conn.close()


def query_documents(query: str, top_k: int = 5) -> pd.DataFrame:
    conn = ensure_db()
    if conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0] == 0:
        batch_ingest()
    terms = [term.lower() for term in query.split() if len(term) > 2]
    docs = conn.execute("SELECT source_type, title, content, word_count FROM documents").fetchdf()
    conn.close()
    if docs.empty:
        return docs
    if not terms:
        return docs.head(top_k)
    docs["score"] = docs["content"].str.lower().apply(lambda text: sum(text.count(term) for term in terms))
    ranked = docs.sort_values(["score", "word_count"], ascending=[False, False])
    return ranked[ranked["score"] > 0].head(top_k)


def lint_knowledge() -> pd.DataFrame:
    rows = []
    for source_type, base_dir in [("raw", RAW_KNOWLEDGE_DIR), ("wiki", WIKI_KNOWLEDGE_DIR)]:
        for path in sorted(base_dir.glob("*")):
            if not path.is_file():
                continue
            content = path.read_text(encoding="utf-8")
            lines = content.splitlines()
            rows.append(
                {
                    "file": path.name,
                    "source_type": source_type,
                    "has_title": bool(lines),
                    "has_footer": FOOTER in lines[-1] if lines else False,
                    "word_count": len(content.split()),
                }
            )
    return pd.DataFrame(rows)


def explore_knowledge() -> dict:
    lint_df = lint_knowledge()
    return {
        "raw_documents": len([p for p in RAW_KNOWLEDGE_DIR.glob("*") if p.is_file()]),
        "wiki_documents": len([p for p in WIKI_KNOWLEDGE_DIR.glob("*") if p.is_file()]),
        "average_word_count": 0 if lint_df.empty else round(lint_df["word_count"].mean(), 1),
    }


def generate_brief(topic: str, context_lines: Iterable[str]) -> str:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    bullet_block = "\n".join(f"- {line}" for line in context_lines)
    brief = (
        f"# Executive Briefing: {topic}\n\n"
        "## Management View\n\n"
        "This briefing summarizes the latest operating signals relevant to leadership review.\n\n"
        "## Key Points\n\n"
        f"{bullet_block}\n\n"
        "## Recommendation\n\n"
        "Prioritize actions that strengthen liquidity, execution quality, and high-confidence revenue capture in the same operating cycle.\n\n"
        f"{FOOTER}\n"
    )
    (REPORTS_DIR / "executive_brief.md").write_text(brief, encoding="utf-8")
    return brief

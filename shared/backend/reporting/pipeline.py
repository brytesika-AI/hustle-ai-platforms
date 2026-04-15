from __future__ import annotations

from pathlib import Path

from shared.backend.reporting.executive import render_markdown_brief


def build_report_pipeline_output(root: Path, title: str, bullets: list[str], filename: str) -> dict:
    root.mkdir(parents=True, exist_ok=True)
    content = render_markdown_brief(title, bullets)
    output_path = root / filename
    output_path.write_text(content, encoding="utf-8")
    return {"title": title, "path": str(output_path), "content": content}

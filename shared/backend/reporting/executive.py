from __future__ import annotations


FOOTER = "@BryteSikaStrategyAI"


def render_markdown_brief(title: str, bullets: list[str]) -> str:
    body = "\n".join(f"- {item}" for item in bullets)
    return f"# {title}\n\n{body}\n\n{FOOTER}"

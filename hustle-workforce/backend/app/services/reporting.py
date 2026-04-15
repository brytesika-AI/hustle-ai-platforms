from __future__ import annotations

from backend.app.core.settings import FOOTER


def build_executive_brief(scores: dict, cashflow_summary: str, inventory_summary: str, crm_summary: str) -> str:
    return f"""# Hustle Workforce Executive Briefing

## Executive Summary

The current business health score is {scores['overall_health_score']:.1f}. Leadership should align finance, inventory, sales, growth, and knowledge maturity decisions inside one operating review.

## Management Signals

- {cashflow_summary}
- {inventory_summary}
- {crm_summary}
- Knowledge maturity is currently scored at {scores['knowledge_maturity']:.1f}, indicating a growing but still improvable management memory.

## Recommended Actions

1. Protect cash conversion and expense pacing.
2. Close the most urgent inventory coverage gaps before scaling campaigns.
3. Focus sales follow-up on high-confidence opportunities with clear service readiness.
4. Use the decision copilot to stress-test major growth and strategy bets.

{FOOTER}
"""

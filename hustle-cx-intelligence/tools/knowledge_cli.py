from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.services.knowledge import explore_knowledge, generate_brief, lint_knowledge, query_knowledge


def main() -> None:
    parser = argparse.ArgumentParser(description="Hustle CX Intelligence knowledge and trends CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    query_parser = subparsers.add_parser("query")
    query_parser.add_argument("--text", required=True)
    query_parser.add_argument("--top-k", type=int, default=5)

    subparsers.add_parser("lint")
    subparsers.add_parser("explore")

    brief_parser = subparsers.add_parser("brief")
    brief_parser.add_argument("--topic", required=True)

    args = parser.parse_args()
    if args.command == "query":
        print(query_knowledge(args.text, args.top_k))
    elif args.command == "lint":
        print(lint_knowledge())
    elif args.command == "explore":
        print(explore_knowledge())
    elif args.command == "brief":
        print(generate_brief(args.topic, ["Trust pressure is rising in billing and reliability journeys.", "Product simplification is a visible CX opportunity."]))


if __name__ == "__main__":
    main()

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.services.knowledge_brain import batch_ingest, explore_knowledge, generate_brief, ingest_path, lint_knowledge, query_documents


def main() -> None:
    parser = argparse.ArgumentParser(description="Hustle Workforce knowledge brain CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    ingest_parser = subparsers.add_parser("ingest")
    ingest_parser.add_argument("--path", required=True)
    ingest_parser.add_argument("--source-type", default="raw", choices=["raw", "wiki"])
    subparsers.add_parser("batch-ingest")

    query_parser = subparsers.add_parser("query")
    query_parser.add_argument("--text", required=True)
    query_parser.add_argument("--top-k", type=int, default=5)

    subparsers.add_parser("lint")
    subparsers.add_parser("explore")

    brief_parser = subparsers.add_parser("brief")
    brief_parser.add_argument("--topic", required=True)

    args = parser.parse_args()
    if args.command == "ingest":
        doc = ingest_path(Path(args.path), args.source_type)
        print(f"Ingested {doc['id']} with {doc['word_count']} words")
    elif args.command == "batch-ingest":
        docs = batch_ingest()
        print(f"Ingested {len(docs)} documents")
    elif args.command == "query":
        print(query_documents(args.text, args.top_k).to_string(index=False))
    elif args.command == "lint":
        print(lint_knowledge().to_string(index=False))
    elif args.command == "explore":
        print(explore_knowledge())
    elif args.command == "brief":
        context = [
            "Cash discipline remains the primary management priority.",
            "Inventory should be paced against realistic demand and lead times.",
            "Sales follow-up quality is strongest where response times remain short.",
            "Growth investment should follow execution readiness.",
        ]
        print(generate_brief(args.topic, context))


if __name__ == "__main__":
    main()

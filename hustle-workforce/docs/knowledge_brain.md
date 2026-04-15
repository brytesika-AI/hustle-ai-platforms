# SME Knowledge Brain

The SME Knowledge Brain gives Hustle Workforce a lightweight operating memory for notes, playbooks, uploaded text, and executive brief generation.

## Folder Structure

- `knowledge/raw/` for raw notes and imported text
- `knowledge/wiki/` for structured markdown playbooks
- `schema/rules.yaml` for content and lint expectations
- `tools/knowledge_cli.py` for ingest, batch ingest, query, lint, explore, and brief commands

## Backend Integration

The Python backend exposes knowledge operations through API routes for:
- query
- lint
- explore
- brief generation

## CLI Commands

```bash
python tools/knowledge_cli.py batch-ingest
python tools/knowledge_cli.py query --text "cash discipline"
python tools/knowledge_cli.py lint
python tools/knowledge_cli.py explore
python tools/knowledge_cli.py brief --topic "Quarterly priorities"
```

@BryteSikaStrategyAI

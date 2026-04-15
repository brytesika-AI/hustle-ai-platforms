from pathlib import Path

PRODUCT_NAME = "Hustle Workforce"
FOOTER = "@BryteSikaStrategyAI"
BASE_DIR = Path(__file__).resolve().parents[2]
KNOWLEDGE_DIR = BASE_DIR.parent / "knowledge"
RAW_KNOWLEDGE_DIR = KNOWLEDGE_DIR / "raw"
WIKI_KNOWLEDGE_DIR = KNOWLEDGE_DIR / "wiki"
SCHEMA_PATH = BASE_DIR.parent / "schema" / "rules.yaml"
KNOWLEDGE_DB_PATH = KNOWLEDGE_DIR / "knowledge_brain.duckdb"
REPORTS_DIR = BASE_DIR.parent / "reports"
ARTIFACTS_DIR = BASE_DIR.parent / "artifacts"
STATE_DIR = BASE_DIR.parent / "state"
AGENT_MEMORY_DIR = STATE_DIR / "agent_memory"
WORKFLOW_STATE_DIR = STATE_DIR / "workflow_state"
JOB_HISTORY_DIR = STATE_DIR / "job_history"

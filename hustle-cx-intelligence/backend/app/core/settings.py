from pathlib import Path

PRODUCT_NAME = "Hustle CX Intelligence"
FOOTER = "@BryteSikaStrategyAI"
BASE_DIR = Path(__file__).resolve().parents[2]
DATASETS_DIR = BASE_DIR.parent / "datasets"
DATA_DB_PATH = DATASETS_DIR / "cx_intelligence.duckdb"
REPORTS_DIR = BASE_DIR.parent / "reports"
ARTIFACTS_DIR = BASE_DIR.parent / "artifacts"
STATE_DIR = BASE_DIR.parent / "state"
AGENT_MEMORY_DIR = STATE_DIR / "agent_memory"
WORKFLOW_STATE_DIR = STATE_DIR / "workflow_state"
JOB_HISTORY_DIR = STATE_DIR / "job_history"

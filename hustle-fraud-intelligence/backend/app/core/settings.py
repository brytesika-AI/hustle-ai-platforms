import os
from pathlib import Path

PRODUCT_NAME = "Hustle Fraud Intelligence"
SUBTITLE = "Risk Management and Fraud Detection using Generative AI in African SMEs"
FOOTER = "@BryteSikaStrategyAI"
BASE_DIR = Path(__file__).resolve().parents[2]
DATASETS_DIR = BASE_DIR.parent / "datasets"
DATA_DB_PATH = DATASETS_DIR / "fraud_intelligence.duckdb"
REPORTS_DIR = BASE_DIR.parent / "reports"
ARTIFACTS_DIR = BASE_DIR.parent / "artifacts"
STATE_DIR = BASE_DIR.parent / "state"
AGENT_MEMORY_DIR = STATE_DIR / "agent_memory"
WORKFLOW_STATE_DIR = STATE_DIR / "workflow_state"
JOB_HISTORY_DIR = STATE_DIR / "job_history"

CLOUDFLARE_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN", "")
CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
CLOUDFLARE_AI_GATEWAY_BASE_URL = os.getenv("CLOUDFLARE_AI_GATEWAY_BASE_URL", "")
CLOUDFLARE_ALLOWED_MODELS = [
    item.strip() for item in os.getenv(
        "CLOUDFLARE_ALLOWED_MODELS",
        "@cf/meta/llama-3.1-8b-instruct,@cf/qwen/qwen1.5-14b-chat-awq",
    ).split(",") if item.strip()
]
FRAUD_APP_MAX_UPLOAD_FILES = int(os.getenv("FRAUD_APP_MAX_UPLOAD_FILES", "5"))
FRAUD_APP_MAX_ROWS = int(os.getenv("FRAUD_APP_MAX_ROWS", "5000"))
FRAUD_APP_MAX_INVESTIGATION_REQUESTS_PER_MINUTE = int(os.getenv("FRAUD_APP_MAX_INVESTIGATION_REQUESTS_PER_MINUTE", "20"))

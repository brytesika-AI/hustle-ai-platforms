from pathlib import Path

PRODUCT_NAME = "Hustle Revenue Intelligence"
FOOTER = "@BryteSikaStrategyAI"
BASE_DIR = Path(__file__).resolve().parents[2]
DATASETS_DIR = BASE_DIR.parent / "datasets"
DATA_DB_PATH = DATASETS_DIR / "revenue_intelligence.duckdb"
REPORTS_DIR = BASE_DIR.parent / "reports"

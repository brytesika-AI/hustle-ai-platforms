export type InventoryMetrics = {
  stockout_risk_score: number;
  reorder_coverage_score: number;
  dead_stock_score: number;
  supplier_dependency_score: number;
  inventory_health_score: number;
};

export type WorkspacePayload = {
  sources: Record<string, string>;
  metrics: InventoryMetrics;
  inventory_rows: Record<string, string | number>[];
  metric_table: { dimension: string; score: number }[];
  agents: {
    stock_visibility: string;
    reorder_intelligence: string;
    dead_stock: string;
    supplier_dependency: string;
    inventory_copilot: Record<string, string>;
  };
  executive_brief: string;
  knowledge_results: Record<string, string | number>[];
};

export type RiskMetrics = {
  financial_risk_score: number;
  operational_risk_score: number;
  supplier_risk_score: number;
  customer_risk_score: number;
  compliance_risk_score: number;
  overall_risk_score: number;
};

export type WorkspacePayload = {
  sources: Record<string, string>;
  metrics: RiskMetrics;
  risk_rows: Record<string, string | number>[];
  risk_table: { dimension: string; score: number }[];
  supplier_rows: Record<string, string | number>[];
  customer_rows: Record<string, string | number>[];
  agents: {
    financial_risk: string;
    operational_risk: string;
    supplier_risk: string;
    customer_risk: string;
    risk_copilot: Record<string, string>;
  };
  executive_brief: string;
  knowledge_results: Record<string, string | number>[];
};

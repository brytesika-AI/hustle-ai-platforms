export type FraudMetrics = {
  transaction_anomaly_score: number;
  procurement_signal_score: number;
  expense_signal_score: number;
  refund_abuse_score: number;
  overall_fraud_risk_score: number;
};

export type WorkspacePayload = {
  sources: Record<string, string>;
  limits: {
    max_upload_files: number;
    max_rows_per_dataset: number;
    max_investigation_requests_per_minute: number;
  };
  cloudflare_model_policy: {
    provider: string;
    allowed_models: string[];
    gateway_configured: boolean;
    token_present: boolean;
  };
  metrics: FraudMetrics;
  metric_table: { dimension: string; score: number }[];
  transactions: Record<string, string | number>[];
  suppliers: Record<string, string | number>[];
  expenses: Record<string, string | number>[];
  agents: {
    transaction_risk: string;
    procurement_fraud: string;
    expense_review: string;
    refund_abuse: string;
    fraud_investigation_copilot: Record<string, string>;
    governance_briefing: string;
  };
  safe_use_note: string;
  governance_brief: string;
  knowledge_results: Record<string, string | number>[];
};

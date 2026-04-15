export type CxMetrics = {
  negative_sentiment_pct: number;
  high_severity_pct: number;
  avg_resolution_hours: number;
  churn_risk_score: number;
  product_signal_score: number;
  root_cause_coverage_score: number;
  executive_visibility_score: number;
};

export type WorkspacePayload = {
  sources: Record<string, string>;
  metrics: CxMetrics;
  transcripts: Record<string, string | number>[];
  root_causes: Record<string, string | number>[];
  product_signals: Record<string, string | number>[];
  agents: {
    transcript_classification: string;
    sentiment_severity: string;
    root_cause: string;
    churn_risk: string;
    product_improvement: string;
    executive_copilot: Record<string, string>;
  };
  knowledge: {
    explore: {
      documents: number;
      average_word_count: number;
      trend_focus: string;
    };
    query_results: Record<string, string | number>[];
    lint: Record<string, string | number>[];
  };
  executive_brief: string;
};

export type RevenueMetrics = {
  total_revenue: number;
  avg_discount_pct: number;
  churn_revenue_exposure: number;
  pricing_power_score: number;
  expansion_readiness_score: number;
  driver_clarity_score: number;
  revenue_health_score: number;
};

export type WorkspacePayload = {
  sources: Record<string, string>;
  metrics: RevenueMetrics;
  revenue_rows: Record<string, string | number>[];
  pricing_rows: Record<string, string | number>[];
  driver_rows: Record<string, string | number>[];
  churn_rows: Record<string, string | number>[];
  expansion_rows: Record<string, string | number>[];
  agents: {
    pricing_optimization: string;
    revenue_driver: string;
    churn_impact: string;
    upsell_cross_sell: string;
    revenue_copilot: Record<string, string>;
  };
  executive_brief: string;
  knowledge_results: Record<string, string | number>[];
};

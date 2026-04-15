export type MetricScore = {
  financial_risk: number;
  inventory_risk: number;
  sales_pipeline_health: number;
  growth_activity: number;
  knowledge_maturity: number;
  overall_health_score: number;
};

export type WorkspacePayload = {
  sources: Record<string, string>;
  sections: Record<string, Record<string, string | number>[]>;
  health_scores: MetricScore;
  health_table: { dimension: string; score: number }[];
  agents: {
    cashflow: string;
    inventory: string;
    whatsapp_crm: string;
    marketing_campaign: string;
    decision_copilot: Record<string, string>;
  };
  executive_brief: string;
  knowledge: {
    explore: {
      raw_documents: number;
      wiki_documents: number;
      average_word_count: number;
    };
    default_query_results: Record<string, string | number>[];
  };
};

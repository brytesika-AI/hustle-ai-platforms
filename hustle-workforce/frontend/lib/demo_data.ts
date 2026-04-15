import { WorkspacePayload } from "./types";

export const demoWorkspace: WorkspacePayload = {
  sources: {
    finance: "sample_finance.csv",
    operations: "sample_operations.csv",
    sales: "sample_sales.csv",
    crm: "sample_crm.csv",
    strategy: "owner_strategy_notes.txt",
    growth: "sample_growth.csv",
  },
  sections: {
    finance: [
      { metric: "Cash buffer weeks", value: 7.2, status: "watch" },
      { metric: "Collections cycle", value: 41, status: "elevated" },
    ],
    operations: [
      { metric: "Team utilization", value: 78, status: "healthy" },
      { metric: "Cycle-time variance", value: 14, status: "watch" },
    ],
    sales: [
      { metric: "Qualified pipeline", value: 1240000, status: "healthy" },
      { metric: "Close confidence", value: 63, status: "watch" },
    ],
    crm: [
      { channel: "WhatsApp", active_threads: 48, conversion_signal: "medium" },
      { channel: "Calls", active_threads: 16, conversion_signal: "high" },
    ],
    strategy: [
      { priority: "Regional expansion", stage: "under review", owner: "CEO" },
      { priority: "Working-capital discipline", stage: "active", owner: "CFO" },
    ],
    growth: [
      { campaign: "Retail push", roi_score: 72, status: "healthy" },
      { campaign: "Dealer activation", roi_score: 58, status: "watch" },
    ],
  },
  health_scores: {
    financial_risk: 64,
    inventory_risk: 59,
    sales_pipeline_health: 71,
    growth_activity: 68,
    knowledge_maturity: 62,
    overall_health_score: 65,
  },
  health_table: [
    { dimension: "Financial", score: 64 },
    { dimension: "Inventory", score: 59 },
    { dimension: "Sales Pipeline", score: 71 },
    { dimension: "Growth", score: 68 },
    { dimension: "Knowledge Maturity", score: 62 },
  ],
  agents: {
    cashflow: "Working capital is serviceable, but collections discipline still deserves weekly leadership attention.",
    inventory: "Inventory conditions are manageable, though a few fast-moving lines need tighter oversight.",
    whatsapp_crm: "WhatsApp remains commercially useful, but first-pass parsing should keep deal quality visible for managers.",
    marketing_campaign: "Growth activity is productive enough to continue, but weaker campaigns should be pruned earlier.",
    decision_copilot: {
      socratic: "What assumption about expansion still lacks evidence from cashflow and pipeline quality?",
      analyst: "Protect liquidity first, then scale only the commercial motions already proving efficient.",
      strategist: "Treat the next growth move as a disciplined operating decision, not just a sales ambition.",
    },
  },
  executive_brief:
    "The business is healthy enough to pursue growth, but not casually. Leadership should keep collections discipline tight, focus expansion on higher-confidence commercial motions, and keep the Knowledge Brain current for faster operating decisions.",
  knowledge: {
    explore: {
      raw_documents: 5,
      wiki_documents: 3,
      average_word_count: 510,
    },
    default_query_results: [
      { note: "Cash discipline weakens when campaign spend rises too quickly", relevance: 0.89, theme: "cashflow" },
      { note: "Customer retention improves when WhatsApp follow-up happens within one day", relevance: 0.82, theme: "crm" },
      { note: "Regional growth works best when stock planning is locked before launch", relevance: 0.77, theme: "strategy" },
    ],
  },
};

export function demoCopilot(question: string): Record<string, string> {
  return {
    socratic: `Before acting on "${question}", test whether cash resilience and execution readiness are both genuinely strong enough.`,
    analyst: "The highest-confidence path is controlled expansion backed by collections discipline and a visible pipeline.",
    strategist: "Scale what is already compounding, and avoid turning weak evidence into a strategic commitment.",
  };
}

export function demoBrief(topic: string): string {
  return `Workforce brief for ${topic}: protect cash discipline, keep operating cadence tight, and use the Knowledge Brain to speed up high-quality management decisions.`;
}

import { WorkspacePayload } from "./types";

export const demoWorkspace: WorkspacePayload = {
  sources: {
    revenue: "sample_revenue_data.csv",
    notes: "revenue_notes.txt",
  },
  metrics: {
    total_revenue: 1285000,
    avg_discount_pct: 11.4,
    churn_revenue_exposure: 17.2,
    pricing_power_score: 67,
    expansion_readiness_score: 72,
    driver_clarity_score: 69,
    revenue_health_score: 70,
  },
  revenue_rows: [
    { segment: "Enterprise", revenue: 540000, growth_pct: 8.2 },
    { segment: "Retail", revenue: 425000, growth_pct: 5.1 },
    { segment: "Wholesale", revenue: 320000, growth_pct: 3.4 },
  ],
  pricing_rows: [
    { product: "Core Plan", avg_discount_pct: 9.5, margin_watch: "medium" },
    { product: "Premium Plan", avg_discount_pct: 14.8, margin_watch: "high" },
  ],
  driver_rows: [
    { driver: "renewals", impact: "high", note: "Retention still anchors base revenue" },
    { driver: "upsell", impact: "medium", note: "Expansion motion improving in enterprise accounts" },
  ],
  churn_rows: [
    { account_group: "mid-market", exposure_pct: 9.4, note: "sensitive to service delays" },
    { account_group: "retail chains", exposure_pct: 7.8, note: "discount pressure rising" },
  ],
  expansion_rows: [
    { motion: "enterprise upsell", readiness_score: 76, note: "best short-term upside" },
    { motion: "new channels", readiness_score: 63, note: "needs clearer economics" },
  ],
  agents: {
    pricing_optimization: "Discount pressure is manageable, but premium-plan concessions need tighter control.",
    revenue_driver: "Renewals still carry the health of the business, with upsell becoming the next meaningful lever.",
    churn_impact: "Churn exposure is concentrated enough to act on now without a full portfolio reset.",
    upsell_cross_sell: "Enterprise expansion remains the clearest near-term commercial upside.",
    revenue_copilot: {
      analyst: "Protect premium-plan pricing, defend renewals, and prioritize enterprise upsell before chasing broader channel expansion.",
      strategist: "Use pricing discipline to preserve margin while expanding only where sales confidence is strong.",
      operator: "Review churn-prone accounts weekly and keep discount approvals tighter.",
    },
  },
  executive_brief:
    "Revenue health is solid but still margin-sensitive. Leadership should tighten premium discounting, protect renewal quality, and focus the next growth cycle on enterprise expansion with clear economics.",
  knowledge_results: [
    { note: "Premium plan discounts rose after quarter-end push", relevance: 0.87, theme: "pricing discipline" },
    { note: "Enterprise renewals improve when account reviews happen earlier", relevance: 0.82, theme: "retention" },
    { note: "New channel tests remain promising but operationally noisy", relevance: 0.74, theme: "expansion" },
  ],
};

export function demoCopilot(question: string): Record<string, string> {
  return {
    analyst: `Revenue answer for "${question}": defend pricing on premium offers, stabilize renewal quality, and focus expansion where win rates are strongest.`,
    strategist: "Keep commercial growth disciplined by separating margin protection from experimental channel bets.",
    operator: "Move at-risk accounts into a tighter review cadence and constrain discretionary discounting.",
  };
}

export function demoBrief(topic: string): string {
  return `Revenue brief for ${topic}: prioritize pricing discipline, protect renewal quality, and place expansion capital behind the highest-confidence commercial motion.`;
}

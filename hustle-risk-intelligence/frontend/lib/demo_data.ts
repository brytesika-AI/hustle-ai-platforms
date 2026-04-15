import { WorkspacePayload } from "./types";

export const demoWorkspace: WorkspacePayload = {
  sources: {
    risks: "sample_risk_data.csv",
    notes: "risk_notes.txt",
  },
  metrics: {
    financial_risk_score: 68,
    operational_risk_score: 62,
    supplier_risk_score: 74,
    customer_risk_score: 57,
    compliance_risk_score: 49,
    overall_risk_score: 62,
  },
  risk_rows: [
    { category: "cashflow", status: "watch", note: "Collections lag widened this month" },
    { category: "supplier dependency", status: "high", note: "Top supplier share remains elevated" },
    { category: "operations", status: "medium", note: "Fulfilment delays rising in one branch" },
  ],
  risk_table: [
    { dimension: "Financial", score: 68 },
    { dimension: "Operational", score: 62 },
    { dimension: "Supplier", score: 74 },
    { dimension: "Customer", score: 57 },
    { dimension: "Compliance", score: 49 },
    { dimension: "Overall", score: 62 },
  ],
  supplier_rows: [
    { supplier: "Metro Inputs", concentration_pct: 44, lead_time_risk: "high" },
    { supplier: "Northern Packaging", concentration_pct: 21, lead_time_risk: "medium" },
  ],
  customer_rows: [
    { customer: "Anchor Retail Group", revenue_share_pct: 28, churn_watch: "medium" },
    { customer: "City Wholesale", revenue_share_pct: 14, churn_watch: "low" },
  ],
  agents: {
    financial_risk: "Cash resilience is still workable, but the collections lag means finance should stay on weekly watch.",
    operational_risk: "Operational risk is concentrated in fulfilment consistency rather than in a broad process breakdown.",
    supplier_risk: "Supplier dependence remains the sharpest exposure because one vendor still holds too much operational leverage.",
    customer_risk: "Customer concentration is manageable, but one anchor account still deserves leadership monitoring.",
    risk_copilot: {
      analyst: "Mitigate supplier concentration first, then reduce collections lag, then review branch fulfilment exceptions.",
      strategist: "Use the next quarter to diversify critical suppliers while tightening working-capital discipline.",
      operator: "Assign one owner per high-risk exposure and track mitigation weekly.",
    },
  },
  executive_brief:
    "Leadership should treat supplier concentration as the top exposure, keep finance on a collections watch, and resolve branch-level fulfilment inconsistency before it compounds.",
  knowledge_results: [
    { note: "Supplier renegotiation delayed twice", relevance: 0.9, theme: "supplier history" },
    { note: "Collections pressure followed two large late invoices", relevance: 0.83, theme: "financial risk" },
    { note: "Branch fulfilment delays spike when stock transfers slip", relevance: 0.76, theme: "operational risk" },
  ],
};

export function demoCopilot(question: string): Record<string, string> {
  return {
    analyst: `Risk answer for "${question}": supplier exposure is the first mitigation target, followed by collections discipline.`,
    strategist: "Preserve resilience by reducing vendor concentration before expanding major commitments.",
    operator: "Move the high-risk items into a weekly review cadence with named owners and due dates.",
  };
}

export function demoBrief(topic: string): string {
  return `Risk brief for ${topic}: prioritize supplier concentration mitigation, maintain weekly collections review, and tighten operational follow-through in the most exposed branch.`;
}

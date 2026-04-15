import { WorkspacePayload } from "./types";

export const demoWorkspace: WorkspacePayload = {
  sources: {
    inventory: "sample_inventory.csv",
    sales_history: "sample_sales_history.csv",
    suppliers: "sample_suppliers.csv",
    notes: "inventory_notes.txt",
  },
  metrics: {
    stockout_risk_score: 59,
    reorder_coverage_score: 71,
    dead_stock_score: 38,
    supplier_dependency_score: 66,
    inventory_health_score: 63,
  },
  inventory_rows: [
    { sku: "COOK-12", on_hand: 42, weekly_demand: 18, alert: "reorder soon" },
    { sku: "SOAP-08", on_hand: 210, weekly_demand: 12, alert: "slow-moving" },
    { sku: "FLOUR-25", on_hand: 66, weekly_demand: 30, alert: "healthy" },
  ],
  metric_table: [
    { dimension: "Stockout Risk", score: 59 },
    { dimension: "Reorder Coverage", score: 71 },
    { dimension: "Dead Stock", score: 38 },
    { dimension: "Supplier Dependency", score: 66 },
    { dimension: "Inventory Health", score: 63 },
  ],
  agents: {
    stock_visibility: "Most inventory is serviceable, but two fast movers need tighter reorder timing.",
    reorder_intelligence: "Reorder decisions should stay focused on the small set of products carrying most weekly demand.",
    dead_stock: "Dead stock is present but contained; clearance action is more useful than broad discounting.",
    supplier_dependency: "Inventory resilience is still too dependent on one supplier category.",
    inventory_copilot: {
      analyst: "Protect the top fast movers first, then reduce slow stock carefully, and review supplier exposure.",
      operator: "Shorten reorder review cycles on the most exposed SKUs.",
      strategist: "Use demand concentration to improve supplier negotiation leverage.",
    },
  },
  executive_brief:
    "Inventory health is steady but not relaxed. The business should tighten reorder timing on high-demand SKUs and gradually clear slow-moving stock while reducing supplier concentration risk.",
  knowledge_results: [
    { note: "Cooking oil stockouts last followed late supplier confirmation", relevance: 0.88, theme: "supplier timing" },
    { note: "Soap line discounting hurt margin without clearing enough units", relevance: 0.79, theme: "dead stock" },
    { note: "Flour demand remains the most stable category", relevance: 0.72, theme: "replenishment" },
  ],
};

export function demoCopilot(question: string): Record<string, string> {
  return {
    analyst: `Inventory answer for "${question}": protect fast movers, reduce slow stock carefully, and review supplier exposure.`,
    operator: "Run weekly replenishment checks on the highest-demand SKUs and log exceptions immediately.",
    strategist: "Use demand concentration to decide where tighter procurement discipline will produce the biggest cashflow benefit.",
  };
}

export function demoBrief(topic: string): string {
  return `Inventory brief for ${topic}: prioritize fast-mover availability, limit unnecessary working-capital lockup, and reduce dependence on single-point supplier delays.`;
}

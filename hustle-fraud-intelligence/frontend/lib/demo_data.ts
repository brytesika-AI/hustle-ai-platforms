import { WorkspacePayload } from "./types";

export const demoWorkspace: WorkspacePayload = {
  sources: {
    transactions: "sample_transactions.csv",
    suppliers: "sample_suppliers.csv",
    expenses: "sample_expenses.csv",
    notes: "investigation_notes.txt",
  },
  limits: {
    max_upload_files: 8,
    max_rows_per_dataset: 5000,
    max_investigation_requests_per_minute: 12,
  },
  cloudflare_model_policy: {
    provider: "open_source_first",
    allowed_models: ["Qwen 2.5 Instruct", "Mistral Small Instruct", "bge-m3"],
    gateway_configured: true,
    token_present: true,
  },
  metrics: {
    transaction_anomaly_score: 78,
    procurement_signal_score: 71,
    expense_signal_score: 64,
    refund_abuse_score: 69,
    overall_fraud_risk_score: 73,
  },
  metric_table: [
    { dimension: "Transaction Anomalies", score: 78 },
    { dimension: "Procurement Risk", score: 71 },
    { dimension: "Expense Irregularities", score: 64 },
    { dimension: "Refund Abuse", score: 69 },
    { dimension: "Overall Fraud Risk", score: 73 },
  ],
  transactions: [
    { transaction_id: "TX-1042", supplier: "Kopano Logistics", amount: 18450, refund_flag: 0, claim_flag: 1, risk_level: "high" },
    { transaction_id: "TX-1088", supplier: "Prime Stationery", amount: 9120, refund_flag: 1, claim_flag: 0, risk_level: "medium" },
    { transaction_id: "TX-1116", supplier: "Kopano Logistics", amount: 22300, refund_flag: 0, claim_flag: 1, risk_level: "high" },
  ],
  suppliers: [
    { supplier: "Kopano Logistics", concentration_pct: 38, invoice_variance_pct: 19, alert: "duplicate billing pattern" },
    { supplier: "Prime Stationery", concentration_pct: 12, invoice_variance_pct: 7, alert: "refund linked review" },
  ],
  expenses: [
    { expense_id: "EX-220", category: "travel", amount: 6400, approver_gap: "2 days", alert: "late approval" },
    { expense_id: "EX-231", category: "fuel", amount: 5900, approver_gap: "same day", alert: "repeat vendor spike" },
  ],
  agents: {
    transaction_risk: "Two transaction clusters carry the highest review priority because they combine repeated supplier exposure with claim-linked anomalies.",
    procurement_fraud: "Supplier concentration is amplifying procurement risk because one vendor now sits inside too many exception paths.",
    expense_review: "Expense anomalies look operational rather than systemic, but the repeat-vendor pattern deserves manager review this week.",
    refund_abuse: "Refund behaviour is concentrated in a narrow band of transactions, which makes targeted review more valuable than a broad freeze.",
    fraud_investigation_copilot: {
      analyst: "Review Kopano-linked claims first, then inspect refund-linked transactions for documentation gaps.",
      controller: "Prioritize controls around supplier approval, duplicate invoice review, and claim escalation thresholds.",
      governance: "Frame the next management review around anomaly clusters, not accusations, and log every follow-up decision.",
    },
    governance_briefing: "The governance briefing should focus on repeat supplier anomalies, approval weak points, and next-step control actions.",
  },
  safe_use_note:
    "Outputs highlight anomalies, red flags, and review priorities. They do not make legal conclusions or accuse individuals.",
  governance_brief:
    "Governance priority this week: investigate repeat supplier-linked anomalies, tighten expense approval discipline, and document refund review actions before the next leadership meeting.",
  knowledge_results: [
    { note: "Kopano invoices reviewed twice in March", relevance: 0.92, theme: "supplier anomaly" },
    { note: "Refund escalation backlog grew after policy exception", relevance: 0.84, theme: "refund abuse" },
    { note: "Claim approvals lagged during branch manager leave", relevance: 0.78, theme: "control gap" },
  ],
};

export function demoCopilot(question: string): Record<string, string> {
  return {
    analyst: `Priority review sequence for "${question}": supplier-linked claims, then refund exceptions, then delayed approvals.`,
    controller: "Use this week to isolate duplicate-pattern exposure and close the approval timing gaps around flagged expenses.",
    governance: "Report anomalies as governance risks, attach evidence, and assign owners before the next board-facing summary.",
  };
}

export function demoBrief(topic: string): string {
  return `Governance brief for ${topic}: leadership should investigate the highest-repeat anomaly clusters first, tighten supplier approval controls, and maintain a documented case trail for every flagged exception.`;
}

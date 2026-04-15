import { average, parseUploadedFile, requireColumns, toNumber, truncateRows, UploadedDataset } from "../../../shared/frontend/data/upload";
import { WorkspacePayload } from "./types";
import { demoBrief, demoCopilot, demoWorkspace } from "./demo_data";

const defaultApiBase = "http://127.0.0.1:8000";
const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const staticDemoMode = !configuredApiBase;
const requiredColumns = ["transaction_id", "date", "vendor", "amount", "risk_flag"];

export function getApiBase(): string {
  return configuredApiBase || defaultApiBase;
}

function buildLocalWorkspace(dataset: UploadedDataset): WorkspacePayload {
  requireColumns(dataset, requiredColumns);

  const amounts = dataset.rows.map((row) => toNumber(row.amount));
  const highRiskRows = dataset.rows.filter((row) => (row.risk_flag || "").toLowerCase() === "high").length;
  const claimRows = dataset.rows.filter((row) => toNumber(row.claim_flag) === 1).length;
  const refundRows = dataset.rows.filter((row) => toNumber(row.refund_flag) === 1).length;
  const groupedByVendor = new Map<string, number>();

  dataset.rows.forEach((row) => {
    const vendor = row.vendor || "Unknown Vendor";
    groupedByVendor.set(vendor, (groupedByVendor.get(vendor) || 0) + 1);
  });

  const suppliers = Array.from(groupedByVendor.entries()).map(([vendor, count]) => ({
    supplier: vendor,
    concentration_pct: Math.round((count / dataset.rows.length) * 100),
    invoice_variance_pct: Math.max(5, count * 6),
    alert: count >= 2 ? "repeat billing pattern" : "review sample"
  }));

  const transactionAnomalyScore = Math.max(35, Math.min(95, Math.round(55 + highRiskRows * 10)));
  const procurementSignalScore = Math.max(35, Math.min(95, Math.round(50 + suppliers.length * 8)));
  const expenseSignalScore = Math.max(35, Math.min(95, Math.round(48 + claimRows * 12)));
  const refundAbuseScore = Math.max(35, Math.min(95, Math.round(50 + refundRows * 12)));
  const overallFraudRiskScore = Math.round(average([transactionAnomalyScore, procurementSignalScore, expenseSignalScore, refundAbuseScore]));

  return {
    ...demoWorkspace,
    sources: {
      ...demoWorkspace.sources,
      uploaded_template: dataset.fileName
    },
    metrics: {
      transaction_anomaly_score: transactionAnomalyScore,
      procurement_signal_score: procurementSignalScore,
      expense_signal_score: expenseSignalScore,
      refund_abuse_score: refundAbuseScore,
      overall_fraud_risk_score: overallFraudRiskScore
    },
    metric_table: [
      { dimension: "Transaction Anomalies", score: transactionAnomalyScore },
      { dimension: "Procurement Risk", score: procurementSignalScore },
      { dimension: "Expense Irregularities", score: expenseSignalScore },
      { dimension: "Refund Abuse", score: refundAbuseScore },
      { dimension: "Overall Fraud Risk", score: overallFraudRiskScore }
    ],
    transactions: truncateRows(
      dataset.rows.map((row) => ({
        transaction_id: row.transaction_id,
        supplier: row.vendor,
        amount: toNumber(row.amount),
        refund_flag: toNumber(row.refund_flag),
        claim_flag: toNumber(row.claim_flag),
        risk_level: row.risk_flag
      }))
    ),
    suppliers: truncateRows(suppliers),
    expenses: truncateRows(
      dataset.rows
        .filter((row) => toNumber(row.claim_flag) === 1)
        .map((row, index) => ({
          expense_id: row.transaction_id || `EXP-${index + 1}`,
          category: "uploaded review",
          amount: toNumber(row.amount),
          approver_gap: "review needed",
          alert: "claim-linked upload"
        }))
    ),
    governance_brief: `Uploaded fraud analysis based on ${dataset.rows.length} records. High-risk rows: ${highRiskRows}. Total flagged amount reviewed: ${amounts.reduce((sum, value) => sum + value, 0).toLocaleString()}.`
  };
}

export async function validateWorkspaceFiles(files: File[]): Promise<string> {
  if (files.length === 0) return "No upload detected, so synthetic data will be used.";
  const dataset = await parseUploadedFile(files[0]);
  requireColumns(dataset, requiredColumns);
  return "The template structure looks correct.";
}

export async function fetchWorkspace(): Promise<WorkspacePayload> {
  if (staticDemoMode) return demoWorkspace;
  try {
    const response = await fetch(`${getApiBase()}/api/workspace`, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load fraud workspace.");
    return response.json();
  } catch {
    return demoWorkspace;
  }
}

export async function analyzeWorkspace(files: File[]): Promise<WorkspacePayload> {
  if (staticDemoMode) {
    const dataset = await parseUploadedFile(files[0]);
    return buildLocalWorkspace(dataset);
  }
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const response = await fetch(`${getApiBase()}/api/workspace/analyze`, { method: "POST", body });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: "Upload failed." }));
    throw new Error(payload.detail || "Upload failed.");
  }
  return response.json();
}

export async function requestCopilot(question: string, metrics: Record<string, number>): Promise<Record<string, string>> {
  if (staticDemoMode) return demoCopilot(question);
  const body = new FormData();
  body.append("question", question);
  body.append("metrics_json", JSON.stringify(metrics));
  const response = await fetch(`${getApiBase()}/api/copilot`, { method: "POST", body });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: "Copilot failed." }));
    throw new Error(payload.detail || "Copilot failed.");
  }
  const payload = await response.json();
  return payload.responses;
}

export async function queryKnowledge(q: string): Promise<Record<string, string | number>[]> {
  if (staticDemoMode) {
    return demoWorkspace.knowledge_results
      .filter((row) => JSON.stringify(row).toLowerCase().includes(q.toLowerCase()) || q.trim() === "")
      .slice(0, 5);
  }
  const response = await fetch(`${getApiBase()}/api/knowledge/query?q=${encodeURIComponent(q)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to query investigation notes.");
  const payload = await response.json();
  return payload.rows;
}

export async function generateBrief(topic: string): Promise<string> {
  if (staticDemoMode) return demoBrief(topic);
  const body = new FormData();
  body.append("topic", topic);
  const response = await fetch(`${getApiBase()}/api/knowledge/brief`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to generate governance brief.");
  const payload = await response.json();
  return payload.brief;
}

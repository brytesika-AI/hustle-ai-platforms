import { average, parseUploadedFile, requireColumns, toNumber, truncateRows, UploadedDataset } from "../../../shared/frontend/data/upload";
import { WorkspacePayload } from "./types";
import { demoBrief, demoCopilot, demoWorkspace } from "./demo_data";

const defaultApiBase = "http://127.0.0.1:8000";
const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const staticDemoMode = !configuredApiBase;
const requiredColumns = ["category", "status", "note"];

export function getApiBase(): string {
  return configuredApiBase || defaultApiBase;
}

function statusScore(status: string): number {
  const normalized = status.toLowerCase();
  if (normalized === "high") return 85;
  if (normalized === "medium" || normalized === "watch") return 62;
  return 42;
}

function buildLocalWorkspace(dataset: UploadedDataset): WorkspacePayload {
  requireColumns(dataset, requiredColumns);

  const riskRows = dataset.rows.map((row) => ({
    category: row.category,
    status: row.status,
    note: row.note
  }));

  const financialRiskScore = Math.round(average(riskRows.filter((row) => String(row.category).toLowerCase().includes("finance") || String(row.category).toLowerCase().includes("cash")).map((row) => statusScore(String(row.status)))) || 58);
  const operationalRiskScore = Math.round(average(riskRows.filter((row) => String(row.category).toLowerCase().includes("operation")).map((row) => statusScore(String(row.status)))) || 55);
  const supplierRiskScore = Math.round(average(riskRows.filter((row) => String(row.category).toLowerCase().includes("supplier")).map((row) => statusScore(String(row.status)))) || 60);
  const customerRiskScore = Math.round(average(riskRows.filter((row) => String(row.category).toLowerCase().includes("customer")).map((row) => statusScore(String(row.status)))) || 52);
  const complianceRiskScore = Math.round(average(riskRows.filter((row) => String(row.category).toLowerCase().includes("compliance")).map((row) => statusScore(String(row.status)))) || 45);
  const overallRiskScore = Math.round(average([financialRiskScore, operationalRiskScore, supplierRiskScore, customerRiskScore, complianceRiskScore]));

  return {
    ...demoWorkspace,
    sources: {
      ...demoWorkspace.sources,
      uploaded_template: dataset.fileName
    },
    metrics: {
      financial_risk_score: financialRiskScore,
      operational_risk_score: operationalRiskScore,
      supplier_risk_score: supplierRiskScore,
      customer_risk_score: customerRiskScore,
      compliance_risk_score: complianceRiskScore,
      overall_risk_score: overallRiskScore
    },
    risk_rows: truncateRows(riskRows),
    risk_table: [
      { dimension: "Financial", score: financialRiskScore },
      { dimension: "Operational", score: operationalRiskScore },
      { dimension: "Supplier", score: supplierRiskScore },
      { dimension: "Customer", score: customerRiskScore },
      { dimension: "Compliance", score: complianceRiskScore },
      { dimension: "Overall", score: overallRiskScore }
    ],
    supplier_rows: truncateRows(
      dataset.rows
        .filter((row) => String(row.category).toLowerCase().includes("supplier"))
        .map((row) => ({
          supplier: row.supplier || "Uploaded supplier",
          concentration_pct: toNumber(row.concentration_pct),
          lead_time_risk: row.status
        }))
    ),
    customer_rows: truncateRows(
      dataset.rows
        .filter((row) => String(row.category).toLowerCase().includes("customer"))
        .map((row) => ({
          customer: row.customer || "Uploaded customer",
          revenue_share_pct: toNumber(row.revenue_share_pct),
          churn_watch: row.status
        }))
    ),
    executive_brief: `Uploaded risk analysis based on ${dataset.rows.length} rows. Supplier risk is ${supplierRiskScore}, financial risk is ${financialRiskScore}, and overall risk is ${overallRiskScore}.`
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
    if (!response.ok) throw new Error("Unable to load risk workspace.");
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
  if (!response.ok) throw new Error("Unable to analyze uploaded risk files.");
  return response.json();
}

export async function requestCopilot(question: string, metrics: Record<string, number>): Promise<Record<string, string>> {
  if (staticDemoMode) return demoCopilot(question);
  const body = new FormData();
  body.append("question", question);
  body.append("metrics_json", JSON.stringify(metrics));
  const response = await fetch(`${getApiBase()}/api/copilot`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to run the risk copilot.");
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
  if (!response.ok) throw new Error("Unable to query risk notes.");
  const payload = await response.json();
  return payload.rows;
}

export async function generateBrief(topic: string): Promise<string> {
  if (staticDemoMode) return demoBrief(topic);
  const body = new FormData();
  body.append("topic", topic);
  const response = await fetch(`${getApiBase()}/api/knowledge/brief`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to generate risk brief.");
  const payload = await response.json();
  return payload.brief;
}

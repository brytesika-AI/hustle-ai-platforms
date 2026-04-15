import { average, parseUploadedFile, percent, requireColumns, toNumber, truncateRows, UploadedDataset } from "../../../shared/frontend/data/upload";
import { WorkspacePayload } from "./types";
import { demoBrief, demoCopilot, demoWorkspace } from "./demo_data";

const defaultApiBase = "http://127.0.0.1:8000";
const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const staticDemoMode = !configuredApiBase;
const requiredColumns = ["transcript_id", "transcript_text", "customer_sentiment", "issue_type"];

export function getApiBase(): string {
  return configuredApiBase || defaultApiBase;
}

function buildLocalWorkspace(dataset: UploadedDataset): WorkspacePayload {
  requireColumns(dataset, requiredColumns);

  const negativeCount = dataset.rows.filter((row) => row.customer_sentiment === "negative").length;
  const highSeverityCount = dataset.rows.filter((row) => (row.churn_signal || "").toLowerCase() === "high").length;
  const resolutionHours = dataset.rows.map((row) => toNumber(row.resolution_hours));

  const issueCounts = new Map<string, number>();
  dataset.rows.forEach((row) => {
    const key = row.issue_type || "general";
    issueCounts.set(key, (issueCounts.get(key) || 0) + 1);
  });

  const rootCauses = Array.from(issueCounts.entries()).map(([theme, volume]) => ({
    theme,
    volume,
    note: `Uploaded transcripts repeatedly referenced ${theme}.`
  }));

  return {
    ...demoWorkspace,
    sources: {
      ...demoWorkspace.sources,
      uploaded_template: dataset.fileName
    },
    metrics: {
      negative_sentiment_pct: Math.round(percent(negativeCount, dataset.rows.length)),
      high_severity_pct: Math.round(percent(highSeverityCount, dataset.rows.length)),
      avg_resolution_hours: Number(average(resolutionHours).toFixed(1)),
      churn_risk_score: Math.max(30, Math.min(95, Math.round(55 + highSeverityCount * 8))),
      product_signal_score: Math.max(30, Math.min(95, Math.round(50 + rootCauses.length * 6))),
      root_cause_coverage_score: Math.max(30, Math.min(95, Math.round(60 + rootCauses.length * 5))),
      executive_visibility_score: Math.max(30, Math.min(95, Math.round(58 + negativeCount * 4)))
    },
    transcripts: truncateRows(
      dataset.rows.map((row) => ({
        ticket: row.transcript_id,
        issue: row.issue_type,
        sentiment: row.customer_sentiment,
        severity: (row.churn_signal || "medium").toLowerCase() === "high" ? "high" : "medium",
        churn_signal: row.churn_signal || "medium"
      }))
    ),
    root_causes: truncateRows(rootCauses),
    product_signals: truncateRows(
      rootCauses.map((row) => ({
        signal: row.theme,
        impact: Number(row.volume) >= 2 ? "high" : "medium",
        note: `Customers repeatedly raised ${row.theme}.`
      }))
    ),
    executive_brief: `Uploaded CX analysis based on ${dataset.rows.length} transcripts. Negative sentiment is ${Math.round(percent(negativeCount, dataset.rows.length))}% and the clearest issue cluster is ${rootCauses[0]?.theme || "general service quality"}.`
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
    if (!response.ok) throw new Error("Unable to load CX workspace.");
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
  if (!response.ok) throw new Error("Unable to analyze uploaded transcript files.");
  return response.json();
}

export async function requestCopilot(question: string, metrics: Record<string, number>): Promise<Record<string, string>> {
  if (staticDemoMode) return demoCopilot(question);
  const body = new FormData();
  body.append("question", question);
  body.append("metrics_json", JSON.stringify(metrics));
  const response = await fetch(`${getApiBase()}/api/copilot`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to run the CX copilot.");
  const payload = await response.json();
  return payload.responses;
}

export async function queryKnowledge(q: string): Promise<Record<string, string | number>[]> {
  if (staticDemoMode) {
    return demoWorkspace.knowledge.query_results
      .filter((row) => JSON.stringify(row).toLowerCase().includes(q.toLowerCase()) || q.trim() === "")
      .slice(0, 5);
  }
  const response = await fetch(`${getApiBase()}/api/knowledge/query?q=${encodeURIComponent(q)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to query CX notes.");
  const payload = await response.json();
  return payload.rows;
}

export async function generateBrief(topic: string): Promise<string> {
  if (staticDemoMode) return demoBrief(topic);
  const body = new FormData();
  body.append("topic", topic);
  const response = await fetch(`${getApiBase()}/api/knowledge/brief`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to generate the CX briefing.");
  const payload = await response.json();
  return payload.brief;
}

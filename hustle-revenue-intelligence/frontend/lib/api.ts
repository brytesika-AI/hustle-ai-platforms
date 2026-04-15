import { average, parseUploadedFile, percent, requireColumns, toNumber, truncateRows, UploadedDataset } from "../../../shared/frontend/data/upload";
import { WorkspacePayload } from "./types";
import { demoBrief, demoCopilot, demoWorkspace } from "./demo_data";

const defaultApiBase = "http://127.0.0.1:8000";
const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const staticDemoMode = !configuredApiBase;
const requiredColumns = ["product", "price", "discount", "revenue", "customer_segment"];

export function getApiBase(): string {
  return configuredApiBase || defaultApiBase;
}

function buildLocalWorkspace(dataset: UploadedDataset): WorkspacePayload {
  requireColumns(dataset, requiredColumns);

  const revenues = dataset.rows.map((row) => toNumber(row.revenue));
  const discounts = dataset.rows.map((row) => toNumber(row.discount));
  const totalRevenue = revenues.reduce((sum, value) => sum + value, 0);
  const avgDiscount = average(discounts);
  const highDiscountRows = dataset.rows.filter((row) => toNumber(row.discount) >= 10).length;

  return {
    ...demoWorkspace,
    sources: {
      ...demoWorkspace.sources,
      uploaded_template: dataset.fileName
    },
    metrics: {
      total_revenue: totalRevenue,
      avg_discount_pct: Number(avgDiscount.toFixed(1)),
      churn_revenue_exposure: Number(percent(highDiscountRows, dataset.rows.length).toFixed(1)),
      pricing_power_score: Math.max(35, Math.min(95, Math.round(82 - avgDiscount))),
      expansion_readiness_score: Math.max(35, Math.min(95, Math.round(58 + dataset.rows.length * 4))),
      driver_clarity_score: Math.max(35, Math.min(95, Math.round(60 + new Set(dataset.rows.map((row) => row.channel || "direct")).size * 5))),
      revenue_health_score: Math.max(35, Math.min(95, Math.round(70 - avgDiscount / 2 + dataset.rows.length * 2)))
    },
    revenue_rows: truncateRows(
      dataset.rows.map((row) => ({
        segment: row.customer_segment,
        revenue: toNumber(row.revenue),
        growth_pct: Math.max(2, Math.round(14 - toNumber(row.discount) / 2))
      }))
    ),
    pricing_rows: truncateRows(
      dataset.rows.map((row) => ({
        product: row.product,
        avg_discount_pct: toNumber(row.discount),
        margin_watch: toNumber(row.discount) >= 10 ? "high" : "medium"
      }))
    ),
    driver_rows: truncateRows(
      dataset.rows.map((row) => ({
        driver: row.channel || row.customer_segment,
        impact: toNumber(row.revenue) >= average(revenues) ? "high" : "medium",
        note: `${row.product} is contributing through ${row.channel || "direct demand"}.`
      }))
    ),
    churn_rows: truncateRows(
      dataset.rows.map((row) => ({
        account_group: row.customer_segment,
        exposure_pct: Number(percent(toNumber(row.revenue), totalRevenue).toFixed(1)),
        note: toNumber(row.discount) >= 10 ? "discount pressure rising" : "commercial posture stable"
      }))
    ),
    expansion_rows: truncateRows(
      dataset.rows.map((row) => ({
        motion: `${row.product} expansion`,
        readiness_score: Math.max(45, Math.min(95, Math.round(85 - toNumber(row.discount)))),
        note: `Channel: ${row.channel || "direct"}`
      }))
    ),
    executive_brief: `Uploaded revenue analysis based on ${dataset.rows.length} rows. Total revenue is ${totalRevenue.toLocaleString()} and average discount pressure is ${avgDiscount.toFixed(1)}%.`
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
    if (!response.ok) throw new Error("Unable to load revenue workspace.");
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
  if (!response.ok) throw new Error("Unable to analyze uploaded revenue files.");
  return response.json();
}

export async function requestCopilot(question: string, metrics: Record<string, number>): Promise<Record<string, string>> {
  if (staticDemoMode) return demoCopilot(question);
  const body = new FormData();
  body.append("question", question);
  body.append("metrics_json", JSON.stringify(metrics));
  const response = await fetch(`${getApiBase()}/api/copilot`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to run the revenue copilot.");
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
  if (!response.ok) throw new Error("Unable to query revenue notes.");
  const payload = await response.json();
  return payload.rows;
}

export async function generateBrief(topic: string): Promise<string> {
  if (staticDemoMode) return demoBrief(topic);
  const body = new FormData();
  body.append("topic", topic);
  const response = await fetch(`${getApiBase()}/api/knowledge/brief`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to generate the revenue briefing.");
  const payload = await response.json();
  return payload.brief;
}

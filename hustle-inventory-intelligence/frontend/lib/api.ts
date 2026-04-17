import { average, parseUploadedFile, requireColumns, toNumber, truncateRows, UploadedDataset } from "../../../shared/frontend/data/upload";
import { WorkspacePayload } from "./types";
import { demoBrief, demoCopilot, demoWorkspace } from "./demo_data";

const defaultApiBase = "http://127.0.0.1:8000";
const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const staticDemoMode = !configuredApiBase;
const requiredColumns = ["sku", "on_hand", "weekly_demand", "reorder_point", "supplier_name"];

export function getApiBase(): string {
  return configuredApiBase || defaultApiBase;
}

function buildLocalWorkspace(dataset: UploadedDataset): WorkspacePayload {
  requireColumns(dataset, requiredColumns);

  const inventoryRows = dataset.rows.map((row) => {
    const onHand = toNumber(row.on_hand);
    const weeklyDemand = toNumber(row.weekly_demand);
    const reorderPoint = toNumber(row.reorder_point);
    return {
      sku: row.sku,
      stock_on_hand: onHand,
      weekly_demand: weeklyDemand,
      reorder_point: reorderPoint,
      dead_stock_days: toNumber(row.dead_stock_days),
      supplier_name: row.supplier_name,
      dependency_pct: toNumber(row.dependency_pct),
      avg_delay_days: toNumber(row.avg_delay_days),
      category: row.category || "general"
    };
  });

  const stockoutRiskScore = Math.max(35, Math.min(95, Math.round(50 + inventoryRows.filter((row) => Number(row.stock_on_hand) < Number(row.reorder_point)).length * 8)));
  const reorderCoverageScore = Math.max(35, Math.min(95, Math.round(55 + average(inventoryRows.map((row) => Number(row.stock_on_hand) / Math.max(Number(row.weekly_demand), 1))) * 4)));
  const deadStockScore = Math.max(20, Math.min(95, Math.round(average(inventoryRows.map((row) => Number(row.dead_stock_days))) / 1.5)));
  const supplierDependencyScore = Math.max(35, Math.min(95, Math.round(average(inventoryRows.map((row) => Number(row.dependency_pct))))));
  const inventoryHealthScore = Math.round(average([stockoutRiskScore, reorderCoverageScore, 100 - deadStockScore, 100 - supplierDependencyScore]));

  return {
    ...demoWorkspace,
    sources: {
      ...demoWorkspace.sources,
      uploaded_template: dataset.fileName
    },
    metrics: {
      stockout_risk_score: stockoutRiskScore,
      reorder_coverage_score: reorderCoverageScore,
      dead_stock_score: deadStockScore,
      supplier_dependency_score: supplierDependencyScore,
      inventory_health_score: inventoryHealthScore
    },
    inventory_rows: truncateRows(inventoryRows),
    metric_table: [
      { dimension: "Stockout Risk", score: stockoutRiskScore },
      { dimension: "Reorder Coverage", score: reorderCoverageScore },
      { dimension: "Dead Stock", score: deadStockScore },
      { dimension: "Supplier Dependency", score: supplierDependencyScore },
      { dimension: "Inventory Health", score: inventoryHealthScore }
    ],
    executive_brief: `Uploaded inventory analysis based on ${dataset.rows.length} rows. Stockout pressure is ${stockoutRiskScore}, supplier dependency is ${supplierDependencyScore}, and inventory health is ${inventoryHealthScore}.`
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
    if (!response.ok) throw new Error("Unable to load inventory workspace.");
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
  if (!response.ok) throw new Error("Unable to analyze uploaded inventory files.");
  return response.json();
}

export async function requestCopilot(question: string, metrics: Record<string, number>): Promise<Record<string, string>> {
  if (staticDemoMode) return demoCopilot(question);
  const body = new FormData();
  body.append("question", question);
  body.append("metrics_json", JSON.stringify(metrics));
  const response = await fetch(`${getApiBase()}/api/copilot`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to run the inventory copilot.");
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
  if (!response.ok) throw new Error("Unable to query inventory notes.");
  const payload = await response.json();
  return payload.rows;
}

export async function generateBrief(topic: string): Promise<string> {
  if (staticDemoMode) return demoBrief(topic);
  const body = new FormData();
  body.append("topic", topic);
  const response = await fetch(`${getApiBase()}/api/knowledge/brief`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to generate inventory brief.");
  const payload = await response.json();
  return payload.brief;
}

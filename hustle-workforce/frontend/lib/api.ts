import { average, parseUploadedFile, percent, requireColumns, toNumber, truncateRows, UploadedDataset } from "../../../shared/frontend/data/upload";
import { WorkspacePayload } from "./types";
import { demoBrief, demoCopilot, demoWorkspace } from "./demo_data";

const defaultApiBase = "http://127.0.0.1:8000";
const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const staticDemoMode = !configuredApiBase;
const requiredColumns = ["area", "source", "text", "transactions", "inventory", "crm"];

export function getApiBase(): string {
  return configuredApiBase || defaultApiBase;
}

function buildLocalWorkspace(dataset: UploadedDataset): WorkspacePayload {
  requireColumns(dataset, requiredColumns);

  const financeRows = dataset.rows.filter((row) => row.area === "finance");
  const operationsRows = dataset.rows.filter((row) => row.area === "operations");
  const salesRows = dataset.rows.filter((row) => row.area === "sales");
  const strategyRows = dataset.rows.filter((row) => row.area === "strategy");
  const growthRows = dataset.rows.filter((row) => row.area === "growth");
  const knowledgeRows = dataset.rows.map((row, index) => ({
    note: row.text || `Imported knowledge note ${index + 1}`,
    relevance: Number((0.72 + index * 0.05).toFixed(2)),
    theme: row.area || "workspace"
  }));

  const financeTransactions = financeRows.map((row) => toNumber(row.transactions));
  const inventoryUnits = operationsRows.map((row) => toNumber(row.inventory));
  const crmSignals = salesRows.map((row) => toNumber(row.crm));
  const growthSignals = growthRows.map((row) => toNumber(row.crm || row.transactions));

  const financialRisk = Math.max(35, Math.min(95, Math.round(average(financeTransactions) / 25000)));
  const inventoryRisk = Math.max(35, Math.min(95, Math.round(average(inventoryUnits) / 4)));
  const salesPipelineHealth = Math.max(35, Math.min(95, Math.round(average(crmSignals) + 20)));
  const growthActivity = Math.max(35, Math.min(95, Math.round(average(growthSignals) + 25)));
  const knowledgeMaturity = Math.max(35, Math.min(95, Math.round(55 + knowledgeRows.length * 4)));
  const overallHealthScore = Math.round(average([financialRisk, inventoryRisk, salesPipelineHealth, growthActivity, knowledgeMaturity]));

  return {
    ...demoWorkspace,
    sources: {
      ...demoWorkspace.sources,
      uploaded_template: dataset.fileName
    },
    sections: {
      finance: truncateRows(
        financeRows.map((row) => ({
          metric: row.source || "Finance upload",
          value: toNumber(row.transactions),
          status: toNumber(row.transactions) > 0 ? "uploaded" : "watch"
        }))
      ),
      operations: truncateRows(
        operationsRows.map((row) => ({
          metric: row.source || "Operations upload",
          value: toNumber(row.inventory),
          status: toNumber(row.inventory) > 0 ? "uploaded" : "watch"
        }))
      ),
      sales: truncateRows(
        salesRows.map((row) => ({
          metric: row.source || "Sales upload",
          value: toNumber(row.transactions),
          status: toNumber(row.crm) > 0 ? "healthy" : "watch"
        }))
      ),
      crm: truncateRows(
        salesRows.map((row) => ({
          channel: row.source || "CRM upload",
          active_threads: toNumber(row.crm),
          conversion_signal: toNumber(row.crm) >= 50 ? "high" : "medium"
        }))
      ),
      strategy: truncateRows(
        strategyRows.map((row) => ({
          priority: row.source || "Strategy upload",
          stage: "uploaded",
          owner: "Leadership"
        }))
      ),
      growth: truncateRows(
        growthRows.map((row) => ({
          campaign: row.source || "Growth upload",
          roi_score: Math.max(40, Math.min(95, Math.round(toNumber(row.crm) + 20))),
          status: "uploaded"
        }))
      )
    },
    health_scores: {
      financial_risk: financialRisk,
      inventory_risk: inventoryRisk,
      sales_pipeline_health: salesPipelineHealth,
      growth_activity: growthActivity,
      knowledge_maturity: knowledgeMaturity,
      overall_health_score: overallHealthScore
    },
    health_table: [
      { dimension: "Financial", score: financialRisk },
      { dimension: "Inventory", score: inventoryRisk },
      { dimension: "Sales Pipeline", score: salesPipelineHealth },
      { dimension: "Growth", score: growthActivity },
      { dimension: "Knowledge Maturity", score: knowledgeMaturity }
    ],
    executive_brief: `Uploaded workforce analysis based on ${dataset.rows.length} rows. The strongest signals point to finance health ${financialRisk}, inventory control ${inventoryRisk}, and sales readiness ${salesPipelineHealth}.`,
    knowledge: {
      explore: {
        raw_documents: dataset.rows.length,
        wiki_documents: Math.max(1, Math.round(dataset.rows.length / 2)),
        average_word_count: Math.round(average(dataset.rows.map((row) => (row.text || "").split(/\s+/).filter(Boolean).length)))
      },
      default_query_results: knowledgeRows
    }
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
    if (!response.ok) {
      throw new Error("Unable to load workspace data.");
    }
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
  const response = await fetch(`${getApiBase()}/api/workspace/analyze`, {
    method: "POST",
    body
  });
  if (!response.ok) {
    throw new Error("Unable to analyze uploaded files.");
  }
  return response.json();
}

export async function queryKnowledge(q: string): Promise<Record<string, string | number>[]> {
  if (staticDemoMode) {
    return demoWorkspace.knowledge.default_query_results
      .filter((row) => JSON.stringify(row).toLowerCase().includes(q.toLowerCase()) || q.trim() === "")
      .slice(0, 5);
  }
  const response = await fetch(`${getApiBase()}/api/knowledge/query?q=${encodeURIComponent(q)}`, {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error("Unable to query the knowledge brain.");
  }
  const payload = await response.json();
  return payload.rows;
}

export async function generateBrief(topic: string): Promise<string> {
  if (staticDemoMode) return demoBrief(topic);
  const body = new FormData();
  body.append("topic", topic);
  const response = await fetch(`${getApiBase()}/api/knowledge/brief`, {
    method: "POST",
    body
  });
  if (!response.ok) {
    throw new Error("Unable to generate the brief.");
  }
  const payload = await response.json();
  return payload.brief;
}

export async function requestDecisionCopilot(question: string, scores: Record<string, number>): Promise<Record<string, string>> {
  if (staticDemoMode) return demoCopilot(question);
  const body = new FormData();
  body.append("question", question);
  body.append("scores_json", JSON.stringify(scores));
  const response = await fetch(`${getApiBase()}/api/decision-copilot`, {
    method: "POST",
    body
  });
  if (!response.ok) {
    throw new Error("Unable to run the decision copilot.");
  }
  const payload = await response.json();
  return payload.responses;
}

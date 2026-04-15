import { WorkspacePayload } from "./types";

const defaultApiBase = "http://127.0.0.1:8000";

export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || defaultApiBase;
}

export async function fetchWorkspace(): Promise<WorkspacePayload> {
  const response = await fetch(`${getApiBase()}/api/workspace`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load revenue workspace.");
  return response.json();
}

export async function analyzeWorkspace(files: File[]): Promise<WorkspacePayload> {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const response = await fetch(`${getApiBase()}/api/workspace/analyze`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to analyze uploaded revenue files.");
  return response.json();
}

export async function requestCopilot(question: string, metrics: Record<string, number>): Promise<Record<string, string>> {
  const body = new FormData();
  body.append("question", question);
  body.append("metrics_json", JSON.stringify(metrics));
  const response = await fetch(`${getApiBase()}/api/copilot`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to run the revenue copilot.");
  const payload = await response.json();
  return payload.responses;
}

export async function queryKnowledge(q: string): Promise<Record<string, string | number>[]> {
  const response = await fetch(`${getApiBase()}/api/knowledge/query?q=${encodeURIComponent(q)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to query revenue notes.");
  const payload = await response.json();
  return payload.rows;
}

export async function generateBrief(topic: string): Promise<string> {
  const body = new FormData();
  body.append("topic", topic);
  const response = await fetch(`${getApiBase()}/api/knowledge/brief`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to generate the revenue briefing.");
  const payload = await response.json();
  return payload.brief;
}

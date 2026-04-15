import { WorkspacePayload } from "./types";
import { demoBrief, demoCopilot, demoWorkspace } from "./demo_data";

const defaultApiBase = "http://127.0.0.1:8000";
const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

export function getApiBase(): string {
  return configuredApiBase || defaultApiBase;
}

function useStaticDemo(): boolean {
  return !configuredApiBase && typeof window !== "undefined" && window.location.hostname.endsWith(".pages.dev");
}

export async function fetchWorkspace(): Promise<WorkspacePayload> {
  if (useStaticDemo()) return demoWorkspace;
  try {
    const response = await fetch(`${getApiBase()}/api/workspace`, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load risk workspace.");
    return response.json();
  } catch {
    return demoWorkspace;
  }
}

export async function analyzeWorkspace(files: File[]): Promise<WorkspacePayload> {
  if (useStaticDemo()) return demoWorkspace;
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const response = await fetch(`${getApiBase()}/api/workspace/analyze`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to analyze uploaded risk files.");
  return response.json();
}

export async function requestCopilot(question: string, metrics: Record<string, number>): Promise<Record<string, string>> {
  if (useStaticDemo()) return demoCopilot(question);
  const body = new FormData();
  body.append("question", question);
  body.append("metrics_json", JSON.stringify(metrics));
  const response = await fetch(`${getApiBase()}/api/copilot`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to run the risk copilot.");
  const payload = await response.json();
  return payload.responses;
}

export async function queryKnowledge(q: string): Promise<Record<string, string | number>[]> {
  if (useStaticDemo()) {
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
  if (useStaticDemo()) return demoBrief(topic);
  const body = new FormData();
  body.append("topic", topic);
  const response = await fetch(`${getApiBase()}/api/knowledge/brief`, { method: "POST", body });
  if (!response.ok) throw new Error("Unable to generate risk brief.");
  const payload = await response.json();
  return payload.brief;
}

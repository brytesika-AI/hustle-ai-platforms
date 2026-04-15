"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { BarChart } from "../components/BarChart";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { SectionPanel } from "../components/SectionPanel";
import { analyzeWorkspace, fetchWorkspace, generateBrief, queryKnowledge, requestCopilot } from "../lib/api";
import { WorkspacePayload } from "../lib/types";

const sectionNames = [
  "Executive Inventory Overview",
  "Stock Visibility",
  "Reorder Intelligence",
  "Dead Stock & Slow-Moving Items",
  "Supplier Dependency View",
  "Inventory Decision Copilot",
  "About"
] as const;

type SectionName = (typeof sectionNames)[number];

export default function HomePage() {
  const [section, setSection] = useState<SectionName>("Executive Inventory Overview");
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [status, setStatus] = useState("Loading synthetic inventory workspace...");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("stock reorder supplier dead stock");
  const [knowledgeRows, setKnowledgeRows] = useState<Record<string, string | number>[]>([]);
  const [briefTopic, setBriefTopic] = useState("Inventory review priorities");
  const [brief, setBrief] = useState("");
  const [question, setQuestion] = useState("Which inventory issue deserves leadership action first this month?");
  const [copilotResponses, setCopilotResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWorkspace()
      .then((payload) => {
        setWorkspace(payload);
        setKnowledgeRows(payload.knowledge_results);
        setBrief(payload.executive_brief);
        setCopilotResponses(payload.agents.inventory_copilot);
        setStatus("Synthetic inventory workspace loaded.");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("Unable to load inventory workspace.");
      });
  }, []);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setStatus("Analyzing uploaded inventory files...");
    try {
      const payload = await analyzeWorkspace(files);
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge_results);
      setBrief(payload.executive_brief);
      setCopilotResponses(payload.agents.inventory_copilot);
      setStatus("Uploaded inventory files processed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  async function runKnowledgeQuery() {
    try {
      setKnowledgeRows(await queryKnowledge(query));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Knowledge query failed.");
    }
  }

  async function runBrief() {
    try {
      setBrief(await generateBrief(briefTopic));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Brief generation failed.");
    }
  }

  async function runCopilot() {
    if (!workspace) return;
    try {
      setCopilotResponses(await requestCopilot(question, workspace.metrics));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Copilot failed.");
    }
  }

  if (!workspace) {
    return (
      <main className="main-grid">
        <div className="panel" style={{ gridColumn: "1 / -1" }}>
          <h2 className="section-title">Preparing Hustle Inventory Intelligence</h2>
          <p className="section-subtitle">{status}</p>
          {error ? <p>{error}</p> : null}
        </div>
      </main>
    );
  }

  const slowMoving = workspace.inventory_rows.filter((row) => Number(row.dead_stock_days) > 20);
  const lowCover = workspace.inventory_rows.filter((row) => Number(row.stock_on_hand) < Number(row.reorder_point));
  const supplierRows = workspace.inventory_rows
    .map((row) => ({
      sku: row.sku,
      supplier_name: row.supplier_name,
      dependency_pct: row.dependency_pct,
      avg_delay_days: row.avg_delay_days,
      category: row.category
    }))
    .sort((a, b) => Number(b.dependency_pct) - Number(a.dependency_pct));

  return (
    <main className="main-grid">
      <aside className="nav-panel">
        <div className="stack">
          <div>
            <strong>Sections</strong>
            <div className="nav-list" style={{ marginTop: 12 }}>
              {sectionNames.map((name) => (
                <button key={name} className={`nav-button ${section === name ? "active" : ""}`} onClick={() => setSection(name)}>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="upload-panel">
            <h3 style={{ marginTop: 0 }}>Inventory Inputs</h3>
            <p className="muted">Upload inventory, sales history, supplier CSVs, or text notes. Synthetic sample data is available by default.</p>
            <input className="file-input" type="file" multiple onChange={onFileChange} />
            <p className="muted" style={{ marginBottom: 0 }}>{status}</p>
          </div>
        </div>
      </aside>

      <div className="content">
        {section === "Executive Inventory Overview" ? (
          <>
            <section className="panel">
              <h2 className="section-title">Executive Inventory Overview</h2>
              <p className="section-subtitle">Leadership visibility into stock availability, reorder timing, dead stock, and supplier dependency.</p>
            </section>
            <div className="metrics-grid">
              <MetricCard label="Inventory Health" value={workspace.metrics.inventory_health_score} />
              <MetricCard label="Stockout Risk" value={workspace.metrics.stockout_risk_score} />
              <MetricCard label="Reorder Coverage" value={workspace.metrics.reorder_coverage_score} />
            </div>
            <BarChart title="Inventory Risk and Health" rows={workspace.metric_table} />
            <div className="code-block"><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre></div>
          </>
        ) : null}

        {section === "Stock Visibility" ? (
          <SectionPanel title="Stock Visibility" subtitle="Current stock position, daily demand, margin, and cover.">
            <DataTable title="Inventory Register" rows={workspace.inventory_rows} />
            <div className="callout"><h3>Stock Visibility Agent</h3><p>{workspace.agents.stock_visibility}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Reorder Intelligence" ? (
          <SectionPanel title="Reorder Intelligence" subtitle="Identify where replenishment should move before service quality degrades.">
            <DataTable title="Reorder Priorities" rows={lowCover} />
            <div className="callout"><h3>Reorder Intelligence Agent</h3><p>{workspace.agents.reorder_intelligence}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Dead Stock & Slow-Moving Items" ? (
          <SectionPanel title="Dead Stock & Slow-Moving Items" subtitle="Reduce working-capital drag from slower-moving inventory.">
            <DataTable title="Slow-Moving Inventory" rows={slowMoving} />
            <div className="callout"><h3>Dead Stock Agent</h3><p>{workspace.agents.dead_stock}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Supplier Dependency View" ? (
          <SectionPanel title="Supplier Dependency View" subtitle="See inventory exposure created by concentration and delay risk.">
            <DataTable title="Supplier Dependency" rows={supplierRows} />
            <div className="callout"><h3>Supplier Dependency Agent</h3><p>{workspace.agents.supplier_dependency}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Inventory Decision Copilot" ? (
          <SectionPanel title="Inventory Decision Copilot" subtitle="Stress-test inventory decisions before they create stock or working-capital problems.">
            <div>
              <label htmlFor="inventory-question">Inventory question</label>
              <textarea id="inventory-question" className="textarea" value={question} onChange={(event) => setQuestion(event.target.value)} />
              <div className="button-row" style={{ marginTop: 12 }}>
                <button className="button" onClick={runCopilot}>Run Inventory Copilot</button>
              </div>
            </div>
            {Object.entries(copilotResponses).map(([agent, response]) => (
              <div className="callout" key={agent}><h3>{agent}</h3><p>{response}</p></div>
            ))}
            <div className="upload-grid">
              <div className="panel">
                <label htmlFor="inventory-query">Inventory notes query</label>
                <input id="inventory-query" className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
                <div className="button-row" style={{ marginTop: 12 }}>
                  <button className="button" onClick={runKnowledgeQuery}>Run Query</button>
                </div>
              </div>
              <div className="panel">
                <label htmlFor="brief-topic">Brief topic</label>
                <input id="brief-topic" className="input" value={briefTopic} onChange={(event) => setBriefTopic(event.target.value)} />
                <div className="button-row" style={{ marginTop: 12 }}>
                  <button className="button" onClick={runBrief}>Generate Brief</button>
                </div>
              </div>
            </div>
            <DataTable title="Inventory Notes" rows={knowledgeRows} />
          </SectionPanel>
        ) : null}

        {section === "About" ? (
          <SectionPanel title="About" subtitle="Executive-grade inventory intelligence for African businesses.">
            <div className="callout">
              <h3>Platform Scope</h3>
              <p>
                Hustle Inventory Intelligence helps leadership teams reduce stockouts, improve replenishment timing, surface supplier dependency, and cut slow-moving inventory drag.
              </p>
            </div>
            <DataTable title="Workspace Sources" rows={Object.entries(workspace.sources).map(([area, source]) => ({ area, source }))} />
          </SectionPanel>
        ) : null}

        {error ? <div className="callout"><h3>Notice</h3><p>{error}</p></div> : null}
      </div>
    </main>
  );
}

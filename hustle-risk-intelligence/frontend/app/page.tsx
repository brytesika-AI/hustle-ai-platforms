"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { BarChart } from "../components/BarChart";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { SectionPanel } from "../components/SectionPanel";
import { analyzeWorkspace, fetchWorkspace, generateBrief, queryKnowledge, requestCopilot } from "../lib/api";
import { WorkspacePayload } from "../lib/types";

const sectionNames = [
  "Executive Risk Overview",
  "Financial Risk Monitoring",
  "Operational Risk Monitoring",
  "Supplier & Dependency Risk",
  "Customer Concentration Risk",
  "Risk Scenario Copilot",
  "About"
] as const;

type SectionName = (typeof sectionNames)[number];

export default function HomePage() {
  const [section, setSection] = useState<SectionName>("Executive Risk Overview");
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [status, setStatus] = useState("Loading synthetic risk workspace...");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("cash dependency concentration compliance");
  const [knowledgeRows, setKnowledgeRows] = useState<Record<string, string | number>[]>([]);
  const [briefTopic, setBriefTopic] = useState("Risk committee priorities");
  const [brief, setBrief] = useState("");
  const [question, setQuestion] = useState("Which risk cluster should leadership mitigate first this quarter?");
  const [copilotResponses, setCopilotResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWorkspace()
      .then((payload) => {
        setWorkspace(payload);
        setKnowledgeRows(payload.knowledge_results);
        setBrief(payload.executive_brief);
        setCopilotResponses(payload.agents.risk_copilot);
        setStatus("Synthetic risk workspace loaded.");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("Unable to load risk workspace.");
      });
  }, []);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setStatus("Analyzing uploaded risk files...");
    setError("");
    try {
      const payload = await analyzeWorkspace(files);
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge_results);
      setBrief(payload.executive_brief);
      setCopilotResponses(payload.agents.risk_copilot);
      setStatus("Uploaded risk files processed.");
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
          <h2 className="section-title">Preparing Hustle Risk Intelligence</h2>
          <p className="section-subtitle">{status}</p>
          {error ? <p>{error}</p> : null}
        </div>
      </main>
    );
  }

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
            <h3 style={{ marginTop: 0 }}>Risk Inputs</h3>
            <p className="muted">Upload CSV or text risk notes, or continue with synthetic fallback data.</p>
            <input className="file-input" type="file" multiple onChange={onFileChange} />
            <p className="muted" style={{ marginBottom: 0 }}>{status}</p>
          </div>
        </div>
      </aside>

      <div className="content">
        {section === "Executive Risk Overview" ? (
          <>
            <section className="panel">
              <h2 className="section-title">Executive Risk Overview</h2>
              <p className="section-subtitle">Leadership visibility across financial, operational, supplier, customer, and compliance exposures.</p>
            </section>
            <div className="metrics-grid">
              <MetricCard label="Overall Risk Score" value={workspace.metrics.overall_risk_score} />
              <MetricCard label="Financial Risk" value={workspace.metrics.financial_risk_score} />
              <MetricCard label="Supplier Risk" value={workspace.metrics.supplier_risk_score} />
            </div>
            <BarChart title="Risk Exposure Overview" rows={workspace.risk_table} />
            <div className="code-block"><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre></div>
          </>
        ) : null}

        {section === "Financial Risk Monitoring" ? (
          <SectionPanel title="Financial Risk Monitoring" subtitle="Cash-cover strain, receivables pressure, and downside exposure.">
            <DataTable title="Risk Register" rows={workspace.risk_rows} />
            <div className="callout"><h3>Financial Risk Agent</h3><p>{workspace.agents.financial_risk}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Operational Risk Monitoring" ? (
          <SectionPanel title="Operational Risk Monitoring" subtitle="Execution, service delivery, and process slippage visibility.">
            <DataTable title="Operational View" rows={workspace.risk_rows.filter((row) => String(row.category).toLowerCase() === "operations")} />
            <div className="callout"><h3>Operational Risk Agent</h3><p>{workspace.agents.operational_risk}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Supplier & Dependency Risk" ? (
          <SectionPanel title="Supplier & Dependency Risk" subtitle="Dependency concentration and supply-side resilience.">
            <DataTable title="Supplier Exposure" rows={workspace.supplier_rows} />
            <div className="callout"><h3>Supplier Risk Agent</h3><p>{workspace.agents.supplier_risk}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Customer Concentration Risk" ? (
          <SectionPanel title="Customer Concentration Risk" subtitle="Revenue dependence on narrow customer sets.">
            <DataTable title="Customer Exposure" rows={workspace.customer_rows} />
            <div className="callout"><h3>Customer Risk Agent</h3><p>{workspace.agents.customer_risk}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Risk Scenario Copilot" ? (
          <SectionPanel title="Risk Scenario Copilot" subtitle="Stress-test management decisions before risk compounds.">
            <div>
              <label htmlFor="risk-question">Scenario question</label>
              <textarea id="risk-question" className="textarea" value={question} onChange={(event) => setQuestion(event.target.value)} />
              <div className="button-row" style={{ marginTop: 12 }}>
                <button className="button" onClick={runCopilot}>Run Risk Copilot</button>
              </div>
            </div>
            {Object.entries(copilotResponses).map(([agent, response]) => (
              <div className="callout" key={agent}><h3>{agent}</h3><p>{response}</p></div>
            ))}
            <div className="upload-grid">
              <div className="panel">
                <label htmlFor="risk-query">Risk notes query</label>
                <input id="risk-query" className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
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
            <DataTable title="Risk Notes" rows={knowledgeRows} />
          </SectionPanel>
        ) : null}

        {section === "About" ? (
          <SectionPanel title="About" subtitle="Executive-grade risk visibility for African businesses.">
            <div className="callout">
              <h3>Platform Scope</h3>
              <p>
                Hustle Risk Intelligence helps leadership teams see overlapping financial, operational, supplier, customer, and compliance exposures before they become more expensive problems.
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

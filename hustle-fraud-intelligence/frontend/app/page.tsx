"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { BarChart } from "../components/BarChart";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { SectionPanel } from "../components/SectionPanel";
import { analyzeWorkspace, fetchWorkspace, generateBrief, queryKnowledge, requestCopilot } from "../lib/api";
import { WorkspacePayload } from "../lib/types";

const sectionNames = [
  "Executive Fraud & Risk Overview",
  "Transaction Anomaly Detection",
  "Procurement & Supplier Fraud Signals",
  "Expense & Claims Review",
  "Refund & Customer Abuse Monitoring",
  "Fraud Investigation Copilot",
  "Governance Briefing",
  "About"
] as const;

type SectionName = (typeof sectionNames)[number];

export default function HomePage() {
  const [section, setSection] = useState<SectionName>("Executive Fraud & Risk Overview");
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [status, setStatus] = useState("Loading synthetic fraud workspace...");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("anomalies supplier claims refunds governance");
  const [knowledgeRows, setKnowledgeRows] = useState<Record<string, string | number>[]>([]);
  const [briefTopic, setBriefTopic] = useState("Governance review priorities");
  const [brief, setBrief] = useState("");
  const [question, setQuestion] = useState("Which anomalies should the business review first this week?");
  const [copilotResponses, setCopilotResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWorkspace()
      .then((payload) => {
        setWorkspace(payload);
        setKnowledgeRows(payload.knowledge_results);
        setBrief(payload.governance_brief);
        setCopilotResponses(payload.agents.fraud_investigation_copilot);
        setStatus("Synthetic fraud workspace loaded.");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("Unable to load fraud workspace.");
      });
  }, []);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setStatus("Analyzing uploaded fraud files...");
    try {
      const payload = await analyzeWorkspace(files);
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge_results);
      setBrief(payload.governance_brief);
      setCopilotResponses(payload.agents.fraud_investigation_copilot);
      setStatus("Uploaded fraud files processed.");
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
          <h2 className="section-title">Preparing Hustle Fraud Intelligence</h2>
          <p className="section-subtitle">{status}</p>
          {error ? <p>{error}</p> : null}
        </div>
      </main>
    );
  }

  const refunds = workspace.transactions.filter((row) => Number(row.refund_flag) === 1);
  const claimsAndExpenses = [...workspace.expenses, ...workspace.transactions.filter((row) => Number(row.claim_flag) === 1)];

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
            <h3 style={{ marginTop: 0 }}>Fraud Inputs</h3>
            <p className="muted">Upload transaction, supplier, expense, or investigation-note files. Synthetic fallback is ready by default.</p>
            <input className="file-input" type="file" multiple onChange={onFileChange} />
            <p className="muted" style={{ marginBottom: 0 }}>{status}</p>
          </div>
          <div className="panel">
            <strong>Limits</strong>
            <p className="muted">Files: {workspace.limits.max_upload_files}</p>
            <p className="muted">Rows per dataset: {workspace.limits.max_rows_per_dataset}</p>
            <p className="muted">Copilot requests per minute: {workspace.limits.max_investigation_requests_per_minute}</p>
          </div>
        </div>
      </aside>

      <div className="content">
        {section === "Executive Fraud & Risk Overview" ? (
          <>
            <section className="panel">
              <h2 className="section-title">Executive Fraud & Risk Overview</h2>
              <p className="section-subtitle">Leadership visibility into anomalies, procurement red flags, expense irregularities, refund abuse, and governance priorities.</p>
            </section>
            <div className="safety">{workspace.safe_use_note}</div>
            <div className="metrics-grid">
              <MetricCard label="Overall Fraud Risk" value={workspace.metrics.overall_fraud_risk_score} />
              <MetricCard label="Transaction Anomaly Score" value={workspace.metrics.transaction_anomaly_score} />
              <MetricCard label="Procurement Signal Score" value={workspace.metrics.procurement_signal_score} />
            </div>
            <BarChart title="Fraud Risk Overview" rows={workspace.metric_table} />
          </>
        ) : null}

        {section === "Transaction Anomaly Detection" ? (
          <SectionPanel title="Transaction Anomaly Detection" subtitle="Surface unusual transaction patterns as review priorities.">
            <DataTable title="Transactions" rows={workspace.transactions} />
            <div className="callout"><h3>Transaction Risk Agent</h3><p>{workspace.agents.transaction_risk}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Procurement & Supplier Fraud Signals" ? (
          <SectionPanel title="Procurement & Supplier Fraud Signals" subtitle="Review supplier concentration and invoice irregularity signals.">
            <DataTable title="Suppliers" rows={workspace.suppliers} />
            <div className="callout"><h3>Procurement Fraud Agent</h3><p>{workspace.agents.procurement_fraud}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Expense & Claims Review" ? (
          <SectionPanel title="Expense & Claims Review" subtitle="Identify expense and claims anomalies that deserve deeper review.">
            <DataTable title="Expense And Claims Signals" rows={claimsAndExpenses} />
            <div className="callout"><h3>Expense Review Agent</h3><p>{workspace.agents.expense_review}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Refund & Customer Abuse Monitoring" ? (
          <SectionPanel title="Refund & Customer Abuse Monitoring" subtitle="Monitor repeated refund patterns and customer abuse indicators.">
            <DataTable title="Refund Signals" rows={refunds} />
            <div className="callout"><h3>Refund Abuse Agent</h3><p>{workspace.agents.refund_abuse}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Fraud Investigation Copilot" ? (
          <SectionPanel title="Fraud Investigation Copilot" subtitle="Sequence review priorities without making accusations or legal conclusions.">
            <div className="safety">{workspace.safe_use_note}</div>
            <div>
              <label htmlFor="fraud-question">Investigation question</label>
              <textarea id="fraud-question" className="textarea" value={question} onChange={(event) => setQuestion(event.target.value)} />
              <div className="button-row" style={{ marginTop: 12 }}>
                <button className="button" onClick={runCopilot}>Run Investigation Copilot</button>
              </div>
            </div>
            {Object.entries(copilotResponses).map(([agent, response]) => (
              <div className="callout" key={agent}><h3>{agent}</h3><p>{response}</p></div>
            ))}
          </SectionPanel>
        ) : null}

        {section === "Governance Briefing" ? (
          <SectionPanel title="Governance Briefing" subtitle="Create leadership-facing governance briefings from current anomaly patterns.">
            <div className="callout"><h3>Governance Briefing Agent</h3><p>{workspace.agents.governance_briefing}</p></div>
            <div className="upload-grid">
              <div className="panel">
                <label htmlFor="fraud-query">Investigation notes query</label>
                <input id="fraud-query" className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
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
            <DataTable title="Investigation Notes" rows={knowledgeRows} />
            <div className="code-block"><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre></div>
          </SectionPanel>
        ) : null}

        {section === "About" ? (
          <SectionPanel title="About" subtitle="Risk Management and Fraud Detection using Generative AI in African SMEs.">
            <div className="callout">
              <h3>Platform Scope</h3>
              <p>
                Hustle Fraud Intelligence helps African SMEs and growth businesses detect fraud risks, identify suspicious patterns, and support better governance decisions using generative AI and explainable business intelligence.
              </p>
            </div>
            <div className="panel">
              <strong>Cloudflare Model Policy</strong>
              <p className="muted">Provider: {workspace.cloudflare_model_policy.provider}</p>
              <p className="muted">Token present: {workspace.cloudflare_model_policy.token_present ? "Yes" : "No"}</p>
              <p className="muted">Gateway configured: {workspace.cloudflare_model_policy.gateway_configured ? "Yes" : "No"}</p>
              <p className="muted">Allowed models: {workspace.cloudflare_model_policy.allowed_models.join(", ")}</p>
            </div>
            <DataTable title="Workspace Sources" rows={Object.entries(workspace.sources).map(([area, source]) => ({ area, source }))} />
          </SectionPanel>
        ) : null}

        {error ? <div className="callout"><h3>Notice</h3><p>{error}</p></div> : null}
      </div>
    </main>
  );
}

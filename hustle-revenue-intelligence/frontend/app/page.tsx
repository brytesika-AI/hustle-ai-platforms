"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { BarChart } from "../components/BarChart";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { SectionPanel } from "../components/SectionPanel";
import { analyzeWorkspace, fetchWorkspace, generateBrief, queryKnowledge, requestCopilot } from "../lib/api";
import { WorkspacePayload } from "../lib/types";

const sectionNames = [
  "Executive Revenue Overview",
  "Pricing Intelligence",
  "Revenue Driver Analysis",
  "Churn Revenue Impact",
  "Upsell & Cross-sell Opportunities",
  "Revenue Decision Copilot",
  "About"
] as const;

type SectionName = (typeof sectionNames)[number];

export default function HomePage() {
  const [section, setSection] = useState<SectionName>("Executive Revenue Overview");
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [status, setStatus] = useState("Loading synthetic revenue workspace...");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("pricing churn expansion margin confidence");
  const [knowledgeRows, setKnowledgeRows] = useState<Record<string, string | number>[]>([]);
  const [briefTopic, setBriefTopic] = useState("Revenue priorities for the next operating cycle");
  const [brief, setBrief] = useState("");
  const [question, setQuestion] = useState("Should the business defend price or push expansion first?");
  const [copilotResponses, setCopilotResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWorkspace()
      .then((payload) => {
        setWorkspace(payload);
        setKnowledgeRows(payload.knowledge_results);
        setBrief(payload.executive_brief);
        setCopilotResponses(payload.agents.revenue_copilot);
        setStatus("Synthetic revenue workspace loaded.");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("Unable to load revenue workspace.");
      });
  }, []);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setStatus("Analyzing uploaded revenue files...");
    setError("");
    try {
      const payload = await analyzeWorkspace(files);
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge_results);
      setBrief(payload.executive_brief);
      setCopilotResponses(payload.agents.revenue_copilot);
      setStatus("Uploaded revenue files processed.");
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
          <h2 className="section-title">Preparing Hustle Revenue Intelligence</h2>
          <p className="section-subtitle">{status}</p>
          {error ? <p>{error}</p> : null}
        </div>
      </main>
    );
  }

  const overviewBars = [
    { dimension: "Pricing Power", score: workspace.metrics.pricing_power_score },
    { dimension: "Expansion Readiness", score: workspace.metrics.expansion_readiness_score },
    { dimension: "Driver Clarity", score: workspace.metrics.driver_clarity_score },
    { dimension: "Revenue Health", score: workspace.metrics.revenue_health_score }
  ];

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
            <h3 style={{ marginTop: 0 }}>Revenue Inputs</h3>
            <p className="muted">Upload CSV files or text notes, or stay with the synthetic commercial dataset.</p>
            <input className="file-input" type="file" multiple onChange={onFileChange} />
            <p className="muted" style={{ marginBottom: 0 }}>{status}</p>
          </div>
        </div>
      </aside>

      <div className="content">
        {section === "Executive Revenue Overview" ? (
          <>
            <section className="panel">
              <h2 className="section-title">Executive Revenue Overview</h2>
              <p className="section-subtitle">Leadership visibility across pricing discipline, revenue drivers, churn impact, and expansion opportunities.</p>
            </section>
            <div className="metrics-grid">
              <MetricCard label="Total Revenue" value={workspace.metrics.total_revenue} />
              <MetricCard label="Average Discount %" value={workspace.metrics.avg_discount_pct} />
              <MetricCard label="Churn Revenue Exposure" value={workspace.metrics.churn_revenue_exposure} />
            </div>
            <BarChart title="Revenue Health Overview" rows={overviewBars} />
            <div className="code-block"><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre></div>
          </>
        ) : null}

        {section === "Pricing Intelligence" ? (
          <SectionPanel title="Pricing Intelligence" subtitle="Find price leakage and commercial discipline gaps before they spread across the book.">
            <DataTable title="Pricing Table" rows={workspace.pricing_rows} />
            <div className="callout"><h3>Pricing Optimization Agent</h3><p>{workspace.agents.pricing_optimization}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Revenue Driver Analysis" ? (
          <SectionPanel title="Revenue Driver Analysis" subtitle="See which commercial motions are actually carrying the current revenue base.">
            <DataTable title="Revenue Drivers" rows={workspace.driver_rows} />
            <div className="callout"><h3>Revenue Driver Agent</h3><p>{workspace.agents.revenue_driver}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Churn Revenue Impact" ? (
          <SectionPanel title="Churn Revenue Impact" subtitle="Protect recurring value where churn risk is already visible.">
            <DataTable title="Churn Exposure" rows={workspace.churn_rows} />
            <div className="callout"><h3>Churn Impact Agent</h3><p>{workspace.agents.churn_impact}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Upsell & Cross-sell Opportunities" ? (
          <SectionPanel title="Upsell & Cross-sell Opportunities" subtitle="Concentrate commercial effort where expansion readiness and confidence align.">
            <DataTable title="Expansion Opportunities" rows={workspace.expansion_rows} />
            <div className="callout"><h3>Upsell & Cross-sell Agent</h3><p>{workspace.agents.upsell_cross_sell}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Revenue Decision Copilot" ? (
          <SectionPanel title="Revenue Decision Copilot" subtitle="Stress-test pricing and growth choices with the current commercial posture in view.">
            <div>
              <label htmlFor="revenue-question">Decision question</label>
              <textarea id="revenue-question" className="textarea" value={question} onChange={(event) => setQuestion(event.target.value)} />
              <div className="button-row" style={{ marginTop: 12 }}>
                <button className="button" onClick={runCopilot}>Run Revenue Copilot</button>
              </div>
            </div>
            {Object.entries(copilotResponses).map(([agent, response]) => (
              <div className="callout" key={agent}><h3>{agent}</h3><p>{response}</p></div>
            ))}
            <div className="upload-grid">
              <div className="panel">
                <label htmlFor="revenue-query">Knowledge query</label>
                <input id="revenue-query" className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
                <div className="button-row" style={{ marginTop: 12 }}>
                  <button className="button" onClick={runKnowledgeQuery}>Run Query</button>
                </div>
              </div>
              <div className="panel">
                <label htmlFor="revenue-brief-topic">Brief topic</label>
                <input id="revenue-brief-topic" className="input" value={briefTopic} onChange={(event) => setBriefTopic(event.target.value)} />
                <div className="button-row" style={{ marginTop: 12 }}>
                  <button className="button" onClick={runBrief}>Generate Brief</button>
                </div>
              </div>
            </div>
            <DataTable title="Revenue Notes" rows={knowledgeRows} />
            <div className="code-block"><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre></div>
          </SectionPanel>
        ) : null}

        {section === "About" ? (
          <SectionPanel title="About" subtitle="Revenue optimization and commercial decision support for African businesses.">
            <div className="callout">
              <h3>Platform Scope</h3>
              <p>
                Hustle Revenue Intelligence helps commercial leaders tighten pricing discipline, defend recurring revenue, and direct expansion energy toward the highest-confidence opportunities.
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

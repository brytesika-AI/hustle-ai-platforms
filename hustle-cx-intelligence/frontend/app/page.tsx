"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { BarChart } from "../components/BarChart";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { SectionPanel } from "../components/SectionPanel";
import { analyzeWorkspace, fetchWorkspace, generateBrief, queryKnowledge, requestCopilot } from "../lib/api";
import { WorkspacePayload } from "../lib/types";

const sectionNames = [
  "Executive Overview",
  "Transcript Intelligence",
  "Root Cause Engine",
  "Churn Risk Engine",
  "Product Improvement Insights",
  "Knowledge & Trends",
  "About"
] as const;

type SectionName = (typeof sectionNames)[number];

export default function HomePage() {
  const [section, setSection] = useState<SectionName>("Executive Overview");
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [status, setStatus] = useState("Loading synthetic CX workspace...");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("billing trust network quality product usability");
  const [knowledgeRows, setKnowledgeRows] = useState<Record<string, string | number>[]>([]);
  const [briefTopic, setBriefTopic] = useState("Executive CX priorities");
  const [brief, setBrief] = useState("");
  const [question, setQuestion] = useState("Where should leadership intervene first to reduce churn pressure?");
  const [copilotResponses, setCopilotResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWorkspace()
      .then((payload) => {
        setWorkspace(payload);
        setKnowledgeRows(payload.knowledge.query_results);
        setBrief(payload.executive_brief);
        setCopilotResponses(payload.agents.executive_copilot);
        setStatus("Synthetic CX workspace loaded.");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("Unable to load CX workspace.");
      });
  }, []);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setStatus("Analyzing uploaded transcript files...");
    setError("");
    try {
      const payload = await analyzeWorkspace(files);
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge.query_results);
      setBrief(payload.executive_brief);
      setCopilotResponses(payload.agents.executive_copilot);
      setStatus("Uploaded CX files processed.");
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
          <h2 className="section-title">Preparing Hustle CX Intelligence</h2>
          <p className="section-subtitle">{status}</p>
          {error ? <p>{error}</p> : null}
        </div>
      </main>
    );
  }

  const overviewBars = [
    { dimension: "Negative Sentiment", score: workspace.metrics.negative_sentiment_pct },
    { dimension: "High Severity", score: workspace.metrics.high_severity_pct },
    { dimension: "Churn Risk", score: workspace.metrics.churn_risk_score },
    { dimension: "Product Signal", score: workspace.metrics.product_signal_score },
    { dimension: "Executive Visibility", score: workspace.metrics.executive_visibility_score }
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
            <h3 style={{ marginTop: 0 }}>Transcript Inputs</h3>
            <p className="muted">Upload CSV transcript files, text notes, or keep the synthetic service dataset.</p>
            <input className="file-input" type="file" multiple onChange={onFileChange} />
            <p className="muted" style={{ marginBottom: 0 }}>{status}</p>
          </div>
        </div>
      </aside>

      <div className="content">
        {section === "Executive Overview" ? (
          <>
            <section className="panel">
              <h2 className="section-title">Executive Overview</h2>
              <p className="section-subtitle">Customer support visibility across sentiment, severity, churn pressure, and product improvement demand.</p>
            </section>
            <div className="metrics-grid">
              <MetricCard label="Negative Sentiment %" value={workspace.metrics.negative_sentiment_pct} />
              <MetricCard label="High Severity %" value={workspace.metrics.high_severity_pct} />
              <MetricCard label="Average Resolution Hours" value={workspace.metrics.avg_resolution_hours} />
            </div>
            <BarChart title="CX Health Overview" rows={overviewBars} />
            <div className="code-block"><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre></div>
          </>
        ) : null}

        {section === "Transcript Intelligence" ? (
          <SectionPanel title="Transcript Intelligence" subtitle="Classify what customers are saying and how severe the service pressure has become.">
            <DataTable title="Transcript Dataset" rows={workspace.transcripts} />
            <div className="dual-grid">
              <div className="callout"><h3>Transcript Classification Agent</h3><p>{workspace.agents.transcript_classification}</p></div>
              <div className="callout"><h3>Sentiment & Severity Agent</h3><p>{workspace.agents.sentiment_severity}</p></div>
            </div>
          </SectionPanel>
        ) : null}

        {section === "Root Cause Engine" ? (
          <SectionPanel title="Root Cause Engine" subtitle="Group issues by operational cause rather than only by queue or channel.">
            <DataTable title="Root Cause Clusters" rows={workspace.root_causes} />
            <div className="callout"><h3>Root Cause Agent</h3><p>{workspace.agents.root_cause}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Churn Risk Engine" ? (
          <SectionPanel title="Churn Risk Engine" subtitle="Spot service conditions that are most likely to turn into customer loss.">
            <DataTable title="High-Signal Transcripts" rows={workspace.transcripts.filter((row) => String(row.churn_signal).toLowerCase() === "high")} />
            <div className="callout"><h3>Churn Risk Agent</h3><p>{workspace.agents.churn_risk}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Product Improvement Insights" ? (
          <SectionPanel title="Product Improvement Insights" subtitle="Translate transcript patterns into product and service changes with commercial value.">
            <DataTable title="Product Signals" rows={workspace.product_signals} />
            <div className="callout"><h3>Product Improvement Agent</h3><p>{workspace.agents.product_improvement}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Knowledge & Trends" ? (
          <SectionPanel title="Knowledge & Trends" subtitle="Query trend notes, create executive briefings, and stress-test service decisions.">
            <div className="metrics-grid">
              <MetricCard label="Trend Documents" value={workspace.knowledge.explore.documents} />
              <MetricCard label="Average Word Count" value={workspace.knowledge.explore.average_word_count} />
              <MetricCard label="Visibility Score" value={workspace.metrics.executive_visibility_score} />
            </div>
            <div>
              <label htmlFor="cx-question">Executive CX question</label>
              <textarea id="cx-question" className="textarea" value={question} onChange={(event) => setQuestion(event.target.value)} />
              <div className="button-row" style={{ marginTop: 12 }}>
                <button className="button" onClick={runCopilot}>Run Executive CX Copilot</button>
              </div>
            </div>
            {Object.entries(copilotResponses).map(([agent, response]) => (
              <div className="callout" key={agent}><h3>{agent}</h3><p>{response}</p></div>
            ))}
            <div className="upload-grid">
              <div className="panel">
                <label htmlFor="cx-query">Knowledge query</label>
                <input id="cx-query" className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
                <div className="button-row" style={{ marginTop: 12 }}>
                  <button className="button" onClick={runKnowledgeQuery}>Run Query</button>
                </div>
              </div>
              <div className="panel">
                <label htmlFor="cx-brief-topic">Brief topic</label>
                <input id="cx-brief-topic" className="input" value={briefTopic} onChange={(event) => setBriefTopic(event.target.value)} />
                <div className="button-row" style={{ marginTop: 12 }}>
                  <button className="button" onClick={runBrief}>Generate Brief</button>
                </div>
              </div>
            </div>
            <DataTable title="Knowledge Results" rows={knowledgeRows} />
            <div className="code-block"><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre></div>
          </SectionPanel>
        ) : null}

        {section === "About" ? (
          <SectionPanel title="About" subtitle="Executive-grade customer support and customer intelligence for African businesses.">
            <div className="callout">
              <h3>Platform Scope</h3>
              <p>
                Hustle CX Intelligence helps leadership teams see service pressure, product friction, churn risk, and resolution bottlenecks early enough to act before trust erosion compounds.
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

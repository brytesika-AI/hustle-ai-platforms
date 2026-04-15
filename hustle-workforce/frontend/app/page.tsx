"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { BarChart } from "../components/BarChart";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { SectionPanel } from "../components/SectionPanel";
import { analyzeWorkspace, fetchWorkspace, generateBrief, queryKnowledge, requestDecisionCopilot } from "../lib/api";
import { WorkspacePayload } from "../lib/types";

const sectionNames = [
  "Executive Overview",
  "Finance Department",
  "Operations Department",
  "Sales Department",
  "Strategy Department",
  "Growth Department",
  "SME Knowledge Brain",
  "About"
] as const;

type SectionName = (typeof sectionNames)[number];

export default function HomePage() {
  const [section, setSection] = useState<SectionName>("Executive Overview");
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [status, setStatus] = useState("Loading synthetic workspace...");
  const [error, setError] = useState("");
  const [knowledgeQuery, setKnowledgeQuery] = useState("cash discipline working capital");
  const [knowledgeRows, setKnowledgeRows] = useState<Record<string, string | number>[]>([]);
  const [briefTopic, setBriefTopic] = useState("Quarterly operating priorities");
  const [brief, setBrief] = useState("");
  const [strategyQuestion, setStrategyQuestion] = useState("Should the business accelerate regional growth next quarter?");
  const [decisionResponses, setDecisionResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWorkspace()
      .then((payload) => {
        setWorkspace(payload);
        setKnowledgeRows(payload.knowledge.default_query_results);
        setBrief(payload.executive_brief);
        setDecisionResponses(payload.agents.decision_copilot);
        setStatus("Synthetic demo workspace loaded.");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("Unable to load workspace data.");
      });
  }, []);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setStatus("Analyzing uploaded files...");
    setError("");
    try {
      const payload = await analyzeWorkspace(files);
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge.default_query_results);
      setBrief(payload.executive_brief);
      setDecisionResponses(payload.agents.decision_copilot);
      setStatus("Uploaded files processed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setStatus("Upload failed.");
    }
  }

  async function runKnowledgeQuery() {
    try {
      const rows = await queryKnowledge(knowledgeQuery);
      setKnowledgeRows(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Knowledge query failed.");
    }
  }

  async function runBriefGeneration() {
    try {
      const nextBrief = await generateBrief(briefTopic);
      setBrief(nextBrief);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Brief generation failed.");
    }
  }

  async function runDecisionCopilot() {
    if (!workspace) return;
    try {
      const responses = await requestDecisionCopilot(strategyQuestion, workspace.health_scores);
      setDecisionResponses(responses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decision copilot failed.");
    }
  }

  if (!workspace) {
    return (
      <main className="main-grid">
        <div className="panel" style={{ gridColumn: "1 / -1" }}>
          <h2 className="section-title">Preparing Hustle Workforce</h2>
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
                <button
                  key={name}
                  className={`nav-button ${section === name ? "active" : ""}`}
                  onClick={() => setSection(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="upload-panel">
            <h3 style={{ marginTop: 0 }}>Workspace Input</h3>
            <p className="muted">Upload CSV and text files or continue with synthetic demo data.</p>
            <input className="file-input" type="file" multiple onChange={onFileChange} />
            <p className="muted" style={{ marginBottom: 0 }}>{status}</p>
          </div>
        </div>
      </aside>

      <div className="content">
        {section === "Executive Overview" ? (
          <>
            <section className="hero-panel panel">
              <h2 className="section-title">Executive Overview</h2>
              <p className="section-subtitle">
                Leadership visibility across finance, operations, sales, growth, strategy, and
                knowledge maturity.
              </p>
            </section>
            <div className="metrics-grid">
              <MetricCard label="Overall Health Score" value={workspace.health_scores.overall_health_score} />
              <MetricCard label="Financial Strength" value={workspace.health_scores.financial_risk} />
              <MetricCard label="Pipeline Health" value={workspace.health_scores.sales_pipeline_health} />
            </div>
            <BarChart title="Business Health Engine" rows={workspace.health_table} />
            <SectionPanel title="Executive Briefing" subtitle="Management-ready summary generated from the current workspace.">
              <div className="code-block">
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre>
              </div>
            </SectionPanel>
          </>
        ) : null}

        {section === "Finance Department" ? (
          <SectionPanel title="Finance Department" subtitle="Cashflow visibility, liquidity discipline, and working-capital pressure management.">
            <DataTable title="Finance Performance" rows={workspace.sections.finance} />
            <div className="callout">
              <h3>Cashflow Intelligence Agent</h3>
              <p>{workspace.agents.cashflow}</p>
            </div>
          </SectionPanel>
        ) : null}

        {section === "Operations Department" ? (
          <SectionPanel title="Operations Department" subtitle="Team utilization, cycle time, absenteeism, and execution readiness.">
            <DataTable title="Operations" rows={workspace.sections.operations} />
            <div className="callout">
              <h3>Operating View</h3>
              <p>
                The operations view helps leadership see where labor capacity is productive and
                where process bottlenecks are beginning to absorb management attention.
              </p>
            </div>
          </SectionPanel>
        ) : null}

        {section === "Sales Department" ? (
          <SectionPanel title="Sales Department" subtitle="Pipeline quality, deal confidence, and WhatsApp-led commercial intelligence.">
            <div className="dual-grid">
              <DataTable title="Sales Pipeline" rows={workspace.sections.sales} />
              <DataTable title="WhatsApp CRM" rows={workspace.sections.crm} />
            </div>
            <div className="callout">
              <h3>WhatsApp CRM Intelligence Agent</h3>
              <p>{workspace.agents.whatsapp_crm}</p>
            </div>
          </SectionPanel>
        ) : null}

        {section === "Strategy Department" ? (
          <SectionPanel title="Strategy Department" subtitle="Decision challenge, scenario framing, and leadership judgment support.">
            <DataTable title="Strategic Priorities" rows={workspace.sections.strategy} />
            <div>
              <label htmlFor="strategy-question">Decision prompt</label>
              <textarea
                id="strategy-question"
                className="textarea"
                value={strategyQuestion}
                onChange={(event) => setStrategyQuestion(event.target.value)}
              />
              <div className="button-row" style={{ marginTop: 12 }}>
                <button className="button" onClick={runDecisionCopilot}>Run Decision Copilot</button>
              </div>
            </div>
            {Object.entries(decisionResponses).map(([agent, response]) => (
              <div className="callout" key={agent}>
                <h3>{agent}</h3>
                <p>{response}</p>
              </div>
            ))}
          </SectionPanel>
        ) : null}

        {section === "Growth Department" ? (
          <SectionPanel title="Growth Department" subtitle="Campaign efficiency, activation quality, and commercial expansion discipline.">
            <DataTable title="Growth Performance" rows={workspace.sections.growth} />
            <div className="dual-grid">
              <div className="callout">
                <h3>Marketing Campaign Agent</h3>
                <p>{workspace.agents.marketing_campaign}</p>
              </div>
              <div className="callout">
                <h3>Inventory Forecast Agent</h3>
                <p>{workspace.agents.inventory}</p>
              </div>
            </div>
          </SectionPanel>
        ) : null}

        {section === "SME Knowledge Brain" ? (
          <SectionPanel title="SME Knowledge Brain" subtitle="Structured memory for notes, playbooks, uploads, and executive briefing generation.">
            <div className="metrics-grid">
              <MetricCard label="Raw Documents" value={workspace.knowledge.explore.raw_documents} />
              <MetricCard label="Wiki Documents" value={workspace.knowledge.explore.wiki_documents} />
              <MetricCard label="Average Word Count" value={workspace.knowledge.explore.average_word_count} />
            </div>
            <div className="upload-grid">
              <div className="panel">
                <label htmlFor="knowledge-query">Knowledge query</label>
                <input
                  id="knowledge-query"
                  className="input"
                  value={knowledgeQuery}
                  onChange={(event) => setKnowledgeQuery(event.target.value)}
                />
                <div className="button-row" style={{ marginTop: 12 }}>
                  <button className="button" onClick={runKnowledgeQuery}>Run Query</button>
                </div>
              </div>
              <div className="panel">
                <label htmlFor="brief-topic">Brief topic</label>
                <input
                  id="brief-topic"
                  className="input"
                  value={briefTopic}
                  onChange={(event) => setBriefTopic(event.target.value)}
                />
                <div className="button-row" style={{ marginTop: 12 }}>
                  <button className="button" onClick={runBriefGeneration}>Generate Brief</button>
                </div>
              </div>
            </div>
            <DataTable title="Knowledge Query Results" rows={knowledgeRows} />
            <div className="code-block">
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre>
            </div>
          </SectionPanel>
        ) : null}

        {section === "About" ? (
          <SectionPanel title="About" subtitle="Flagship Hustle AI product for African SME decision support.">
            <div className="callout">
              <h3>Platform Scope</h3>
              <p>
                Hustle Workforce links executive oversight, departmental visibility, agent-based
                reasoning, and a reusable SME knowledge brain inside one commercially credible web
                application.
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

"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { SectionExplanation } from "../../../shared/frontend/ux/SectionExplanation";
import { TemplatePreview } from "../../../shared/frontend/ux/TemplatePreview";
import { UploadGuidance } from "../../../shared/frontend/ux/UploadGuidance";
import { RunAnalysisPanel } from "../../../shared/frontend/ux/RunAnalysisPanel";
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

type SectionConfig = {
  explanation: string;
  whyItMatters: string;
  decisionSupport: string;
  csvUse: string;
  textUse: string;
  expectedFields: string[];
  syntheticNote: string;
  templateTitle: string;
  templateRows: Record<string, string | number>[];
};

const sharedAcceptedFiles = ["CSV", "TXT", "TSV"];

const sectionConfigs: Record<SectionName, SectionConfig> = {
  "Executive Overview": {
    explanation: "This overview brings finance, operations, sales, growth, and knowledge signals into one management view for an SME owner or leadership team.",
    whyItMatters: "It helps a busy founder see where the business is steady, where pressure is building, and which area needs attention first.",
    decisionSupport: "Use it to decide where to focus weekly leadership time, cash discipline, and near-term operating action.",
    csvUse: "CSV files help when you want the dashboard to refresh from structured records across finance, stock, CRM, or campaign activity.",
    textUse: "Text files help when you want to include management notes, strategy memos, branch observations, or customer context.",
    expectedFields: ["area", "source", "text", "transactions", "inventory", "crm"],
    syntheticNote: "If you do not upload anything, Run Analysis will refresh the executive view using the built-in demo workspace.",
    templateTitle: "Workspace Template Preview",
    templateRows: [
      { area: "finance", source: "bank_statement_q1.csv", text: "Collections slowed after two major customers paid late.", transactions: 1485000, inventory: 0, crm: 0 },
      { area: "operations", source: "ops_notes_march.txt", text: "Delivery delays increased when one branch ran short of stock.", transactions: 0, inventory: 240, crm: 0 },
      { area: "sales", source: "whatsapp_pipeline_export.csv", text: "Follow-up quality improved when leads were contacted within one day.", transactions: 0, inventory: 0, crm: 58 }
    ]
  },
  "Finance Department": {
    explanation: "This report shows cash discipline, liquidity pressure, and the financial signals that matter most for an SME operating month to month.",
    whyItMatters: "Many African SMEs do not fail because demand disappears. They fail because cash timing becomes uncomfortable before leadership reacts.",
    decisionSupport: "Use it to decide where to tighten collections, reduce leakage, or pace new spending more carefully.",
    csvUse: "Upload finance or transaction CSV files when you want a more current cashflow and working-capital view.",
    textUse: "Upload finance notes or board-prep text when the story behind the numbers matters for context.",
    expectedFields: ["area", "source", "text", "transactions"],
    syntheticNote: "No upload is required for demo use. The finance view can still run on synthetic business data.",
    templateTitle: "Finance Upload Example",
    templateRows: [
      { area: "finance", source: "collections_april.csv", text: "Late payment pressure increased after one distributor delayed settlement.", transactions: 428000 },
      { area: "finance", source: "supplier_payments.csv", text: "Two large supplier payments land in the same week.", transactions: 215000 }
    ]
  },
  "Operations Department": {
    explanation: "This section tracks the operating rhythm of the business, including capacity, delays, bottlenecks, and execution readiness.",
    whyItMatters: "When operations slip, cashflow, service quality, and management trust usually suffer together.",
    decisionSupport: "Use it to decide where to unblock teams, improve cycle time, or rebalance branch pressure.",
    csvUse: "Upload operations or inventory-linked CSV files when you have structured process, service, or stock records.",
    textUse: "Text files work well for supervisor notes, branch incident summaries, and daily ops reviews.",
    expectedFields: ["area", "source", "text", "inventory"],
    syntheticNote: "If no file is uploaded, the operations section will still refresh using the built-in demo workspace.",
    templateTitle: "Operations Upload Example",
    templateRows: [
      { area: "operations", source: "branch_ops_weekly.csv", text: "Dispatches slipped when one vehicle stayed off-road for repairs.", inventory: 82 },
      { area: "operations", source: "ops_notes.txt", text: "One branch is absorbing too many urgent requests without enough staff cover.", inventory: 0 }
    ]
  },
  "Sales Department": {
    explanation: "This report shows pipeline quality and WhatsApp-led commercial activity so leadership can see whether demand is healthy or only looks busy.",
    whyItMatters: "For many SMEs, revenue confidence comes from message threads and follow-up behavior before it appears in formal reports.",
    decisionSupport: "Use it to decide where follow-up quality, deal confidence, or sales discipline needs intervention.",
    csvUse: "Upload sales pipeline or CRM exports when you want the section to reflect live deal and conversation activity.",
    textUse: "Use text files for sales-manager notes, market observations, or campaign follow-up summaries.",
    expectedFields: ["area", "source", "text", "crm"],
    syntheticNote: "Run Analysis will still produce a credible pipeline view with the demo workspace if no upload is available.",
    templateTitle: "Sales Upload Example",
    templateRows: [
      { area: "sales", source: "pipeline_snapshot.csv", text: "High-value retail prospect waiting on revised terms.", crm: 12 },
      { area: "sales", source: "whatsapp_leads.csv", text: "Follow-up rate improved after same-day callback rule was introduced.", crm: 31 }
    ]
  },
  "Strategy Department": {
    explanation: "This section helps leadership test major growth or operating decisions before committing scarce time, capital, or management attention.",
    whyItMatters: "SMEs often move fast on instinct. This view helps turn instinct into clearer judgment.",
    decisionSupport: "Use it to compare expansion timing, risk appetite, and the strength of the current business position.",
    csvUse: "Upload planning or scenario CSV files when strategy choices depend on structured assumptions or tracked performance.",
    textUse: "Text files are ideal for strategy notes, board memos, regional expansion ideas, and decision questions.",
    expectedFields: ["area", "source", "text"],
    syntheticNote: "If you have no strategy file ready, the page will still run with the built-in synthetic workspace.",
    templateTitle: "Strategy Upload Example",
    templateRows: [
      { area: "strategy", source: "regional_plan.txt", text: "New branch should only open if collections and stock discipline stay stable for two more cycles." },
      { area: "strategy", source: "owner_memo.txt", text: "Growth is attractive, but cash resilience matters more than speed this quarter." }
    ]
  },
  "Growth Department": {
    explanation: "This report shows campaign quality, activation strength, and whether growth activity is creating useful demand or just more noise.",
    whyItMatters: "Growth spend can feel productive while quietly weakening margin, stock discipline, or leadership focus.",
    decisionSupport: "Use it to decide which campaigns to keep funding, which to refine, and which to stop early.",
    csvUse: "Upload marketing, channel, or growth CSV files when campaign and activation performance is already tracked in a spreadsheet.",
    textUse: "Text files are useful for campaign notes, regional demand observations, and partner feedback.",
    expectedFields: ["area", "source", "text", "crm", "inventory"],
    syntheticNote: "No upload detected? The growth section can still refresh from synthetic demo performance data.",
    templateTitle: "Growth Upload Example",
    templateRows: [
      { area: "growth", source: "campaign_results.csv", text: "Dealer activation campaign delivered stronger leads than the broad awareness push.", crm: 18, inventory: 42 },
      { area: "growth", source: "channel_notes.txt", text: "One reseller cluster is converting better when stock availability is communicated early.", crm: 0, inventory: 0 }
    ]
  },
  "SME Knowledge Brain": {
    explanation: "The Knowledge Brain turns notes, playbooks, uploads, and business memory into a reusable management reference for faster decisions.",
    whyItMatters: "Many SMEs depend on what the founder remembers. This section makes useful business memory easier to reuse across time and teams.",
    decisionSupport: "Use it to query past lessons, build management briefs, and reduce repeated decision friction.",
    csvUse: "CSV files help when you want to attach structured business records to the knowledge layer.",
    textUse: "Text files are especially useful for policies, meeting notes, playbooks, and owner observations.",
    expectedFields: ["area", "source", "text"],
    syntheticNote: "If no upload is provided, the Knowledge Brain will still demonstrate retrieval using built-in SME notes.",
    templateTitle: "Knowledge Brain Upload Example",
    templateRows: [
      { area: "knowledge", source: "owner_notes.txt", text: "Working capital improves when campaign spend is approved only after stock coverage is reviewed." },
      { area: "knowledge", source: "retention_playbook.txt", text: "Repeat customers respond better when WhatsApp follow-up happens within one day." }
    ]
  },
  "About": {
    explanation: "This section explains what the product is for and how the workspace brings different SME operating signals into one credible decision surface.",
    whyItMatters: "It helps founders, recruiters, partners, and advisory clients understand the business value of the platform quickly.",
    decisionSupport: "Use it to explain the platform scope, expected inputs, and the kind of management conversations the app supports.",
    csvUse: "CSV uploads are useful when you want the About view to reflect the real workspace sources behind a demo or live analysis.",
    textUse: "Text files are useful when you want to include founder notes, company context, or operating background.",
    expectedFields: ["area", "source", "text"],
    syntheticNote: "The About section can still present a polished story even when the demo workspace is used.",
    templateTitle: "Source Mapping Example",
    templateRows: [
      { area: "finance", source: "collections_april.csv", text: "Structured cash and collections source." },
      { area: "strategy", source: "owner_memo.txt", text: "Narrative context from leadership." }
    ]
  }
};

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState("No upload detected, so synthetic data will be used.");
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  useEffect(() => {
    fetchWorkspace()
      .then((payload) => {
        setWorkspace(payload);
        setKnowledgeRows(payload.knowledge.default_query_results);
        setBrief(payload.executive_brief);
        setDecisionResponses(payload.agents.decision_copilot);
        setStatus("Synthetic demo workspace loaded.");
        setAnalysisStatus("Analysis completed using synthetic demo workspace.");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("Unable to load workspace data.");
      });
  }, []);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    if (files.length > 0) {
      setAnalysisStatus(`Upload ready: ${files.length} file(s) selected. Click Run Analysis to refresh this section.`);
    } else {
      setAnalysisStatus("No upload detected, so synthetic data will be used.");
    }
  }

  async function runAnalysis() {
    setIsRunningAnalysis(true);
    setError("");
    setStatus("Refreshing analysis...");
    try {
      const payload = selectedFiles.length > 0 ? await analyzeWorkspace(selectedFiles) : await fetchWorkspace();
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge.default_query_results);
      setBrief(payload.executive_brief);
      setDecisionResponses(payload.agents.decision_copilot);
      setStatus(selectedFiles.length > 0 ? "Analysis completed using uploaded dataset." : "Analysis completed using synthetic demo workspace.");
      setAnalysisStatus(selectedFiles.length > 0 ? "Analysis completed using uploaded dataset." : "No upload detected, so synthetic data was used.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed.";
      setError(message);
      setStatus("Analysis failed.");
      setAnalysisStatus("Analysis failed. Please review the upload structure and try again.");
    } finally {
      setIsRunningAnalysis(false);
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

  function renderToolkit(currentSection: SectionName) {
    const config = sectionConfigs[currentSection];

    return (
      <>
        <SectionExplanation
          title={`${currentSection} Report Guide`}
          description={config.explanation}
          whyItMatters={config.whyItMatters}
          decisionSupport={config.decisionSupport}
        />
        <UploadGuidance
          acceptedFiles={sharedAcceptedFiles}
          csvUse={config.csvUse}
          textUse={config.textUse}
          expectedFields={config.expectedFields}
          syntheticNote={config.syntheticNote}
        />
        <TemplatePreview
          title={config.templateTitle}
          rows={config.templateRows}
          downloadHref="/templates/workforce-workspace-template.csv"
          downloadLabel="Download Workforce Template"
        />
        <RunAnalysisPanel
          status={analysisStatus}
          helperText="Run Analysis will refresh the current section using your uploaded files when available, or use the built-in synthetic sample when no upload is present."
          onRunAnalysis={runAnalysis}
          isRunning={isRunningAnalysis}
        />
      </>
    );
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
            <p className="muted">Upload CSV and text files, then click Run Analysis to refresh the current view. No upload still works with synthetic SME demo data.</p>
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
            {renderToolkit(section)}
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
            {renderToolkit(section)}
            <DataTable title="Finance Performance" rows={workspace.sections.finance} />
            <div className="callout">
              <h3>Cashflow Intelligence Agent</h3>
              <p>{workspace.agents.cashflow}</p>
            </div>
          </SectionPanel>
        ) : null}

        {section === "Operations Department" ? (
          <SectionPanel title="Operations Department" subtitle="Team utilization, cycle time, absenteeism, and execution readiness.">
            {renderToolkit(section)}
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
            {renderToolkit(section)}
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
            {renderToolkit(section)}
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
            {renderToolkit(section)}
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
            {renderToolkit(section)}
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
            {renderToolkit(section)}
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

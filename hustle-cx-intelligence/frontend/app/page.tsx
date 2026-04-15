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
import { analyzeWorkspace, fetchWorkspace, generateBrief, queryKnowledge, requestCopilot, validateWorkspaceFiles } from "../lib/api";
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

const sharedAcceptedFiles = ["CSV", "TXT"];

const sectionConfigs: Record<SectionName, SectionConfig> = {
  "Executive Overview": {
    explanation: "This overview turns raw support activity into a board-friendly reading of sentiment, severity, churn pressure, and product friction.",
    whyItMatters: "SME leaders often hear customer pain too late. This view helps them see service risk before trust erosion becomes expensive.",
    decisionSupport: "Use it to decide where service teams, product teams, and leadership should intervene first.",
    csvUse: "CSV files are best when you have exported transcripts, complaint logs, or support records from a CRM or helpdesk.",
    textUse: "Text files are useful for service summaries, escalation notes, and management context around recurring complaints.",
    expectedFields: ["transcript_id", "transcript_text", "customer_sentiment", "issue_type", "resolution_hours", "churn_signal"],
    syntheticNote: "If you do not upload a dataset, Run Analysis will refresh the dashboard using built-in synthetic CX data.",
    templateTitle: "CX Transcript Template Preview",
    templateRows: [
      { transcript_id: "CX-1001", transcript_text: "Customer says billing amount changed without warning.", customer_sentiment: "negative", issue_type: "billing", resolution_hours: 14, churn_signal: "high" },
      { transcript_id: "CX-1002", transcript_text: "Subscriber reports unstable service during peak evening hours.", customer_sentiment: "negative", issue_type: "network", resolution_hours: 9, churn_signal: "medium" }
    ]
  },
  "Transcript Intelligence": {
    explanation: "This report classifies what customers are saying so teams can see whether the complaint load is routine, urgent, or retention-threatening.",
    whyItMatters: "Support teams may feel busy every day, but this section shows which complaint patterns actually deserve executive attention.",
    decisionSupport: "Use it to decide where queue priorities, service quality fixes, or follow-up discipline should improve first.",
    csvUse: "Upload exported transcript or ticket CSV files to classify live customer conversations.",
    textUse: "Upload escalation notes or complaint summaries when you want to enrich the story behind the support queue.",
    expectedFields: ["transcript_id", "transcript_text", "customer_sentiment", "issue_type"],
    syntheticNote: "If no upload is available, the transcript view will still run using the built-in demo dataset.",
    templateTitle: "Transcript Upload Example",
    templateRows: [
      { transcript_id: "CX-201", transcript_text: "Billing amount is not what I expected this month.", customer_sentiment: "negative", issue_type: "billing" },
      { transcript_id: "CX-202", transcript_text: "Service drops every night when we need it most.", customer_sentiment: "negative", issue_type: "network" }
    ]
  },
  "Root Cause Engine": {
    explanation: "This section groups recurring service issues into operating causes so leadership can solve problems at source instead of only answering tickets faster.",
    whyItMatters: "Recurring complaints usually mean the business has one or two repeated weaknesses, not hundreds of unrelated issues.",
    decisionSupport: "Use it to decide where cross-functional fixes will produce the biggest customer trust gain.",
    csvUse: "CSV files work best when root causes need to be inferred from many support records.",
    textUse: "Text files are useful for product, service, and operations notes that explain why the same complaints keep returning.",
    expectedFields: ["transcript_id", "transcript_text", "issue_type"],
    syntheticNote: "No upload detected? The root-cause view can still run on the built-in service demo data.",
    templateTitle: "Root Cause Template Preview",
    templateRows: [
      { transcript_id: "CX-315", transcript_text: "Invoice language is confusing and keeps causing repeat calls.", issue_type: "billing trust" },
      { transcript_id: "CX-318", transcript_text: "Network quality drops in the same evening window every week.", issue_type: "service stability" }
    ]
  },
  "Churn Risk Engine": {
    explanation: "This report highlights the complaint conditions most likely to damage retention, especially when customers are already frustrated or uncertain.",
    whyItMatters: "For many African SMEs, churn is expensive because replacing a lost customer takes time, staff energy, and working capital.",
    decisionSupport: "Use it to decide which service issues deserve urgent intervention before they turn into revenue leakage.",
    csvUse: "Upload complaint history or retention-risk CSV files when you want churn pressure scored from real interactions.",
    textUse: "Text files help when churn concerns are being tracked manually in notes or customer follow-up summaries.",
    expectedFields: ["transcript_id", "transcript_text", "customer_sentiment", "churn_signal"],
    syntheticNote: "Without an upload, the churn-risk section will still demonstrate the workflow using synthetic data.",
    templateTitle: "Churn Risk Upload Example",
    templateRows: [
      { transcript_id: "CX-410", transcript_text: "If this billing issue continues we will switch providers.", customer_sentiment: "negative", churn_signal: "high" },
      { transcript_id: "CX-417", transcript_text: "Service quality is poor but we are waiting to see one more month.", customer_sentiment: "negative", churn_signal: "medium" }
    ]
  },
  "Product Improvement Insights": {
    explanation: "This section translates customer complaints into product and service improvement signals that leadership can act on.",
    whyItMatters: "Complaints can be noisy, but recurring patterns often point to one feature, flow, or policy that needs fixing.",
    decisionSupport: "Use it to decide which product or service changes are most likely to improve trust and reduce avoidable pressure.",
    csvUse: "CSV files are useful when product and complaint signals are already logged in structured support exports.",
    textUse: "Text files are useful for PM notes, QA summaries, and frontline observations about what customers keep struggling with.",
    expectedFields: ["transcript_id", "transcript_text", "issue_type"],
    syntheticNote: "This page will still work with synthetic sample data if no upload is provided.",
    templateTitle: "Product Signal Example",
    templateRows: [
      { transcript_id: "CX-522", transcript_text: "The self-service flow is too confusing for first-time users.", issue_type: "usability" },
      { transcript_id: "CX-530", transcript_text: "Billing wording creates avoidable mistrust every month.", issue_type: "billing wording" }
    ]
  },
  "Knowledge & Trends": {
    explanation: "This section gives management a lightweight knowledge layer for trend notes, service lessons, and executive CX briefings.",
    whyItMatters: "When teams rely only on memory, the same customer problems keep surprising leadership.",
    decisionSupport: "Use it to query prior complaint patterns, generate management briefs, and prepare sharper CX reviews.",
    csvUse: "CSV files help when trend observations are tied to structured transcript or queue exports.",
    textUse: "Text files are ideal for manager notes, escalation summaries, and recurring issue memos.",
    expectedFields: ["transcript_id", "transcript_text", "issue_type", "customer_sentiment"],
    syntheticNote: "If no upload is available, Run Analysis will still refresh this section with built-in trend notes.",
    templateTitle: "Knowledge & Trends Example",
    templateRows: [
      { transcript_id: "CX-610", transcript_text: "Billing complaints spike after invoice format changes.", issue_type: "billing trust", customer_sentiment: "negative" },
      { transcript_id: "CX-618", transcript_text: "Network complaints rise most sharply in one region after 7pm.", issue_type: "service quality", customer_sentiment: "negative" }
    ]
  },
  "About": {
    explanation: "This page explains the product scope, the kind of support data the app expects, and the type of leadership conversations it is built to support.",
    whyItMatters: "It helps partners, recruiters, operators, and SME leaders understand the value of the product quickly.",
    decisionSupport: "Use it to communicate product value, expected inputs, and demo readiness without over-explaining the interface.",
    csvUse: "CSV files are useful when you want the demo to show the real customer-support sources behind the analysis.",
    textUse: "Text files work well for service context, process notes, and customer-trust background.",
    expectedFields: ["transcript_id", "transcript_text", "customer_sentiment", "issue_type"],
    syntheticNote: "The About page remains demo-ready even when no real support data is uploaded.",
    templateTitle: "Support Source Example",
    templateRows: [
      { transcript_id: "CX-001", transcript_text: "Structured support export from the main queue.", customer_sentiment: "mixed", issue_type: "source mapping" },
      { transcript_id: "CX-002", transcript_text: "Manager note summarising top weekly complaint patterns.", customer_sentiment: "n/a", issue_type: "context note" }
    ]
  }
};

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState("No upload detected, so synthetic data will be used.");
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  useEffect(() => {
    fetchWorkspace()
      .then((payload) => {
        setWorkspace(payload);
        setKnowledgeRows(payload.knowledge.query_results);
        setBrief(payload.executive_brief);
        setCopilotResponses(payload.agents.executive_copilot);
        setStatus("Synthetic CX workspace loaded.");
        setAnalysisStatus("Analysis completed using synthetic demo workspace.");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("Unable to load CX workspace.");
      });
  }, []);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setError("");
    if (files.length === 0) {
      setAnalysisStatus("No upload detected, so synthetic data will be used.");
      return;
    }
    try {
      const validationMessage = await validateWorkspaceFiles(files);
      setAnalysisStatus(`${validationMessage} Click Run Analysis to refresh this section.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload validation failed.";
      setError(message);
      setAnalysisStatus(message);
    }
  }

  async function runAnalysis() {
    setIsRunningAnalysis(true);
    setError("");
    setStatus("Refreshing CX analysis...");
    try {
      const payload = selectedFiles.length > 0 ? await analyzeWorkspace(selectedFiles) : await fetchWorkspace();
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge.query_results);
      setBrief(payload.executive_brief);
      setCopilotResponses(payload.agents.executive_copilot);
      setStatus(selectedFiles.length > 0 ? "Uploaded file validated successfully. Report refreshed." : "Analysis completed using synthetic demo workspace.");
      setAnalysisStatus(selectedFiles.length > 0 ? "Analysis completed using uploaded template." : "Analysis completed using synthetic demo data.");
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
          downloadHref="/templates/cx-transcript-template.csv"
          downloadLabel="Download CX Template"
        />
        <RunAnalysisPanel
          status={analysisStatus}
          helperText="Run Analysis will refresh the current report using your uploaded transcripts when available, or the built-in synthetic sample when no file has been selected."
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
            <p className="muted">Upload transcript CSV or text notes, then click Run Analysis. If nothing is uploaded, the app will use the synthetic service dataset.</p>
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
            {renderToolkit(section)}
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
            {renderToolkit(section)}
            <DataTable title="Transcript Dataset" rows={workspace.transcripts} />
            <div className="dual-grid">
              <div className="callout"><h3>Transcript Classification Agent</h3><p>{workspace.agents.transcript_classification}</p></div>
              <div className="callout"><h3>Sentiment & Severity Agent</h3><p>{workspace.agents.sentiment_severity}</p></div>
            </div>
          </SectionPanel>
        ) : null}

        {section === "Root Cause Engine" ? (
          <SectionPanel title="Root Cause Engine" subtitle="Group issues by operational cause rather than only by queue or channel.">
            {renderToolkit(section)}
            <DataTable title="Root Cause Clusters" rows={workspace.root_causes} />
            <div className="callout"><h3>Root Cause Agent</h3><p>{workspace.agents.root_cause}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Churn Risk Engine" ? (
          <SectionPanel title="Churn Risk Engine" subtitle="Spot service conditions that are most likely to turn into customer loss.">
            {renderToolkit(section)}
            <DataTable title="High-Signal Transcripts" rows={workspace.transcripts.filter((row) => String(row.churn_signal).toLowerCase() === "high")} />
            <div className="callout"><h3>Churn Risk Agent</h3><p>{workspace.agents.churn_risk}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Product Improvement Insights" ? (
          <SectionPanel title="Product Improvement Insights" subtitle="Translate transcript patterns into product and service changes with commercial value.">
            {renderToolkit(section)}
            <DataTable title="Product Signals" rows={workspace.product_signals} />
            <div className="callout"><h3>Product Improvement Agent</h3><p>{workspace.agents.product_improvement}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Knowledge & Trends" ? (
          <SectionPanel title="Knowledge & Trends" subtitle="Query trend notes, create executive briefings, and stress-test service decisions.">
            {renderToolkit(section)}
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
            {renderToolkit(section)}
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

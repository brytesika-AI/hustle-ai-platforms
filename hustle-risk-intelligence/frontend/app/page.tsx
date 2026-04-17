"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { RunAnalysisPanel } from "../../../shared/frontend/ux/RunAnalysisPanel";
import { SectionExplanation } from "../../../shared/frontend/ux/SectionExplanation";
import { TemplatePreview } from "../../../shared/frontend/ux/TemplatePreview";
import { UploadGuidance } from "../../../shared/frontend/ux/UploadGuidance";
import { BarChart } from "../components/BarChart";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { SectionPanel } from "../components/SectionPanel";
import { analyzeWorkspace, fetchWorkspace, generateBrief, queryKnowledge, requestCopilot, validateWorkspaceFiles } from "../lib/api";
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
  "Executive Risk Overview": {
    explanation: "This overview shows where financial, operational, supplier, customer, and compliance pressure may be building across the business.",
    whyItMatters: "SMEs usually feel risk through cash stress, supplier disruption, or customer concentration before it is formally reported.",
    decisionSupport: "Use it to decide which risk cluster deserves leadership attention first.",
    csvUse: "CSV files are best for risk registers, exposure trackers, and dependency records.",
    textUse: "Text files help when risk context is mostly in management notes or committee observations.",
    expectedFields: ["category", "status", "note"],
    syntheticNote: "If no file is uploaded, Run Analysis will refresh the report using the built-in synthetic risk workspace.",
    templateTitle: "Risk Template Preview",
    templateRows: [
      { category: "financial risk", status: "watch", note: "Collections lag widened after two major invoices were paid late." },
      { category: "supplier dependency", status: "high", note: "One supplier still carries too much operational leverage." }
    ]
  },
  "Financial Risk Monitoring": {
    explanation: "This report highlights financial pressure signals such as collections drag, cash strain, or receivables risk.",
    whyItMatters: "Financial risk often compounds quietly before leadership notices it in formal reporting.",
    decisionSupport: "Use it to decide where finance discipline needs immediate follow-up.",
    csvUse: "Upload risk-register CSV files with financial categories when you want this view refreshed from live data.",
    textUse: "Text files help when the clearest signal is described in management notes rather than a spreadsheet.",
    expectedFields: ["category", "status", "note"],
    syntheticNote: "The financial risk view still works with synthetic data when no upload is provided.",
    templateTitle: "Financial Risk Example",
    templateRows: [
      { category: "financial risk", status: "watch", note: "Collections lag widened after two major invoices were paid late." },
      { category: "cashflow", status: "high", note: "Working-capital pressure is tightening in month end." }
    ]
  },
  "Operational Risk Monitoring": {
    explanation: "This section tracks execution risk, delivery inconsistency, and process friction that can affect customer outcomes or cost.",
    whyItMatters: "Operational problems often become financial problems if they are allowed to persist.",
    decisionSupport: "Use it to decide which operating issues should be escalated early.",
    csvUse: "CSV files are useful when operational risks are logged in a tracker or spreadsheet.",
    textUse: "Text files help when branch-level or manager notes carry the real context.",
    expectedFields: ["category", "status", "note"],
    syntheticNote: "No upload detected? The operational risk report will still run on demo data.",
    templateTitle: "Operational Risk Example",
    templateRows: [
      { category: "operations", status: "medium", note: "Fulfilment delays are rising in one branch." },
      { category: "operations", status: "watch", note: "Staff cover is tight during weekend peaks." }
    ]
  },
  "Supplier & Dependency Risk": {
    explanation: "This report shows where supplier concentration or dependency is creating business vulnerability.",
    whyItMatters: "One supplier holding too much leverage can quickly affect stock, service, and bargaining power.",
    decisionSupport: "Use it to decide where diversification or renegotiation should start.",
    csvUse: "CSV files are best for supplier dependency trackers and concentration records.",
    textUse: "Text files help when procurement comments explain hidden supplier risk.",
    expectedFields: ["category", "status", "note", "supplier", "concentration_pct"],
    syntheticNote: "The supplier-risk section can still be demonstrated well with synthetic data.",
    templateTitle: "Supplier Risk Example",
    templateRows: [
      { category: "supplier dependency", status: "high", note: "One supplier still carries too much operational leverage.", supplier: "Metro Inputs", concentration_pct: 44 },
      { category: "supplier dependency", status: "medium", note: "Backup supplier not yet fully onboarded.", supplier: "Northern Packaging", concentration_pct: 21 }
    ]
  },
  "Customer Concentration Risk": {
    explanation: "This section highlights where too much revenue or operating dependence sits with a narrow customer group.",
    whyItMatters: "Customer concentration can feel comfortable until one account changes behavior or delays payment.",
    decisionSupport: "Use it to decide which accounts need closer monitoring or diversification planning.",
    csvUse: "Upload customer-risk CSV files when you want the concentration view to reflect live exposure.",
    textUse: "Text files are useful for account notes, churn concerns, or commercial context.",
    expectedFields: ["category", "status", "note", "customer", "revenue_share_pct"],
    syntheticNote: "No upload is required for demo use. The customer-risk view still runs with synthetic data.",
    templateTitle: "Customer Risk Example",
    templateRows: [
      { category: "customer concentration", status: "medium", note: "One anchor customer still carries a meaningful share of revenue.", customer: "Anchor Retail Group", revenue_share_pct: 28 },
      { category: "customer concentration", status: "watch", note: "A second customer cluster is growing in exposure.", customer: "City Wholesale", revenue_share_pct: 14 }
    ]
  },
  "Risk Scenario Copilot": {
    explanation: "This copilot helps leadership test which risk cluster should be mitigated first and why.",
    whyItMatters: "SMEs need practical judgment support, not just a longer list of warnings.",
    decisionSupport: "Use it to compare mitigation priorities before risk compounds.",
    csvUse: "Upload a completed risk template if you want the copilot to work from your own register.",
    textUse: "Text files help when scenario thinking depends on leadership notes or committee context.",
    expectedFields: ["category", "status", "note"],
    syntheticNote: "The risk copilot remains usable with the synthetic workspace when nothing is uploaded.",
    templateTitle: "Risk Copilot Example",
    templateRows: [
      { category: "supplier dependency", status: "high", note: "One supplier still carries too much operational leverage." },
      { category: "financial risk", status: "watch", note: "Collections lag widened after two major invoices were paid late." }
    ]
  },
  "About": {
    explanation: "This page explains the risk use case, expected uploads, and the type of management decisions the app supports.",
    whyItMatters: "It gives founders, recruiters, and partners a quick understanding of the product.",
    decisionSupport: "Use it to explain the product clearly without overwhelming the audience.",
    csvUse: "CSV files are useful when you want the About view to reflect real risk source data.",
    textUse: "Text files help when most of the business context sits in notes or memos.",
    expectedFields: ["category", "status", "note"],
    syntheticNote: "The About page remains credible even when only the synthetic workspace is available.",
    templateTitle: "Risk Source Example",
    templateRows: [
      { category: "financial risk", status: "watch", note: "Collections lag widened after two major invoices were paid late." },
      { category: "supplier dependency", status: "high", note: "One supplier still carries too much operational leverage." }
    ]
  }
};

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState("No upload detected, so synthetic data will be used.");
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  useEffect(() => {
    fetchWorkspace().then((payload) => {
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge_results);
      setBrief(payload.executive_brief);
      setCopilotResponses(payload.agents.risk_copilot);
      setStatus("Synthetic risk workspace loaded.");
      setAnalysisStatus("Analysis completed using synthetic demo workspace.");
    }).catch((err: Error) => {
      setError(err.message);
      setStatus("Unable to load risk workspace.");
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
    setStatus("Refreshing risk analysis...");
    try {
      const payload = selectedFiles.length > 0 ? await analyzeWorkspace(selectedFiles) : await fetchWorkspace();
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge_results);
      setBrief(payload.executive_brief);
      setCopilotResponses(payload.agents.risk_copilot);
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

  async function runKnowledgeQuery() { try { setKnowledgeRows(await queryKnowledge(query)); } catch (err) { setError(err instanceof Error ? err.message : "Knowledge query failed."); } }
  async function runBrief() { try { setBrief(await generateBrief(briefTopic)); } catch (err) { setError(err instanceof Error ? err.message : "Brief generation failed."); } }
  async function runCopilot() { if (!workspace) return; try { setCopilotResponses(await requestCopilot(question, workspace.metrics)); } catch (err) { setError(err instanceof Error ? err.message : "Copilot failed."); } }

  function renderToolkit(currentSection: SectionName) {
    const config = sectionConfigs[currentSection];
    return (<><SectionExplanation title={`${currentSection} Report Guide`} description={config.explanation} whyItMatters={config.whyItMatters} decisionSupport={config.decisionSupport} /><UploadGuidance acceptedFiles={sharedAcceptedFiles} csvUse={config.csvUse} textUse={config.textUse} expectedFields={config.expectedFields} syntheticNote={config.syntheticNote} /><TemplatePreview title={config.templateTitle} rows={config.templateRows} downloadHref="/templates/risk-template.csv" downloadLabel="Download Risk Template" /><RunAnalysisPanel status={analysisStatus} helperText="Run Analysis will refresh the current risk report using your uploaded data when available, or use the built-in synthetic sample if nothing has been uploaded." onRunAnalysis={runAnalysis} isRunning={isRunningAnalysis} /></>);
  }

  if (!workspace) return <main className="main-grid"><div className="panel" style={{ gridColumn: "1 / -1" }}><h2 className="section-title">Preparing Hustle Risk Intelligence</h2><p className="section-subtitle">{status}</p>{error ? <p>{error}</p> : null}</div></main>;

  return <main className="main-grid"><aside className="nav-panel"><div className="stack"><div><strong>Sections</strong><div className="nav-list" style={{ marginTop: 12 }}>{sectionNames.map((name) => <button key={name} className={`nav-button ${section === name ? "active" : ""}`} onClick={() => setSection(name)}>{name}</button>)}</div></div><div className="upload-panel"><h3 style={{ marginTop: 0 }}>Risk Inputs</h3><p className="muted">Download the risk template, fill it in with your own exposure notes, upload it, then click Run Analysis. Synthetic fallback data still works.</p><input className="file-input" type="file" multiple onChange={onFileChange} /><p className="muted" style={{ marginBottom: 0 }}>{status}</p></div></div></aside><div className="content">{section === "Executive Risk Overview" ? <><section className="panel"><h2 className="section-title">Executive Risk Overview</h2><p className="section-subtitle">Leadership visibility across financial, operational, supplier, customer, and compliance exposures.</p></section>{renderToolkit(section)}<div className="metrics-grid"><MetricCard label="Overall Risk Score" value={workspace.metrics.overall_risk_score} /><MetricCard label="Financial Risk" value={workspace.metrics.financial_risk_score} /><MetricCard label="Supplier Risk" value={workspace.metrics.supplier_risk_score} /></div><BarChart title="Risk Exposure Overview" rows={workspace.risk_table} /><div className="code-block"><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre></div></> : null}{section === "Financial Risk Monitoring" ? <SectionPanel title="Financial Risk Monitoring" subtitle="Cash-cover strain, receivables pressure, and downside exposure.">{renderToolkit(section)}<DataTable title="Risk Register" rows={workspace.risk_rows} /><div className="callout"><h3>Financial Risk Agent</h3><p>{workspace.agents.financial_risk}</p></div></SectionPanel> : null}{section === "Operational Risk Monitoring" ? <SectionPanel title="Operational Risk Monitoring" subtitle="Execution, service delivery, and process slippage visibility.">{renderToolkit(section)}<DataTable title="Operational View" rows={workspace.risk_rows.filter((row) => String(row.category).toLowerCase() === "operations")} /><div className="callout"><h3>Operational Risk Agent</h3><p>{workspace.agents.operational_risk}</p></div></SectionPanel> : null}{section === "Supplier & Dependency Risk" ? <SectionPanel title="Supplier & Dependency Risk" subtitle="Dependency concentration and supply-side resilience.">{renderToolkit(section)}<DataTable title="Supplier Exposure" rows={workspace.supplier_rows} /><div className="callout"><h3>Supplier Risk Agent</h3><p>{workspace.agents.supplier_risk}</p></div></SectionPanel> : null}{section === "Customer Concentration Risk" ? <SectionPanel title="Customer Concentration Risk" subtitle="Revenue dependence on narrow customer sets.">{renderToolkit(section)}<DataTable title="Customer Exposure" rows={workspace.customer_rows} /><div className="callout"><h3>Customer Risk Agent</h3><p>{workspace.agents.customer_risk}</p></div></SectionPanel> : null}{section === "Risk Scenario Copilot" ? <SectionPanel title="Risk Scenario Copilot" subtitle="Stress-test management decisions before risk compounds.">{renderToolkit(section)}<div><label htmlFor="risk-question">Scenario question</label><textarea id="risk-question" className="textarea" value={question} onChange={(event) => setQuestion(event.target.value)} /><div className="button-row" style={{ marginTop: 12 }}><button className="button" onClick={runCopilot}>Run Risk Copilot</button></div></div>{Object.entries(copilotResponses).map(([agent, response]) => <div className="callout" key={agent}><h3>{agent}</h3><p>{response}</p></div>)}<div className="upload-grid"><div className="panel"><label htmlFor="risk-query">Risk notes query</label><input id="risk-query" className="input" value={query} onChange={(event) => setQuery(event.target.value)} /><div className="button-row" style={{ marginTop: 12 }}><button className="button" onClick={runKnowledgeQuery}>Run Query</button></div></div><div className="panel"><label htmlFor="brief-topic">Brief topic</label><input id="brief-topic" className="input" value={briefTopic} onChange={(event) => setBriefTopic(event.target.value)} /><div className="button-row" style={{ marginTop: 12 }}><button className="button" onClick={runBrief}>Generate Brief</button></div></div></div><DataTable title="Risk Notes" rows={knowledgeRows} /></SectionPanel> : null}{section === "About" ? <SectionPanel title="About" subtitle="Executive-grade risk visibility for African businesses.">{renderToolkit(section)}<div className="callout"><h3>Platform Scope</h3><p>Hustle Risk Intelligence helps leadership teams see overlapping financial, operational, supplier, customer, and compliance exposures before they become more expensive problems.</p></div><DataTable title="Workspace Sources" rows={Object.entries(workspace.sources).map(([area, source]) => ({ area, source }))} /></SectionPanel> : null}{error ? <div className="callout"><h3>Notice</h3><p>{error}</p></div> : null}</div></main>;
}

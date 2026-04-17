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
  "Executive Inventory Overview",
  "Stock Visibility",
  "Reorder Intelligence",
  "Dead Stock & Slow-Moving Items",
  "Supplier Dependency View",
  "Inventory Decision Copilot",
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
  "Executive Inventory Overview": {
    explanation: "This overview shows whether stock availability, reorder timing, and supplier concentration are supporting reliable operations.",
    whyItMatters: "SMEs often lose cash and customer trust when inventory pressure is spotted too late.",
    decisionSupport: "Use it to decide where leadership should tighten replenishment, reduce slow stock, or challenge supplier dependence.",
    csvUse: "CSV files are best for stock, supplier, and sales-history exports from spreadsheets or inventory systems.",
    textUse: "Text files help when managers want to add branch notes, supplier comments, or operational context.",
    expectedFields: ["sku", "on_hand", "weekly_demand", "reorder_point", "supplier_name"],
    syntheticNote: "If you do not upload anything, Run Analysis will refresh the report using the built-in synthetic inventory workspace.",
    templateTitle: "Inventory Template Preview",
    templateRows: [
      { sku: "COOK-12", on_hand: 42, weekly_demand: 18, reorder_point: 48, dead_stock_days: 6, supplier_name: "Metro Inputs" },
      { sku: "SOAP-08", on_hand: 210, weekly_demand: 12, reorder_point: 80, dead_stock_days: 34, supplier_name: "Northern Packaging" }
    ]
  },
  "Stock Visibility": {
    explanation: "This report shows the live stock position and highlights where coverage is healthy, tight, or becoming risky.",
    whyItMatters: "A founder usually feels stock pressure after customers complain. This section helps leadership see it earlier.",
    decisionSupport: "Use it to decide which SKUs or branches need immediate inventory attention.",
    csvUse: "Upload stock register CSV files when you want this view to reflect current on-hand and demand conditions.",
    textUse: "Text files are useful for warehouse notes, branch observations, and stock review comments.",
    expectedFields: ["sku", "on_hand", "weekly_demand", "reorder_point"],
    syntheticNote: "No upload detected? The stock view will still work with synthetic demo data.",
    templateTitle: "Stock Visibility Example",
    templateRows: [
      { sku: "COOK-12", on_hand: 42, weekly_demand: 18, reorder_point: 48 },
      { sku: "FLOUR-25", on_hand: 66, weekly_demand: 30, reorder_point: 52 }
    ]
  },
  "Reorder Intelligence": {
    explanation: "This section identifies where replenishment should move first before service levels or branch confidence weaken.",
    whyItMatters: "Reorder timing is one of the easiest places for SMEs to lose working capital or stock availability.",
    decisionSupport: "Use it to decide which SKUs should be reordered now and which can wait.",
    csvUse: "CSV files are best when reorder logic is being driven from stock and demand records.",
    textUse: "Text files help when reorder choices depend on seasonal notes or supplier commentary.",
    expectedFields: ["sku", "on_hand", "weekly_demand", "reorder_point"],
    syntheticNote: "The reorder report still runs with synthetic data if no CSV is uploaded.",
    templateTitle: "Reorder Example",
    templateRows: [
      { sku: "COOK-12", on_hand: 42, weekly_demand: 18, reorder_point: 48 },
      { sku: "FLOUR-25", on_hand: 66, weekly_demand: 30, reorder_point: 52 }
    ]
  },
  "Dead Stock & Slow-Moving Items": {
    explanation: "This report shows where stock has stayed too long and may be tying up cash that the business needs elsewhere.",
    whyItMatters: "Slow stock quietly weakens SMEs because the cash looks available on paper but is trapped in inventory.",
    decisionSupport: "Use it to decide what to clear, bundle, or reduce in the next buying cycle.",
    csvUse: "Upload inventory-aging CSV files to refresh the slow-moving and dead-stock view.",
    textUse: "Text files are useful for branch notes explaining why some stock has stopped moving.",
    expectedFields: ["sku", "dead_stock_days", "on_hand", "supplier_name"],
    syntheticNote: "No upload is required for demo use. Synthetic inventory aging will still run.",
    templateTitle: "Dead Stock Example",
    templateRows: [
      { sku: "SOAP-08", dead_stock_days: 34, on_hand: 210, supplier_name: "Northern Packaging" },
      { sku: "COOK-12", dead_stock_days: 6, on_hand: 42, supplier_name: "Metro Inputs" }
    ]
  },
  "Supplier Dependency View": {
    explanation: "This section highlights where supplier concentration or delivery delays are creating operational dependence.",
    whyItMatters: "Supplier concentration can become a hidden risk long before it shows up as a visible stockout.",
    decisionSupport: "Use it to decide where to diversify supply or negotiate differently.",
    csvUse: "CSV files are best for supplier, dependency, and delay-history records.",
    textUse: "Text files help when procurement notes explain vendor reliability concerns.",
    expectedFields: ["sku", "supplier_name", "dependency_pct", "avg_delay_days"],
    syntheticNote: "The supplier view can still demonstrate clearly with synthetic demo data.",
    templateTitle: "Supplier Dependency Example",
    templateRows: [
      { sku: "COOK-12", supplier_name: "Metro Inputs", dependency_pct: 44, avg_delay_days: 5 },
      { sku: "SOAP-08", supplier_name: "Northern Packaging", dependency_pct: 21, avg_delay_days: 3 }
    ]
  },
  "Inventory Decision Copilot": {
    explanation: "This copilot helps leadership compare stock, reorder, and supplier choices before they create service or cashflow problems.",
    whyItMatters: "SMEs need disciplined operating choices, not just more data points.",
    decisionSupport: "Use it to test which inventory issue deserves action first this month.",
    csvUse: "Upload a completed inventory CSV if you want the copilot to reason from your current stock picture.",
    textUse: "Text files are useful for demand notes, supplier comments, and manager observations.",
    expectedFields: ["sku", "on_hand", "weekly_demand", "reorder_point", "supplier_name"],
    syntheticNote: "The copilot will still work with the synthetic workspace if nothing is uploaded.",
    templateTitle: "Inventory Copilot Example",
    templateRows: [
      { sku: "COOK-12", on_hand: 42, weekly_demand: 18, reorder_point: 48, supplier_name: "Metro Inputs" },
      { sku: "SOAP-08", on_hand: 210, weekly_demand: 12, reorder_point: 80, supplier_name: "Northern Packaging" }
    ]
  },
  "About": {
    explanation: "This page explains the inventory use case, expected inputs, and the operating decisions the product is built to support.",
    whyItMatters: "It helps SME operators, recruiters, and partners understand the product quickly.",
    decisionSupport: "Use it to explain the value of the inventory platform without overcomplicating it.",
    csvUse: "CSV files are useful when you want the About view to reflect real inventory source data.",
    textUse: "Text files help when warehouse or supplier context matters alongside the spreadsheet.",
    expectedFields: ["sku", "on_hand", "weekly_demand", "supplier_name"],
    syntheticNote: "The About page remains clear even when only the synthetic workspace is available.",
    templateTitle: "Inventory Source Example",
    templateRows: [
      { sku: "COOK-12", on_hand: 42, weekly_demand: 18, supplier_name: "Metro Inputs" },
      { sku: "FLOUR-25", on_hand: 66, weekly_demand: 30, supplier_name: "Harvest Milling" }
    ]
  }
};

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState("No upload detected, so synthetic data will be used.");
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  useEffect(() => {
    fetchWorkspace().then((payload) => {
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge_results);
      setBrief(payload.executive_brief);
      setCopilotResponses(payload.agents.inventory_copilot);
      setStatus("Synthetic inventory workspace loaded.");
      setAnalysisStatus("Analysis completed using synthetic demo workspace.");
    }).catch((err: Error) => {
      setError(err.message);
      setStatus("Unable to load inventory workspace.");
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
    setStatus("Refreshing inventory analysis...");
    try {
      const payload = selectedFiles.length > 0 ? await analyzeWorkspace(selectedFiles) : await fetchWorkspace();
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge_results);
      setBrief(payload.executive_brief);
      setCopilotResponses(payload.agents.inventory_copilot);
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
    return (<><SectionExplanation title={`${currentSection} Report Guide`} description={config.explanation} whyItMatters={config.whyItMatters} decisionSupport={config.decisionSupport} /><UploadGuidance acceptedFiles={sharedAcceptedFiles} csvUse={config.csvUse} textUse={config.textUse} expectedFields={config.expectedFields} syntheticNote={config.syntheticNote} /><TemplatePreview title={config.templateTitle} rows={config.templateRows} downloadHref="/templates/inventory-template.csv" downloadLabel="Download Inventory Template" /><RunAnalysisPanel status={analysisStatus} helperText="Run Analysis will refresh the current inventory report using your uploaded data when available, or use the built-in synthetic sample if nothing has been uploaded." onRunAnalysis={runAnalysis} isRunning={isRunningAnalysis} /></>);
  }

  if (!workspace) return <main className="main-grid"><div className="panel" style={{ gridColumn: "1 / -1" }}><h2 className="section-title">Preparing Hustle Inventory Intelligence</h2><p className="section-subtitle">{status}</p>{error ? <p>{error}</p> : null}</div></main>;

  const slowMoving = workspace.inventory_rows.filter((row) => Number(row.dead_stock_days) > 20);
  const lowCover = workspace.inventory_rows.filter((row) => Number(row.stock_on_hand) < Number(row.reorder_point));
  const supplierRows = workspace.inventory_rows.map((row) => ({ sku: row.sku, supplier_name: row.supplier_name, dependency_pct: row.dependency_pct, avg_delay_days: row.avg_delay_days, category: row.category })).sort((a, b) => Number(b.dependency_pct) - Number(a.dependency_pct));

  return <main className="main-grid"><aside className="nav-panel"><div className="stack"><div><strong>Sections</strong><div className="nav-list" style={{ marginTop: 12 }}>{sectionNames.map((name) => <button key={name} className={`nav-button ${section === name ? "active" : ""}`} onClick={() => setSection(name)}>{name}</button>)}</div></div><div className="upload-panel"><h3 style={{ marginTop: 0 }}>Inventory Inputs</h3><p className="muted">Download the inventory template, fill it in with your stock data, upload it, then click Run Analysis. Synthetic sample data still works by default.</p><input className="file-input" type="file" multiple onChange={onFileChange} /><p className="muted" style={{ marginBottom: 0 }}>{status}</p></div></div></aside><div className="content">{section === "Executive Inventory Overview" ? <><section className="panel"><h2 className="section-title">Executive Inventory Overview</h2><p className="section-subtitle">Leadership visibility into stock availability, reorder timing, dead stock, and supplier dependency.</p></section>{renderToolkit(section)}<div className="metrics-grid"><MetricCard label="Inventory Health" value={workspace.metrics.inventory_health_score} /><MetricCard label="Stockout Risk" value={workspace.metrics.stockout_risk_score} /><MetricCard label="Reorder Coverage" value={workspace.metrics.reorder_coverage_score} /></div><BarChart title="Inventory Risk and Health" rows={workspace.metric_table} /><div className="code-block"><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{brief}</pre></div></> : null}{section === "Stock Visibility" ? <SectionPanel title="Stock Visibility" subtitle="Current stock position, daily demand, margin, and cover.">{renderToolkit(section)}<DataTable title="Inventory Register" rows={workspace.inventory_rows} /><div className="callout"><h3>Stock Visibility Agent</h3><p>{workspace.agents.stock_visibility}</p></div></SectionPanel> : null}{section === "Reorder Intelligence" ? <SectionPanel title="Reorder Intelligence" subtitle="Identify where replenishment should move before service quality degrades.">{renderToolkit(section)}<DataTable title="Reorder Priorities" rows={lowCover} /><div className="callout"><h3>Reorder Intelligence Agent</h3><p>{workspace.agents.reorder_intelligence}</p></div></SectionPanel> : null}{section === "Dead Stock & Slow-Moving Items" ? <SectionPanel title="Dead Stock & Slow-Moving Items" subtitle="Reduce working-capital drag from slower-moving inventory.">{renderToolkit(section)}<DataTable title="Slow-Moving Inventory" rows={slowMoving} /><div className="callout"><h3>Dead Stock Agent</h3><p>{workspace.agents.dead_stock}</p></div></SectionPanel> : null}{section === "Supplier Dependency View" ? <SectionPanel title="Supplier Dependency View" subtitle="See inventory exposure created by concentration and delay risk.">{renderToolkit(section)}<DataTable title="Supplier Dependency" rows={supplierRows} /><div className="callout"><h3>Supplier Dependency Agent</h3><p>{workspace.agents.supplier_dependency}</p></div></SectionPanel> : null}{section === "Inventory Decision Copilot" ? <SectionPanel title="Inventory Decision Copilot" subtitle="Stress-test inventory decisions before they create stock or working-capital problems.">{renderToolkit(section)}<div><label htmlFor="inventory-question">Inventory question</label><textarea id="inventory-question" className="textarea" value={question} onChange={(event) => setQuestion(event.target.value)} /><div className="button-row" style={{ marginTop: 12 }}><button className="button" onClick={runCopilot}>Run Inventory Copilot</button></div></div>{Object.entries(copilotResponses).map(([agent, response]) => <div className="callout" key={agent}><h3>{agent}</h3><p>{response}</p></div>)}<div className="upload-grid"><div className="panel"><label htmlFor="inventory-query">Inventory notes query</label><input id="inventory-query" className="input" value={query} onChange={(event) => setQuery(event.target.value)} /><div className="button-row" style={{ marginTop: 12 }}><button className="button" onClick={runKnowledgeQuery}>Run Query</button></div></div><div className="panel"><label htmlFor="brief-topic">Brief topic</label><input id="brief-topic" className="input" value={briefTopic} onChange={(event) => setBriefTopic(event.target.value)} /><div className="button-row" style={{ marginTop: 12 }}><button className="button" onClick={runBrief}>Generate Brief</button></div></div></div><DataTable title="Inventory Notes" rows={knowledgeRows} /></SectionPanel> : null}{section === "About" ? <SectionPanel title="About" subtitle="Executive-grade inventory intelligence for African businesses.">{renderToolkit(section)}<div className="callout"><h3>Platform Scope</h3><p>Hustle Inventory Intelligence helps leadership teams reduce stockouts, improve replenishment timing, surface supplier dependency, and cut slow-moving inventory drag.</p></div><DataTable title="Workspace Sources" rows={Object.entries(workspace.sources).map(([area, source]) => ({ area, source }))} /></SectionPanel> : null}{error ? <div className="callout"><h3>Notice</h3><p>{error}</p></div> : null}</div></main>;
}

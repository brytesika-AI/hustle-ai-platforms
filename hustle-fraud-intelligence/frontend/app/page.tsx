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
  "Executive Fraud & Risk Overview": {
    explanation: "This overview shows where fraud and control pressure may be building across transactions, suppliers, expenses, refunds, and leadership oversight.",
    whyItMatters: "For an SME, even a few weak controls can damage cash flow, trust, and management focus very quickly.",
    decisionSupport: "Use it to decide which control area should be reviewed first this week before losses or reputational issues spread.",
    csvUse: "CSV files are best for transaction, supplier, expense, and claims exports from finance or operations spreadsheets.",
    textUse: "Text files are useful for investigation notes, whistleblower context, and management comments that explain why something looks unusual.",
    expectedFields: ["transaction_id", "date", "vendor", "amount", "risk_flag", "refund_flag"],
    syntheticNote: "If no file is uploaded, Run Analysis will refresh the page using the built-in synthetic fraud workspace.",
    templateTitle: "Fraud Workspace Template Preview",
    templateRows: [
      { transaction_id: "TRX-10014", date: "2026-03-11", vendor: "Kafue Trade Supplies", amount: 18450, risk_flag: 1, refund_flag: 0 },
      { transaction_id: "TRX-10031", date: "2026-03-14", vendor: "Lusaka Field Services", amount: 9200, risk_flag: 0, refund_flag: 1 }
    ]
  },
  "Transaction Anomaly Detection": {
    explanation: "This report surfaces unusual transaction patterns so teams can review the right records before they become costly problems.",
    whyItMatters: "Fraud risk often starts as a pattern that looks slightly off rather than a single dramatic event.",
    decisionSupport: "Use it to decide which transactions deserve immediate verification and which ones can wait for routine review.",
    csvUse: "Upload transaction CSV files when you want anomaly scoring to reflect the latest payment activity.",
    textUse: "Text files help when investigators need to include context from branch teams or finance reviewers.",
    expectedFields: ["transaction_id", "date", "vendor", "amount", "risk_flag"],
    syntheticNote: "Without an upload, this section will still run using the built-in synthetic demo workspace.",
    templateTitle: "Transaction Anomaly Example",
    templateRows: [
      { transaction_id: "TRX-10014", date: "2026-03-11", vendor: "Kafue Trade Supplies", amount: 18450, risk_flag: 1 },
      { transaction_id: "TRX-10022", date: "2026-03-12", vendor: "Copperbelt Courier Hub", amount: 7350, risk_flag: 0 }
    ]
  },
  "Procurement & Supplier Fraud Signals": {
    explanation: "This section highlights supplier patterns that may deserve attention, such as concentration, unusual approvals, or repeated invoice pressure.",
    whyItMatters: "Procurement leakage can quietly drain working capital, especially when trusted supplier relationships are not reviewed often enough.",
    decisionSupport: "Use it to decide which suppliers, approvals, or invoice chains should be escalated for a closer look.",
    csvUse: "CSV files work best for supplier ledgers, invoice histories, and approval logs.",
    textUse: "Text files are useful for procurement comments, escalation notes, and field observations around supplier behavior.",
    expectedFields: ["vendor", "invoice_id", "amount", "approval_status", "risk_flag"],
    syntheticNote: "Synthetic supplier data can still power this report when no live file is uploaded.",
    templateTitle: "Supplier Signal Example",
    templateRows: [
      { vendor: "Kafue Trade Supplies", invoice_id: "INV-771", amount: 18450, approval_status: "manual override", risk_flag: 1 },
      { vendor: "Mansa Office Retail", invoice_id: "INV-814", amount: 4200, approval_status: "approved", risk_flag: 0 }
    ]
  },
  "Expense & Claims Review": {
    explanation: "This report helps the business separate normal operational spending from expense or claims patterns that deserve follow-up.",
    whyItMatters: "Expense leakage can feel small line by line, yet still weaken discipline and cash control over time.",
    decisionSupport: "Use it to decide which claims, reimbursements, or spending categories should be reviewed first.",
    csvUse: "Upload expense or claims CSV files when you want review signals to reflect live operating records.",
    textUse: "Text files help when claims need extra context from managers, auditors, or field teams.",
    expectedFields: ["expense_id", "date", "staff_or_vendor", "amount", "claim_flag", "risk_flag"],
    syntheticNote: "No upload detected? This section will continue with the synthetic demo workspace.",
    templateTitle: "Expense Review Example",
    templateRows: [
      { expense_id: "EXP-301", date: "2026-03-10", staff_or_vendor: "Regional Field Officer", amount: 2850, claim_flag: 1, risk_flag: 0 },
      { expense_id: "EXP-329", date: "2026-03-15", staff_or_vendor: "Lusaka Field Services", amount: 9100, claim_flag: 0, risk_flag: 1 }
    ]
  },
  "Refund & Customer Abuse Monitoring": {
    explanation: "This section shows where refund patterns may be signalling policy abuse, process weakness, or customer handling risk.",
    whyItMatters: "Repeated refunds can hide policy gaps that quietly erode revenue and team confidence.",
    decisionSupport: "Use it to decide which customer cases or refund patterns need immediate operational review.",
    csvUse: "CSV files are best for refund logs, customer case histories, and payment reversals.",
    textUse: "Text files help when service teams need to add case notes or context around unusual refund activity.",
    expectedFields: ["transaction_id", "date", "customer_id", "amount", "refund_flag", "risk_flag"],
    syntheticNote: "The refund-monitoring view will still work with synthetic data when no upload is provided.",
    templateTitle: "Refund Monitoring Example",
    templateRows: [
      { transaction_id: "TRX-10031", date: "2026-03-14", customer_id: "CUS-221", amount: 9200, refund_flag: 1, risk_flag: 1 },
      { transaction_id: "TRX-10035", date: "2026-03-16", customer_id: "CUS-187", amount: 3650, refund_flag: 0, risk_flag: 0 }
    ]
  },
  "Fraud Investigation Copilot": {
    explanation: "This page helps leaders and reviewers structure investigation questions without jumping too quickly to conclusions.",
    whyItMatters: "A disciplined review process helps SMEs protect the business while staying fair and evidence-led.",
    decisionSupport: "Use it to decide what to verify first, which records to compare, and which stakeholders should be involved next.",
    csvUse: "Upload investigation-ready CSV files if you want the copilot to reflect live transaction and supplier patterns.",
    textUse: "Text files are useful for interview notes, branch observations, and control concerns that are not in the spreadsheet.",
    expectedFields: ["transaction_id", "date", "vendor", "amount", "risk_flag", "notes"],
    syntheticNote: "The copilot remains demo-ready even when only the synthetic workspace is available.",
    templateTitle: "Investigation Copilot Example",
    templateRows: [
      { transaction_id: "TRX-10014", date: "2026-03-11", vendor: "Kafue Trade Supplies", amount: 18450, risk_flag: 1, notes: "Manual override followed by split invoice." },
      { transaction_id: "TRX-10031", date: "2026-03-14", vendor: "Lusaka Field Services", amount: 9200, risk_flag: 0, notes: "Refund request escalated after late delivery complaint." }
    ]
  },
  "Governance Briefing": {
    explanation: "This section converts current fraud signals into a leadership-ready governance view that is easier to communicate upward.",
    whyItMatters: "Boards, owners, and senior managers need a clear control story, not just raw anomalies.",
    decisionSupport: "Use it to decide what to escalate, what to monitor, and what action owners should do next.",
    csvUse: "CSV files are useful for structured case logs, findings registers, and control-action trackers.",
    textUse: "Text files help when the strongest governance insight sits inside investigation notes or committee commentary.",
    expectedFields: ["case_id", "theme", "evidence", "owner", "next_action"],
    syntheticNote: "The governance briefing still runs well with synthetic demo data if no file is uploaded.",
    templateTitle: "Governance Briefing Example",
    templateRows: [
      { case_id: "CASE-11", theme: "supplier override", evidence: "Repeated manual approval after threshold breach", owner: "Finance Lead", next_action: "review approval trail" },
      { case_id: "CASE-14", theme: "refund abuse", evidence: "Three linked refund requests in 14 days", owner: "CX Manager", next_action: "tighten refund review" }
    ]
  },
  "About": {
    explanation: "This page explains the fraud and control use case, expected inputs, and the kind of investigation support the platform provides.",
    whyItMatters: "It gives a quick, credible explanation for SME operators, partners, and recruiters viewing the demo publicly.",
    decisionSupport: "Use it to explain how the product supports better control visibility without making legal judgments.",
    csvUse: "CSV files are useful when you want the About view to reflect real fraud and control source data.",
    textUse: "Text files help when you want the story to include governance notes, policy context, or investigation summaries.",
    expectedFields: ["transaction_id", "date", "vendor", "amount", "risk_flag"],
    syntheticNote: "The About page remains polished and useful even when only the synthetic workspace is available.",
    templateTitle: "Fraud Source Example",
    templateRows: [
      { transaction_id: "TRX-10014", date: "2026-03-11", vendor: "Kafue Trade Supplies", amount: 18450, risk_flag: 1 },
      { transaction_id: "TRX-10022", date: "2026-03-12", vendor: "Copperbelt Courier Hub", amount: 7350, risk_flag: 0 }
    ]
  }
};

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState("No upload detected, so synthetic data will be used.");
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  useEffect(() => {
    fetchWorkspace()
      .then((payload) => {
        setWorkspace(payload);
        setKnowledgeRows(payload.knowledge_results);
        setBrief(payload.governance_brief);
        setCopilotResponses(payload.agents.fraud_investigation_copilot);
        setStatus("Synthetic fraud workspace loaded.");
        setAnalysisStatus("Analysis completed using synthetic demo workspace.");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("Unable to load fraud workspace.");
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
    setStatus("Refreshing fraud analysis...");
    try {
      const payload = selectedFiles.length > 0 ? await analyzeWorkspace(selectedFiles) : await fetchWorkspace();
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge_results);
      setBrief(payload.governance_brief);
      setCopilotResponses(payload.agents.fraud_investigation_copilot);
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
          downloadHref="/templates/fraud-transaction-template.csv"
          downloadLabel="Download Fraud Template"
        />
        <RunAnalysisPanel
          status={analysisStatus}
          helperText="Run Analysis will refresh the current fraud report using your uploaded data when available, or use the built-in synthetic sample if nothing has been uploaded."
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
            <p className="muted">Upload transactions, supplier records, expense files, or investigation notes, then click Run Analysis. If no file is uploaded, the demo workspace will be used.</p>
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
            {renderToolkit(section)}
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
            {renderToolkit(section)}
            <DataTable title="Transactions" rows={workspace.transactions} />
            <div className="callout"><h3>Transaction Risk Agent</h3><p>{workspace.agents.transaction_risk}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Procurement & Supplier Fraud Signals" ? (
          <SectionPanel title="Procurement & Supplier Fraud Signals" subtitle="Review supplier concentration and invoice irregularity signals.">
            {renderToolkit(section)}
            <DataTable title="Suppliers" rows={workspace.suppliers} />
            <div className="callout"><h3>Procurement Fraud Agent</h3><p>{workspace.agents.procurement_fraud}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Expense & Claims Review" ? (
          <SectionPanel title="Expense & Claims Review" subtitle="Identify expense and claims anomalies that deserve deeper review.">
            {renderToolkit(section)}
            <DataTable title="Expense And Claims Signals" rows={claimsAndExpenses} />
            <div className="callout"><h3>Expense Review Agent</h3><p>{workspace.agents.expense_review}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Refund & Customer Abuse Monitoring" ? (
          <SectionPanel title="Refund & Customer Abuse Monitoring" subtitle="Monitor repeated refund patterns and customer abuse indicators.">
            {renderToolkit(section)}
            <DataTable title="Refund Signals" rows={refunds} />
            <div className="callout"><h3>Refund Abuse Agent</h3><p>{workspace.agents.refund_abuse}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Fraud Investigation Copilot" ? (
          <SectionPanel title="Fraud Investigation Copilot" subtitle="Sequence review priorities without making accusations or legal conclusions.">
            {renderToolkit(section)}
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
            {renderToolkit(section)}
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
          <SectionPanel title="About" subtitle="Risk management and fraud detection using generative AI in African SMEs.">
            {renderToolkit(section)}
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

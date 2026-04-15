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
  "Executive Revenue Overview",
  "Pricing Intelligence",
  "Revenue Driver Analysis",
  "Churn Revenue Impact",
  "Upsell & Cross-sell Opportunities",
  "Revenue Decision Copilot",
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
  "Executive Revenue Overview": {
    explanation: "This overview shows whether revenue health is being supported by sound pricing, healthy expansion, and manageable churn exposure.",
    whyItMatters: "For an SME, revenue can look strong while margin quietly weakens. This page helps leadership spot that tension early.",
    decisionSupport: "Use it to decide whether to defend price, protect retention, or push growth more selectively.",
    csvUse: "CSV files are best for product, pricing, revenue, and customer-segment exports from spreadsheets or finance systems.",
    textUse: "Text files are useful for commercial notes, pricing decisions, and management context behind the numbers.",
    expectedFields: ["product", "price", "discount", "revenue", "customer_segment", "channel"],
    syntheticNote: "If nothing is uploaded, Run Analysis will refresh the page using the built-in synthetic revenue workspace.",
    templateTitle: "Revenue Template Preview",
    templateRows: [
      { product: "Premium Plan", price: 2500, discount: 12, revenue: 480000, customer_segment: "enterprise", channel: "direct sales" },
      { product: "Core Plan", price: 1200, discount: 7, revenue: 325000, customer_segment: "retail", channel: "reseller" }
    ]
  },
  "Pricing Intelligence": {
    explanation: "This report shows where pricing discipline is weakening and where discounts may be eroding margin.",
    whyItMatters: "Many SMEs give away margin slowly, not dramatically. Pricing discipline helps preserve growth that is worth keeping.",
    decisionSupport: "Use it to decide where approvals, discount guardrails, or pricing conversations need tightening.",
    csvUse: "Upload product and pricing CSV files when you want this section to refresh from current commercial data.",
    textUse: "Text files help when pricing decisions have context that is not obvious from the spreadsheet alone.",
    expectedFields: ["product", "price", "discount", "revenue"],
    syntheticNote: "If no upload is detected, this report will still run with the synthetic demo dataset.",
    templateTitle: "Pricing Upload Example",
    templateRows: [
      { product: "Premium Plan", price: 2500, discount: 12, revenue: 480000 },
      { product: "Analytics Add-on", price: 650, discount: 5, revenue: 138000 }
    ]
  },
  "Revenue Driver Analysis": {
    explanation: "This section shows which commercial motions are actually carrying the business, such as renewals, upsell, or channel growth.",
    whyItMatters: "Leadership needs to know whether revenue is being supported by repeatable drivers or by one-off commercial effort.",
    decisionSupport: "Use it to decide where to keep investing management attention and where to ask tougher performance questions.",
    csvUse: "CSV files are useful when driver data is tracked by product, segment, or commercial motion.",
    textUse: "Text files help when the real explanation sits inside sales notes, partner observations, or campaign commentary.",
    expectedFields: ["product", "revenue", "customer_segment", "channel"],
    syntheticNote: "The report remains usable with synthetic demo data if no CSV or text note is uploaded.",
    templateTitle: "Revenue Driver Example",
    templateRows: [
      { product: "Core Plan", revenue: 325000, customer_segment: "retail", channel: "reseller" },
      { product: "Premium Plan", revenue: 480000, customer_segment: "enterprise", channel: "direct sales" }
    ]
  },
  "Churn Revenue Impact": {
    explanation: "This report highlights where customer loss could hurt revenue most, especially when a few segments or accounts carry too much weight.",
    whyItMatters: "Losing even a small number of customers can be painful when revenue concentration is high.",
    decisionSupport: "Use it to decide which accounts, segments, or service risks deserve retention attention first.",
    csvUse: "Upload churn or account-performance CSV files to score revenue exposure from live commercial records.",
    textUse: "Text files are useful for account notes, retention concerns, and commercial context from the field.",
    expectedFields: ["customer_segment", "revenue", "discount", "channel"],
    syntheticNote: "No upload detected? The churn-impact section will still run using the built-in synthetic workspace.",
    templateTitle: "Churn Impact Example",
    templateRows: [
      { customer_segment: "mid-market", revenue: 180000, discount: 9, channel: "direct sales" },
      { customer_segment: "retail chains", revenue: 145000, discount: 11, channel: "reseller" }
    ]
  },
  "Upsell & Cross-sell Opportunities": {
    explanation: "This section shows where the business has the best chance to grow existing customers without chasing low-confidence expansion.",
    whyItMatters: "SMEs often grow faster by selling more wisely to existing demand than by spreading attention too widely.",
    decisionSupport: "Use it to decide where to prioritize account expansion, partner focus, or new-offer positioning.",
    csvUse: "CSV files are best when expansion opportunities are already tracked by segment, product, or motion.",
    textUse: "Text files help when commercial opportunity is described in account reviews or growth notes.",
    expectedFields: ["product", "customer_segment", "revenue", "channel"],
    syntheticNote: "Synthetic demo data can still power this section when no real file is uploaded.",
    templateTitle: "Expansion Opportunity Example",
    templateRows: [
      { product: "Premium Plan", customer_segment: "enterprise", revenue: 480000, channel: "direct sales" },
      { product: "Analytics Add-on", customer_segment: "wholesale", revenue: 138000, channel: "partner" }
    ]
  },
  "Revenue Decision Copilot": {
    explanation: "This section helps leadership test commercial decisions such as defending price, protecting renewals, or pushing expansion.",
    whyItMatters: "When teams feel pressure to grow fast, a disciplined decision view helps protect margin and commercial focus.",
    decisionSupport: "Use it to compare pricing discipline, retention quality, and the strength of expansion opportunities.",
    csvUse: "Upload structured commercial CSV files if you want the copilot to reflect live pricing and revenue conditions.",
    textUse: "Text files are useful for sales-director notes, market commentary, and deal-quality concerns.",
    expectedFields: ["product", "price", "discount", "revenue", "customer_segment"],
    syntheticNote: "The copilot can still be demonstrated well using the built-in synthetic revenue workspace.",
    templateTitle: "Revenue Copilot Example",
    templateRows: [
      { product: "Premium Plan", price: 2500, discount: 12, revenue: 480000, customer_segment: "enterprise" },
      { product: "Core Plan", price: 1200, discount: 7, revenue: 325000, customer_segment: "retail" }
    ]
  },
  "About": {
    explanation: "This page explains the commercial intelligence use case, the expected data inputs, and the kind of decisions the product is built to support.",
    whyItMatters: "It gives recruiters, decision-makers, and SME operators a quick commercial understanding of the app.",
    decisionSupport: "Use it to explain the value of the platform without overloading the audience with product detail.",
    csvUse: "CSV files are useful when you want the About view to reflect real revenue sources used in the demo.",
    textUse: "Text files help when product positioning and market context matter as much as the numbers.",
    expectedFields: ["product", "price", "discount", "revenue", "customer_segment"],
    syntheticNote: "The About page remains polished and usable even when only the synthetic demo workspace is available.",
    templateTitle: "Revenue Source Example",
    templateRows: [
      { product: "Premium Plan", price: 2500, discount: 12, revenue: 480000, customer_segment: "enterprise" },
      { product: "Analytics Add-on", price: 650, discount: 5, revenue: 138000, customer_segment: "wholesale" }
    ]
  }
};

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState("No upload detected, so synthetic data will be used.");
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  useEffect(() => {
    fetchWorkspace()
      .then((payload) => {
        setWorkspace(payload);
        setKnowledgeRows(payload.knowledge_results);
        setBrief(payload.executive_brief);
        setCopilotResponses(payload.agents.revenue_copilot);
        setStatus("Synthetic revenue workspace loaded.");
        setAnalysisStatus("Analysis completed using synthetic demo workspace.");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("Unable to load revenue workspace.");
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
    setStatus("Refreshing revenue analysis...");
    try {
      const payload = selectedFiles.length > 0 ? await analyzeWorkspace(selectedFiles) : await fetchWorkspace();
      setWorkspace(payload);
      setKnowledgeRows(payload.knowledge_results);
      setBrief(payload.executive_brief);
      setCopilotResponses(payload.agents.revenue_copilot);
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
          downloadHref="/templates/revenue-template.csv"
          downloadLabel="Download Revenue Template"
        />
        <RunAnalysisPanel
          status={analysisStatus}
          helperText="Run Analysis will refresh the current revenue report using your uploaded data when available, or use the built-in synthetic sample if nothing has been uploaded."
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
            <p className="muted">Upload pricing and revenue files, then click Run Analysis. If no file is uploaded, the demo workspace will be used.</p>
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
            {renderToolkit(section)}
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
            {renderToolkit(section)}
            <DataTable title="Pricing Table" rows={workspace.pricing_rows} />
            <div className="callout"><h3>Pricing Optimization Agent</h3><p>{workspace.agents.pricing_optimization}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Revenue Driver Analysis" ? (
          <SectionPanel title="Revenue Driver Analysis" subtitle="See which commercial motions are actually carrying the current revenue base.">
            {renderToolkit(section)}
            <DataTable title="Revenue Drivers" rows={workspace.driver_rows} />
            <div className="callout"><h3>Revenue Driver Agent</h3><p>{workspace.agents.revenue_driver}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Churn Revenue Impact" ? (
          <SectionPanel title="Churn Revenue Impact" subtitle="Protect recurring value where churn risk is already visible.">
            {renderToolkit(section)}
            <DataTable title="Churn Exposure" rows={workspace.churn_rows} />
            <div className="callout"><h3>Churn Impact Agent</h3><p>{workspace.agents.churn_impact}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Upsell & Cross-sell Opportunities" ? (
          <SectionPanel title="Upsell & Cross-sell Opportunities" subtitle="Concentrate commercial effort where expansion readiness and confidence align.">
            {renderToolkit(section)}
            <DataTable title="Expansion Opportunities" rows={workspace.expansion_rows} />
            <div className="callout"><h3>Upsell & Cross-sell Agent</h3><p>{workspace.agents.upsell_cross_sell}</p></div>
          </SectionPanel>
        ) : null}

        {section === "Revenue Decision Copilot" ? (
          <SectionPanel title="Revenue Decision Copilot" subtitle="Stress-test pricing and growth choices with the current commercial posture in view.">
            {renderToolkit(section)}
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
            {renderToolkit(section)}
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

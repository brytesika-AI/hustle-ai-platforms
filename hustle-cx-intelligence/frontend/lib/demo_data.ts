import { WorkspacePayload } from "./types";

export const demoWorkspace: WorkspacePayload = {
  sources: {
    transcripts: "sample_transcripts.csv",
    notes: "trend_notes.txt",
  },
  metrics: {
    negative_sentiment_pct: 34,
    high_severity_pct: 21,
    avg_resolution_hours: 9.6,
    churn_risk_score: 68,
    product_signal_score: 61,
    root_cause_coverage_score: 73,
    executive_visibility_score: 67,
  },
  transcripts: [
    { ticket: "CX-301", issue: "billing confusion", sentiment: "negative", severity: "high", churn_signal: "high" },
    { ticket: "CX-317", issue: "network stability", sentiment: "negative", severity: "medium", churn_signal: "medium" },
    { ticket: "CX-322", issue: "app usability", sentiment: "neutral", severity: "low", churn_signal: "low" },
  ],
  root_causes: [
    { theme: "billing trust", volume: 18, note: "repeat explanation failures" },
    { theme: "service stability", volume: 11, note: "quality inconsistency" },
    { theme: "product usability", volume: 9, note: "navigation friction" },
  ],
  product_signals: [
    { signal: "billing wording", impact: "high", note: "confusing invoice language" },
    { signal: "self-service flow", impact: "medium", note: "customers abandoning early" },
  ],
  agents: {
    transcript_classification: "Most inbound complaints cluster around billing trust and service reliability.",
    sentiment_severity: "Negative sentiment is elevated enough to justify leadership visibility, but severity is still concentrated rather than universal.",
    root_cause: "The strongest root-cause pattern is billing confusion supported by service consistency complaints.",
    churn_risk: "Churn pressure is meaningful because the same issues are recurring across multiple transcript clusters.",
    product_improvement: "Billing clarity and self-service flow simplification offer the fastest product-side relief.",
    executive_copilot: {
      analyst: "Address billing-trust complaints first, then reduce service inconsistency in the highest-volume queue.",
      operator: "Route recurring complaint clusters into weekly action reviews with service and product owners.",
      strategist: "Treat recurring trust complaints as a retention issue, not just a support issue.",
    },
  },
  knowledge: {
    explore: {
      documents: 3,
      average_word_count: 420,
      trend_focus: "billing trust and service quality",
    },
    query_results: [
      { note: "Billing complaint spikes follow invoice changes", relevance: 0.91, theme: "billing trust" },
      { note: "Network complaints correlate with churn-risk tickets", relevance: 0.85, theme: "service quality" },
      { note: "App navigation feedback repeats in onboarding cohorts", relevance: 0.76, theme: "usability" },
    ],
    lint: [
      { document: "trend_notes.txt", status: "clean", issue: "" },
      { document: "billing_patterns.md", status: "clean", issue: "" },
    ],
  },
  executive_brief:
    "Leadership should intervene first on billing trust and service stability. Those two themes are carrying the largest share of negative sentiment and churn pressure in the current CX environment.",
};

export function demoCopilot(question: string): Record<string, string> {
  return {
    analyst: `CX answer for "${question}": billing trust is the first intervention zone, followed by service quality consistency.`,
    operator: "Route the recurring complaint clusters into weekly cross-functional reviews.",
    strategist: "Reduce churn risk by treating trust complaints as a product and service design problem, not only a queue problem.",
  };
}

export function demoBrief(topic: string): string {
  return `CX brief for ${topic}: reduce billing confusion, stabilize the most visible service failures, and make complaint-pattern review a standing management rhythm.`;
}

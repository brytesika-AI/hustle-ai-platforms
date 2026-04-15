type Props = {
  status: string;
  helperText: string;
  onRunAnalysis: () => void;
  isRunning?: boolean;
};

export function RunAnalysisPanel({ status, helperText, onRunAnalysis, isRunning = false }: Props) {
  return (
    <div className="panel action-panel">
      <div>
        <h3 style={{ marginTop: 0 }}>Analysis Refresh</h3>
        <p className="muted">{helperText}</p>
      </div>
      <div className="action-row">
        <button className="button" onClick={onRunAnalysis} disabled={isRunning}>
          {isRunning ? "Running..." : "Run Analysis"}
        </button>
        <div className={`analysis-status ${status.toLowerCase().includes("completed") ? "success" : "neutral"}`}>
          {status}
        </div>
      </div>
    </div>
  );
}

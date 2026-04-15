type Props = {
  status: string;
  tone?: "neutral" | "success";
};

export function AnalysisStatus({ status, tone = "neutral" }: Props) {
  return <div className={`analysis-status ${tone}`}>{status}</div>;
}

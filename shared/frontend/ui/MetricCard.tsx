type Props = {
  label: string;
  value: number | string;
};

export function MetricCard({ label, value }: Props) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

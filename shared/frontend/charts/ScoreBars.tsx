type Props = {
  title: string;
  rows: { dimension: string; score: number }[];
};

export function ScoreBars({ title, rows }: Props) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <div className="bars">
        {rows.map((row) => (
          <div className="bar-row" key={row.dimension}>
            <div className="bar-head">
              <span>{row.dimension}</span>
              <span>{row.score}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${Math.min(100, row.score)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

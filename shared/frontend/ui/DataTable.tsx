type Props = {
  title: string;
  rows: Record<string, string | number>[];
};

export function DataTable({ title, rows }: Props) {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th colSpan={Math.max(headers.length, 1)}>{title}</th>
          </tr>
          {headers.length > 0 ? (
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          ) : null}
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={`${title}-${index}`}>
                {headers.map((header) => (
                  <td key={header}>{String(row[header])}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td>No data available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

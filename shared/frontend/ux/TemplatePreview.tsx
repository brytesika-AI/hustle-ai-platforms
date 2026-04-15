type Props = {
  title: string;
  rows: Record<string, string | number>[];
  downloadHref?: string;
  downloadLabel?: string;
};

export function TemplatePreview({ title, rows, downloadHref, downloadLabel }: Props) {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="panel template-preview">
      <div className="template-header">
        <div>
          <h3>{title}</h3>
          <p className="muted">Use this structure when preparing a sample SME dataset.</p>
        </div>
        {downloadHref ? (
          <a className="button secondary" href={downloadHref} download>
            {downloadLabel || "Download Sample Template"}
          </a>
        ) : null}
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`}>
                {headers.map((header) => (
                  <td key={header}>{String(row[header])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

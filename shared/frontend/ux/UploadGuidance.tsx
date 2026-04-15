type Props = {
  acceptedFiles: string[];
  csvUse: string;
  textUse: string;
  expectedFields: string[];
  syntheticNote: string;
};

export function UploadGuidance({ acceptedFiles, csvUse, textUse, expectedFields, syntheticNote }: Props) {
  return (
    <div className="callout guidance-card">
      <h3>Upload Guidance</h3>
      <div className="info-grid">
        <div>
          <strong>Accepted files</strong>
          <p>{acceptedFiles.join(", ")}</p>
          <strong>CSV files</strong>
          <p>{csvUse}</p>
          <strong>Text files</strong>
          <p>{textUse}</p>
        </div>
        <div>
          <strong>Expected fields</strong>
          <div className="chip-row">
            {expectedFields.map((field) => (
              <span key={field} className="chip">
                {field}
              </span>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 12 }}>{syntheticNote}</p>
        </div>
      </div>
    </div>
  );
}

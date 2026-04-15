import { ChangeEvent } from "react";

type Props = {
  title: string;
  description: string;
  status: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function UploadDropzone({ title, description, status, onChange }: Props) {
  return (
    <div className="upload-panel">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p className="muted">{description}</p>
      <input className="file-input" type="file" multiple onChange={onChange} />
      <p className="muted" style={{ marginBottom: 0 }}>{status}</p>
    </div>
  );
}

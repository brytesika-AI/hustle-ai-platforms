export type ParsedRow = Record<string, string>;

export type UploadedDataset = {
  fileName: string;
  fileType: "csv" | "txt";
  headers: string[];
  rows: ParsedRow[];
  text: string;
};

export function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
}

export async function parseUploadedFile(file: File): Promise<UploadedDataset> {
  const text = await file.text();
  const trimmed = text.trim();
  const normalizedName = file.name.toLowerCase();
  const isTextFile = normalizedName.endsWith(".txt");

  if (trimmed.length === 0) {
    throw new Error("The uploaded file was empty, so no analysis was run.");
  }

  if (isTextFile) {
    return {
      fileName: file.name,
      fileType: "txt",
      headers: ["text"],
      rows: [{ text: trimmed }],
      text: trimmed
    };
  }

  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("The uploaded file needs a header row and at least one data row.");
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: ParsedRow = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] || "").trim();
    });
    return row;
  });

  return {
    fileName: file.name,
    fileType: "csv",
    headers,
    rows,
    text: trimmed
  };
}

export function requireColumns(dataset: UploadedDataset, requiredColumns: string[]): void {
  const missingColumns = requiredColumns.filter((column) => !dataset.headers.includes(normalizeHeader(column)));
  if (missingColumns.length > 0) {
    throw new Error(`The file is missing required columns: ${missingColumns.join(", ")}`);
  }
}

export function ensureNonEmptyRows(dataset: UploadedDataset): void {
  if (dataset.rows.length === 0) {
    throw new Error("The uploaded file was empty, so no analysis was run.");
  }
}

export function toNumber(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function percent(part: number, total: number): number {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

export function truncateRows(rows: Record<string, string | number>[], maxRows = 8): Record<string, string | number>[] {
  return rows.slice(0, maxRows);
}

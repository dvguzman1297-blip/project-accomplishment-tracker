export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

const esc = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (typeof v === "string" && /^[=+\-@]/.test(s)) s = "'" + s; // block spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadCsv<T>(filename: string, cols: CsvColumn<T>[], rows: T[]) {
  const lines = [
    cols.map((c) => esc(c.header)).join(","),
    ...rows.map((r) => cols.map((c) => esc(c.value(r))).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

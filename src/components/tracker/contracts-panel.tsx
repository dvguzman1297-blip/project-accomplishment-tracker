"use client";
import { useMemo, useState } from "react";
import { Columns3, Paperclip, Printer, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { LabeledSelect } from "@/components/ui/labeled-select";
import { Popover } from "@/components/ui/popover";
import { RoadProgress } from "@/components/ui/road-progress";
import { CONTRACT_FIELDS } from "@/lib/contract-fields";
import { downloadCsv, type CsvColumn } from "@/lib/csv";
import { STATUS_META, STATUS_OPTIONS, formatDate, formatPeso, isOverdue } from "@/lib/format";
import type { Contract } from "@/lib/types";
import { ContractDialog } from "./contract-dialog";
import { CoordinateLink } from "./coordinate-link";
import { Toolbar } from "./toolbar";

const distinct = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => !!x?.trim()))].sort();

type Group = "Contract" | "Locations" | "Contractor and cost" | "Authorities" | "Pre-construction" | "Construction" | "Status and remarks" | "Attachments";
const GROUPS: Group[] = ["Contract", "Locations", "Contractor and cost", "Authorities", "Pre-construction", "Construction", "Status and remarks", "Attachments"];

interface Spec extends Column<Contract> {
  group: Group;
  /** Plain text used for printing */
  text: (c: Contract) => string;
  /** Extra text matched by the global search (defaults to `text`) */
  search?: (c: Contract) => string;
}

const dash = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : String(v));
const nowrap = (s: string) => <span className="whitespace-nowrap">{s}</span>;

function col(
  key: string,
  header: string,
  group: Group,
  text: (c: Contract) => string,
  o: Partial<Pick<Spec, "cell" | "sort" | "search" | "className" | "align">> = {},
): Spec {
  return { key, header, group, text, cell: o.cell ?? ((c) => dash(text(c))), sort: o.sort, search: o.search, className: o.className, align: o.align };
}

const dateCol = (key: keyof Contract & string, header: string, group: Group) =>
  col(key, header, group, (c) => (c[key] ? formatDate(c[key] as string) : ""), {
    cell: (c) => nowrap(formatDate(c[key] as string | null)),
    sort: (c) => c[key] as string | null,
    search: (c) => (c[key] ? `${formatDate(c[key] as string)} ${c[key]}` : ""),
  });

const textCol = (key: keyof Contract & string, header: string, group: Group, className?: string) =>
  col(key, header, group, (c) => (c[key] == null ? "" : String(c[key])), { sort: (c) => c[key] as string | number | null, className });

const moneyCol = (key: "abc" | "bid_amount", header: string) =>
  col(key, header, "Contractor and cost", (c) => (c[key] == null ? "" : formatPeso(c[key])), {
    align: "right",
    cell: (c) => nowrap(formatPeso(c[key])),
    sort: (c) => c[key],
    search: (c) => (c[key] == null ? "" : `${formatPeso(c[key])} ${c[key]}`),
  });

const attachCol = (key: "as_built_request_form_path" | "as_built_plan_path", header: string) =>
  col(key, header, "Attachments", (c) => (c[key] ? "Attached" : "Missing"), {
    cell: (c) =>
      c[key] ? (
        <Badge className="gap-1 bg-emerald-600/15 text-emerald-800 dark:text-emerald-300"><Paperclip className="h-3 w-3" />Attached</Badge>
      ) : (
        <Badge className="bg-muted text-muted-foreground">Missing</Badge>
      ),
    sort: (c) => (c[key] ? 1 : 0),
  });

const coordCol = (key: "coordinates_original" | "coordinates_new", header: string, label: string) =>
  col(key, header, "Locations", (c) => (c[key] ?? "").replace(/\s*\n\s*/g, " | "), {
    cell: (c) => <CoordinateLink label={label} value={c[key]} />,
    className: "min-w-[14rem]",
  });

const SPECS: Spec[] = [
  col("item_no", "No.", "Contract", (c) => (c.item_no == null ? "" : String(c.item_no)), { sort: (c) => c.item_no }),
  col("contract_id", "Contract ID", "Contract", (c) => c.contract_id ?? "", { cell: (c) => nowrap(dash(c.contract_id)), sort: (c) => c.contract_id }),
  textCol("component_id", "Component ID", "Contract"),
  col("contract_name", "Contract", "Contract", (c) => c.contract_name, {
    className: "min-w-[18rem] max-w-md",
    sort: (c) => c.contract_name,
    cell: (c) => <p className="font-medium leading-snug">{c.contract_name}</p>,
  }),
  textCol("municipality", "Municipality", "Contract"),
  textCol("type", "Type", "Contract"),

  coordCol("coordinates_original", "Original coordinates", "Original"),
  coordCol("coordinates_new", "New coordinates", "New"),

  textCol("contractor", "Contractor", "Contractor and cost", "min-w-[12rem]"),
  textCol("contractor_address", "Contractor's address", "Contractor and cost", "min-w-[12rem]"),
  moneyCol("abc", "ABC"),
  moneyCol("bid_amount", "Bid amount"),

  textCol("pi_in_pcma", "PI in PCMA", "Authorities"),
  textCol("pe_contractor", "PE (Contractor)", "Authorities"),
  textCol("me", "ME", "Authorities"),
  textCol("me_focal_person", "ME (Focal person)", "Authorities"),
  textCol("project_engineer", "Project engineer", "Authorities"),
  textCol("project_inspector", "Project inspector", "Authorities"),

  // Table order: Bid out -> NOA -> CAD -> NTP -> CD
  dateCol("bid_out", "Bid out", "Pre-construction"),
  dateCol("noa", "NOA", "Pre-construction"),
  dateCol("contract_approval_date", "CAD", "Pre-construction"),
  dateCol("ntp", "NTP", "Pre-construction"),
  col("contract_duration", "CD (days)", "Pre-construction", (c) => (c.contract_duration == null ? "" : String(c.contract_duration)), { sort: (c) => c.contract_duration }),

  dateCol("start_date", "Start date", "Construction"),
  dateCol("expiry_date", "Expiry date", "Construction"),

  col("status", "Status", "Status and remarks", (c) => STATUS_META[c.status].label, {
    sort: (c) => c.status,
    search: (c) => `${STATUS_META[c.status].label} ${STATUS_META[c.status].full}`,
    cell: (c) => (
      <Badge className={STATUS_META[c.status].cls} title={STATUS_META[c.status].full}>{STATUS_META[c.status].label}</Badge>
    ),
  }),
  col("progress", "Progress", "Status and remarks", (c) => `${c.progress_percentage}%`, {
    sort: (c) => c.progress_percentage,
    cell: (c) => <RoadProgress value={c.progress_percentage} />,
  }),
  dateCol("actual_completion_date", "Actual completion", "Status and remarks"),
  textCol("remarks", "Remarks", "Status and remarks", "min-w-[14rem]"),

  attachCol("as_built_request_form_path", "As-Built Request Form"),
  attachCol("as_built_plan_path", "As-Built Plan"),
];

// CSV: every workbook column (raw values)
const csvCols: CsvColumn<Contract>[] = CONTRACT_FIELDS.flatMap((f) => {
  const col: CsvColumn<Contract> = {
    header: f.label,
    value: (c) => {
      const raw = (c as unknown as Record<string, string | number | null>)[f.key];
      return f.key === "status" ? STATUS_META[c.status].full : raw;
    },
  };
  return [col];
});
csvCols.push(
  { header: "As-Built Request Form", value: (c) => (c.as_built_request_form_path ? "Attached" : "Missing") },
  { header: "As-Built Plan", value: (c) => (c.as_built_plan_path ? "Attached" : "Missing") },
);

function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} /> {children}
    </label>
  );
}

export function ContractsPanel({
  contracts,
  today,
  initialStatus = "",
  initialQuery = "",
  initialRange,
  initialOpenId,
}: {
  contracts: Contract[];
  today: string;
  initialStatus?: string;
  initialQuery?: string;
  initialRange?: string;
  initialOpenId?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [municipality, setMunicipality] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [inspector, setInspector] = useState("");
  const [contractor, setContractor] = useState("");
  // Start date range defaults to the current calendar year (Jan 01 to Dec 31)
  const year = today.slice(0, 4);
  const [from, setFrom] = useState(initialRange === "all" ? "" : `${year}-01-01`);
  const [to, setTo] = useState(initialRange === "all" ? "" : `${year}-12-31`);
  const [includeUndated, setIncludeUndated] = useState(true);
  const [editing, setEditing] = useState<Contract | "new" | null>(
    () => (initialOpenId ? contracts.find((c) => c.id === initialOpenId) ?? null : null),
  );
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printOpen, setPrintOpen] = useState(false);
  const [printCols, setPrintCols] = useState<Set<string>>(new Set());

  const haystacks = useMemo(
    () => new Map(contracts.map((c) => [c.id, SPECS.map((s) => (s.search ?? s.text)(c)).join(" ").toLowerCase()])),
    [contracts],
  );

  // Search runs across ALL columns, including ones currently hidden
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return contracts.filter((c) => {
      if (municipality && c.municipality !== municipality) return false;
      if (type && c.type !== type) return false;
      if (inspector && c.project_inspector !== inspector) return false;
      if (contractor && c.contractor !== contractor) return false;
      if (status === "overdue" ? !isOverdue(c, today) : status && c.status !== status) return false;
      if (from || to) {
        const d = c.start_date;
        if (!d ? !includeUndated : (from && d < from) || (to && d > to)) return false;
      }
      return !needle || haystacks.get(c.id)!.includes(needle);
    });
  }, [contracts, haystacks, q, municipality, type, status, inspector, contractor, from, to, includeUndated, today]);

  const activeFilters = [municipality, type, inspector, contractor, status].filter(Boolean).length + (hiddenCols.size > 0 ? 1 : 0);
  const clearFilters = () => {
    setMunicipality("");
    setType("");
    setInspector("");
    setContractor("");
    setStatus("");
    setHiddenCols(new Set());
  };

  const visible = SPECS.filter((s) => !hiddenCols.has(s.key));
  const toggleCol = (key: string) =>
    setHiddenCols((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  // Print scope: only rows in the current (date-bounded) view; ticked rows narrow it further
  const rowIds = new Set(rows.map((r) => r.id));
  const ticked = [...selected].filter((id) => rowIds.has(id));
  const printRows = ticked.length ? rows.filter((r) => selected.has(r.id)) : rows;
  const printSpecs = SPECS.filter((s) => printCols.has(s.key));

  const openPrint = () => {
    setPrintCols(new Set(visible.map((s) => s.key)));
    setPrintOpen(true);
  };
  const doPrint = () => {
    setPrintOpen(false);
    setTimeout(() => window.print(), 150);
  };

  const rangeLabel =
    from || to
      ? `Start date: ${from ? formatDate(from) : "any"} to ${to ? formatDate(to) : "any"}`
      : "No date range";

  const columns: Column<Contract>[] = visible;

  return (
    <div className="space-y-3">
      <div className="space-y-3 print:hidden">
        <Toolbar
          search={q}
          onSearch={setQ}
          placeholder="Search all columns"
          shown={rows.length}
          total={contracts.length}
          createLabel="New contract"
          onCreate={() => setEditing("new")}
          onExport={() => downloadCsv("contracts.csv", csvCols, rows)}
          actions={
            <Button variant="ghost" size="icon" className="relative border border-input text-muted-foreground hover:text-foreground" onClick={openPrint} title={ticked.length ? `Print ${ticked.length} selected` : "Print"} aria-label="Print">
              <Printer className="h-4 w-4" />
              {ticked.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">{ticked.length}</span>
              )}
            </Button>
          }
          filters={
            <>
              <Popover
                active={activeFilters > 0}
                panelClassName="w-[22rem] max-h-[75vh] overflow-y-auto"
                trigger={
                  <>
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    Filters{activeFilters > 0 && ` (${activeFilters})`}
                  </>
                }
              >
                <div className="space-y-2">
                  <LabeledSelect label="Municipality" value={municipality} onChange={(e) => setMunicipality(e.target.value)}>
                    <option value="">All</option>
                    {distinct(contracts.map((c) => c.municipality)).map((m) => <option key={m}>{m}</option>)}
                  </LabeledSelect>
                  <LabeledSelect label="Type" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">All</option>
                    {distinct(contracts.map((c) => c.type)).map((t) => <option key={t}>{t}</option>)}
                  </LabeledSelect>
                  <LabeledSelect label="Inspector" value={inspector} onChange={(e) => setInspector(e.target.value)}>
                    <option value="">All</option>
                    {distinct(contracts.map((c) => c.project_inspector)).map((m) => <option key={m}>{m}</option>)}
                  </LabeledSelect>
                  <LabeledSelect label="Contractor" value={contractor} onChange={(e) => setContractor(e.target.value)}>
                    <option value="">All</option>
                    {distinct(contracts.map((c) => c.contractor)).map((m) => <option key={m}>{m}</option>)}
                  </LabeledSelect>
                  <LabeledSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All</option>
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    <option value="overdue">Past expiry</option>
                  </LabeledSelect>
                </div>

                <div className="mt-3 border-t pt-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Columns3 className="h-3.5 w-3.5" /> Columns{hiddenCols.size > 0 && ` (${hiddenCols.size} hidden)`}
                    </p>
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => setHiddenCols(new Set())}>Show all</button>
                  </div>
                  <div className="max-h-52 overflow-y-auto pr-1">
                    {GROUPS.map((g) => (
                      <div key={g} className="mt-2 first:mt-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{g}</p>
                        {SPECS.filter((s) => s.group === g).map((s) => (
                          <Checkbox key={s.key} checked={!hiddenCols.has(s.key)} onChange={() => toggleCol(s.key)}>{s.header}</Checkbox>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex justify-end border-t pt-3">
                  <Button variant="ghost" size="sm" disabled={activeFilters === 0} onClick={clearFilters}>Clear filters</Button>
                </div>
              </Popover>
              <DateRangePicker
                from={from}
                to={to}
                onChange={(f, t) => { setFrom(f); setTo(t); }}
                today={today}
                includeUndated={includeUndated}
                onIncludeUndated={setIncludeUndated}
              />
            </>
          }
        />
        <DataTable
          rows={rows}
          columns={columns}
          onRowClick={setEditing}
          emptyText="No contracts match these filters."
          selection={{ selected, onChange: setSelected }}
        />
      </div>

      {/* Print-only sheet: current filtered rows (and ticked rows, if any), chosen columns */}
      <div className="hidden print:block">
        <h1 className="text-base font-semibold">Contracts</h1>
        <p className="mb-2 text-[10px]">
          {rangeLabel} · {printRows.length} record{printRows.length === 1 ? "" : "s"} · Printed {formatDate(today)}
          {q.trim() && ` · Search: "${q.trim()}"`}
        </p>
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr>
              {printSpecs.map((s) => <th key={s.key} className="border border-black px-1 py-0.5 text-left">{s.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {printRows.map((r) => (
              <tr key={r.id} className="break-inside-avoid">
                {printSpecs.map((s) => <td key={s.key} className="border border-black px-1 py-0.5 align-top">{dash(s.text(r))}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {printOpen && (
        <Dialog open onOpenChange={(o) => !o && setPrintOpen(false)}>
          <DialogContent
            title="Print contracts"
            description={`${printRows.length} record${printRows.length === 1 ? "" : "s"} in the current view (${rangeLabel})${ticked.length ? `, limited to the ${ticked.length} ticked row${ticked.length === 1 ? "" : "s"}` : ". Tick rows in the table to print only those"}.`}
            className="max-w-xl"
          >
            <div className="mt-4 space-y-4">
              {GROUPS.map((g) => {
                const specs = SPECS.filter((s) => s.group === g);
                const all = specs.every((s) => printCols.has(s.key));
                const flip = () =>
                  setPrintCols((p) => {
                    const n = new Set(p);
                    specs.forEach((s) => (all ? n.delete(s.key) : n.add(s.key)));
                    return n;
                  });
                return (
                  <fieldset key={g}>
                    <legend className="mb-1 text-sm font-semibold">
                      <Checkbox checked={all} onChange={flip}>{g}</Checkbox>
                    </legend>
                    <div className="ml-6 grid grid-cols-2 gap-x-4">
                      {specs.map((s) => (
                        <Checkbox
                          key={s.key}
                          checked={printCols.has(s.key)}
                          onChange={() => setPrintCols((p) => {
                            const n = new Set(p);
                            n.has(s.key) ? n.delete(s.key) : n.add(s.key);
                            return n;
                          })}
                        >
                          {s.header}
                        </Checkbox>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setPrintOpen(false)}>Cancel</Button>
              <Button onClick={doPrint} disabled={printSpecs.length === 0 || printRows.length === 0}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editing && (
        <ContractDialog key={editing === "new" ? "new" : editing.id} contract={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

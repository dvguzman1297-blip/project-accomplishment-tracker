"use client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/input";
import { RoadProgress } from "@/components/ui/road-progress";
import { CONTRACT_FIELDS } from "@/lib/contract-fields";
import { downloadCsv, type CsvColumn } from "@/lib/csv";
import { STATUS_META, STATUS_OPTIONS, formatDate, formatPeso, isOverdue } from "@/lib/format";
import type { Contract } from "@/lib/types";
import { ContractDialog } from "./contract-dialog";
import { Toolbar } from "./toolbar";

const distinct = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => !!x?.trim()))].sort();

// CSV: every workbook column, plus the generated start/expiry dates after contract duration
const csvCols: CsvColumn<Contract>[] = CONTRACT_FIELDS.flatMap((f) => {
  const col: CsvColumn<Contract> = {
    header: f.label,
    value: (c) => (c as unknown as Record<string, string | number | null>)[f.key],
  };
  return f.key === "contract_duration"
    ? [col, { header: "Start date", value: (c: Contract) => c.start_date }, { header: "Expiry date", value: (c: Contract) => c.expiry_date }]
    : [col];
});

export function ContractsPanel({ contracts, today }: { contracts: Contract[]; today: string }) {
  const [q, setQ] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Contract | "new" | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return contracts.filter((c) => {
      if (municipality && c.municipality !== municipality) return false;
      if (type && c.type !== type) return false;
      if (status === "overdue" ? !isOverdue(c, today) : status && c.status !== status) return false;
      if (!needle) return true;
      return [c.contract_id, c.component_id, c.contract_name, c.municipality, c.type, c.contractor, c.project_inspector, c.project_engineer, c.me]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [contracts, q, municipality, type, status, today]);

  const columns: Column<Contract>[] = [
    { key: "item_no", header: "No.", cell: (c) => c.item_no ?? "—", sort: (c) => c.item_no },
    { key: "contract_id", header: "Contract ID", cell: (c) => <span className="whitespace-nowrap">{c.contract_id ?? "—"}</span>, sort: (c) => c.contract_id },
    {
      key: "contract_name",
      header: "Contract",
      className: "min-w-[18rem] max-w-md",
      sort: (c) => c.contract_name,
      cell: (c) => (
        <div>
          <p className="font-medium leading-snug">{c.contract_name}</p>
          {c.component_id && <p className="text-xs text-muted-foreground">{c.component_id}</p>}
        </div>
      ),
    },
    { key: "municipality", header: "Municipality", cell: (c) => c.municipality ?? "—", sort: (c) => c.municipality },
    { key: "type", header: "Type", cell: (c) => c.type ?? "—", sort: (c) => c.type },
    { key: "contractor", header: "Contractor", cell: (c) => <span className="line-clamp-2 max-w-[14rem]">{c.contractor ?? "—"}</span>, sort: (c) => c.contractor },
    { key: "bid_amount", header: "Bid amount", align: "right", cell: (c) => <span className="whitespace-nowrap">{formatPeso(c.bid_amount)}</span>, sort: (c) => c.bid_amount },
    { key: "ntp", header: "NTP", cell: (c) => <span className="whitespace-nowrap">{formatDate(c.ntp)}</span>, sort: (c) => c.ntp },
    { key: "expiry_date", header: "Expiry", cell: (c) => <span className="whitespace-nowrap">{formatDate(c.expiry_date)}</span>, sort: (c) => c.expiry_date },
    {
      key: "status",
      header: "Status",
      sort: (c) => c.status,
      cell: (c) => (
        <div className="flex flex-col items-start gap-1">
          <Badge className={STATUS_META[c.status].cls}>{STATUS_META[c.status].label}</Badge>
          {isOverdue(c, today) && <Badge className="bg-red-600/15 text-red-800 dark:text-red-300">Past expiry</Badge>}
        </div>
      ),
    },
    { key: "progress", header: "Progress", cell: (c) => <RoadProgress value={c.progress_percentage} />, sort: (c) => c.progress_percentage },
  ];

  return (
    <div className="space-y-3">
      <Toolbar
        search={q}
        onSearch={setQ}
        placeholder="Search contracts"
        shown={rows.length}
        total={contracts.length}
        createLabel="New contract"
        onCreate={() => setEditing("new")}
        onExport={() => downloadCsv("contracts.csv", csvCols, rows)}
        filters={
          <>
            <Select value={municipality} onChange={(e) => setMunicipality(e.target.value)} className="w-auto" aria-label="Filter by municipality">
              <option value="">All municipalities</option>
              {distinct(contracts.map((c) => c.municipality)).map((m) => <option key={m}>{m}</option>)}
            </Select>
            <Select value={type} onChange={(e) => setType(e.target.value)} className="w-auto" aria-label="Filter by type">
              <option value="">All types</option>
              {distinct(contracts.map((c) => c.type)).map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto" aria-label="Filter by status">
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              <option value="overdue">Past expiry</option>
            </Select>
          </>
        }
      />
      <DataTable rows={rows} columns={columns} onRowClick={setEditing} emptyText="No contracts match these filters." />
      {editing && (
        <ContractDialog key={editing === "new" ? "new" : editing.id} contract={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

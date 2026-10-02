"use client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/input";
import { downloadCsv, type CsvColumn } from "@/lib/csv";
import { IMPACT_META, IMPACT_OPTIONS, contractLabel, formatDate } from "@/lib/format";
import type { Accomplishment, Contract } from "@/lib/types";
import { AccomplishmentDialog } from "./accomplishment-dialog";
import { Toolbar } from "./toolbar";

export function AccomplishmentsPanel({ accomplishments, contracts }: { accomplishments: Accomplishment[]; contracts: Contract[] }) {
  const [q, setQ] = useState("");
  const [project, setProject] = useState("");
  const [impact, setImpact] = useState("");
  const [editing, setEditing] = useState<Accomplishment | "new" | null>(null);

  const byId = useMemo(() => new Map(contracts.map((c) => [c.id, c])), [contracts]);
  const nameOf = (a: Accomplishment) => {
    const c = byId.get(a.project_id);
    return c ? contractLabel(c) : "—";
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return accomplishments.filter((a) => {
      if (project && a.project_id !== project) return false;
      if (impact && a.impact !== impact) return false;
      if (!needle) return true;
      const c = byId.get(a.project_id);
      return [a.title, a.details, c?.contract_name, c?.contract_id, c?.component_id].join(" ").toLowerCase().includes(needle);
    });
  }, [accomplishments, q, project, impact, byId]);

  const columns: Column<Accomplishment>[] = [
    { key: "date", header: "Completed", cell: (a) => <span className="whitespace-nowrap">{formatDate(a.date_completed)}</span>, sort: (a) => a.date_completed },
    { key: "contract", header: "Contract", className: "min-w-[14rem] max-w-xs", cell: (a) => <span className="line-clamp-2">{nameOf(a)}</span>, sort: (a) => nameOf(a) },
    {
      key: "title",
      header: "Accomplishment",
      className: "min-w-[16rem] max-w-md",
      sort: (a) => a.title,
      cell: (a) => (
        <div>
          <p className="font-medium leading-snug">{a.title}</p>
          {a.details && <p className="line-clamp-2 text-xs text-muted-foreground">{a.details}</p>}
        </div>
      ),
    },
    {
      key: "impact",
      header: "Impact",
      sort: (a) => IMPACT_OPTIONS.findIndex((o) => o.value === a.impact),
      cell: (a) => <Badge className={IMPACT_META[a.impact].cls}>{IMPACT_META[a.impact].label}</Badge>,
    },
  ];

  const csvCols: CsvColumn<Accomplishment>[] = [
    { header: "Contract", value: nameOf },
    { header: "Title", value: (a) => a.title },
    { header: "Details", value: (a) => a.details },
    { header: "Impact", value: (a) => IMPACT_META[a.impact].label },
    { header: "Date completed", value: (a) => a.date_completed },
  ];

  return (
    <div className="space-y-3">
      <Toolbar
        search={q}
        onSearch={setQ}
        placeholder="Search accomplishments"
        shown={rows.length}
        total={accomplishments.length}
        createLabel="New accomplishment"
        onCreate={() => setEditing("new")}
        onExport={() => downloadCsv("accomplishments.csv", csvCols, rows)}
        filters={
          <>
            <Select value={project} onChange={(e) => setProject(e.target.value)} className="w-auto max-w-[16rem]" aria-label="Filter by contract">
              <option value="">All contracts</option>
              {contracts.map((c) => <option key={c.id} value={c.id}>{contractLabel(c)}</option>)}
            </Select>
            <Select value={impact} onChange={(e) => setImpact(e.target.value)} className="w-auto" aria-label="Filter by impact">
              <option value="">All impact levels</option>
              {IMPACT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </>
        }
      />
      <DataTable rows={rows} columns={columns} onRowClick={setEditing} emptyText="No accomplishments match these filters." />
      {editing && (
        <AccomplishmentDialog
          key={editing === "new" ? "new" : editing.id}
          accomplishment={editing === "new" ? null : editing}
          contracts={contracts}
          defaultProjectId={project || undefined}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

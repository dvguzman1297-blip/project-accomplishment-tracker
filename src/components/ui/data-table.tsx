"use client";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sort?: (row: T) => string | number | null;
  className?: string;
  align?: "right";
}

export interface Selection {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  onRowClick,
  emptyText,
  selection,
}: {
  rows: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyText: string;
  selection?: Selection;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const sorted = useMemo(() => {
    const col = sort ? columns.find((c) => c.key === sort.key) : undefined;
    if (!sort || !col?.sort) return rows;
    const f = col.sort;
    return [...rows].sort((a, b) => {
      const x = f(a);
      const y = f(b);
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      const r =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y), undefined, { numeric: true });
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, sort, columns]);

  const allSelected = !!selection && sorted.length > 0 && sorted.every((r) => selection.selected.has(r.id));
  const toggleAll = () => {
    if (!selection) return;
    const next = new Set(selection.selected);
    sorted.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
    selection.onChange(next);
  };
  const toggleRow = (id: string) => {
    if (!selection) return;
    const next = new Set(selection.selected);
    next.has(id) ? next.delete(id) : next.add(id);
    selection.onChange(next);
  };

  const toggle = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-secondary/60 text-left">
            {selection && (
              <th className="w-8 px-3 py-2.5">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all shown rows" />
              </th>
            )}
            {columns.map((c) => {
              const Icon = sort?.key === c.key ? (sort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
              return (
                <th
                  key={c.key}
                  className={cn("whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-muted-foreground", c.align === "right" && "text-right")}
                  aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                >
                  {c.sort ? (
                    <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggle(c.key)}>
                      {c.header}
                      <Icon className={cn("h-3 w-3", sort?.key !== c.key && "opacity-40")} />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length + (selection ? 1 : 0)} className="px-3 py-10 text-center text-muted-foreground">
                {emptyText}
              </td>
            </tr>
          )}
          {sorted.map((row) => (
            <tr
              key={row.id}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(e) => e.target === e.currentTarget && e.key === "Enter" && onRowClick?.(row)}
              className={cn("border-b last:border-0", onRowClick && "cursor-pointer hover:bg-secondary/50")}
            >
              {selection && (
                <td className="px-3 py-2.5 align-top" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selection.selected.has(row.id)} onChange={() => toggleRow(row.id)} aria-label="Select row for printing" />
                </td>
              )}
              {columns.map((c) => (
                <td key={c.key} className={cn("px-3 py-2.5 align-top", c.align === "right" && "text-right", c.className)}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";
import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { DateInput } from "./date-input";
import { Popover } from "./popover";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** One compact control: typed From/To (MMM dd, YYYY), presets, a range calendar and the "no start date" toggle. */
export function DateRangePicker({
  from,
  to,
  onChange,
  today,
  includeUndated,
  onIncludeUndated,
  label = "Date Coverage",
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  today: string;
  includeUndated: boolean;
  onIncludeUndated: (v: boolean) => void;
  label?: string;
}) {
  const year = Number(today.slice(0, 4));
  const anchor = from || to || today;
  const [view, setView] = useState({ y: Number(anchor.slice(0, 4)), m: Number(anchor.slice(5, 7)) - 1 });

  const shift = (n: number) =>
    setView((v) => {
      const d = new Date(v.y, v.m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  // First click starts a range, second click completes it (in either order)
  const pick = (d: string) => {
    if (!from || to) onChange(d, "");
    else d < from ? onChange(d, from) : onChange(from, d);
  };

  const summary = from || to ? `${from ? formatDate(from) : "Any"} – ${to ? formatDate(to) : "Any"}` : "All dates";
  const preset = "rounded-md border border-input px-2 py-1 text-xs hover:bg-secondary";

  return (
    <Popover
      active={!!(from || to)}
      aria-label={`${label} range: ${summary}`}
      panelClassName="w-80"
      trigger={
        <>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{label}:</span>
          <span>{summary}</span>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">From</p>
            <DateInput value={from} onChange={(v) => onChange(v, to)} aria-label="From date" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">To</p>
            <DateInput value={to} onChange={(v) => onChange(from, v)} aria-label="To date" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={preset} onClick={() => onChange(`${year}-01-01`, `${year}-12-31`)}>This year</button>
          <button type="button" className={preset} onClick={() => onChange(`${year - 1}-01-01`, `${year - 1}-12-31`)}>Last year</button>
          <button type="button" className={preset} onClick={() => onChange("", "")}>All dates</button>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="rounded p-1 hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm font-medium">{MONTHS[view.m]} {view.y}</span>
            <button type="button" onClick={() => shift(1)} aria-label="Next month" className="rounded p-1 hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 text-center text-sm">
            {cells.map((d, i) => {
              if (d === null) return <span key={`b${i}`} />;
              const v = iso(view.y, view.m, d);
              const end = v === from || v === to;
              const inside = !!from && !!to && v > from && v < to;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => pick(v)}
                  aria-pressed={end}
                  className={cn(
                    "h-8 rounded-md",
                    end ? "bg-primary text-primary-foreground" : inside ? "bg-primary/15" : "hover:bg-secondary",
                    v === today && !end && "ring-1 ring-primary",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 border-t pt-3 text-sm">
          <input type="checkbox" checked={includeUndated} onChange={(e) => onIncludeUndated(e.target.checked)} />
          Include contracts with no start date
        </label>
      </div>
    </Popover>
  );
}

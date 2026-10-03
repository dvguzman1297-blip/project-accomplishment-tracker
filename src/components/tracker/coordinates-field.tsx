"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { parseCoordinates, serializeCoordinates, validLatLng } from "@/lib/coordinates";

interface Row { label: string; lat: string; lng: string }

const toRows = (value: string): Row[] => {
  const { points } = parseCoordinates(value);
  return points.map((p) => ({ label: p.label, lat: String(p.lat), lng: String(p.lng) }));
};

const DECIMAL = /^-?\d+(\.\d+)?$/;

/**
 * Multi-input coordinate editor. Edits a text value of "LABEL: lat, lng" lines, so existing
 * data keeps working. Unparseable existing text is kept visible via the fallback textarea notice.
 */
export function CoordinatesField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  // Local rows so a freshly added blank row stays visible until it is filled in
  const [rows, setRows] = useState<Row[]>(() => toRows(value));
  const { errors } = parseCoordinates(value);
  const set = (next: Row[]) => {
    setRows(next);
    onChange(serializeCoordinates(next));
  };
  const update = (i: number, patch: Partial<Row>) => set(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-2" id={id}>
      {rows.map((r, i) => {
        const bad = !DECIMAL.test(r.lat) || !DECIMAL.test(r.lng) || !validLatLng(Number(r.lat), Number(r.lng));
        return (
          <div key={i} className="grid grid-cols-[6.5rem_1fr_1fr_auto] items-center gap-2">
            <Select value={["START", "END"].includes(r.label) ? r.label : "POINT"} onChange={(e) => update(i, { label: e.target.value === "POINT" ? `POINT ${i + 1}` : e.target.value })} aria-label="Point type">
              <option value="START">Start</option>
              <option value="END">End</option>
              <option value="POINT">Point</option>
            </Select>
            <Input inputMode="decimal" placeholder="Latitude" value={r.lat} aria-invalid={bad} onChange={(e) => update(i, { lat: e.target.value })} aria-label="Latitude" />
            <Input inputMode="decimal" placeholder="Longitude" value={r.lng} aria-invalid={bad} onChange={(e) => update(i, { lng: e.target.value })} aria-label="Longitude" />
            <Button type="button" variant="ghost" size="icon" aria-label="Remove point" onClick={() => set(rows.filter((_, j) => j !== i))}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => set([...rows, { label: rows.length === 0 ? "START" : rows.length === 1 ? "END" : `POINT ${rows.length + 1}`, lat: "", lng: "" }])}
      >
        <Plus className="h-4 w-4" /> Add point
      </Button>
      {errors.length > 0 && <p className="text-xs text-destructive">{errors[0]}</p>}
    </div>
  );
}

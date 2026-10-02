"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CONTRACT_FIELDS, CONTRACT_SECTIONS, type FieldDef } from "@/lib/contract-fields";
import { formatDate } from "@/lib/format";
import type { Contract } from "@/lib/types";
import { deleteContract, saveContract } from "@/app/(admin)/tracker/actions";
import { DeleteButton } from "./delete-button";

function toForm(c: Contract | null): Record<string, string> {
  const v: Record<string, string> = {};
  for (const f of CONTRACT_FIELDS) {
    const raw = c ? (c as unknown as Record<string, unknown>)[f.key] : undefined;
    v[f.key] = raw == null ? "" : String(raw);
  }
  if (!c) {
    v.status = "not_started";
    v.progress_percentage = "0";
  }
  return v;
}

function Field({ f, value, onChange }: { f: FieldDef; value: string; onChange: (v: string) => void }) {
  const id = `c-${f.key}`;
  return (
    <div className={f.wide ? "sm:col-span-2" : undefined}>
      <Label htmlFor={id}>{f.label}{f.required && " *"}</Label>
      {f.type === "select" ? (
        <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      ) : f.type === "textarea" ? (
        <Textarea id={id} rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input
          id={id}
          type={f.type === "decimal" ? "text" : f.type ?? "text"}
          inputMode={f.type === "decimal" ? "decimal" : undefined}
          pattern={f.type === "decimal" ? "-?[0-9]+(\\.[0-9]+)?" : undefined}
          title={f.type === "decimal" ? "Enter a decimal number, e.g. 14.599512" : undefined}
          placeholder={f.placeholder}
          step={f.type === "number" ? "any" : undefined}
          min={f.min}
          max={f.max}
          value={value}
          required={f.required}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function ContractDialog({ contract, onClose }: { contract: Contract | null; onClose: () => void }) {
  const [v, setV] = useState(() => toForm(contract));
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const set = (k: string) => (val: string) => setV((s) => ({ ...s, [k]: val }));

  // Mirrors the generated columns: expiry = NTP + duration - 1
  const expiry = (() => {
    if (!v.ntp || !v.contract_duration) return null;
    const [y, m, d] = v.ntp.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + Number(v.contract_duration) - 1));
    return dt.toISOString().slice(0, 10);
  })();

  const run = (fn: () => Promise<{ error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else onClose();
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={contract ? "Edit contract" : "New contract"} description="Start date follows the NTP. Expiry is NTP plus contract duration, minus one day.">
        <form
          className="mt-5 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            setError(undefined);
            run(() => saveContract(contract?.id ?? null, v));
          }}
        >
          {CONTRACT_SECTIONS.map((s) => (
            <fieldset key={s.title}>
              <legend className="mb-2 text-sm font-semibold">{s.title}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {s.fields.map((f) => <Field key={f.key} f={f} value={v[f.key]} onChange={set(f.key)} />)}
              </div>
              {s.title === "Pre-construction" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Start date: {formatDate(v.ntp || null)} · Expiry date: {formatDate(expiry)}
                </p>
              )}
            </fieldset>
          ))}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <div>{contract && <DeleteButton noun="contract" pending={pending} onConfirm={() => run(() => deleteContract(contract.id))} />}</div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save contract"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CONTRACT_FIELDS, CONTRACT_SECTIONS, type FieldDef } from "@/lib/contract-fields";
import { formatDate } from "@/lib/format";
import type { Contract } from "@/lib/types";
import { deleteContract, saveContract } from "@/app/(admin)/tracker/actions";
import { AttachmentField } from "./attachment-field";
import { CoordinatesField } from "./coordinates-field";
import { DeleteButton } from "./delete-button";

function toForm(c: Contract | null): Record<string, string> {
  const v: Record<string, string> = {};
  for (const f of CONTRACT_FIELDS) {
    const raw = c ? (c as unknown as Record<string, unknown>)[f.key] : undefined;
    v[f.key] = raw == null ? "" : String(raw);
  }
  for (const k of ["as_built_request_form_path", "as_built_plan_path"] as const) v[k] = c?.[k] ?? "";
  if (!c) {
    v.status = "nys";
    v.progress_percentage = "0";
  }
  return v;
}

function Field({ f, value, onChange }: { f: FieldDef; value: string; onChange: (v: string) => void }) {
  const id = `c-${f.key}`;
  return (
    <div className={f.wide ? "sm:col-span-2" : undefined}>
      <Label htmlFor={id}>
        {f.label}{f.required && " *"}
        {f.type === "date" && value && <span className="ml-2 font-normal text-foreground">{formatDate(value)}</span>}
      </Label>
      {f.type === "coordinates" ? (
        <CoordinatesField id={id} value={value} onChange={onChange} />
      ) : f.type === "select" ? (
        <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      ) : f.type === "textarea" ? (
        <Textarea id={id} rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input
          id={id}
          type={f.type ?? "text"}
          step={f.type === "number" ? "any" : undefined}
          min={f.min}
          max={f.max}
          value={value}
          required={f.required}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {f.hint && <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>}
    </div>
  );
}

export function ContractDialog({ contract, onClose }: { contract: Contract | null; onClose: () => void }) {
  const [v, setV] = useState(() => toForm(contract));
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const [busy, setBusy] = useState(false);
  const [folder] = useState(() => `contracts/${contract?.id ?? crypto.randomUUID()}`);
  // Start date follows the NTP until the user sets their own value
  const [startOwn, setStartOwn] = useState(() => !!contract?.start_date && contract.start_date !== contract.ntp);

  const set = (k: string) => (val: string) => {
    if (k === "start_date") {
      setStartOwn(val !== "" && val !== v.ntp);
      setV((s) => ({ ...s, start_date: val === "" ? s.ntp : val }));
    } else if (k === "ntp") {
      setV((s) => ({ ...s, ntp: val, ...(startOwn ? {} : { start_date: val }) }));
    } else {
      setV((s) => ({ ...s, [k]: val }));
    }
  };

  // Mirrors the generated column: expiry = start + CD - 1 (consecutive calendar days)
  const startDate = v.start_date || v.ntp;
  const expiry = (() => {
    if (!startDate || v.contract_duration === "" || Number(v.contract_duration) < 1) return null;
    const [y, m, d] = startDate.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + Number(v.contract_duration) - 1)).toISOString().slice(0, 10);
  })();

  const run = (fn: () => Promise<{ error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else onClose();
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={contract ? "Edit contract" : "New contract"} description="Pre-construction runs Bid, NTP, NOA, CD, CAD. Expiry is Start date plus CD, minus one day.">
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
              {s.title === "Construction" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Start date: {formatDate(startDate || null)} · Revised/expiry date: {formatDate(expiry)} (Start + CD − 1)
                </p>
              )}
            </fieldset>
          ))}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Attachments</legend>
            <p className="mb-2 text-xs text-muted-foreground">Both are required before the status can be set to Completed.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <AttachmentField id="c-as-built-request" label="As-Built Request Form" folder={folder} value={v.as_built_request_form_path} onChange={set("as_built_request_form_path")} onBusy={setBusy} />
              <AttachmentField id="c-as-built-plan" label="As-Built Plan" folder={folder} value={v.as_built_plan_path} onChange={set("as_built_plan_path")} onBusy={setBusy} />
            </div>
          </fieldset>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <div>{contract && <DeleteButton noun="contract" pending={pending} onConfirm={() => run(() => deleteContract(contract.id))} />}</div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={pending || busy}>{pending ? "Saving…" : "Save contract"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

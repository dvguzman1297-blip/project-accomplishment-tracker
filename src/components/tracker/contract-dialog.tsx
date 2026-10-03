"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DateInput } from "@/components/ui/date-input";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CONTRACT_FIELDS, CONTRACT_SECTIONS, type FieldDef } from "@/lib/contract-fields";
import { suggestExpiry } from "@/lib/format";
import type { Contract } from "@/lib/types";
import { deleteContract, saveContract } from "@/app/(admin)/tracker/actions";
import { AttachmentField } from "./attachment-field";
import { CoordinatesField } from "./coordinates-field";
import { DeleteButton } from "./delete-button";

/** Suggested expiry = Start + CD - 1; with no start/NTP yet, the system date stands in as the start. */
function suggest(start: string, cd: string | number | null) {
  const today = new Date();
  const local = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return suggestExpiry(start || local, Number(cd));
}

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
              </Label>
      {f.type === "coordinates" ? (
        <CoordinatesField id={id} value={value} onChange={onChange} />
      ) : f.type === "select" ? (
        <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      ) : f.type === "date" ? (
        <DateInput id={id} value={value} onChange={onChange} />
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
  // Expiry follows Start + CD - 1 until the user sets their own value
  const [expiryOwn, setExpiryOwn] = useState(
    () => !!contract?.expiry_date && contract.expiry_date !== suggest(contract.start_date ?? contract.ntp ?? "", contract.contract_duration),
  );

  const set = (k: string) => (val: string) => {
    let ownStart = startOwn;
    let ownExpiry = expiryOwn;
    if (k === "start_date") ownStart = val !== "" && val !== v.ntp;
    if (k === "expiry_date") ownExpiry = val !== "" && val !== suggest(v.start_date || v.ntp, v.contract_duration);
    setStartOwn(ownStart);
    setV((s) => {
      const next = { ...s, [k]: val };
      if (k === "ntp" && !ownStart) next.start_date = val;
      if (k === "start_date" && val === "") next.start_date = s.ntp;
      if (k === "expiry_date" && val === "") ownExpiry = false;
      // Suggested expiry tracks the inputs unless the user typed their own
      if (!ownExpiry) next.expiry_date = suggest(next.start_date || next.ntp, next.contract_duration) ?? "";
      return next;
    });
    setExpiryOwn(ownExpiry);
  };

  const run = (fn: () => Promise<{ error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else onClose();
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={contract ? "Edit contract" : "New contract"} description="Expiry date is suggested as Start date + CD − 1 (start day counts); you can overwrite it.">
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

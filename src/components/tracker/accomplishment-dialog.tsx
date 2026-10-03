"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DateInput } from "@/components/ui/date-input";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { IMPACT_OPTIONS, contractLabel } from "@/lib/format";
import type { Accomplishment, Contract } from "@/lib/types";
import { deleteAccomplishment, saveAccomplishment } from "@/app/(admin)/tracker/actions";
import { DeleteButton } from "./delete-button";

export function AccomplishmentDialog({
  accomplishment,
  contracts,
  defaultProjectId,
  onClose,
}: {
  accomplishment: Accomplishment | null;
  contracts: Contract[];
  defaultProjectId?: string;
  onClose: () => void;
}) {
  const a = accomplishment;
  const [v, setV] = useState({
    project_id: a?.project_id ?? defaultProjectId ?? "",
    title: a?.title ?? "",
    details: a?.details ?? "",
    impact: a?.impact ?? "medium",
    date_completed: a?.date_completed ?? "",
  });
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));

  const run = (fn: () => Promise<{ error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else onClose();
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={a ? "Edit accomplishment" : "New accomplishment"} className="max-w-xl">
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(undefined);
            run(() => saveAccomplishment(a?.id ?? null, v));
          }}
        >
          <div>
            <Label htmlFor="a-contract">Contract *</Label>
            <Select id="a-contract" value={v.project_id} onChange={(e) => set("project_id")(e.target.value)} required>
              <option value="" disabled>Select a contract</option>
              {contracts.map((c) => <option key={c.id} value={c.id}>{contractLabel(c)}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="a-title">Title *</Label>
            <Input id="a-title" value={v.title} onChange={(e) => set("title")(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="a-details">Details</Label>
            <Textarea id="a-details" rows={3} value={v.details} onChange={(e) => set("details")(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-impact">Impact</Label>
              <Select id="a-impact" value={v.impact} onChange={(e) => set("impact")(e.target.value)}>
                {IMPACT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="a-date">Date completed</Label>
              <DateInput id="a-date" value={v.date_completed} onChange={set("date_completed")} />
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <div>{a && <DeleteButton noun="accomplishment" pending={pending} onConfirm={() => run(() => deleteAccomplishment(a.id))} />}</div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save accomplishment"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

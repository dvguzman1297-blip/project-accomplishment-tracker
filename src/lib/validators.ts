import { z } from "zod";

const clean = (v: unknown) => {
  if (v === undefined || v === null) return null;
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  return v;
};
const text = z.preprocess(clean, z.string().nullable());
const date = z.preprocess(clean, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter dates as YYYY-MM-DD").nullable());
const money = z.preprocess(clean, z.coerce.number().min(0, "Amounts cannot be negative").nullable());
const whole = z.preprocess(clean, z.coerce.number().int("Enter a whole number").min(0, "Numbers cannot be negative").nullable());

export const contractSchema = z.object({
  item_no: whole,
  contract_id: text,
  component_id: text,
  contract_name: z.string().trim().min(1, "Contract name is required"),
  municipality: text,
  type: text,
  coordinates_new: text,
  coordinates_original: text,
  contractor: text,
  contractor_address: text,
  abc: money,
  bid_amount: money,
  pi_in_pcma: text,
  pe_contractor: text,
  me: text,
  me_focal_person: text,
  project_engineer: text,
  project_inspector: text,
  bid_out: date,
  noa: date,
  ntp: date,
  contract_approval_date: date,
  contract_duration: whole,
  status: z.enum(["not_started", "in_progress", "completed", "on_hold", "delayed"]),
  progress_percentage: z.coerce.number().int("Progress must be a whole number").min(0, "Progress is 0 to 100").max(100, "Progress is 0 to 100"),
  actual_completion_date: date,
  remarks: text,
});

export const accomplishmentSchema = z.object({
  project_id: z.string().uuid("Select a contract"),
  title: z.string().trim().min(1, "Title is required"),
  details: text,
  impact: z.enum(["low", "medium", "high", "critical"]),
  date_completed: date,
});

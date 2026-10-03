import { z } from "zod";
import { parseCoordinates } from "./coordinates";

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

const coordinates = z.preprocess(
  clean,
  z
    .string()
    .nullable()
    .superRefine((v, ctx) => {
      const { errors } = parseCoordinates(v);
      if (errors.length) ctx.addIssue({ code: "custom", message: errors[0] });
    }),
);

export const contractSchema = z
  .object({
  item_no: whole,
  contract_id: text,
  component_id: text,
  contract_name: z.string().trim().min(1, "Contract name is required"),
  municipality: text,
  type: text,
  coordinates_new: coordinates,
  coordinates_original: coordinates,
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
  ntp: date,
  noa: date,
  contract_duration: whole,
  contract_approval_date: date,
  start_date: date,
  expiry_date: date,
  status: z.enum(["nys", "ongoing", "completed", "suspended"]),
  progress_percentage: z.coerce.number().int("Progress must be a whole number").min(0, "Progress is 0 to 100").max(100, "Progress is 0 to 100"),
  actual_completion_date: date,
  remarks: text,
  as_built_request_form_path: text,
  as_built_plan_path: text,
  })
  .superRefine((v, ctx) => {
    if (v.status !== "completed") return;
    if (!v.as_built_request_form_path) ctx.addIssue({ code: "custom", path: ["as_built_request_form_path"], message: "Attach the As-Built Request Form before marking the contract Completed." });
    else if (!v.as_built_plan_path) ctx.addIssue({ code: "custom", path: ["as_built_plan_path"], message: "Attach the As-Built Plan before marking the contract Completed." });
  });

export const accomplishmentSchema = z.object({
  project_id: z.string().uuid("Select a contract"),
  title: z.string().trim().min(1, "Title is required"),
  details: text,
  impact: z.enum(["low", "medium", "high", "critical"]),
  date_completed: date,
});

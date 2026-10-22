import { STATUS_OPTIONS } from "./format";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "money" | "date" | "textarea" | "select" | "coordinates" | "slippage" | "percent";
  /** slippage fields only: the form keys they are derived from. Never saved. */
  computed?: { actual: string; planned: string };
  wide?: boolean;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  hint?: string;
}

export interface SectionDef {
  title: string;
  fields: FieldDef[];
  /** Fields per row on wide screens (default 2). */
  columns?: 3;
  /** Contract column holding when this section's main value last changed; shown beside the title, never edited. */
  updatedKey?: "progress_updated_at" | "pcma_updated_at";
}

/** Mirrors the column groups of the workbook. Drives both the edit form and CSV export. */
export const CONTRACT_SECTIONS: SectionDef[] = [
  {
    title: "Contract",
    fields: [
      { key: "item_no", label: "No.", type: "number" },
      { key: "contract_id", label: "Contract ID" },
      { key: "component_id", label: "Component ID" },
      { key: "contract_name", label: "Contract name", wide: true, required: true },
      { key: "municipality", label: "Municipality" },
      { key: "type", label: "Type" },
    ],
  },
  {
    title: "Locations",
    fields: [
      { key: "coordinates_original", label: "Original coordinates", type: "coordinates", wide: true },
      { key: "coordinates_new", label: "New coordinates", type: "coordinates", wide: true },
    ],
  },
  {
    title: "Contractor and cost",
    fields: [
      { key: "contractor", label: "Contractor" },
      { key: "contractor_address", label: "Contractor's address" },
      { key: "abc", label: "ABC (₱)", type: "money" },
      { key: "bid_amount", label: "Bid amount (₱)", type: "money" },
    ],
  },
  {
    title: "Contract authorities",
    fields: [
      { key: "pi_in_pcma", label: "PI in PCMA" },
      { key: "pe_contractor", label: "PE (Contractor)" },
      { key: "me", label: "ME" },
      { key: "me_focal_person", label: "ME (Focal person)" },
      { key: "project_engineer", label: "Project engineer" },
      { key: "project_inspector", label: "Project inspector" },
    ],
  },
  {
    // Lifecycle order: Bid -> NTP -> NOA -> CD -> CAD
    title: "Pre-construction",
    fields: [
      { key: "bid_out", label: "Bid out", type: "date" },
      { key: "ntp", label: "NTP (Notice to Proceed)", type: "date" },
      { key: "noa", label: "NOA (Notice of Award)", type: "date" },
      { key: "contract_duration", label: "CD (Contract duration, calendar days)", type: "number", min: 0 },
      { key: "contract_approval_date", label: "CAD (Contract approval date)", type: "date" },
    ],
  },
  {
    title: "Construction",
    fields: [
      { key: "start_date", label: "Start date", type: "date", hint: "Suggested from the NTP; you can change it." },
      { key: "expiry_date", label: "Expiry date", type: "date", hint: "Suggested as Start date + CD − 1; you can change it." },
      { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
      { key: "actual_completion_date", label: "Actual completion date", type: "date" },
    ],
  },
  {
    title: "Actual progress",
    columns: 3,
    updatedKey: "progress_updated_at",
    fields: [
      { key: "planned_actual_pct", label: "Planned Actual pct", type: "percent" },
      { key: "progress_percentage", label: "Actual pct", type: "percent" },
      { key: "slippage_actual", label: "Slippage for Actual", type: "slippage", hint: "Actual pct − Planned Actual pct", computed: { actual: "progress_percentage", planned: "planned_actual_pct" } },
    ],
  },
  {
    title: "PCMA progress",
    columns: 3,
    updatedKey: "pcma_updated_at",
    fields: [
      { key: "planned_pcma_pct", label: "Planned PCMA pct", type: "percent" },
      { key: "pcma_pct", label: "PCMA pct", type: "percent" },
      { key: "slippage_pcma", label: "Slippage for PCMA", type: "slippage", hint: "PCMA pct − Planned PCMA pct", computed: { actual: "pcma_pct", planned: "planned_pcma_pct" } },
    ],
  },
];

/** Actual - Planned, or null until both are entered. */
export function slippage(actual: unknown, planned: unknown): number | null {
  if (actual === "" || actual == null || planned === "" || planned == null) return null;
  const a = Number(actual);
  const p = Number(planned);
  return Number.isFinite(a) && Number.isFinite(p) ? Math.round((a - p) * 100) / 100 : null;
}

export const CONTRACT_FIELDS = CONTRACT_SECTIONS.flatMap((s) => s.fields);

import { STATUS_OPTIONS } from "./format";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "coordinates";
  wide?: boolean;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  hint?: string;
}

/** Mirrors the column groups of the workbook. Drives both the edit form and CSV export. */
export const CONTRACT_SECTIONS: { title: string; fields: FieldDef[] }[] = [
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
      { key: "abc", label: "ABC (₱)", type: "number" },
      { key: "bid_amount", label: "Bid amount (₱)", type: "number" },
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
      { key: "bid_out", label: "1. Bid out", type: "date" },
      { key: "ntp", label: "2. NTP (Notice to Proceed)", type: "date" },
      { key: "noa", label: "3. NOA (Notice of Award)", type: "date" },
      { key: "contract_duration", label: "4. CD (Contract duration, calendar days)", type: "number", min: 0 },
      { key: "contract_approval_date", label: "5. CAD (Contract approval date)", type: "date" },
    ],
  },
  {
    title: "Construction",
    fields: [
      { key: "start_date", label: "Start date", type: "date", hint: "Suggested from the NTP; you can change it." },
      { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
      { key: "progress_percentage", label: "Progress (%)", type: "number", min: 0, max: 100 },
      { key: "actual_completion_date", label: "Actual completion date", type: "date" },
      { key: "remarks", label: "Remarks", type: "textarea", wide: true },
    ],
  },
];

export const CONTRACT_FIELDS = CONTRACT_SECTIONS.flatMap((s) => s.fields);

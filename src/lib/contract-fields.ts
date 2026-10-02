import { STATUS_OPTIONS } from "./format";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "decimal" | "date" | "textarea" | "select";
  placeholder?: string;
  wide?: boolean;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
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
      { key: "coordinates_new", label: "Coordinates (new)", type: "textarea" },
      { key: "coordinates_original", label: "Coordinates (original)", type: "textarea" },
      { key: "old_latitude", label: "Old latitude", type: "decimal", placeholder: "14.599512" },
      { key: "old_longitude", label: "Old longitude", type: "decimal", placeholder: "120.984222" },
      { key: "new_latitude", label: "New latitude", type: "decimal", placeholder: "14.609115" },
      { key: "new_longitude", label: "New longitude", type: "decimal", placeholder: "120.991043" },
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
    title: "Pre-construction",
    fields: [
      { key: "bid_out", label: "Bid out", type: "date" },
      { key: "noa", label: "NOA", type: "date" },
      { key: "ntp", label: "NTP", type: "date" },
      { key: "contract_approval_date", label: "Contract approval date", type: "date" },
      { key: "contract_duration", label: "Contract duration (days)", type: "number" },
    ],
  },
  {
    title: "Status",
    fields: [
      { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
      { key: "progress_percentage", label: "Progress (%)", type: "number", min: 0, max: 100 },
      { key: "actual_completion_date", label: "Actual completion date", type: "date" },
      { key: "remarks", label: "Remarks", type: "textarea", wide: true },
    ],
  },
];

export const CONTRACT_FIELDS = CONTRACT_SECTIONS.flatMap((s) => s.fields);

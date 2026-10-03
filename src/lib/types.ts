export type ProjectStatus = "nys" | "ongoing" | "completed" | "suspended";
export type Impact = "low" | "medium" | "high" | "critical";

export interface Contract {
  id: string;
  item_no: number | null;
  contract_id: string | null;
  component_id: string | null;
  contract_name: string;
  municipality: string | null;
  type: string | null;
  coordinates_new: string | null;
  coordinates_original: string | null;
  contractor: string | null;
  contractor_address: string | null;
  abc: number | null;
  bid_amount: number | null;
  pi_in_pcma: string | null;
  pe_contractor: string | null;
  me: string | null;
  me_focal_person: string | null;
  project_engineer: string | null;
  project_inspector: string | null;
  bid_out: string | null;
  noa: string | null;
  ntp: string | null;
  contract_approval_date: string | null;
  contract_duration: number | null;
  start_date: string | null;
  expiry_date: string | null;
  status: ProjectStatus;
  progress_percentage: number;
  actual_completion_date: string | null;
  remarks: string | null;
  as_built_request_form_path: string | null;
  as_built_plan_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Accomplishment {
  id: string;
  project_id: string;
  title: string;
  details: string | null;
  impact: Impact;
  date_completed: string | null;
  created_at: string;
  updated_at: string;
}

import type { Contract, Impact, ProjectStatus } from "./types";

export const STATUS_META: Record<ProjectStatus, { label: string; full: string; cls: string; color: string }> = {
  nys: { label: "NYS", full: "Not Yet Started", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300", color: "#64748b" },
  ongoing: { label: "Ongoing", full: "Ongoing", cls: "bg-sky-600/15 text-sky-800 dark:text-sky-300", color: "#2f6fa3" },
  completed: { label: "Completed", full: "Completed", cls: "bg-emerald-600/15 text-emerald-800 dark:text-emerald-300", color: "#2e8b57" },
  suspended: { label: "Suspended", full: "Suspended", cls: "bg-amber-500/20 text-amber-900 dark:text-amber-300", color: "#c28a00" },
};

export const IMPACT_META: Record<Impact, { label: string; cls: string }> = {
  low: { label: "Low", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  medium: { label: "Medium", cls: "bg-sky-600/15 text-sky-800 dark:text-sky-300" },
  high: { label: "High", cls: "bg-amber-500/20 text-amber-900 dark:text-amber-300" },
  critical: { label: "Critical", cls: "bg-red-600/15 text-red-800 dark:text-red-300" },
};

export const STATUS_OPTIONS = (Object.keys(STATUS_META) as ProjectStatus[]).map((value) => ({
  value,
  label: STATUS_META[value].label,
}));
export const IMPACT_OPTIONS = (Object.keys(IMPACT_META) as Impact[]).map((value) => ({
  value,
  label: IMPACT_META[value].label,
}));

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPeso = (n: number | null | undefined) => (n == null ? "—" : peso.format(n));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-01-05" -> "Jan 05, 2026" (MMM dd, YYYY; no timezone shifting) */
export function formatDate(s: string | null | undefined) {
  if (!s) return "—";
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "—";
  return `${MONTHS[m - 1]} ${String(d).padStart(2, "0")}, ${y}`;
}

/** Today as YYYY-MM-DD in Philippine time */
export const todayManila = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

export const isOverdue = (c: Pick<Contract, "expiry_date" | "status">, today: string) =>
  !!c.expiry_date && c.status !== "completed" && c.expiry_date < today;

export const contractLabel = (c: Pick<Contract, "contract_id" | "contract_name">) =>
  c.contract_id ? `${c.contract_id.replace(/\s+/g, " ")} – ${c.contract_name}` : c.contract_name;

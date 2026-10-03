import type { Contract } from "./types";

/** Notify when this many days (or fewer) remain before the expiry date. */
export const AS_BUILT_NOTICE_DAYS = 5;
export const AS_BUILT_PROGRESS = 95;

export type NoticeKind = `expiry_${number}` | "progress_95";

export interface Notice {
  contractId: string;
  kind: NoticeKind;
  title: string;
  detail: string;
}

const dayNumber = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
};

export const daysUntil = (date: string, today: string) => dayNumber(date) - dayNumber(today);

/**
 * Contracts that should prompt "request a copy of the As-Built Plan":
 * expiry within 5 days, or progress at 95%+. Stops once the plan is on file or the contract is completed.
 */
export function buildNotices(contracts: Contract[], today: string): Notice[] {
  const out: Notice[] = [];
  for (const c of contracts) {
    if (c.status === "completed" || c.as_built_plan_path) continue;
    const name = c.contract_id ? `${c.contract_id} – ${c.contract_name}` : c.contract_name;
    const ask = "Request a copy of the As-Built Plan.";

    if (c.expiry_date) {
      const left = daysUntil(c.expiry_date, today);
      if (left >= 0 && left <= AS_BUILT_NOTICE_DAYS) {
        out.push({
          contractId: c.id,
          kind: `expiry_${AS_BUILT_NOTICE_DAYS}`,
          title: name,
          detail: `${left === 0 ? "Expires today" : `${left} day${left === 1 ? "" : "s"} left before expiry`}. ${ask}`,
        });
      }
    }
    if (c.progress_percentage >= AS_BUILT_PROGRESS) {
      out.push({ contractId: c.id, kind: "progress_95", title: name, detail: `${c.progress_percentage}% complete. ${ask}` });
    }
  }
  return out;
}

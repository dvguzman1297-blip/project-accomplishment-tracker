"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Accomplishment, Contract } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AccomplishmentsPanel } from "./accomplishments-panel";
import { ContractsPanel } from "./contracts-panel";

export function TrackerView({ contracts, accomplishments, today }: { contracts: Contract[]; accomplishments: Accomplishment[]; today: string }) {
  const [tab, setTab] = useState<"contracts" | "accomplishments">("contracts");
  const tabs = [
    { id: "contracts", label: "Contracts", count: contracts.length },
    { id: "accomplishments", label: "Accomplishments", count: accomplishments.length },
  ] as const;

  return (
    <div className="space-y-4">
      <div role="tablist" className="flex gap-6 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn("relative pb-2.5 text-sm font-medium transition-colors", tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {t.label} <span className="ml-1 text-xs tabular-nums text-muted-foreground">{t.count}</span>
            {tab === t.id && <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />}
          </button>
        ))}
      </div>
      {tab === "contracts" ? (
        <ContractsPanel contracts={contracts} today={today} />
      ) : (
        <AccomplishmentsPanel accomplishments={accomplishments} contracts={contracts} />
      )}
    </div>
  );
}

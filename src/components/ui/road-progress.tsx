"use client";
import { motion } from "framer-motion";

/** Progress bar drawn like a road: filled stretch with a dashed lane line. */
export function RoadProgress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex min-w-[7.5rem] items-center gap-2">
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-sm bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(var(--background)) 0 5px, transparent 5px 10px)" }}
        />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{v}%</span>
    </div>
  );
}

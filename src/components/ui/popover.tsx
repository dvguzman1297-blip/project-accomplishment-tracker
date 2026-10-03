"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Button that toggles a floating panel; closes on outside click or Escape. */
export function Popover({
  trigger,
  children,
  align = "left",
  active,
  panelClassName,
  "aria-label": ariaLabel,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  /** Highlights the trigger (e.g. when filters are applied) */
  active?: boolean;
  panelClassName?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md border bg-card px-3 text-sm font-medium hover:bg-secondary",
          active ? "border-primary" : "border-input",
        )}
      >
        {trigger}
      </button>
      {open && (
        <div role="dialog" className={cn("absolute z-30 mt-1 rounded-md border bg-card p-3 shadow-lg", align === "right" ? "right-0" : "left-0", panelClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}

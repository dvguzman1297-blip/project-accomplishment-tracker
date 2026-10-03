import { cn } from "@/lib/utils";

/**
 * CSS-only tooltip shown on hover and keyboard focus. Renders `children` untouched when `enabled` is false.
 * Uses theme tokens (card / border / foreground), so it follows light and dark mode.
 */
export function Tooltip({
  label,
  enabled = true,
  side = "right",
  className,
  children,
}: {
  label: string;
  enabled?: boolean;
  side?: "right" | "top";
  className?: string;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <div className={cn("group/tt relative flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md border bg-card px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-md transition-opacity",
          "group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          side === "right" ? "left-full top-1/2 ml-2 -translate-y-1/2" : "bottom-full left-1/2 mb-2 -translate-x-1/2",
        )}
      >
        {label}
      </span>
    </div>
  );
}

import { cn } from "@/lib/utils";

/** Select whose field name is always visible, e.g. "Type: All". */
export function LabeledSelect({
  label,
  className,
  ...props
}: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={cn("flex h-9 items-center rounded-md border border-input bg-card text-sm focus-within:ring-2 focus-within:ring-ring", className)}>
      <span className="shrink-0 pl-3 text-xs font-medium text-muted-foreground">{label}:</span>
      <select {...props} className="h-full min-w-0 flex-1 bg-transparent pl-1.5 pr-2 text-sm outline-none" />
    </label>
  );
}

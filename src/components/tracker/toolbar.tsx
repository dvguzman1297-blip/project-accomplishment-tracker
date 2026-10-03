"use client";
import { Download, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Primary row: search + main controls on the left; subtle utilities and the one solid CTA on the right. */
export function Toolbar({
  search,
  onSearch,
  placeholder,
  filters,
  shown,
  total,
  onExport,
  onCreate,
  createLabel,
  actions,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  filters: React.ReactNode;
  shown: number;
  total: number;
  onExport: () => void;
  onCreate: () => void;
  createLabel: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} className="pl-9" aria-label={placeholder} />
        </div>
        {filters}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="border border-input text-muted-foreground hover:text-foreground" onClick={onExport} title="Export CSV" aria-label="Export CSV">
            <Download className="h-4 w-4" />
          </Button>
          {actions}
          <Button onClick={onCreate} className="ml-2">
            <Plus className="h-4 w-4" /> {createLabel}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {shown} of {total}
      </p>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notice } from "@/lib/notifications";

/** Bell with a popup of pending As-Built Plan requests; each row opens that contract in the tracker. */
export function NotificationBell({ notices }: { notices: Notice[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // The timestamp makes re-opening the same record (or opening one while already in the tracker) a fresh navigation
    router.push(`/tracker?range=all&open=${id}&n=${Date.now()}`);
  };

  return (
    <div ref={ref} className="relative print:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${notices.length ? `, ${notices.length} pending` : ""}`}
        aria-expanded={open}
        className="relative text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} />
        {notices.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none tabular-nums text-white">
            {notices.length > 99 ? "99+" : notices.length}
          </span>
        )}
      </Button>

      {open && (
        <div role="dialog" aria-label="Notifications" className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              View all
            </Link>
          </div>
          {notices.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <ul className="max-h-96 divide-y overflow-y-auto">
              {notices.map((n) => (
                <li key={`${n.contractId}-${n.kind}`}>
                  <button type="button" onClick={() => go(n.contractId)} className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50">
                    <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium leading-snug">{n.title}</span>
                      <span className="block text-xs text-muted-foreground">{n.detail}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

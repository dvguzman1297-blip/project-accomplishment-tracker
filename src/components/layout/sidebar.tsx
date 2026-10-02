"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { HardHat, LayoutDashboard, LogOut, Menu, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "@/app/login/actions";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: Table2 },
];

function Panel({ email, variant, onNavigate }: { email: string; variant: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-accent-foreground">
          <HardHat className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold leading-tight tracking-tight">Accomplishment<br />Tracker</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              {active && (
                <motion.span layoutId={`nav-${variant}`} className="absolute left-0 top-1.5 h-6 w-1 rounded-r bg-accent" />
              )}
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t px-3 py-4">
        <p className="truncate px-3 text-xs text-muted-foreground" title={email}>{email}</p>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <form action={signOut} className="flex-1">
            <Button type="submit" variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/90 px-3 backdrop-blur lg:hidden">
        <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold">Accomplishment Tracker</span>
        <ThemeToggle />
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-card shadow-xl">
            <Panel email={email} variant="mobile" onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r bg-card lg:block">
        <Panel email={email} variant="desktop" />
      </aside>
    </>
  );
}

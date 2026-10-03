"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "@/app/login/actions";

const APP_NAME = "Project Accomplishment Tracker";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: Table2 },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "?";

function Avatar({ name }: { name: string }) {
  return (
    <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {initials(name)}
    </span>
  );
}

function Panel({
  name,
  email,
  onNavigate,
  collapsed = false,
  onToggle,
}: {
  name: string;
  email: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();

  const toggle = onToggle && (
    <Tooltip label="Expand sidebar" enabled={collapsed}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        title={collapsed ? undefined : "Collapse sidebar"}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} /> : <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />}
      </Button>
    </Tooltip>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header: emblem + one-line title + toggle (rail: emblem with toggle beneath) */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-2 px-2 py-4">
          <Image src="/dpwh-logo.png" alt="DPWH logo" width={36} height={36} />
          {toggle}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-4">
          <Image src="/dpwh-logo.png" alt="DPWH logo" width={36} height={36} className="shrink-0" />
          <span className="min-w-0 flex-1 text-sm font-semibold leading-tight tracking-tight">
            {APP_NAME}
          </span>
          {toggle}
        </div>
      )}

      <nav className={cn("flex-1 space-y-1", collapsed ? "px-2" : "px-3")} aria-label="Main">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Tooltip key={href} label={label} enabled={collapsed} className="w-full">
              <Link
                href={href}
                onClick={onNavigate}
                aria-label={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md py-2 text-sm transition-colors",
                  collapsed ? "justify-center px-0" : "px-3",
                  active
                    ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                    : "font-medium text-muted-foreground hover:bg-blue-50/60 hover:text-foreground dark:hover:bg-blue-950/30",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && label}
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      <div className={cn("space-y-1 border-t py-3", collapsed ? "px-2" : "px-3")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <Tooltip label={`${name} · ${email}`}>
              <span className="p-1"><Avatar name={name} /></span>
            </Tooltip>
            <Tooltip label="Toggle theme"><ThemeToggle /></Tooltip>
            <Tooltip label="Log out">
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="icon" className="text-muted-foreground" aria-label="Log out">
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                </Button>
              </form>
            </Tooltip>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-md px-2 py-2">
              <Avatar name={name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-tight" title={name}>{name}</p>
                <p className="truncate text-xs text-muted-foreground" title={email}>{email}</p>
              </div>
            </div>
            <ThemeToggle withLabel />
            <form action={signOut}>
              <Button type="submit" variant="ghost" className="w-full justify-start gap-3 px-3 font-normal text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} /> Log out
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Remember the choice across visits (storage can be unavailable, so never depend on it)
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("sidebar-collapsed") === "1");
    } catch {}
  }, []);
  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem("sidebar-collapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/90 px-3 backdrop-blur lg:hidden print:hidden">
        <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold leading-tight">{APP_NAME}</span>
        <ThemeToggle />
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[21rem] max-w-[90vw] border-r bg-card shadow-xl">
            <Panel name={name} email={email} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      {/* No overflow clipping here: rail tooltips extend past the sidebar edge */}
      <aside
        className={cn(
          "sticky top-0 z-30 hidden h-screen shrink-0 border-r bg-card transition-[width] duration-200 lg:block print:hidden",
          collapsed ? "w-16" : "w-[21rem]",
        )}
      >
        <Panel name={name} email={email} collapsed={collapsed} onToggle={toggle} />
      </aside>
    </>
  );
}

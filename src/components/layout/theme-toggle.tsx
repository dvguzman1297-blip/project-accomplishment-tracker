"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Icon-only by default; `withLabel` renders a full-width menu-style row. */
export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  const label = dark ? "Switch to light theme" : "Switch to dark theme";
  const Icon = dark ? Sun : Moon;
  return withLabel ? (
    <Button variant="ghost" className="w-full justify-start gap-3 px-3 font-normal text-muted-foreground hover:text-foreground" aria-label={label} onClick={() => setTheme(dark ? "light" : "dark")}>
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} /> {dark ? "Light mode" : "Dark mode"}
    </Button>
  ) : (
    <Button variant="ghost" size="icon" aria-label={label} onClick={() => setTheme(dark ? "light" : "dark")}>
      <Icon className="h-4 w-4" />
    </Button>
  );
}

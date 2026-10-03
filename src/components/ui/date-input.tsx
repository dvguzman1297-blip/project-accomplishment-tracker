"use client";
import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, parseDateInput } from "@/lib/format";

/** Date field that always shows and accepts "MMM dd, YYYY"; `value`/`onChange` use YYYY-MM-DD ("" = empty). */
export function DateInput({
  id,
  value,
  onChange,
  className,
  ...rest
}: {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const shown = value ? formatDate(value) : "";
  const [text, setText] = useState(shown);
  const [invalid, setInvalid] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

  // Follow outside changes (auto-filled start/expiry, calendar picks) unless the typed text already means this date
  useEffect(() => {
    if ((parseDateInput(text) ?? "") !== value) {
      setText(shown);
      setInvalid(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const type = (t: string) => {
    setText(t);
    const iso = parseDateInput(t);
    if (t.trim() === "") {
      setInvalid(false);
      onChange("");
    } else if (iso) {
      setInvalid(false);
      onChange(iso);
    } else {
      setInvalid(true);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        type="text"
        inputMode="text"
        autoComplete="off"
        placeholder="MMM dd, YYYY"
        value={text}
        aria-invalid={invalid}
        title={invalid ? "Enter a date like Jan 15, 2026" : undefined}
        onChange={(e) => type(e.target.value)}
        onBlur={() => {
          if (!invalid) setText(shown || text);
        }}
        className={cn(
          "h-9 w-full rounded-md border bg-card px-3 pr-9 text-sm placeholder:text-muted-foreground",
          invalid ? "border-destructive" : "border-input",
        )}
        aria-label={rest["aria-label"]}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Open calendar"
        onClick={() => picker.current?.showPicker?.()}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
      >
        <CalendarDays className="h-4 w-4" />
      </button>
      {/* Native picker only supplies the calendar popup; its own text is never shown */}
      <input
        ref={picker}
        type="date"
        tabIndex={-1}
        aria-hidden
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="pointer-events-none absolute bottom-0 right-0 h-0 w-0 opacity-0"
      />
    </div>
  );
}

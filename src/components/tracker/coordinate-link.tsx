"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const toNumber = (v: number | string | null | undefined) => {
  if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** Badge that opens a coordinate pair in Google Maps; a copy button sits beside it. */
export function CoordinateLink({
  label,
  lat,
  lng,
}: {
  label: string;
  lat: number | string | null | undefined;
  lng: number | string | null | undefined;
}) {
  const [copied, setCopied] = useState(false);
  const la = toNumber(lat);
  const ln = toNumber(lng);

  if (la === null || ln === null || Math.abs(la) > 90 || Math.abs(ln) > 180) {
    return <Badge className="bg-muted text-muted-foreground">No coordinates</Badge>;
  }

  const text = `${la},${ln}`;
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // row click opens the edit dialog
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (insecure context); the link still works */
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <a
        href={mapsUrl(la, ln)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={`Open ${label.toLowerCase()} location in Google Maps (${text})`}
        aria-label={`${label} location ${text}, open in Google Maps`}
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 focus-visible:outline focus-visible:outline-2"
      >
        <span aria-hidden>📍</span>
        {la.toFixed(4)}, {ln.toFixed(4)}
      </a>
      <button
        type="button"
        onClick={copy}
        title="Copy coordinates"
        aria-label={`Copy ${label.toLowerCase()} coordinates`}
        className="rounded-sm px-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

"use client";
import { useState } from "react";
import { Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { parseCoordinates, pointUrl, routeUrl } from "@/lib/coordinates";

const pin =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20";

/**
 * Clickable coordinates. `value` holds one or more "LABEL: lat, lng" pairs; each opens Google Maps
 * in a new tab, and when there are two or more a route link plots start -> end.
 */
export function CoordinateLink({ label, value }: { label: string; value: string | null | undefined }) {
  const [copied, setCopied] = useState<string>();
  const { points } = parseCoordinates(value);

  if (points.length === 0) return <Badge className="bg-muted text-muted-foreground">No coordinates</Badge>;

  const route = routeUrl(points);
  const copy = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // row click opens the edit dialog
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(undefined), 1500);
    } catch {
      /* clipboard unavailable; the links still work */
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      {points.map((p, i) => {
        const text = `${p.lat},${p.lng}`;
        return (
          <span key={i} className="inline-flex items-center gap-1">
            <a
              href={pointUrl(p)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={`${label} ${p.label.toLowerCase()}: open ${text} in Google Maps`}
              aria-label={`${label} ${p.label.toLowerCase()} ${text}, open in Google Maps`}
              className={pin}
            >
              <span aria-hidden>📍</span>
              <span className="text-[10px] uppercase opacity-70">{p.label}</span>
              {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
            </a>
            <button
              type="button"
              onClick={(e) => copy(e, text)}
              title="Copy coordinates"
              aria-label={`Copy ${label.toLowerCase()} ${p.label.toLowerCase()} coordinates`}
              className="rounded-sm px-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {copied === text ? "Copied" : "Copy"}
            </button>
          </span>
        );
      })}
      {route && (
        <a
          href={route}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Plot start and end locations in Google Maps"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          <Route className="h-3 w-3" /> Plot route
        </a>
      )}
    </div>
  );
}

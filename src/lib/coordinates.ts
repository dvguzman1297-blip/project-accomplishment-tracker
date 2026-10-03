export interface GeoPoint {
  label: string; // "START", "END" or "POINT 3"
  lat: number;
  lng: number;
}

const LINE = /^(?:([A-Za-z][\w ]*?)\s*:)?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/;

export const validLatLng = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/**
 * Parses comma-separated coordinate pairs, one per line (or separated by ";"):
 *   "START: 15.699075, 120.788852\nEND: 15.698886, 120.791714"  or  "14.5995, 120.9842"
 * Unlabelled pairs are named START, END (last of several) or POINT n.
 */
export function parseCoordinates(text: string | null | undefined): { points: GeoPoint[]; errors: string[] } {
  const points: GeoPoint[] = [];
  const errors: string[] = [];
  const lines = (text ?? "").split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  lines.forEach((line, i) => {
    const m = LINE.exec(line);
    const lat = m ? Number(m[2]) : NaN;
    const lng = m ? Number(m[3]) : NaN;
    if (!m || !validLatLng(lat, lng)) {
      errors.push(`Coordinates "${line}" must be "latitude, longitude" (latitude within ±90, longitude within ±180).`);
      return;
    }
    const label = m[1]?.trim().toUpperCase() || (i === 0 ? "START" : i === lines.length - 1 ? "END" : `POINT ${i + 1}`);
    points.push({ label, lat, lng });
  });
  return { points, errors };
}

export const serializeCoordinates = (points: { label: string; lat: string; lng: string }[]) =>
  points
    .filter((p) => p.lat.trim() || p.lng.trim())
    .map((p) => `${p.label ? p.label + ": " : ""}${p.lat.trim()}, ${p.lng.trim()}`)
    .join("\n");

export const pointUrl = (p: Pick<GeoPoint, "lat" | "lng">) =>
  `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;

/** Google Maps route plotting the first point as origin, the last as destination, others as stops. */
export function routeUrl(points: GeoPoint[]) {
  if (points.length < 2) return null;
  const f = (p: GeoPoint) => `${p.lat},${p.lng}`;
  const mid = points.slice(1, -1).map(f).join("|");
  return (
    `https://www.google.com/maps/dir/?api=1&origin=${f(points[0])}&destination=${f(points[points.length - 1])}` +
    (mid ? `&waypoints=${encodeURIComponent(mid)}` : "")
  );
}

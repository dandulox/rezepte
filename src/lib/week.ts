/** Montag 00:00 lokaler Zeit der Woche, die `date` enthält (ISO-Woche: Mo–So). */
export function mondayOfWeekContaining(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function addDays(d: Date, delta: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  x.setDate(x.getDate() + delta);
  return x;
}

export function addWeeks(monday: Date, delta: number): Date {
  return addDays(monday, 7 * delta);
}

export function weekMondayFromParam(w: string | undefined): Date {
  if (w && /^\d{4}-\d{2}-\d{2}$/.test(w)) {
    const d = parseISODateLocal(w);
    return mondayOfWeekContaining(d);
  }
  return mondayOfWeekContaining(new Date());
}

export const WEEKDAY_LABELS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

export function formatDateDe(iso: string): string {
  const d = parseISODateLocal(iso);
  return d.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

/** Montag–Sonntag, jeweils kurz lokalisiert (z. B. für Wochenplan-Überschriften). */
export function formatWeekRangeDe(mondayIso: string): string {
  const start = parseISODateLocal(mondayIso);
  const endIso = toISODateLocal(addDays(start, 6));
  return `${formatDateDe(mondayIso)} – ${formatDateDe(endIso)}`;
}

/**
 * Überschrift für die drei Wochenblöcke relativ zum Anker-Montag (`?w=`).
 * 0 = erste angezeigte Woche, 1 = Nächste Woche, 2 = Übernächste Woche.
 */
export function planWeekSectionHeading(offset: number, anchorMondayIso: string): string {
  if (offset === 0) {
    const calMonday = toISODateLocal(mondayOfWeekContaining(new Date()));
    return anchorMondayIso === calMonday ? "Diese Woche" : "Ausgewählte Woche";
  }
  if (offset === 1) return "Nächste Woche";
  return "Übernächste Woche";
}

/** Montag (ISO) des Kalenders, zu dem `mealDateIso` gehört. */
export function weekMondayIsoForDate(mealDateIso: string): string {
  return toISODateLocal(mondayOfWeekContaining(parseISODateLocal(mealDateIso)));
}

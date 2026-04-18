/** Parst Schema.org-typische ISO-8601-Dauern (z. B. PT30M, PT1H30M, P0DT2H). */
function parseDurationParts(iso: string): { d: number; h: number; m: number } | null {
  const u = iso.trim().toUpperCase();
  if (!u.startsWith("P")) return null;
  const tIdx = u.indexOf("T");
  const daySeg = tIdx === -1 ? u.slice(1) : u.slice(1, tIdx);
  const timeSeg = tIdx === -1 ? "" : u.slice(tIdx + 1);

  let d = 0;
  const dm = daySeg.match(/(\d+)D/);
  if (dm) d = parseInt(dm[1], 10);

  let h = 0;
  let m = 0;
  const hm = timeSeg.match(/(\d+)H/);
  if (hm) h = parseInt(hm[1], 10);
  const mm = timeSeg.match(/(\d+)M/);
  if (mm) m = parseInt(mm[1], 10);

  h += Math.floor(m / 60);
  m = m % 60;

  if (d === 0 && h === 0 && m === 0) return null;
  return { d, h, m };
}

/** Zeigt gespeicherte Zeit an: ISO-Dauer lesbar auf Deutsch, sonst Text unverändert. */
export function formatRecipeDurationLabel(stored: string | null | undefined): string | null {
  if (!stored?.trim()) return null;
  const t = stored.trim();
  if (/^P/i.test(t)) {
    const parts = parseDurationParts(t);
    if (parts) {
      const bits: string[] = [];
      if (parts.d > 0) {
        bits.push(`${parts.d} ${parts.d === 1 ? "Tag" : "Tage"}`);
      }
      if (parts.h > 0) {
        bits.push(`${parts.h} Std.`);
      }
      if (parts.m > 0) {
        bits.push(`${parts.m} Min.`);
      }
      if (bits.length === 0) return null;
      return bits.join(" ");
    }
  }
  return t;
}

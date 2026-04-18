export type ParsedIngredientLine =
  | { kind: "none"; rawText: string }
  | {
      kind: "single";
      quantity: number;
      unit: string | null;
      name: string;
      rawText: string;
    }
  | {
      kind: "range";
      min: number;
      max: number;
      unit: string | null;
      name: string;
      rawText: string;
    };

const UNICODE_FRAC: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
};

const UNIT_PATTERN =
  /^(g|kg|mg|ml|cl|dl|l|Liter|EL|TL|Stück|Stk\.?|Bund|Prise|Prisen|Packung|Pckg\.?|Zehe|Zehen|Zweig(e)?|Handvoll|TLn|ELn)\b/i;

function normalizeDecimal(s: string): number {
  return parseFloat(s.replace(",", "."));
}

function parseLeadingSingleNumber(text: string): { value: number; len: number } | null {
  const t = text.trimStart();
  if (!t.length) return null;

  const fracKey = t[0];
  if (fracKey in UNICODE_FRAC) {
    return { value: UNICODE_FRAC[fracKey], len: 1 };
  }

  const mixed = t.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (mixed) {
    const whole = parseInt(mixed[1], 10);
    const num = parseInt(mixed[2], 10);
    const den = parseInt(mixed[3], 10);
    if (den === 0) return null;
    return { value: whole + num / den, len: mixed[0].length };
  }

  const simpleFrac = t.match(/^(\d+)\s*\/\s*(\d+)/);
  if (simpleFrac) {
    const num = parseInt(simpleFrac[1], 10);
    const den = parseInt(simpleFrac[2], 10);
    if (den === 0) return null;
    return { value: num / den, len: simpleFrac[0].length };
  }

  const dec = t.match(/^(\d+(?:[.,]\d+)?)/);
  if (dec) {
    return { value: normalizeDecimal(dec[1]), len: dec[0].length };
  }

  const fracOnly = t.match(/^[½¼¾⅓⅔]/);
  if (fracOnly) {
    const v = UNICODE_FRAC[fracOnly[0]];
    if (v != null) return { value: v, len: 1 };
  }

  return null;
}

function splitUnitAndName(rest: string): { unit: string | null; name: string } {
  const trimmed = rest.trim();
  const m = trimmed.match(UNIT_PATTERN);
  if (!m) {
    return { unit: null, name: trimmed };
  }
  const unit = m[1];
  const name = trimmed.slice(m[0].length).trim();
  return { unit, name: name || trimmed };
}

export function parseIngredientLine(rawText: string): ParsedIngredientLine {
  const raw = rawText.trim();
  if (!raw) {
    return { kind: "none", rawText: raw };
  }

  const rangeRest = raw.match(
    /^(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)\s+(.*)$/,
  );
  if (rangeRest) {
    const min = normalizeDecimal(rangeRest[1]);
    const max = normalizeDecimal(rangeRest[2]);
    const { unit, name } = splitUnitAndName(rangeRest[3]);
    if (name) {
      return { kind: "range", min, max, unit, name, rawText: raw };
    }
  }

  const first = parseLeadingSingleNumber(raw);
  if (!first) {
    return { kind: "none", rawText: raw };
  }

  const afterNum = raw.slice(first.len).trimStart();
  const { unit, name } = splitUnitAndName(afterNum);
  if (!name && !unit) {
    return { kind: "none", rawText: raw };
  }

  return {
    kind: "single",
    quantity: first.value,
    unit,
    name: name || afterNum,
    rawText: raw,
  };
}

export function formatQuantityDe(n: number): string {
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round(n * 1000) / 1000;
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  }).format(rounded);
}

function formatIntDe(n: number): string {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(n);
}

function formatDecimalDe(n: number, maxFrac: number): string {
  const f = 10 ** maxFrac;
  const rounded = Math.round(n * f) / f;
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: 0,
  }).format(rounded);
}

function unicodeFracRemainder(r: number): string | null {
  if (Math.abs(r - 0.25) < 0.029) return "¼";
  if (Math.abs(r - 0.5) < 0.029) return "½";
  if (Math.abs(r - 0.75) < 0.029) return "¾";
  if (Math.abs(r - 1 / 3) < 0.029) return "⅓";
  if (Math.abs(r - 2 / 3) < 0.029) return "⅔";
  return null;
}

/** Für TL/EL: Viertel oder Drittel wählen, was näher an der Zahl liegt. */
function snapNiceForSpoon(n: number): number {
  const fourths = Math.round(n * 4) / 4;
  const thirds = Math.round(n * 3) / 3;
  const d4 = Math.abs(n - fourths);
  const d3 = Math.abs(n - thirds);
  if (d3 + 1e-9 < d4) return thirds;
  return fourths;
}

function formatSpoonDe(n: number): string {
  const snapped = snapNiceForSpoon(Math.max(0, n));
  if (snapped === 0) return "0";
  const whole = Math.floor(snapped + 1e-9);
  const r = snapped - whole;
  if (r < 0.001) return formatIntDe(whole);
  const sym = unicodeFracRemainder(r);
  if (sym) return whole === 0 ? sym : `${whole}${sym}`;
  return formatDecimalDe(snapped, 2);
}

function formatCountDe(n: number, unitNorm: string): string {
  if (unitNorm === "prise" || unitNorm === "prisen") {
    return formatIntDe(Math.max(1, Math.round(n)));
  }
  if (unitNorm === "handvoll") {
    return formatDecimalDe(n, 1);
  }
  const half = Math.round(n * 2) / 2;
  if (half % 1 === 0) return formatIntDe(half);
  return formatSpoonDe(half);
}

/**
 * Lesbare Küchen-Mengen: ganze g/ml, Brüche bei TL/EL, sinnvolle Rundung bei Stück/Zehe.
 */
export function formatQuantityForKitchen(n: number, unit: string | null): string {
  if (!Number.isFinite(n)) return "";
  const u = unit?.toLowerCase() ?? "";

  if (u === "tl" || u === "tln" || u === "el" || u === "eln") {
    return formatSpoonDe(n);
  }
  if (u === "g") {
    return formatIntDe(Math.round(n));
  }
  if (u === "mg") {
    return formatIntDe(Math.round(n));
  }
  if (u === "ml") {
    return formatIntDe(Math.round(n));
  }
  if (u === "cl") {
    return formatDecimalDe(n, 1);
  }
  if (u === "dl") {
    return formatDecimalDe(n, 2);
  }
  if (u === "l" || u === "liter") {
    return formatDecimalDe(n, n >= 10 ? 1 : 2);
  }
  if (u === "kg") {
    return formatDecimalDe(n, n >= 10 ? 2 : 3);
  }
  if (
    u === "stück" ||
    u === "stk." ||
    u === "stk" ||
    u === "zehe" ||
    u === "zehen" ||
    u === "bund" ||
    u === "packung" ||
    u === "pckg." ||
    u === "pckg" ||
    u === "prise" ||
    u === "prisen" ||
    u === "handvoll"
  ) {
    return formatCountDe(n, u);
  }
  return formatQuantityDe(n);
}

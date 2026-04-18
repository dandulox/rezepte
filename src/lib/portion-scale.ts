import {
  formatQuantityForKitchen,
  parseIngredientLine,
  type ParsedIngredientLine,
} from "@/lib/ingredient-parse";

function normalizeScaledUnit(
  qty: number,
  unit: string | null,
): { qty: number; unit: string | null } {
  if (!unit) return { qty, unit: null };
  const u = unit.toLowerCase();
  if (u === "kg" && qty > 0 && qty < 1) {
    return { qty: qty * 1000, unit: "g" };
  }
  if ((u === "l" || u === "liter") && qty > 0 && qty < 1) {
    const ml = qty * 1000;
    if (ml >= 1) return { qty: ml, unit: "ml" };
  }
  if (u === "liter") return { qty, unit: "l" };
  return { qty, unit };
}

/** Gleiche Einheit für Min–Max, keine Mischung aus g und kg. */
function normalizeScaledRange(
  minQ: number,
  maxQ: number,
  unit: string | null,
): { min: number; max: number; unit: string | null } {
  if (!unit) return { min: minQ, max: maxQ, unit: null };
  const u = unit.toLowerCase();
  if (u === "kg" && maxQ > 0 && maxQ < 1) {
    return { min: minQ * 1000, max: maxQ * 1000, unit: "g" };
  }
  if ((u === "l" || u === "liter") && maxQ > 0 && maxQ < 1) {
    const maxMl = maxQ * 1000;
    if (maxMl >= 1) {
      return { min: minQ * 1000, max: maxQ * 1000, unit: "ml" };
    }
  }
  if (u === "liter") return { min: minQ, max: maxQ, unit: "l" };
  return { min: minQ, max: maxQ, unit };
}

export function scaledIngredientDisplay(
  parsed: ParsedIngredientLine,
  factor: number,
): string {
  if (parsed.kind === "none") {
    return parsed.rawText;
  }
  if (parsed.kind === "single") {
    let q = parsed.quantity * factor;
    let displayUnit = parsed.unit;
    const norm = normalizeScaledUnit(q, parsed.unit);
    q = norm.qty;
    displayUnit = norm.unit;
    const qty = formatQuantityForKitchen(q, displayUnit);
    if (displayUnit) {
      return `${qty} ${displayUnit} ${parsed.name}`.trim();
    }
    return `${qty} ${parsed.name}`.trim();
  }
  const r = normalizeScaledRange(
    parsed.min * factor,
    parsed.max * factor,
    parsed.unit,
  );
  const displayUnit = r.unit;
  const a = formatQuantityForKitchen(r.min, displayUnit);
  const b = formatQuantityForKitchen(r.max, displayUnit);
  if (displayUnit) {
    return `${a} – ${b} ${displayUnit} ${parsed.name}`.trim();
  }
  return `${a} – ${b} ${parsed.name}`.trim();
}

export function displayIngredientLine(rawText: string, factor: number): string {
  return scaledIngredientDisplay(parseIngredientLine(rawText), factor);
}

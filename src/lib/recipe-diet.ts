/**
 * Ernährungsart / Fleischart (Nebenkategorie), DB-Feld `Recipe.dietKind`.
 * Labels und Fleisch-Flag kommen aus `RecipeDietKindDef` (Admin).
 */

import type { RecipeDietKindDefPublic } from "@/lib/recipe-taxonomy";

export const RECIPE_DIET_KIND_SEED_IDS = [
  "vegan",
  "vegetarisch",
  "fleisch_huhn",
  "fleisch_schwein",
  "fleisch_rind",
  "fleisch_andere",
] as const;

export function recipeDietKindLabelFromDefs(
  id: string | null | undefined,
  defs: readonly RecipeDietKindDefPublic[],
): string | null {
  if (!id) return null;
  const row = defs.find((d) => d.id === id);
  return row ? row.labelDe : null;
}

/** Anzeige mit UI-Sprache (Rezeptliste / Detail). */
export function recipeDietKindDisplayLabel(
  id: string | null | undefined,
  locale: "de" | "en",
  defs: readonly RecipeDietKindDefPublic[],
): string | null {
  if (!id) return null;
  const row = defs.find((d) => d.id === id);
  if (!row) return id.trim() || null;
  return locale === "en" ? row.labelEn : row.labelDe;
}

export function isRecipeDietKindInDefs(
  value: string,
  defs: readonly RecipeDietKindDefPublic[],
): boolean {
  return defs.some((d) => d.id === value);
}

export function recipeDietKindIsMeatFromDefs(
  id: string | null | undefined,
  defs: readonly RecipeDietKindDefPublic[],
): boolean {
  if (!id) return false;
  const row = defs.find((d) => d.id === id);
  return row?.isMeat ?? false;
}

function foldDietText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ß/g, "ss");
}

export function recipeDietKindSearchFoldedBlob(
  id: string | null | undefined,
  defs: readonly RecipeDietKindDefPublic[],
): string | null {
  if (!id) return null;
  const row = defs.find((d) => d.id === id);
  if (!row) return null;
  const extra = row.searchExtra.trim();
  const label = row.labelDe;
  return foldDietText(`${label} ${extra}`);
}

export function recipeDietKindMatchesFoldedQuery(
  id: string | null | undefined,
  foldedQuery: string,
  defs: readonly RecipeDietKindDefPublic[],
): boolean {
  const blob = recipeDietKindSearchFoldedBlob(id, defs);
  if (!blob || !foldedQuery) return false;
  if (blob.includes(foldedQuery)) return true;
  return false;
}

/**
 * Ernährungsart / Fleischart (Nebenkategorie), DB-Feld `Recipe.dietKind`.
 */

export const RECIPE_DIET_KIND_IDS = [
  "vegan",
  "vegetarisch",
  "fleisch_huhn",
  "fleisch_schwein",
  "fleisch_rind",
  "fleisch_andere",
] as const;

export type RecipeDietKindId = (typeof RECIPE_DIET_KIND_IDS)[number];

export const RECIPE_DIET_KIND_LABEL: Record<RecipeDietKindId, string> = {
  vegan: "Vegan",
  vegetarisch: "Vegetarisch",
  fleisch_huhn: "Huhn / Geflügel",
  fleisch_schwein: "Schwein",
  fleisch_rind: "Rind",
  fleisch_andere: "Fleisch (sonstiges)",
};

/** Zusätzliche Suchbegriffe (werden wie der sichtbare Text gefaltet verglichen). */
const RECIPE_DIET_SEARCH_EXTRA: Record<RecipeDietKindId, string> = {
  vegan: "pflanzlich plant-based",
  vegetarisch: "veggie ovo-laktisch eier milch",
  fleisch_huhn: "hähnchen geflügel poulet chicken pute truthahn fleisch",
  fleisch_schwein: "schweinefleisch speck bacon schinken fleisch",
  fleisch_rind: "rindfleisch beef steak burger fleisch",
  fleisch_andere:
    "fleisch lamm lammfleisch ente gans fisch lachs thunfisch wild kaninchen",
};

export function isRecipeDietKindId(value: string): value is RecipeDietKindId {
  return (RECIPE_DIET_KIND_IDS as readonly string[]).includes(value);
}

const MEAT_DIET_KINDS: readonly RecipeDietKindId[] = [
  "fleisch_huhn",
  "fleisch_schwein",
  "fleisch_rind",
  "fleisch_andere",
];

export function recipeDietKindIsMeat(id: string | null | undefined): boolean {
  return !!id && isRecipeDietKindId(id) && MEAT_DIET_KINDS.includes(id);
}

export function recipeDietKindFromFormValue(raw: string): RecipeDietKindId | null {
  const t = raw.trim();
  if (!t) return null;
  return isRecipeDietKindId(t) ? t : null;
}

export function recipeDietKindLabel(
  id: string | null | undefined,
): string | null {
  if (!id || !isRecipeDietKindId(id)) return null;
  return RECIPE_DIET_KIND_LABEL[id];
}

function foldDietText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ß/g, "ss");
}

/** Gefalteter String für Textsuche (Titel-Suche etc.). */
export function recipeDietKindSearchFoldedBlob(
  id: string | null | undefined,
): string | null {
  if (!id || !isRecipeDietKindId(id)) return null;
  const label = RECIPE_DIET_KIND_LABEL[id];
  const extra = RECIPE_DIET_SEARCH_EXTRA[id];
  return foldDietText(`${label} ${extra}`);
}

export function recipeDietKindMatchesFoldedQuery(
  id: string | null | undefined,
  foldedQuery: string,
): boolean {
  const blob = recipeDietKindSearchFoldedBlob(id);
  if (!blob || !foldedQuery) return false;
  if (blob.includes(foldedQuery)) return true;
  return false;
}

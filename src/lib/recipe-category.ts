/**
 * Rezept-Kategorien (Gerichtstyp), unabhängig von Zutaten-Gruppierung.
 * Sichtbare Namen und Liste kommen aus `RecipeCategoryDef` (Admin).
 * Heuristik für Import: `CATEGORY_MATCH_RULES` (Slug muss in DB existieren).
 */

import type { RecipeCategoryDefPublic } from "@/lib/recipe-taxonomy";

/** Slugs der Standard-Seed-Kategorien — für Tests & Import ohne DB-Kontext. */
export const RECIPE_CATEGORY_SEED_IDS = [
  "hauptgericht",
  "vorspeise",
  "beilage",
  "salat",
  "suppe",
  "dessert",
  "backen",
  "fruehstueck",
  "getraenk",
  "snack",
  "sonstiges",
] as const;

export type RecipeCategoryLabelLocale = "de" | "en";

export function recipeCategoryLabelFromDefs(
  id: string | null | undefined,
  locale: RecipeCategoryLabelLocale,
  defs: readonly RecipeCategoryDefPublic[],
): string | null {
  if (!id) return null;
  const row = defs.find((d) => d.id === id);
  return row ? (locale === "en" ? row.labelEn : row.labelDe) : null;
}

/** Anzeige: bekannte Slugs übersetzt, sonst Rohwert aus der DB. */
export function displayRecipeCategoryLabel(
  category: string | null | undefined,
  locale: RecipeCategoryLabelLocale,
  defs: readonly RecipeCategoryDefPublic[],
): string | null {
  if (!category?.trim()) return null;
  const mapped = recipeCategoryLabelFromDefs(category, locale, defs);
  if (mapped) return mapped;
  return category.trim();
}

export function isRecipeCategoryInDefs(
  value: string,
  defs: readonly RecipeCategoryDefPublic[],
): boolean {
  return defs.some((d) => d.id === value);
}

/** Normalisiert für Muster-Vergleich (Kleinbuchstaben, Umlaute auf ASCII). */
export function foldRecipeCategoryText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ß/g, "ss");
}

type CategoryRule = { id: string; patterns: RegExp[] };

/** Reihenfolge: spezifischere Typen vor allgemeinen (erster Treffer zählt). */
const CATEGORY_MATCH_RULES: CategoryRule[] = [
  {
    id: "suppe",
    patterns: [
      /\b(suppe|cremesuppe|bruhe|bouillon|eintopf|consomme|gazpacho|ramen|pho)\b/,
      /suppe\b/,
      /\b(soup|stew|chowder|bisque|broth)\b/,
    ],
  },
  {
    id: "salat",
    patterns: [/\b(salat|salad|coleslaw)\b/, /salat\b/],
  },
  {
    id: "dessert",
    patterns: [
      /\b(dessert|nachspeise|nachtisch)\b/,
      /\bsusspeise\b/,
      /\b(pudding|mousse|parfait|tiramisu|curd|sorbet|eiscreme)\b/,
    ],
  },
  {
    id: "backen",
    patterns: [
      /\b(kuchen|torte|muffin|brownie|cupcake|gugelhupf|streusel)\b/,
      /\b(cookie|kekse|plaetzchen|plätzchen|biskuit|biskuitteig)\b/,
      /\b(brot|baguette|brioche|croissant|waffel|pfannkuchen|palatschinken|crepes?)\b/,
      /\b(strudel|cheesecake|pie|tarte|donut|doughnut)\b/,
    ],
  },
  {
    id: "fruehstueck",
    patterns: [
      /\b(fruehstueck|frühstück|breakfast|brunch)\b/,
      /\b(muesli|müsli|porridge|granola)\b/,
    ],
  },
  {
    id: "getraenk",
    patterns: [
      /\b(smoothie|shake|limonade|eistee|cocktail|mocktail|kakaodrink)\b/,
      /\bheisse\s*schokolade\b/,
    ],
  },
  {
    id: "snack",
    patterns: [/\b(snack|fingerfood|dip|aufstrich)\b/],
  },
  {
    id: "vorspeise",
    patterns: [/\b(vorspeise|appetizer|starter|antipasti|tapas)\b/],
  },
  {
    id: "beilage",
    patterns: [/\b(beilage|side\s*dish|garnitur)\b/],
  },
  {
    id: "hauptgericht",
    patterns: [
      /\b(hauptgericht|hauptspeise|main\s*course|main\s*dish)\b/,
      /\b(braten|gulasch|ragout|curry|pfannengericht)\b/,
    ],
  },
];

function matchCategoryInFolded(folded: string): string | null {
  for (const { id, patterns } of CATEGORY_MATCH_RULES) {
    for (const re of patterns) {
      re.lastIndex = 0;
      if (re.test(folded)) return id;
    }
  }
  return null;
}

/** Liest Schema.org `recipeCategory` (String oder Liste). */
export function parseJsonLdRecipeCategory(raw: unknown): string | null {
  if (typeof raw === "string") {
    const t = raw.trim();
    return t || null;
  }
  if (Array.isArray(raw)) {
    const parts = raw
      .filter((x): x is string => typeof x === "string")
      .map((x) => x.trim())
      .filter(Boolean);
    return parts.length ? parts.join(" ") : null;
  }
  return null;
}

/** Ordnet ein freies Kategorie-Label einer Slug zu, sofern in `validIds` erlaubt. */
export function recipeCategoryFromLabel(
  label: string | null,
  validIds: Set<string>,
): string | null {
  if (!label) return null;
  const folded = foldRecipeCategoryText(label);
  if (validIds.has(folded)) return folded;
  const matched = matchCategoryInFolded(folded);
  if (matched && validIds.has(matched)) return matched;
  return null;
}

export function inferRecipeCategoryFromBlob(
  text: string,
  validIds: Set<string>,
): string | null {
  if (!text.trim()) return null;
  const matched = matchCategoryInFolded(foldRecipeCategoryText(text));
  if (matched && validIds.has(matched)) return matched;
  return null;
}

export function resolveImportedRecipeCategory(
  input: {
    jsonLdRecipeCategory: unknown;
    title: string;
    description: string | null;
    ingredients: string[];
    instructions: string[];
  },
  validIds: Set<string>,
): string | null {
  const fromLd = recipeCategoryFromLabel(
    parseJsonLdRecipeCategory(input.jsonLdRecipeCategory),
    validIds,
  );
  if (fromLd) return fromLd;
  const blob = [
    input.title,
    input.description ?? "",
    ...input.ingredients,
    ...input.instructions,
  ].join("\n");
  return inferRecipeCategoryFromBlob(blob, validIds);
}

/**
 * Rezept-Kategorien (Gerichtstyp), unabhängig von Zutaten-Gruppierung.
 * Werte entsprechen DB-Feld `Recipe.category`.
 */

export const RECIPE_CATEGORY_IDS = [
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

export type RecipeCategoryId = (typeof RECIPE_CATEGORY_IDS)[number];

export const RECIPE_CATEGORY_LABEL: Record<RecipeCategoryId, string> = {
  hauptgericht: "Hauptgericht",
  vorspeise: "Vorspeise",
  beilage: "Beilage",
  salat: "Salat",
  suppe: "Suppe & Eintopf",
  dessert: "Dessert",
  backen: "Backen",
  fruehstueck: "Frühstück & Brunch",
  getraenk: "Getränk",
  snack: "Snack",
  sonstiges: "Sonstiges",
};

export const RECIPE_CATEGORY_LABEL_EN: Record<RecipeCategoryId, string> = {
  hauptgericht: "Main course",
  vorspeise: "Starter",
  beilage: "Side dish",
  salat: "Salad",
  suppe: "Soup & stew",
  dessert: "Dessert",
  backen: "Baking",
  fruehstueck: "Breakfast & brunch",
  getraenk: "Drink",
  snack: "Snack",
  sonstiges: "Other",
};

export type RecipeCategoryLabelLocale = "de" | "en";

export function isRecipeCategoryId(value: string): value is RecipeCategoryId {
  return (RECIPE_CATEGORY_IDS as readonly string[]).includes(value);
}

/** Normalisiert für Muster-Vergleich (Kleinbuchstaben, Umlaute auf ASCII). */
export function foldRecipeCategoryText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ß/g, "ss");
}

type CategoryRule = { id: RecipeCategoryId; patterns: RegExp[] };

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

function matchCategoryInFolded(folded: string): RecipeCategoryId | null {
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

/** Ordnet ein freies Kategorie-Label (z. B. aus JSON-LD) einer festen Kategorie zu. */
export function recipeCategoryFromLabel(label: string | null): RecipeCategoryId | null {
  if (!label) return null;
  const folded = foldRecipeCategoryText(label);
  if (isRecipeCategoryId(folded)) return folded;
  return matchCategoryInFolded(folded);
}

export function inferRecipeCategoryFromBlob(text: string): RecipeCategoryId | null {
  if (!text.trim()) return null;
  return matchCategoryInFolded(foldRecipeCategoryText(text));
}

export function resolveImportedRecipeCategory(input: {
  jsonLdRecipeCategory: unknown;
  title: string;
  description: string | null;
  ingredients: string[];
  instructions: string[];
}): RecipeCategoryId | null {
  const fromLd = recipeCategoryFromLabel(parseJsonLdRecipeCategory(input.jsonLdRecipeCategory));
  if (fromLd) return fromLd;
  const blob = [
    input.title,
    input.description ?? "",
    ...input.ingredients,
    ...input.instructions,
  ].join("\n");
  return inferRecipeCategoryFromBlob(blob);
}

/** Formularwert: leer oder gültige Slug. */
export function recipeCategoryFromFormValue(raw: string): RecipeCategoryId | null {
  const t = raw.trim();
  if (!t) return null;
  return isRecipeCategoryId(t) ? t : null;
}

export function recipeCategoryLabel(
  id: string | null | undefined,
  locale: RecipeCategoryLabelLocale = "de",
): string | null {
  if (!id || !isRecipeCategoryId(id)) return null;
  return locale === "en" ? RECIPE_CATEGORY_LABEL_EN[id] : RECIPE_CATEGORY_LABEL[id];
}

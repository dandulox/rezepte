/** Ausgangssprache der gespeicherten Rezepte (Import/Formular). */
export const RECIPE_TRANSLATE_SOURCE_DEFAULT = "de";

export const RECIPE_TRANSLATE_TARGETS = [
  { code: "en", labelDe: "Englisch" },
  { code: "fr", labelDe: "Französisch" },
  { code: "it", labelDe: "Italienisch" },
  { code: "es", labelDe: "Spanisch" },
  { code: "pl", labelDe: "Polnisch" },
] as const;

export type RecipeTranslateTargetCode = (typeof RECIPE_TRANSLATE_TARGETS)[number]["code"];

export function isRecipeTranslateTargetCode(
  value: string,
): value is RecipeTranslateTargetCode {
  return (RECIPE_TRANSLATE_TARGETS as readonly { code: string }[]).some(
    (t) => t.code === value,
  );
}

/** Sprachen mit UI-Strings auf der Rezeptseite (Original + Ziele). */
export type RecipeViewLang = "de" | RecipeTranslateTargetCode;

export function isRecipeViewLang(value: string): value is RecipeViewLang {
  if (value === "de") return true;
  return isRecipeTranslateTargetCode(value);
}

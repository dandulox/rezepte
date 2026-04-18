import { isRecipeViewLang, type RecipeViewLang } from "@/lib/recipe-translate-locales";

export function normalizeRecipeDisplayLocale(
  raw: string | null | undefined,
): RecipeViewLang {
  const s = (raw ?? "").trim();
  if (isRecipeViewLang(s)) return s;
  return "de";
}

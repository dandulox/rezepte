import { recipeCategoryLabel } from "@/lib/recipe-category";
import { recipeDietKindMatchesFoldedQuery } from "@/lib/recipe-diet";

export type RecipeSearchIngredient = { name: string | null; rawText: string };

export type RecipeSearchFields = {
  title: string;
  category: string | null;
  dietKind: string | null;
  ingredients: RecipeSearchIngredient[];
};

export function foldRecipeSearchText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ß/g, "ss");
}

export function recipeMatchesSearchQuery(
  r: RecipeSearchFields,
  q: string,
): boolean {
  const t = q.trim();
  if (!t) return true;
  const n = foldRecipeSearchText(t);
  if (foldRecipeSearchText(r.title).includes(n)) return true;
  const cat = recipeCategoryLabel(r.category);
  if (cat && foldRecipeSearchText(cat).includes(n)) return true;
  if (recipeDietKindMatchesFoldedQuery(r.dietKind, n)) return true;
  for (const ing of r.ingredients) {
    const hay = ing.name ?? ing.rawText;
    if (hay && foldRecipeSearchText(hay).includes(n)) return true;
  }
  return false;
}

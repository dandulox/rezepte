import { recipeDietKindMatchesFoldedQuery } from "@/lib/recipe-diet";
import type { RecipeCategoryDefPublic, RecipeDietKindDefPublic } from "@/lib/recipe-taxonomy";

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

function categorySearchBlob(
  category: string | null,
  defs: readonly RecipeCategoryDefPublic[] | undefined,
): string | null {
  if (!category) return null;
  if (!defs?.length) return category;
  const row = defs.find((d) => d.id === category);
  if (row) return `${row.labelDe} ${row.labelEn}`;
  return category;
}

export function recipeMatchesSearchQuery(
  r: RecipeSearchFields,
  q: string,
  opts?: {
    categoryDefs?: readonly RecipeCategoryDefPublic[];
    dietKindDefs?: readonly RecipeDietKindDefPublic[];
  },
): boolean {
  const t = q.trim();
  if (!t) return true;
  const n = foldRecipeSearchText(t);
  if (foldRecipeSearchText(r.title).includes(n)) return true;
  const catBlob = categorySearchBlob(r.category, opts?.categoryDefs);
  if (catBlob && foldRecipeSearchText(catBlob).includes(n)) return true;
  if (
    opts?.dietKindDefs &&
    recipeDietKindMatchesFoldedQuery(r.dietKind, n, opts.dietKindDefs)
  ) {
    return true;
  }
  if (!opts?.dietKindDefs && r.dietKind && foldRecipeSearchText(r.dietKind).includes(n)) {
    return true;
  }
  for (const ing of r.ingredients) {
    const hay = ing.name ?? ing.rawText;
    if (hay && foldRecipeSearchText(hay).includes(n)) return true;
  }
  return false;
}

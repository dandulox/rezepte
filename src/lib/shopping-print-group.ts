import {
  classifyIngredientGroup,
  INGREDIENT_GROUP_LABEL,
  INGREDIENT_GROUP_ORDER,
  type IngredientGroupId,
} from "@/lib/ingredient-category";
import { parseIngredientLine } from "@/lib/ingredient-parse";

export type ShoppingPrintRow = {
  id: string;
  text: string;
  recipeTitle: string;
  date: string;
};

export type ShoppingPrintGroup = {
  groupId: IngredientGroupId;
  label: string;
  items: ShoppingPrintRow[];
};

type ShoppingItemInput = {
  id: string;
  text: string;
  checked: boolean;
  plannedMeal: {
    date: string;
    recipe: { title: string };
  };
};

/** Nur offene Einträge; Gruppen in INGREDIENT_GROUP_ORDER, Zeilen deutsch sortiert. */
export function groupShoppingListByIngredientCategory(
  items: ShoppingItemInput[],
): ShoppingPrintGroup[] {
  const open = items.filter((i) => !i.checked);
  const buckets = new Map<IngredientGroupId, ShoppingPrintRow[]>();
  for (const g of INGREDIENT_GROUP_ORDER) buckets.set(g, []);

  for (const item of open) {
    const parsed = parseIngredientLine(item.text);
    const groupId = classifyIngredientGroup(item.text, parsed);
    buckets.get(groupId)!.push({
      id: item.id,
      text: item.text,
      recipeTitle: item.plannedMeal.recipe.title,
      date: item.plannedMeal.date,
    });
  }

  const result: ShoppingPrintGroup[] = [];
  for (const groupId of INGREDIENT_GROUP_ORDER) {
    const groupItems = buckets.get(groupId)!;
    if (groupItems.length === 0) continue;
    groupItems.sort((a, b) => a.text.localeCompare(b.text, "de"));
    result.push({
      groupId,
      label: INGREDIENT_GROUP_LABEL[groupId],
      items: groupItems,
    });
  }
  return result;
}

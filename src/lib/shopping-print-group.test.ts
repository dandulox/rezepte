import { describe, expect, it } from "vitest";
import { groupShoppingListByIngredientCategory } from "@/lib/shopping-print-group";

const meal = { date: "2026-04-15", recipe: { title: "Test" } };

describe("groupShoppingListByIngredientCategory", () => {
  it("sortiert offene Artikel nach Zutaten-Kategorie", () => {
    const groups = groupShoppingListByIngredientCategory([
      {
        id: "1",
        text: "1 Bund Petersilie",
        checked: false,
        plannedMeal: meal,
      },
      {
        id: "2",
        text: "400 g Rinderhack",
        checked: false,
        plannedMeal: meal,
      },
      {
        id: "3",
        text: "1 TL Paprikapulver",
        checked: false,
        plannedMeal: meal,
      },
    ]);
    expect(groups.map((g) => g.groupId)).toEqual(["fleisch", "gemuese", "gewuerze"]);
  });

  it("ignoriert abgehakte Einträge", () => {
    const groups = groupShoppingListByIngredientCategory([
      {
        id: "1",
        text: "200 g Mehl",
        checked: true,
        plannedMeal: meal,
      },
    ]);
    expect(groups).toEqual([]);
  });
});

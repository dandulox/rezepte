/** Wochenplan-Kalender: nur Rezept-Meta, keine Zutaten */
export type PlanWeekClientMeal = {
  id: string;
  date: string;
  recipeId: string;
  recipe: {
    id: string;
    title: string;
    imageUrl: string | null;
    category: string | null;
  };
};

/** Einkaufsseite: Mahlzeiten inkl. Zutaten zum Anhängen an die Liste */
export type PlanEinkaufMeal = {
  id: string;
  date: string;
  recipeId: string;
  recipe: {
    title: string;
    ingredients: { id: string; rawText: string }[];
  };
};

export type PlanWeekClientShopping = {
  id: string;
  weekStart: string;
  text: string;
  checked: boolean;
  plannedMealId: string;
  ingredientId: string;
  plannedMeal: {
    date: string;
    recipe: { title: string };
  };
};

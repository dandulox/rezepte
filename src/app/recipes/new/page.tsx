import { getRecipeCategoryDefs, getRecipeDietKindDefs } from "@/lib/recipe-taxonomy";
import { NewRecipeClient } from "./NewRecipeClient";

export const metadata = {
  title: "Neues Rezept · Rezeptbuch",
};

export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const initialTab = mode === "import" ? "import" : "manual";
  const [categoryDefs, dietKindDefs] = await Promise.all([
    getRecipeCategoryDefs(),
    getRecipeDietKindDefs(),
  ]);
  return (
    <NewRecipeClient
      initialTab={initialTab}
      categoryDefs={categoryDefs}
      dietKindDefs={dietKindDefs}
    />
  );
}

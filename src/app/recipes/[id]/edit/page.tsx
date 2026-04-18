import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isRecipeCategoryInDefs } from "@/lib/recipe-category";
import { isRecipeDietKindInDefs } from "@/lib/recipe-diet";
import { getRecipeCategoryDefs, getRecipeDietKindDefs } from "@/lib/recipe-taxonomy";
import { RecipeForm } from "@/components/RecipeForm";
import { DeleteRecipeButton } from "@/components/DeleteRecipeButton";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { ingredients: { orderBy: { sortOrder: "asc" } } },
  });

  if (!recipe) notFound();

  const [categoryDefs, dietKindDefs] = await Promise.all([
    getRecipeCategoryDefs(),
    getRecipeDietKindDefs(),
  ]);

  const instructions = Array.isArray(recipe.instructions)
    ? (recipe.instructions as unknown[]).map((x) => String(x))
    : typeof recipe.instructions === "string"
      ? [recipe.instructions]
      : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-4 py-6">
        <h1 className="mx-auto w-full max-w-2xl text-2xl font-semibold text-foreground">
          Rezept bearbeiten
        </h1>
      </div>
      <RecipeForm
        mode="edit"
        recipeId={recipe.id}
        categoryDefs={categoryDefs}
        dietKindDefs={dietKindDefs}
        initial={{
          title: recipe.title,
          description: recipe.description ?? "",
          imageUrl: recipe.imageUrl ?? "",
          prepTime: recipe.prepTime ?? "",
          cookTime: recipe.cookTime ?? "",
          totalTime: recipe.totalTime ?? "",
          sourceUrl: recipe.sourceUrl ?? "",
          servingsBase: recipe.servingsBase,
          category:
            recipe.category && isRecipeCategoryInDefs(recipe.category, categoryDefs)
              ? recipe.category
              : null,
          dietKind:
            recipe.dietKind && isRecipeDietKindInDefs(recipe.dietKind, dietKindDefs)
              ? recipe.dietKind
              : null,
          ingredients: recipe.ingredients.map((i) => i.rawText),
          nutritionText: recipe.nutritionText ?? "",
          instructions,
        }}
      />
      <div className="mx-auto max-w-2xl px-4 pb-12">
        <DeleteRecipeButton recipeId={recipe.id} />
      </div>
    </div>
  );
}

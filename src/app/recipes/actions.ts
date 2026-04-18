"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recipeCategoryFromFormValue } from "@/lib/recipe-category";
import { recipeDietKindFromFormValue } from "@/lib/recipe-diet";
import { ingredientsForDb } from "@/lib/recipe-import";

export type RecipeFormState = {
  error?: string;
};

function linesFromBlock(name: string, formData: FormData): string[] {
  const raw = String(formData.get(name) ?? "");
  return raw
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createRecipeAction(
  _prev: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "Titel fehlt." };
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const prepTime = String(formData.get("prepTime") ?? "").trim() || null;
  const cookTime = String(formData.get("cookTime") ?? "").trim() || null;
  const totalTime = String(formData.get("totalTime") ?? "").trim() || null;
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
  const servingsBase = parseFloat(String(formData.get("servingsBase") ?? "4")) || 4;
  const category = recipeCategoryFromFormValue(String(formData.get("category") ?? ""));
  const dietKind = recipeDietKindFromFormValue(String(formData.get("dietKind") ?? ""));

  const ingLines = linesFromBlock("ingredientsText", formData);
  const instLines = linesFromBlock("instructionsText", formData);
  const nutritionText = String(formData.get("nutritionText") ?? "").trim() || null;

  if (ingLines.length === 0) {
    return { error: "Mindestens eine Zutat angeben." };
  }

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      imageUrl,
      prepTime,
      cookTime,
      totalTime,
      sourceUrl,
      servingsBase,
      category,
      dietKind,
      nutritionText,
      instructions: instLines,
      ingredients: {
        create: ingredientsForDb(ingLines),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/recipes/kategorien");
  revalidatePath(`/recipes/${recipe.id}`);
  redirect(`/recipes/${recipe.id}`);
}

export async function updateRecipeAction(
  recipeId: string,
  _prev: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "Titel fehlt." };
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const prepTime = String(formData.get("prepTime") ?? "").trim() || null;
  const cookTime = String(formData.get("cookTime") ?? "").trim() || null;
  const totalTime = String(formData.get("totalTime") ?? "").trim() || null;
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
  const servingsBase = parseFloat(String(formData.get("servingsBase") ?? "4")) || 4;
  const category = recipeCategoryFromFormValue(String(formData.get("category") ?? ""));
  const dietKind = recipeDietKindFromFormValue(String(formData.get("dietKind") ?? ""));

  const ingLines = linesFromBlock("ingredientsText", formData);
  const instLines = linesFromBlock("instructionsText", formData);
  const nutritionText = String(formData.get("nutritionText") ?? "").trim() || null;

  if (ingLines.length === 0) {
    return { error: "Mindestens eine Zutat angeben." };
  }

  await prisma.$transaction([
    prisma.ingredient.deleteMany({ where: { recipeId } }),
    prisma.recipe.update({
      where: { id: recipeId },
      data: {
        title,
        description,
        imageUrl,
        prepTime,
        cookTime,
        totalTime,
        sourceUrl,
        servingsBase,
        category,
        dietKind,
        nutritionText,
        instructions: instLines,
        ingredients: {
          create: ingredientsForDb(ingLines),
        },
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/recipes/kategorien");
  revalidatePath(`/recipes/${recipeId}`);
  redirect(`/recipes/${recipeId}`);
}

export async function deleteRecipeAction(recipeId: string) {
  await prisma.recipe.delete({ where: { id: recipeId } });
  revalidatePath("/");
  revalidatePath("/recipes/kategorien");
  revalidatePath("/statistik");
  redirect("/");
}

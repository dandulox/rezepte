import { prisma } from "@/lib/prisma";
import {
  isRecipeTranslateTargetCode,
  RECIPE_TRANSLATE_SOURCE_DEFAULT,
} from "@/lib/recipe-translate-locales";
import { translateRecipeLines, translateRecipeText } from "@/lib/recipe-translator";

export type PersistTranslationResult =
  | { ok: true }
  | { ok: false; error: string };

function instructionsFromRecipe(instructions: unknown): string[] {
  return Array.isArray(instructions)
    ? (instructions as unknown[]).map((x) => String(x))
    : typeof instructions === "string"
      ? [instructions]
      : [];
}

/** Legt/aktualisiert die Übersetzung eines Rezepts (ohne revalidate). */
export async function persistRecipeTranslation(
  recipeId: string,
  targetLocale: string,
): Promise<PersistTranslationResult> {
  if (!isRecipeTranslateTargetCode(targetLocale)) {
    return { ok: false, error: "Unbekannte Zielsprache." };
  }

  const source =
    (process.env.RECIPE_TRANSLATE_SOURCE ?? "").trim() ||
    RECIPE_TRANSLATE_SOURCE_DEFAULT;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: { orderBy: { sortOrder: "asc" } } },
  });

  if (!recipe) {
    return { ok: false, error: "Rezept nicht gefunden." };
  }

  const instLines = instructionsFromRecipe(recipe.instructions);
  if (instLines.length === 0) {
    return { ok: false, error: "Keine Zubereitungsschritte zum Übersetzen." };
  }

  if (recipe.ingredients.length === 0) {
    return { ok: false, error: "Keine Zutaten zum Übersetzen." };
  }

  try {
    const title = await translateRecipeText(
      recipe.title,
      source,
      targetLocale,
    );

    const description =
      recipe.description && recipe.description.trim()
        ? await translateRecipeText(
            recipe.description,
            source,
            targetLocale,
          )
        : null;

    const nutritionText =
      recipe.nutritionText && recipe.nutritionText.trim()
        ? await translateRecipeText(
            recipe.nutritionText,
            source,
            targetLocale,
          )
        : null;

    const ingLines = recipe.ingredients.map((i) => i.rawText);
    const translatedIngs = await translateRecipeLines(
      ingLines,
      source,
      targetLocale,
    );
    const translatedInst = await translateRecipeLines(
      instLines,
      source,
      targetLocale,
    );

    const ingredientsPayload = recipe.ingredients.map((ing, i) => ({
      id: ing.id,
      rawText: translatedIngs[i] ?? ing.rawText,
    }));

    await prisma.recipeTranslation.upsert({
      where: {
        recipeId_locale: { recipeId, locale: targetLocale },
      },
      create: {
        recipeId,
        locale: targetLocale,
        title,
        description,
        nutritionText,
        instructions: translatedInst,
        ingredients: ingredientsPayload,
      },
      update: {
        title,
        description,
        nutritionText,
        instructions: translatedInst,
        ingredients: ingredientsPayload,
      },
    });
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "Unbekannter Fehler bei der Übersetzung.";
    return { ok: false, error: msg };
  }

  return { ok: true };
}

import { notFound } from "next/navigation";
import { RecipeDetailClient } from "@/components/RecipeDetailClient";
import { RecipeVoteType } from "@/generated/prisma/client";
import { getRecipeDisplayLocale } from "@/lib/admin-settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function translationIngredientsFromJson(
  raw: unknown,
): { id: string; rawText: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { id: string; rawText: string }[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.rawText !== "string") continue;
    out.push({ id: o.id, rawText: o.rawText });
  }
  return out;
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!recipe) notFound();

  const translationRows = await prisma.recipeTranslation.findMany({
    where: { recipeId: id },
  });

  const translations = translationRows.map((t) => ({
    locale: t.locale,
    title: t.title,
    description: t.description,
    nutritionText: t.nutritionText,
    instructions: Array.isArray(t.instructions)
      ? (t.instructions as unknown[]).map((x) => String(x))
      : [],
    ingredients: translationIngredientsFromJson(t.ingredients),
  }));

  const [likeCount, dislikeCount, cookCount, cookRecent] = await Promise.all([
    prisma.recipeVote.count({
      where: { recipeId: id, type: RecipeVoteType.LIKE },
    }),
    prisma.recipeVote.count({
      where: { recipeId: id, type: RecipeVoteType.DISLIKE },
    }),
    prisma.recipeCookLog.count({ where: { recipeId: id } }),
    prisma.recipeCookLog.findMany({
      where: { recipeId: id },
      orderBy: { cookedAt: "desc" },
      take: 12,
      select: { id: true, cookedAt: true },
    }),
  ]);

  const instructions = Array.isArray(recipe.instructions)
    ? (recipe.instructions as unknown[]).map((x) => String(x))
    : typeof recipe.instructions === "string"
      ? [recipe.instructions]
      : [];

  const recipeViewLang = await getRecipeDisplayLocale();

  return (
    <RecipeDetailClient
      recipeId={recipe.id}
      title={recipe.title}
      category={recipe.category}
      dietKind={recipe.dietKind}
      description={recipe.description}
      imageUrl={recipe.imageUrl}
      prepTime={recipe.prepTime}
      cookTime={recipe.cookTime}
      totalTime={recipe.totalTime}
      sourceUrl={recipe.sourceUrl}
      servingsBase={recipe.servingsBase}
      ingredients={recipe.ingredients}
      nutritionText={recipe.nutritionText}
      instructions={instructions}
      recipeViewLang={recipeViewLang}
      translations={translations}
      likeCount={likeCount}
      dislikeCount={dislikeCount}
      cookCount={cookCount}
      cookRecent={cookRecent.map((r) => ({
        id: r.id,
        cookedAt: r.cookedAt.toISOString(),
      }))}
    />
  );
}

import { notFound } from "next/navigation";
import { RecipeDetailClient } from "@/components/RecipeDetailClient";
import { RecipeVoteType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

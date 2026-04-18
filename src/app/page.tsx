import { HomePageClient } from "@/components/HomePageClient";
import { prisma } from "@/lib/prisma";
import type { RecipeCookStats } from "@/lib/recipe-discovery-ranking";
import { getRecipeCategoryDefs, getRecipeDietKindDefs } from "@/lib/recipe-taxonomy";
import { recipeVoteCountsFromGroupBy } from "@/lib/recipe-votes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [recipes, voteGroupRows, cookLogGroups, categoryDefs, dietKindDefs] =
    await Promise.all([
    prisma.recipe.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        servingsBase: true,
        category: true,
        dietKind: true,
        updatedAt: true,
        ingredients: { select: { name: true, rawText: true } },
      },
    }),
    prisma.recipeVote.groupBy({
      by: ["recipeId", "type"],
      _count: { _all: true },
    }),
    prisma.recipeCookLog.groupBy({
      by: ["recipeId"],
      _max: { cookedAt: true },
      _count: { _all: true },
    }),
    getRecipeCategoryDefs(),
    getRecipeDietKindDefs(),
  ]);

  const voteCountsMap = recipeVoteCountsFromGroupBy(voteGroupRows);
  const voteCounts = Object.fromEntries(voteCountsMap);

  const cookStatsByRecipeId: Record<string, RecipeCookStats> = {};
  for (const r of recipes) {
    cookStatsByRecipeId[r.id] = { lastCookedAt: null, cookCount: 0 };
  }
  for (const row of cookLogGroups) {
    cookStatsByRecipeId[row.recipeId] = {
      lastCookedAt: row._max.cookedAt?.toISOString() ?? null,
      cookCount: row._count._all,
    };
  }

  const recipePayload = recipes.map((r) => ({
    ...r,
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <HomePageClient
      recipes={recipePayload}
      voteCounts={voteCounts}
      cookStatsByRecipeId={cookStatsByRecipeId}
      categoryDefs={categoryDefs}
      dietKindDefs={dietKindDefs}
    />
  );
}

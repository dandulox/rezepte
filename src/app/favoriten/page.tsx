import { FavoritenPageClient } from "@/components/FavoritenPageClient";
import { prisma } from "@/lib/prisma";
import { recipeVoteCountsFromGroupBy } from "@/lib/recipe-votes";

export const dynamic = "force-dynamic";

export default async function FavoritenPage() {
  const [recipes, voteGroupRows] = await Promise.all([
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
  ]);

  const voteCountsMap = recipeVoteCountsFromGroupBy(voteGroupRows);
  const voteCounts = Object.fromEntries(voteCountsMap);

  const recipePayload = recipes.map((r) => ({
    ...r,
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <FavoritenPageClient recipes={recipePayload} voteCounts={voteCounts} />;
}

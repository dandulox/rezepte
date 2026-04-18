import { RecipeVoteType } from "@/generated/prisma/client";

export type RecipeVoteCounts = { likeCount: number; dislikeCount: number };

/** Aus Prisma `recipeVote.groupBy({ by: ["recipeId", "type"], _count })`. */
export function recipeVoteCountsFromGroupBy(
  rows: { recipeId: string; type: RecipeVoteType; _count: { _all: number } }[],
): Map<string, RecipeVoteCounts> {
  const m = new Map<string, RecipeVoteCounts>();
  for (const row of rows) {
    const cur = m.get(row.recipeId) ?? { likeCount: 0, dislikeCount: 0 };
    if (row.type === RecipeVoteType.LIKE) cur.likeCount = row._count._all;
    else if (row.type === RecipeVoteType.DISLIKE) cur.dislikeCount = row._count._all;
    m.set(row.recipeId, cur);
  }
  return m;
}

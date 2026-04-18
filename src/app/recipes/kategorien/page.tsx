import Link from "next/link";
import { KategorienPageClient } from "@/components/KategorienPageClient";
import { prisma } from "@/lib/prisma";
import { getRecipeCategoryDefs, getRecipeDietKindDefs } from "@/lib/recipe-taxonomy";
import { recipeVoteCountsFromGroupBy } from "@/lib/recipe-votes";

export const dynamic = "force-dynamic";

export default async function RecipesByCategoryPage() {
  const [recipes, voteGroupRows, categoryDefs, dietKindDefs] = await Promise.all([
    prisma.recipe.findMany({
      orderBy: { title: "asc" },
      include: {
        ingredients: { select: { id: true, name: true, rawText: true } },
      },
    }),
    prisma.recipeVote.groupBy({
      by: ["recipeId", "type"],
      _count: { _all: true },
    }),
    getRecipeCategoryDefs(),
    getRecipeDietKindDefs(),
  ]);

  const voteCountsMap = recipeVoteCountsFromGroupBy(voteGroupRows);
  const voteCounts = Object.fromEntries(voteCountsMap);

  if (recipes.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-emerald-50/50 via-background to-background dark:from-emerald-950/25">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
            Nach Kategorie
          </h1>
          <div className="mt-10 rounded-3xl border border-dashed border-border/80 bg-card/80 px-6 py-16 text-center shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <p className="text-muted-foreground">Noch keine Rezepte.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/recipes/new"
                className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Neues Rezept
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const clientRecipes = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    imageUrl: r.imageUrl,
    servingsBase: r.servingsBase,
    category: r.category,
    dietKind: r.dietKind,
    ingredients: r.ingredients,
  }));

  return (
    <KategorienPageClient
      recipes={clientRecipes}
      voteCounts={voteCounts}
      categoryDefs={categoryDefs}
      dietKindDefs={dietKindDefs}
    />
  );
}

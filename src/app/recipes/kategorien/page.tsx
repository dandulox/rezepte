import Link from "next/link";
import { KategorienPageClient } from "@/components/KategorienPageClient";
import { prisma } from "@/lib/prisma";
import { recipeVoteCountsFromGroupBy } from "@/lib/recipe-votes";

export const dynamic = "force-dynamic";

export default async function RecipesByCategoryPage() {
  const [recipes, voteGroupRows] = await Promise.all([
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
  ]);

  const voteCountsMap = recipeVoteCountsFromGroupBy(voteGroupRows);
  const voteCounts = Object.fromEntries(voteCountsMap);

  if (recipes.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Nach Kategorie
          </h1>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Noch keine Rezepte.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/recipes/new"
              className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
            >
              Neues Rezept
            </Link>
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
    <KategorienPageClient recipes={clientRecipes} voteCounts={voteCounts} />
  );
}

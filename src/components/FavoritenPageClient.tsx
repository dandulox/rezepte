"use client";

import Link from "next/link";
import { useMemo } from "react";
import { RecipeFavoriteButton } from "@/components/RecipeFavoriteButton";
import { RecipeDietImageBadge } from "@/components/RecipeDietBadge";
import { useRecipeFavorites } from "@/components/RecipeFavoritesProvider";
import type { HomeRecipe } from "@/components/HomePageClient";
import { recipeCategoryLabel } from "@/lib/recipe-category";
import type { RecipeVoteCounts } from "@/lib/recipe-votes";

type Props = {
  recipes: HomeRecipe[];
  voteCounts: Record<string, RecipeVoteCounts>;
};

export function FavoritenPageClient({ recipes, voteCounts }: Props) {
  const { ready, favoriteIdSet } = useRecipeFavorites();

  const favoriten = useMemo(
    () => recipes.filter((r) => favoriteIdSet.has(r.id)),
    [recipes, favoriteIdSet],
  );

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-center text-muted-foreground">Lade Favoriten…</p>
      </div>
    );
  }

  if (favoriten.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">Favoriten</h1>
        <p className="mb-8 text-muted-foreground">
          Noch keine Favoriten. Stern auf der Startseite oder Rezeptseite tippen, um Rezepte zu merken.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          Zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">Favoriten</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {favoriten.length} {favoriten.length === 1 ? "Rezept" : "Rezepte"} gespeichert in diesem Browser.
      </p>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favoriten.map((r) => {
          const v = voteCounts[r.id] ?? { likeCount: 0, dislikeCount: 0 };
          const catLabel = recipeCategoryLabel(r.category);
          return (
            <li key={r.id}>
              <Link
                href={`/recipes/${r.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-emerald-500/50 hover:shadow-md dark:hover:border-emerald-600/50"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-card-muted">
                  {r.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Kein Bild
                    </div>
                  )}
                  <RecipeDietImageBadge dietKind={r.dietKind} />
                  <RecipeFavoriteButton recipeId={r.id} layout="overlay" />
                  <div
                    className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white shadow-md backdrop-blur-[2px] sm:text-sm"
                    aria-hidden
                  >
                    <span>👍 {v.likeCount}</span>
                    <span className="text-white/50">·</span>
                    <span>👎 {v.dislikeCount}</span>
                  </div>
                  <span className="sr-only">
                    {v.likeCount} Likes, {v.dislikeCount} Dislikes
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h2 className="line-clamp-2 text-lg font-semibold text-foreground">{r.title}</h2>
                  {catLabel ? (
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {catLabel}
                    </p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    {r.servingsBase} Portionen · {r.ingredients.length} Zutaten
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

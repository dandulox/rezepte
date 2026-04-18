"use client";

import Link from "next/link";
import { useMemo } from "react";
import { RecipeFavoriteButton } from "@/components/RecipeFavoriteButton";
import { RecipeDietImageBadge } from "@/components/RecipeDietBadge";
import { useRecipeFavorites } from "@/components/RecipeFavoritesProvider";
import { useUiLocale } from "@/components/UiLocaleProvider";
import type { HomeRecipe } from "@/components/HomePageClient";
import { displayRecipeCategoryLabel } from "@/lib/recipe-category";
import type {
  RecipeCategoryDefPublic,
  RecipeDietKindDefPublic,
} from "@/lib/recipe-taxonomy";
import type { RecipeVoteCounts } from "@/lib/recipe-votes";

type Props = {
  recipes: HomeRecipe[];
  voteCounts: Record<string, RecipeVoteCounts>;
  categoryDefs: readonly RecipeCategoryDefPublic[];
  dietKindDefs: readonly RecipeDietKindDefPublic[];
};

export function FavoritenPageClient({
  recipes,
  voteCounts,
  categoryDefs,
  dietKindDefs,
}: Props) {
  const { locale, strings: s } = useUiLocale();
  const { ready, favoriteIdSet } = useRecipeFavorites();

  const favoriten = useMemo(
    () => recipes.filter((r) => favoriteIdSet.has(r.id)),
    [recipes, favoriteIdSet],
  );

  if (!ready) {
    return (
      <div className="app-area flex min-h-dvh flex-col">
        <header className="border-b border-border/90 bg-card/75 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-accent)] sm:text-3xl">
              {s.favorites.title}
            </h1>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
          <div className="app-panel-main flex flex-1 items-center justify-center p-10 sm:p-12">
            <p className="text-center text-muted-foreground">{s.favorites.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (favoriten.length === 0) {
    return (
      <div className="app-area flex min-h-dvh flex-col">
        <header className="border-b border-border/90 bg-card/75 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-accent)] sm:text-3xl">
              {s.favorites.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{s.favorites.empty}</p>
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="app-panel-main p-6 sm:p-8">
            <Link href="/" className="app-btn-primary">
              {s.favorites.toOverview}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-area flex min-h-dvh flex-col">
      <header className="border-b border-border/90 bg-card/75 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-accent)] sm:text-3xl">
            {s.favorites.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {s.favorites.countLine(favoriten.length)}
          </p>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="app-panel-main p-6 sm:p-8">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favoriten.map((r) => {
          const v = voteCounts[r.id] ?? { likeCount: 0, dislikeCount: 0 };
          const catLabel = displayRecipeCategoryLabel(
            r.category,
            locale === "en" ? "en" : "de",
            categoryDefs,
          );
          return (
            <li key={r.id}>
              <Link
                href={`/recipes/${r.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-[color-mix(in_oklab,var(--app-accent)_42%,var(--border))] hover:shadow-md"
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
                      {s.common.noImage}
                    </div>
                  )}
                  <RecipeDietImageBadge dietKind={r.dietKind} dietKindDefs={dietKindDefs} />
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
                    {s.common.likesDislikesSr(v.likeCount, v.dislikeCount)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h2 className="line-clamp-2 text-lg font-semibold text-foreground">{r.title}</h2>
                  {catLabel ? (
                    <p className="text-xs font-medium text-[var(--app-accent)]">{catLabel}</p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    {s.common.servingsIngredients(r.servingsBase, r.ingredients.length)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
          </ul>
        </div>
      </div>
    </div>
  );
}

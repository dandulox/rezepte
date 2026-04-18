"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RecipeFavoriteButton } from "@/components/RecipeFavoriteButton";
import { RecipeDietImageBadge } from "@/components/RecipeDietBadge";
import {
  RECIPE_CATEGORY_IDS,
  RECIPE_CATEGORY_LABEL,
  isRecipeCategoryId,
} from "@/lib/recipe-category";
import { recipeDietKindIsMeat } from "@/lib/recipe-diet";
import { sortRecipesForCategoryView } from "@/lib/recipe-discovery-ranking";
import { recipeMatchesSearchQuery } from "@/lib/recipe-search";
import type { RecipeVoteCounts } from "@/lib/recipe-votes";

const UNCATEGORIZED_LABEL = "Ohne Kategorie";

type DietQuickFilter = "vegetarisch" | "vegan" | "fleisch";

function recipeMatchesDietQuickFilter(
  r: KategorienRecipe,
  filter: DietQuickFilter | null,
): boolean {
  if (!filter) return true;
  if (!r.dietKind) return false;
  if (filter === "vegan") return r.dietKind === "vegan";
  if (filter === "vegetarisch") return r.dietKind === "vegetarisch";
  return recipeDietKindIsMeat(r.dietKind);
}

export type KategorienRecipe = {
  id: string;
  title: string;
  imageUrl: string | null;
  servingsBase: number;
  category: string | null;
  dietKind: string | null;
  ingredients: { id: string; name: string | null; rawText: string }[];
};

type Props = {
  recipes: KategorienRecipe[];
  voteCounts: Record<string, RecipeVoteCounts>;
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function RecipeGrid({
  recipes,
  voteCounts,
}: {
  recipes: KategorienRecipe[];
  voteCounts: Record<string, RecipeVoteCounts>;
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((r) => {
        const v = voteCounts[r.id] ?? { likeCount: 0, dislikeCount: 0 };
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
                <h3 className="line-clamp-2 text-lg font-semibold text-foreground">
                  {r.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {r.servingsBase} Portionen · {r.ingredients.length} Zutaten
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function KategorienPageClient({ recipes, voteCounts }: Props) {
  const [query, setQuery] = useState("");
  const [dietQuickFilter, setDietQuickFilter] = useState<DietQuickFilter | null>(null);

  const searchMatches = useMemo(
    () => recipes.filter((r) => recipeMatchesSearchQuery(r, query)),
    [recipes, query],
  );

  const visible = useMemo(
    () => searchMatches.filter((r) => recipeMatchesDietQuickFilter(r, dietQuickFilter)),
    [searchMatches, dietQuickFilter],
  );

  const uncategorized = visible.filter(
    (r) => !r.category || !isRecipeCategoryId(r.category),
  );

  const hasActiveQuery = query.trim().length > 0;

  function toggleDietFilter(next: DietQuickFilter) {
    setDietQuickFilter((cur) => (cur === next ? null : next));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Nach Kategorie
        </h1>
        <p className="mt-3 text-sm">
          <Link
            href="/"
            className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
          >
            Zur Hauptseite
          </Link>
        </p>

        <div
          className="mt-6 flex flex-wrap gap-2"
          role="group"
          aria-label="Nach Ernährungsart filtern"
        >
          <button
            type="button"
            onClick={() => toggleDietFilter("vegetarisch")}
            aria-pressed={dietQuickFilter === "vegetarisch"}
            className={
              dietQuickFilter === "vegetarisch"
                ? "rounded-full border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-600"
                : "rounded-full border border-border-strong bg-card px-4 py-2 text-sm font-medium text-body shadow-sm transition hover:bg-card-muted"
            }
          >
            Vegetarisch
          </button>
          <button
            type="button"
            onClick={() => toggleDietFilter("vegan")}
            aria-pressed={dietQuickFilter === "vegan"}
            className={
              dietQuickFilter === "vegan"
                ? "rounded-full border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-600"
                : "rounded-full border border-border-strong bg-card px-4 py-2 text-sm font-medium text-body shadow-sm transition hover:bg-card-muted"
            }
          >
            Vegan
          </button>
          <button
            type="button"
            onClick={() => toggleDietFilter("fleisch")}
            aria-pressed={dietQuickFilter === "fleisch"}
            className={
              dietQuickFilter === "fleisch"
                ? "rounded-full border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-600"
                : "rounded-full border border-border-strong bg-card px-4 py-2 text-sm font-medium text-body shadow-sm transition hover:bg-card-muted"
            }
          >
            Fleischgerichte
          </button>
        </div>

        <div className="relative mx-auto mt-8 w-full max-w-[584px]">
          <label htmlFor="kategorien-recipe-search" className="sr-only">
            Rezepte durchsuchen
          </label>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground" />
          <input
            id="kategorien-recipe-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche nach Titel, Kategorie, Ernährung, Zutaten…"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full rounded-full border border-[#dfe1e5] bg-[var(--card)] py-3 pl-12 pr-5 text-base text-foreground shadow-sm outline-none transition-[box-shadow,border-color] placeholder:text-muted-foreground hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus:border-transparent focus:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus:ring-2 focus:ring-[#4285F4]/35 dark:border-zinc-600 dark:hover:shadow-[0_1px_6px_rgba(0,0,0,0.45)] dark:focus:ring-[#8ab4f8]/40"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {hasActiveQuery && dietQuickFilter
            ? `Keine Treffer für „${query.trim()}“ mit dem gewählten Ernährungsfilter.`
            : hasActiveQuery
              ? `Keine Treffer für „${query.trim()}“.`
              : dietQuickFilter
                ? "Keine Rezepte mit dieser Ernährungsart (oder keine passende Klassifizierung)."
                : "Keine Rezepte."}
        </p>
      ) : (
        <div className="flex flex-col gap-14">
          {RECIPE_CATEGORY_IDS.map((catId) => {
            const inCat = sortRecipesForCategoryView(
              visible.filter((r) => r.category === catId),
              voteCounts,
            );
            if (inCat.length === 0) return null;
            return (
              <section key={catId} id={catId} className="scroll-mt-24">
                <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
                  {RECIPE_CATEGORY_LABEL[catId]}
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    ({inCat.length})
                  </span>
                </h2>
                <RecipeGrid recipes={inCat} voteCounts={voteCounts} />
              </section>
            );
          })}

          {uncategorized.length > 0 ? (
            <section className="scroll-mt-24">
              <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
                {UNCATEGORIZED_LABEL}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({uncategorized.length})
                </span>
              </h2>
              <RecipeGrid
                recipes={sortRecipesForCategoryView(uncategorized, voteCounts)}
                voteCounts={voteCounts}
              />
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RecipeFavoriteButton } from "@/components/RecipeFavoriteButton";
import { RecipeDietImageBadge } from "@/components/RecipeDietBadge";
import { useUiLocale } from "@/components/UiLocaleProvider";
import {
  isRecipeCategoryInDefs,
  recipeCategoryLabelFromDefs,
} from "@/lib/recipe-category";
import { recipeDietKindIsMeatFromDefs } from "@/lib/recipe-diet";
import { sortRecipesForCategoryView } from "@/lib/recipe-discovery-ranking";
import { recipeMatchesSearchQuery } from "@/lib/recipe-search";
import type {
  RecipeCategoryDefPublic,
  RecipeDietKindDefPublic,
} from "@/lib/recipe-taxonomy";
import { sortRecipeCategoryDefs } from "@/lib/recipe-taxonomy-sort";
import type { RecipeVoteCounts } from "@/lib/recipe-votes";

const UNCATEGORIZED_NAV_ID = "__uncategorized__";

type DietQuickFilter = "vegetarisch" | "vegan" | "fleisch";

function recipeMatchesDietQuickFilter(
  r: KategorienRecipe,
  filter: DietQuickFilter | null,
  dietKindDefs: readonly RecipeDietKindDefPublic[],
): boolean {
  if (!filter) return true;
  if (!r.dietKind) return false;
  if (filter === "vegan") return r.dietKind === "vegan";
  if (filter === "vegetarisch") return r.dietKind === "vegetarisch";
  return recipeDietKindIsMeatFromDefs(r.dietKind, dietKindDefs);
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
  categoryDefs: readonly RecipeCategoryDefPublic[];
  dietKindDefs: readonly RecipeDietKindDefPublic[];
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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function LayoutGridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function RecipeGrid({
  recipes,
  voteCounts,
  dietKindDefs,
}: {
  recipes: KategorienRecipe[];
  voteCounts: Record<string, RecipeVoteCounts>;
  dietKindDefs: readonly RecipeDietKindDefPublic[];
}) {
  const { strings: s } = useUiLocale();
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {recipes.map((r) => {
        const v = voteCounts[r.id] ?? { likeCount: 0, dislikeCount: 0 };
        return (
          <li key={r.id}>
            <Link
              href={`/recipes/${r.id}`}
              className="group flex h-full min-h-[17rem] flex-col overflow-hidden rounded-3xl border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] transition hover:border-emerald-500/45 hover:shadow-md hover:ring-emerald-500/10 dark:ring-white/[0.06] dark:hover:border-emerald-500/40"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-card-muted to-card-muted/60">
                {r.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {s.common.noImage}
                  </div>
                )}
                <RecipeDietImageBadge dietKind={r.dietKind} dietKindDefs={dietKindDefs} />
                <RecipeFavoriteButton recipeId={r.id} layout="overlay" />
                <div
                  className="pointer-events-none absolute bottom-2.5 right-2.5 flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm sm:text-sm"
                  aria-hidden
                >
                  <span>👍 {v.likeCount}</span>
                  <span className="text-white/45">·</span>
                  <span>👎 {v.dislikeCount}</span>
                </div>
                <span className="sr-only">
                  {s.common.likesDislikesSr(v.likeCount, v.dislikeCount)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
                <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground sm:text-lg">
                  {r.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {s.common.servingsIngredients(r.servingsBase, r.ingredients.length)}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

type NavOption = { id: string; label: string; count: number };

function CategoryPickerMobile({
  options,
  effectiveId,
  onSelect,
  labelChoose,
  navAria,
}: {
  options: NavOption[];
  effectiveId: string;
  onSelect: (id: string) => void;
  labelChoose: string;
  navAria: string;
}) {
  return (
    <div className="lg:hidden">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {labelChoose}
      </p>
      <div
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-0.5 [scrollbar-width:thin]"
        role="tablist"
        aria-label={navAria}
      >
        {options.map((opt) => {
          const selected = effectiveId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(opt.id)}
              className={
                selected
                  ? "shrink-0 snap-start rounded-2xl border border-emerald-500/50 bg-emerald-500/[0.12] px-3.5 py-2 text-left text-sm font-semibold text-foreground shadow-sm dark:bg-emerald-500/20"
                  : "shrink-0 snap-start rounded-2xl border border-border/80 bg-card px-3.5 py-2 text-left text-sm font-medium text-body shadow-sm transition hover:border-emerald-500/35 hover:bg-card-muted"
              }
            >
              <span className="line-clamp-2 max-w-[11rem]">{opt.label}</span>
              <span className="mt-0.5 block text-xs font-normal tabular-nums text-muted-foreground">
                {opt.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategorySidebarDesktop({
  options,
  effectiveId,
  onSelect,
  labelChoose,
  navAria,
}: {
  options: NavOption[];
  effectiveId: string;
  onSelect: (id: string) => void;
  labelChoose: string;
  navAria: string;
}) {
  return (
    <aside className="hidden lg:block lg:w-[min(100%,17.5rem)] lg:shrink-0" aria-label={navAria}>
      <div className="sticky top-20 rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card-muted/30 p-3 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
        <div className="mb-2 flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <LayoutGridIcon className="opacity-70" />
          {labelChoose}
        </div>
        <ul className="flex flex-col gap-1">
          {options.map((opt) => {
            const selected = effectiveId === opt.id;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => onSelect(opt.id)}
                  aria-current={selected ? "true" : undefined}
                  className={
                    selected
                      ? "flex w-full items-center justify-between gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.1] px-3 py-2.5 text-left text-sm font-semibold text-foreground shadow-sm dark:bg-emerald-500/[0.15]"
                      : "flex w-full items-center justify-between gap-2 rounded-2xl border border-transparent px-3 py-2.5 text-left text-sm font-medium text-body transition hover:border-border hover:bg-card-muted/80"
                  }
                >
                  <span className="min-w-0 flex-1 leading-snug">{opt.label}</span>
                  <span className="shrink-0 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground ring-1 ring-border/60">
                    {opt.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export function KategorienPageClient({
  recipes,
  voteCounts,
  categoryDefs,
  dietKindDefs,
}: Props) {
  const { locale, strings: s } = useUiLocale();
  const [query, setQuery] = useState("");
  const [dietQuickFilter, setDietQuickFilter] = useState<DietQuickFilter | null>(null);

  const searchMatches = useMemo(
    () =>
      recipes.filter((r) =>
        recipeMatchesSearchQuery(r, query, { categoryDefs, dietKindDefs }),
      ),
    [recipes, query, categoryDefs, dietKindDefs],
  );

  const visible = useMemo(
    () =>
      searchMatches.filter((r) =>
        recipeMatchesDietQuickFilter(r, dietQuickFilter, dietKindDefs),
      ),
    [searchMatches, dietQuickFilter, dietKindDefs],
  );

  const uncategorized = useMemo(
    () =>
      visible.filter(
        (r) => !r.category || !isRecipeCategoryInDefs(r.category, categoryDefs),
      ),
    [visible, categoryDefs],
  );

  const categoryIdsOrdered = useMemo(
    () => sortRecipeCategoryDefs(categoryDefs).map((c) => c.id),
    [categoryDefs],
  );

  const categoryNavOptions = useMemo(() => {
    const loc = locale === "en" ? "en" : "de";
    const out: NavOption[] = [];
    for (const catId of categoryIdsOrdered) {
      const count = visible.filter((r) => r.category === catId).length;
      if (count === 0) continue;
      const label =
        recipeCategoryLabelFromDefs(catId, loc, categoryDefs) ?? catId;
      out.push({ id: catId, label, count });
    }
    if (uncategorized.length > 0) {
      out.push({
        id: UNCATEGORIZED_NAV_ID,
        label: s.categories.uncategorized,
        count: uncategorized.length,
      });
    }
    return out;
  }, [
    visible,
    categoryIdsOrdered,
    categoryDefs,
    locale,
    s.categories.uncategorized,
    uncategorized,
  ]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const effectiveCategoryId = useMemo(() => {
    if (categoryNavOptions.length === 0) return "";
    if (
      selectedCategoryId &&
      categoryNavOptions.some((o) => o.id === selectedCategoryId)
    ) {
      return selectedCategoryId;
    }
    return categoryNavOptions[0].id;
  }, [categoryNavOptions, selectedCategoryId]);

  const recipesForSelectedCategory = useMemo(() => {
    if (!effectiveCategoryId) return [];
    if (effectiveCategoryId === UNCATEGORIZED_NAV_ID) {
      return sortRecipesForCategoryView(uncategorized, voteCounts);
    }
    return sortRecipesForCategoryView(
      visible.filter((r) => r.category === effectiveCategoryId),
      voteCounts,
    );
  }, [effectiveCategoryId, uncategorized, visible, voteCounts]);

  const selectedNavMeta = useMemo(
    () => categoryNavOptions.find((o) => o.id === effectiveCategoryId),
    [categoryNavOptions, effectiveCategoryId],
  );

  const hasActiveQuery = query.trim().length > 0;

  function toggleDietFilter(next: DietQuickFilter) {
    setDietQuickFilter((cur) => (cur === next ? null : next));
  }

  const dietBtn = (key: DietQuickFilter, label: string) => {
    const on = dietQuickFilter === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => toggleDietFilter(key)}
        aria-pressed={on}
        className={
          on
            ? "rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-2 ring-emerald-600/30 dark:bg-emerald-600"
            : "rounded-full border border-border/90 bg-background/60 px-4 py-2 text-sm font-medium text-body shadow-sm transition hover:border-emerald-500/35 hover:bg-card-muted"
        }
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-emerald-50/50 via-background to-background dark:from-emerald-950/25 dark:via-background dark:to-background">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 sm:pt-10">
        <header className="mb-8 sm:mb-10">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <ChevronLeftIcon />
            {s.categories.backHome}
          </Link>
          <div className="max-w-2xl">
            <h1 className="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
              {s.categories.title}
            </h1>
          </div>
        </header>

        <section
          className="mb-8 rounded-3xl border border-border/70 bg-card/90 p-4 shadow-sm ring-1 ring-black/[0.04] backdrop-blur-sm dark:bg-card/80 dark:ring-white/[0.06] sm:p-5"
          aria-label={s.categories.searchLabel}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
            <div className="relative min-h-[3rem] flex-1">
              <label htmlFor="kategorien-recipe-search" className="sr-only">
                {s.categories.searchLabel}
              </label>
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground" />
              <input
                id="kategorien-recipe-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={s.categories.searchPlaceholder}
                autoComplete="off"
                spellCheck={false}
                className="h-12 w-full rounded-2xl border border-border/90 bg-background/80 py-3 pl-12 pr-4 text-base text-foreground shadow-inner outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-500/20 dark:bg-background/50"
              />
            </div>
            <div
              className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
              role="group"
              aria-label={s.categories.filterGroupAria}
            >
              {dietBtn("vegetarisch", s.categories.vegetarian)}
              {dietBtn("vegan", s.categories.vegan)}
              {dietBtn("fleisch", s.categories.meat)}
            </div>
          </div>
        </section>

        {visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <p className="text-muted-foreground">
              {s.categories.empty({
                hasQuery: hasActiveQuery,
                hasDiet: Boolean(dietQuickFilter),
                query: query.trim(),
              })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <CategoryPickerMobile
              options={categoryNavOptions}
              effectiveId={effectiveCategoryId}
              onSelect={setSelectedCategoryId}
              labelChoose={s.categories.chooseCategory}
              navAria={s.categories.navAria}
            />

            <CategorySidebarDesktop
              options={categoryNavOptions}
              effectiveId={effectiveCategoryId}
              onSelect={setSelectedCategoryId}
              labelChoose={s.categories.chooseCategory}
              navAria={s.categories.navAria}
            />

            <section
              className="min-w-0 flex-1"
              aria-labelledby="kategorien-panel-heading"
            >
              <div className="mb-6 border-b border-border/80 pb-5">
                <h2
                  id="kategorien-panel-heading"
                  className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                >
                  {selectedNavMeta?.label ?? "—"}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {s.categories.recipeCount(recipesForSelectedCategory.length)}
                </p>
              </div>
              <RecipeGrid
                recipes={recipesForSelectedCategory}
                voteCounts={voteCounts}
                dietKindDefs={dietKindDefs}
              />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

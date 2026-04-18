"use client";

import Link from "next/link";
import type { KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { RecipeFavoriteButton } from "@/components/RecipeFavoriteButton";
import { RecipeDietImageBadge } from "@/components/RecipeDietBadge";
import { useRecipeFavorites } from "@/components/RecipeFavoritesProvider";
import { useUiLocale } from "@/components/UiLocaleProvider";
import { recipeCategoryLabel } from "@/lib/recipe-category";
import { formatPastRelative } from "@/lib/site-i18n";
import type { RecipeCookStats } from "@/lib/recipe-discovery-ranking";
import { recipeMatchesSearchQuery } from "@/lib/recipe-search";
import type { RecipeVoteCounts } from "@/lib/recipe-votes";

export type HomeRecipe = {
  id: string;
  title: string;
  imageUrl: string | null;
  servingsBase: number;
  category: string | null;
  dietKind: string | null;
  updatedAt: string;
  ingredients: { name: string | null; rawText: string }[];
};

const HOME_SECTION_LIMIT = 7;
/** Max. Einträge für „Zuletzt gekocht“ und „Noch unentdeckt“. */
const HOME_SECTION_LIMIT_COMPACT = 4;

function shuffleInPlace<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

function HomeCompactRecipeCard({ r, meta }: { r: HomeRecipe; meta: ReactNode }) {
  const { locale, strings } = useUiLocale();
  const catLabel = recipeCategoryLabel(r.category, locale);
  return (
    <li className="w-[min(72vw,14rem)] shrink-0 snap-start sm:w-56">
      <Link
        href={`/recipes/${r.id}`}
        className="group flex h-full min-h-[12rem] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-emerald-500/45 hover:shadow-md dark:hover:border-emerald-600/45"
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-card-muted">
          {r.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.imageUrl}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {strings.common.noImage}
            </div>
          )}
          <RecipeDietImageBadge dietKind={r.dietKind} />
          <RecipeFavoriteButton recipeId={r.id} layout="overlay" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{r.title}</h3>
          {catLabel ? (
            <p className="text-[0.7rem] font-medium text-emerald-700 dark:text-emerald-400">{catLabel}</p>
          ) : null}
          <p className="text-xs leading-snug text-muted-foreground">{meta}</p>
        </div>
      </Link>
    </li>
  );
}

function HomeDiscoverySection({
  headingId,
  title,
  scrollAriaLabel,
  children,
}: {
  headingId: string;
  title: string;
  scrollAriaLabel: string;
  children: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const onScrollerKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.min(280, Math.max(160, el.clientWidth * 0.85));
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      el.scrollBy({ left: -step, behavior: "smooth" });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      el.scrollBy({ left: step, behavior: "smooth" });
    }
  }, []);

  return (
    <section className="mt-10" aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="mb-3 text-lg font-semibold tracking-tight text-foreground text-balance"
      >
        {title}
      </h2>
      <div
        ref={scrollerRef}
        tabIndex={0}
        aria-label={scrollAriaLabel}
        onKeyDown={onScrollerKeyDown}
        className="-mx-4 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-1 outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500/45 focus-visible:ring-offset-2 sm:mx-0 sm:px-0"
      >
        <ul className="flex w-max list-none flex-row gap-3 pb-0.5">{children}</ul>
      </div>
    </section>
  );
}

type Props = {
  recipes: HomeRecipe[];
  voteCounts: Record<string, RecipeVoteCounts>;
  cookStatsByRecipeId: Record<string, RecipeCookStats>;
};

function HeroTitle({ children }: { children: string }) {
  return (
    <h1
      className="mb-3 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-center text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-balance text-transparent sm:text-5xl md:text-[3.35rem] dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-300"
    >
      {children}
    </h1>
  );
}

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

function RecipeCarouselCard({
  r,
  voteCounts,
}: {
  r: HomeRecipe;
  voteCounts: Record<string, RecipeVoteCounts>;
}) {
  const { locale, strings } = useUiLocale();
  const catLabel = recipeCategoryLabel(r.category, locale);
  const v = voteCounts[r.id] ?? { likeCount: 0, dislikeCount: 0 };
  return (
    <Link
      href={`/recipes/${r.id}`}
      className="group flex h-full min-h-[19rem] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-emerald-500/50 hover:shadow-md dark:hover:border-emerald-600/50"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-card-muted">
        {r.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {strings.common.noImage}
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
          {strings.common.likesDislikesSr(v.likeCount, v.dislikeCount)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="line-clamp-2 text-lg font-semibold text-foreground">{r.title}</h2>
        {catLabel ? (
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{catLabel}</p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {strings.common.servingsIngredients(r.servingsBase, r.ingredients.length)}
        </p>
      </div>
    </Link>
  );
}

/** Langsame Drift in px/s (Inhalt wandert nach links). */
const CAROUSEL_DRIFT_PX_S = 28;

const CAROUSEL_LOOP_COPIES = 3;

function RecipeCarousel({
  items,
  voteCounts,
  filterKey,
}: {
  items: HomeRecipe[];
  voteCounts: Record<string, RecipeVoteCounts>;
  filterKey: string;
}) {
  const { strings } = useUiLocale();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const segmentWidthRef = useRef(0);
  const reduceMotionRef = useRef(false);
  /** Mittelpunkt-Vergrößerung nur mit echter Maus — auf iPad/Touch vermeidet das Layout-/Composite-Probleme */
  const fancyScaleRef = useRef(false);

  const loopItems = useMemo(() => {
    const rows: { r: HomeRecipe; k: string }[] = [];
    for (let c = 0; c < CAROUSEL_LOOP_COPIES; c++) {
      for (let i = 0; i < items.length; i++) {
        rows.push({ r: items[i], k: `${items[i].id}-${c}-${i}` });
      }
    }
    return rows;
  }, [items]);

  const remeasureSegment = useCallback(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;
    const cells = track.children;
    if (cells.length < items.length + 1) return;
    const first = cells[0] as HTMLElement;
    const boundary = cells[items.length] as HTMLElement;
    segmentWidthRef.current = boundary.offsetLeft - first.offsetLeft;
  }, [items.length]);

  useLayoutEffect(() => {
    offsetRef.current = 0;
    const track = trackRef.current;
    if (track) track.style.transform = "translate3d(0,0,0)";
    remeasureSegment();
    const id = requestAnimationFrame(() => remeasureSegment());
    return () => cancelAnimationFrame(id);
  }, [filterKey, remeasureSegment]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
    const onMq = () => {
      reduceMotionRef.current = mq.matches;
    };
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    fancyScaleRef.current = mq.matches;
    const onMq = () => {
      fancyScaleRef.current = mq.matches;
    };
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    const v = viewportRef.current;
    if (!v) return;
    const ro = new ResizeObserver(() => remeasureSegment());
    ro.observe(v);
    return () => ro.disconnect();
  }, [remeasureSegment]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.064);
      last = now;

      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (track && viewport) {
        const drift = reduceMotionRef.current ? CAROUSEL_DRIFT_PX_S * 0.22 : CAROUSEL_DRIFT_PX_S;
        if (!pausedRef.current) {
          offsetRef.current -= drift * dt;
          const seg = segmentWidthRef.current;
          if (seg > 1 && -offsetRef.current >= seg) {
            offsetRef.current += seg;
          }
        }
        track.style.transform = `translate3d(${offsetRef.current}px,0,0)`;

        if (!fancyScaleRef.current || reduceMotionRef.current) {
          for (let i = 0; i < track.children.length; i++) {
            const cell = track.children[i] as HTMLElement;
            cell.style.transform = "scale(1)";
            cell.style.zIndex = "1";
          }
        } else {
          const vRect = viewport.getBoundingClientRect();
          const mid = vRect.left + vRect.width / 2;
          const influence = Math.max(vRect.width * 0.36, 160);

          for (let i = 0; i < track.children.length; i++) {
            const cell = track.children[i] as HTMLElement;
            const cr = cell.getBoundingClientRect();
            const cx = cr.left + cr.width / 2;
            const dist = Math.abs(cx - mid);
            let t = 1 - Math.min(1, dist / influence);
            t = t * t * (3 - 2 * t);
            const scale = 1 + 0.25 * t;
            cell.style.transform = `scale(${scale})`;
            cell.style.zIndex = String(Math.min(999, Math.round(scale * 100)));
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loopItems, filterKey]);

  return (
    <div
      ref={viewportRef}
      role="region"
      aria-roledescription={strings.home.carouselRegion}
      aria-label={strings.home.carouselLabel}
      className="relative overflow-x-hidden overflow-y-visible py-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") pausedRef.current = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") pausedRef.current = false;
      }}
      onPointerCancel={(e) => {
        if (e.pointerType === "mouse") pausedRef.current = false;
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          pausedRef.current = false;
        }
      }}
    >
      <div ref={trackRef} className="flex w-max gap-6 will-change-transform">
        {loopItems.map(({ r, k }) => (
          <div
            key={k}
            role="group"
            aria-roledescription={strings.home.slideRegion}
            aria-label={r.title}
            className="w-[min(88vw,20rem)] shrink-0 origin-center will-change-transform sm:w-72"
          >
            <RecipeCarouselCard r={r} voteCounts={voteCounts} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePageClient({ recipes, voteCounts, cookStatsByRecipeId }: Props) {
  const { locale, strings: s } = useUiLocale();
  const [query, setQuery] = useState("");
  const { favoriteIdSet, favoriteIds } = useRecipeFavorites();

  const filtered = useMemo(
    () => recipes.filter((r) => recipeMatchesSearchQuery(r, query)),
    [recipes, query],
  );

  const recentlyCooked = useMemo(() => {
    type Row = { r: HomeRecipe; last: number };
    const rows: Row[] = [];
    for (const r of filtered) {
      const s = cookStatsByRecipeId[r.id];
      if (!s || s.cookCount <= 0 || !s.lastCookedAt) continue;
      const last = Date.parse(s.lastCookedAt);
      if (!Number.isFinite(last)) continue;
      rows.push({ r, last });
    }
    rows.sort((a, b) => {
      if (b.last !== a.last) return b.last - a.last;
      return a.r.title.localeCompare(b.r.title, locale === "en" ? "en" : "de");
    });
    return rows.slice(0, HOME_SECTION_LIMIT_COMPACT).map((x) => x.r);
  }, [filtered, cookStatsByRecipeId, locale]);

  const mostCooked = useMemo(() => {
    const skip = new Set(recentlyCooked.map((r) => r.id));
    type Row = { r: HomeRecipe; count: number };
    const rows: Row[] = [];
    for (const r of filtered) {
      if (skip.has(r.id)) continue;
      const s = cookStatsByRecipeId[r.id];
      if (!s || s.cookCount <= 0) continue;
      rows.push({ r, count: s.cookCount });
    }
    rows.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.r.title.localeCompare(b.r.title, locale === "en" ? "en" : "de");
    });
    return rows.slice(0, HOME_SECTION_LIMIT).map((x) => x.r);
  }, [filtered, cookStatsByRecipeId, recentlyCooked, locale]);

  /** Kandidaten für „Noch unentdeckt“: nie gekocht, keine Likes/Dislikes (Reihenfolge egal). */
  const untouchedPool = useMemo(() => {
    const rows: HomeRecipe[] = [];
    for (const r of filtered) {
      const s = cookStatsByRecipeId[r.id];
      const v = voteCounts[r.id] ?? { likeCount: 0, dislikeCount: 0 };
      if (s && s.cookCount > 0) continue;
      if (v.likeCount !== 0 || v.dislikeCount !== 0) continue;
      rows.push(r);
    }
    return rows;
  }, [filtered, cookStatsByRecipeId, voteCounts]);

  const [untouchedRecipes, setUntouchedRecipes] = useState<HomeRecipe[]>([]);

  useLayoutEffect(() => {
    if (untouchedPool.length === 0) {
      setUntouchedRecipes([]);
      return;
    }
    const picked = [...untouchedPool];
    shuffleInPlace(picked);
    setUntouchedRecipes(picked.slice(0, HOME_SECTION_LIMIT_COMPACT));
  }, [untouchedPool]);

  /** Karussell: alle Suchtreffer außer Favoriten — Reihenfolge per Zufall (Client). */
  const carouselEligible = useMemo(
    () => filtered.filter((r) => !favoriteIdSet.has(r.id)),
    [filtered, favoriteIdSet],
  );

  const [carouselItems, setCarouselItems] = useState<HomeRecipe[]>([]);

  useLayoutEffect(() => {
    if (carouselEligible.length === 0) {
      setCarouselItems([]);
      return;
    }
    const next = [...carouselEligible];
    shuffleInPlace(next);
    setCarouselItems(next);
  }, [carouselEligible]);

  const carouselStrip =
    carouselItems.length > 0 ? carouselItems : carouselEligible;

  const carouselFilterKey = useMemo(
    () => `${query}::${favoriteIds.join(",")}::${carouselStrip.map((r) => r.id).join(",")}`,
    [query, favoriteIds, carouselStrip],
  );

  if (recipes.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-[max(1rem,env(safe-area-inset-left,0px))] py-10 pr-[max(1rem,env(safe-area-inset-right,0px))]">
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">{s.home.noRecipes}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/recipes/new"
              className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
            >
              {s.nav.newRecipe}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-[max(1rem,env(safe-area-inset-left,0px))] pb-10 pt-6 pr-[max(1rem,env(safe-area-inset-right,0px))]">
      <div className="flex flex-col items-center px-2 pb-10 pt-4 sm:pt-8">
        <HeroTitle>{s.home.heroTitle}</HeroTitle>
        <p className="mb-8 max-w-lg text-center text-sm text-muted-foreground sm:text-base">
          {s.home.heroSubtitle}
        </p>

        <div className="relative w-full max-w-[584px]">
          <label htmlFor="home-recipe-search" className="sr-only">
            {s.home.searchLabel}
          </label>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground" />
          <input
            id="home-recipe-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={s.home.searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full rounded-full border border-[#dfe1e5] bg-[var(--card)] py-3 pl-12 pr-5 text-base text-foreground shadow-sm outline-none transition-[box-shadow,border-color] placeholder:text-muted-foreground hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus:border-transparent focus:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus:ring-2 focus:ring-[#4285F4]/35 dark:border-zinc-600 dark:hover:shadow-[0_1px_6px_rgba(0,0,0,0.45)] dark:focus:ring-[#8ab4f8]/40"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {s.home.noHits(query.trim())}
        </p>
      ) : carouselEligible.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {s.home.allFavoritesCarousel}
        </p>
      ) : (
        <div className="-mx-4 overflow-x-hidden px-4 sm:-mx-0 sm:px-0">
          <RecipeCarousel
            items={carouselStrip}
            voteCounts={voteCounts}
            filterKey={carouselFilterKey}
          />
        </div>
      )}

      {filtered.length > 0 ? (
        <>
          {recentlyCooked.length > 0 ? (
            <HomeDiscoverySection
              headingId="home-recently-cooked-heading"
              title={s.home.lastCooked}
              scrollAriaLabel={s.home.scrollRecentlyCooked}
            >
              {recentlyCooked.map((r) => {
                const st = cookStatsByRecipeId[r.id];
                const rel = st?.lastCookedAt
                  ? formatPastRelative(st.lastCookedAt, locale)
                  : "";
                const n = st?.cookCount ?? 0;
                const countPart =
                  n > 1 ? (
                    <>
                      {" "}
                      · {s.home.cookedNTimes(n)}
                    </>
                  ) : null;
                return (
                  <HomeCompactRecipeCard
                    key={r.id}
                    r={r}
                    meta={
                      <>
                        {rel || s.home.lastCookedFallback}
                        {countPart}
                      </>
                    }
                  />
                );
              })}
            </HomeDiscoverySection>
          ) : null}

          {mostCooked.length > 0 ? (
            <HomeDiscoverySection
              headingId="home-most-cooked-heading"
              title={s.home.mostCooked}
              scrollAriaLabel={s.home.scrollMostCooked}
            >
              {mostCooked.map((r) => {
                const n = cookStatsByRecipeId[r.id]?.cookCount ?? 0;
                return (
                  <HomeCompactRecipeCard
                    key={r.id}
                    r={r}
                    meta={
                      <>
                        {s.home.cookedNTimes(n)}
                        {cookStatsByRecipeId[r.id]?.lastCookedAt ? (
                          <>
                            {" "}
                            · {s.home.lastTimePrefix}{" "}
                            {formatPastRelative(
                              cookStatsByRecipeId[r.id]!.lastCookedAt!,
                              locale,
                            )}
                          </>
                        ) : null}
                      </>
                    }
                  />
                );
              })}
            </HomeDiscoverySection>
          ) : null}

          {untouchedRecipes.length > 0 ? (
            <HomeDiscoverySection
              headingId="home-untouched-heading"
              title={s.home.stillUndiscovered}
              scrollAriaLabel={s.home.scrollUntouched}
            >
              {untouchedRecipes.map((r) => (
                <HomeCompactRecipeCard
                  key={r.id}
                  r={r}
                  meta={s.home.notRated}
                />
              ))}
            </HomeDiscoverySection>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

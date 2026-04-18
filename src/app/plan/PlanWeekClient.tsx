"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type Ref,
} from "react";
import {
  addDays,
  addWeeks,
  formatDateDe,
  formatWeekRangeDe,
  parseISODateLocal,
  planWeekSectionHeading,
  toISODateLocal,
  WEEKDAY_LABELS_DE,
} from "@/lib/week";
import { recipeCategoryLabel } from "@/lib/recipe-category";
import type { PlanWeekClientMeal } from "./types";
import { addPlannedMealAction, removePlannedMealAction } from "./actions";

function categoryLine(category: string | null): string | null {
  const label = recipeCategoryLabel(category);
  if (label) return label;
  const raw = category?.trim();
  return raw || null;
}

function dayOfMonthFromIso(iso: string): number {
  return parseISODateLocal(iso).getDate();
}

type RecipePick = {
  id: string;
  title: string;
  imageUrl: string | null;
  category: string | null;
};

const DayRecipePicker = forwardRef(function DayRecipePicker(
  {
    dateIso,
    anchorRect,
    recipes,
    pending,
    onPick,
    onClose,
  }: {
    dateIso: string;
    anchorRect: DOMRectReadOnly;
    recipes: RecipePick[];
    pending: boolean;
    onPick: (date: string, recipeId: string) => void;
    onClose: () => void;
  },
  ref: Ref<HTMLDivElement>,
) {
  const width = Math.min(Math.max(anchorRect.width, 240), 340);
  const left = Math.max(
    8,
    Math.min(anchorRect.left, typeof window !== "undefined" ? window.innerWidth - width - 8 : anchorRect.left),
  );

  return (
    <div
      ref={ref}
      className="fixed z-[200] flex max-h-[min(24rem,70vh)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl ring-1 ring-ring-card"
      style={{ top: anchorRect.bottom + 8, left, width }}
      role="dialog"
      aria-label="Rezept für diesen Tag wählen"
    >
      <div className="shrink-0 border-b border-border px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">Rezept hinzufügen</p>
        <p className="text-sm font-semibold text-foreground">{formatDateDe(dateIso)}</p>
      </div>
      {recipes.length === 0 ? (
        <p className="p-3 text-sm text-muted-foreground">
          Noch keine Rezepte.{" "}
          <Link
            href="/recipes/new"
            className="text-emerald-700 underline dark:text-emerald-400"
            onClick={onClose}
          >
            Anlegen
          </Link>
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto p-1">
          {recipes.map((r) => {
            const cat = categoryLine(r.category);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={pending}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-card-muted disabled:opacity-50"
                  onClick={() => onPick(dateIso, r.id)}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-card-muted">
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        —
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {cat ?? "Keine Kategorie"}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="shrink-0 border-t border-border p-2">
        <button
          type="button"
          className="w-full rounded-lg py-1.5 text-xs text-muted-foreground transition hover:bg-card-muted"
          onClick={onClose}
        >
          Schließen
        </button>
      </div>
    </div>
  );
});

function PlannedMealCompact({
  meal,
  pending,
  onRemove,
}: {
  meal: PlanWeekClientMeal;
  pending: boolean;
  onRemove: (id: string) => void;
}) {
  const cat = categoryLine(meal.recipe.category);
  return (
    <div className="rounded-lg border border-border bg-card-muted/80 p-1.5 dark:bg-card-muted/50 sm:p-2">
      <div className="flex gap-2">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-card-muted sm:h-12 sm:w-12">
          {meal.recipe.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meal.recipe.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              sizes="(min-width: 640px) 48px, 44px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              —
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/recipes/${meal.recipeId}`}
            className="line-clamp-2 text-[11px] font-medium leading-snug text-emerald-800 hover:underline dark:text-emerald-400 sm:text-xs"
          >
            {meal.recipe.title}
          </Link>
          <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground sm:text-xs">
            {cat ?? "Keine Kategorie"}
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(meal.id);
          }}
          className="shrink-0 self-start text-[12px] leading-none text-red-600 hover:underline dark:text-red-400 sm:text-sm"
          title="Vom Tag entfernen"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function PlanWeekClient(props: {
  weekStart: string;
  meals: PlanWeekClientMeal[];
  recipes: RecipePick[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mealMenu, setMealMenu] = useState<{
    dateIso: string;
    rect: DOMRectReadOnly;
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const weekStartDate = parseISODateLocal(props.weekStart);

  const weekBlocks = useMemo(() => {
    return [0, 1, 2].map((offset) => {
      const monday = addWeeks(weekStartDate, offset);
      const mondayIso = toISODateLocal(monday);
      const days = Array.from({ length: 7 }, (_, i) => toISODateLocal(addDays(monday, i)));
      return { mondayIso, days, offset };
    });
  }, [weekStartDate]);

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void (async () => {
        await action();
        router.refresh();
      })();
    });
  }

  function pickRecipe(dateIso: string, recipeId: string) {
    startTransition(() => {
      void (async () => {
        await addPlannedMealAction(dateIso, recipeId);
        setMealMenu(null);
        router.refresh();
      })();
    });
  }

  useEffect(() => {
    if (mealMenu === null) return;
    const openDayIso = mealMenu.dateIso;
    function handlePointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (popoverRef.current?.contains(t)) return;
      const cell = (e.target as HTMLElement).closest("[data-plan-day]");
      if (cell?.getAttribute("data-plan-day") === openDayIso) return;
      setMealMenu(null);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mealMenu]);

  useEffect(() => {
    if (mealMenu === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMealMenu(null);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mealMenu]);

  useEffect(() => {
    if (mealMenu === null) return;
    function close() {
      setMealMenu(null);
    }
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [mealMenu]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-semibold text-foreground">Wochenplan</h1>

      <div className="min-w-0 flex-1 space-y-10">
        {weekBlocks.map((block, blockIdx) => (
          <section key={block.mondayIso} className={blockIdx > 0 ? "border-t border-border pt-10" : ""}>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {planWeekSectionHeading(block.offset, props.weekStart)}
              <span className="ml-2 font-normal text-muted-foreground">
                ({formatWeekRangeDe(block.mondayIso)})
              </span>
            </h2>
            <div className="-mx-4 touch-pan-x overflow-x-auto overscroll-x-contain px-4 pb-1 [-webkit-overflow-scrolling:touch]">
              <div className="grid min-w-[36rem] grid-cols-7 gap-1.5 sm:min-w-0 sm:gap-2">
                {block.days.map((dayIso, idx) => {
                  const dayMeals = props.meals.filter((m) => m.date === dayIso);
                  const dom = dayOfMonthFromIso(dayIso);
                  const menuOpen = mealMenu?.dateIso === dayIso;
                  return (
                    <div
                      key={dayIso}
                      data-plan-day={dayIso}
                      className="relative flex min-h-[160px] flex-col rounded-xl border border-border bg-card shadow-sm sm:min-h-[180px]"
                    >
                      <button
                        type="button"
                        disabled={pending}
                        onClick={(e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          setMealMenu((m) =>
                            m?.dateIso === dayIso ? null : { dateIso: dayIso, rect: r },
                          );
                        }}
                        className="flex w-full flex-col items-center rounded-t-xl px-1 py-2 text-center transition hover:bg-card-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-50 sm:px-2 sm:py-2.5"
                        aria-expanded={menuOpen}
                        aria-haspopup="dialog"
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 sm:text-xs">
                          {WEEKDAY_LABELS_DE[idx]}
                        </span>
                        <span className="text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
                          {dom}
                        </span>
                        <span className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block sm:text-xs">
                          {formatDateDe(dayIso)}
                        </span>
                      </button>

                      <div className="flex flex-1 flex-col gap-1.5 border-t border-border p-1.5 sm:p-2">
                        {dayMeals.length === 0 ? (
                          <p className="flex flex-1 items-center justify-center px-0.5 text-center text-[10px] text-muted-foreground sm:text-xs">
                            Tippen zum Hinzufügen
                          </p>
                        ) : (
                          dayMeals.map((meal) => (
                            <PlannedMealCompact
                              key={meal.id}
                              meal={meal}
                              pending={pending}
                              onRemove={(id) => run(() => removePlannedMealAction(id))}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      {mealMenu ? (
        <DayRecipePicker
          ref={popoverRef}
          anchorRect={mealMenu.rect}
          dateIso={mealMenu.dateIso}
          recipes={props.recipes}
          pending={pending}
          onPick={pickRecipe}
          onClose={() => setMealMenu(null)}
        />
      ) : null}
    </div>
  );
}

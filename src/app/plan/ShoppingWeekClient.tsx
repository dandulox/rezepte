"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import {
  addWeeks,
  formatDateDe,
  formatWeekRangeDe,
  parseISODateLocal,
  planWeekSectionHeading,
  toISODateLocal,
  weekMondayIsoForDate,
} from "@/lib/week";
import type { PlanEinkaufMeal, PlanWeekClientShopping } from "./types";
import {
  addShoppingIngredientAction,
  clearCheckedShoppingForm,
  deleteShoppingItemForm,
  removeShoppingIngredientAction,
  toggleShoppingItemCheckedAction,
} from "./actions";

export function ShoppingWeekClient(props: {
  weekAnchor: string;
  meals: PlanEinkaufMeal[];
  shopping: PlanWeekClientShopping[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const anchorDate = parseISODateLocal(props.weekAnchor);
  const prevWeek = toISODateLocal(addWeeks(anchorDate, -1));
  const nextWeek = toISODateLocal(addWeeks(anchorDate, 1));

  const shoppingByMealIngredient = useMemo(() => {
    const m = new Map<string, PlanWeekClientShopping>();
    for (const it of props.shopping) {
      m.set(`${it.plannedMealId}:${it.ingredientId}`, it);
    }
    return m;
  }, [props.shopping]);

  const weekBlocks = useMemo(() => {
    return [0, 1, 2].map((offset) => {
      const mondayIso = toISODateLocal(addWeeks(anchorDate, offset));
      const meals = props.meals.filter((m) => weekMondayIsoForDate(m.date) === mondayIso);
      const shopping = props.shopping.filter((s) => s.weekStart === mondayIso);
      const mealsSorted = [...meals].sort((a, b) => a.date.localeCompare(b.date));
      return { mondayIso, offset, mealsSorted, shopping };
    });
  }, [anchorDate, props.meals, props.shopping]);

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void (async () => {
        await action();
        router.refresh();
      })();
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Einkaufsliste</h1>
          <p className="mt-2 text-muted-foreground">
            Drei Wochen: pro Woche eine eigene Liste und die geplanten Gerichte. Zutaten mit „+ Liste“
            übernehmen, abhaken und erledigte Einträge entfernen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/plan/einkauf/druck?w=${props.weekAnchor}`}
            className="rounded-lg border border-emerald-600/40 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-950/70"
          >
            Druckansicht
          </Link>
          <Link
            href={`/plan/einkauf?w=${prevWeek}`}
            className="rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-body hover:bg-card-muted"
          >
            ← Vorherige Woche
          </Link>
          <Link
            href={`/plan/einkauf?w=${nextWeek}`}
            className="rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-body hover:bg-card-muted"
          >
            Nächste Woche →
          </Link>
        </div>
      </div>

      <p className="mb-8">
        <Link
          href={`/plan?w=${props.weekAnchor}`}
          className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← Zum Wochenplan
        </Link>
      </p>

      <div className="space-y-12">
        {weekBlocks.map((block, blockIdx) => (
          <section key={block.mondayIso} className={blockIdx > 0 ? "border-t border-border pt-12" : ""}>
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              {planWeekSectionHeading(block.offset, props.weekAnchor)}
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({formatWeekRangeDe(block.mondayIso)})
              </span>
            </h2>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-md ring-1 ring-ring-card">
              <h3 className="text-lg font-semibold text-foreground">Liste</h3>
              <p className="mt-1 text-xs text-muted-foreground">Haken = erledigt</p>

              {block.shopping.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  Noch keine Zutaten für diese Woche. Unten beim Wochenplan pro Zutat auf „+ Liste“
                  tippen.
                </p>
              ) : (
                <ul className="mt-4 max-h-[min(50vh,24rem)] space-y-2 overflow-y-auto pr-1 sm:max-h-[min(60vh,32rem)]">
                  {block.shopping.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-2 rounded-lg border border-border bg-card-muted/90 px-2 py-2 text-sm dark:bg-card-muted/60"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        disabled={pending}
                        onChange={(e) =>
                          run(() => toggleShoppingItemCheckedAction(item.id, e.target.checked))
                        }
                        className="mt-1 h-4 w-4 shrink-0 rounded border-border-strong"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={
                            item.checked
                              ? "text-muted-foreground/80 line-through"
                              : "text-foreground"
                          }
                        >
                          {item.text}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.plannedMeal.recipe.title} · {formatDateDe(item.plannedMeal.date)}
                        </p>
                      </div>
                      <form action={deleteShoppingItemForm} className="shrink-0">
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          disabled={pending}
                          className="text-xs text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                          title="Eintrag löschen"
                        >
                          ×
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}

              {block.shopping.some((s) => s.checked) ? (
                <form action={clearCheckedShoppingForm} className="mt-4">
                  <input type="hidden" name="weekStart" value={block.mondayIso} />
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full rounded-lg border border-border-strong py-2 text-sm font-medium text-label hover:bg-card-muted"
                  >
                    Erledigte Einträge entfernen
                  </button>
                </form>
              ) : null}
            </div>

            <section className="mt-8">
              <h3 className="text-lg font-semibold text-foreground">Aus dem Wochenplan</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Geplante Gerichte und Zutaten für diese Woche.
              </p>

              {block.mealsSorted.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Keine Gerichte geplant.{" "}
                  <Link
                    href={`/plan?w=${props.weekAnchor}`}
                    className="text-emerald-700 underline dark:text-emerald-400"
                  >
                    Wochenplan öffnen
                  </Link>
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {block.mealsSorted.map((meal) => (
                    <li
                      key={meal.id}
                      className="rounded-xl border border-border bg-card-muted/80 p-4 dark:bg-card-muted/50"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <Link
                            href={`/recipes/${meal.recipeId}`}
                            className="font-medium text-emerald-800 hover:underline dark:text-emerald-400"
                          >
                            {meal.recipe.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">{formatDateDe(meal.date)}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Zutaten
                      </p>
                      <ul className="mt-2 space-y-2">
                        {meal.recipe.ingredients.map((ing) => {
                          const key = `${meal.id}:${ing.id}`;
                          const onList = shoppingByMealIngredient.has(key);
                          return (
                            <li
                              key={ing.id}
                              className="flex items-center justify-between gap-2 text-sm text-body"
                            >
                              <span className="min-w-0 leading-snug">{ing.rawText}</span>
                              {onList ? (
                                <button
                                  type="button"
                                  disabled={pending}
                                  onClick={() =>
                                    run(() =>
                                      removeShoppingIngredientAction({
                                        plannedMealId: meal.id,
                                        ingredientId: ing.id,
                                      }),
                                    )
                                  }
                                  className="shrink-0 rounded-md border border-border-strong px-2 py-0.5 text-xs font-medium text-label hover:bg-card-muted"
                                >
                                  Von Liste
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={pending}
                                  onClick={() =>
                                    run(() =>
                                      addShoppingIngredientAction({
                                        plannedMealId: meal.id,
                                        ingredientId: ing.id,
                                        text: ing.rawText,
                                        mealDate: meal.date,
                                      }),
                                    )
                                  }
                                  className="shrink-0 rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-emerald-700"
                                >
                                  + Liste
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </section>
        ))}
      </div>
    </div>
  );
}

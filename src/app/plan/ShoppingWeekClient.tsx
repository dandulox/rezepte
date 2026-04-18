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
import { useUiLocale } from "@/components/UiLocaleProvider";
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
  const { locale, strings: s } = useUiLocale();
  const anchorDate = parseISODateLocal(props.weekAnchor);
  const prevWeek = toISODateLocal(addWeeks(anchorDate, -1));
  const nextWeek = toISODateLocal(addWeeks(anchorDate, 1));

  const pageTitle = locale === "en" ? "Shopping list" : "Einkaufsliste";
  const pageIntro =
    locale === "en"
      ? "Three weeks: one list per week and your planned dishes. Use “+ List” on ingredients in the week plan, check items off, and remove completed entries."
      : "Drei Wochen: pro Woche eine eigene Liste und die geplanten Gerichte. Zutaten mit „+ Liste“ übernehmen, abhaken und erledigte Einträge entfernen.";
  const printLabel = locale === "en" ? "Print view" : "Druckansicht";
  const prevWeekLabel = locale === "en" ? "← Previous week" : "← Vorherige Woche";
  const nextWeekLabel = locale === "en" ? "Next week →" : "Nächste Woche →";
  const listHeading = locale === "en" ? "List" : "Liste";
  const listHint = locale === "en" ? "Check = done" : "Haken = erledigt";
  const emptyListHint =
    locale === "en"
      ? "No ingredients for this week yet. In the week plan, tap “+ List” per ingredient."
      : "Noch keine Zutaten für diese Woche. Unten beim Wochenplan pro Zutat auf „+ Liste“ tippen.";
  const clearDoneLabel = locale === "en" ? "Remove completed entries" : "Erledigte Einträge entfernen";
  const fromPlanHeading = locale === "en" ? "From the week plan" : "Aus dem Wochenplan";
  const fromPlanHint =
    locale === "en" ? "Planned dishes and ingredients for this week." : "Geplante Gerichte und Zutaten für diese Woche.";
  const noMealsHint =
    locale === "en"
      ? "No dishes planned."
      : "Keine Gerichte geplant.";
  const openPlanLabel = locale === "en" ? "Open week plan" : "Wochenplan öffnen";
  const ingredientsLabel = locale === "en" ? "Ingredients" : "Zutaten";
  const onListLabel = locale === "en" ? "On list" : "Von Liste";
  const addListLabel = locale === "en" ? "+ List" : "+ Liste";

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
    <div className="app-area flex min-h-dvh flex-col">
      <header className="border-b border-border/90 bg-card/75 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-accent)] sm:text-3xl">
              {pageTitle}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{pageIntro}</p>
            <p className="mt-3">
              <Link
                href={`/plan?w=${props.weekAnchor}`}
                className="text-sm font-medium text-[var(--app-accent)] hover:underline"
              >
                ← {s.nav.weekPlan}
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/plan/einkauf/druck?w=${props.weekAnchor}`} className="app-btn-secondary">
              {printLabel}
            </Link>
            <Link href={`/plan/einkauf?w=${prevWeek}`} className="app-btn-ghost">
              {prevWeekLabel}
            </Link>
            <Link href={`/plan/einkauf?w=${nextWeek}`} className="app-btn-ghost">
              {nextWeekLabel}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="space-y-12">
        {weekBlocks.map((block, blockIdx) => (
          <section key={block.mondayIso} className={blockIdx > 0 ? "border-t border-border pt-12" : ""}>
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              {planWeekSectionHeading(block.offset, props.weekAnchor)}
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({formatWeekRangeDe(block.mondayIso)})
              </span>
            </h2>

            <div className="app-panel-main p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-foreground">{listHeading}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{listHint}</p>

              {block.shopping.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">{emptyListHint}</p>
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

              {block.shopping.some((row) => row.checked) ? (
                <form action={clearCheckedShoppingForm} className="mt-4">
                  <input type="hidden" name="weekStart" value={block.mondayIso} />
                  <button
                    type="submit"
                    disabled={pending}
                    className="app-btn-secondary w-full py-2.5"
                  >
                    {clearDoneLabel}
                  </button>
                </form>
              ) : null}
            </div>

            <section className="mt-8">
              <h3 className="text-lg font-semibold text-foreground">{fromPlanHeading}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{fromPlanHint}</p>

              {block.mealsSorted.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {noMealsHint}{" "}
                  <Link
                    href={`/plan?w=${props.weekAnchor}`}
                    className="font-medium text-[var(--app-accent)] underline hover:no-underline"
                  >
                    {openPlanLabel}
                  </Link>
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {block.mealsSorted.map((meal) => (
                    <li key={meal.id} className="app-inset">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <Link
                            href={`/recipes/${meal.recipeId}`}
                            className="font-medium text-[var(--app-accent)] hover:underline"
                          >
                            {meal.recipe.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">{formatDateDe(meal.date)}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {ingredientsLabel}
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
                                  className="app-btn-secondary shrink-0 px-2 py-0.5 text-xs"
                                >
                                  {onListLabel}
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
                                  className="app-btn-primary shrink-0 px-2 py-0.5 text-xs"
                                >
                                  {addListLabel}
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
    </div>
  );
}

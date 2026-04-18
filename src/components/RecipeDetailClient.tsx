"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  INGREDIENT_GROUP_LABEL,
  groupIngredientsForDisplay,
  type IngredientGroupId,
} from "@/lib/ingredient-category";
import { displayIngredientLine } from "@/lib/portion-scale";
import type { RecipeViewLang } from "@/lib/recipe-translate-locales";
import { recipeViewStepsCaption, recipeViewStrings } from "@/lib/recipe-view-i18n";
import { RecipeReactions } from "@/components/RecipeReactions";
import { RecipeInstructions } from "@/components/RecipeInstructions";
import { RecipeCookLogPanel } from "@/components/RecipeCookLogPanel";
import { RecipeDietImageBadge } from "@/components/RecipeDietBadge";
import { RecipeFavoriteButton } from "@/components/RecipeFavoriteButton";
import { RecipeTimes } from "@/components/RecipeTimes";
import { displayRecipeCategoryLabel } from "@/lib/recipe-category";
import { recipeDietKindDisplayLabel } from "@/lib/recipe-diet";
import type {
  RecipeCategoryDefPublic,
  RecipeDietKindDefPublic,
} from "@/lib/recipe-taxonomy";

export type RecipeTranslationPayload = {
  locale: string;
  title: string;
  description: string | null;
  nutritionText: string | null;
  instructions: string[];
  ingredients: { id: string; rawText: string }[];
};

function RecipeIngredientsPanel(props: {
  servingsBase: number;
  servings: number;
  setServings: (n: number) => void;
  adjust: (delta: number) => void;
  ingredientGroups: {
    groupId: IngredientGroupId;
    items: { id: string; rawText: string }[];
  }[];
  factor: number;
  nutritionLines: string[];
  labels: {
    ingredients: string;
    nutrition: string;
    tabListAria: string;
    servings: string;
    decreaseServings: string;
    increaseServings: string;
  };
}) {
  const [panel, setPanel] = useState<"ingredients" | "nutrition">("ingredients");
  const hasNutrition = props.nutritionLines.length > 0;
  const L = props.labels;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-md ring-1 ring-ring-card dark:shadow-xl sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">
            {hasNutrition && panel === "nutrition" ? L.nutrition : L.ingredients}
          </h2>
          {hasNutrition ? (
            <div
              className="flex shrink-0 rounded-lg border border-border bg-card-muted p-0.5"
              role="tablist"
              aria-label={L.tabListAria}
            >
              <button
                type="button"
                role="tab"
                aria-selected={panel === "ingredients"}
                className={
                  panel === "ingredients"
                    ? "rounded-md bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-sm sm:px-3 sm:text-sm"
                    : "rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground sm:px-3 sm:text-sm"
                }
                onClick={() => setPanel("ingredients")}
              >
                {L.ingredients}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={panel === "nutrition"}
                className={
                  panel === "nutrition"
                    ? "rounded-md bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-sm sm:px-3 sm:text-sm"
                    : "rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground sm:px-3 sm:text-sm"
                }
                onClick={() => setPanel("nutrition")}
              >
                {L.nutrition}
              </button>
            </div>
          ) : null}
        </div>
        {panel === "ingredients" ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{L.servings}</span>
            <button
              type="button"
              onClick={() => props.adjust(-0.5)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-strong text-lg font-medium text-body hover:bg-card-muted sm:h-9 sm:w-9"
              aria-label={L.decreaseServings}
            >
              −
            </button>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={props.servings}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (Number.isFinite(v) && v >= 0.5) props.setServings(v);
              }}
              className="input-field w-20 px-2 py-1 text-center text-sm"
            />
            <button
              type="button"
              onClick={() => props.adjust(0.5)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-strong text-lg font-medium text-body hover:bg-card-muted sm:h-9 sm:w-9"
              aria-label={L.increaseServings}
            >
              +
            </button>
          </div>
        ) : null}
      </div>
      {panel === "ingredients" ? (
        <div className="space-y-5 text-body">
          {props.ingredientGroups.map(({ groupId, items }) => (
            <div key={groupId}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {INGREDIENT_GROUP_LABEL[groupId]}
              </h3>
              <ul className="space-y-2.5">
                {items.map((ing) => (
                  <li key={ing.id} className="flex gap-2 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                    <span>{displayIngredientLine(ing.rawText, props.factor)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-2.5 text-body">
          {props.nutritionLines.map((line, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function RecipeDetailClient(props: {
  recipeId: string;
  title: string;
  category: string | null;
  dietKind: string | null;
  description: string | null;
  imageUrl: string | null;
  prepTime: string | null;
  cookTime: string | null;
  totalTime: string | null;
  sourceUrl: string | null;
  servingsBase: number;
  ingredients: { id: string; rawText: string }[];
  nutritionText: string | null;
  instructions: string[];
  recipeViewLang: RecipeViewLang;
  translations: RecipeTranslationPayload[];
  likeCount: number;
  dislikeCount: number;
  cookCount: number;
  cookRecent: { id: string; cookedAt: string }[];
  categoryDefs: readonly RecipeCategoryDefPublic[];
  dietKindDefs: readonly RecipeDietKindDefPublic[];
}) {
  const viewLang = props.recipeViewLang;

  const [servings, setServings] = useState(() => props.servingsBase);

  const ui = recipeViewStrings(viewLang);
  const activeTranslation =
    viewLang === "de"
      ? undefined
      : props.translations.find((t) => t.locale === viewLang);

  const displayTitle = activeTranslation?.title ?? props.title;
  const displayDescription = activeTranslation?.description ?? props.description;
  const displayNutritionText =
    activeTranslation?.nutritionText ?? props.nutritionText;

  const ingredientsForDisplay = useMemo(() => {
    if (!activeTranslation) return props.ingredients;
    const map = new Map(
      activeTranslation.ingredients.map((i) => [i.id, i.rawText]),
    );
    return props.ingredients.map((ing) => ({
      ...ing,
      rawText: map.get(ing.id) ?? ing.rawText,
    }));
  }, [props.ingredients, activeTranslation]);

  const displayInstructions = useMemo(() => {
    if (!activeTranslation) return props.instructions;
    if (activeTranslation.instructions.length !== props.instructions.length) {
      return props.instructions.map(
        (orig, i) => activeTranslation.instructions[i] ?? orig,
      );
    }
    return activeTranslation.instructions;
  }, [props.instructions, activeTranslation]);

  const factor = useMemo(() => {
    if (!props.servingsBase || props.servingsBase <= 0) return 1;
    return servings / props.servingsBase;
  }, [servings, props.servingsBase]);

  function adjust(delta: number) {
    setServings((s) => Math.max(0.5, Math.round((s + delta) * 2) / 2));
  }

  const ingredientGroups = useMemo(
    () => groupIngredientsForDisplay(ingredientsForDisplay),
    [ingredientsForDisplay],
  );

  const nutritionLines = useMemo(
    () =>
      (displayNutritionText ?? "")
        .split(/\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [displayNutritionText],
  );

  const panelLabels = {
    ingredients: ui.ingredients,
    nutrition: ui.nutrition,
    tabListAria: ui.tabListAria,
    servings: ui.servings,
    decreaseServings: ui.decreaseServings,
    increaseServings: ui.increaseServings,
  };

  const panelProps = {
    servingsBase: props.servingsBase,
    servings,
    setServings,
    adjust,
    ingredientGroups,
    factor,
    nutritionLines,
    labels: panelLabels,
  };

  const labelLocale = viewLang === "de" ? "de" : "en";
  const categoryText = displayRecipeCategoryLabel(
    props.category,
    labelLocale,
    props.categoryDefs,
  );
  const dietText = recipeDietKindDisplayLabel(
    props.dietKind,
    labelLocale,
    props.dietKindDefs,
  );

  const articleLang = viewLang === "de" ? "de" : viewLang;

  return (
    <article
      lang={articleLang}
      className="mx-auto max-w-6xl py-6 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] sm:py-8"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {displayTitle}
          </h1>
          {categoryText || dietText ? (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {categoryText ? <span>{categoryText}</span> : null}
              {categoryText && dietText ? (
                <span className="font-normal text-muted-foreground" aria-hidden>
                  ·
                </span>
              ) : null}
              {dietText ? <span>{dietText}</span> : null}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <RecipeFavoriteButton recipeId={props.recipeId} />
          <Link
            href={`/recipes/${props.recipeId}/edit`}
            className="rounded-lg border border-border-strong px-3 py-1.5 text-sm font-medium text-body transition hover:bg-card-muted"
          >
            {ui.edit}
          </Link>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,20rem)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-12">
        <div className="min-w-0 space-y-8">
          {props.imageUrl ? (
            <div className="flex flex-col gap-3">
              <div className="relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={props.imageUrl}
                  alt=""
                  className="max-h-[min(420px,58dvh)] w-full object-cover sm:max-h-[420px]"
                />
                <RecipeDietImageBadge dietKind={props.dietKind} dietKindDefs={props.dietKindDefs} />
              </div>
              <RecipeReactions
                recipeId={props.recipeId}
                likeCount={props.likeCount}
                dislikeCount={props.dislikeCount}
              />
            </div>
          ) : (
            <RecipeReactions
              recipeId={props.recipeId}
              likeCount={props.likeCount}
              dislikeCount={props.dislikeCount}
            />
          )}

          <RecipeTimes
            prepTime={props.prepTime}
            cookTime={props.cookTime}
            totalTime={props.totalTime}
            labels={{
              prep: ui.prepTime,
              cook: ui.cookTime,
              total: ui.totalTime,
            }}
          />

          {displayDescription ? (
            <p className="text-lg leading-relaxed text-label">
              {displayDescription}
            </p>
          ) : null}

          <div className="space-y-6 lg:hidden">
            <RecipeIngredientsPanel {...panelProps} />
            <RecipeCookLogPanel
              recipeId={props.recipeId}
              cookCount={props.cookCount}
              recent={props.cookRecent}
            />
          </div>

          <RecipeInstructions
            steps={displayInstructions}
            heading={ui.preparation}
            stepsCaption={recipeViewStepsCaption(
              viewLang,
              displayInstructions.length,
            )}
          />
        </div>

        <aside className="relative mt-8 hidden min-w-0 lg:mt-0 lg:block">
          <div className="sticky top-20 space-y-6">
            <RecipeIngredientsPanel {...panelProps} />
            <RecipeCookLogPanel
              recipeId={props.recipeId}
              cookCount={props.cookCount}
              recent={props.cookRecent}
            />
          </div>
        </aside>
      </div>

      {props.sourceUrl ? (
        <div className="mt-12 border-t border-border pt-8">
          <a
            href={props.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
          >
            {ui.sourceLink}
          </a>
        </div>
      ) : null}
    </article>
  );
}

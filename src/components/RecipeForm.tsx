"use client";

import { useActionState, useMemo, useState } from "react";
import type { RecipeFormState } from "@/app/recipes/actions";
import {
  createRecipeAction,
  updateRecipeAction,
} from "@/app/recipes/actions";
import type {
  RecipeCategoryDefPublic,
  RecipeDietKindDefPublic,
} from "@/lib/recipe-taxonomy";
import { sortRecipeCategoryDefs, sortRecipeDietKindDefs } from "@/lib/recipe-taxonomy-sort";

export type RecipeFormInitial = {
  title: string;
  description: string;
  imageUrl: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  sourceUrl: string;
  servingsBase: number;
  category: string | null;
  dietKind: string | null;
  ingredients: string[];
  /** Eine Zeile pro Nährwert; optional */
  nutritionText: string;
  instructions: string[];
};

const empty: RecipeFormInitial = {
  title: "",
  description: "",
  imageUrl: "",
  prepTime: "",
  cookTime: "",
  totalTime: "",
  sourceUrl: "",
  servingsBase: 4,
  category: null,
  dietKind: null,
  ingredients: [],
  nutritionText: "",
  instructions: [],
};

export function RecipeForm(props: {
  mode: "create" | "edit";
  recipeId?: string;
  initial?: Partial<RecipeFormInitial>;
  categoryDefs: readonly RecipeCategoryDefPublic[];
  dietKindDefs: readonly RecipeDietKindDefPublic[];
}) {
  const init = { ...empty, ...props.initial };
  const categoryOptions = useMemo(
    () => sortRecipeCategoryDefs(props.categoryDefs),
    [props.categoryDefs],
  );
  const dietKindOptions = useMemo(
    () => sortRecipeDietKindDefs(props.dietKindDefs),
    [props.dietKindDefs],
  );
  const ingredientsText = (init.ingredients.length ? init.ingredients : [""]).join("\n");
  const instructionsText = (init.instructions.length ? init.instructions : [""]).join("\n");
  const [ingredientPanel, setIngredientPanel] = useState<"ingredients" | "nutrition">(
    "ingredients",
  );

  const action =
    props.mode === "edit" && props.recipeId
      ? updateRecipeAction.bind(null, props.recipeId)
      : createRecipeAction;

  const [state, formAction, pending] = useActionState<RecipeFormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      {state.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-2">
        <label className="text-sm font-medium text-label" htmlFor="title">
          Titel
        </label>
        <input id="title" name="title" required defaultValue={init.title} className="input-field" />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-label" htmlFor="description">
          Beschreibung
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={init.description}
          className="input-field"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-label" htmlFor="imageUrl">
            Bild-URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            defaultValue={init.imageUrl}
            placeholder="https://…"
            className="input-field"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-label" htmlFor="sourceUrl">
            Quell-URL
          </label>
          <input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            defaultValue={init.sourceUrl}
            placeholder="https://…"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-label" htmlFor="prepTime">
            Vorbereitung
          </label>
          <input
            id="prepTime"
            name="prepTime"
            defaultValue={init.prepTime}
            placeholder="z. B. PT20M oder 20 Min."
            className="input-field"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-label" htmlFor="cookTime">
            Arbeitszeit
          </label>
          <input
            id="cookTime"
            name="cookTime"
            defaultValue={init.cookTime}
            placeholder="z. B. PT30M"
            className="input-field"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-label" htmlFor="totalTime">
            Gesamtzeit
          </label>
          <input
            id="totalTime"
            name="totalTime"
            defaultValue={init.totalTime}
            placeholder="z. B. PT45M"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <label className="text-sm font-medium text-label" htmlFor="servingsBase">
          Portionen (Basis)
        </label>
        <input
          id="servingsBase"
          name="servingsBase"
          type="number"
          min={0.5}
          step={0.5}
          defaultValue={init.servingsBase}
          className="input-field"
        />
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <label className="text-sm font-medium text-label" htmlFor="category">
          Kategorie
        </label>
        <select
          id="category"
          name="category"
          defaultValue={init.category ?? ""}
          className="input-field"
        >
          <option value="">— keine —</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.labelDe}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <label className="text-sm font-medium text-label" htmlFor="dietKind">
          Ernährung
        </label>
        <select
          id="dietKind"
          name="dietKind"
          defaultValue={init.dietKind ?? ""}
          className="input-field"
        >
          <option value="">— keine —</option>
          {dietKindOptions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.labelDe}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <label className="text-sm font-medium text-label" htmlFor="ingredientsText">
            Zutaten & Nährwerte
          </label>
          <div
            className="flex rounded-lg border border-border bg-card-muted p-0.5"
            role="tablist"
            aria-label="Bereich wählen"
          >
            <button
              type="button"
              role="tab"
              aria-selected={ingredientPanel === "ingredients"}
              id="tab-ingredients"
              className={
                ingredientPanel === "ingredients"
                  ? "rounded-md bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm"
                  : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              }
              onClick={() => setIngredientPanel("ingredients")}
            >
              Zutaten
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={ingredientPanel === "nutrition"}
              id="tab-nutrition"
              className={
                ingredientPanel === "nutrition"
                  ? "rounded-md bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm"
                  : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              }
              onClick={() => setIngredientPanel("nutrition")}
            >
              Nährwerte
            </button>
          </div>
        </div>
        <p
          className={
            ingredientPanel === "ingredients"
              ? "text-xs text-muted-foreground"
              : "text-xs text-muted-foreground hidden"
          }
          id="ingredients-hint"
        >
          Eine Zutat pro Zeile. Unklare Zeilen werden beim Skalieren nicht verändert.
        </p>
        <p
          className={
            ingredientPanel === "nutrition"
              ? "text-xs text-muted-foreground"
              : "text-xs text-muted-foreground hidden"
          }
          id="nutrition-hint"
        >
          Freitext aus dem Import; wird in der Rezeptansicht separat angezeigt.
        </p>
        <div className={ingredientPanel === "ingredients" ? "grid gap-2" : "hidden"}>
          <textarea
            id="ingredientsText"
            name="ingredientsText"
            rows={10}
            defaultValue={ingredientsText}
            placeholder={"200 g Mehl\n1 TL Salz"}
            className="input-field font-mono text-sm"
            aria-labelledby="tab-ingredients ingredients-hint"
          />
        </div>
        <div className={ingredientPanel === "nutrition" ? "grid gap-2" : "hidden"}>
          <textarea
            id="nutritionText"
            name="nutritionText"
            rows={10}
            defaultValue={init.nutritionText}
            placeholder={"Energie: 2000 kJ / 480 kcal\nFett: 12 g"}
            className="input-field font-mono text-sm"
            aria-labelledby="tab-nutrition nutrition-hint"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-label" htmlFor="instructionsText">
          Zubereitung
        </label>
        <p className="text-xs text-muted-foreground">Eine Zeile pro Arbeitsschritt.</p>
        <textarea
          id="instructionsText"
          name="instructionsText"
          rows={12}
          defaultValue={instructionsText}
          placeholder={"Ofen vorheizen.\nTeig kneten."}
          className="input-field"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Speichern…" : "Speichern"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { RecipeForm, type RecipeFormInitial } from "@/components/RecipeForm";
import { useUiLocale } from "@/components/UiLocaleProvider";
import type { ParsedRecipeDraft } from "@/lib/recipe-import";
import type {
  RecipeCategoryDefPublic,
  RecipeDietKindDefPublic,
} from "@/lib/recipe-taxonomy";

function draftToFormInitial(d: ParsedRecipeDraft): RecipeFormInitial {
  return {
    title: d.title,
    description: d.description ?? "",
    imageUrl: d.imageUrl ?? "",
    prepTime: d.prepTime ?? "",
    cookTime: d.cookTime ?? "",
    totalTime: d.totalTime ?? "",
    sourceUrl: d.sourceUrl,
    servingsBase: d.servingsBase,
    category: d.category,
    dietKind: d.dietKind,
    ingredients: d.ingredients.length ? d.ingredients : [""],
    nutritionText: d.nutritionLines.length ? d.nutritionLines.join("\n") : "",
    instructions: d.instructions.length ? d.instructions : [""],
  };
}

export function ImportClient({
  categoryDefs,
  dietKindDefs,
}: {
  categoryDefs: readonly RecipeCategoryDefPublic[];
  dietKindDefs: readonly RecipeDietKindDefPublic[];
}) {
  const { strings: s } = useUiLocale();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ParsedRecipeDraft | null>(null);

  async function onPreview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDraft(null);
    setLoading(true);
    try {
      const res = await fetch("/api/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { error?: string; title?: string };
      if (!res.ok) {
        setError(data.error ?? s.import.errorStatus(res.status));
        return;
      }
      setDraft(data as ParsedRecipeDraft);
    } catch {
      setError(s.import.errorNetwork);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {s.import.title}
      </h1>
      <p className="mt-2 text-muted-foreground">{s.import.intro}</p>

      <form onSubmit={onPreview} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={s.import.placeholder}
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? s.import.loading : s.import.preview}
        </button>
      </form>

      {error ? (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {draft ? (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">
            {s.import.previewSectionTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {s.import.previewSectionHint}
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
            {draft.imageUrl ? (
              <div className="aspect-[16/9] w-full overflow-hidden bg-card-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null}
            <RecipeForm
              key={draft.sourceUrl + draft.title}
              mode="create"
              initial={draftToFormInitial(draft)}
              categoryDefs={categoryDefs}
              dietKindDefs={dietKindDefs}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

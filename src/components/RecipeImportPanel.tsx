"use client";

import { useState } from "react";
import type { ParsedRecipeDraft } from "@/lib/recipe-import";
import { RecipeForm, type RecipeFormInitial } from "@/components/RecipeForm";
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

/** URL-Import für die Seite „Neues Rezept“ (Tab „Aus URL importieren“). */
export function RecipeImportPanel({
  categoryDefs,
  dietKindDefs,
}: {
  categoryDefs: readonly RecipeCategoryDefPublic[];
  dietKindDefs: readonly RecipeDietKindDefPublic[];
}) {
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
        setError(data.error ?? `Fehler ${res.status}`);
        return;
      }
      setDraft(data as ParsedRecipeDraft);
    } catch {
      setError("Netzwerkfehler beim Import.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-2">
      <p className="text-sm text-muted-foreground">
        Viele Seiten liefern strukturierte Daten (JSON-LD), u. a. Chefkoch und{" "}
        <span className="whitespace-nowrap">REWE.de/rezepte</span>. URL einfügen, Vorschau prüfen, speichern.
      </p>

      <form onSubmit={onPreview} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.chefkoch.de/… oder https://www.rewe.de/rezepte/…"
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Laden…" : "Vorschau"}
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
          <h2 className="text-xl font-semibold text-foreground">Vorschau und Speichern</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Daten vor dem Speichern anpassen. Bilder verlinken oft auf die Quelle (Hotlink).
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

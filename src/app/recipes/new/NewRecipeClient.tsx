"use client";

import { useRouter } from "next/navigation";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipeImportPanel } from "@/components/RecipeImportPanel";
import type {
  RecipeCategoryDefPublic,
  RecipeDietKindDefPublic,
} from "@/lib/recipe-taxonomy";

type Tab = "manual" | "import";

export function NewRecipeClient({
  initialTab,
  categoryDefs,
  dietKindDefs,
}: {
  initialTab: Tab;
  categoryDefs: readonly RecipeCategoryDefPublic[];
  dietKindDefs: readonly RecipeDietKindDefPublic[];
}) {
  const router = useRouter();
  const tab = initialTab;

  function selectTab(next: Tab) {
    const path = next === "import" ? "/recipes/new?mode=import" : "/recipes/new";
    router.replace(path, { scroll: false });
  }

  const pill =
    "rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

  return (
    <div>
      <div className="border-b border-border bg-card px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold text-foreground">Neues Rezept</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manuell anlegen oder von einer Rezept-URL importieren.
          </p>
          <div
            className="mt-4 inline-flex rounded-lg border border-border bg-card-muted p-1"
            role="tablist"
            aria-label="Art des Rezepts"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "manual"}
              className={`${pill} ${tab === "manual" ? "bg-card text-foreground shadow-sm" : "text-label hover:text-foreground"}`}
              onClick={() => selectTab("manual")}
            >
              Manuell
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "import"}
              className={`${pill} ${tab === "import" ? "bg-card text-foreground shadow-sm" : "text-label hover:text-foreground"}`}
              onClick={() => selectTab("import")}
            >
              Aus URL importieren
            </button>
          </div>
        </div>
      </div>
      {tab === "manual" ? (
        <RecipeForm mode="create" categoryDefs={categoryDefs} dietKindDefs={dietKindDefs} />
      ) : (
        <RecipeImportPanel categoryDefs={categoryDefs} dietKindDefs={dietKindDefs} />
      )}
    </div>
  );
}

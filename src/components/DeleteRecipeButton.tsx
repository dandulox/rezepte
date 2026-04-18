"use client";

import { useTransition } from "react";
import { deleteRecipeAction } from "@/app/recipes/actions";

export function DeleteRecipeButton({ recipeId }: { recipeId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (typeof window !== "undefined" && window.confirm("Rezept wirklich löschen?")) {
          startTransition(() => {
            void deleteRecipeAction(recipeId);
          });
        }
      }}
      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/50"
    >
      {pending ? "Löschen…" : "Rezept löschen"}
    </button>
  );
}

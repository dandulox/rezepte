"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { addRecipeDislike, addRecipeLike } from "@/app/recipes/vote-actions";

export function RecipeReactions(props: {
  recipeId: string;
  likeCount: number;
  dislikeCount: number;
  /** Neben dem Bild: Buttons untereinander, volle Breite der Spalte */
  layout?: "inline" | "stacked";
}) {
  const layout = props.layout ?? "inline";
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void (async () => {
        await action();
        router.refresh();
      })();
    });
  }

  const stackedBtn =
    "inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm";
  const btnBase =
    layout === "stacked"
      ? stackedBtn
      : "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm";
  const neutral = `${btnBase} min-h-11 border border-border-strong bg-card text-body transition hover:bg-card-muted`;

  return (
    <div
      className={
        layout === "stacked"
          ? "flex w-full flex-col gap-2"
          : "flex flex-wrap items-center gap-2"
      }
    >
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => addRecipeLike(props.recipeId))}
        aria-label={`Like hinzufügen, aktuell ${props.likeCount} Likes`}
        className={neutral}
      >
        <span aria-hidden>👍</span>
        <span>{props.likeCount}</span>
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => addRecipeDislike(props.recipeId))}
        aria-label={`Dislike hinzufügen, aktuell ${props.dislikeCount} Dislikes`}
        className={neutral}
      >
        <span aria-hidden>👎</span>
        <span>{props.dislikeCount}</span>
      </button>
    </div>
  );
}

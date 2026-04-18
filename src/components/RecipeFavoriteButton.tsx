"use client";

import { useRecipeFavorites } from "@/components/RecipeFavoritesProvider";

type Props = {
  recipeId: string;
  className?: string;
  /** Karten: Stern oben rechts auf dem Bild */
  layout?: "inline" | "overlay";
};

function StarOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function StarFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function RecipeFavoriteButton({ recipeId, className = "", layout = "inline" }: Props) {
  const { ready, isFavorite, toggleFavorite } = useRecipeFavorites();
  const fav = isFavorite(recipeId);
  const overlay = layout === "overlay";

  if (!ready) {
    return (
      <span
        className={
          overlay
            ? `absolute right-2 top-2 z-20 h-10 w-10 rounded-full border border-border bg-card/80 ${className}`
            : `inline-flex h-9 min-w-[7.5rem] items-center justify-center gap-1.5 rounded-lg border border-border bg-card/80 px-3 ${className}`
        }
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(recipeId);
      }}
      aria-pressed={fav}
      aria-label={fav ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      title={fav ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      className={
        overlay
          ? `absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/95 text-amber-500 shadow-md backdrop-blur-sm transition hover:bg-card hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 ${className}`
          : `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border-strong bg-card px-3 text-sm font-medium text-body transition hover:bg-card-muted ${fav ? "text-amber-600 dark:text-amber-400" : ""} ${className}`
      }
    >
      {fav ? <StarFilledIcon className="shrink-0" /> : <StarOutlineIcon className="shrink-0" />}
      {layout === "inline" ? <span>{fav ? "Favorit" : "Merken"}</span> : null}
    </button>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  RECIPE_FAVORITES_STORAGE_KEY,
  readFavoriteIdsFromStorage,
  writeFavoriteIdsToStorage,
} from "@/lib/recipe-favorites";

type RecipeFavoritesContextValue = {
  ready: boolean;
  favoriteIds: string[];
  favoriteIdSet: ReadonlySet<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
};

const RecipeFavoritesContext = createContext<RecipeFavoritesContextValue | null>(null);

export function RecipeFavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setFavoriteIds(readFavoriteIdsFromStorage());
      setReady(true);
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === RECIPE_FAVORITES_STORAGE_KEY || e.key === null) {
        setFavoriteIds(readFavoriteIdsFromStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      const next = Array.from(nextSet);
      writeFavoriteIdsToStorage(next);
      return next;
    });
  }, []);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const isFavorite = useCallback(
    (id: string) => favoriteIdSet.has(id),
    [favoriteIdSet],
  );

  const value = useMemo<RecipeFavoritesContextValue>(
    () => ({
      ready,
      favoriteIds,
      favoriteIdSet,
      toggleFavorite,
      isFavorite,
    }),
    [ready, favoriteIds, favoriteIdSet, toggleFavorite, isFavorite],
  );

  return (
    <RecipeFavoritesContext.Provider value={value}>{children}</RecipeFavoritesContext.Provider>
  );
}

export function useRecipeFavorites() {
  const ctx = useContext(RecipeFavoritesContext);
  if (!ctx) {
    throw new Error("useRecipeFavorites muss innerhalb von RecipeFavoritesProvider verwendet werden.");
  }
  return ctx;
}

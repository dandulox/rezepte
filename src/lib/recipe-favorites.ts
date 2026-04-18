export const RECIPE_FAVORITES_STORAGE_KEY = "rezepte-favorites";

export function readFavoriteIdsFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECIPE_FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function writeFavoriteIdsToStorage(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECIPE_FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // z. B. Speicher voll — Favoriten bleiben nur im React-State
  }
}

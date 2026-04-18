import type { RecipeVoteCounts } from "@/lib/recipe-votes";

/** Aggregat aus RecipeCookLog (letztes Mal gekocht, Anzahl Einträge). */
export type RecipeCookStats = {
  lastCookedAt: string | null;
  cookCount: number;
};

const MS_PER_DAY = 86_400_000;

/**
 * Gewicht fürs Karussell: selten / nie gekochte Rezepte erscheinen öfter (mehr Karten pro Umlauf).
 * 1 = Standard, bis 4 = noch nie gekocht.
 */
export function carouselWeightFromCookStats(stats: RecipeCookStats | undefined, nowMs: number): number {
  if (!stats || stats.cookCount === 0) return 4;
  const last = stats.lastCookedAt ? Date.parse(stats.lastCookedAt) : NaN;
  if (!Number.isFinite(last)) return 3;
  const days = (nowMs - last) / MS_PER_DAY;
  if (days >= 60) return 3;
  if (days >= 14) return 2;
  return 1;
}

/**
 * Baut eine Folge mit Wiederholungen: Round-Robin über Rezepte gemäß Restgewicht,
 * damit nicht alle Duplikate direkt hintereinander stehen.
 */
export function expandRecipesForCarouselWeighted<T extends { id: string }>(
  recipes: T[],
  weightById: Map<string, number>,
): T[] {
  type Row = { item: T; remaining: number };
  const rows: Row[] = recipes
    .map((item) => ({
      item,
      remaining: Math.max(1, weightById.get(item.id) ?? 1),
    }))
    .filter((row) => row.remaining > 0);

  const out: T[] = [];
  let guard = 0;
  const maxGuard = Math.max(1, recipes.length) * 32;
  while (rows.some((r) => r.remaining > 0) && guard < maxGuard) {
    guard++;
    for (const row of rows) {
      if (row.remaining > 0) {
        out.push(row.item);
        row.remaining--;
      }
    }
  }
  return out;
}

/** Sortierung Kategorie-Raster: viele Likes vorne, viele Dislikes hinten. */
export function compareRecipesForCategoryView(
  a: { id: string; title: string },
  b: { id: string; title: string },
  voteCounts: Record<string, RecipeVoteCounts>,
): number {
  const va = voteCounts[a.id] ?? { likeCount: 0, dislikeCount: 0 };
  const vb = voteCounts[b.id] ?? { likeCount: 0, dislikeCount: 0 };
  const netA = va.likeCount - va.dislikeCount;
  const netB = vb.likeCount - vb.dislikeCount;
  if (netB !== netA) return netB - netA;
  if (vb.likeCount !== va.likeCount) return vb.likeCount - va.likeCount;
  if (va.dislikeCount !== vb.dislikeCount) return va.dislikeCount - vb.dislikeCount;
  return a.title.localeCompare(b.title, "de");
}

export function sortRecipesForCategoryView<T extends { id: string; title: string }>(
  recipes: T[],
  voteCounts: Record<string, RecipeVoteCounts>,
): T[] {
  return [...recipes].sort((x, y) => compareRecipesForCategoryView(x, y, voteCounts));
}
